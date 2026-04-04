// ============================================================================
// Risk Analyzer — igual que Worker, solo cambia LocalEnv
// ============================================================================

import { LocalEnv, TaskStep, RiskAnalysis } from '../types.js';
import { callClaude } from './llm.js';

export async function analyzeRisks(
  taskSteps: TaskStep[],
  riskContext: string[],
  env: LocalEnv
): Promise<RiskAnalysis> {
  console.log(`[RiskAnalyzer] Analyzing ${taskSteps.length} steps`);

  const prompt = `
Analiza los siguientes pasos de una tarea minera e identifica TODOS los riesgos asociados.

PASOS:
${JSON.stringify(taskSteps, null, 2)}

CONTEXTO DE RIESGOS:
${riskContext.join('\n\n---\n\n')}

FORMATO DE SALIDA (JSON):
{
  "critical_risks": [
    { "description": "...", "severity": "fatal", "probability": "medium", "controls": ["..."], "ppe_required": ["..."] }
  ],
  "general_risks": [
    { "description": "...", "severity": "medium", "probability": "high", "controls": ["..."], "ppe_required": ["..."] }
  ],
  "mitigation_measures": ["medida 1", "medida 2"],
  "ppe_summary": ["Casco", "Guantes", "Lentes"]
}

Responde SOLO con JSON.`;

  try {
    const response = await callClaude(prompt, env, 'Eres un experto en seguridad minera chilena. Responde SIEMPRE en español.');
    const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as RiskAnalysis;
  } catch {
    return {
      critical_risks: [],
      general_risks: [],
      mitigation_measures: ['Revisar con experto en seguridad'],
      ppe_summary: ['Casco', 'Guantes', 'Lentes de seguridad'],
    };
  }
}
