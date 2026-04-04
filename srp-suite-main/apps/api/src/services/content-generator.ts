// ============================================================================
// Content Generator — igual que Worker, solo cambia LocalEnv
// ============================================================================

import { LocalEnv, TaskStep } from '../types.js';
import { callClaude } from './llm.js';
import { ProcedureSections } from './docx-generator.js';
import { getPrompt } from './prompt-store.js';

export async function generateSectionContent(
  taskDescription: string,
  taskSteps: TaskStep[],
  riskContext: string[],
  approvedContext: string[],
  env: LocalEnv
): Promise<Partial<ProcedureSections>> {
  console.log('[ContentGenerator] Generating section content with LLM...');

  const prompt = getPrompt('content_generator.user', {
    taskDescription,
    taskSteps:       JSON.stringify(taskSteps, null, 2),
    riskContext:     riskContext.slice(0, 2).map(c => c.substring(0, 400)).join('\n\n---\n\n'),
    approvedContext: approvedContext.slice(0, 1).map(c => c.substring(0, 400)).join('\n\n---\n\n') || 'No hay procedimientos similares disponibles.',
  });

  const systemPrompt = getPrompt('content_generator.system');

  // Generation can be slow with large prompts — allow up to 5 minutes
  const response = await callClaude(prompt, env, systemPrompt, 300_000);
  const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();

  let content: any;
  try {
    content = JSON.parse(cleaned);
  } catch {
    console.warn('[ContentGenerator] JSON parse failed, attempting repair...');
    let repaired = cleaned;
    const quoteCount = (repaired.match(/"/g) || []).length;
    if (quoteCount % 2 !== 0) repaired += '"';
    const openBraces = (repaired.match(/{/g) || []).length;
    const closeBraces = (repaired.match(/}/g) || []).length;
    for (let i = 0; i < openBraces - closeBraces; i++) repaired += '}';
    repaired = repaired.replace(/,\s*}/g, '}');
    content = JSON.parse(repaired);
  }

  console.log('[ContentGenerator] Content generated');
  return content;
}

// Prompts managed via prompt-store — edit at runtime via /api/prompts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function buildContentPrompt(
  taskDescription: string,
  taskSteps: TaskStep[],
  riskContext: string[],
  approvedContext: string[]
): string {
  return `
Genera el contenido para un procedimiento minero basándote en la siguiente información.
Todo el contenido debe estar en español chileno. Ningún texto en otro idioma.

## DESCRIPCIÓN DE LA TAREA
${taskDescription}

## PASOS DE LA TAREA IDENTIFICADOS
${JSON.stringify(taskSteps, null, 2)}

## CONTEXTO DE RIESGOS (de matrices de riesgo)
${riskContext.slice(0, 2).map(c => c.substring(0, 400)).join('\n\n---\n\n')}

## PROCEDIMIENTOS SIMILARES APROBADOS
${approvedContext.slice(0, 1).map(c => c.substring(0, 400)).join('\n\n---\n\n') || 'No hay procedimientos similares disponibles.'}

## FORMATO DE SALIDA (JSON)
{
  "objetivo": "Texto del objetivo",
  "alcance": "Texto del alcance",
  "responsabilidades": "Responsabilidades por cargo",
  "definiciones": "Términos y definiciones",
  "epp_equipos": {
    "EPP": ["Ítem 1", "Ítem 2"],
    "Equipos_Herramientas": ["Herramienta 1"],
    "Insumos": ["Insumo 1"]
  },
  "competencias": "Competencias requeridas",
  "descripcion_tarea": [
    { "titulo": "Paso 1: Nombre", "contenido": "- Sub-paso 1\\n- Sub-paso 2" }
  ],
  "bloqueo_energias": "Procedimiento de bloqueo si aplica",
  "peligros_controles": [
    { "Peligro": "Descripción peligro", "Riesgo": "Descripción riesgo", "Control": "Medida de control" }
  ],
  "emergencias": "Procedimiento de emergencia",
  "medio_ambiente": "Consideraciones ambientales",
  "registros": ["Registro 1", "Registro 2"],
  "referencias": ["DS N°132", "Norma X"],
  "evaluacion": "Criterio de evaluación"
}

Responde SOLO con el JSON.
`;
}
