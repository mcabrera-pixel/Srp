// ============================================================================
// Wasender Service
// Soporta dos modos de envío:
//
//  A) Directo   — la VM llama a Wasender con WASENDER_API_KEY
//                 (requiere WASENDER_URL + WASENDER_API_KEY en .env)
//
//  B) Via Worker — la VM llama a Worker /send con LOCAL_SECRET;
//                  el Worker tiene la API key y la reenvía a Wasender
//                 (requiere WORKER_URL + LOCAL_SECRET en .env)
//
// El modo B es el preferido en producción: la VM nunca expone
// la API key de Wasender y no necesita conectarse directamente a Wasender.
// ============================================================================

import { LocalEnv } from '../types.js';
import { emitOutbound } from './message-bus.js';

export async function sendMessage(phone: string, message: string, env: LocalEnv): Promise<void> {
  // Siempre emitir al bus (para web chat WebSocket)
  emitOutbound(phone, message);

  // ── Modo B: via Worker proxy (preferido en producción) ────────────────────
  const hasWorkerUrl = env.workerUrl && env.workerUrl.startsWith('http');
  if (hasWorkerUrl) {
    const sendUrl = env.workerUrl.replace(/\/$/, '') + '/send';
    console.log(`[Wasender] → Worker proxy: ${sendUrl} | to=${phone}`);
    try {
      const res = await fetch(sendUrl, {
        method: 'POST',
        headers: {
          'Content-Type':   'application/json',
          'X-Local-Secret': process.env.LOCAL_SECRET ?? '',
        },
        body: JSON.stringify({ to: phone, text: message }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error('[Wasender] Worker proxy error:', res.status, err);
      } else {
        console.log(`[Wasender] Enviado via Worker a ${phone}`);
      }
    } catch (error) {
      console.error('[Wasender] Error llamando Worker proxy:', error);
    }
    return;
  }

  // ── Modo A: directo a Wasender ────────────────────────────────────────────
  const hasRealKey = env.wasenderApiKey
    && env.wasenderApiKey !== 'tu_api_key'
    && env.wasenderApiKey.length > 10;

  if (!hasRealKey || !env.wasenderUrl) {
    console.log(`[WebChat only] → ${phone}: ${message.substring(0, 80)}`);
    return;
  }

  try {
    const response = await fetch(env.wasenderUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.wasenderApiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ to: phone, text: message }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Wasender] Error sending message:', error);
    } else {
      console.log(`[Wasender] Mensaje enviado directo a ${phone}`);
    }
  } catch (error) {
    console.error('[Wasender] Error:', error);
  }
}

export async function sendMessageOrSkip(
  phone: string,
  message: string,
  env: LocalEnv
): Promise<void> {
  const hasSend = (env.workerUrl && env.workerUrl.startsWith('http'))
               || (env.wasenderApiKey && env.wasenderUrl);
  if (hasSend) {
    await sendMessage(phone, message, env);
  } else {
    console.log(`[Wasender SKIP] → ${phone}: ${message.substring(0, 80)}`);
  }
}

export function validateWebhookSecret(received: string | null | undefined, expected: string): boolean {
  if (!received) return false;
  return received === expected;
}
