// ============================================================================
// WhatsApp Handler — adaptado para LocalEnv (sin ctx.waitUntil)
// ============================================================================

import { LocalEnv, ProcedureRequest } from '../types.js';
import { sendMessage } from './wasender.js';
import { getOrCreateRequest, updateRequest, incrementProceduresGenerated } from '../db/queries.js';
import { extractTaskSteps } from './task-extractor.js';
import { generateProcedure } from './procedure-generator.js';
import { transcribeAudio } from './audio-processor.js';
import { generateConversationalMessage } from './conversation-service.js';
import { saveMessage, cleanExpiredMessages, getConversationContext } from './session-service.js';
import {
  ensureWorkerProfile,
  buildWorkerContext,
  handleFeedbackCommand,
  getProfileAndFeedback,
  detectCommunicationStyle,
} from './profile-service.js';
import {
  createGenerationPlan,
  getPlanByRequest,
  updatePlanFromUserResponse,
  getPendingUserSections,
  generateSectionPreview,
  formatPreviewForWhatsApp,
  formatPlanForDisplay,
  GenerationPlan,
} from './generation-plan-service.js';
import {
  initEvalState,
  evaluateStep,
  markStepOk,
  markStepNeedsDetail,
  applyRefinement as applyStepRefinement,
  isAllEvaluated,
  mergeRefinedSteps,
  buildProgressHeader,
  validateRefinementAnswer,
  EVAL_PASS_SCORE,
} from './step-evaluator.js';

const LOCAL_BASE_URL = `http://localhost:${process.env.PORT ?? 3000}`;

export async function handleWhatsAppMessage(
  phone: string,
  textMessage: string | null,
  audioUrl: string | null,
  pushName: string,
  env: LocalEnv
): Promise<void> {
  console.log(`[WhatsApp] Message from ${phone}: text=${!!textMessage}, audio=${!!audioUrl}`);

  try {
    // Limpiar mensajes expirados (fire and forget)
    cleanExpiredMessages(env.db).catch(e => console.error('[Session] Cleanup error:', e));

    const request = await getOrCreateRequest(phone, pushName ?? 'Usuario', env.db);

    // ── Load / update worker profile ──────────────────────────────────
    const profile = await ensureWorkerProfile(phone, textMessage ?? pushName ?? '', pushName ?? '', env);
    const { feedback: feedbackList } = await getProfileAndFeedback(phone, env);
    const workerContext = buildWorkerContext(profile, feedbackList);

    // ── !feedback command (shortcut, any state) ────────────────────────
    if (textMessage && textMessage.trim().toLowerCase().startsWith('!feedback')) {
      const feedText = textMessage.slice('!feedback'.length).trim();
      if (!feedText) {
        await sendMessage(phone, 'Escribe tu comentario después de !feedback. Ej: *!feedback 5 excelente*', env);
        return;
      }
      const lastProcedureId = request.state === 'completed' ? request.id : null;
      const reply = await handleFeedbackCommand(phone, feedText, lastProcedureId, env);
      await sendMessage(phone, reply, env);
      return;
    }

    // ── Detect communication style from new messages ───────────────────
    if (textMessage) {
      const style = detectCommunicationStyle([textMessage]);
      if (!profile.communication_style || profile.communication_style !== style) {
        await ensureWorkerProfile(phone, textMessage, pushName ?? '', env);
      }
    }

    if (audioUrl) {
      const audioMsg = `🎧 ${pushName ? pushName + ', ' : ''}audio recibido. Transcribiendo...`;
      await sendMessage(phone, audioMsg, env);
      await saveMessage(phone, 'assistant', audioMsg, env);

      const transcription = await transcribeAudio(audioUrl, env);
      await handleTextMessage(request, transcription, pushName, workerContext, env);
    } else if (textMessage) {
      await saveMessage(phone, 'user', textMessage, env);
      await handleTextMessage(request, textMessage, pushName, workerContext, env);
    }
  } catch (error) {
    console.error('[WhatsApp] Error:', error);
    const errorMsg = `❌ ${pushName ? pushName + ', ' : ''}ocurrió un error. Por favor intenta nuevamente.`;
    await sendMessage(phone, errorMsg, env);
  }
}

async function handleTextMessage(
  request: ProcedureRequest,
  message: string,
  userName: string,
  workerContext: string,
  env: LocalEnv
): Promise<void> {
  console.log(`[WhatsApp] state=${request.state}, msg="${message.substring(0, 50)}..."`);

  const conversationHistory = await getConversationContext(request.phone, env);

  // ================================================================
  // STATE: COLLECTING
  // ================================================================
  if (request.state === 'awaiting_audio') {
    const isFirstMessage = !request.transcription;

    if (isFirstMessage) {
      const analyzingMsg = `📝 ${userName ? userName + ', ' : ''}recibido. Analizando tu tarea... ⏳`;
      await sendMessage(request.phone, analyzingMsg, env);
      await saveMessage(request.phone, 'assistant', analyzingMsg, env);

      await updateRequest(request.id, { transcription: message }, env.db);

      const taskSteps = await extractTaskSteps(message, env);
      await updateRequest(request.id, { task_steps: JSON.stringify(taskSteps) }, env.db);

      let plan = await getPlanByRequest(request.id, env);
      if (!plan) {
        plan = await createGenerationPlan(request.id, message, env);
      }

      // Pass a fresh request with the just-saved task_steps (in-memory object is stale)
      await handleCollectionStatus(
        { ...request, task_steps: JSON.stringify(taskSteps) },
        plan, userName, workerContext, conversationHistory, env,
      );

    } else {
      // Follow-up message
      const updatedPlan = await updatePlanFromUserResponse(request.id, message, env);

      if (!updatedPlan) {
        await updateRequest(request.id, { transcription: null }, env.db);
        return handleTextMessage(request, message, userName, workerContext, env);
      }

      const currentTranscription = request.transcription ?? '';
      await updateRequest(request.id, { transcription: currentTranscription + '\n\n' + message }, env.db);

      await handleCollectionStatus(request, updatedPlan, userName, workerContext, conversationHistory, env);
    }

    // ================================================================
    // STATE: REVIEWING (step-by-step evaluation)
    // ================================================================
  } else if (request.state === 'reviewing') {
    await saveMessage(request.phone, 'user', message, env);
    await handleReviewingState(request, message, userName, env);

    // ================================================================
    // STATE: CONFIRMING
    // ================================================================
  } else if (request.state === 'confirming') {
    const plan = await getPlanByRequest(request.id, env);

    if (plan && !plan.preview_content) {
      const loadingMsg = `📋 Generando el resumen detallado... ⏳`;
      await sendMessage(request.phone, loadingMsg, env);
      await saveMessage(request.phone, 'assistant', loadingMsg, env);

      const taskSteps = JSON.parse(request.task_steps ?? '[]');
      const previewJson = await generateSectionPreview(plan, taskSteps, env);

      const previewFormatted = formatPreviewForWhatsApp(previewJson);
      await sendMessage(request.phone, previewFormatted, env);
      await saveMessage(request.phone, 'assistant', previewFormatted, env);

      return;
    }

    const lowerMsg = message.toLowerCase().trim();
    const isApproval =
      lowerMsg.includes('sí') || lowerMsg.includes('si') ||
      lowerMsg.includes('aprobar') || lowerMsg.includes('generar') ||
      lowerMsg.includes('ok') || lowerMsg.includes('dale') ||
      lowerMsg.includes('correcto');

    if (isApproval) {
      const generatingMsg = `⚙️ ${userName ? userName + ', ' : ''}generando el documento DOCX... 30-60 segundos. 📄`;
      await sendMessage(request.phone, generatingMsg, env);
      await saveMessage(request.phone, 'assistant', generatingMsg, env);

      await updateRequest(request.id, { state: 'generating' }, env.db);

      const taskSteps = JSON.parse(request.task_steps ?? '[]');
      const procedure = await generateProcedure(request, taskSteps, env);

      const docxUrl = `${LOCAL_BASE_URL}${procedure.docx_url}`;
      const jsonUrl = `${LOCAL_BASE_URL}/procedures/${procedure.id}/json`;
      const completedMsg = `✅ ¡Procedimiento generado!\n\n📄 *${procedure.title}*\n\n🔗 DOCX: ${docxUrl}\n🔗 JSON: ${jsonUrl}`;
      await sendMessage(request.phone, completedMsg, env);
      await saveMessage(request.phone, 'assistant', completedMsg, env);

      await updateRequest(request.id, { state: 'completed' }, env.db);

      // Increment worker stat
      await incrementProceduresGenerated(request.phone, env.db);

      // Ask for rating
      const ratingMsg = `⭐ ¿Cómo calificarías este procedimiento? Responde con un número del 1 al 5 y opcionalmente un comentario.\nEjemplo: *!feedback 5 muy claro*`;
      await sendMessage(request.phone, ratingMsg, env);
      await saveMessage(request.phone, 'assistant', ratingMsg, env);

    } else {
      const modifyMsg = `📝 ${userName ? userName + ', ' : ''}entendido. Indícame qué cambiar.`;
      await sendMessage(request.phone, modifyMsg, env);
      await saveMessage(request.phone, 'assistant', modifyMsg, env);

      await updateRequest(request.id, { state: 'awaiting_audio' }, env.db);
    }

    // ================================================================
    // UNEXPECTED STATE - reset
    // ================================================================
  } else {
    await updateRequest(request.id, { state: 'awaiting_audio', transcription: null, task_steps: null }, env.db);

    const resetMsg = `📝 ${userName ? userName + ', ' : ''}envía la descripción de la tarea que necesitas documentar.`;
    await sendMessage(request.phone, resetMsg, env);
    await saveMessage(request.phone, 'assistant', resetMsg, env);
  }
}

// ============================================================================
// COLLECTION STATUS
// ============================================================================

async function handleCollectionStatus(
  request: ProcedureRequest,
  plan: GenerationPlan,
  userName: string,
  workerContext: string,
  conversationHistory: string,
  env: LocalEnv
): Promise<void> {
  const pendingSections = getPendingUserSections(plan);

  if (pendingSections.length === 0) {
    // All plan sections collected → start step-by-step review
    const taskSteps = JSON.parse(request.task_steps ?? '[]');
    const evalState  = initEvalState(taskSteps);

    await updateRequest(request.id, {
      state: 'reviewing',
      step_evaluations: JSON.stringify(evalState),
    }, env.db);

    const introMsg = `✅ ${userName ? userName + ', ' : ''}información completa.\n\n` +
      `Antes de generar el documento voy a revisar contigo cada paso para asegurarme de que queden suficientemente detallados para el estándar DS132.\n\n` +
      `⏳ Comenzando revisión...`;
    await sendMessage(request.phone, introMsg, env);
    await saveMessage(request.phone, 'assistant', introMsg, env);

    // Kick off the first step evaluation (pass null so it knows it's the start)
    await processNextStep({ ...request, state: 'reviewing', step_evaluations: JSON.stringify(evalState) }, userName, env);

  } else {
    const progressDisplay = formatPlanForDisplay(plan);
    const nextQuestion = pendingSections[0].question ?? `Por favor proporciona: ${pendingSections[0].label}`;

    const questionsMsg = await generateConversationalMessage('asking_questions', {
      userName,
      questions: [nextQuestion],
      feedback: progressDisplay,
      conversationHistory,
      workerContext,
    }, env);
    await sendMessage(request.phone, questionsMsg, env);
    await saveMessage(request.phone, 'assistant', questionsMsg, env);

    console.log(`[WhatsApp] Plan: ${plan.completeness}% complete, asking about '${pendingSections[0].key}'`);
  }
}

// ============================================================================
// REVIEWING STATE — step-by-step evaluation loop
// ============================================================================

/**
 * Called when the user sends a message while in `reviewing` state.
 * If we were waiting for their refinement, apply it first, then continue.
 */
async function handleReviewingState(
  request: ProcedureRequest,
  message: string,
  userName: string,
  env: LocalEnv
): Promise<void> {
  const rawState = request.step_evaluations;
  let evalState = rawState ? JSON.parse(rawState) : null;
  const taskSteps = JSON.parse(request.task_steps ?? '[]');

  if (!evalState) {
    evalState = initEvalState(taskSteps);
    await updateRequest(request.id, { step_evaluations: JSON.stringify(evalState) }, env.db);
  }

  if (evalState.awaitingRefinement) {
    // Validate that the answer actually addresses what was asked
    const currentEval = evalState.evaluations[evalState.currentIndex];
    const pendingQ    = currentEval?.pendingQuestion ?? '';
    const issues      = currentEval?.issues ?? [];
    const stepDesc    = currentEval?.originalDesc ?? '';

    const validation = await validateRefinementAnswer(stepDesc, pendingQ, issues, message, env);

    if (!validation.ok) {
      // Answer didn't address the question — ask more specifically (one re-try)
      const reAskMsg =
        `✏️ Necesito un poco más de detalle en ese paso\u2026\n\n` +
        `❓ ${validation.followUp || pendingQ}`;
      await sendMessage(request.phone, reAskMsg, env);
      await saveMessage(request.phone, 'assistant', reAskMsg, env);
      return; // stay in awaitingRefinement, same step
    }

    // Answer accepted — apply and advance
    evalState = applyStepRefinement(evalState, message);
    await updateRequest(request.id, { step_evaluations: JSON.stringify(evalState) }, env.db);
    const ackMsg = `✏️ Anotado. Continuando con el siguiente paso…`;
    await sendMessage(request.phone, ackMsg, env);
    await saveMessage(request.phone, 'assistant', ackMsg, env);
  }

  await processNextStep({ ...request, step_evaluations: JSON.stringify(evalState) }, userName, env);
}

/**
 * Evaluates steps sequentially, sending a question when a step fails,
 * or transitioning to `confirming` when all steps pass.
 */
async function processNextStep(
  request: ProcedureRequest,
  userName: string,
  env: LocalEnv
): Promise<void> {
  const taskSteps = JSON.parse(request.task_steps ?? '[]');
  let evalState = JSON.parse(request.step_evaluations ?? 'null') ?? initEvalState(taskSteps);

  // Iterate (loop instead of recursion to handle long step lists)
  while (!isAllEvaluated(evalState)) {
    if (evalState.currentIndex >= taskSteps.length) break; // safety guard
    if (evalState.awaitingRefinement) break;               // waiting for user input

    const step = taskSteps[evalState.currentIndex];
    const stepNum   = evalState.currentIndex + 1;
    const totalSteps = taskSteps.length;
    const context   = request.transcription ?? '';

    const waitMsg = `🔍 Evaluando paso ${stepNum}/${totalSteps}: *"${step.description.substring(0, 60)}..."*`;
    await sendMessage(request.phone, waitMsg, env);

    const result = await evaluateStep(step, stepNum, totalSteps, context, env);

    console.log(`[StepEval] Step ${stepNum}/${totalSteps} score=${result.score} issues=${result.issues.length}`);

    if (result.score >= EVAL_PASS_SCORE) {
      evalState = markStepOk(evalState, result.score);
      await updateRequest(request.id, { step_evaluations: JSON.stringify(evalState) }, env.db);
      // If that was the last step, loop condition will exit
    } else {
      evalState = markStepNeedsDetail(evalState, result.score, result.issues, result.question);
      await updateRequest(request.id, { step_evaluations: JSON.stringify(evalState) }, env.db);

      const progress  = buildProgressHeader(evalState);
      const issueText = result.issues.length
        ? result.issues.map(i => `  • ${i}`).join('\n')
        : '';

      const question = result.question || 'Por favor describe este paso con más detalle (qué hacer exactamente, con qué herramientas y bajo qué condiciones).';
      const detailMsg =
        `${progress}\n\n` +
        `⚠️ *Paso ${stepNum}:* "${step.description}"\n\n` +
        (issueText ? `Necesito más detalle en:\n${issueText}\n\n` : '') +
        `❓ ${question}`;

      await sendMessage(request.phone, detailMsg, env);
      await saveMessage(request.phone, 'assistant', detailMsg, env);
      return; // wait for user reply
    }
  }

  // ── All steps evaluated → transition to confirming ──────────────────────
  if (isAllEvaluated(evalState)) {
    const updatedSteps = mergeRefinedSteps(taskSteps, evalState);
    await updateRequest(request.id, {
      task_steps: JSON.stringify(updatedSteps),
      state: 'confirming',
    }, env.db);

    const refinedCount = evalState.evaluations.filter((e: { status: string }) => e.status === 'refined').length;
    const progressSummary = buildProgressHeader(evalState);

    const doneMsg =
      `${progressSummary}\n\n` +
      `✅ *Revisión completada.*\n` +
      (refinedCount > 0 ? `Se incorporaron ${refinedCount} aclaración(es) a los pasos.\n\n` : '\n') +
      `Responde *"generar"* para ver el resumen detallado del procedimiento.`;

    await sendMessage(request.phone, doneMsg, env);
    await saveMessage(request.phone, 'assistant', doneMsg, env);
  }
}
