// ============================================================================
// Fatality Risk Service — igual que Worker, usa better-sqlite3
// ============================================================================

import { LocalEnv } from '../types.js';
import { callClaude } from './llm.js';
import { RiesgoItem } from './docx-generator.js';
import { getPrompt } from './prompt-store.js';

export interface FatalityRisk {
  id: string;
  code: string;
  name: string;
  full_title: string;
  scope: string;
  exclusions: string;
}

export interface FatalityRiskControl {
  id: string;
  risk_code: string;
  control_code: string;
  control_name: string;
  objective: string;
}

export async function getAllFatalityRisks(env: LocalEnv): Promise<FatalityRisk[]> {
  return env.db
    .prepare('SELECT id, code, name, full_title, scope, exclusions FROM fatality_risks ORDER BY code')
    .all() as unknown as FatalityRisk[];
}

export async function getRisksByCodes(codes: string[], env: LocalEnv): Promise<FatalityRisk[]> {
  if (codes.length === 0) return [];
  const placeholders = codes.map(() => '?').join(', ');
  return (env.db.prepare(`SELECT id, code, name, full_title, scope, exclusions FROM fatality_risks WHERE code IN (${placeholders}) ORDER BY code`) as any).all(...codes) as unknown as FatalityRisk[];
}

export async function getControlsForRisk(riskCode: string, env: LocalEnv): Promise<FatalityRiskControl[]> {
  return env.db
    .prepare('SELECT * FROM fatality_risk_controls WHERE risk_code = ? ORDER BY control_code')
    .all(riskCode) as unknown as FatalityRiskControl[];
}

export async function getRiesgosForProcedure(riskCodes: string[], env: LocalEnv): Promise<RiesgoItem[]> {
  const risks = await getRisksByCodes(riskCodes, env);
  const riesgos: RiesgoItem[] = [];

  for (const risk of risks) {
    const controls = await getControlsForRisk(risk.code, env);
    const preventivos = controls.filter(c => c.control_code.startsWith('P')).map(c => c.control_name).join('; ');
    const mitigadores  = controls.filter(c => c.control_code.startsWith('M')).map(c => c.control_name).join('; ');

    riesgos.push({
      codigo: risk.code,
      nombre: risk.full_title || risk.name,
      controles_preventivos: preventivos || 'Ver estándar de control crítico',
      controles_mitigadores: mitigadores || 'Ver estándar de control crítico',
    });
  }

  return riesgos;
}

export async function getZoneRisks(zone: string, env: LocalEnv): Promise<RiesgoItem[]> {
  const rows = env.db
    .prepare('SELECT * FROM zone_risks WHERE zone = ?')
    .all(zone) as unknown as { id: string; zone: string; risk_code: string; controls: string }[];

  return rows.map(r => ({
    codigo: r.risk_code,
    nombre: r.risk_code,
    controles_preventivos: r.controls ?? '',
    controles_mitigadores: '',
  }));
}

/**
 * Selecciona los riesgos relevantes para el procedimiento via LLM
 */
export async function getAllRisksForProcedure(
  taskDescription: string,
  zone: string | null,
  env: LocalEnv
): Promise<RiesgoItem[]> {
  const allRisks = await getAllFatalityRisks(env);

  if (allRisks.length === 0) {
    console.log('[FatalityRisk] No risks in DB, returning empty array');
    return [];
  }

  const riskList = allRisks.map(r => `${r.code}: ${r.name} — ${r.scope}`).join('\n');

  const prompt = getPrompt('risk_selector.user', {
    taskDescription: taskDescription.substring(0, 500),
    riskList,
  });

  let selectedCodes: string[] = [];
  try {
    const response = await callClaude(prompt, env, getPrompt('risk_selector.system'));
    const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
    selectedCodes = JSON.parse(cleaned);
  } catch {
    console.warn('[FatalityRisk] Could not parse LLM risk selection, using top 5');
    selectedCodes = allRisks.slice(0, 5).map(r => r.code);
  }

  let riesgos = await getRiesgosForProcedure(selectedCodes, env);

  // Agregar riesgos de zona si aplica
  if (zone) {
    const zoneRiesgos = await getZoneRisks(zone, env);
    const zoneCodes = new Set(riesgos.map(r => r.codigo));
    for (const zr of zoneRiesgos) {
      if (!zoneCodes.has(zr.codigo)) riesgos.push(zr);
    }
  }

  return riesgos;
}
