// ============================================================================
// Local Storage — equivalente a R2 Bucket de Cloudflare
// Guarda archivos binarios en el sistema de archivos local
// ============================================================================

import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from 'fs';
import { join, sep } from 'path';

export class LocalStorage {
  constructor(private readonly dir: string) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  /** Guarda un archivo */
  async put(key: string, body: Buffer | ArrayBuffer | Uint8Array): Promise<void> {
    const filePath = this._path(key);
    const dir = filePath.substring(0, filePath.lastIndexOf('/') !== -1 ? filePath.lastIndexOf('/') : filePath.lastIndexOf('\\'));
    if (dir && !existsSync(dir)) mkdirSync(dir, { recursive: true });

    const buffer = body instanceof Buffer ? body : Buffer.from(body as ArrayBuffer);
    writeFileSync(filePath, buffer);
    console.log(`[Storage] Saved: ${key} (${buffer.length} bytes)`);
  }

  /** Lee un archivo; devuelve null si no existe */
  async get(key: string): Promise<Buffer | null> {
    const filePath = this._path(key);
    if (!existsSync(filePath)) return null;
    return readFileSync(filePath);
  }

  /** Comprueba si existe un archivo */
  async head(key: string): Promise<boolean> {
    return existsSync(this._path(key));
  }

  /** Lista archivos con un prefijo */
  async list(prefix = ''): Promise<string[]> {
    if (!existsSync(this.dir)) return [];
    return readdirSync(this.dir, { recursive: true })
      .map(f => f.toString().replace(/\\/g, '/'))
      .filter(f => f.startsWith(prefix));
  }

  /** URL pública de un archivo (local: ruta absoluta file://) */
  publicUrl(key: string): string {
    return `http://localhost:${process.env.PORT ?? 3000}/files/${key}`;
  }

  private _path(key: string): string {
    return join(this.dir, key.replace(/\//g, sep));
  }
}
