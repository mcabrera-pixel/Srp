// ============================================================================
// Generation Plan Service — adaptado para LocalEnv (better-sqlite3)
// ============================================================================

import { LocalEnv } from '../types.js';
import { callClaude } from './llm.js';
import { searchRelevantContext } from './rag.js';
import { getGenerationPlan, saveGenerationPlan } from '../db/queries.js';

// ============================================================================
// TYPES
// ============================================================================

export interface PrototypeSection {
  key: string;
  label: string;
  required: boolean;
  source: 'user' | 'auto';
  question?: string;
  value?: string;
}

export interface GenerationPlan {
  id: string;
  request_id: string;
  status: 'collecting' | 'ready' | 'reviewing' | 'generating' | 'completed' | 'failed';
  required_fields: PrototypeSection[];
  collected_data: Record<string, string>;
  completeness: number;
  rag_context: string[];
  preview_content: string | null;
  created_at: string;
  updated_at: string;
}

export type RequiredField = PrototypeSection;

// ============================================================================
// PROTOTYPE SECTIONS
// ============================================================================

const USER_SECTIONS: PrototypeSection[] = [
  { key: 'descripcion_tarea', label: 'Descripción de la tarea', required: true, source: 'user', question: '¿Cuál es la tarea que necesitas realizar? Descríbela en detalle.' },
  { key: 'alcance',            label: 'Zona/Área de trabajo',     required: true, source: 'user', question: '¿En qué zona o área se realizará el trabajo?' },
  { key: 'epp_equipos',        label: 'EPP y equipos',            required: true, source: 'user', question: '¿Qué EPP y herramientas utilizarás?' },
  { key: 'bloqueo_energias',   label: 'Bloqueo de energías',      required: false, source: 'user', question: '¿Se requiere bloqueo de energías (LOTO)? ¿En qué equipos?' },
  { key: 'personal',           label: 'Personal involucrado',     required: false, source: 'user', question: '¿Cuántas personas participarán y qué roles tendrán?' },
];

const AUTO_SECTIONS: PrototypeSection[] = [
  { key: 'objetivo',           label: 'Objetivo',            required: true, source: 'auto' },
  { key: 'responsabilidades',  label: 'Responsabilidades',   required: true, source: 'auto' },
  { key: 'definiciones',       label: 'Definiciones',        required: true, source: 'auto' },
  { key: 'competencias',       label: 'Competencias',        required: true, source: 'auto' },
  { key: 'riesgos_criticos',   label: 'Riesgos críticos',    required: true, source: 'auto' },
  { key: 'peligros_controles', label: 'Peligros y controles',required: true, source: 'auto' },
  { key: 'emergencias',        label: 'Emergencias',         required: true, source: 'auto' },
  { key: 'medio_ambiente',     label: 'Medio ambiente',      required: true, source: 'auto' },
  { key: 'registros',          label: 'Registros',           required: true, source: 'auto' },
  { key: 'referencias',        label: 'Referencias',         required: true, source: 'auto' },
];

// ============================================================================
// PLAN CREATION
// ============================================================================

export async function createGenerationPlan(
  requestId: string,
  description: string,
  env: LocalEnv
): Promise<GenerationPlan> {
  console.log(`[GenPlan] Creating plan for request ${requestId}`);

  let ragContext: string[] = [];
  try {
    ragContext = await searchRelevantContext(description, ['approved_procedure', 'risk_critical'], env, 5);
    console.log(`[GenPlan] Found ${ragContext.length} RAG contexts`);
  } catch (e) {
    console.warn('[GenPlan] RAG search failed:', e);
  }

  const sections = buildRequiredSections(description, ragContext);
  const collectedData: Record<string, string> = {};
  collectedData['descripcion_tarea'] = description;

  // Auto-extract zone from description
  const zonaKw = ['zona', 'área', 'area', 'plataforma', 'sector', 'nivel', 'torre', 'planta', 'taller', 'pox', 'mina', 'rajo'];
  if (zonaKw.some(kw => description.toLowerCase().includes(kw))) {
    collectedData['alcance'] = description;
  }

  // Auto-extract EPP
  const eppKw = ['casco', 'guantes', 'arnés', 'epp', 'lentes', 'botas', 'máscara', 'mascara', 'chaleco', 'overol', 'respirador'];
  if (eppKw.some(kw => description.toLowerCase().includes(kw))) {
    collectedData['epp_equipos'] = description;
  }

  const completeness = calculateCompleteness(sections, collectedData);

  const plan: GenerationPlan = {
    id: crypto.randomUUID(),
    request_id: requestId,
    status: completeness >= 100 ? 'ready' : 'collecting',
    required_fields: sections,
    collected_data: collectedData,
    completeness,
    rag_context: ragContext,
    preview_content: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await saveGenerationPlan(plan, env.db);
  console.log(`[GenPlan] Created: ${plan.id}, completeness: ${completeness}%`);
  return plan;
}

// ============================================================================
// PLAN RETRIEVAL
// ============================================================================

export async function getPlanByRequest(requestId: string, env: LocalEnv): Promise<GenerationPlan | null> {
  return getGenerationPlan(requestId, env.db) as Promise<GenerationPlan | null>;
}

// ============================================================================
// PLAN UPDATES
// ============================================================================

export async function updatePlanFromUserResponse(
  requestId: string,
  userMessage: string,
  env: LocalEnv
): Promise<GenerationPlan | null> {
  const plan = await getPlanByRequest(requestId, env);
  if (!plan) return null;

  const extracted = extractFieldsFromMessage(userMessage, plan.required_fields);
  for (const [key, value] of Object.entries(extracted)) {
    plan.collected_data[key] = value;
    console.log(`[GenPlan] Updated field '${key}'`);
  }

  plan.completeness = calculateCompleteness(plan.required_fields, plan.collected_data);
  plan.status = plan.completeness >= 100 ? 'ready' : 'collecting';
  plan.updated_at = new Date().toISOString();

  await saveGenerationPlan(plan, env.db);
  return plan;
}

// ============================================================================
// PREVIEW
// ============================================================================

export async function generateSectionPreview(
  plan: GenerationPlan,
  taskSteps: any[],
  env: LocalEnv
): Promise<string> {
  console.log('[GenPlan] Building preview...');

  const data = plan.collected_data;
  const raw  = data['descripcion_tarea'] ?? '';
  const preview: Record<string, string> = {};

  // Descripción: use structured step list when available
  if (raw) {
    if (taskSteps?.length > 0) {
      preview['descripcion_tarea'] = taskSteps.map((s, i) => `${i + 1}. ${s.description ?? s}`).join('\n');
    } else {
      preview['descripcion_tarea'] = raw;
    }
  }

  // Alcance: extract concise zone/area via LLM
  if (data['alcance']) {
    try {
      const resp = await callClaude(
        `Del siguiente texto, extrae SOLO el nombre de la zona o área de trabajo (máximo 1 línea breve). Si no se menciona claramente, responde "No especificada".\n\nTexto: ${raw.substring(0, 600)}`,
        env,
        'Eres un asistente que extrae información concisa de textos mineros. Responde SIEMPRE en español.'
      );
      preview['alcance'] = resp.trim();
    } catch {
      preview['alcance'] = data['alcance'].substring(0, 200);
    }
  }

  // EPP y Equipos: extract concise list via LLM
  if (data['epp_equipos']) {
    try {
      const resp = await callClaude(
        `Del siguiente texto, extrae SOLO los EPP, herramientas e insumos mencionados como una lista corta separada por comas (máximo 2 líneas). Si no se menciona claramente, responde "No especificados".\n\nTexto: ${raw.substring(0, 600)}`,
        env,
        'Eres un asistente que extrae información concisa de textos mineros. Responde SIEMPRE en español.'
      );
      preview['epp_equipos'] = resp.trim();
    } catch {
      preview['epp_equipos'] = data['epp_equipos'].substring(0, 200);
    }
  }

  if (data['bloqueo_energias']) preview['bloqueo_energias'] = data['bloqueo_energias'];
  if (data['personal'])         preview['personal']         = data['personal'];
  preview['auto_sections'] = 'Objetivo, Responsabilidades, Definiciones, Competencias, Riesgos Críticos, Peligros y Controles, Emergencias, Medio Ambiente, Registros, Referencias';

  const previewJson = JSON.stringify(preview);
  plan.preview_content = previewJson;
  plan.status = 'reviewing';
  plan.updated_at = new Date().toISOString();

  await saveGenerationPlan(plan, env.db);
  return previewJson;
}

export function formatPreviewForWhatsApp(previewJson: string): string {
  try {
    const content = JSON.parse(previewJson);
    const lines: string[] = [];
    lines.push('📋 *RESUMEN DEL PROCEDIMIENTO*');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (content['descripcion_tarea']) {
      lines.push('\n*📝 Descripción / Pasos*');
      const t = String(content['descripcion_tarea']);
      lines.push(t.length > 800 ? t.substring(0, 800) + '...' : t);
    }
    if (content['alcance']) {
      lines.push('\n*📌 Zona / Alcance*');
      lines.push(String(content['alcance']).substring(0, 400));
    }
    if (content['epp_equipos']) {
      lines.push('\n*🦺 EPP y Equipos*');
      lines.push(String(content['epp_equipos']).substring(0, 400));
    }
    if (content['bloqueo_energias']) {
      lines.push('\n*🔒 Bloqueo de Energías*');
      lines.push(String(content['bloqueo_energias']).substring(0, 300));
    }
    if (content['auto_sections']) {
      lines.push('\n⚙️ *Secciones auto-generadas:*');
      lines.push(content['auto_sections']);
    }

    lines.push('\n━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('\n¿Apruebas este procedimiento?');
    lines.push('Responde *sí* para generar el documento DOCX.');
    lines.push('Si quieres modificar algo, indícame qué cambiar.');

    return lines.join('\n');
  } catch {
    return '❌ Error al formatear el resumen.';
  }
}

export function formatPlanForDisplay(plan: GenerationPlan): string {
  const lines = ['📋 *Progreso del Procedimiento*', `Completitud: ${plan.completeness}%`, ''];
  for (const f of plan.required_fields.filter(f => f.source === 'user')) {
    const icon = plan.collected_data[f.key] ? '✅' : f.required ? '⬜' : '◻️';
    lines.push(`${icon} ${f.label}`);
  }
  const autoCount = plan.required_fields.filter(f => f.source === 'auto').length;
  lines.push('', `Secciones auto-generadas: ${autoCount} ✅`);
  return lines.join('\n');
}

export function getPendingUserSections(plan: GenerationPlan): PrototypeSection[] {
  return plan.required_fields.filter(f => f.source === 'user' && f.required && !plan.collected_data[f.key]);
}
export function getPendingFields(plan: GenerationPlan): PrototypeSection[] {
  return getPendingUserSections(plan);
}

// ============================================================================
// HELPERS
// ============================================================================

function buildRequiredSections(description: string, ragContext: string[]): PrototypeSection[] {
  const sections = [...USER_SECTIONS, ...AUTO_SECTIONS];
  const ctx = ragContext.join(' ').toLowerCase();
  const desc = description.toLowerCase();
  if (ctx.includes('altura') || desc.includes('altura')) {
    sections.push({ key: 'altura_metros', label: 'Altura de trabajo', required: true, source: 'user', question: '¿A qué altura se trabajará (en metros)?' });
  }
  if (ctx.includes('confinado') || desc.includes('tanque') || desc.includes('silo')) {
    sections.push({ key: 'atmosfera', label: 'Monitoreo de atmósfera', required: true, source: 'user', question: '¿Se realizará monitoreo de atmósfera?' });
  }
  if (ctx.includes('izaje') || desc.includes('grúa') || desc.includes('izaje')) {
    sections.push({ key: 'peso_carga', label: 'Peso de la carga', required: true, source: 'user', question: '¿Cuál es el peso aproximado de la carga?' });
  }
  return sections;
}

function calculateCompleteness(fields: PrototypeSection[], data: Record<string, string>): number {
  const userRequired = fields.filter(f => f.source === 'user' && f.required);
  if (userRequired.length === 0) return 100;
  const completed = userRequired.filter(f => data[f.key]).length;
  return Math.round((completed / userRequired.length) * 100);
}

function extractFieldsFromMessage(message: string, fields: PrototypeSection[]): Record<string, string> {
  const extracted: Record<string, string> = {};
  const lower = message.toLowerCase();

  const eppKw = ['casco', 'guantes', 'arnés', 'epp', 'lentes', 'botas', 'máscara', 'mascara', 'chaleco', 'overol', 'respirador', 'tenida'];
  const zonaKw = ['zona', 'área', 'area', 'plataforma', 'sector', 'nivel', 'torre', 'planta', 'taller', 'pox', 'mina', 'rajo'];

  if (eppKw.some(kw => lower.includes(kw))) extracted['epp_equipos'] = message;
  if (zonaKw.some(kw => lower.includes(kw))) extracted['alcance'] = message;
  if (lower.includes('bloqueo') || lower.includes('loto') || lower.includes('candado')) extracted['bloqueo_energias'] = message;
  if (lower.match(/\d+\s*persona/) || lower.includes('cuadrilla')) extracted['personal'] = message;

  const altMatch = message.match(/(\d+)\s*(?:metros?|m\b)/i);
  if (altMatch) extracted['altura_metros'] = altMatch[1] + ' metros';

  return extracted;
}
