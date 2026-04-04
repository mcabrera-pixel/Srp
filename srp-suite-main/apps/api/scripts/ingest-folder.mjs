#!/usr/bin/env node
// ============================================================================
// ingest-folder.mjs
//
// Lee todos los documentos de una carpeta (PDF, DOCX, TXT, MD, JSON)
// y los envía al servidor local para que los procese y vectorice.
//
// Uso:
//   node scripts/ingest-folder.mjs                      (usa ./docs por defecto)
//   node scripts/ingest-folder.mjs ./mis-documentos
//   node scripts/ingest-folder.mjs ./docs --dry-run     (solo lista archivos)
//
// Convención de tipos por nombre de archivo:
//   *procedimiento* | *procedure* | *POE* → approved_procedure
//   *prototipo*     | *template*  | *plantilla* → prototype
//   *critico*       | *critical*  | *fatality* → risk_critical
//   *reglamento*    | *norma*     | *DS*        → regulation
//   (cualquier otro)                           → risk_general
// ============================================================================

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';
import mammoth from 'mammoth';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

// ── Config ────────────────────────────────────────────────────────────────────
const SERVER_URL = process.env.LOCAL_SERVER ?? 'http://localhost:3000';
const docsDir    = process.argv[2] ?? '../../docs/procedimientos';
const dryRun     = process.argv.includes('--dry-run');

// ── Tipo de documento ─────────────────────────────────────────────────────────
// Prioridad: subcarpeta > nombre de archivo
function detectType(filePath) {
  const normalized = filePath.replace(/\\/g, '/').toLowerCase();
  const filename   = basename(filePath).toLowerCase();

  // Por subcarpeta
  if (normalized.includes('/procedimientos/'))    return 'approved_procedure';
  if (normalized.includes('/riesgos-fatales/'))   return 'risk_critical';
  if (normalized.includes('/riesgos/'))           return 'risk_general';
  if (normalized.includes('/regulacion/') ||
      normalized.includes('/reglamentos/'))       return 'regulation';

  // Por nombre de archivo (fallback)
  if (/procedimiento|procedure|poe|paso\s*a\s*paso/.test(filename)) return 'approved_procedure';
  if (/critico|critical|fatality|fatalidad/.test(filename))          return 'risk_critical';
  if (/reglamento|norma|ds\s*\d|estandar/.test(filename))           return 'regulation';
  return 'risk_general';
}

// ── Extracción de texto ───────────────────────────────────────────────────────
async function extractText(filePath) {
  const ext = extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    const buffer = readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === '.docx') {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  if (['.txt', '.md'].includes(ext)) {
    return readFileSync(filePath, 'utf8');
  }

  // JSON con campo "content" (por ejemplo el generated.json exportado de D1)
  if (ext === '.json') {
    const raw = JSON.parse(readFileSync(filePath, 'utf8'));
    // Acepta { content: string } | { content: { objetivo, alcance, ... } }
    if (typeof raw.content === 'string') return raw.content;
    if (typeof raw.content === 'object') return JSON.stringify(raw.content, null, 2);
    if (typeof raw === 'string') return raw;
    return JSON.stringify(raw, null, 2);
  }

  return null;
}

// ── Enviar al servidor ────────────────────────────────────────────────────────
async function ingest(name, type, content) {
  const res = await fetch(`${SERVER_URL}/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, type, content }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }
  return res.json();
}

// ── Escaneo recursivo ─────────────────────────────────────────────────────────
function listFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...listFiles(full));
    } else {
      const ext  = extname(full).toLowerCase();
      const base = basename(full).toLowerCase();
      if (base === 'leeme.txt' || base === 'readme.txt' || base === 'readme.md') continue;
      if (['.pdf', '.docx', '.txt', '.md', '.json'].includes(ext)) {
        results.push(full);
      }
    }
  }
  return results;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  if (!existsSync(docsDir)) {
    console.error(`❌  Carpeta no encontrada: ${docsDir}`);
    console.error(`    Crea la carpeta y coloca tus documentos (PDF/DOCX/TXT):  mkdir docs`);
    process.exit(1);
  }

  const files = listFiles(docsDir);
  if (files.length === 0) {
    console.log(`⚠️  No hay documentos en ${docsDir}`);
    process.exit(0);
  }

  console.log(`\n📂  Carpeta: ${docsDir}`);
  console.log(`📡  Servidor: ${SERVER_URL}`);
  console.log(`📄  Archivos encontrados: ${files.length}\n`);

  if (dryRun) {
    for (const f of files) {
      console.log(`  [${detectType(f).padEnd(20)}]  ${f.replace(docsDir, '').replace(/^[\\/]/, '')}`);
    }
    console.log('\n(dry-run: ningún archivo fue enviado)');
    return;
  }

  let ok = 0;
  let fail = 0;

  for (const filePath of files) {
    const name = basename(filePath);
    const type = detectType(filePath);   // pasa ruta completa para detectar subcarpeta
    process.stdout.write(`  📄 ${name.padEnd(50)} [${type}]  `);

    try {
      const content = await extractText(filePath);
      if (!content || content.trim().length < 30) {
        console.log('⚠️  muy corto, saltado');
        continue;
      }

      const result = await ingest(name, type, content.trim());
      console.log(`✅  id=${result.id}`);
      ok++;
    } catch (err) {
      console.log(`❌  ${err.message}`);
      fail++;
    }
  }

  console.log(`\n✅ Completados: ${ok}   ❌ Fallidos: ${fail}`);
  if (fail > 0) console.log('   (verifica que el servidor esté corriendo: npm run dev)');
}

main();
