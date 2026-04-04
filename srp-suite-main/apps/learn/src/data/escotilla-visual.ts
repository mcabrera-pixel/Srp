import { Procedure } from '../types';

/**
 * Procedimiento: Fabricación de Escotilla en Grating
 * Versión VISUAL — cada paso del procedimiento real tiene su propia slide.
 *
 * Estructura: 13 slides individuales, cada una con imagen específica.
 * - Slide 1: Introducción / contexto
 * - Slide 2: EPP obligatorio
 * - Slide 3: Verificaciones previas
 * - Slides 4–9: Los 6 pasos reales de la tarea
 * - Slide 10: Riesgos críticos (resumen visual)
 * - Slide 11: Plan de emergencia
 * - Slide 12: Orden y limpieza post-tarea
 * - Slide 13: Cierre motivacional
 */
export const PROCEDURE_ESCOTILLA_VISUAL: Procedure = {
    id: 'proc-escotilla-grating-visual',
    titulo: 'Fabricación de Escotilla en Grating',
    subtitulo: 'Procedimiento Seguro — Taller de Soldadura',
    duracion_total: 130,
    metadata: {
        version: '2.0',
        fecha_vigencia: '2025-01-15',
        normativa: ['NCh 2245', 'DS Nº 594', 'ISO 3834-2'],
    },
    pasos: [
        // ===== SLIDE 1: INTRODUCCIÓN =====
        {
            numero: 1,
            titulo: 'Fabricación de Escotilla',
            contenido: 'Procedimiento seguro para la fabricación e instalación de escotillas en grating. Taller de soldadura y mantenimiento mecánico.',
            duracion: 8,
            imagen: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1920&q=80',
            riesgo: 'alto',
        },

        // ===== SLIDE 2: EPP OBLIGATORIO =====
        {
            numero: 2,
            titulo: 'EPP Obligatorio',
            contenido: 'Casco de seguridad\nLentes de protección\nGuantes de cuero\nZapatos de seguridad con puntera\nChaleco reflectante\nProtector auditivo',
            duracion: 10,
            imagen: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&q=80',
            epp: ['casco', 'lentes', 'guantes', 'zapatos', 'chaleco', 'protector_auditivo'],
        },

        // ===== SLIDE 3: VERIFICACIONES PREVIAS =====
        {
            numero: 3,
            titulo: 'Verificaciones Previas',
            contenido: 'Inspeccionar zona de trabajo libre de materiales combustibles\nVerificar estado de equipos de corte y soldadura\nConfirmar ventilación adecuada del taller\nRevisar permisos de trabajo en caliente',
            duracion: 10,
            imagen: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=1920&q=80',
            riesgo: 'medio',
            epp: ['casco', 'lentes', 'chaleco'],
        },

        // ===== SLIDE 4: PASO 1 — MEDICIÓN Y TRAZADO =====
        {
            numero: 4,
            titulo: 'Medición y Trazado',
            contenido: 'Medir la abertura requerida según plano técnico. Trazar líneas de corte con tiza o marcador industrial sobre la plancha de grating.',
            duracion: 10,
            imagen: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1920&q=80',
            riesgo: 'bajo',
            epp: ['casco', 'lentes', 'guantes'],
        },

        // ===== SLIDE 5: PASO 2 — CORTE CON ESMERIL =====
        {
            numero: 5,
            titulo: 'Corte con Esmeril Angular',
            contenido: 'Fijar pieza con prensas. Realizar corte siguiendo el trazado con disco de corte adecuado. Mantener ángulo constante y velocidad controlada.',
            duracion: 10,
            imagen: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1920&q=80',
            riesgo: 'alto',
            epp: ['casco', 'lentes', 'guantes', 'protector_auditivo'],
            quiz: {
                pregunta: '¿Qué se debe verificar ANTES de iniciar el corte con esmeril?',
                opciones: [
                    'Estado del disco y protección del esmeril',
                    'El color de la pintura del grating',
                    'La temperatura ambiente',
                    'El horario de almuerzo',
                ],
                correcta: 0,
            },
        },

        // ===== SLIDE 6: PASO 3 — DESBASTE Y PREPARACIÓN =====
        {
            numero: 6,
            titulo: 'Desbaste y Preparación de Bordes',
            contenido: 'Desbastar bordes cortados para eliminar rebabas y preparar bisel para soldadura. Verificar dimensiones finales de la escotilla.',
            duracion: 10,
            imagen: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1920&q=80',
            riesgo: 'medio',
            epp: ['casco', 'lentes', 'guantes'],
        },

        // ===== SLIDE 7: PASO 4 — SOLDADURA =====
        {
            numero: 7,
            titulo: 'Soldadura de Marco',
            contenido: 'Soldar marco perimetral de la escotilla al grating. Aplicar cordones según procedimiento WPS. Verificar penetración y continuidad del cordón.',
            duracion: 12,
            imagen: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1920&q=80',
            riesgo: 'critico',
            epp: ['casco', 'lentes', 'guantes', 'respirador', 'protector_auditivo'],
            quiz: {
                pregunta: '¿Cuál es el riesgo PRINCIPAL durante la soldadura?',
                opciones: [
                    'Ruido excesivo',
                    'Exposición a radiación UV y humos metálicos',
                    'Resbalones en el piso',
                    'Fatiga visual',
                ],
                correcta: 1,
            },
        },

        // ===== SLIDE 8: PASO 5 — INSTALACIÓN DE BISAGRAS =====
        {
            numero: 8,
            titulo: 'Instalación de Bisagras y Seguro',
            contenido: 'Posicionar y soldar bisagras según diseño. Instalar cadena o cable de seguridad para evitar caída de la tapa. Verificar apertura y cierre funcional.',
            duracion: 10,
            imagen: 'https://images.unsplash.com/photo-1590959651373-a3db0f38a961?w=1920&q=80',
            riesgo: 'alto',
            epp: ['casco', 'lentes', 'guantes', 'arnes'],
        },

        // ===== SLIDE 9: PASO 6 — PINTURA Y ACABADO =====
        {
            numero: 9,
            titulo: 'Pintura y Acabado Final',
            contenido: 'Aplicar pintura anticorrosiva en todas las superficies soldadas. Señalizar bordes de escotilla con pintura amarilla de seguridad. Dejar secar según especificaciones del fabricante.',
            duracion: 10,
            imagen: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80',
            riesgo: 'bajo',
            epp: ['casco', 'lentes', 'guantes', 'respirador'],
        },

        // ===== SLIDE 10: RIESGOS CRÍTICOS =====
        {
            numero: 10,
            titulo: 'Riesgos Críticos y Controles',
            contenido: 'Proyección de partículas → Usar lentes y pantalla facial\nQuemaduras por soldadura → Usar guantes de cuero largo\nHumos metálicos → Ventilación forzada y respirador\nIncendio por chispas → Manta ignífuga y extintor a 5m\nAtrapamiento → Bloqueo de energías antes de intervenir\nCaída de tapa → Cadena de seguridad obligatoria',
            duracion: 14,
            imagen: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=1920&q=80',
            riesgo: 'critico',
            epp: ['casco', 'lentes', 'guantes', 'zapatos', 'arnes', 'respirador', 'protector_auditivo'],
        },

        // ===== SLIDE 11: PLAN DE EMERGENCIA =====
        {
            numero: 11,
            titulo: 'Plan de Emergencia',
            contenido: 'Comunicar emergencia al supervisor inmediatamente\nActivar alarma de zona y solicitar apoyo\nUsar extintor tipo ABC para amagos de incendio\nAplicar primeros auxilios si hay lesiones\nEvacuar hacia punto de reunión si es necesario',
            duracion: 10,
            imagen: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=1920&q=80',
            riesgo: 'alto',
        },

        // ===== SLIDE 12: ORDEN Y LIMPIEZA =====
        {
            numero: 12,
            titulo: 'Orden y Limpieza Post-Tarea',
            contenido: 'Retirar todos los residuos de corte y soldadura\nAlmacenar herramientas en lugar designado\nVerificar que no queden fuentes de calor activas\nDejar zona de trabajo en condiciones seguras',
            duracion: 8,
            imagen: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80',
            riesgo: 'bajo',
            epp: ['casco', 'lentes', 'chaleco'],
        },

        // ===== SLIDE 13: CIERRE MOTIVACIONAL =====
        {
            numero: 13,
            titulo: 'Tu Seguridad es lo Primero',
            contenido: 'Cada paso que haces con seguridad es un paso hacia tu familia. Trabaja seguro, trabaja con orgullo.',
            duracion: 8,
            imagen: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1920&q=80',
        },
    ],
};
