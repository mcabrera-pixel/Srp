// ============================================================================
// Procedure Generator — adaptado para LocalEnv
// ============================================================================

import { LocalEnv, ProcedureRequest, TaskStep, GeneratedProcedure } from '../types.js';
import { searchRelevantContext } from './rag.js';
import { analyzeRisks } from './risk-analyzer.js';
import { generateSectionContent } from './content-generator.js';
import { generateDocxFromPrototype, loadActivePrototype, saveGeneratedDocx } from './docx-generator.js';
import { getAllRisksForProcedure } from './fatality-risk-service.js';

export async function generateProcedure(
  request: ProcedureRequest,
  taskSteps: TaskStep[],
  env: LocalEnv
): Promise<GeneratedProcedure> {
  console.log(`[ProcedureGenerator] Starting DOCX generation for request ${request.id}`);

  // 1. Cargar template desde storage local
  const prototypeBuffer = await loadActivePrototype(env);

  // 2. Buscar contexto de riesgos via RAG (no-fatal: si falla, continúa sin contexto)
  let riskContext: string[] = [];
  try {
    riskContext = await searchRelevantContext(
      request.transcription ?? '',
      ['risk_critical', 'risk_general'],
      env,
      10
    );
  } catch (e: any) {
    console.warn(`[ProcedureGenerator] RAG risk search failed (continuing without context): ${e.message}`);
  }

  // 3. Buscar procedimientos similares aprobados (no-fatal)
  let approvedContext: string[] = [];
  try {
    approvedContext = await searchRelevantContext(
      request.transcription ?? '',
      ['approved_procedure'],
      env,
      5
    );
  } catch (e: any) {
    console.warn(`[ProcedureGenerator] RAG procedure search failed (continuing without context): ${e.message}`);
  }

  // 4. Generar contenido de secciones con LLM
  const sectionContent = await generateSectionContent(
    request.transcription ?? '',
    taskSteps,
    riskContext,
    approvedContext,
    env
  );

  // 5. Obtener riesgos de fatalidad + zona desde DB
  const zone = (request as any).zone ?? null;
  const riesgos_criticos = await getAllRisksForProcedure(request.transcription ?? '', zone, env);

  const sectionContentWithRisks = { ...sectionContent, riesgos_criticos };

  // 6. Generar DOCX desde prototipo
  const docxBuffer = await generateDocxFromPrototype(prototypeBuffer, sectionContentWithRisks);

  // 7. Guardar DOCX en storage local
  const docxUrl = await saveGeneratedDocx(docxBuffer, request.id, env);

  // 8. Persisitir en DB
  const now = new Date().toISOString();
  const procedureId = crypto.randomUUID();
  const title = sectionContent.objetivo
    ? `Procedimiento: ${(sectionContent.objetivo as string).substring(0, 60)}`
    : `Procedimiento ${request.id}`;

  const generatedProcedure: GeneratedProcedure = {
    id: procedureId,
    request_id: request.id,
    title,
    content: JSON.stringify(sectionContentWithRisks),
    version: '1.0',
    status: 'draft',
    created_at: now,
    updated_at: now,
    expires_at: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    pdf_url: null,
    docx_url: docxUrl,
  };

  env.db
    .prepare(
      `INSERT INTO procedures (id, request_id, title, content, version, status, created_at, updated_at, expires_at, docx_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      procedureId, request.id, title,
      JSON.stringify(sectionContentWithRisks),
      '1.0', 'draft', now, now,
      generatedProcedure.expires_at, docxUrl
    );

  console.log(`[ProcedureGenerator] Procedure saved: ${procedureId}`);
  return generatedProcedure;
}
