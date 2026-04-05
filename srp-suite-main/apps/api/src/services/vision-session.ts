// ============================================================================
// Vision Session Service — gestión de sesiones de asistencia visual SRP Vision
// ============================================================================

import type { DatabaseSync } from 'node:sqlite';
type Database = DatabaseSync;

import {
  VisionSession,
  VisionFrame,
  VisionInstruction,
  VisionAnalysis,
  VisionRiskLevel,
  VisionInstructionSource,
  LocalEnv,
} from '../types.js';
import {
  createVisionSession,
  getVisionSession,
  updateVisionSession,
  listActiveVisionSessions,
  saveVisionFrame,
  saveVisionInstruction,
  getSessionFrames,
  getSessionInstructions,
} from '../db/queries.js';
import { callVisionLLM, type VisionLLMOptions } from './llm.js';
import { generateInstruction } from './tts-service.js';
import { messageBus } from './message-bus.js';
import { LocalStorage } from '../storage/client.js';

// ── Ring buffer de frames recientes (en memoria, por sesión) ────────────────

const MAX_RECENT_FRAMES = 10;
const sessionFrameCounters = new Map<string, number>();
const recentAnalyses = new Map<string, VisionAnalysis[]>();

// ── Crear sesión ────────────────────────────────────────────────────────────

export async function startVisionSession(
  technicianPhone: string,
  equipmentTag: string,
  sopId: string | null,
  db: Database,
): Promise<VisionSession> {
  const now = new Date().toISOString();
  const session: Omit<VisionSession, 'ended_at' | 'summary' | 'findings'> = {
    id: crypto.randomUUID(),
    technician_phone: technicianPhone,
    equipment_tag: equipmentTag,
    sop_id: sopId,
    status: 'active',
    started_at: now,
    created_at: now,
  };

  const created = await createVisionSession(session, db);
  sessionFrameCounters.set(created.id, 0);
  recentAnalyses.set(created.id, []);

  console.log(`[Vision] Sesión iniciada: ${created.id} — ${equipmentTag} — ${technicianPhone}`);
  return created;
}

// ── Procesar frame ──────────────────────────────────────────────────────────

export async function processFrame(
  sessionId: string,
  imageBase64: string,
  env: LocalEnv,
  storage: LocalStorage,
  technicianQuery?: string,
  sopContext?: string,
  workerContext?: string,
): Promise<{ analysis: VisionAnalysis; audioUrl: string | null }> {
  const session = await getVisionSession(sessionId, env.db);
  if (!session || session.status !== 'active') {
    throw new Error(`Sesión ${sessionId} no encontrada o no activa`);
  }

  // Incrementar contador de frames
  const frameNum = (sessionFrameCounters.get(sessionId) ?? 0) + 1;
  sessionFrameCounters.set(sessionId, frameNum);

  // Guardar imagen
  const imageKey = `vision/frames/${sessionId}/${frameNum}.jpg`;
  await storage.put(imageKey, Buffer.from(imageBase64, 'base64'));

  // Construir contexto de hallazgos previos
  const recent = recentAnalyses.get(sessionId) ?? [];
  const previousFindings = recent.length > 0
    ? recent.slice(-3).map((a, i) =>
        `Frame ${frameNum - recent.length + i}: ${a.instruction} (riesgo: ${a.risk_level})`
      ).join('\n')
    : undefined;

  // Llamar al LLM multimodal
  const analysis = await callVisionLLM({
    imageBase64,
    technicianQuery,
    sopContext,
    workerContext,
    equipmentTag: session.equipment_tag,
    previousFindings,
  }, env);

  // Guardar frame en DB
  const frame: VisionFrame = {
    id: crypto.randomUUID(),
    session_id: sessionId,
    frame_number: frameNum,
    image_path: imageKey,
    analysis: JSON.stringify(analysis),
    risk_level: analysis.risk_level,
    captured_at: new Date().toISOString(),
  };
  await saveVisionFrame(frame, env.db);

  // Actualizar ring buffer
  recent.push(analysis);
  if (recent.length > MAX_RECENT_FRAMES) recent.shift();

  // Emitir evento de frame
  messageBus.emit('vision:frame', {
    sessionId,
    frameId: frame.id,
    frameNumber: frameNum,
    imagePath: imageKey,
    timestamp: frame.captured_at,
  });

  // Generar audio de la instrucción
  let audioUrl: string | null = null;
  try {
    const ttsResult = await generateInstruction(
      analysis.instruction,
      analysis.risk_level,
      storage,
      env.openaiApiKey,
    );
    audioUrl = ttsResult.audioUrl;

    // Guardar instrucción
    await saveVisionInstruction({
      id: crypto.randomUUID(),
      session_id: sessionId,
      source: 'ai',
      content: analysis.instruction,
      audio_path: ttsResult.audioPath,
      created_at: new Date().toISOString(),
    }, env.db);
  } catch (e) {
    console.error('[Vision] Error generando TTS:', e);
  }

  // Emitir instrucción
  messageBus.emit('vision:instruction', {
    sessionId,
    source: 'ai',
    content: analysis.instruction,
    audioUrl,
    riskLevel: analysis.risk_level,
    timestamp: new Date().toISOString(),
  });

  // Si riesgo alto o crítico, emitir alerta
  if (analysis.risk_level === 'high' || analysis.risk_level === 'critical') {
    messageBus.emit('vision:alert', {
      sessionId,
      riskLevel: analysis.risk_level,
      message: analysis.instruction,
      analysis,
      timestamp: new Date().toISOString(),
    });
  }

  return { analysis, audioUrl };
}

// ── Instrucción del senior ──────────────────────────────────────────────────

export async function addSeniorInstruction(
  sessionId: string,
  content: string,
  env: LocalEnv,
  storage: LocalStorage,
): Promise<{ audioUrl: string | null }> {
  let audioUrl: string | null = null;
  try {
    const ttsResult = await generateInstruction(content, 'none', storage, env.openaiApiKey);
    audioUrl = ttsResult.audioUrl;
  } catch (e) {
    console.error('[Vision] Error generando TTS para senior:', e);
  }

  await saveVisionInstruction({
    id: crypto.randomUUID(),
    session_id: sessionId,
    source: 'senior',
    content,
    audio_path: null,
    created_at: new Date().toISOString(),
  }, env.db);

  messageBus.emit('vision:instruction', {
    sessionId,
    source: 'senior',
    content,
    audioUrl,
    riskLevel: 'none',
    timestamp: new Date().toISOString(),
  });

  return { audioUrl };
}

// ── Finalizar sesión ────────────────────────────────────────────────────────

export async function endVisionSession(
  sessionId: string,
  db: Database,
): Promise<void> {
  await updateVisionSession(sessionId, {
    status: 'ended',
    ended_at: new Date().toISOString(),
  }, db);

  // Limpiar estado en memoria
  sessionFrameCounters.delete(sessionId);
  recentAnalyses.delete(sessionId);

  console.log(`[Vision] Sesión finalizada: ${sessionId}`);
}

// ── Consultas ───────────────────────────────────────────────────────────────

export { getVisionSession, listActiveVisionSessions, getSessionFrames, getSessionInstructions };
