import { Procedure } from '../types';

// Ejemplo de procedimiento ECF 1 - Bloqueo de Energías
// Las imágenes son de Unsplash (uso libre) — reemplazar con fotos propias de faena
// Lottie animations de LottieFiles.com (gratis) — reemplazar con URLs reales
export const PROCEDURE_EXAMPLE: Procedure = {
    id: 'ecf-001-bloqueo',
    titulo: 'ECF 1 - Bloqueo de Energías',
    subtitulo: 'Procedimiento de Trabajo Seguro',
    duracion_total: 120, // 2 minutos
    metadata: {
        version: '1.0',
        fecha_vigencia: '2026-01-01',
        normativa: ['DS 132', 'DS 594', 'NCh 2245'],
    },
    pasos: [
        {
            numero: 1,
            titulo: 'Identificación de Energías',
            contenido:
                'Identifique TODAS las fuentes de energía presentes en el equipo: eléctrica, neumática, hidráulica, mecánica, térmica y potencial.',
            duracion: 20,
            imagen: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1920&q=80',
            riesgo: 'alto',
            epp: ['casco', 'lentes', 'guantes', 'zapatos', 'chaleco'],
            lottie: 'https://lottie.host/4db68bbd-31f6-4cd8-84eb-189571e23b25/2Ixv0UOucp.json', // Warning/danger animation
            quiz: {
                pregunta: '¿Cuántos tipos de energía deben identificarse?',
                opciones: ['Solo eléctrica', 'Eléctrica y mecánica', 'Todas las presentes'],
                correcta: 2,
            },
        },
        {
            numero: 2,
            titulo: 'Desenergización',
            contenido:
                'Detenga la máquina siguiendo el procedimiento normal de apagado. Desconecte la fuente de energía principal usando los dispositivos de corte.',
            duracion: 20,
            imagen: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=1920&q=80',
            riesgo: 'critico',
            epp: ['casco', 'lentes', 'guantes', 'zapatos'],
            lottie: 'https://lottie.host/e59d3547-23a1-4c4a-9862-6f1aef6c3b74/FYbOvfJSqd.json', // Power/electricity animation
            quiz: {
                pregunta: '¿Cuál es el primer paso antes de desenergizar?',
                opciones: ['Colocar candado', 'Detener la máquina normalmente', 'Avisar al supervisor'],
                correcta: 1,
            },
        },
        {
            numero: 3,
            titulo: 'Bloqueo con Candado Personal',
            contenido:
                'Cada trabajador debe colocar su candado PERSONAL en el dispositivo de bloqueo. El candado debe estar identificado con nombre y número.',
            duracion: 20,
            imagen: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1920&q=80',
            riesgo: 'medio',
            epp: ['casco', 'guantes', 'zapatos'],
            lottie: 'https://lottie.host/8d653740-95a3-442d-b40c-df802042c2c9/M0nO2K54fy.json', // Lock/security animation
            quiz: {
                pregunta: '¿Qué tipo de candado debe usarse?',
                opciones: ['Candado de la faena', 'Candado personal identificado', 'Cualquiera disponible'],
                correcta: 1,
            },
        },
        {
            numero: 4,
            titulo: 'Etiquetado',
            contenido:
                'Coloque la etiqueta de peligro con: nombre del trabajador, fecha, hora de inicio y descripción del trabajo a realizar.',
            duracion: 20,
            imagen: 'https://images.unsplash.com/photo-1590959651373-a3db0f38a961?w=1920&q=80',
            riesgo: 'bajo',
            epp: ['casco', 'lentes', 'guantes', 'chaleco'],
            quiz: {
                pregunta: '¿Qué información debe contener la etiqueta?',
                opciones: [
                    'Solo el nombre',
                    'Nombre, fecha, hora y descripción',
                    'Solo la fecha',
                ],
                correcta: 1,
            },
        },
        {
            numero: 5,
            titulo: 'Verificación de Energía Cero',
            contenido:
                'Intente encender el equipo para verificar que está efectivamente desenergizado. Confirme que NO hay energía residual en ningún sistema.',
            duracion: 20,
            imagen: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=1920&q=80',
            riesgo: 'critico',
            epp: ['casco', 'lentes', 'guantes', 'zapatos', 'chaleco', 'protector_auditivo'],
            lottie: 'https://lottie.host/c2b91f4e-50c6-4c0f-81ca-86e8c1c43a41/vw7RnHvqzn.json', // Checklist/verification animation
            quiz: {
                pregunta: '¿Cómo se verifica la energía cero?',
                opciones: [
                    'Preguntando al supervisor',
                    'Intentando encender el equipo',
                    'Revisando el tablero',
                ],
                correcta: 1,
            },
        },
    ],
};
