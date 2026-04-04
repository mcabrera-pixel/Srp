#!/usr/bin/env node
// ============================================================================
// seed-risks.mjs
//
// Siembra la base de datos local con los riesgos de fatalidad y matriz POX
// desde los archivos JSON del proyecto original.
//
// Uso:
//   node scripts/seed-risks.mjs
//   node scripts/seed-risks.mjs --db ./data/mining-rag.db
// ============================================================================

import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { DatabaseSync } from 'node:sqlite';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

// ── Config ────────────────────────────────────────────────────────────────────
const dbArg   = process.argv.indexOf('--db');
const DB_PATH = dbArg !== -1 ? process.argv[dbArg + 1] : './data/mining-rag.db';

// Busca los JSON en el proyecto original o en el mismo proyecto local
function findJson(candidates) {
  for (const c of candidates) {
    const p = resolve(c);
    if (existsSync(p)) return p;
  }
  return null;
}

const FATALITY_RISKS_PATH = findJson([
  '../../data/seed/fatality-risks.json',
  './data/fatality-risks.json',
  '../data/fatality-risks.json',
]);

const POX_RISKS_PATH = findJson([
  '../../data/seed/pox-risks.json',
  './data/pox-risks.json',
  '../data/pox-risks.json',
]);

// ── Abrir DB ──────────────────────────────────────────────────────────────────
if (!existsSync(DB_PATH)) {
  console.error(`❌  Base de datos no encontrada: ${DB_PATH}`);
  console.error('    Inicia el servidor primero (npm run dev) para que se cree automáticamente.');
  process.exit(1);
}

const db = new DatabaseSync(DB_PATH);
console.log(`🗄️  Base de datos: ${DB_PATH}\n`);

// ── Seed fatality risks ───────────────────────────────────────────────────────
function seedFatalityRisks() {
  if (!FATALITY_RISKS_PATH) {
    console.log('⚠️  fatality-risks.json no encontrado, saltando riesgos de fatalidad.');
    console.log('   Buscado en: ../mining-rag/data/ y ./data/');
    return;
  }

  const risks = JSON.parse(readFileSync(FATALITY_RISKS_PATH, 'utf8'));
  console.log(`📋  Sembrando ${risks.length} riesgos de fatalidad desde ${FATALITY_RISKS_PATH}...`);

  const upsertRisk = db.prepare(`
    INSERT INTO fatality_risks (id, code, name, full_title, scope, exclusions)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(code) DO UPDATE SET
      name = excluded.name,
      full_title = excluded.full_title,
      scope = excluded.scope,
      exclusions = excluded.exclusions
  `);

  const upsertControl = db.prepare(`
    INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(risk_code, control_code) DO UPDATE SET
      control_name = excluded.control_name,
      objective = excluded.objective
  `);

  let riskCount = 0;
  let controlCount = 0;

  for (const risk of risks) {
    const id = crypto.randomUUID();
    upsertRisk.run(id, risk.code, risk.name, risk.full_title ?? '', risk.scope ?? '', risk.exclusions ?? '');
    riskCount++;

    for (const ctrl of (risk.controls ?? [])) {
      const ctrlId = crypto.randomUUID();
      upsertControl.run(ctrlId, risk.code, ctrl.control_code, ctrl.control_name, ctrl.objective ?? '');
      controlCount++;
    }
  }

  console.log(`   ✅  ${riskCount} riesgos,  ${controlCount} controles\n`);
}

// ── Seed POX risks ────────────────────────────────────────────────────────────
function seedPoxRisks() {
  if (!POX_RISKS_PATH) {
    console.log('⚠️  pox-risks.json no encontrado, saltando riesgos POX.');
    return;
  }

  // Verificar que la tabla existe
  const tableExists = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' AND name='zone_risks'
  `).get();

  if (!tableExists) {
    console.log('⚠️  Tabla zone_risks no existe, saltando riesgos POX.');
    return;
  }

  const poxData = JSON.parse(readFileSync(POX_RISKS_PATH, 'utf8'));
  const items = Array.isArray(poxData) ? poxData : poxData.risks ?? [];
  console.log(`📋  Sembrando ${items.length} entradas de riesgos POX desde ${POX_RISKS_PATH}...`);

  const upsert = db.prepare(`
    INSERT INTO zone_risks (id, zone, risk_code, controls)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(zone, risk_code) DO UPDATE SET controls = excluded.controls
  `);

  let count = 0;
  for (const item of items) {
    const id = crypto.randomUUID();
    upsert.run(id, item.zone ?? item.area ?? '', item.risk_code ?? item.code ?? '', JSON.stringify(item.controls ?? []));
    count++;
  }

  console.log(`   ✅  ${count} entradas POX\n`);
}

// ── Resumen ───────────────────────────────────────────────────────────────────
function printSummary() {
  const risks    = db.prepare('SELECT COUNT(*) as n FROM fatality_risks').get();
  const controls = db.prepare('SELECT COUNT(*) as n FROM fatality_risk_controls').get();
  const docs     = db.prepare('SELECT COUNT(*) as n FROM base_documents').get();
  const zoneRisks = db.prepare("SELECT COUNT(*) as n FROM sqlite_master WHERE type='table' AND name='zone_risks'").get();

  console.log('📊  Estado de la base de datos:');
  console.log(`   fatality_risks:          ${risks.n}`);
  console.log(`   fatality_risk_controls:  ${controls.n}`);
  console.log(`   base_documents (RAG):    ${docs.n}`);
  if (zoneRisks.n > 0) {
    const zr = db.prepare('SELECT COUNT(*) as n FROM zone_risks').get();
    console.log(`   zone_risks:              ${zr.n}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
seedFatalityRisks();
seedPoxRisks();
printSummary();

db.close();
console.log('\n✅  Seed completado.');
