#!/usr/bin/env node

/**
 * generate-procedure.js
 *
 * Converts a CODELCO procedure .md file into a Remotion-compatible
 * TypeScript data file following the Procedure interface.
 *
 * Usage:
 *   node scripts/generate-procedure.js <input.md> [output.ts]
 *
 * What it does:
 *   1. Reads and parses the .md procedure
 *   2. Extracts sections (Objetivo, EPP, Pasos, Riesgos, Emergencias)
 *   3. Generates a TypeScript file with the Procedure data structure
 *   4. Each section becomes a ProcedureStep with appropriate timing
 *
 * The generated file can be imported in Root.tsx and used with any composition
 * (ProcedureVideo, WhiteboardProcedureVideo, ProProcedureVideo).
 */

import * as fs from 'fs';
import * as path from 'path';

// ── Section mapping: what sections to extract from a CODELCO procedure ──
const SECTION_MAP = [
    {
        pattern: /^##\s+1\.\s*OBJETIVO/i,
        endPattern: /^##\s+2\./,
        title: 'Objetivo y Alcance',
        duration: 12,
        riesgo: 'medio',
        epp: ['casco', 'lentes', 'zapatos'],
    },
    {
        pattern: /^##\s+5\.\s*EPP/i,
        endPattern: /^##\s+6\./,
        title: 'EPP Específico',
        duration: 15,
        riesgo: 'alto',
        epp: ['casco', 'lentes', 'guantes', 'zapatos', 'arnes', 'respirador'],
    },
    {
        pattern: /^##\s+7\.\s*DESCRIPCI[OÓ]N/i,
        endPattern: /^##\s+8\./,
        title: 'Descripción de la Tarea',
        duration: 30,
        riesgo: 'alto',
        epp: ['casco', 'lentes', 'guantes', 'zapatos', 'arnes'],
    },
    {
        pattern: /^##\s+8\.\s*IDENTIFICACI[OÓ]N DE RIESGOS/i,
        endPattern: /^##\s+9\./,
        title: 'Riesgos Críticos',
        duration: 25,
        riesgo: 'critico',
        epp: ['casco', 'lentes', 'guantes', 'zapatos', 'arnes', 'respirador', 'protector_auditivo'],
    },
    {
        pattern: /^##\s+10\.\s*AVISO.*EMERGENCIA/i,
        endPattern: /^##\s+11\./,
        title: 'Emergencias',
        duration: 12,
        riesgo: 'critico',
        epp: ['casco', 'lentes'],
    },
    {
        pattern: /^##\s+11\.\s*MEDIO AMBIENTE/i,
        endPattern: /^##\s+12\./,
        title: 'Medio Ambiente y Cierre',
        duration: 10,
        riesgo: 'medio',
        epp: ['casco'],
    },
];

// ── Helper: extract text between two section headers ──
function extractSection(lines, startPattern, endPattern) {
    let capturing = false;
    const sectionLines = [];

    for (const line of lines) {
        if (startPattern.test(line)) {
            capturing = true;
            continue;
        }
        if (capturing && endPattern && endPattern.test(line)) {
            break;
        }
        if (capturing) {
            sectionLines.push(line);
        }
    }

    return sectionLines
        .filter(l => l.trim() !== '' && !l.startsWith('---') && !l.startsWith('|'))
        .map(l => l.replace(/^[#\-*]+\s*/, '').replace(/\*\*/g, '').trim())
        .filter(l => l.length > 0)
        .join(' ')
        .substring(0, 600); // Cap content length for narration
}

// ── Helper: extract procedure title and code ──
function extractTitle(lines) {
    let titulo = 'Procedimiento de Trabajo';
    let subtitulo = '';

    for (const line of lines) {
        if (line.startsWith('# ') && !titulo.includes('PROCEDIMIENTO')) {
            const text = line.replace(/^#+\s*/, '').trim();
            if (text.includes('PROCEDIMIENTO')) continue;
            titulo = text;
        }
        if (line.startsWith('## Código:') || line.startsWith('## Código')) {
            subtitulo = line.replace(/^#+\s*/, '').replace('Código:', '').trim();
        }
    }

    return { titulo, subtitulo };
}

// ── Helper: generate a safe ID from the title ──
function generateId(titulo) {
    return 'proc-' + titulo
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 40);
}

// ── Main: convert .md to Procedure TypeScript ──
function generateProcedure(inputPath) {
    const content = fs.readFileSync(inputPath, 'utf-8');
    const lines = content.split(/\r?\n/);

    const { titulo, subtitulo } = extractTitle(lines);
    const id = generateId(titulo);

    const pasos = [];
    let stepNum = 1;

    for (const section of SECTION_MAP) {
        const sectionContent = extractSection(lines, section.pattern, section.endPattern);
        if (sectionContent.length > 20) {
            pasos.push({
                numero: stepNum,
                titulo: section.title,
                contenido: sectionContent,
                duracion: section.duration,
                riesgo: section.riesgo,
                epp: section.epp,
            });
            stepNum++;
        }
    }

    // Calculate total duration
    const duracionTotal = pasos.reduce((sum, p) => sum + p.duracion, 0);

    return {
        id,
        titulo,
        subtitulo,
        duracion_total: duracionTotal,
        metadata: {
            version: '1.0',
            fecha_vigencia: new Date().toISOString().split('T')[0],
            normativa: ['DS 132', 'DS 594'],
        },
        pasos,
    };
}

// ── Generate TypeScript output ──
function toTypeScript(procedure, varName) {
    const pasosStr = procedure.pasos.map(p => {
        const eppStr = p.epp.map(e => `'${e}'`).join(', ');
        return `        {
            numero: ${p.numero},
            titulo: '${p.titulo.replace(/'/g, "\\'")}',
            contenido:
                '${p.contenido.replace(/'/g, "\\'")}',
            duracion: ${p.duracion},
            riesgo: '${p.riesgo}',
            epp: [${eppStr}],
        }`;
    }).join(',\n\n');

    const normStr = procedure.metadata.normativa.map(n => `'${n}'`).join(', ');

    return `import { Procedure } from '../types';

// Auto-generated from: ${path.basename(process.argv[2] || 'input.md')}
// Generated at: ${new Date().toISOString()}
export const ${varName}: Procedure = {
    id: '${procedure.id}',
    titulo: '${procedure.titulo.replace(/'/g, "\\'")}',
    subtitulo: '${procedure.subtitulo.replace(/'/g, "\\'")}',
    duracion_total: ${procedure.duracion_total},
    metadata: {
        version: '${procedure.metadata.version}',
        fecha_vigencia: '${procedure.metadata.fecha_vigencia}',
        normativa: [${normStr}],
    },
    pasos: [
${pasosStr},
    ],
};
`;
}

// ── CLI entry point ──
function main() {
    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.log(`
🎬 SRP Learn — Procedure to Remotion Data Generator

Usage:
  npx tsx scripts/generate-procedure.ts <input.md> [output.ts] [--var-name=NAME]

Example:
  npx tsx scripts/generate-procedure.ts ../../Procedimiento_PRO_0908_MPEF1.md src/data/compresor-c701-auto.ts

Options:
  input.md      Path to the CODELCO procedure .md file
  output.ts     Path for the generated TypeScript file (default: stdout)
  --var-name    Variable name for the export (default: auto-generated)
`);
        process.exit(1);
    }

    const inputPath = path.resolve(args[0]);

    if (!fs.existsSync(inputPath)) {
        console.error(`❌ File not found: ${inputPath}`);
        process.exit(1);
    }

    // Parse the procedure
    console.log(`📄 Reading: ${inputPath}`);
    const procedure = generateProcedure(inputPath);
    console.log(`✅ Extracted ${procedure.pasos.length} sections from "${procedure.titulo}"`);

    // Variable name
    let varName = args.find(a => a.startsWith('--var-name='));
    if (varName) {
        varName = varName.split('=')[1];
    } else {
        varName = 'PROCEDURE_' + procedure.id
            .replace('proc-', '')
            .toUpperCase()
            .replace(/-/g, '_');
    }

    // Generate TypeScript
    const tsContent = toTypeScript(procedure, varName);

    // Output
    const outputPath = args.find(a => !a.startsWith('--') && a !== args[0]);
    if (outputPath) {
        const absOutput = path.resolve(outputPath);
        const dir = path.dirname(absOutput);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(absOutput, tsContent, 'utf-8');
        console.log(`📦 Written: ${absOutput}`);
        console.log(`\n💡 Next steps:`);
        console.log(`   1. Import in Root.tsx: import { ${varName} } from './data/${path.basename(absOutput, '.ts')}';`);
        console.log(`   2. Add Composition entries (basic, pizarra, pro)`);
        console.log(`   3. Run: npx remotion studio`);
    } else {
        console.log('\n--- Generated TypeScript ---\n');
        console.log(tsContent);
    }
}

main();
