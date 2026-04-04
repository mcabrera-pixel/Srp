// ============================================================================
// LLM Service — catálogo de modelos + dispatcher unificado
// ============================================================================
//
//  Para agregar un nuevo modelo/provider, busca la sección marcada con
//  "↓↓↓ CATÁLOGO DE MODELOS — agrega nuevos providers aquí ↓↓↓"
//  y añade una entrada al array MODEL_CATALOG siguiendo la plantilla
//  comentada al final del array.
//
// ============================================================================

import { LocalEnv } from '../types.js';
import { notifyMiniMaxRequest } from '../vector/embeddings.js';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface ModelConfig {
  /** Identificador único (usado en UI y como clave activa) */
  id: string;
  /** Nombre visible al usuario */
  name: string;
  /** Nombre del proveedor (agrupación visual en UI) */
  provider: string;
  /** Descripción corta del modelo */
  description: string;
  /** Cuál campo de LocalEnv contiene la API key (null = sin auth, p.ej. Ollama) */
  apiKeyField: keyof Pick<LocalEnv, 'minimaxApiKey' | 'openrouterApiKey' | 'openaiApiKey'> | null;
  /** URL base del endpoint OpenAI-compatible */
  endpoint: string;
  /** Nombre exacto del modelo en la API del proveedor */
  modelName: string;
  /** Límite de tokens de salida */
  maxTokens: number;
  /** Temperatura por defecto */
  temperature: number;
  /** Si true, elimina <think>…</think> del output */
  stripThinkTags?: boolean;
  /** Si true, añade reasoning_split:true al body (MiniMax) */
  useReasoningSplit?: boolean;
  /** Extractor personalizado de contenido si el provider no es estándar OpenAI */
  extractContent?: (data: unknown) => string | undefined;
}

// ============================================================================
// ↓↓↓  CATÁLOGO DE MODELOS — agrega nuevos providers aquí  ↓↓↓
// ============================================================================

export const MODEL_CATALOG: ModelConfig[] = [

  // ──────────────────────────────────────────────────────────────────────────
  // MINIMAX
  // ──────────────────────────────────────────────────────────────────────────
  {
    id:                'minimax-m2.5',
    name:              'MiniMax M2.5',
    provider:          'MiniMax',
    description:       'Modelo principal — razonamiento extendido, contexto 1M',
    apiKeyField:       'minimaxApiKey',
    endpoint:          'https://api.minimax.io/v1/chat/completions',
    modelName:         'MiniMax-M2.5',
    maxTokens:         4000,
    temperature:       0.7,
    stripThinkTags:    true,
    useReasoningSplit: true,
  },
  {
    id:          'minimax-text-01',
    name:        'MiniMax Text-01',
    provider:    'MiniMax',
    description: 'Más rápido y liviano, bueno para respuestas cortas',
    apiKeyField: 'minimaxApiKey',
    endpoint:    'https://api.minimax.io/v1/chat/completions',
    modelName:   'MiniMax-Text-01',
    maxTokens:   2000,
    temperature: 0.7,
  },

  // ──────────────────────────────────────────────────────────────────────────
  // OPENROUTER  (key: OPENROUTER_API_KEY)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id:          'openrouter-gemini-flash',
    name:        'Gemini 2.0 Flash',
    provider:    'OpenRouter',
    description: 'Google Gemini 2.0 Flash — rápido y económico',
    apiKeyField: 'openrouterApiKey',
    endpoint:    'https://openrouter.ai/api/v1/chat/completions',
    modelName:   'google/gemini-2.0-flash-001',
    maxTokens:   4000,
    temperature: 0.7,
  },
  {
    id:          'openrouter-claude-haiku',
    name:        'Claude 3.5 Haiku',
    provider:    'OpenRouter',
    description: 'Anthropic Claude 3.5 Haiku — veloz y preciso',
    apiKeyField: 'openrouterApiKey',
    endpoint:    'https://openrouter.ai/api/v1/chat/completions',
    modelName:   'anthropic/claude-3-5-haiku',
    maxTokens:   4000,
    temperature: 0.7,
  },
  {
    id:             'openrouter-deepseek-r1',
    name:           'DeepSeek R1',
    provider:       'OpenRouter',
    description:    'DeepSeek R1 con razonamiento extendido',
    apiKeyField:    'openrouterApiKey',
    endpoint:       'https://openrouter.ai/api/v1/chat/completions',
    modelName:      'deepseek/deepseek-r1',
    maxTokens:      4000,
    temperature:    0.6,
    stripThinkTags: true,
  },
  {
    id:             'openrouter-qwen3-235b',
    name:           'Qwen3 235B A22B',
    provider:       'OpenRouter',
    description:    'Qwen3 235B MoE — alto rendimiento, excelente en español',
    apiKeyField:    'openrouterApiKey',
    endpoint:       'https://openrouter.ai/api/v1/chat/completions',
    modelName:      'qwen/qwen3-235b-a22b',
    maxTokens:      4000,
    temperature:    0.7,
    stripThinkTags: true,
  },

  // ──────────────────────────────────────────────────────────────────────────
  // OPENAI  (key: OPENAI_API_KEY)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id:          'openai-gpt4o',
    name:        'GPT-4o',
    provider:    'OpenAI',
    description: 'OpenAI GPT-4o — muy capaz, multimodal',
    apiKeyField: 'openaiApiKey',
    endpoint:    'https://api.openai.com/v1/chat/completions',
    modelName:   'gpt-4o',
    maxTokens:   4000,
    temperature: 0.7,
  },
  {
    id:          'openai-gpt4o-mini',
    name:        'GPT-4o Mini',
    provider:    'OpenAI',
    description: 'OpenAI GPT-4o Mini — rápido y económico',
    apiKeyField: 'openaiApiKey',
    endpoint:    'https://api.openai.com/v1/chat/completions',
    modelName:   'gpt-4o-mini',
    maxTokens:   2000,
    temperature: 0.7,
  },

  // ──────────────────────────────────────────────────────────────────────────
  // OLLAMA — local, sin API key  (requiere OLLAMA_URL en .env)
  // ──────────────────────────────────────────────────────────────────────────
  // El endpoint '__OLLAMA__' se reemplaza en runtime por env.ollamaUrl
  {
    id:          'ollama-llama3',
    name:        'Llama 3.1 8B',
    provider:    'Ollama (local)',
    description: 'Meta Llama 3.1 8B corriendo localmente — sin costo',
    apiKeyField: null,
    endpoint:    '__OLLAMA__',
    modelName:   'llama3.1:8b',
    maxTokens:   2000,
    temperature: 0.7,
  },
  {
    id:          'ollama-qwen2.5',
    name:        'Qwen 2.5 7B',
    provider:    'Ollama (local)',
    description: 'Qwen 2.5 7B — muy bueno en español, sin costo',
    apiKeyField: null,
    endpoint:    '__OLLAMA__',
    modelName:   'qwen2.5:7b',
    maxTokens:   2000,
    temperature: 0.7,
  },

  // ──────────────────────────────────────────────────────────────────────────
  // ¿ NUEVO PROVIDER ? — descomenta y rellena esta plantilla:
  // ──────────────────────────────────────────────────────────────────────────
  // {
  //   id:          'mi-provider-modelo',
  //   name:        'Nombre visible en la UI',
  //   provider:    'Nombre del proveedor',
  //   description: 'Descripción corta',
  //   apiKeyField: 'openrouterApiKey',   // 'minimaxApiKey' | 'openrouterApiKey' | 'openaiApiKey' | null
  //   endpoint:    'https://api.mi-provider.com/v1/chat/completions',
  //   modelName:   'nombre-exacto-del-modelo',
  //   maxTokens:   4000,
  //   temperature: 0.7,
  //   stripThinkTags: false,
  //   // extractContent: (data) => data?.choices?.[0]?.text,  // si el formato difiere
  // },

];

// ============================================================================
// ↑↑↑  FIN DEL CATÁLOGO  ↑↑↑
// ============================================================================


// ── Estado activo en memoria del proceso ─────────────────────────────────────

let _activeModelId: string = MODEL_CATALOG[0].id;

export function getActiveModel(): ModelConfig {
  return MODEL_CATALOG.find(m => m.id === _activeModelId) ?? MODEL_CATALOG[0];
}

export function setActiveModel(id: string): ModelConfig {
  const found = MODEL_CATALOG.find(m => m.id === id);
  if (!found) throw new Error(`Modelo "${id}" no encontrado en el catálogo`);
  _activeModelId = id;
  console.log(`[LLM] Modelo activo → ${found.name} (${found.provider})`);
  return found;
}

/** Devuelve todos los modelos con indicador de disponibilidad según env */
export function getModelsStatus(env: LocalEnv): (ModelConfig & { available: boolean })[] {
  return MODEL_CATALOG.map(m => {
    const available = m.apiKeyField === null
      ? !!env.ollamaUrl   // Ollama: disponible si hay URL configurada
      : !!(env[m.apiKeyField] as string);
    return { ...m, available };
  });
}

// ── Dispatcher unificado ─────────────────────────────────────────────────────

export async function callClaude(
  prompt: string,
  env: LocalEnv,
  systemPrompt?: string,
  timeoutMs = 240_000
): Promise<string> {
  const model = getActiveModel();

  // Resolver endpoint Ollama dinámicamente
  const endpoint = model.endpoint === '__OLLAMA__'
    ? `${env.ollamaUrl}/v1/chat/completions`
    : model.endpoint;

  // Resolver API key
  const apiKey = model.apiKeyField ? (env[model.apiKeyField] as string) : undefined;

  if (model.apiKeyField && !apiKey) {
    throw new Error(`Sin API key para "${model.name}". Configura ${model.apiKeyField} en .env`);
  }

  console.log(`[LLM] ${model.name} (${model.provider}) → ${model.modelName}`);

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    const body: Record<string, unknown> = {
      model:       model.modelName,
      messages: [
        {
          role:    'system',
          content: systemPrompt ?? 'Eres un asistente experto en procedimientos mineros y seguridad. Responde SIEMPRE en español.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: model.temperature,
      max_tokens:  model.maxTokens,
    };

    if (model.useReasoningSplit) body['reasoning_split'] = true;

    const response = await fetch(endpoint, {
      method:  'POST',
      headers,
      body:    JSON.stringify(body),
      signal:  controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[LLM] ${model.provider} error: ${response.status}`, errText);
      if (response.status === 401) throw new Error(`API key inválida para "${model.name}"`);
      if (response.status === 429) throw new Error(`Rate limit en "${model.name}". Intenta más tarde.`);
      throw new Error(`${model.provider} API error (${response.status}): ${errText}`);
    }

    const data: unknown = await response.json();

    // Extractor personalizado o genérico OpenAI-compatible
    let content: string | undefined;
    if (model.extractContent) {
      content = model.extractContent(data);
    } else {
      content = (data as any)?.choices?.[0]?.message?.content
             ?? (data as any)?.choices?.[0]?.text;
    }

    if (!content) {
      console.error('[LLM] Formato inesperado:', JSON.stringify(data).substring(0, 500));
      throw new Error(`Formato de respuesta inesperado de "${model.name}"`);
    }

    if (model.stripThinkTags && content.includes('<think>')) {
      content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      console.log('[LLM] Reasoning tags eliminados');
    }

    console.log(`[LLM] Longitud respuesta: ${content.length} chars`);

    // Notificar rate-limiter solo para MiniMax
    if (model.provider === 'MiniMax') notifyMiniMaxRequest();

    return content;

  } catch (fetchError: unknown) {
    clearTimeout(timeoutId);
    if ((fetchError as any)?.name === 'AbortError') {
      throw new Error(`Timeout de "${model.name}" después de ${Math.round(timeoutMs / 1000)}s`);
    }
    console.error('[LLM] Error en', model.name, fetchError);
    throw fetchError;
  }

  // — legacy compat: esta función se llamaba callClaude pero ya es el dispatcher
}

// ─────────────────────────────────────────────────────────────────────────────
// fin de llm.ts
// ─────────────────────────────────────────────────────────────────────────────
