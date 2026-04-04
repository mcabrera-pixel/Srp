// ============================================================================
// Task Extractor — igual que la versión Worker, solo cambia LocalEnv
// ============================================================================

import { LocalEnv, TaskStep } from '../types.js';
import { callClaude } from './llm.js';
import { getPrompt } from './prompt-store.js';

export async function extractTaskSteps(description: string, env: LocalEnv): Promise<TaskStep[]> {
  console.log(`[TaskExtractor] Extracting steps (${description.length} chars)`);

  const prompt = getPrompt('task_extractor.user', { description });

  try {
    const response = await callClaude(prompt, env, getPrompt('task_extractor.system'));
    const cleanedJson = extractJsonFromResponse(response);
    const result = JSON.parse(cleanedJson);
    console.log(`[TaskExtractor] Extracted ${result.steps.length} steps`);
    return result.steps;
  } catch (error) {
    console.error('[TaskExtractor] Error:', error);
    return [
      {
        order: 1,
        description,
        estimated_duration: 'No especificado',
        requires_supervision: true,
        equipment_needed: [],
        safety_notes: 'Revisar con supervisor antes de ejecutar',
      },
    ];
  }
}

function extractJsonFromResponse(response: string): string {
  let cleaned = response.trim();
  if (cleaned.startsWith('```')) {
    const firstNewline = cleaned.indexOf('\n');
    if (firstNewline > 0) cleaned = cleaned.substring(firstNewline + 1);
    if (cleaned.endsWith('```')) cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

// Prompts managed via prompt-store — edit at runtime via /api/prompts
