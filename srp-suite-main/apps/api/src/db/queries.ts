// ============================================================================
// Database Queries - better-sqlite3 (equivalente a D1)
// Las funciones son async para mantener la misma firma que la versión Worker.
// ============================================================================

import type { DatabaseSync } from 'node:sqlite';
type Database = DatabaseSync;
import {
  ProcedureRequest,
  GeneratedProcedure,
  BaseDocument,
  WorkerProfile,
  FeedbackEntry,
  FeedbackType,
  CommunicationStyle,
  VisionSession,
  VisionFrame,
  VisionInstruction,
  VisionRiskLevel,
  VisionInstructionSource,
} from '../types.js';

// ============================================================================
// PROCEDURE REQUESTS
// ============================================================================

export async function getOrCreateRequest(
  phone: string,
  name: string,
  db: Database
): Promise<ProcedureRequest> {
  const existing = db
    .prepare(
      `SELECT * FROM procedure_requests
       WHERE phone = ? AND state != 'completed'
       ORDER BY created_at DESC LIMIT 1`
    )
    .get(phone) as unknown as ProcedureRequest | undefined;

  if (existing) return existing;

  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  db.prepare(
    `INSERT INTO procedure_requests (id, phone, specialist_name, state, created_at, updated_at)
     VALUES (?, ?, ?, 'awaiting_audio', ?, ?)`
  ).run(id, phone, name as string, now, now);

  return {
    id,
    phone,
    specialist_name: name,
    area: null,
    state: 'awaiting_audio',
    audio_url: null,
    transcription: null,
    task_steps: null,
    step_evaluations: null,
    created_at: now,
    updated_at: now,
  };
}

export async function updateRequest(
  id: string,
  updates: Partial<ProcedureRequest>,
  db: Database
): Promise<void> {
  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(updates)) {
    if (key !== 'id' && key !== 'created_at') {
      fields.push(`${key} = ?`);
      values.push(typeof value === 'object' && value !== null ? JSON.stringify(value) : value);
    }
  }

  fields.push('updated_at = ?');
  values.push(new Date().toISOString(), id);

  (db.prepare(`UPDATE procedure_requests SET ${fields.join(', ')} WHERE id = ?`) as any).run(...values);
}

export async function getRequest(id: string, db: Database): Promise<ProcedureRequest | null> {
  return (db.prepare('SELECT * FROM procedure_requests WHERE id = ?').get(id) as unknown as ProcedureRequest) ?? null;
}

export async function resetRequest(phone: string, db: Database): Promise<void> {
  db.prepare(`UPDATE procedure_requests SET state = 'completed' WHERE phone = ? AND state != 'completed'`).run(phone);
}

// ============================================================================
// PROCEDURES
// ============================================================================

export async function saveProcedure(
  procedure: Omit<GeneratedProcedure, 'created_at' | 'updated_at'>
): Promise<void> {
  // Not used in local — procedures are saved by procedure-generator service
}

export async function getProcedure(id: string, db: Database): Promise<GeneratedProcedure | null> {
  return (db.prepare('SELECT * FROM procedures WHERE id = ?').get(id) as unknown as GeneratedProcedure) ?? null;
}

export async function listProcedures(db: Database, limit = 50): Promise<GeneratedProcedure[]> {
  return db
    .prepare('SELECT * FROM procedures ORDER BY created_at DESC LIMIT ?')
    .all(limit) as unknown as GeneratedProcedure[];
}

// ============================================================================
// BASE DOCUMENTS (RAG)
// ============================================================================

export async function saveBaseDocument(
  document: Omit<BaseDocument, 'id' | 'created_at' | 'updated_at'>,
  db: Database
): Promise<BaseDocument> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  db.prepare(
    `INSERT INTO base_documents (id, type, name, content, metadata, version, vectorize_indexed, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`
  ).run(id, document.type, document.name, document.content, document.metadata ?? null, document.version, now, now);

  return { ...document, id, vectorize_indexed: false, created_at: now, updated_at: now };
}

export async function getBaseDocuments(db: Database): Promise<BaseDocument[]> {
  return db.prepare('SELECT * FROM base_documents ORDER BY created_at DESC').all() as unknown as BaseDocument[];
}

export async function getUnindexedDocuments(db: Database): Promise<BaseDocument[]> {
  return db
    .prepare('SELECT * FROM base_documents WHERE vectorize_indexed = 0')
    .all() as unknown as BaseDocument[];
}

export async function markDocumentIndexed(id: string, db: Database): Promise<void> {
  db.prepare(
    `UPDATE base_documents SET vectorize_indexed = 1, updated_at = ? WHERE id = ?`
  ).run(new Date().toISOString(), id);
}

export async function deleteBaseDocument(id: string, db: Database): Promise<void> {
  db.prepare('DELETE FROM base_documents WHERE id = ?').run(id);
}

export async function listProceduresWithCreators(db: Database, limit = 100): Promise<any[]> {
  return db.prepare(`
    SELECT p.id, p.title, p.status, p.version, p.created_at, p.docx_url,
           r.phone, r.specialist_name, r.area
    FROM procedures p
    LEFT JOIN procedure_requests r ON p.request_id = r.id
    ORDER BY p.created_at DESC
    LIMIT ?
  `).all(limit) as unknown as any[];
}

// ============================================================================
// SESSION MESSAGES
// ============================================================================

export async function saveSessionMessage(
  phone: string,
  role: 'user' | 'assistant',
  content: string,
  db: Database
): Promise<void> {
  db.prepare(
    `INSERT INTO session_messages (id, phone, role, content, created_at) VALUES (?, ?, ?, ?, ?)`
  ).run(crypto.randomUUID(), phone, role, content, new Date().toISOString());
}

export async function getRecentMessages(
  phone: string,
  db: Database,
  maxMessages = 10
): Promise<{ id: string; phone: string; role: string; content: string; created_at: string }[]> {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 1);

  const rows = db
    .prepare(
      `SELECT id, phone, role, content, created_at FROM session_messages
       WHERE phone = ? AND created_at > ?
       ORDER BY created_at DESC LIMIT ?`
    )
    .all(phone, cutoff.toISOString(), maxMessages as unknown as string) as unknown as any[];

  return rows.reverse();
}

export async function cleanExpiredMessages(db: Database): Promise<void> {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 1);
  db.prepare(`DELETE FROM session_messages WHERE created_at < ?`).run(cutoff.toISOString());
}

// ============================================================================
// GENERATION PLANS
// ============================================================================

export async function getGenerationPlan(requestId: string, db: Database): Promise<any | null> {
  const row = db
    .prepare('SELECT * FROM generation_plans WHERE request_id = ?')
    .get(requestId) as unknown as any;
  if (!row) return null;
  return {
    ...row,
    required_fields: JSON.parse(row.required_fields || '[]'),
    collected_data: JSON.parse(row.collected_data || '{}'),
    rag_context: JSON.parse(row.rag_context || '[]'),
  };
}

export async function saveGenerationPlan(plan: any, db: Database): Promise<void> {
  const now = new Date().toISOString();
  const existing = db.prepare('SELECT id FROM generation_plans WHERE id = ?').get(plan.id);

  if (existing) {
    db.prepare(
      `UPDATE generation_plans SET
         status = ?, required_fields = ?, collected_data = ?,
         completeness = ?, rag_context = ?, preview_content = ?, updated_at = ?
       WHERE id = ?`
    ).run(
      plan.status,
      JSON.stringify(plan.required_fields),
      JSON.stringify(plan.collected_data),
      plan.completeness,
      JSON.stringify(plan.rag_context),
      plan.preview_content ?? null,
      now,
      plan.id
    );
  } else {
    db.prepare(
      `INSERT INTO generation_plans
         (id, request_id, status, required_fields, collected_data, completeness, rag_context, preview_content, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      plan.id,
      plan.request_id,
      plan.status,
      JSON.stringify(plan.required_fields),
      JSON.stringify(plan.collected_data),
      plan.completeness,
      JSON.stringify(plan.rag_context),
      plan.preview_content ?? null,
      plan.created_at ?? now,
      now
    );
  }
}

// ============================================================================
// WORKER PROFILES
// ============================================================================

export async function getWorkerProfile(phone: string, db: Database): Promise<WorkerProfile | null> {
  return (db.prepare('SELECT * FROM worker_profiles WHERE phone = ?').get(phone) as unknown as WorkerProfile) ?? null;
}

export async function upsertWorkerProfile(
  phone: string,
  updates: Partial<Omit<WorkerProfile, 'phone' | 'created_at'>>,
  db: Database
): Promise<WorkerProfile> {
  const now = new Date().toISOString();
  const existing = await getWorkerProfile(phone, db);

  if (!existing) {
    db.prepare(`
      INSERT INTO worker_profiles
        (phone, first_name, last_name, area, role, communication_style, preferences,
         procedures_generated, last_seen, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
    `).run(
      phone,
      updates.first_name ?? null,
      updates.last_name ?? null,
      updates.area ?? null,
      updates.role ?? null,
      updates.communication_style ?? null,
      updates.preferences ?? null,
      now, now, now,
    );
    return (db.prepare('SELECT * FROM worker_profiles WHERE phone = ?').get(phone) as unknown as WorkerProfile);
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  for (const [key, value] of Object.entries(updates)) {
    if (key !== 'created_at') {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }
  fields.push('updated_at = ?');
  values.push(now, phone);
  (db.prepare(`UPDATE worker_profiles SET ${fields.join(', ')} WHERE phone = ?`) as any).run(...values);
  return (db.prepare('SELECT * FROM worker_profiles WHERE phone = ?').get(phone) as unknown as WorkerProfile);
}

export async function incrementProceduresGenerated(phone: string, db: Database): Promise<void> {
  db.prepare(`
    UPDATE worker_profiles
    SET procedures_generated = procedures_generated + 1, updated_at = ?
    WHERE phone = ?
  `).run(new Date().toISOString(), phone);
}

export async function listWorkerProfiles(db: Database, limit = 100): Promise<WorkerProfile[]> {
  return db.prepare(
    'SELECT * FROM worker_profiles ORDER BY last_seen DESC LIMIT ?'
  ).all(limit) as unknown as WorkerProfile[];
}

// ============================================================================
// FEEDBACK
// ============================================================================

export async function saveFeedback(
  entry: Omit<FeedbackEntry, 'id' | 'created_at'>,
  db: Database
): Promise<FeedbackEntry> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO feedback_entries (id, phone, procedure_id, type, content, rating, context, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, entry.phone, entry.procedure_id ?? null, entry.type, entry.content,
         entry.rating ?? null, entry.context ?? null, now);
  return { ...entry, id, created_at: now };
}

export async function getFeedbackForPhone(
  phone: string,
  db: Database,
  limit = 20
): Promise<FeedbackEntry[]> {
  return db.prepare(
    'SELECT * FROM feedback_entries WHERE phone = ? ORDER BY created_at DESC LIMIT ?'
  ).all(phone, limit) as unknown as FeedbackEntry[];
}

export async function listAllFeedback(db: Database, limit = 100): Promise<FeedbackEntry[]> {
  return db.prepare(
    'SELECT * FROM feedback_entries ORDER BY created_at DESC LIMIT ?'
  ).all(limit) as unknown as FeedbackEntry[];
}

// ============================================================================
// SRP VISION — Sesiones, frames e instrucciones
// ============================================================================

export async function createVisionSession(
  session: Omit<VisionSession, 'ended_at' | 'summary' | 'findings'>,
  db: Database
): Promise<VisionSession> {
  db.prepare(`
    INSERT INTO vision_sessions (id, technician_phone, equipment_tag, sop_id, status, started_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(session.id, session.technician_phone, session.equipment_tag,
         session.sop_id ?? null, session.status, session.started_at, session.created_at);
  return { ...session, ended_at: null, summary: null, findings: null };
}

export async function getVisionSession(id: string, db: Database): Promise<VisionSession | null> {
  return (db.prepare('SELECT * FROM vision_sessions WHERE id = ?').get(id) as unknown as VisionSession) ?? null;
}

export async function updateVisionSession(
  id: string,
  updates: Partial<Pick<VisionSession, 'status' | 'ended_at' | 'summary' | 'findings'>>,
  db: Database
): Promise<void> {
  const fields: string[] = [];
  const values: unknown[] = [];
  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }
  if (fields.length === 0) return;
  values.push(id);
  (db.prepare(`UPDATE vision_sessions SET ${fields.join(', ')} WHERE id = ?`) as any).run(...values);
}

export async function listActiveVisionSessions(db: Database): Promise<VisionSession[]> {
  return db.prepare(
    "SELECT * FROM vision_sessions WHERE status = 'active' ORDER BY started_at DESC"
  ).all() as unknown as VisionSession[];
}

export async function saveVisionFrame(frame: VisionFrame, db: Database): Promise<void> {
  db.prepare(`
    INSERT INTO vision_frames (id, session_id, frame_number, image_path, analysis, risk_level, captured_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(frame.id, frame.session_id, frame.frame_number, frame.image_path,
         frame.analysis ?? null, frame.risk_level ?? null, frame.captured_at);
}

export async function getSessionFrames(
  sessionId: string,
  db: Database,
  limit = 50
): Promise<VisionFrame[]> {
  return db.prepare(
    'SELECT * FROM vision_frames WHERE session_id = ? ORDER BY frame_number DESC LIMIT ?'
  ).all(sessionId, limit) as unknown as VisionFrame[];
}

export async function saveVisionInstruction(instruction: VisionInstruction, db: Database): Promise<void> {
  db.prepare(`
    INSERT INTO vision_instructions (id, session_id, source, content, audio_path, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(instruction.id, instruction.session_id, instruction.source,
         instruction.content, instruction.audio_path ?? null, instruction.created_at);
}

export async function getSessionInstructions(
  sessionId: string,
  db: Database,
  limit = 50
): Promise<VisionInstruction[]> {
  return db.prepare(
    'SELECT * FROM vision_instructions WHERE session_id = ? ORDER BY created_at DESC LIMIT ?'
  ).all(sessionId, limit) as unknown as VisionInstruction[];
}
