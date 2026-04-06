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

import { LocalEnv, VisionAnalysis, VisionRiskLevel } from '../types.js';
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
    name:        'Gemini 2.5 Flash',
    provider:    'OpenRouter',
    description: 'Google Gemini 2.5 Flash — rápido, visión nativa, ideal para SRP Vision',
    apiKeyField: 'openrouterApiKey',
    endpoint:    'https://openrouter.ai/api/v1/chat/completions',
    modelName:   'google/gemini-2.5-flash-preview-05-20',
    maxTokens:   4000,
    temperature: 0.7,
  },
  {
    id:          'openrouter-gemini-pro',
    name:        'Gemini 2.5 Pro',
    provider:    'OpenRouter',
    description: 'Google Gemini 2.5 Pro — máxima capacidad multimodal',
    apiKeyField: 'openrouterApiKey',
    endpoint:    'https://openrouter.ai/api/v1/chat/completions',
    modelName:   'google/gemini-2.5-pro-preview-06-05',
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

// ============================================================================
// SRP VISION — Llamada multimodal (imagen + texto)
// ============================================================================

const VISION_SYSTEM_PROMPT = `Eres un supervisor experto de mantenimiento minero con 30 años de experiencia en equipos pesados (Komatsu 930E, P&H 4100XPC, Caterpillar).

Tu rol es analizar imágenes en tiempo real del mantenimiento que un técnico está ejecutando y proporcionar:
1. Instrucción clara del siguiente paso a realizar
2. Detección de riesgos o anomalías visibles
3. Identificación de componentes en la imagen
4. Confirmación de pasos correctamente ejecutados

REGLAS:
- Responde SIEMPRE en español técnico chileno, conciso y directo
- Instrucciones cortas (máximo 2 oraciones) — el técnico las escuchará por audio
- Si detectas un riesgo CRÍTICO, empieza con "⚠️ DETENCIÓN:" seguido de la razón
- Si todo está correcto, confirma brevemente: "Paso correcto. Continúa con..."
- Identifica componentes visibles: filtros, mangueras, pernos, sellos, válvulas, etc.
- Compara lo que ves contra el procedimiento operativo estándar (SOP) proporcionado

RESPONDE SIEMPRE en formato JSON válido:
{
  "instruction": "texto de la instrucción para el técnico",
  "risk_level": "none|low|medium|high|critical",
  "detected_components": ["componente1", "componente2"],
  "anomalies": ["anomalía detectada si hay alguna"],
  "confidence": 0.85,
  "sop_step_match": "Paso X del SOP que corresponde o null"
}`;

export interface VisionLLMOptions {
  /** Base64-encoded JPEG image */
  imageBase64: string;
  /** Optional text question from the technician */
  technicianQuery?: string;
  /** SOP context from RAG search */
  sopContext?: string;
  /** Worker profile context */
  workerContext?: string;
  /** Equipment being worked on */
  equipmentTag?: string;
  /** Previous findings from this session (last N analysis results) */
  previousFindings?: string;
  /** Which model to use — defaults to openai-gpt4o */
  modelId?: string;
}

const VISION_CAPABLE_MODELS = ['openrouter-gemini-flash', 'openrouter-gemini-pro', 'openai-gpt4o', 'openai-gpt4o-mini'];

export async function callVisionLLM(
  opts: VisionLLMOptions,
  env: LocalEnv,
  timeoutMs = 30_000
): Promise<VisionAnalysis> {
  const modelId = opts.modelId ?? 'openrouter-gemini-flash';
  const model = MODEL_CATALOG.find(m => m.id === modelId);
  if (!model) throw new Error(`Modelo "${modelId}" no encontrado en el catálogo`);

  if (!VISION_CAPABLE_MODELS.includes(modelId)) {
    console.warn(`[Vision] Modelo "${modelId}" podría no soportar imágenes. Usando de todos modos.`);
  }

  const endpoint = model.endpoint === '__OLLAMA__'
    ? `${env.ollamaUrl}/v1/chat/completions`
    : model.endpoint;

  const apiKey = model.apiKeyField ? (env[model.apiKeyField] as string) : undefined;
  if (model.apiKeyField && !apiKey) {
    throw new Error(`Sin API key para "${model.name}". Configura ${model.apiKeyField} en .env`);
  }

  // Construir system prompt con contexto
  let systemPrompt = VISION_SYSTEM_PROMPT;
  if (opts.equipmentTag) systemPrompt += `\n\nEQUIPO: ${opts.equipmentTag}`;
  if (opts.sopContext) systemPrompt += `\n\nPROCEDIMIENTO OPERATIVO ESTÁNDAR (SOP):\n${opts.sopContext}`;
  if (opts.workerContext) systemPrompt += `\n\nCONTEXTO DEL TÉCNICO:\n${opts.workerContext}`;
  if (opts.previousFindings) systemPrompt += `\n\nHALLAZGOS PREVIOS EN ESTA SESIÓN:\n${opts.previousFindings}`;

  // Construir mensaje multimodal
  const userContent: unknown[] = [
    {
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${opts.imageBase64}`, detail: 'low' },
    },
  ];

  if (opts.technicianQuery) {
    userContent.push({ type: 'text', text: `Pregunta del técnico: ${opts.technicianQuery}` });
  } else {
    userContent.push({ type: 'text', text: 'Analiza esta imagen del mantenimiento en curso. ¿Qué ves y cuál es la instrucción para el técnico?' });
  }

  console.log(`[Vision] ${model.name} — analizando frame...`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    const body: Record<string, unknown> = {
      model: model.modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0.3,
      max_tokens: 500,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Vision] ${model.provider} error: ${response.status}`, errText);
      throw new Error(`${model.provider} Vision API error (${response.status}): ${errText}`);
    }

    const data: unknown = await response.json();
    let content = (data as any)?.choices?.[0]?.message?.content ?? '';

    // Limpiar markdown code blocks si el modelo los añade
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    console.log(`[Vision] Respuesta (${content.length} chars)`);

    // Parsear JSON
    try {
      const analysis: VisionAnalysis = JSON.parse(content);
      // Validar campos mínimos
      return {
        instruction: analysis.instruction || 'Sin instrucción disponible',
        risk_level: (['none', 'low', 'medium', 'high', 'critical'].includes(analysis.risk_level)
          ? analysis.risk_level : 'none') as VisionRiskLevel,
        detected_components: Array.isArray(analysis.detected_components) ? analysis.detected_components : [],
        anomalies: Array.isArray(analysis.anomalies) ? analysis.anomalies : [],
        confidence: typeof analysis.confidence === 'number' ? analysis.confidence : 0.5,
        sop_step_match: analysis.sop_step_match ?? null,
      };
    } catch {
      // Si no es JSON válido, construir respuesta desde texto plano
      console.warn('[Vision] Respuesta no es JSON, interpretando como texto');
      return {
        instruction: content.substring(0, 200),
        risk_level: 'none',
        detected_components: [],
        anomalies: [],
        confidence: 0.3,
        sop_step_match: null,
      };
    }

  } catch (fetchError: unknown) {
    clearTimeout(timeoutId);
    if ((fetchError as any)?.name === 'AbortError') {
      throw new Error(`Timeout de Vision "${model.name}" después de ${Math.round(timeoutMs / 1000)}s`);
    }
    throw fetchError;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// fin de llm.ts
// ─────────────────────────────────────────────────────────────────────────────
