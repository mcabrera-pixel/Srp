// ============================================================================
// DOCX Generator — igual que la versión Worker, pero carga template desde disco local
// ============================================================================

import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { LocalEnv } from '../types.js';
import { join } from 'path';
import { existsSync, readdirSync } from 'fs';

// Definición de tipos de secciones (mismos que la versión Worker)
export interface TareaStep {
  titulo: string;
  contenido: string;
}

export interface EppEquipos {
  EPP: string[];
  Equipos_Herramientas: string[];
  Insumos: string[];
}

export interface ProcedureSections {
  objetivo: string;
  alcance: string;
  responsabilidades: string;
  definiciones: string;
  epp_equipos: EppEquipos | string;
  competencias: string;
  descripcion_tarea: TareaStep[];
  bloqueo_energias: string;
  riesgos_criticos: RiesgoItem[];
  peligros_controles: PeligroItem[];
  emergencias: string;
  medio_ambiente: string;
  registros: string[] | string;
  referencias: string[] | string;
  evaluacion: string;
  codigo_procedimiento: string;
  version: string;
  elaborado_por: string;
  revisado_por: string;
  aprobado_por: string;
  fecha_elaboracion: string;
}

export interface PeligroItem {
  Peligro: string;
  Riesgo: string;
  Control: string;
}

export interface RiesgoItem {
  codigo: string;
  nombre: string;
  controles_preventivos: string;
  controles_mitigadores: string;
}

function normalizeEppEquipos(input: any): { epp_lista: string[]; equipos_lista: string[]; insumos_lista: string[] } {
  const toArr = (arr: any): string[] => (Array.isArray(arr) ? arr : []);
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    return {
      epp_lista: toArr(input.EPP),
      equipos_lista: toArr(input.Equipos_Herramientas),
      insumos_lista: toArr(input.Insumos),
    };
  }
  return { epp_lista: [], equipos_lista: [], insumos_lista: [] };
}

function normalizeDescripcionTarea(input: any): TareaStep[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (typeof input === 'object') {
    return Object.entries(input).map(([titulo, contenido]) => ({
      titulo,
      contenido: String(contenido),
    }));
  }
  return [];
}

export async function generateDocxFromPrototype(
  prototypeBuffer: ArrayBuffer,
  sections: Partial<ProcedureSections>
): Promise<ArrayBuffer> {
  const zip = new PizZip(prototypeBuffer);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    // @ts-ignore
    delimiters: { start: '{', end: '}' },
  });

  const { epp_lista, equipos_lista, insumos_lista } = normalizeEppEquipos(sections.epp_equipos);
  const descripcionTarea = normalizeDescripcionTarea(sections.descripcion_tarea);
  const toList = (v: any): string[] => {
    if (Array.isArray(v)) return v.map(i => (typeof i === 'string' ? i : JSON.stringify(i)));
    if (typeof v === 'string') return v.split('\n').filter(Boolean);
    return v ? [String(v)] : [];
  };

  const data = {
    ...sections,
    epp_lista,
    equipos_lista,
    insumos_lista,
    descripcion_tarea: descripcionTarea,
    riesgos_criticos: Array.isArray(sections.riesgos_criticos) ? sections.riesgos_criticos : [],
    peligros_controles: Array.isArray(sections.peligros_controles) ? sections.peligros_controles : [],
    registros: toList(sections.registros).map(item => ({ item })),
    referencias: toList(sections.referencias).map(item => ({ item })),
    fecha_elaboracion: sections.fecha_elaboracion ?? new Date().toLocaleDateString('es-CL'),
    version: sections.version ?? '1.0',
    codigo_procedimiento: sections.codigo_procedimiento ?? `PROC-${Date.now()}`,
  };

  doc.render(data);

  const out = doc.getZip().generate({ type: 'arraybuffer' });
  return out;
}

/**
 * Carga el template activo desde el directorio de storage local
 * (equivale a loadActivePrototype desde R2)
 */
export async function loadActivePrototype(env: LocalEnv): Promise<ArrayBuffer> {
  const storage = env.storageDir;
  const templateDir = join(storage, 'templates');

  if (!existsSync(templateDir)) {
    throw new Error(`Template directory not found: ${templateDir}`);
  }

  // Buscar archivos .docx en el directorio de templates
  const files = readdirSync(templateDir).filter(f => f.endsWith('.docx'));
  if (files.length === 0) {
    throw new Error('No .docx template found in ' + templateDir);
  }

  // Ordenar por fecha (más reciente primero) — asume nombre con timestamp o alfabético
  files.sort().reverse();
  const templatePath = join(templateDir, files[0]);

  const { readFileSync } = await import('fs');
  const buffer = readFileSync(templatePath);
  console.log(`[DocxGenerator] Template loaded: ${files[0]}`);
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

/**
 * Guarda el DOCX generado en storage local
 */
export async function saveGeneratedDocx(
  docxBuffer: ArrayBuffer,
  requestId: string,
  env: LocalEnv
): Promise<string> {
  const { writeFileSync, mkdirSync, existsSync } = await import('fs');
  const outputDir = join(env.storageDir, 'generated');
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

  const filename = `procedure-${requestId}.docx`;
  const fullPath = join(outputDir, filename);
  writeFileSync(fullPath, Buffer.from(docxBuffer));

  const docxUrl = `/files/generated/${filename}`;
  console.log(`[DocxGenerator] Saved: ${fullPath}`);
  return docxUrl;
}
