import { Procedure } from '../types';

// Procedimiento: Fabricación de Escotilla en Grating
// Video de capacitación de seguridad para trabajadores de mantenimiento en faena minera
// Imágenes curadas de Unsplash — reemplazar con fotos propias de faena cuando estén disponibles
export const PROCEDURE_ESCOTILLA: Procedure = {
    id: 'proc-escotilla-grating',
    titulo: 'Fabricación de Escotilla en Grating',
    subtitulo: 'Procedimiento Seguro — Taller de Soldadura y Mantenimiento Mecánico',
    duracion_total: 120,
    metadata: {
        version: '1.0',
        fecha_vigencia: '2026-02-01',
        normativa: ['DS 132', 'DS 594'],
    },
    pasos: [
        // ────────────────────────────────────────────────
        // SECCIÓN 1: INTRODUCCIÓN (10 seg)
        // Imagen: Plano general de taller de soldadura industrial con grating metálico
        // ────────────────────────────────────────────────
        {
            numero: 1,
            titulo: 'Introducción',
            contenido:
                'Este procedimiento aplica a tareas de fabricación, corte, soldadura e instalación de escotillas en grating en talleres de soldadura y áreas de mantenimiento mecánico.',
            duracion: 10,
            // Taller de soldadura industrial con estructuras metálicas
            imagen: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1920&q=80',
            riesgo: 'medio',
            epp: ['casco', 'lentes', 'guantes'],
        },

        // ────────────────────────────────────────────────
        // SECCIÓN 2: EPP OBLIGATORIO (15 seg)
        // Imagen: Soldador con equipo completo de protección personal
        // ────────────────────────────────────────────────
        {
            numero: 2,
            titulo: 'EPP Obligatorio',
            contenido:
                'Antes de comenzar, debes contar con: tenida de cuero completo, máscara de soldar, lentes de seguridad, guantes de cuero para soldadura, casco de seguridad y tenida ignífuga. Equipos: máquina de soldar 150 amperes, esmeril angular 4½". Insumos: varilla de soldar 7/8 y 3/32" E6011 o E7018, disco de corte fino y pintura de acabado.',
            duracion: 15,
            // Soldador con EPP completo: máscara, guantes de cuero, tenida de protección
            imagen: 'https://images.unsplash.com/photo-1617791160536-598cf32026fb?w=1920&q=80',
            riesgo: 'medio',
            epp: ['casco', 'lentes', 'guantes', 'zapatos', 'respirador'],
        },

        // ────────────────────────────────────────────────
        // SECCIÓN 3: VERIFICACIONES PREVIAS (15 seg)
        // Imagen: Inspector con clipboard realizando verificación en obra
        // ────────────────────────────────────────────────
        {
            numero: 3,
            titulo: 'Verificaciones Previas',
            contenido:
                'Antes de ejecutar la tarea debes: contar con Aviso y Orden de Trabajo, tener todos los permisos de trabajo y check-list firmados, realizar inspección visual del área, completar la reunión de seguridad con el encargado del área, verificar las condiciones de la Tarjeta Verde y completar el ART específico con todas las firmas.',
            duracion: 15,
            // Supervisor con clipboard haciendo checklist de seguridad en planta industrial
            imagen: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&q=80',
            riesgo: 'bajo',
            epp: ['casco', 'lentes', 'chaleco'],
        },

        // ────────────────────────────────────────────────
        // SECCIÓN 4: PASOS DE LA TAREA (30 seg)
        // Imagen: Trabajador cortando metal con esmeril angular, chispas volando
        // ────────────────────────────────────────────────
        {
            numero: 4,
            titulo: 'Pasos de la Tarea',
            contenido:
                'Paso 1: Retirar grating existente y segregar el área con conos, cintas de peligro o barreras físicas.\n' +
                'Paso 2: Transportar el grating al taller de soldadura POX asegurando el material.\n' +
                'Paso 3: Medir, marcar y cortar el grating a medida de la escotilla usando esmeril angular con disco de corte fino.\n' +
                'Paso 4: Soldar la escotilla al grating con máquina de 150 amperes, aplicando cordones según especificaciones técnicas.\n' +
                'Paso 5: Limpiar escoria y residuos, luego aplicar pintura de acabado en capas uniformes.\n' +
                'Paso 6: Transportar e instalar el grating en su ubicación final, verificando nivelación y fijación.',
            duracion: 30,
            // Trabajador industrial usando esmeril angular cortando metal con chispas
            imagen: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1920&q=80',
            riesgo: 'alto',
            epp: ['casco', 'lentes', 'guantes', 'zapatos', 'respirador'],
            quiz: {
                pregunta: '¿Qué equipo se utiliza para cortar el grating a medida?',
                opciones: [
                    'Soplete oxicorte',
                    'Esmeril angular con disco de corte fino',
                    'Sierra circular de banco',
                ],
                correcta: 1,
            },
        },

        // ────────────────────────────────────────────────
        // SECCIÓN 5: RIESGOS CRÍTICOS Y CONTROLES (30 seg)
        // Imagen: Chispas intensas de soldadura, ambiente de riesgo
        // ────────────────────────────────────────────────
        {
            numero: 5,
            titulo: 'Riesgos Críticos y Controles',
            contenido:
                'RIESGO 1 – Incendio por trabajos en caliente: Realiza el protocolo de trabajo en caliente, usa EPP de cuero completo, segrega con cortinas o biombos.\n' +
                'RIESGO 2 – Contacto con energía eléctrica: Conecta solo a tableros autorizados, inspecciona cables y enchufes.\n' +
                'RIESGO 3 – Golpes y proyección de partículas: Usa máscara facial durante esmerilado y corte.\n' +
                'RIESGO 4 – Atrapamiento con partes móviles: Verifica guardas, no uses ropa suelta ni accesorios.\n' +
                'RIESGO 5 – Caída a distinto nivel: Si trabajas en altura, verifica arnés y check-list, nunca trabajes solo.\n' +
                'RIESGO 6 – Sobreesfuerzo: No cargues más de 25 kg individual; para cargas mayores usa ayudas mecánicas.',
            duracion: 30,
            // Soldadura con chispas intensas, escena de riesgo industrial
            imagen: 'https://images.unsplash.com/photo-1515630278258-407f66498911?w=1920&q=80',
            riesgo: 'critico',
            epp: ['casco', 'lentes', 'guantes', 'zapatos', 'arnes', 'respirador', 'protector_auditivo'],
            quiz: {
                pregunta: '¿Cuál es el peso máximo que un trabajador puede cargar individualmente?',
                opciones: ['15 kg', '25 kg', '35 kg'],
                correcta: 1,
            },
        },

        // ────────────────────────────────────────────────
        // SECCIÓN 6: EMERGENCIAS (10 seg)
        // Imagen: Escena de respuesta de emergencia industrial
        // ────────────────────────────────────────────────
        {
            numero: 6,
            titulo: 'Emergencias',
            contenido:
                'En caso de accidente o emergencia, llama inmediatamente al 3911 de Potrerillos. Desde celular marca 52 246 3911. Informa: qué ocurrió, tu nombre, lugar exacto y equipo comprometido.',
            duracion: 10,
            // Ambulancia / respuesta de emergencia en sitio industrial
            imagen: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=1920&q=80',
            riesgo: 'critico',
            epp: ['casco', 'lentes'],
        },

        // ────────────────────────────────────────────────
        // SECCIÓN 7: CIERRE (10 seg)
        // Imagen: Trabajador minero con casco al atardecer, mensaje de seguridad
        // ────────────────────────────────────────────────
        {
            numero: 7,
            titulo: 'Cierre',
            contenido:
                'Recuerda: si las condiciones cambian, detén la tarea y reevalúa los riesgos. Tu seguridad es lo primero. Cumple siempre el procedimiento.',
            duracion: 10,
            // Trabajador industrial con casco de seguridad al atardecer
            imagen: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1920&q=80',
            riesgo: 'medio',
            epp: ['casco'],
        },
    ],
};
