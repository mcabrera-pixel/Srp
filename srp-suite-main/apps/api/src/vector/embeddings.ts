// ============================================================================
// Embeddings — multi-provider
// Soporta: MiniMax embo-01 | Ollama (local) | OpenAI text-embedding-3-small
// Proveedor activo: env.embeddingsProvider
// ============================================================================

import { LocalEnv } from '../types.js';

// ----------------------------------------------------------------------------
// Token-bucket rate limiter — solo se usa con MiniMax (1 RPM compartido)
// ----------------------------------------------------------------------------
let _lastMiniMaxRequestMs = 0;
const MINIMAX_MIN_INTERVAL_MS = 62_000; // 1 req/min + 2s buffer

/**
 * Debe llamarse después de CUALQUIER petición a la API de MiniMax (chat o
 * embeddings) para mantener el rate-limiter sincronizado con el bucket RPM
 * compartido de la cuenta.
 */
export function notifyMiniMaxRequest(): void {
  _lastMiniMaxRequestMs = Date.now();
}

async function _acquireMiniMaxSlot(): Promise<void> {
  const elapsed = Date.now() - _lastMiniMaxRequestMs;
  if (_lastMiniMaxRequestMs > 0 && elapsed < MINIMAX_MIN_INTERVAL_MS) {
    const waitMs = MINIMAX_MIN_INTERVAL_MS - elapsed;
    console.log(
      `[Embeddings/MiniMax] Rate-limiter: esperando ${Math.ceil(waitMs / 1000)}s ` +
      `(límite 1 RPM compartido MiniMax)...`
    );
    await new Promise(r => setTimeout(r, waitMs));
  }
  _lastMiniMaxRequestMs = Date.now();
}

// ============================================================================
// API PÚBLICA
// ============================================================================

/**
 * Genera embeddings para un array de textos usando el proveedor configurado
 * en env.embeddingsProvider.
 */
export async function generateEmbeddings(
  texts: string[],
  env: LocalEnv
): Promise<number[][]> {
  if (texts.length === 0) return [];

  switch (env.embeddingsProvider) {
    case 'ollama':
      return _generateOllama(texts, env);
    case 'openai':
      return _generateOpenAI(texts, env.openaiApiKey);
    case 'minimax':
    default:
      return _generateMiniMax(texts, env.minimaxApiKey);
  }
}

/**
 * Genera embedding para un único texto.
 */
export async function embedText(text: string, env: LocalEnv): Promise<number[]> {
  const [vec] = await generateEmbeddings([text], env);
  return vec;
}

// ============================================================================
// PROVEEDOR: OLLAMA (local, sin límites, sin costos)
// Endpoint: POST {ollamaUrl}/api/embed
// Modelos recomendados: nomic-embed-text (768d) | mxbai-embed-large (1024d)
// Instalar: ollama pull nomic-embed-text
// ============================================================================

async function _generateOllama(texts: string[], env: LocalEnv): Promise<number[][]> {
  const baseUrl = env.ollamaUrl.replace(/\/$/, '');
  const model   = env.ollamaEmbeddingsModel || 'nomic-embed-text';

  console.log(`[Embeddings/Ollama] ${texts.length} textos → modelo "${model}" en ${baseUrl}`);

  // Ollama /api/embed acepta un array "input" desde v0.3+
  // Para versiones anteriores también soportamos el fallback /api/embeddings (1 a 1)
  try {
    const res = await fetch(`${baseUrl}/api/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, input: texts }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Ollama /api/embed error (${res.status}): ${err}`);
    }

    const data: any = await res.json();

    // Ollama devuelve { embeddings: [[...], [...]] }
    if (Array.isArray(data.embeddings)) {
      console.log(`[Embeddings/Ollama] OK — ${data.embeddings.length} vectores (dim ${data.embeddings[0]?.length ?? '?'})`);
      return data.embeddings as number[][];
    }

    throw new Error(`Ollama: formato de respuesta inesperado: ${JSON.stringify(data).substring(0, 200)}`);
  } catch (err: any) {
    // Fallback para Ollama < 0.3 que no tiene /api/embed
    if (err.message?.includes('404') || err.message?.includes('Not Found')) {
      console.warn('[Embeddings/Ollama] /api/embed no disponible, usando fallback /api/embeddings...');
      return _generateOllamaLegacy(texts, baseUrl, model);
    }
    throw err;
  }
}

/** Fallback para versiones antiguas de Ollama: una petición por texto */
async function _generateOllamaLegacy(texts: string[], baseUrl: string, model: string): Promise<number[][]> {
  const results: number[][] = [];
  for (let i = 0; i < texts.length; i++) {
    const res = await fetch(`${baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt: texts[i] }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Ollama /api/embeddings error (${res.status}): ${err}`);
    }
    const data: any = await res.json();
    if (!Array.isArray(data.embedding)) {
      throw new Error(`Ollama legacy: formato inesperado: ${JSON.stringify(data).substring(0, 200)}`);
    }
    results.push(data.embedding);
    if ((i + 1) % 10 === 0) console.log(`[Embeddings/Ollama] ${i + 1}/${texts.length} textos procesados...`);
  }
  return results;
}

// ============================================================================
// PROVEEDOR: OPENAI text-embedding-3-small
// Batches de 100, coste muy bajo (~$0.02 / 1M tokens)
// ============================================================================

async function _generateOpenAI(texts: string[], apiKey: string): Promise<number[][]> {
  if (!apiKey) throw new Error('OPENAI_API_KEY no configurada en .env');

  const BATCH = 100;
  const all: number[][] = [];
  console.log(`[Embeddings/OpenAI] ${texts.length} textos → lotes de ${BATCH}`);

  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: batch }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI Embeddings error (${res.status}): ${err}`);
    }

    const data: any = await res.json();
    if (!Array.isArray(data.data)) {
      throw new Error(`OpenAI Embeddings: formato inesperado: ${JSON.stringify(data).substring(0, 200)}`);
    }

    const sorted = [...data.data].sort((a: any, b: any) => a.index - b.index);
    for (const item of sorted) all.push(item.embedding);

    if (i + BATCH < texts.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log(`[Embeddings/OpenAI] OK — ${all.length} vectores (dim ${all[0]?.length ?? '?'})`);
  return all;
}

// ============================================================================
// PROVEEDOR: MINIMAX embo-01 (1 RPM compartido con chat)
// ============================================================================

const MINIMAX_BATCH_SIZE   = 20;
const MINIMAX_BACKOFF_MS   = [30_000, 60_000, 90_000, 120_000, 180_000];
const MINIMAX_MAX_ATTEMPTS = MINIMAX_BACKOFF_MS.length + 1;

async function _generateMiniMax(texts: string[], apiKey: string): Promise<number[][]> {
  if (!apiKey) throw new Error('MINIMAX_API_KEY no configurada en .env');

  const batches: string[][] = [];
  for (let i = 0; i < texts.length; i += MINIMAX_BATCH_SIZE) {
    batches.push(texts.slice(i, i + MINIMAX_BATCH_SIZE));
  }

  console.log(
    `[Embeddings/MiniMax] ${texts.length} textos → ${batches.length} lote(s) de hasta ${MINIMAX_BATCH_SIZE} (1 RPM por lote)`
  );

  const all: number[][] = [];

  for (const batch of batches) {
    await _acquireMiniMaxSlot();

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= MINIMAX_MAX_ATTEMPTS; attempt++) {
      try {
        const res = await fetch('https://api.minimax.io/v1/embeddings', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ model: 'embo-01', texts: batch, type: 'db' }),
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(`MiniMax Embeddings error (${res.status}): ${err}`);
        }

        const data: any = await res.json();
        const statusCode: number = data.base_resp?.status_code ?? 0;
        const statusMsg: string  = data.base_resp?.status_msg  ?? '';

        if (statusCode !== 0) {
          const isRateLimit = statusCode === 1002;
          console.error(`[Embeddings/MiniMax] Error base_resp — code=${statusCode} msg="${statusMsg}"`);
          if (!isRateLimit) {
            throw new Error(`MiniMax Embeddings error (${statusCode}): ${statusMsg || 'ver consola'}`);
          }
          const waitMs = MINIMAX_BACKOFF_MS[attempt - 1] ?? 180_000;
          console.warn(
            `[Embeddings/MiniMax] Rate limit 1002, esperando ${waitMs / 1000}s (intento ${attempt}/${MINIMAX_MAX_ATTEMPTS})...`
          );
          await new Promise(r => setTimeout(r, waitMs));
          _lastMiniMaxRequestMs = Date.now();
          lastError = new Error(`MiniMax rate limit (intento ${attempt}/${MINIMAX_MAX_ATTEMPTS})`);
          continue;
        }

        if (!data.vectors || !Array.isArray(data.vectors)) {
          throw new Error(`MiniMax Embeddings: formato inesperado: ${JSON.stringify(data).substring(0, 300)}`);
        }

        for (const vec of data.vectors) all.push(vec);
        lastError = null;
        break;
      } catch (err: any) {
        if (attempt === MINIMAX_MAX_ATTEMPTS) throw err;
        lastError = err;
      }
    }
    if (lastError) throw lastError;
  }

  return all;
}
