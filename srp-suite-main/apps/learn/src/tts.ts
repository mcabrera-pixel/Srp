import { EdgeTTS } from 'edge-tts-universal';
import * as fs from 'fs';
import * as path from 'path';

// Voz en español de Chile/España (neural, alta calidad)
const DEFAULT_VOICE = 'es-CL-CatalinaNeural'; // Voz femenina chilena
const BACKUP_VOICE = 'es-MX-DaliaNeural';     // Voz femenina mexicana

export interface TTSOptions {
    voice?: string;
    rate?: string;    // e.g. '+10%', '-5%'
    pitch?: string;   // e.g. '+5Hz', '-2Hz'
    volume?: string;  // e.g. '+10%'
}

/**
 * Genera un archivo MP3 a partir de texto usando Microsoft Edge TTS
 */
export async function generateAudio(
    text: string,
    outputPath: string,
    options: TTSOptions = {}
): Promise<string> {
    const voice = options.voice || DEFAULT_VOICE;

    const tts = new EdgeTTS();
    await tts.synthesize(text, voice, {
        rate: options.rate,
        pitch: options.pitch,
        volume: options.volume,
    });

    // Asegurar que el directorio existe
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    await tts.toFile(outputPath);
    console.log(`✅ Audio generado: ${outputPath}`);
    return outputPath;
}

/**
 * Genera audio para cada paso de un procedimiento
 */
export async function generateProcedureAudio(
    pasos: Array<{ numero: number; titulo: string; contenido: string }>,
    outputDir: string,
    options: TTSOptions = {}
): Promise<string[]> {
    const audioPaths: string[] = [];

    for (const paso of pasos) {
        const text = `Paso ${paso.numero}: ${paso.titulo}. ${paso.contenido}`;
        const fileName = `paso_${String(paso.numero).padStart(2, '0')}.mp3`;
        const outputPath = path.join(outputDir, fileName);

        await generateAudio(text, outputPath, options);
        audioPaths.push(outputPath);
    }

    return audioPaths;
}

/**
 * Lista las voces disponibles en español
 */
export async function listSpanishVoices(): Promise<void> {
    const tts = new EdgeTTS();
    const voices = await tts.getVoices();
    const spanishVoices = voices.filter((v: { Locale: string }) => v.Locale.startsWith('es-'));

    console.log('\n🎙️ Voces disponibles en español:\n');
    for (const voice of spanishVoices) {
        console.log(`  ${(voice as { ShortName: string }).ShortName} — ${(voice as { Locale: string }).Locale}`);
    }
    console.log(`\n  Total: ${spanishVoices.length} voces\n`);
}
