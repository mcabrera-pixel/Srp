// ============================================================================
// Audio Processor — OpenAI Whisper (equivalente a @cf/openai/whisper)
// ============================================================================

import OpenAI from 'openai';
import { LocalEnv } from '../types.js';
import { createReadStream, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

export async function transcribeAudio(audioUrl: string, env: LocalEnv): Promise<string> {
  console.log(`[Audio] Downloading from: ${audioUrl}`);

  // 1. Descargar el audio
  const response = await fetch(audioUrl);
  if (!response.ok) {
    throw new Error(`Failed to download audio: ${response.statusText}`);
  }

  const audioBuffer = await response.arrayBuffer();

  // 2. Guardar en un archivo temporal (OpenAI SDK necesita un File/stream)
  const tmpPath = join(tmpdir(), `mining-rag-audio-${Date.now()}.ogg`);
  writeFileSync(tmpPath, Buffer.from(audioBuffer));

  try {
    const client = new OpenAI({ apiKey: env.openaiApiKey });

    console.log('[Audio] Transcribing with OpenAI Whisper...');
    const transcription = await client.audio.transcriptions.create({
      file: createReadStream(tmpPath),
      model: 'whisper-1',
      language: 'es',
    });

    console.log(`[Audio] Transcription: "${transcription.text.substring(0, 60)}..."`);
    return transcription.text;
  } finally {
    try { unlinkSync(tmpPath); } catch { /* ignore */ }
  }
}
