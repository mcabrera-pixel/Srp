// ============================================================================
// Session Service — historial de conversación (TTL 1 hora)
// ============================================================================

import { LocalEnv } from '../types.js';
import { saveSessionMessage, getRecentMessages, cleanExpiredMessages } from '../db/queries.js';

export { cleanExpiredMessages };

export interface SessionMessage {
  id: string;
  phone: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export async function saveMessage(
  phone: string,
  role: 'user' | 'assistant',
  content: string,
  env: LocalEnv
): Promise<void> {
  await saveSessionMessage(phone, role, content, env.db);
}

export async function getSessionMessages(
  phone: string,
  env: LocalEnv,
  maxMessages = 10
): Promise<SessionMessage[]> {
  const msgs = await getRecentMessages(phone, env.db, maxMessages);
  return msgs as SessionMessage[];
}

export function formatHistoryForPrompt(messages: SessionMessage[]): string {
  if (messages.length === 0) return '';
  const formatted = messages
    .map(m => {
      const label = m.role === 'user' ? 'Usuario' : 'Asistente';
      const content = m.content.length > 200 ? m.content.substring(0, 200) + '...' : m.content;
      return `${label}: ${content}`;
    })
    .join('\n');
  return `\n--- Historial reciente ---\n${formatted}\n--- Fin historial ---\n`;
}

export async function getConversationContext(phone: string, env: LocalEnv): Promise<string> {
  const messages = await getSessionMessages(phone, env, 10);
  return formatHistoryForPrompt(messages);
}
