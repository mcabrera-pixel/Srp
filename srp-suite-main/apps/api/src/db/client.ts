// ============================================================================
// DB Client - node:sqlite (built-in desde Node.js 22.5+, sin compilación nativa)
// ============================================================================

import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let _db: DatabaseSync | null = null;

/**
 * Devuelve la instancia singleton de la base de datos SQLite.
 * Usa el módulo nativo `node:sqlite` de Node.js 22+ (sin compilación).
 */
export function getDb(dbPath: string): DatabaseSync {
  if (_db) return _db;

  // Crear directorio si no existe
  const dir = dirname(dbPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  _db = new DatabaseSync(dbPath);

  // Performance pragmas
  _db.exec('PRAGMA journal_mode = WAL');
  _db.exec('PRAGMA foreign_keys = ON');

  // Inicializar schema
  const schemaPath = join(__dirname, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  _db.exec(schema);

  // Migrations for existing DBs (safe to run multiple times — ALTER TABLE is idempotent via try/catch)
  const migrations = [
    `ALTER TABLE procedure_requests ADD COLUMN step_evaluations TEXT`,
    // worker_profiles and feedback_entries created via schema (IF NOT EXISTS) above
  ];
  for (const migration of migrations) {
    try { _db.exec(migration); } catch { /* column already exists — ignore */ }
  }

  console.log(`[DB] Conectado a: ${dbPath}`);
  return _db;
}

export default getDb;
