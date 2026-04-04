// ============================================================================
// Gap Analyzer — adaptado para LocalEnv
// ============================================================================

import { LocalEnv, TaskStep } from '../types.js';
import {
  createGenerationPlan,
  getPlanByRequest,
  getPendingFields,
  GenerationPlan,
  PrototypeSection,
} from './generation-plan-service.js';

export interface GapAnalysisResult {
  hasGaps: boolean;
  questions: string[];
  feedback: string;
  plan?: GenerationPlan;
}

export async function analyzeTaskGaps(
  description: string,
  currentSteps: TaskStep[],
  env: LocalEnv,
  requestId?: string
): Promise<GapAnalysisResult> {
  console.log(`[GapAnalyzer] Analyzing gaps for ${currentSteps.length} steps`);

  let plan: GenerationPlan | null = null;
  if (requestId) {
    plan = await getPlanByRequest(requestId, env);
    if (!plan) {
      plan = await createGenerationPlan(requestId, description, env);
    }
  }

  if (plan && plan.completeness >= 100) {
    return { hasGaps: false, questions: [], feedback: 'Información completa', plan };
  }

  const pendingFields = plan ? getPendingFields(plan) : [];

  if (plan && pendingFields.length > 0 && pendingFields.length <= 3) {
    const questions = pendingFields.map(f => formatQuestion(f));
    return { hasGaps: true, questions, feedback: 'Faltan datos', plan };
  }

  // More than 3 pending: ask only first one
  if (plan && pendingFields.length > 0) {
    return {
      hasGaps: true,
      questions: [formatQuestion(pendingFields[0])],
      feedback: `Faltan ${pendingFields.length} secciones`,
      plan,
    };
  }

  return { hasGaps: false, questions: [], feedback: 'Información completa', plan: plan ?? undefined };
}

function formatQuestion(field: PrototypeSection): string {
  return field.question ?? `¿Puedes proporcionar información sobre ${field.label.toLowerCase()}?`;
}
