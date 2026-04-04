/**
 * SRP Learn — Generador de Videos E2E
 *
 * Uso:
 *   npx ts-node scripts/generate-video.ts
 *   npx ts-node scripts/generate-video.ts --input data.json --output video.mp4
 *   npx ts-node scripts/generate-video.ts --no-audio  (solo video, sin TTS)
 *   npx ts-node scripts/generate-video.ts --list-voices  (ver voces disponibles)
 *
 * Genera un video MP4 completo a partir de un JSON de procedimiento.
 */

import path from 'path';
import fs from 'fs';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { generateProcedureAudio, listSpanishVoices } from '../src/tts';

// Configuración por defecto
const DEFAULTS = {
    compositionId: 'ProcedureVideo',
    outputDir: path.resolve(__dirname, '..', 'output'),
    inputFile: path.resolve(__dirname, '..', 'src', 'data', 'example.json'),
    codec: 'h264' as const,
};

// Parse argumentos CLI
function parseArgs() {
    const args = process.argv.slice(2);
    const config: {
        inputFile: string;
        outputFile: string;
        compositionId: string;
        noAudio: boolean;
        listVoices: boolean;
    } = {
        inputFile: '',
        outputFile: '',
        compositionId: DEFAULTS.compositionId,
        noAudio: false,
        listVoices: false,
    };

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--input':
            case '-i':
                config.inputFile = args[++i];
                break;
            case '--output':
            case '-o':
                config.outputFile = args[++i];
                break;
            case '--composition':
            case '-c':
                config.compositionId = args[++i];
                break;
            case '--no-audio':
                config.noAudio = true;
                break;
            case '--list-voices':
                config.listVoices = true;
                break;
        }
    }

    return config;
}

async function main() {
    const config = parseArgs();

    // Comando especial: listar voces
    if (config.listVoices) {
        await listSpanishVoices();
        process.exit(0);
    }

    console.log('\n🎬 SRP Learn — Generador de Videos\n');
    console.log('━'.repeat(50));

    // 1. Cargar datos del procedimiento
    let procedureData;
    if (config.inputFile && fs.existsSync(config.inputFile)) {
        console.log(`📂 Cargando: ${config.inputFile}`);
        const raw = fs.readFileSync(config.inputFile, 'utf-8');
        procedureData = JSON.parse(raw);
    } else {
        console.log('📂 Usando datos de ejemplo (ECF 1 - Bloqueo de Energías)');
        // Importar desde el módulo TypeScript
        const { PROCEDURE_EXAMPLE } = await import('../src/data/example');
        procedureData = PROCEDURE_EXAMPLE;
    }

    console.log(`📋 Procedimiento: ${procedureData.titulo}`);
    console.log(`📊 Pasos: ${procedureData.pasos.length}`);

    // 2. Generar audio TTS (si no está desactivado)
    if (!config.noAudio) {
        console.log('\n🎙️ Generando audio TTS...');
        const audioDir = path.join(DEFAULTS.outputDir, 'audio');
        try {
            const audioPaths = await generateProcedureAudio(
                procedureData.pasos,
                audioDir
            );
            console.log(`✅ ${audioPaths.length} archivos de audio generados`);
        } catch (err) {
            console.warn('⚠️  Error generando audio, continuando sin audio:', (err as Error).message);
        }
    } else {
        console.log('\n🔇 Audio desactivado (--no-audio)');
    }

    // 3. Bundle del proyecto Remotion
    console.log('\n📦 Compilando proyecto Remotion...');
    const entryPoint = path.resolve(__dirname, '..', 'src', 'index.ts');
    const bundleLocation = await bundle({
        entryPoint,
        webpackOverride: (currentConfig) => currentConfig,
    });
    console.log('✅ Bundle listo');

    // 4. Seleccionar composición
    console.log(`🎯 Composición: ${config.compositionId}`);
    const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: config.compositionId,
        inputProps: {
            procedure: procedureData,
        },
    });

    // 5. Renderizar video
    const outputFile = config.outputFile || path.join(
        DEFAULTS.outputDir,
        `${procedureData.id || 'procedimiento'}.mp4`
    );

    // Asegurar que el directorio de salida existe
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`\n🎬 Renderizando video...`);
    console.log(`   Resolución: ${composition.width}x${composition.height}`);
    console.log(`   FPS: ${composition.fps}`);
    console.log(`   Duración: ${(composition.durationInFrames / composition.fps).toFixed(1)}s`);
    console.log(`   Salida: ${outputFile}`);
    console.log('');

    await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: DEFAULTS.codec,
        outputLocation: outputFile,
        inputProps: {
            procedure: procedureData,
        },
        onProgress: ({ progress }) => {
            const pct = Math.floor(progress * 100);
            process.stdout.write(`\r   Progreso: ${'█'.repeat(Math.floor(pct / 2))}${'░'.repeat(50 - Math.floor(pct / 2))} ${pct}%`);
        },
    });

    console.log('\n');
    console.log('━'.repeat(50));
    console.log(`✅ ¡Video generado exitosamente!`);
    console.log(`📍 ${outputFile}`);
    console.log(`📏 ${(fs.statSync(outputFile).size / 1024 / 1024).toFixed(1)} MB`);
    console.log('');
}

main().catch((err) => {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
});
