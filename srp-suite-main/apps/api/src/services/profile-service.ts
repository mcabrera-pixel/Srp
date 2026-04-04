import { callClaude } from './llm.js';
import {
  LocalEnv,
  WorkerProfile,
  FeedbackEntry,
  CommunicationStyle,
  FeedbackType,
} from '../types.js';
import {
  getWorkerProfile,
  upsertWorkerProfile,
  getFeedbackForPhone,
  saveFeedback,
} from '../db/queries.js';

// ---------------------------------------------------------------------------
// Profile extraction from first message
// ---------------------------------------------------------------------------

/**
 * Attempts to extract a worker profile from a free-text message.
 * Uses the LLM to parse first_name, last_name, area, and role.
 */
export async function extractProfileFromMessage(
  message: string,
  pushName: string,
  env: LocalEnv
): Promise<Partial<Omit<WorkerProfile, 'phone' | 'created_at' | 'updated_at' | 'last_seen' | 'procedures_generated'>>> {
  const prompt = `Eres un asistente que extrae datos de mineros en Chile.
A partir del siguiente mensaje, extrae SOLO los campos que puedas identificar con certeza:
- first_name: primer nombre de la persona
- last_name: apellido
- area: área de trabajo en minería (ej: Chancado, Molienda, Flotación, Lixiviación, Mantenimiento, Seguridad, etc.)
- role: cargo o función (ej: Operador, Supervisor, Técnico, Ingeniero, Capataz, etc.)

Si el nombre del contacto de WhatsApp puede ayudar, úsalo. Nombre del contacto: "${pushName}"

Mensaje del usuario: "${message}"

Responde ÚNICAMENTE con un JSON plano sin texto adicional. Omite campos que no puedas identificar.
Ejemplo: {"first_name":"Juan","area":"Chancado"}
Si no puedes extraer nada, responde: {}`;

  try {
    const raw = await callClaude(
      prompt,
      env,
      'Eres un asistente que extrae datos de trabajadores mineros. Responde SIEMPRE en español con JSON válido.'
    );
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return {};
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, string>;
    const result: Partial<WorkerProfile> = {};
    if (typeof parsed.first_name === 'string' && parsed.first_name.trim()) result.first_name = parsed.first_name.trim();
    if (typeof parsed.last_name === 'string' && parsed.last_name.trim()) result.last_name = parsed.last_name.trim();
    if (typeof parsed.area === 'string' && parsed.area.trim()) result.area = parsed.area.trim();
    if (typeof parsed.role === 'string' && parsed.role.trim()) result.role = parsed.role.trim();
    return result;
  } catch {
    // best-effort: if extraction fails keep what we have
    return {};
  }
}

// ---------------------------------------------------------------------------
// Auto-fill profile from push name when LLM extraction fails
// ---------------------------------------------------------------------------

/**
 * Attempt to infer at least a first name from the WhatsApp pushName.
 */
export function inferProfileFromPushName(pushName: string): Partial<Pick<WorkerProfile, 'first_name' | 'last_name'>> {
  const parts = pushName.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return {};
  const result: Partial<Pick<WorkerProfile, 'first_name' | 'last_name'>> = { first_name: parts[0] };
  if (parts.length >= 2) result.last_name = parts.slice(1).join(' ');
  return result;
}

// ---------------------------------------------------------------------------
// Communication style detection
// ---------------------------------------------------------------------------

const INFORMAL_MARKERS = /\b(wn|weon|compa|jefe|po|poh|cachai|siuuu|ok|okok|dale|ey|oi|hola|gracias|porfa|x favor)\b/i;
const TECHNICAL_MARKERS = /\b(procedimiento|protocolo|norma|estándar|iso|ohsas|sart|dsm|reglamento|ley\s?\d+|decreto|especificacion|parámetro)\b/i;

export function detectCommunicationStyle(messages: string[]): CommunicationStyle {
  const combined = messages.join(' ');
  const informalScore = (combined.match(INFORMAL_MARKERS) ?? []).length;
  const technicalScore = (combined.match(TECHNICAL_MARKERS) ?? []).length;
  if (technicalScore >= 2) return 'technical';
  if (informalScore >= 2) return 'informal';
  return 'formal';
}

// ---------------------------------------------------------------------------
// Worker context string for LLM prompts
// ---------------------------------------------------------------------------

/**
 * Builds a short context string injected into procedure generation prompts.
 * E.g.: "Trabajador: Juan Pérez | Área: Chancado | Estilo: informal"
 */
export function buildWorkerContext(profile: WorkerProfile, feedback: FeedbackEntry[]): string {
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Desconocido';
  const lines: string[] = [`Trabajador: ${name}`];

  if (profile.area) lines.push(`Área: ${profile.area}`);
  if (profile.role) lines.push(`Cargo: ${profile.role}`);
  if (profile.communication_style) lines.push(`Estilo comunicación: ${profile.communication_style}`);
  if (profile.procedures_generated > 0) lines.push(`Procedimientos previos: ${profile.procedures_generated}`);

  // Include preferences stored from feedback
  if (profile.preferences) {
    try {
      const prefs: string[] = JSON.parse(profile.preferences);
      if (prefs.length > 0) lines.push(`Preferencias conocidas: ${prefs.slice(0, 5).join(', ')}`);
    } catch { /* ignore */ }
  }

  // Include last corrections/preferences from feedback history
  const corrections = feedback
    .filter(f => f.type === 'correction' || f.type === 'preference')
    .slice(0, 3);
  if (corrections.length > 0) {
    lines.push(`Feedback anterior: ${corrections.map(f => f.content).join('; ')}`);
  }

  return lines.join(' | ');
}

// ---------------------------------------------------------------------------
// Parse rating message (e.g. "4", "5 estrellas muy útil", "3/5")
// ---------------------------------------------------------------------------

export function parseRatingMessage(text: string): { rating: number; comment: string } | null {
  const match = text.match(/([1-5])/);
  if (!match) return null;
  const rating = parseInt(match[1], 10);
  const comment = text.replace(/[1-5]/, '').replace(/\/\s*5/, '').replace(/estrellas?/i, '').trim();
  return { rating, comment };
}

// ---------------------------------------------------------------------------
// High-level: ensure profile exists, extracting from first message if needed
// ---------------------------------------------------------------------------

export async function ensureWorkerProfile(
  phone: string,
  message: string,
  pushName: string,
  env: LocalEnv
): Promise<WorkerProfile> {
  const now = new Date().toISOString();
  const existing = await getWorkerProfile(phone, env.db);

  const profileIncomplete = !existing || (!existing.first_name && !existing.area);

  if (profileIncomplete) {
    const extracted = await extractProfileFromMessage(message, pushName, env);
    const fromName = (!extracted.first_name) ? inferProfileFromPushName(pushName) : {};
    const merged = { ...fromName, ...extracted, last_seen: now };
    return upsertWorkerProfile(phone, merged, env.db);
  }

  // Just update last_seen
  return upsertWorkerProfile(phone, { last_seen: now }, env.db);
}

// ---------------------------------------------------------------------------
// Handle !feedback command
// ---------------------------------------------------------------------------

export async function handleFeedbackCommand(
  phone: string,
  text: string,
  procedureId: string | null,
  env: LocalEnv
): Promise<string> {
  const lower = text.toLowerCase().trim();

  // Check for rating pattern
  const rated = parseRatingMessage(text);
  if (rated !== null) {
    await saveFeedback({
      phone,
      procedure_id: procedureId,
      type: 'rating',
      content: rated.comment || `Calificación: ${rated.rating}/5`,
      rating: rated.rating,
      context: procedureId ? JSON.stringify({ procedure_id: procedureId }) : null,
    }, env.db);

    // Persist preferences if high rating commentary mentions something
    if (rated.comment && rated.rating >= 4) {
      const profile = await getOrUpdatePreferences(phone, rated.comment, env);
      void profile;
    }

    const stars = '⭐'.repeat(rated.rating);
    return `¡Gracias por tu calificación ${stars}! Tu opinión nos ayuda a mejorar los procedimientos.`;
  }

  // General feedback
  const type: FeedbackType = lower.includes('corrigi') || lower.includes('error') || lower.includes('incorrecto')
    ? 'correction'
    : lower.includes('prefiero') || lower.includes('mejor si') || lower.includes('quisiera')
    ? 'preference'
    : lower.includes('gracias') || lower.includes('excelente') || lower.includes('perfecto')
    ? 'positive'
    : 'negative';

  await saveFeedback({ phone, procedure_id: procedureId, type, content: text, rating: null, context: null }, env.db);
  return '¡Gracias por tu comentario! Lo tendré en cuenta para mejorar los próximos procedimientos. 📝';
}

// ---------------------------------------------------------------------------
// Internal: extract preferences as JSON array from a message and persist
// ---------------------------------------------------------------------------

async function getOrUpdatePreferences(phone: string, message: string, env: LocalEnv): Promise<void> {
  try {
    const profile = await getWorkerProfile(phone, env.db);
    if (!profile) return;

    const existing: string[] = profile.preferences ? JSON.parse(profile.preferences) : [];

    const prompt = `Dado el siguiente comentario de un trabajador minero, extrae máximo 2 preferencias concretas en español breve (ej: "pasos cortos", "incluir EPP detallado"). Si no hay preferencias claras, responde []. Mensaje: "${message}". Responde solo JSON array.`;
    const raw = await callClaude(
      prompt,
      env,
      'Eres un asistente que extrae preferencias de trabajadores mineros. Responde SIEMPRE en español con JSON válido.'
    );
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return;
    const newPrefs: string[] = JSON.parse(match[0]);
    const merged = [...new Set([...existing, ...newPrefs])].slice(0, 10);
    await upsertWorkerProfile(phone, { preferences: JSON.stringify(merged) }, env.db);
  } catch { /* best-effort */ }
}

// ---------------------------------------------------------------------------
// Convenience: get profile + feedback for a worker
// ---------------------------------------------------------------------------

export async function getProfileAndFeedback(
  phone: string,
  env: LocalEnv
): Promise<{ profile: WorkerProfile | null; feedback: FeedbackEntry[] }> {
  const profile = await getWorkerProfile(phone, env.db);
  const feedback = profile ? await getFeedbackForPhone(phone, env.db, 10) : [];
  return { profile, feedback };
}
