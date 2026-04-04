// ============================================================================
// TIPOS - Mining RAG Local (Node.js — sin Cloudflare bindings)
// ============================================================================

import type { DatabaseSync } from 'node:sqlite';

// Contexto local que se pasa a todos los servicios (equivale a Env en Worker)
export interface LocalEnv {
  db: DatabaseSync;
  storageDir: string;       // equivale a R2 DOCUMENTS
  vectorIndexPath: string;  // equivale a Vectorize
  minimaxApiKey: string;    // MiniMax M2.5 (principal)
  openrouterApiKey: string; // fallback (OpenRouter) — solo para chat, NO soporta embeddings
  openaiApiKey: string;
  /** Proveedor de embeddings activo.
   *  - 'minimax': API MiniMax embo-01 (1 RPM, requiere MINIMAX_API_KEY)
   *  - 'ollama':  Ollama local (sin límites, requiere OLLAMA_URL + modelo instalado)
   *  - 'openai':  OpenAI text-embedding-3-small (requiere OPENAI_API_KEY)
   */
  embeddingsProvider: 'minimax' | 'ollama' | 'openai';
  /** URL base de Ollama, ej. http://localhost:11434 */
  ollamaUrl: string;
  /** Modelo de embeddings a usar con Ollama, ej. nomic-embed-text */
  ollamaEmbeddingsModel: string;
  wasenderApiKey: string;
  wasenderUrl: string;
  /** URL del Worker Cloudflare proxy (ej: https://mining-rag-proxy.user.workers.dev)
   *  Si está configurado, los mensajes salientes se envían a workerUrl/send
   *  en lugar de llamar a Wasender directamente.
   *  La VM se autentica con X-Local-Secret (mismo valor que LOCAL_SECRET). */
  workerUrl: string;
}

// ============================================================================
// SOLICITUDES DE PROCEDIMIENTOS
// ============================================================================

export interface ProcedureRequest {
  id: string;
  phone: string;
  specialist_name: string | null;
  area: string | null;
  state: RequestState;
  audio_url: string | null;
  transcription: string | null;
  task_steps: string | null;        // JSON stringified TaskStep[]
  step_evaluations: string | null;  // JSON stringified StepEvalState
  created_at: string;
  updated_at: string;
}

export type RequestState =
  | 'awaiting_audio'
  | 'transcribing'
  | 'profiling'
  | 'reviewing'
  | 'confirming'
  | 'generating'
  | 'completed'
  | 'error';

// ============================================================================
// PASOS DE TAREA
// ============================================================================

export interface TaskStep {
  order: number;
  description: string;
  estimated_duration: string;
  requires_supervision: boolean;
  equipment_needed: string[];
  safety_notes: string;
}

// ============================================================================
// EVALUACIÓN DE PASOS
// ============================================================================

export type StepEvalStatus = 'pending' | 'ok' | 'needs_detail' | 'refined';

export interface StepEvaluation {
  stepIndex: number;
  originalDesc: string;
  score: number;          // 1-10; >= 7 → OK
  issues: string[];       // specific issues detected
  pendingQuestion: string | null; // question asked to user when needs_detail
  refinedDesc: string | null;  // user's clarification (null until refined)
  status: StepEvalStatus;
}

export interface StepEvalState {
  evaluations: StepEvaluation[];  // one per TaskStep
  currentIndex: number;           // step currently under review
  awaitingRefinement: boolean;    // true while waiting for user to refine
}

export interface GeneratedProcedure {
  id: string;
  request_id: string;
  title: string;
  content: string; // JSON stringified ProcedureContent
  version: string;
  status: ProcedureStatus;
  created_at: string;
  updated_at: string;
  expires_at: string;
  pdf_url: string | null;
  docx_url?: string | null;
}

export type ProcedureStatus =
  | 'draft'
  | 'review'
  | 'approved'
  | 'published'
  | 'expired';

export interface ProcedureContent {
  title: string;
  code: string;
  version: string;
  sections: {
    objective: string;
    scope: string;
    responsibilities: string[];
    definitions: Record<string, string>;
    procedure_steps: TaskStep[];
    risk_analysis: RiskAnalysis;
    control_measures: string[];
    ppe_required: string[];
    normative_references: string[];
  };
}

// ============================================================================
// ANÁLISIS DE RIESGOS
// ============================================================================

export interface RiskAnalysis {
  critical_risks: Risk[];
  general_risks: Risk[];
  mitigation_measures: string[];
  ppe_summary: string[];
}

export interface Risk {
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'fatal';
  probability: 'low' | 'medium' | 'high';
  controls: string[];
  ppe_required: string[];
}

// ============================================================================
// DOCUMENTOS BASE (RAG)
// ============================================================================

export interface BaseDocument {
  id: string;
  type: 'prototype' | 'risk_critical' | 'risk_general' | 'regulation' | 'approved_procedure';
  name: string;
  content: string;
  metadata?: string;
  version: string;
  vectorize_indexed: boolean;
  created_at: string;
  updated_at: string;
}

export interface VectorMetadata {
  document_id: string;
  document_type: string;
  chunk_index: number;
  content: string;
  section?: string;
  keywords?: string;
  [key: string]: unknown;
}

// ============================================================================
// PERFIL DEL TRABAJADOR
// ============================================================================

export type CommunicationStyle = 'formal' | 'informal' | 'technical';

export interface WorkerProfile {
  phone: string;
  first_name: string | null;
  last_name: string | null;
  area: string | null;
  role: string | null;                // cargo (ej: "operador de retroexcavadora")
  communication_style: CommunicationStyle | null;
  preferences: string | null;         // JSON string — notas sobre el trabajador
  procedures_generated: number;
  last_seen: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// FEEDBACK
// ============================================================================

export type FeedbackType = 'positive' | 'negative' | 'correction' | 'preference' | 'rating';

export interface FeedbackEntry {
  id: string;
  phone: string;
  procedure_id: string | null;  // linked procedure if feedback refers to one
  type: FeedbackType;
  content: string;              // raw feedback text
  rating: number | null;        // 1-5 stars when type='rating'
  context: string | null;       // JSON — e.g. procedure title, area
  created_at: string;
}
