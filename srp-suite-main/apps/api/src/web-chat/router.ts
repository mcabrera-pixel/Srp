// ============================================================================
// Web Chat Router — sirve la UI y gestiona WebSocket + API /api/chat
// SRP Vision — WebSocket /ws/vision para asistencia visual en tiempo real
// ============================================================================

import { Router, Request, Response } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { LocalEnv } from '../types.js';
import { handleWhatsAppMessage } from '../services/whatsapp-handler.js';
import { validateWebhookSecret } from '../services/wasender.js';
import { messageBus } from '../services/message-bus.js';
import { resetRequest } from '../db/queries.js';
import { LocalStorage } from '../storage/client.js';
import {
  startVisionSession,
  processFrame,
  addSeniorInstruction,
  endVisionSession,
  listActiveVisionSessions,
} from '../services/vision-session.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── WebSocket servers ────────────────────────────────────────────────────────

let wss: WebSocketServer | null = null;
let wssVision: WebSocketServer | null = null;

// Track vision clients por rol
const visionClients = new Map<WebSocket, { role: 'field' | 'dashboard'; sessionId?: string }>();

export function attachWebSocket(server: Server, env?: LocalEnv): void {
  // ── Chat WebSocket (existente) ────────────────────────────────────────────
  wss = new WebSocketServer({ noServer: true });

  wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`[WS] Chat client connected (${ip})`);
    ws.on('close', () => console.log(`[WS] Chat client disconnected (${ip})`));
    ws.on('error', console.error);
  });

  messageBus.on('outbound', (msg) => {
    if (!wss) return;
    const payload = JSON.stringify({ type: 'message', ...msg });
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) client.send(payload);
    }
  });

  // ── Vision WebSocket ──────────────────────────────────────────────────────
  wssVision = new WebSocketServer({ noServer: true });

  wssVision.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`[Vision WS] Client connected (${ip})`);
    visionClients.set(ws, { role: 'dashboard' });

    ws.on('message', async (data, isBinary) => {
      if (!env) return;
      try {
        if (isBinary) {
          // Frame JPEG binario — necesita sessionId en el metadata del cliente
          const clientMeta = visionClients.get(ws);
          if (!clientMeta?.sessionId) {
            ws.send(JSON.stringify({ type: 'error', message: 'Inicia una sesión primero (session:start)' }));
            return;
          }

          const imageBase64 = Buffer.from(data as Buffer).toString('base64');
          const storage = new LocalStorage(env.storageDir);

          const result = await processFrame(
            clientMeta.sessionId,
            imageBase64,
            env,
            storage,
          );

          // Enviar resultado al cliente de campo
          ws.send(JSON.stringify({
            type: 'vision:result',
            analysis: result.analysis,
            audioUrl: result.audioUrl,
          }));

          // Broadcast a dashboards
          broadcastVision({
            type: 'vision:frame_analyzed',
            sessionId: clientMeta.sessionId,
            analysis: result.analysis,
            audioUrl: result.audioUrl,
          });
        } else {
          // Mensaje JSON
          const msg = JSON.parse(data.toString());
          await handleVisionMessage(ws, msg, env);
        }
      } catch (e: any) {
        console.error('[Vision WS] Error:', e.message);
        ws.send(JSON.stringify({ type: 'error', message: e.message }));
      }
    });

    ws.on('close', () => {
      visionClients.delete(ws);
      console.log(`[Vision WS] Client disconnected (${ip})`);
    });
    ws.on('error', console.error);
  });

  // Retransmitir eventos de visión a dashboards
  messageBus.on('vision:instruction', (msg) => {
    broadcastVision({ type: 'vision:instruction', ...msg });
  });
  messageBus.on('vision:alert', (msg) => {
    broadcastVision({ type: 'vision:alert', ...msg });
  });

  // ── HTTP Upgrade handler (rutea /ws y /ws/vision) ─────────────────────────
  server.on('upgrade', (req, socket, head) => {
    const pathname = req.url ?? '';

    if (pathname === '/ws/vision' && wssVision) {
      wssVision.handleUpgrade(req, socket, head, (ws) => {
        wssVision!.emit('connection', ws, req);
      });
    } else if (pathname === '/ws' && wss) {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss!.emit('connection', ws, req);
      });
    } else {
      socket.destroy();
    }
  });

  console.log('[WS] WebSocket server attached at /ws');
  console.log('[WS] Vision WebSocket attached at /ws/vision');
}

// ── Vision message handler ──────────────────────────────────────────────────

async function handleVisionMessage(ws: WebSocket, msg: any, env: LocalEnv): Promise<void> {
  const storage = new LocalStorage(env.storageDir);

  switch (msg.type) {
    case 'session:start': {
      const session = await startVisionSession(
        msg.technicianPhone ?? 'unknown',
        msg.equipmentTag ?? 'unknown',
        msg.sopId ?? null,
        env.db,
      );
      visionClients.set(ws, { role: 'field', sessionId: session.id });
      ws.send(JSON.stringify({ type: 'session:started', session }));
      broadcastVision({ type: 'session:started', session });
      break;
    }

    case 'session:end': {
      const clientMeta = visionClients.get(ws);
      if (clientMeta?.sessionId) {
        await endVisionSession(clientMeta.sessionId, env.db);
        ws.send(JSON.stringify({ type: 'session:ended', sessionId: clientMeta.sessionId }));
        broadcastVision({ type: 'session:ended', sessionId: clientMeta.sessionId });
        clientMeta.sessionId = undefined;
      }
      break;
    }

    case 'frame': {
      // Frame como JSON con base64
      const clientMeta = visionClients.get(ws);
      if (!clientMeta?.sessionId) {
        ws.send(JSON.stringify({ type: 'error', message: 'No hay sesión activa' }));
        return;
      }
      const result = await processFrame(
        clientMeta.sessionId,
        msg.imageBase64,
        env,
        storage,
        msg.query,
      );
      ws.send(JSON.stringify({
        type: 'vision:result',
        analysis: result.analysis,
        audioUrl: result.audioUrl,
      }));
      broadcastVision({
        type: 'vision:frame_analyzed',
        sessionId: clientMeta.sessionId,
        analysis: result.analysis,
        audioUrl: result.audioUrl,
      });
      break;
    }

    case 'voice': {
      // Audio del técnico → STT → query
      const clientMeta = visionClients.get(ws);
      if (!clientMeta?.sessionId) return;
      try {
        const { transcribeAudio } = await import('../services/audio-processor.js');
        const transcription = await transcribeAudio(msg.audioUrl, env);
        ws.send(JSON.stringify({ type: 'voice:transcribed', text: transcription }));
        // El próximo frame usará esta transcripción como query
      } catch (e: any) {
        ws.send(JSON.stringify({ type: 'error', message: `STT error: ${e.message}` }));
      }
      break;
    }

    case 'senior:instruction': {
      // El senior envía instrucción desde el dashboard
      if (!msg.sessionId || !msg.content) return;
      const result = await addSeniorInstruction(msg.sessionId, msg.content, env, storage);

      // Enviar al técnico de campo
      for (const [client, meta] of visionClients) {
        if (meta.sessionId === msg.sessionId && meta.role === 'field' && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'senior:instruction',
            content: msg.content,
            audioUrl: result.audioUrl,
          }));
        }
      }
      break;
    }

    case 'dashboard:subscribe': {
      // Dashboard se suscribe a una sesión específica o a todas
      visionClients.set(ws, { role: 'dashboard', sessionId: msg.sessionId });
      const sessions = await listActiveVisionSessions(env.db);
      ws.send(JSON.stringify({ type: 'dashboard:sessions', sessions }));
      break;
    }

    default:
      ws.send(JSON.stringify({ type: 'error', message: `Tipo de mensaje desconocido: ${msg.type}` }));
  }
}

// ── Broadcast a dashboards ──────────────────────────────────────────────────

function broadcastVision(payload: object): void {
  if (!wssVision) return;
  const data = JSON.stringify(payload);
  for (const [client, meta] of visionClients) {
    if (meta.role === 'dashboard' && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

// ── Router ────────────────────────────────────────────────────────────────────

export function createWebChatRouter(env: LocalEnv): Router {
  const router = Router();

  // Servir la UI estática
  const publicDir = join(__dirname, 'public');

  // GET / → chat UI
  router.get('/', (_req: Request, res: Response) => {
    res.sendFile(join(publicDir, 'index.html'));
  });

  // POST /api/chat — recibe mensaje del chat web y lo procesa como WhatsApp
  router.post('/api/chat', (req: Request, res: Response) => {
    const { phone, name, message } = req.body as { phone: string; name: string; message: string };

    if (!phone || !message) {
      res.status(400).json({ error: 'phone y message son requeridos' });
      return;
    }

    // Responde 200 inmediatamente y procesa en background (igual que el Worker)
    res.status(200).json({ ok: true });

    // Procesar en background (Node.js no cancela las promesas pendientes)
    handleWhatsAppMessage(phone, message, null, name ?? 'Usuario', env).catch(e =>
      console.error('[WebChat] Handler error:', e)
    );
  });

  // POST /api/chat/reset — reinicia la sesión de un teléfono
  router.post('/api/chat/reset', async (req: Request, res: Response) => {
    const { phone } = req.body as { phone: string };
    if (!phone) { res.status(400).json({ error: 'phone requerido' }); return; }
    await resetRequest(phone, env.db);
    res.json({ ok: true });
  });

  return router;
}

// ── Webhook de Wasender → procesado localmente (sin proxy Worker) ─────────────

export function createWebhookRouter(env: LocalEnv, localSecret: string): Router {
  const router = Router();

  // POST /webhook — recibe webhooks de Wasender (o del Worker proxy)
  router.post('/webhook', (req: Request, res: Response) => {
    const secret = req.headers['x-local-secret'] as string
      ?? req.headers['x-webhook-secret'] as string;

    if (!validateWebhookSecret(secret, localSecret)) {
      console.warn('[Webhook] Invalid secret');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Responde 200 inmediatamente
    res.status(200).json({ ok: true });

    // Procesar en background
    processWebhookPayload(req.body, env).catch(e =>
      console.error('[Webhook] Processing error:', e)
    );
  });

  return router;
}

async function processWebhookPayload(payload: any, env: LocalEnv): Promise<void> {
  try {
    const phone = payload?.data?.key?.remoteJid?.replace('@s.whatsapp.net', '')
      ?? payload?.from
      ?? null;
    const pushName = payload?.data?.pushName ?? payload?.pushName ?? 'Usuario';
    const textMessage = payload?.data?.message?.conversation
      ?? payload?.data?.message?.extendedTextMessage?.text
      ?? payload?.text
      ?? null;
    const audioUrl = payload?.data?.message?.audioMessage?.url
      ?? payload?.audioUrl
      ?? null;

    if (!phone) {
      console.warn('[Webhook] Could not extract phone from payload');
      return;
    }

    await handleWhatsAppMessage(phone, textMessage, audioUrl, pushName, env);
  } catch (e) {
    console.error('[Webhook] Error processing payload:', e);
  }
}
