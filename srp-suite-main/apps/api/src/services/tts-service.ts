// ============================================================================
// TTS Service — Text-to-Speech via Edge TTS (Microsoft)
// Genera audio MP3 para instrucciones al técnico por conducción ósea
// ============================================================================

import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { LocalStorage } from '../storage/client.js';

// ── Voces disponibles ────────────────────────────────────────────────────────

export const VOICES = {
  /** Voz masculina chilena — instrucciones normales */
  instruction: 'es-CL-LorenzoNeural',
  /** Voz femenina chilena — alertas de seguridad */
  alert: 'es-CL-CatalinaNeural',
} as const;

export type TTSVoiceType = keyof typeof VOICES;

// ── Edge TTS via REST API ───────────────────────────────────────────────────
// Usa el endpoint público de Edge TTS (mismo que usa el paquete edge-tts)

const EDGE_TTS_URL = 'https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/token';
const EDGE_SYNTH_URL = 'https://eastus.api.speech.microsoft.com/cognitiveservices/v1';

/**
 * Genera audio MP3 desde texto usando OpenAI TTS (más robusto para servidor).
 * Fallback simple que usa el SDK de OpenAI ya disponible en el proyecto.
 */
export async function generateSpeech(
  text: string,
  voiceType: TTSVoiceType,
  storage: LocalStorage,
  openaiApiKey: string,
): Promise<{ audioPath: string; audioUrl: string }> {
  const id = crypto.randomUUID();
  const key = `vision/audio/${id}.mp3`;

  // Usar OpenAI TTS — ya tenemos el SDK instalado (openai ^4.52.0)
  const OpenAI = (await import('openai')).default;
  const client = new OpenAI({ apiKey: openaiApiKey });

  // Mapear voice type a voces OpenAI
  const voice = voiceType === 'alert' ? 'nova' : 'onyx';

  console.log(`[TTS] Generando audio (${voice}): "${text.substring(0, 50)}..."`);

  const mp3Response = await client.audio.speech.create({
    model: 'tts-1',
    voice,
    input: text,
    speed: 1.0,
  });

  const buffer = Buffer.from(await mp3Response.arrayBuffer());
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
