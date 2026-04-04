import { Procedure } from '../types';

// Procedimiento: Mantención Preventiva Compresor de Oxígeno C-701
// Código: PRO.0908.MPEF1 — CODELCO Chuquicamata
// Source: Procedimiento_PRO_0908_MPEF1.md
export const PROCEDURE_COMPRESOR_C701: Procedure = {
    id: 'proc-compresor-c701',
    titulo: 'Mantención Preventiva Compresor de Oxígeno C-701',
    subtitulo: 'PRO.0908.MPEF1 — CODELCO Chuquicamata',
    duracion_total: 180,
    metadata: {
        version: '2.0',
        fecha_vigencia: '2026-02-01',
        normativa: ['DS 132', 'DS 594', 'ECF CODELCO'],
    },
    pasos: [
        // ────────────────────────────────────────────────
        // SECCIÓN 1: OBJETIVO Y ALCANCE (12 seg)
        // ────────────────────────────────────────────────
        {
            numero: 1,
            titulo: 'Objetivo y Alcance',
            contenido:
                'Este procedimiento asegura la continuidad operativa del compresor de oxígeno C-701 ' +
                'mediante mantención preventiva. Aplica a todo el personal Codelco y empresas contratistas ' +
                'que desarrollen servicios en Casa Compresora. El propósito es controlar riesgos operacionales, ' +
                'evitar accidentes, proteger los equipos y cuidar el medio ambiente.',
            duracion: 12,
            imagen: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1920&q=80',
            riesgo: 'medio',
            epp: ['casco', 'lentes', 'zapatos'],
        },

        // ────────────────────────────────────────────────
        // SECCIÓN 2: EPP ESPECÍFICO (15 seg)
        // ────────────────────────────────────────────────
        {
            numero: 2,
            titulo: 'EPP Específico',
            contenido:
                'EPP obligatorio para esta tarea: buzo desechable para soplado, full-face para soplado, ' +
                'arnés de seguridad, buzo ignífugo bicolor limpio y libre de grasas y aceites, ' +
                'guantes antigolpe limpios para componentes en contacto con oxígeno, lentes de seguridad claros, ' +
                'zapato de seguridad limpio de aceite y grasa, y guantes quirúrgicos. ' +
                'IMPORTANTE: Todo el EPP debe estar completamente libre de grasas y aceites ' +
                'por el riesgo de contacto con oxígeno.',
            duracion: 15,
            imagen: 'https://images.unsplash.com/photo-1617791160536-598cf32026fb?w=1920&q=80',
            riesgo: 'alto',
            epp: ['casco', 'lentes', 'guantes', 'zapatos', 'arnes', 'respirador'],
            quiz: {
                pregunta: '¿Por qué el EPP debe estar libre de grasas y aceites?',
                opciones: [
                    'Para mantener la limpieza del área',
                    'Por el riesgo de ignición al contacto con oxígeno',
                    'Para cumplir con las normas de vestimenta',
                ],
                correcta: 1,
            },
        },

        // ────────────────────────────────────────────────
        // SECCIÓN 3: VERIFICACIONES PREVIAS (15 seg)
        // ────────────────────────────────────────────────
        {
            numero: 3,
            titulo: 'Verificaciones Previas',
            contenido:
                'Antes de iniciar: disponer de Aviso y Orden de Trabajo. Coordinar con supervisor del área. ' +
                'Verificar con Sala de Control la coordinación de la actividad. Solicitar información de trabajos ' +
                'en curso para evitar interferencias. Revisar documentos de seguridad: permisos de trabajo en altura, ' +
                'check-list con firmas, inspección visual del área, reunión de seguridad con encargado del área. ' +
                'Verificar condiciones Tarjeta Verde: no existe desviación de control crítico, procedimiento difundido ' +
                'y evaluado, ART completa con todas las firmas.',
            duracion: 15,
            imagen: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&q=80',
            riesgo: 'bajo',
            epp: ['casco', 'lentes', 'chaleco'],
        },

        // ────────────────────────────────────────────────
        // SECCIÓN 4: DESMONTAJE CULATA Y ÉMBOLO (25 seg)
        // ────────────────────────────────────────────────
        {
            numero: 4,
            titulo: 'Desmontaje: Culata, Émbolo y Vástago',
            contenido:
                'IMPORTANTE: El compresor debe estar fuera de operación con bloqueo de equipo verificado. ' +
                'Paso 1: Desconectar cañerías de agua de refrigeración de las culatas. ' +
                'Paso 2: Sacar tuercas de fijación de la culata al cilindro. ' +
                'Paso 3: Retirar ajuste de goma y sacar la culata. Dejarla en lugar limpio y seguro. ' +
                'Paso 4: Verificar la holgura diametral entre émbolo y cilindro según tabla 6305346. ' +
                'Paso 5: En la cruceta, soltar tuerca para chaveta y tornillo de seguridad. ' +
                'Paso 6: Sacar tuercas del vástago del pistón inferior y superior. ' +
                'Paso 7: Desmontar émbolo. Dejar en lugar limpio y seguro.',
            duracion: 25,
            imagen: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1920&q=80',
            riesgo: 'alto',
            epp: ['casco', 'lentes', 'guantes', 'zapatos', 'arnes'],
            quiz: {
                pregunta: '¿Qué condición debe verificarse ANTES de iniciar el desmontaje?',
                opciones: [
                    'Que la temperatura ambiente sea adecuada',
                    'Que el compresor esté fuera de operación con bloqueo verificado',
                    'Que haya suficiente iluminación natural',
                ],
                correcta: 1,
            },
        },

        // ────────────────────────────────────────────────
        // SECCIÓN 5: SELLOS Y PRENSAESTOPAS (25 seg)
        // ────────────────────────────────────────────────
        {
            numero: 5,
            titulo: 'Sellos de Prensaestopas',
            contenido:
                'Desmontaje: Desconectar cañerías de gas de fuga de los sellos de prensaestopas. ' +
                'Desmontar y desarmar el conjunto de sellos. ' +
                'Inspección: Medir tolerancias de los sellos versus vástago del émbolo. ' +
                'Limpiar rigurosamente las cámaras de sellos de laberintos y sellos lisos. ' +
                'Montaje: Montar anillo superior liso, luego anillos de laberintos. ' +
                'TOLERANCIAS CRÍTICAS: El huelgo diametral debe estar entre 0.06 y 0.10 milímetros. ' +
                'El huelgo axial debe ser aproximadamente 0.2 milímetros. ' +
                'La medición de anillos de grafito con galga debe realizarse por debajo del rascador de aceite, ' +
                'ya que el vástago toma forma cónica hacia arriba de 0.1 milímetros.',
            duracion: 25,
            imagen: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1920&q=80',
            riesgo: 'alto',
            epp: ['casco', 'lentes', 'guantes'],
            quiz: {
                pregunta: '¿Cuál es el rango correcto del huelgo diametral de los anillos?',
                opciones: [
                    '0.01 a 0.05 mm',
                    '0.06 a 0.10 mm',
                    '0.15 a 0.25 mm',
                ],
                correcta: 1,
            },
        },

        // ────────────────────────────────────────────────
        // SECCIÓN 6: RASCADORES E INSPECCIÓN (20 seg)
        // ────────────────────────────────────────────────
        {
            numero: 6,
            titulo: 'Inspección de Rascadores de Aceite',
            contenido:
                'Verificar: el correcto montaje de los anillos rascadores. La conicidad de entrada ' +
                'debe encontrarse arriba y la arista viva de rascado abajo. Tanto la entrada como la arista ' +
                'deben estar en perfecto estado. Los anillos deben tener contacto con el vástago en toda ' +
                'la circunferencia; si no, retocar cuidadosamente con rasqueta. ' +
                'La altura de la superficie anular de contacto debe ser de 1 a 2 milímetros en cada anillo. ' +
                'Verificar que el resorte tiene la tensión necesaria y que la superficie del vástago ' +
                'en la zona de rascado está en perfecto estado.',
            duracion: 20,
            imagen: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1920&q=80',
            riesgo: 'medio',
            epp: ['casco', 'lentes', 'guantes'],
        },

        // ────────────────────────────────────────────────
        // SECCIÓN 7: RIESGOS CRÍTICOS (25 seg)
        // ────────────────────────────────────────────────
        {
            numero: 7,
            titulo: 'Riesgos Críticos',
            contenido:
                'RC-1 Energía eléctrica: Conexión solo a tableros autorizados, segregación de instalaciones eléctricas.\n' +
                'RC-2 Trabajo en altura: Capacitación, condición de salud compatible, arnés y sistemas de detención de caídas.\n' +
                'RC-3 Maniobras de izaje: Comunicación bidireccional operador-rigger, segregación del área.\n' +
                'RC-4 Energía neumática alta presión: Bloqueo y verificación de energía cero.\n' +
                'RC-6 Variables de fuego: Protocolo de trabajo en caliente, identificación de áreas con oxígeno enriquecido.\n' +
                'RC-9 Partes móviles: Guardas y protecciones, bloqueo verificado antes de intervenir.\n' +
                'ALERTA: Si detecta enriquecimiento de oxígeno mayor a 22%, detenga la tarea inmediatamente.',
            duracion: 25,
            imagen: 'https://images.unsplash.com/photo-1515630278258-407f66498911?w=1920&q=80',
            riesgo: 'critico',
            epp: ['casco', 'lentes', 'guantes', 'zapatos', 'arnes', 'respirador', 'protector_auditivo'],
            quiz: {
                pregunta: '¿A qué porcentaje de enriquecimiento de oxígeno debe detenerse la tarea?',
                opciones: [
                    'Mayor a 18%',
                    'Mayor a 22%',
                    'Mayor a 30%',
                ],
                correcta: 1,
            },
        },

        // ────────────────────────────────────────────────
        // SECCIÓN 8: EMERGENCIAS (12 seg)
        // ────────────────────────────────────────────────
        {
            numero: 8,
            titulo: 'Emergencias',
            contenido:
                'En caso de emergencia, llama inmediatamente al teléfono 55-2-327-327 de Fundición Chuquicamata. ' +
                'Informa: naturaleza de la emergencia, tu nombre, lugar exacto, equipo comprometido y hora de detección. ' +
                'En caso de incendio: solo intenta extinguir si es incipiente y estás capacitado, si no, evacúa a la zona de seguridad. ' +
                'Accidentes con lesión: avisa al fono Emergencias, la ambulancia llegará a la zona de evacuación. ' +
                'Sismo o terremoto: utiliza vías de evacuación hacia la zona de seguridad más cercana.',
            duracion: 12,
            imagen: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=1920&q=80',
            riesgo: 'critico',
            epp: ['casco', 'lentes'],
        },

        // ────────────────────────────────────────────────
        // SECCIÓN 9: MEDIO AMBIENTE Y CIERRE (10 seg)
        // ────────────────────────────────────────────────
        {
            numero: 9,
            titulo: 'Medio Ambiente y Cierre',
            contenido:
                'Deposita residuos en los tambores de acumulación primaria: ' +
                'Amarillo para residuos domésticos, Verde para reciclables, ' +
                'Azul para no peligrosos no comercializables, Rojo para residuos peligrosos. ' +
                'No botar residuos fuera de los tambores indicados. ' +
                'Recuerda: si las condiciones cambian, detén la tarea y reevalúa los riesgos. ' +
                'Tu seguridad es lo primero. Cumple siempre el procedimiento PRO.0908.MPEF1.',
            duracion: 10,
            imagen: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1920&q=80',
            riesgo: 'medio',
            epp: ['casco'],
        },
    ],
};
