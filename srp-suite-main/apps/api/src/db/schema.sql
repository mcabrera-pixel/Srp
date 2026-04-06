-- ============================================================================
-- Mining RAG Local — SQLite Schema (equivalente a D1 + migrations Cloudflare)
-- ============================================================================

CREATE TABLE IF NOT EXISTS procedure_requests (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  specialist_name TEXT,
  area TEXT,
  state TEXT NOT NULL DEFAULT 'awaiting_audio',
  audio_url TEXT,
  transcription TEXT,
  task_steps TEXT,         -- JSON
  step_evaluations TEXT,   -- JSON StepEvalState
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_requests_phone ON procedure_requests(phone);
CREATE INDEX IF NOT EXISTS idx_requests_state  ON procedure_requests(state);

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS procedures (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES procedure_requests(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,   -- JSON ProcedureContent
  version TEXT NOT NULL DEFAULT '1.0',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  expires_at TEXT,
  pdf_url TEXT,
  docx_url TEXT
);

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS base_documents (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata TEXT,           -- JSON analysis
  version TEXT NOT NULL DEFAULT '1.0',
  vectorize_indexed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS session_messages (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  role TEXT NOT NULL,      -- 'user' | 'assistant'
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_phone_time ON session_messages(phone, created_at);

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS generation_plans (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES procedure_requests(id),
  status TEXT NOT NULL DEFAULT 'collecting',
  required_fields TEXT NOT NULL,  -- JSON
  collected_data TEXT NOT NULL DEFAULT '{}',
  completeness REAL NOT NULL DEFAULT 0,
  rag_context TEXT NOT NULL DEFAULT '[]',
  preview_content TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_plans_request ON generation_plans(request_id);

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS fatality_risks (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  full_title TEXT,
  scope TEXT,
  exclusions TEXT
);

CREATE TABLE IF NOT EXISTS fatality_risk_controls (
  id TEXT PRIMARY KEY,
  risk_code TEXT NOT NULL REFERENCES fatality_risks(code),
  control_code TEXT NOT NULL,
  control_name TEXT NOT NULL,
  objective TEXT
);

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS zone_risks (
  id TEXT PRIMARY KEY,
  zone TEXT NOT NULL,
  risk_code TEXT NOT NULL,
  controls TEXT            -- JSON array
);

CREATE INDEX IF NOT EXISTS idx_zone_risks_zone ON zone_risks(zone);

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS worker_profiles (
  phone TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  area TEXT,
  role TEXT,
  communication_style TEXT,
  preferences TEXT,            -- JSON array of preference strings
  procedures_generated INTEGER NOT NULL DEFAULT 0,
  last_seen TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS feedback_entries (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL REFERENCES worker_profiles(phone),
  procedure_id TEXT,           -- nullable FK to procedures
  type TEXT NOT NULL,          -- positive | negative | correction | preference | rating
  content TEXT NOT NULL,
  rating INTEGER,              -- 1-5, only when type='rating'
  context TEXT,                -- JSON
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_feedback_phone ON feedback_entries(phone);
CREATE INDEX IF NOT EXISTS idx_feedback_proc  ON feedback_entries(procedure_id);

-- ============================================================================
-- SRP VISION — Sesiones de asistencia visual en tiempo real
-- ============================================================================

CREATE TABLE IF NOT EXISTS vision_sessions (
  id TEXT PRIMARY KEY,
  technician_phone TEXT NOT NULL,
  equipment_tag TEXT NOT NULL,          -- ej: "CAEX-930E-014", "PALA-4100XPC-03"
  sop_id TEXT,                          -- FK a procedures o base_documents (nullable)
  status TEXT NOT NULL DEFAULT 'active', -- active | paused | ended
  started_at TEXT NOT NULL,
  ended_at TEXT,
  summary TEXT,                         -- resumen AI post-sesión
  findings TEXT,                        -- JSON: hallazgos detectados
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vision_sessions_tech ON vision_sessions(technician_phone);
CREATE INDEX IF NOT EXISTS idx_vision_sessions_status ON vision_sessions(status);

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS vision_frames (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES vision_sessions(id),
  frame_number INTEGER NOT NULL,
  image_path TEXT NOT NULL,             -- key en LocalStorage
  analysis TEXT,                        -- JSON: resultado del análisis LLM
  risk_level TEXT,                      -- none | low | medium | high | critical
  captured_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vision_frames_session ON vision_frames(session_id);

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS vision_instructions (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES vision_sessions(id),
  source TEXT NOT NULL,                 -- 'ai' | 'senior' | 'technician'
  content TEXT NOT NULL,
  audio_path TEXT,                      -- key en LocalStorage del MP3 generado
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vision_instructions_session ON vision_instructions(session_id);

-- --------------------------------------------------------
-- Training data: feedback del supervisor sobre análisis de la IA
-- Cada registro es un ejemplo "bueno" o "malo" que se usa para few-shot learning

CREATE TABLE IF NOT EXISTS vision_training (
  id TEXT PRIMARY KEY,
  frame_id TEXT NOT NULL REFERENCES vision_frames(id),
  session_id TEXT NOT NULL REFERENCES vision_sessions(id),
  equipment_tag TEXT NOT NULL,            -- para buscar ejemplos por tipo de equipo
  image_path TEXT NOT NULL,               -- key de la imagen original
  analysis_json TEXT NOT NULL,            -- análisis que generó la IA
  rating TEXT NOT NULL,                   -- 'correct' | 'incorrect' | 'partial'
  senior_correction TEXT,                 -- instrucción corregida por el senior (si rating != correct)
  senior_phone TEXT,                      -- quién evaluó
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vision_training_equip ON vision_training(equipment_tag);
CREATE INDEX IF NOT EXISTS idx_vision_training_rating ON vision_training(rating);
