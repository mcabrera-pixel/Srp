// ============================================================================
// Prompt Store — gestión centralizada de prompts editables en runtime
//
// Uso:
//   import { getPrompt, initPromptStore } from './prompt-store.js';
//
//   // En server.ts (una vez al arrancar):
//   initPromptStore('./data/prompts.json');
//
//   // En cualquier servicio:
//   const text = getPrompt('task_extractor.user', { description: '...' });
//
// Placeholders: {{nombreVariable}} — se reemplazan con vars pasadas a getPrompt().
// ============================================================================

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname } from 'path';
import { mkdirSync } from 'fs';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PromptEntry {
  id: string;
  label: string;
  description: string;
  category: string;
  /** Placeholders disponibles en este prompt (solo informativo para la UI) */
  placeholders: string[];
  default: string;
  /** Contenido actual (puede ser igual al default si no se ha editado) */
  current: string;
  isModified: boolean;
}

// ── Default prompts ───────────────────────────────────────────────────────────

const DEFAULTS: Omit<PromptEntry, 'current' | 'isModified'>[] = [

  // ── Task Extractor ─────────────────────────────────────────────────────────
  {
    id: 'task_extractor.system',
    label: 'Extractor de pasos — sistema',
    description: 'System prompt para extraer los pasos de una tarea desde la descripción del usuario',
    category: 'Extractor de Pasos',
    placeholders: [],
    default:
`Eres un experto en procedimientos mineros. Tu objetivo es analizar descripciones de tareas
y extraer los pasos en orden secuencial lógico.
Debes ser preciso y detallado, identificando todos los pasos necesarios para completar la tarea de forma segura.
Responde SIEMPRE en español. Jamás uses otro idioma.`,
  },
  {
    id: 'task_extractor.user',
    label: 'Extractor de pasos — usuario',
    description: 'Prompt de usuario para la extracción de pasos. Usa {{description}} para insertar la descripción.',
    category: 'Extractor de Pasos',
    placeholders: ['description'],
    default:
`Analiza la siguiente descripción de una tarea minera y extrae los pasos en orden secuencial lógico.

DESCRIPCIÓN DE LA TAREA:
"""
{{description}}
"""

INSTRUCCIONES:
- Identifica cada paso distinto de la tarea
- Ordénalos cronológicamente
- Para cada paso indica duración estimada, si requiere supervisión, equipos y notas de seguridad

FORMATO DE SALIDA (JSON):
{
  "steps": [
    {
      "order": 1,
      "description": "Descripción detallada del paso",
      "estimated_duration": "X minutos/horas",
      "requires_supervision": true/false,
      "equipment_needed": ["equipo1", "equipo2"],
      "safety_notes": "Notas de seguridad importantes"
    }
  ]
}

Responde SOLO con el JSON, sin explicaciones adicionales.`,
  },

  // ── Content Generator ──────────────────────────────────────────────────────
  {
    id: 'content_generator.system',
    label: 'Generador de contenido — sistema',
    description: 'System prompt para la generación de secciones del procedimiento DOCX',
    category: 'Generador de Contenido',
    placeholders: [],
    default:
`Eres un experto en redacción de procedimientos mineros según normativa chilena.
Tu tarea es generar el contenido para cada sección de un procedimiento estándar.
Debes ser técnico, preciso y enfocado en seguridad.
Responde SIEMPRE en español chileno. Jamás uses otro idioma.
Responde SOLO en formato JSON, sin explicaciones adicionales.`,
  },
  {
    id: 'content_generator.user',
    label: 'Generador de contenido — usuario',
    description: 'Prompt de usuario para generación de contenido. Placeholders: {{taskDescription}}, {{taskSteps}}, {{riskContext}}, {{approvedContext}}',
    category: 'Generador de Contenido',
    placeholders: ['taskDescription', 'taskSteps', 'riskContext', 'approvedContext'],
    default:
`Genera el contenido para un procedimiento minero basándote en la siguiente información.
Todo el contenido debe estar en español chileno. Ningún texto en otro idioma.

## DESCRIPCIÓN DE LA TAREA
{{taskDescription}}

## PASOS DE LA TAREA IDENTIFICADOS
{{taskSteps}}

## CONTEXTO DE RIESGOS (de matrices de riesgo)
{{riskContext}}

## PROCEDIMIENTOS SIMILARES APROBADOS
{{approvedContext}}

## FORMATO DE SALIDA (JSON)
{
  "objetivo": "Texto del objetivo",
  "alcance": "Texto del alcance",
  "responsabilidades": "Responsabilidades por cargo",
  "definiciones": "Términos y definiciones",
  "epp_equipos": {
    "EPP": ["Ítem 1", "Ítem 2"],
    "Equipos_Herramientas": ["Herramienta 1"],
    "Insumos": ["Insumo 1"]
  },
  "competencias": "Competencias requeridas",
  "descripcion_tarea": [
    { "titulo": "Paso 1: Nombre", "contenido": "- Sub-paso 1\\n- Sub-paso 2" }
  ],
  "bloqueo_energias": "Procedimiento de bloqueo si aplica",
  "peligros_controles": [
    { "Peligro": "Descripción peligro", "Riesgo": "Descripción riesgo", "Control": "Medida de control" }
  ],
  "emergencias": "Procedimiento de emergencia",
  "medio_ambiente": "Consideraciones ambientales",
  "registros": ["Registro 1", "Registro 2"],
  "referencias": ["DS N°132", "Norma X"],
  "evaluacion": "Criterio de evaluación"
}

Responde SOLO con el JSON.`,
  },

  // ── Step Evaluator ─────────────────────────────────────────────────────────
  {
    id: 'step_evaluator.system',
    label: 'Evaluador de pasos — sistema',
    description: 'System prompt para la evaluación de calidad de cada paso del procedimiento',
    category: 'Evaluador de Pasos',
    placeholders: [],
    default:
`Eres un evaluador técnico de procedimientos mineros. Responde ÚNICAMENTE con JSON válido en español.`,
  },
  {
    id: 'step_evaluator.user',
    label: 'Evaluador de pasos — usuario',
    description: 'Prompt para evaluar la calidad de un paso. Placeholders: {{procedureContext}}, {{stepNumber}}, {{totalSteps}}, {{stepDescription}}, {{estimatedDuration}}, {{requiresSupervision}}, {{equipmentNeeded}}, {{safetyNotes}}',
    category: 'Evaluador de Pasos',
    placeholders: ['procedureContext', 'stepNumber', 'totalSteps', 'stepDescription', 'estimatedDuration', 'requiresSupervision', 'equipmentNeeded', 'safetyNotes'],
    default:
`Eres un experto en seguridad minera evaluando pasos de procedimientos escritos según estándares DS132 y OHSAS.

CONTEXTO DEL PROCEDIMIENTO: "{{procedureContext}}"

PASO {{stepNumber}} de {{totalSteps}}:
- Descripción: "{{stepDescription}}"
- Duración estimada: {{estimatedDuration}}
- Requiere supervisión: {{requiresSupervision}}
- Equipos/herramientas: {{equipmentNeeded}}
- Notas de seguridad: {{safetyNotes}}

EVALÚA con estos criterios:
1. ¿Tiene una acción concreta y verificable (verbo + objeto + condición)?
2. ¿Menciona herramientas, EPP o equipos específicos si aplica?
3. ¿Es ejecutable por alguien sin experiencia previa en esa operación?
4. ¿Incluye precauciones de seguridad si la acción tiene riesgo?
5. ¿La duración estimada es coherente con la complejidad del paso?

Responde SOLO con JSON válido (sin markdown, sin texto adicional):
{
  "score": <número entero 1-10>,
  "issues": [<máximo 3 problemas específicos y concretos, vacío si no hay>],
  "question": "<si score < 7: pregunta directa al trabajador para obtener el detalle que falta; si score >= 7: cadena vacía>"
}`,
  },

  // ── Step Validator (refinement) ────────────────────────────────────────────
  {
    id: 'step_validator.system',
    label: 'Validador de refinamiento — sistema',
    description: 'System prompt para validar si la respuesta del usuario aborda suficientemente los problemas del paso',
    category: 'Evaluador de Pasos',
    placeholders: [],
    default:
`Eres un evaluador técnico de procedimientos mineros. Responde únicamente con JSON válido en español.`,
  },
  {
    id: 'step_validator.user',
    label: 'Validador de refinamiento — usuario',
    description: 'Valida si la respuesta del usuario resuelve el problema. Placeholders: {{stepDesc}}, {{question}}, {{issues}}, {{answer}}',
    category: 'Evaluador de Pasos',
    placeholders: ['stepDesc', 'question', 'issues', 'answer'],
    default:
`Paso del procedimiento: "{{stepDesc}}"
Pregunta hecha al trabajador: "{{question}}"
Problemas identificados: {{issues}}
Respuesta del trabajador: "{{answer}}"

¿La respuesta aborda suficientemente los problemas y la pregunta? Responde SOLO JSON: {"ok":true} o {"ok":false,"followUp":"<pregunta más específica al trabajador, máximo 1 línea>"}`,
  },

  // ── Risk Selector ──────────────────────────────────────────────────────────
  {
    id: 'risk_selector.system',
    label: 'Selector de riesgos — sistema',
    description: 'System prompt para seleccionar los riesgos de fatalidad aplicables a un procedimiento',
    category: 'Riesgos de Fatalidad',
    placeholders: [],
    default:
`Eres un experto en seguridad minera. Responde SIEMPRE en español.`,
  },
  {
    id: 'risk_selector.user',
    label: 'Selector de riesgos — usuario',
    description: 'Selecciona los códigos de riesgos aplicables al procedimiento. Placeholders: {{taskDescription}}, {{riskList}}',
    category: 'Riesgos de Fatalidad',
    placeholders: ['taskDescription', 'riskList'],
    default:
`Dado el siguiente procedimiento minero, selecciona los códigos de riesgos de fatalidad aplicables.

TAREA: {{taskDescription}}

LISTA DE RIESGOS DISPONIBLES:
{{riskList}}

Responde SOLO con un JSON array de códigos: ["RF01", "RF02", ...]
Si ninguno aplica, responde: []`,
  },

  // ── Conversation Service ───────────────────────────────────────────────────
  {
    id: 'conversation.system',
    label: 'Conversación — sistema',
    description: 'System prompt base para todos los mensajes conversacionales del asistente hacia los trabajadores',
    category: 'Conversación WhatsApp',
    placeholders: ['workerContext'],
    default:
`Eres un asistente virtual amigable de seguridad minera.
Tu trabajo es comunicarte con operadores mineros de forma natural y cálida.
REGLAS:
- Mensajes CORTOS (máximo 3-4 líneas)
- Tono profesional pero cercano
- Usa emojis con moderación (1-2 por mensaje)
- Personaliza usando el nombre del usuario
- En español chileno natural
- SIEMPRE en español. NUNCA uses otro idioma.
- NUNCA inventes información técnica`,
  },
  {
    id: 'conversation.audio_received',
    label: 'Conversación — audio recibido',
    description: 'Mensaje cuando el usuario envía un audio. Placeholder: {{name}} (con coma: ", Nombre")',
    category: 'Conversación WhatsApp',
    placeholders: ['name'],
    default: `El usuario{{name}} envió un audio. Confirma que lo recibiste y que estás transcribiendo.`,
  },
  {
    id: 'conversation.analyzing',
    label: 'Conversación — analizando',
    description: 'Mensaje mientras se analiza la tarea. Placeholders: {{name}}, {{taskSummary}}',
    category: 'Conversación WhatsApp',
    placeholders: ['name', 'taskSummary'],
    default: `Comunica{{name}} que estás analizando la tarea. Tarea: {{taskSummary}}`,
  },
  {
    id: 'conversation.asking_questions',
    label: 'Conversación — haciendo preguntas',
    description: 'Cuando se necesita más información. Placeholders: {{name}}, {{questions}}',
    category: 'Conversación WhatsApp',
    placeholders: ['name', 'questions'],
    default: `Necesitas más información{{name}}. Preguntas: {{questions}}. Formula solo la PRIMERA pregunta de forma natural.`,
  },
  {
    id: 'conversation.confirming_steps',
    label: 'Conversación — confirmando pasos',
    description: 'Presenta los pasos para confirmación. Placeholders: {{name}}, {{steps}}',
    category: 'Conversación WhatsApp',
    placeholders: ['name', 'steps'],
    default: `Presenta{{name}} estos pasos para confirmación:\n{{steps}}\nPide que confirmen con ✅ o corrijan con ✏️.`,
  },
  {
    id: 'conversation.reviewing',
    label: 'Conversación — revisando',
    description: 'Informa que se está revisando el borrador. Placeholders: {{name}}, {{feedback}}',
    category: 'Conversación WhatsApp',
    placeholders: ['name', 'feedback'],
    default: `Informa{{name}} que está revisando el borrador. Feedback: {{feedback}}`,
  },
  {
    id: 'conversation.generating',
    label: 'Conversación — generando',
    description: 'Informa que se está generando el procedimiento. Placeholders: {{name}}, {{procedureTitle}}',
    category: 'Conversación WhatsApp',
    placeholders: ['name', 'procedureTitle'],
    default: `Informa{{name}} que está generando el procedimiento "{{procedureTitle}}". Tardará un momento.`,
  },
  {
    id: 'conversation.completed',
    label: 'Conversación — completado',
    description: 'Notifica que el procedimiento está listo. Placeholders: {{name}}, {{procedureTitle}}, {{downloadUrl}}',
    category: 'Conversación WhatsApp',
    placeholders: ['name', 'procedureTitle', 'downloadUrl'],
    default: `Informa{{name}} que el procedimiento "{{procedureTitle}}" está listo. URL: {{downloadUrl}}`,
  },
  {
    id: 'conversation.modify_request',
    label: 'Conversación — solicitud de modificación',
    description: 'Cuando el usuario quiere modificar algo. Placeholder: {{name}}',
    category: 'Conversación WhatsApp',
    placeholders: ['name'],
    default: `El usuario{{name}} quiere modificar. Pregunta qué cambio necesita.`,
  },
  {
    id: 'conversation.error',
    label: 'Conversación — error',
    description: 'Mensaje de error amable. Placeholder: {{name}}',
    category: 'Conversación WhatsApp',
    placeholders: ['name'],
    default: `Informa{{name}} de un error técnico amablemente. Pide que intente nuevamente.`,
  },
];

// ── Store state ───────────────────────────────────────────────────────────────

let _filePath = './data/prompts.json';
let _overrides: Record<string, string> = {};

// ── Init ──────────────────────────────────────────────────────────────────────

export function initPromptStore(filePath: string): void {
  _filePath = filePath;
  try {
    if (existsSync(filePath)) {
      const raw = readFileSync(filePath, 'utf-8');
      _overrides = JSON.parse(raw) as Record<string, string>;
      const count = Object.keys(_overrides).length;
      console.log(`[PromptStore] Loaded ${count} override(s) from ${filePath}`);
    } else {
      console.log('[PromptStore] No overrides file found — using defaults');
    }
  } catch (e) {
    console.warn('[PromptStore] Could not load overrides, using defaults:', e);
    _overrides = {};
  }
}

function saveToDisk(): void {
  try {
    const dir = _filePath.replace(/[\\/][^\\/]+$/, '');
    if (dir && !existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(_filePath, JSON.stringify(_overrides, null, 2), 'utf-8');
  } catch (e) {
    console.error('[PromptStore] Could not save overrides:', e);
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Returns the current prompt text for `id`, replacing {{key}} with vars[key].
 * Falls back to default if no user override exists.
 */
export function getPrompt(id: string, vars?: Record<string, string>): string {
  const entry = DEFAULTS.find(d => d.id === id);
  if (!entry) {
    console.warn(`[PromptStore] Unknown prompt id: ${id}`);
    return '';
  }
  let text = _overrides[id] ?? entry.default;
  if (vars) {
    for (const [key, value] of Object.entries(vars)) {
      text = text.replaceAll(`{{${key}}}`, value);
    }
  }
  return text;
}

/** Updates (or creates) a user override for the given prompt id. */
export function setPrompt(id: string, content: string): void {
  const entry = DEFAULTS.find(d => d.id === id);
  if (!entry) throw new Error(`Unknown prompt id: ${id}`);
  _overrides[id] = content;
  saveToDisk();
  console.log(`[PromptStore] Updated prompt: ${id}`);
}

/** Removes user override, restoring the default. */
export function resetPrompt(id: string): void {
  const entry = DEFAULTS.find(d => d.id === id);
  if (!entry) throw new Error(`Unknown prompt id: ${id}`);
  delete _overrides[id];
  saveToDisk();
  console.log(`[PromptStore] Reset prompt to default: ${id}`);
}

/** Returns the full catalog with current content and isModified flag. */
export function getAllPrompts(): PromptEntry[] {
  return DEFAULTS.map(d => ({
    ...d,
    current: _overrides[d.id] ?? d.default,
    isModified: d.id in _overrides,
  }));
}

/** Returns a single prompt entry (with current content). */
export function getPromptEntry(id: string): PromptEntry | undefined {
  const d = DEFAULTS.find(e => e.id === id);
  if (!d) return undefined;
  return { ...d, current: _overrides[d.id] ?? d.default, isModified: d.id in _overrides };
}
