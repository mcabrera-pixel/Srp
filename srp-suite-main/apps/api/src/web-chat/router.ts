// ============================================================================
// Web Chat Router — sirve la UI y gestiona WebSocket + API /api/chat
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

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── WebSocket server (compartido con el HTTP server) ──────────────────────────

let wss: WebSocketServer | null = null;

export function attachWebSocket(server: Server): void {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`[WS] Client connected (${ip})`);

    ws.on('close', () => console.log(`[WS] Client disconnected (${ip})`));
    ws.on('error', console.error);
  });

  // Retransmitir mensajes salientes a todos los clientes conectados
  messageBus.on('outbound', (msg) => {
    if (!wss) return;
    const payload = JSON.stringify({ type: 'message', ...msg });
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  });

  console.log('[WS] WebSocket server attached at /ws');
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
