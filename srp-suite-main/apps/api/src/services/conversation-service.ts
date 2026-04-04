// ============================================================================
// Conversation Service — mensajes dinámicos con LLM ligero
// ============================================================================

import { LocalEnv } from '../types.js';
import { getPrompt } from './prompt-store.js';

export type MessageType =
  | 'audio_received'
  | 'analyzing'
  | 'asking_questions'
  | 'confirming_steps'
  | 'reviewing'
  | 'generating'
  | 'completed'
  | 'modify_request'
  | 'error';

export interface MessageContext {
  userName?: string;
  taskSummary?: string;
  steps?: string[];
  questions?: string[];
  feedback?: string;
  procedureTitle?: string;
  downloadUrl?: string;
  jsonUrl?: string;
  conversationHistory?: string;
  /** Short worker context string injected into system prompt for personalisation */
  workerContext?: string;
}

// System prompt managed via prompt-store — edit at runtime via /api/prompts (id: conversation.system)

export async function generateConversationalMessage(
  type: MessageType,
  context: MessageContext,
  env: LocalEnv
): Promise<string> {
  const prompt = buildPromptForType(type, context);
  const historyContext = context.conversationHistory ?? '';
  const baseSystem     = getPrompt('conversation.system');
  const systemWithContext = context.workerContext
    ? `${baseSystem}\n\nCONTEXTO TRABAJADOR: ${context.workerContext}`
    : baseSystem;

  try {
    const apiKey = env.minimaxApiKey || env.openrouterApiKey;
    const response = await fetch('https://api.minimax.io/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.5',
        messages: [
          { role: 'system', content: systemWithContext },
          { role: 'user', content: historyContext + '\n\n' + prompt },
        ],
        temperature: 0.8,
        max_tokens: 200,
        reasoning_split: true,
      }),
    });

    if (!response.ok) return getFallbackMessage(type, context);

    const data: any = await response.json();
    let content: string = data.choices[0].message.content.trim();
    if (content.includes('<think>')) {
      content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    }
    return content;
  } catch {
    return getFallbackMessage(type, context);
  }
}

function buildPromptForType(type: MessageType, ctx: MessageContext): string {
  const name  = ctx.userName ? `, ${ctx.userName}` : '';
  const steps = ctx.steps?.map((s, i) => `${i + 1}. ${s}`).join('\n') ?? '';
  switch (type) {
    case 'audio_received':   return getPrompt('conversation.audio_received',   { name });
    case 'analyzing':        return getPrompt('conversation.analyzing',        { name, taskSummary: ctx.taskSummary ?? '' });
    case 'asking_questions': return getPrompt('conversation.asking_questions', { name, questions: ctx.questions?.join(' | ') ?? '' });
    case 'confirming_steps': return getPrompt('conversation.confirming_steps', { name, steps });
    case 'reviewing':        return getPrompt('conversation.reviewing',        { name, feedback: ctx.feedback ?? '' });
    case 'generating':       return getPrompt('conversation.generating',       { name, procedureTitle: ctx.procedureTitle ?? '' });
    case 'completed':        return getPrompt('conversation.completed',        { name, procedureTitle: ctx.procedureTitle ?? '', downloadUrl: ctx.downloadUrl ?? '' });
    case 'modify_request':   return getPrompt('conversation.modify_request',   { name });
    case 'error':            return getPrompt('conversation.error',            { name });
    default:                 return `Responde de forma amable y profesional a ${ctx.userName}.`;
  }
}

function getFallbackMessage(type: MessageType, ctx: MessageContext): string {
  const name = ctx.userName ? ` ${ctx.userName}` : '';
  const msgs: Record<MessageType, string> = {
    audio_received: `🎧${name}, audio recibido. Transcribiendo...`,
    analyzing: `📝${name}, analizando tu tarea... ⏳`,
    asking_questions: `Necesito más información. ${ctx.questions?.[0] ?? '¿Puedes darme más detalles?'}`,
    confirming_steps: `Por favor confirma los pasos con ✅ o corrige con ✏️`,
    reviewing: `Revisando el borrador... ⏳`,
    generating: `⚙️ Generando el procedimiento "${ctx.procedureTitle}"...`,
    completed: `✅${name}, listo! Descarga: ${ctx.downloadUrl}`,
    modify_request: `¿Qué corrección necesitas?`,
    error: `❌ Ocurrió un error. Por favor intenta nuevamente.`,
  };
  return msgs[type] ?? `Hola${name}, ¿en qué puedo ayudarte?`;
}
