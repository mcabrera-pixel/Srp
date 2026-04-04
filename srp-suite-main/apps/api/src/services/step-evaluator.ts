// ============================================================================
// Step Evaluator — evaluates each TaskStep for clarity and requests user input
// when a step is not sufficiently detailed.
// ============================================================================

import { TaskStep, LocalEnv, StepEvaluation, StepEvalState } from '../types.js';
import { callClaude } from './llm.js';
import { getPrompt } from './prompt-store.js';

// ── Constants ─────────────────────────────────────────────────────────────────
/** Minimum score (0-10) for a step to be considered sufficiently detailed */
const PASS_SCORE = 7;

// ── Initialisation ────────────────────────────────────────────────────────────

export function initEvalState(steps: TaskStep[]): StepEvalState {
  return {
    evaluations: steps.map((s, i) => ({
      stepIndex: i,
      originalDesc: s.description,
      score: 0,
      issues: [],
      pendingQuestion: null,
      refinedDesc: null,
      status: 'pending',
    })),
    currentIndex: 0,
    awaitingRefinement: false,
  };
}

// ── LLM evaluation ────────────────────────────────────────────────────────────

export interface EvalResult {
  score: number;     // 1-10
  issues: string[];  // specific problems, max 3
  question: string;  // the exact question to ask the user if score < PASS_SCORE
}

export async function evaluateStep(
  step: TaskStep,
  stepNumber: number,
  totalSteps: number,
  procedureContext: string,
  env: LocalEnv
): Promise<EvalResult> {
  const prompt = getPrompt('step_evaluator.user', {
    procedureContext:    procedureContext.substring(0, 300),
    stepNumber:          String(stepNumber),
    totalSteps:          String(totalSteps),
    stepDescription:     step.description,
    estimatedDuration:   step.estimated_duration    || 'no especificada',
    requiresSupervision: step.requires_supervision  ? 'sí' : 'no',
    equipmentNeeded:     step.equipment_needed?.length ? step.equipment_needed.join(', ') : 'no especificados',
    safetyNotes:         step.safety_notes           || 'ninguna',
  });

  try {
    const response = await callClaude(prompt, env, getPrompt('step_evaluator.system'));
    const match = response.match(/\{[\s\S]*?\}/);
    if (!match) throw new Error('No JSON found');
    const parsed = JSON.parse(match[0]) as EvalResult;
    // sanitise
    return {
      score: Math.max(1, Math.min(10, Math.round(parsed.score ?? 6))),
      issues: Array.isArray(parsed.issues) ? parsed.issues.slice(0, 3) : [],
      question: parsed.question ?? '',
    };
  } catch (err) {
    console.warn('[StepEval] LLM evaluation failed, defaulting to OK:', err);
    return { score: 8, issues: [], question: '' }; // fail-safe: mark as OK
  }
}

// ── State transitions ─────────────────────────────────────────────────────────

/** Mark current step as OK and advance */
export function markStepOk(state: StepEvalState, score: number): StepEvalState {
  const next: StepEvalState = {
    ...state,
    evaluations: state.evaluations.map((e, i) =>
      i === state.currentIndex ? { ...e, score, status: 'ok' } : e
    ),
    currentIndex: state.currentIndex + 1,
    awaitingRefinement: false,
  };
  return next;
}

/** Record that current step needs detail, set awaitingRefinement */
export function markStepNeedsDetail(
  state: StepEvalState,
  score: number,
  issues: string[],
  question: string,
): StepEvalState {
  return {
    ...state,
    evaluations: state.evaluations.map((e, i) =>
      i === state.currentIndex ? { ...e, score, issues, pendingQuestion: question, status: 'needs_detail' } : e
    ),
    awaitingRefinement: true,
  };
}

/** Apply user's refinement text (augments originalDesc) and advance to next step */
export function applyRefinement(state: StepEvalState, refinedText: string): StepEvalState {
  const ev = state.evaluations[state.currentIndex];
  // Merge: keep original desc + append the user's clarification so the final step is richer
  const merged = ev
    ? `${ev.originalDesc} [Aclaración: ${refinedText}]`
    : refinedText;
  return {
    ...state,
    evaluations: state.evaluations.map((e, i) =>
      i === state.currentIndex
        ? { ...e, refinedDesc: merged, pendingQuestion: null, status: 'refined' }
        : e
    ),
    currentIndex: state.currentIndex + 1,
    awaitingRefinement: false,
  };
}

/** Returns true when every step has been evaluated (OK or refined) */
export function isAllEvaluated(state: StepEvalState): boolean {
  return state.evaluations.every(e => e.status === 'ok' || e.status === 'refined');
}

/** Merges refined descriptions back into the original task steps */
export function mergeRefinedSteps(steps: TaskStep[], state: StepEvalState): TaskStep[] {
  return steps.map((s, i) => {
    const ev = state.evaluations[i];
    return ev?.refinedDesc ? { ...s, description: ev.refinedDesc } : s;
  });
}

/** Build the progress header shown to the user during review */
export function buildProgressHeader(state: StepEvalState): string {
  const total = state.evaluations.length;
  const done  = state.evaluations.filter(e => e.status === 'ok' || e.status === 'refined').length;
  const icons = state.evaluations.map(e =>
    e.status === 'ok' ? '✅' :
    e.status === 'refined' ? '✏️' :
    e.status === 'needs_detail' ? '⚠️' : '⏳'
  ).join(' ');
  return `📊 Revisión de pasos: ${done}/${total}\n${icons}`;
}

/** Returns pass threshold for external use */
export const EVAL_PASS_SCORE = PASS_SCORE;

// ── Refinement validation ──────────────────────────────────────────────────

export interface ValidationResult {
  ok: boolean;
  followUp?: string; // if not ok, a more specific follow-up question
}

/**
 * Quick LLM check: does `answer` actually address the `question` / `issues`?
 * On any failure returns ok=true (fail-safe — don't block user forever).
 */
export async function validateRefinementAnswer(
  stepDesc: string,
  question: string,
  issues: string[],
  answer: string,
  env: LocalEnv,
): Promise<ValidationResult> {
  if (!question) return { ok: true };
  // Very short answers are almost never useful
  if (answer.trim().split(/\s+/).length < 3) {
    return { ok: false, followUp: question };
  }

  const prompt = getPrompt('step_validator.user', {
    stepDesc: stepDesc.substring(0, 200),
    question,
    issues:   issues.slice(0, 3).join('; '),
    answer:   answer.substring(0, 400),
  });

  try {
    const raw = await callClaude(prompt, env, getPrompt('step_validator.system'));
    const match = raw.match(/\{[\s\S]*?\}/);
    if (!match) return { ok: true };
    const parsed = JSON.parse(match[0]) as { ok: boolean; followUp?: string };
    return { ok: !!parsed.ok, followUp: parsed.followUp };
  } catch {
    return { ok: true }; // fail-safe
  }
}
