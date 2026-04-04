// ============================================================================
// Mining RAG Local — Main Server (Express)
// Reemplaza Cloudflare Workers; corre todo en Node.js local
// ============================================================================

import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';
import multer from 'multer';
import { createRequire } from 'module';

import getDb from './db/client.js';
import { LocalEnv } from './types.js';
import { createWebChatRouter, createWebhookRouter, attachWebSocket } from './web-chat/router.js';
import { listProcedures, getProcedure, getBaseDocuments, deleteBaseDocument, listProceduresWithCreators, listWorkerProfiles, getFeedbackForPhone, listAllFeedback } from './db/queries.js';
import { getModelsStatus, setActiveModel, getActiveModel } from './services/llm.js';
import { initPromptStore, getAllPrompts, getPromptEntry, setPrompt, resetPrompt } from './services/prompt-store.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Env variables ─────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT ?? '3000', 10);
const DB_PATH = process.env.DB_PATH ?? './data/mining-rag.db';
const STORAGE_PATH = process.env.STORAGE_PATH ?? './data/storage';
const VECTOR_INDEX_PATH = process.env.VECTOR_INDEX_PATH ?? './data/vector-index.json';
const LOCAL_SECRET       = process.env.LOCAL_SECRET      ?? 'dev-secret';
const PROMPTS_PATH       = process.env.PROMPTS_PATH      ?? './data/prompts.json';

// ── Init prompt store ─────────────────────────────────────────────────────────
initPromptStore(PROMPTS_PATH);

// ── Ensure data directories exist ─────────────────────────────────────────────

for (const dir of [
  DB_PATH.replace(/\/[^/]+$/, ''),
  STORAGE_PATH,
  join(STORAGE_PATH, 'templates'),
  join(STORAGE_PATH, 'generated'),
  VECTOR_INDEX_PATH.replace(/\/[^/]+$/, ''),
]) {
  if (dir && !existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    console.log(`[Server] Created directory: ${dir}`);
  }
}

// ── Build LocalEnv ────────────────────────────────────────────────────────────

const db = getDb(DB_PATH);

const env: LocalEnv = {
  db,
  storageDir: STORAGE_PATH,
  vectorIndexPath: VECTOR_INDEX_PATH,
  minimaxApiKey: process.env.MINIMAX_API_KEY ?? '',
  openrouterApiKey: process.env.OPENROUTER_API_KEY ?? '',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  embeddingsProvider: (process.env.EMBEDDINGS_PROVIDER as 'minimax' | 'ollama' | 'openai') ?? 'minimax',
  ollamaUrl: process.env.OLLAMA_URL ?? 'http://localhost:11434',
  ollamaEmbeddingsModel: process.env.OLLAMA_EMBEDDINGS_MODEL ?? 'nomic-embed-text',
  wasenderApiKey: process.env.WASENDER_API_KEY ?? '',
  wasenderUrl: process.env.WASENDER_URL ?? '',
  workerUrl: process.env.WORKER_URL ?? '',
};

// ── Express app ───────────────────────────────────────────────────────────────

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos generados (DOCX, etc.)
app.use('/files', express.static(STORAGE_PATH));

// Servir chat web estático
app.use(express.static(join(__dirname, 'web-chat', 'public')));

// ── Health check ──────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Mining RAG Local',
    version: '1.0.0',
    port: PORT,
    db: DB_PATH,
    storage: STORAGE_PATH,
    vectorIndex: VECTOR_INDEX_PATH,
    llm: env.minimaxApiKey ? 'minimax-configured' : env.openrouterApiKey ? 'openrouter-fallback' : 'missing',
    embeddings: env.minimaxApiKey ? 'minimax-configured' : 'missing',
    whisper: env.openaiApiKey ? 'openai-configured' : 'not configured (audio disabled)',
    wasender: env.workerUrl
      ? `via-worker-proxy (${env.workerUrl})`
      : env.wasenderApiKey ? 'direct-configured' : 'not configured (web-chat only)',
  });
});

// ── Procedures API ────────────────────────────────────────────────────────────

app.get('/procedures', async (_req, res) => {
  const procedures = await listProcedures(db);
  res.json(procedures);
});

app.get('/api/procedures', async (_req, res) => {
  const procedures = await listProceduresWithCreators(db);
  res.json(procedures);
});

app.get('/procedures/:id/json', async (req, res) => {
  const procedure = await getProcedure(req.params.id, db);
  if (!procedure) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ ...procedure, content: JSON.parse(procedure.content) });
});

app.get('/procedures/:id/docx', async (req, res) => {
  const procedure = await getProcedure(req.params.id, db);
  if (!procedure?.docx_url) { res.status(404).json({ error: 'DOCX not found' }); return; }
  const filePath = join(STORAGE_PATH, procedure.docx_url.replace('/files/', ''));
  if (!existsSync(filePath)) { res.status(404).json({ error: 'File not found on disk' }); return; }
  res.download(filePath, `procedure-${req.params.id}.docx`);
});

// ── Documents (RAG) API ───────────────────────────────────────────────────────

app.get('/api/docs', async (_req, res) => {
  const docs = await getBaseDocuments(db);
  res.json(docs.map(d => ({ id: d.id, name: d.name, type: d.type, version: d.version, vectorize_indexed: d.vectorize_indexed, created_at: d.created_at })));
});

app.delete('/api/docs/:id', async (req, res) => {
  try {
    await deleteBaseDocument(req.params.id, db);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Models API ───────────────────────────────────────────────────────────────

/** GET /api/models — lista el catálogo con disponibilidad según env keys */
app.get('/api/models', (_req, res) => {
  const models = getModelsStatus(env).map(({ extractContent, ...m }) => m); // omit fn
  const active = getActiveModel();
  res.json({ active: active.id, models });
});

/** GET /api/models/active — modelo actualmente seleccionado */
app.get('/api/models/active', (_req, res) => {
  const m = getActiveModel();
  res.json({ id: m.id, name: m.name, provider: m.provider });
});

/** POST /api/models/active — cambia el modelo activo { id: string } */
app.post('/api/models/active', (req, res) => {
  const { id } = req.body as { id?: string };
  if (!id) { res.status(400).json({ error: 'id requerido' }); return; }
  try {
    const m = setActiveModel(id);
    res.json({ ok: true, id: m.id, name: m.name, provider: m.provider });
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

// ── Prompts API ──────────────────────────────────────────────────────────

/** GET /api/prompts — lista todos los prompts con contenido actual */
app.get('/api/prompts', (_req, res) => {
  res.json(getAllPrompts());
});

/** GET /api/prompts/:id — un prompt en particular */
app.get('/api/prompts/:id', (req, res) => {
  const entry = getPromptEntry(decodeURIComponent(req.params.id));
  if (!entry) return res.status(404).json({ error: 'Prompt no encontrado' });
  res.json(entry);
});

/** PUT /api/prompts/:id — actualiza el contenido únicamente { content: string } */
app.put('/api/prompts/:id', (req, res) => {
  const { content } = req.body as { content?: string };
  if (typeof content !== 'string') return res.status(400).json({ error: '"content" requerido (string)' });
  try {
    setPrompt(decodeURIComponent(req.params.id), content);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

/** POST /api/prompts/:id/reset — restaura el prompt por defecto */
app.post('/api/prompts/:id/reset', (req, res) => {
  try {
    resetPrompt(decodeURIComponent(req.params.id));
    const entry = getPromptEntry(decodeURIComponent(req.params.id));
    res.json({ ok: true, current: entry?.current });
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

// ── Procedure Requests API (kanban) ────────────────────────────────────

app.get('/api/requests', async (_req, res) => {
  try {
    const rows = db.prepare(`
      SELECT r.id, r.phone, r.specialist_name, r.area, r.state,
             r.transcription, r.created_at, r.updated_at,
             p.id        AS procedure_id,
             p.title     AS procedure_title,
             p.docx_url  AS procedure_docx_url,
             p.status    AS procedure_status
      FROM procedure_requests r
      LEFT JOIN procedures p ON p.request_id = r.id
      ORDER BY r.updated_at DESC
      LIMIT 150
    `).all() as any[];
    res.json(rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── Worker Profiles API ───────────────────────────────────────────────────────

app.get('/api/profiles', async (_req, res) => {
  try {
    const profiles = await listWorkerProfiles(db);
    res.json(profiles);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/profiles/:phone/feedback', async (req, res) => {
  try {
    const feedback = await getFeedbackForPhone(decodeURIComponent(req.params.phone), db);
    res.json(feedback);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/feedback', async (_req, res) => {
  try {
    const feedback = await listAllFeedback(db);
    res.json(feedback);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── Web Chat router ───────────────────────────────────────────────────────────

const chatRouter = createWebChatRouter(env);
app.use(chatRouter);

// ── Webhook router (receives from Wasender / Worker proxy) ────────────────────

const webhookRouter = createWebhookRouter(env, LOCAL_SECRET);
app.use(webhookRouter);

// ── Ingest API ────────────────────────────────────────────────────────────────

// GET /api/docs/:id/content — full text content of a stored RAG document
app.get('/api/docs/:id/content', async (req, res) => {
  try {
    const row = db.prepare('SELECT id, name, type, content, version, created_at FROM base_documents WHERE id = ?').get(req.params.id) as any;
    if (!row) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(row);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// POST /ingest/file — multipart upload of PDF / DOCX / TXT; parses and ingests
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
app.post('/ingest/file', upload.single('file'), async (req, res) => {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) { res.status(400).json({ error: 'No file uploaded' }); return; }
  const type    = (req.body.type    || 'approved_procedure') as string;
  const version = (req.body.version || '1.0') as string;
  const name    = (req.body.name    || file.originalname) as string;
  try {
    let content = '';
    const ext = file.originalname.toLowerCase().split('.').pop();
    if (ext === 'pdf') {
      const _require = createRequire(import.meta.url);
      const pdfParse = _require('pdf-parse');
      const data = await pdfParse(file.buffer);
      content = data.text;
    } else if (ext === 'docx' || ext === 'doc') {
      const mammoth = await import('mammoth');
      const result  = await mammoth.extractRawText({ buffer: file.buffer });
      content = result.value;
    } else {
      content = file.buffer.toString('utf-8');
    }
    if (!content.trim()) { res.status(422).json({ error: 'No se pudo extraer texto del archivo' }); return; }
    const { saveBaseDocument } = await import('./db/queries.js');
    const { ingestDocument }   = await import('./services/rag.js');
    const doc = await saveBaseDocument({ type: type as any, name, content, version, vectorize_indexed: false }, db);
    await ingestDocument(doc, env);
    res.json({ ok: true, id: doc.id, chars: content.length });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/ingest', async (req, res) => {
  const { type, name, content, version } = req.body as {
    type: string; name: string; content: string; version?: string;
  };
  if (!type || !name || !content) {
    res.status(400).json({ error: 'type, name, content requeridos' });
    return;
  }
  try {
    const { saveBaseDocument } = await import('./db/queries.js');
    const { ingestDocument } = await import('./services/rag.js');
    const doc = await saveBaseDocument({ type: type as any, name, content, version: version ?? '1.0', vectorize_indexed: false }, db);
    await ingestDocument(doc, env);
    res.json({ ok: true, id: doc.id });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── HTTP server + WebSocket ───────────────────────────────────────────────────

const server = createServer(app);
attachWebSocket(server);

server.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║    ⛏️  Mining RAG Local — Running             ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  Server:     http://localhost:${PORT}          ║`);
  console.log(`║  Web Chat:   http://localhost:${PORT}/          ║`);
  console.log(`║  Health:     http://localhost:${PORT}/health    ║`);
  console.log(`║  Webhook:    POST /webhook                   ║`);
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌  Puerto ${PORT} en uso. Libéralo con:\n`);
    console.error(`    Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT} -State Listen).OwningProcess -Force\n`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
