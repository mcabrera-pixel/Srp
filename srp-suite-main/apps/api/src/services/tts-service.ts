// ============================================================================
// TTS Service — Text-to-Speech para instrucciones al técnico en terreno
// Prioridad: Edge TTS (voces chilenas, gratis) → OpenAI TTS (fallback)
// ============================================================================

import { LocalStorage } from '../storage/client.js';

// ── Voces disponibles ────────────────────────────────────────────────────────

export const VOICES = {
  /** Voz masculina chilena — instrucciones normales */
  instruction: 'es-CL-LorenzoNeural',
  /** Voz femenina chilena — alertas de seguridad */
  alert: 'es-CL-CatalinaNeural',
} as const;

export type TTSVoiceType = keyof typeof VOICES;

// ── Edge TTS via WebSocket (Microsoft Cognitive Services) ───────────────────

const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';

async function edgeTTS(text: string, voice: string): Promise<Buffer> {
  const { WebSocket: WS } = await import('ws');

  const requestId = crypto.randomUUID().replace(/-/g, '');
  const timestamp = new Date().toISOString();

  const url =
    `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1` +
    `?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}` +
    `&ConnectionId=${requestId}`;

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('Edge TTS timeout (15s)'));
    }, 15_000);

    const audioChunks: Buffer[] = [];
    const ws = new WS(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': 'chrome-extension://jdiccldimpdaibmpdmdbd',
      },
    });

    ws.on('open', () => {
      // Config message
      ws.send(
        `X-Timestamp:${timestamp}\r\n` +
        `Content-Type:application/json; charset=utf-8\r\n` +
        `Path:speech.config\r\n\r\n` +
        `{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`
      );

      // SSML message
      const ssml =
        `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='es-CL'>` +
        `<voice name='${voice}'>` +
        `<prosody pitch='+0Hz' rate='+5%'>${escapeXml(text)}</prosody>` +
        `</voice></speak>`;

      ws.send(
        `X-RequestId:${requestId}\r\n` +
        `Content-Type:application/ssml+xml\r\n` +
        `X-Timestamp:${timestamp}\r\n` +
        `Path:ssml\r\n\r\n` +
        ssml
      );
    });

    ws.on('message', (data: Buffer | string) => {
      if (typeof data === 'string') {
        if (data.includes('Path:turn.end')) {
          clearTimeout(timeout);
          ws.close();
          resolve(Buffer.concat(audioChunks));
        }
      } else {
        // Binary: skip header (find "Path:audio\r\n" then 2 more bytes)
        const headerEnd = findHeaderEnd(data as Buffer);
        if (headerEnd > 0) {
          audioChunks.push((data as Buffer).subarray(headerEnd));
        }
      }
    });

    ws.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

function findHeaderEnd(buf: Buffer): number {
  const needle = Buffer.from('Path:audio\r\n');
  const idx = buf.indexOf(needle);
  if (idx === -1) return -1;
  return idx + needle.length;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── OpenAI TTS (fallback) ───────────────────────────────────────────────────

async function openaiTTS(text: string, voiceType: TTSVoiceType, apiKey: string): Promise<Buffer> {
  const OpenAI = (await import('openai')).default;
  const client = new OpenAI({ apiKey });
  // OpenAI voices all support Spanish — shimmer for alerts, onyx for instructions
  const voice = voiceType === 'alert' ? 'shimmer' : 'onyx';

  const mp3Response = await client.audio.speech.create({
    model: 'tts-1',
    voice,
    input: text,
    speed: 1.05,
  });

  return Buffer.from(await mp3Response.arrayBuffer());
}

// ── API Pública ─────────────────────────────────────────────────────────────

/**
 * Genera audio MP3 desde texto.
 * Intenta Edge TTS (voces chilenas, gratis) primero, fallback a OpenAI.
 */
export async function generateSpeech(
  text: string,
  voiceType: TTSVoiceType,
  storage: LocalStorage,
  openaiApiKey: string,
): Promise<{ audioPath: string; audioUrl: string }> {
  const id = crypto.randomUUID();
  const key = `vision/audio/${id}.mp3`;

  let buffer: Buffer;

  try {
    // Primario: Edge TTS — voces chilenas nativas, sin costo
    const voice = VOICES[voiceType];
    console.log(`[TTS] Edge TTS (${voice}): "${text.substring(0, 60)}..."`);
    buffer = await edgeTTS(text, voice);
  } catch (err) {
    // Fallback: OpenAI TTS
    console.warn(`[TTS] Edge TTS falló, usando OpenAI:`, (err as Error).message);
    buffer = await openaiTTS(text, voiceType, openaiApiKey);
  }

  await storage.put(key, buffer);
  const audioUrl = storage.publicUrl(key);
  console.log(`[TTS] Audio guardado: ${key} (${buffer.length} bytes)`);

  return { audioPath: key, audioUrl };
}

/**
 * Genera instrucción de audio para el técnico.
 * Selecciona la voz según el nivel de riesgo.
 */
export async function generateInstruction(
  text: string,
  riskLevel: string,
  storage: LocalStorage,
  openaiApiKey: string,
): Promise<{ audioPath: string; audioUrl: string }> {
  const voiceType: TTSVoiceType =
    riskLevel === 'high' || riskLevel === 'critical' ? 'alert' : 'instruction';
  return generateSpeech(text, voiceType, storage, openaiApiKey);
}
