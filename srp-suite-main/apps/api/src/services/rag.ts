// ============================================================================
// RAG Service — búsqueda semántica local (equivalente a Cloudflare Vectorize)
// ============================================================================

import { LocalEnv, BaseDocument, VectorMetadata } from '../types.js';
import { callClaude } from './llm.js';
import { generateEmbeddings, embedText } from '../vector/embeddings.js';
import { LocalVectorStore, VectorEntry } from '../vector/store.js';
import { saveBaseDocument, markDocumentIndexed } from '../db/queries.js';

const CHUNK_SIZE = 400;
const CHUNK_OVERLAP = 40;

let _store: LocalVectorStore | null = null;

function getStore(env: LocalEnv): LocalVectorStore {
  if (!_store) _store = new LocalVectorStore(env.vectorIndexPath);
  return _store;
}

// ============================================================================
// INGESTIÓN
// ============================================================================

export async function ingestDocument(document: BaseDocument, env: LocalEnv): Promise<void> {
  console.log(`[RAG] Ingesting: ${document.name}`);

  let analysis = document.metadata ? JSON.parse(document.metadata) : null;
  if (!analysis) {
    analysis = await analyzeDocument(document.content, env);
    env.db
      .prepare('UPDATE base_documents SET metadata = ? WHERE id = ?')
      .run(JSON.stringify(analysis), document.id);
  }

  const chunks = chunkDocument(document.content, CHUNK_SIZE, CHUNK_OVERLAP);
  const textsToEmbed = [...chunks];
  if (analysis?.summary) textsToEmbed.unshift(`RESUMEN EJECUTIVO: ${analysis.summary}`);

  // analyzeDocument llama a MiniMax M2.5 (chat), lo que consume 1 RPM del mismo
  // bucket que el endpoint de embeddings. El rate-limiter proactivo (_acquireSlot)
  // en generateEmbeddings mide el tiempo transcurrido desde la última petición
  // (sea chat o embeddings) y espera lo necesario antes de enviar, por lo que
  // el bloqueo fijo de 62s previo ya no es necesario aquí.
  const embeddings = await generateEmbeddings(textsToEmbed, env);

  const vectors: VectorEntry[] = embeddings.map((embedding, i) => {
    const isSummary = analysis?.summary && i === 0;
    const actualIndex = isSummary ? -1 : (analysis?.summary ? i - 1 : i);
    const content = textsToEmbed[i];
    const metadata: Record<string, unknown> = {
      document_id: document.id,
      document_type: document.type,
      chunk_index: actualIndex,
      content,
      section: extractSection(content) ?? '',
      keywords: JSON.stringify(analysis ? analysis.keywords : extractKeywords(content)),
    };
    return { id: `${document.id}-chunk-${i}`, values: embedding, metadata };
  });

  await getStore(env).upsert(vectors);
  await markDocumentIndexed(document.id, env.db);
  console.log(`[RAG] Indexed ${vectors.length} vectors for "${document.name}"`);
}

// ============================================================================
// BÚSQUEDA SEMÁNTICA
// ============================================================================

export async function searchRelevantContext(
  query: string,
  types: string[],
  env: LocalEnv,
  topK = 5
): Promise<string[]> {
  console.log(`[RAG] Searching: "${query.substring(0, 50)}..." types=${types.join(',')}`);

  const queryEmbedding = await embedText(query, env);
  const store = getStore(env);

  const results = await store.query(queryEmbedding, topK * 2);

  // Filtrar por tipo de documento
  const filtered = types.length > 0
    ? results.filter(r => types.includes(r.metadata.document_type as string))
    : results;

  return filtered
    .slice(0, topK)
    .map(r => (r.metadata.content as string) ?? '');
}

// ============================================================================
// HELPERS
// ============================================================================

function chunkDocument(text: string, size: number, overlap: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += size - overlap) {
    chunks.push(words.slice(i, i + size).join(' '));
    if (i + size >= words.length) break;
  }
  return chunks;
}

function extractSection(content: string): string | null {
  const patterns = [
    /^#{1,3}\s+(.+)/m,
    /^(\d+\.\s+[A-ZÁÉÍÓÚÜÑ][^.]+)/m,
    /^(OBJETIVO|ALCANCE|RIESGOS|EPP|PROCEDIMIENTO)/im,
  ];
  for (const p of patterns) {
    const m = content.match(p);
    if (m) return m[1].trim().substring(0, 50);
  }
  return null;
}

function extractKeywords(content: string): string[] {
  const stopWords = new Set(['de', 'la', 'el', 'en', 'y', 'a', 'que', 'se', 'los', 'las']);
  return content
    .toLowerCase()
    .replace(/[^a-záéíóúüñ\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w))
    .slice(0, 10);
}

async function analyzeDocument(
  content: string,
  env: LocalEnv
): Promise<{ summary: string; keywords: string[]; main_topics: string[] }> {
  const prompt = `Analiza este documento técnico minero y proporciona un análisis en JSON:
{
  "summary": "Resumen ejecutivo en 2-3 oraciones",
  "keywords": ["palabra1", "palabra2"],
  "main_topics": ["tema1", "tema2"]
}

DOCUMENTO:
${content.substring(0, 3000)}`;

  try {
        const response = await callClaude(prompt, env, 'Eres un analista de documentos técnicos mineros. Responde SIEMPRE en español.');
    const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      summary: content.substring(0, 200),
      keywords: extractKeywords(content),
      main_topics: [],
    };
  }
}
