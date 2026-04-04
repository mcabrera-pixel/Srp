import { Procedure } from '../types';

/**
 * Procedimiento: Cambio de Polín en Correa Transportadora Subterránea
 * Código: PRO.CT.001 — Minería Subterránea
 *
 * Basado en mejores prácticas de:
 * - MSHA Safety Topics: Conveyor Systems
 * - ACHS: Operaciones en Correas Transportadoras
 * - Estándares CODELCO ECF
 *
 * Riesgos críticos: Atrapamiento en puntos de pellizco (nip points),
 * energía residual, espacio confinado, caída de rocas.
 */
export const PROCEDURE_CAMBIO_POLIN_CT: Procedure = {
    id: 'proc-cambio-polin-ct',
    titulo: 'Cambio de Polín en Correa Transportadora',
    subtitulo: 'PRO.CT.001 — Minería Subterránea',
    duracion_total: 150,
    metadata: {
        version: '1.0',
        fecha_vigencia: '2026-02-01',
        normativa: ['DS 132', 'MSHA 30 CFR Part 75', 'ECF CODELCO'],
    },
    pasos: [
        // ────────────────────────────────────────────────
        // PASO 1: PREPARACIÓN Y DOCUMENTACIÓN
        // ────────────────────────────────────────────────
        {
            numero: 1,
            titulo: 'Preparación y Documentación',
            contenido:
                'Antes de iniciar: Verificar Orden de Trabajo (OT) autorizada. ' +
                'Revisar el historial de mantención del polín a reemplazar. ' +
                'Confirmar disponibilidad de polín de reemplazo certificado. ' +
                'Coordinar con Sala de Control la detención de la correa. ' +
                'Notificar a todo el personal del área sobre la intervención. ' +
                'Verificar condiciones de ventilación en el sector subterráneo.',
            duracion: 12,
            riesgo: 'medio',
            epp: ['casco', 'lentes', 'chaleco', 'lampara'],
        },

        // ────────────────────────────────────────────────
        // PASO 2: EPP ESPECÍFICO PARA SUBTERRÁNEO
        // ────────────────────────────────────────────────
        {
            numero: 2,
            titulo: 'EPP Específico para Trabajo Subterráneo',
            contenido:
                'EPP obligatorio: Casco minero con lámpara. Lentes de seguridad claros. ' +
                'Protección auditiva (tapones o fonos). Respirador para polvo (N95 mínimo). ' +
                'Guantes de cuero reforzado anticorte. Zapatos de seguridad con punta de acero. ' +
                'Chaleco reflectante de alta visibilidad. Autorrescatador portátil verificado. ' +
                'IMPORTANTE: Verificar carga de batería de lámpara antes de ingresar. ' +
                'El autorrescatador debe estar en perfectas condiciones.',
            duracion: 15,
            riesgo: 'alto',
            epp: ['casco', 'lentes', 'guantes', 'zapatos', 'respirador', 'protector_auditivo', 'chaleco', 'autorrescatador'],
        },

        // ────────────────────────────────────────────────
        // PASO 3: BLOQUEO LOTO
        // ────────────────────────────────────────────────
        {
            numero: 3,
            titulo: 'Bloqueo y Etiquetado (LOTO)',
            contenido:
                'CRÍTICO: Ejecutar procedimiento LOTO completo. ' +
                'Paso 1: Identificar TODAS las fuentes de energía (eléctrica, hidráulica, neumática, gravitacional). ' +
                'Paso 2: Notificar a operadores y personal afectado. ' +
                'Paso 3: Detener la correa desde el panel de control. ' +
                'Paso 4: Desconectar y bloquear el interruptor principal con candado personal. ' +
                'Paso 5: Liberar energía almacenada en el sistema tensor. ' +
                'Paso 6: Verificar energía cero intentando arrancar el equipo. ' +
                'Paso 7: Instalar etiqueta "NO OPERAR - MANTENCIÓN EN PROGRESO". ' +
                'CADA trabajador debe instalar su propio candado.',
            duracion: 20,
            riesgo: 'critico',
            epp: ['casco', 'lentes', 'guantes'],
            quiz: {
                pregunta: '¿Cuántos candados deben instalarse en el bloqueo LOTO?',
                opciones: [
                    'Solo uno del supervisor',
                    'Uno por cada trabajador que interviene',
                    'Máximo dos candados',
                ],
                correcta: 1,
            },
        },

        // ────────────────────────────────────────────────
        // PASO 4: INSPECCIÓN DEL ÁREA DE TRABAJO
        // ────────────────────────────────────────────────
        {
            numero: 4,
            titulo: 'Inspección del Área de Trabajo',
            contenido:
                'Antes de posicionarse bajo la correa: ' +
                'Inspeccionar visualmente el techo y paredes por riesgo de desprendimiento. ' +
                'Verificar que no haya acumulación de material sobre la correa. ' +
                'Confirmar que la correa está completamente detenida y sin vibración. ' +
                'Revisar iluminación del área - instalar luces portátiles si es necesario. ' +
                'Delimitar zona de trabajo con conos y cinta de seguridad. ' +
                'Identificar vías de evacuación más cercanas. ' +
                'ALERTA: Si detecta condiciones inseguras, detenga y reporte.',
            duracion: 15,
            riesgo: 'alto',
            epp: ['casco', 'lentes', 'lampara'],
        },

        // ────────────────────────────────────────────────
        // PASO 5: RETIRO DEL POLÍN DAÑADO
        // ────────────────────────────────────────────────
        {
            numero: 5,
            titulo: 'Retiro del Polín Dañado',
            contenido:
                'Procedimiento de extracción: ' +
                '1. Levantar la correa con gatos hidráulicos o palancas aprobadas. ' +
                '2. Asegurar la correa levantada con caballetes o soportes certificados. ' +
                '3. NUNCA trabajar bajo la correa sin soporte mecánico. ' +
                '4. Aflojar pernos de fijación del polín con herramientas adecuadas. ' +
                '5. Retirar el polín dañado con cuidado - puede pesar 15-40 kg. ' +
                '6. Inspeccionar los soportes y estructura por daños colaterales. ' +
                'ADVERTENCIA: Los puntos de pellizco (nip points) entre correa y polines ' +
                'son la causa principal de lesiones graves. Mantener manos alejadas.',
            duracion: 20,
            riesgo: 'critico',
            epp: ['casco', 'lentes', 'guantes'],
            quiz: {
                pregunta: '¿Cuál es la causa principal de lesiones graves en correas transportadoras?',
                opciones: [
                    'Caída de material',
                    'Puntos de pellizco (nip points)',
                    'Ruido excesivo',
                ],
                correcta: 1,
            },
        },

        // ────────────────────────────────────────────────
        // PASO 6: INSTALACIÓN DEL POLÍN NUEVO
        // ────────────────────────────────────────────────
        {
            numero: 6,
            titulo: 'Instalación del Polín Nuevo',
            contenido:
                'Montaje del polín de reemplazo: ' +
                '1. Verificar que el polín nuevo corresponde al modelo y especificaciones. ' +
                '2. Revisar que rodamientos giren libremente sin ruido ni trabas. ' +
                '3. Posicionar el polín en los soportes, alineando correctamente. ' +
                '4. Instalar y apretar pernos de fijación con torque especificado. ' +
                '5. Verificar que el polín quede perfectamente horizontal. ' +
                '6. Retirar soportes de la correa de manera controlada. ' +
                '7. Bajar la correa suavemente sobre el polín nuevo. ' +
                'IMPORTANTE: Un polín mal alineado causa desgaste prematuro y puede ' +
                'generar desalineamiento de la correa.',
            duracion: 18,
            riesgo: 'alto',
            epp: ['casco', 'lentes', 'guantes'],
        },

        // ────────────────────────────────────────────────
        // PASO 7: VERIFICACIÓN Y PRUEBAS
        // ────────────────────────────────────────────────
        {
            numero: 7,
            titulo: 'Verificación y Pruebas',
            contenido:
                'Antes de retirar el bloqueo LOTO: ' +
                '1. Verificar que todas las herramientas fueron retiradas del área. ' +
                '2. Confirmar que no hay personal bajo o cerca de la correa. ' +
                '3. Inspeccionar visualmente la instalación completa. ' +
                '4. Retirar delimitación de zona de trabajo. ' +
                '5. Comunicar a Sala de Control que se procederá a pruebas. ' +
                '6. Retirar candados LOTO en orden inverso (último en entrar, primero en salir). ' +
                '7. Realizar arranque de prueba desde panel local. ' +
                '8. Observar funcionamiento del polín nuevo por 5 minutos mínimo. ' +
                'Verificar: ausencia de vibración anormal, alineación de correa, ' +
                'temperatura del rodamiento.',
            duracion: 15,
            riesgo: 'medio',
            epp: ['casco', 'lentes'],
        },

        // ────────────────────────────────────────────────
        // PASO 8: EMERGENCIAS EN SUBTERRÁNEO
        // ────────────────────────────────────────────────
        {
            numero: 8,
            titulo: 'Procedimiento de Emergencia',
            contenido:
                'En caso de emergencia en subterráneo: ' +
                'INCENDIO: Activar alarma, usar autorrescatador, evacuar por ruta asignada. ' +
                'DERRUMBE: Alejarse de la zona, reportar ubicación, esperar instrucciones. ' +
                'ATRAPAMIENTO: NO intentar liberar a la víctima moviendo la correa manualmente. ' +
                'Usar dispositivo de parada de emergencia más cercano. ' +
                'LESIÓN: Aplicar primeros auxilios básicos, llamar a emergencias. ' +
                'Teléfono de Emergencia Interior Mina: Extensión 5555. ' +
                'Punto de reunión: Refugio más cercano o superficie según protocolo. ' +
                'IMPORTANTE: Conocer ubicación de refugios y estaciones de rescate.',
            duracion: 12,
            riesgo: 'critico',
            epp: ['casco', 'autorrescatador'],
        },

        // ────────────────────────────────────────────────
        // PASO 9: CIERRE Y REGISTRO
        // ────────────────────────────────────────────────
        {
            numero: 9,
            titulo: 'Cierre y Registro',
            contenido:
                'Finalización del trabajo: ' +
                '1. Registrar en bitácora: hora de término, personal participante, observaciones. ' +
                '2. Documentar número de serie del polín instalado. ' +
                '3. Registrar condición del polín retirado para análisis de falla. ' +
                '4. Disponer polín dañado según normativa de residuos. ' +
                '5. Limpiar área de trabajo - no dejar residuos. ' +
                '6. Devolver herramientas a pañol. ' +
                '7. Cerrar Orden de Trabajo en sistema. ' +
                '8. Informar a supervisor cualquier anomalía detectada. ' +
                'Recuerda: Un buen registro facilita la mantención predictiva.',
            duracion: 10,
            riesgo: 'bajo',
            epp: ['casco', 'lentes'],
        },
    ],
};

export default PROCEDURE_CAMBIO_POLIN_CT;
