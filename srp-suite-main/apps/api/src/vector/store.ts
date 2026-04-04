// ============================================================================
// Local Vector Store — equivalente a Cloudflare Vectorize
// Persiste vectores en un archivo JSON; cosine similarity en memoria.
// ============================================================================

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';

export interface VectorEntry {
  id: string;
  values: number[];
  metadata: Record<string, unknown>;
}

export interface VectorMatch {
  id: string;
  score: number;
  metadata: Record<string, unknown>;
}

export class LocalVectorStore {
  private index: Map<string, VectorEntry> = new Map();
  private dirty = false;

  constructor(private readonly indexPath: string) {
    this._ensureDir();
    this._load();
  }

  // ------------------------------------------------------------------
  // Public API (mirrors Cloudflare Vectorize)
  // ------------------------------------------------------------------

  async upsert(vectors: VectorEntry[]): Promise<void> {
    for (const vec of vectors) {
      this.index.set(vec.id, vec);
    }
    this.dirty = true;
    this._save();
    console.log(`[VectorStore] Upserted ${vectors.length} vectors (total: ${this.index.size})`);
  }

  async query(
    queryVector: number[],
    topK = 5,
    filter?: Record<string, unknown>
  ): Promise<VectorMatch[]> {
    const entries = Array.from(this.index.values());

    let candidates = entries;
    if (filter) {
      candidates = entries.filter(e => this._matchesFilter(e.metadata, filter));
    }

    const scored = candidates.map(e => ({
      id: e.id,
      score: cosineSimilarity(queryVector, e.values),
      metadata: e.metadata,
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  async deleteByPrefix(prefix: string): Promise<number> {
    let count = 0;
    for (const key of this.index.keys()) {
      if (key.startsWith(prefix)) {
        this.index.delete(key);
        count++;
      }
    }
    if (count > 0) {
      this.dirty = true;
      this._save();
    }
    return count;
  }

  get size(): number {
    return this.index.size;
  }

  // ------------------------------------------------------------------
  // Internal
  // ------------------------------------------------------------------

  private _matchesFilter(metadata: Record<string, unknown>, filter: Record<string, unknown>): boolean {
    return Object.entries(filter).every(([k, v]) => metadata[k] === v);
  }

  private _load(): void {
    if (!existsSync(this.indexPath)) {
      console.log('[VectorStore] Nuevo índice vacío');
      return;
    }
    try {
      const raw = JSON.parse(readFileSync(this.indexPath, 'utf-8')) as VectorEntry[];
      for (const entry of raw) {
        this.index.set(entry.id, entry);
      }
      console.log(`[VectorStore] Cargado índice: ${this.index.size} vectores`);
    } catch {
      console.warn('[VectorStore] No se pudo leer el índice, iniciando vacío');
    }
  }

  private _save(): void {
    if (!this.dirty) return;
    writeFileSync(this.indexPath, JSON.stringify(Array.from(this.index.values()), null, 2));
    this.dirty = false;
  }

  private _ensureDir(): void {
    const dir = dirname(this.indexPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }
}

// ============================================================================
// Cosine Similarity
// ============================================================================

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}
