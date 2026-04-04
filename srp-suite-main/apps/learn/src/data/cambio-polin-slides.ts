/**
 * Slide Configurations for Cambio de Polín en Correa Transportadora
 * Visual layouts with diagrams, flows, and animated icons
 */

import type { SlideLayout } from '../components/ContentSlide';
import type { FlowNode } from '../components/FlowDiagram';

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

export interface SlideConfig {
    stepNumber: number;
    layout: SlideLayout;
    flowNodes?: FlowNode[];
    icons?: Array<{ icon: string; label?: string; color?: string }>;
    checklistItems?: string[];
    stats?: Array<{ value: string | number; label: string; icon?: string; color?: string }>;
}

// ══════════════════════════════════════════════════════════════════════════════
// COLORS
// ══════════════════════════════════════════════════════════════════════════════

const COLORS = {
    primary: '#00A651',
    accent: '#007AFF',
    warning: '#FF9500',
    danger: '#FF3B30',
    purple: '#AF52DE',
    cyan: '#32ADE6',
    mint: '#00C7BE',
    indigo: '#5856D6',
    brown: '#A2845E',
    gray: '#8E8E93',
};

// ══════════════════════════════════════════════════════════════════════════════
// POLIN CT SLIDE CONFIGURATIONS
// ══════════════════════════════════════════════════════════════════════════════

export const POLIN_CT_SLIDE_CONFIGS: SlideConfig[] = [
    // ─────────────────────────────────────────────
    // Step 1: Preparación - Stats Dashboard
    // ─────────────────────────────────────────────
    {
        stepNumber: 1,
        layout: 'stats-dashboard',
        stats: [
            { value: '150', label: 'Minutos totales', icon: '⏱️', color: COLORS.accent },
            { value: '9', label: 'Pasos críticos', icon: '📋', color: COLORS.primary },
            { value: '2-3', label: 'Personas mínimo', icon: '👷', color: COLORS.purple },
            { value: 'LOTO', label: 'Bloqueo requerido', icon: '🔒', color: COLORS.danger },
        ],
    },

    // ─────────────────────────────────────────────
    // Step 2: EPP Subterráneo - Icon Showcase
    // ─────────────────────────────────────────────
    {
        stepNumber: 2,
        layout: 'icon-showcase',
        icons: [
            { icon: '⛑️', label: 'Casco c/Lámpara', color: '#FFF3E0' },
            { icon: '🥽', label: 'Lentes claros', color: '#E3F2FD' },
            { icon: '😷', label: 'Respirador N95', color: '#FFEBEE' },
            { icon: '🧤', label: 'Guantes cuero', color: '#F3E5F5' },
            { icon: '👢', label: 'Zapatos acero', color: '#E8F5E9' },
            { icon: '🦺', label: 'Autorrescatador', color: '#FCE4EC' },
        ],
    },

    // ─────────────────────────────────────────────
    // Step 3: LOTO - Flow Diagram (CRÍTICO)
    // ─────────────────────────────────────────────
    {
        stepNumber: 3,
        layout: 'flow-diagram',
        flowNodes: [
            { id: '1', label: 'Identificar', icon: '🔍', type: 'start', sublabel: 'Fuentes energía' },
            { id: '2', label: 'Notificar', icon: '📢', type: 'process', sublabel: 'Personal' },
            { id: '3', label: 'Detener', icon: '⏹️', type: 'process', sublabel: 'Correa' },
            { id: '4', label: 'Bloquear', icon: '🔒', type: 'warning', sublabel: 'Candado' },
            { id: '5', label: 'Verificar', icon: '✅', type: 'end', sublabel: 'Energía cero' },
        ],
    },

    // ─────────────────────────────────────────────
    // Step 4: Inspección Área - Checklist
    // ─────────────────────────────────────────────
    {
        stepNumber: 4,
        layout: 'checklist',
        checklistItems: [
            'Techo y paredes sin riesgo de desprendimiento',
            'Sin acumulación de material sobre correa',
            'Correa completamente detenida y sin vibración',
            'Iluminación adecuada del área',
            'Zona delimitada con conos y cinta',
            'Vías de evacuación identificadas',
            'Condiciones seguras confirmadas',
        ],
    },

    // ─────────────────────────────────────────────
    // Step 5: Retiro Polín - Flow Diagram
    // ─────────────────────────────────────────────
    {
        stepNumber: 5,
        layout: 'flow-diagram',
        flowNodes: [
            { id: '1', label: 'Levantar', icon: '⬆️', type: 'start', sublabel: 'Gatos hidráulicos' },
            { id: '2', label: 'Asegurar', icon: '🔧', type: 'warning', sublabel: 'Caballetes' },
            { id: '3', label: 'Aflojar', icon: '🔩', type: 'process', sublabel: 'Pernos' },
            { id: '4', label: 'Retirar', icon: '📦', type: 'process', sublabel: 'Polín (15-40kg)' },
            { id: '5', label: 'Inspeccionar', icon: '🔍', type: 'end', sublabel: 'Estructura' },
        ],
    },

    // ─────────────────────────────────────────────
    // Step 6: Instalación - Checklist
    // ─────────────────────────────────────────────
    {
        stepNumber: 6,
        layout: 'checklist',
        checklistItems: [
            'Polín nuevo corresponde a especificaciones',
            'Rodamientos giran libremente',
            'Posicionado y alineado correctamente',
            'Pernos apretados con torque indicado',
            'Polín perfectamente horizontal',
            'Soportes retirados de forma controlada',
            'Correa bajada suavemente',
        ],
    },

    // ─────────────────────────────────────────────
    // Step 7: Verificación - Flow Diagram
    // ─────────────────────────────────────────────
    {
        stepNumber: 7,
        layout: 'flow-diagram',
        flowNodes: [
            { id: '1', label: 'Revisar', icon: '🔍', type: 'start', sublabel: 'Herramientas' },
            { id: '2', label: 'Despejar', icon: '👷', type: 'process', sublabel: 'Personal' },
            { id: '3', label: 'Retirar', icon: '🔓', type: 'process', sublabel: 'LOTO' },
            { id: '4', label: 'Arrancar', icon: '▶️', type: 'decision', sublabel: 'Prueba' },
            { id: '5', label: 'Observar', icon: '👁️', type: 'end', sublabel: '5 min mínimo' },
        ],
    },

    // ─────────────────────────────────────────────
    // Step 8: Emergencias - Icon Showcase
    // ─────────────────────────────────────────────
    {
        stepNumber: 8,
        layout: 'icon-showcase',
        icons: [
            { icon: '🔥', label: 'Incendio: Autorrescatador', color: '#FFEBEE' },
            { icon: '⛰️', label: 'Derrumbe: Alejarse', color: '#FFF3E0' },
            { icon: '⚠️', label: 'Atrapamiento: E-Stop', color: '#FFFDE7' },
            { icon: '📞', label: 'Emergencia: Ext 5555', color: '#E8F5E9' },
        ],
    },

    // ─────────────────────────────────────────────
    // Step 9: Cierre - Stats
    // ─────────────────────────────────────────────
    {
        stepNumber: 9,
        layout: 'stats-dashboard',
        stats: [
            { value: '📝', label: 'Registrar bitácora', icon: '', color: COLORS.accent },
            { value: '🔢', label: 'N° serie polín', icon: '', color: COLORS.primary },
            { value: '🧹', label: 'Limpiar área', icon: '', color: COLORS.purple },
            { value: '✅', label: 'Cerrar OT', icon: '', color: COLORS.mint },
        ],
    },
];

// ══════════════════════════════════════════════════════════════════════════════
// PRESET FLOW DIAGRAMS FOR CONVEYOR BELT PROCEDURES
// ══════════════════════════════════════════════════════════════════════════════

/** LOTO completo para correa transportadora */
export const FLOW_LOTO_CORREA: FlowNode[] = [
    { id: '1', label: 'Identificar', icon: '🔍', type: 'start', sublabel: 'Elec + Hidráulica + Tensión' },
    { id: '2', label: 'Notificar', icon: '📢', type: 'process', sublabel: 'Sala Control + Personal' },
    { id: '3', label: 'Detener', icon: '⏹️', type: 'process', sublabel: 'Desde panel' },
    { id: '4', label: 'Desconectar', icon: '🔌', type: 'process', sublabel: 'Interruptor principal' },
    { id: '5', label: 'Bloquear', icon: '🔒', type: 'warning', sublabel: 'Candado personal' },
    { id: '6', label: 'Liberar', icon: '⚡', type: 'process', sublabel: 'Energía tensor' },
    { id: '7', label: 'Verificar', icon: '✅', type: 'end', sublabel: 'Energía cero' },
];

/** Procedimiento de extracción de polín */
export const FLOW_EXTRACCION_POLIN: FlowNode[] = [
    { id: '1', label: 'Posicionar', icon: '📍', type: 'start', sublabel: 'Gatos hidráulicos' },
    { id: '2', label: 'Levantar', icon: '⬆️', type: 'process', sublabel: 'Correa 10-15cm' },
    { id: '3', label: 'Asegurar', icon: '🔧', type: 'warning', sublabel: 'Caballetes cert.' },
    { id: '4', label: 'Desmontar', icon: '🔩', type: 'process', sublabel: 'Pernos fijación' },
    { id: '5', label: 'Extraer', icon: '📦', type: 'end', sublabel: 'Polín dañado' },
];

/** Verificación post-instalación */
export const FLOW_VERIFICACION_POLIN: FlowNode[] = [
    { id: '1', label: 'Visual', icon: '👁️', type: 'start', sublabel: 'Alineación' },
    { id: '2', label: 'Torque', icon: '🔧', type: 'process', sublabel: 'Pernos' },
    { id: '3', label: 'Giro', icon: '🔄', type: 'decision', sublabel: 'Manual libre' },
    { id: '4', label: 'Prueba', icon: '▶️', type: 'process', sublabel: 'Arranque' },
    { id: '5', label: 'Monitoreo', icon: '📊', type: 'end', sublabel: '5 min obs.' },
];

/** Riesgos críticos en correas */
export const FLOW_RIESGOS_CORREA: FlowNode[] = [
    { id: 'nip', label: 'Nip Points', icon: '⚠️', type: 'warning', sublabel: 'Atrapamiento' },
    { id: 'energia', label: 'Energía', icon: '⚡', type: 'warning', sublabel: 'Residual' },
    { id: 'caida', label: 'Caída', icon: '⛰️', type: 'warning', sublabel: 'Material/Rocas' },
    { id: 'fuego', label: 'Fuego', icon: '🔥', type: 'warning', sublabel: 'Rodamiento' },
    { id: 'espacio', label: 'Espacio', icon: '🚧', type: 'warning', sublabel: 'Confinado' },
];

// ══════════════════════════════════════════════════════════════════════════════
// EPP ICONS FOR UNDERGROUND MINING
// ══════════════════════════════════════════════════════════════════════════════

export const EPP_SUBTERRANEO = [
    { icon: '⛑️', label: 'Casco c/Lámpara', color: '#FFF3E0' },
    { icon: '🥽', label: 'Lentes claros', color: '#E3F2FD' },
    { icon: '👂', label: 'Protección auditiva', color: '#F3E5F5' },
    { icon: '😷', label: 'Respirador N95', color: '#FFEBEE' },
    { icon: '🧤', label: 'Guantes cuero', color: '#E8EAF6' },
    { icon: '👢', label: 'Zapatos acero', color: '#E8F5E9' },
    { icon: '🦺', label: 'Chaleco reflectante', color: '#FFF8E1' },
    { icon: '🆘', label: 'Autorrescatador', color: '#FCE4EC' },
];

// ══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Get slide configuration for a specific step
 */
export const getPolinSlideConfig = (stepNumber: number): SlideConfig | undefined => {
    return POLIN_CT_SLIDE_CONFIGS.find(config => config.stepNumber === stepNumber);
};

export default POLIN_CT_SLIDE_CONFIGS;
