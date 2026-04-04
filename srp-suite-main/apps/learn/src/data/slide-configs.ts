/**
 * Slide Configuration for Visual Layouts
 * Maps procedure steps to visual slide types with diagrams, flows, and icons
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
};

// ══════════════════════════════════════════════════════════════════════════════
// C701 SLIDE CONFIGURATIONS
// ══════════════════════════════════════════════════════════════════════════════

export const C701_SLIDE_CONFIGS: SlideConfig[] = [
    // ─────────────────────────────────────────────
    // Step 1: Objetivo y Alcance - Stats Dashboard
    // ─────────────────────────────────────────────
    {
        stepNumber: 1,
        layout: 'stats-dashboard',
        stats: [
            { value: '180', label: 'Minutos totales', icon: '⏱️', color: COLORS.accent },
            { value: '9', label: 'Pasos del proceso', icon: '📋', color: COLORS.primary },
            { value: 'C-701', label: 'Equipo', icon: '⚙️', color: COLORS.purple },
            { value: 'PRO.0908', label: 'Código', icon: '📄', color: COLORS.cyan },
        ],
    },

    // ─────────────────────────────────────────────
    // Step 2: EPP Específico - Icon Showcase
    // ─────────────────────────────────────────────
    {
        stepNumber: 2,
        layout: 'icon-showcase',
        icons: [
            { icon: '⛑️', label: 'Casco', color: '#FFF3E0' },
            { icon: '🥽', label: 'Lentes', color: '#E3F2FD' },
            { icon: '🧤', label: 'Guantes Antigolpe', color: '#F3E5F5' },
            { icon: '👢', label: 'Zapatos Limpios', color: '#E8F5E9' },
            { icon: '🦺', label: 'Buzo Ignífugo', color: '#FFF8E1' },
            { icon: '😷', label: 'Full-Face', color: '#FFEBEE' },
        ],
    },

    // ─────────────────────────────────────────────
    // Step 3: Verificaciones Previas - Checklist
    // ─────────────────────────────────────────────
    {
        stepNumber: 3,
        layout: 'checklist',
        checklistItems: [
            'Disponer de Aviso y Orden de Trabajo',
            'Coordinar con supervisor del área',
            'Verificar con Sala de Control',
            'Revisar permisos de trabajo en altura',
            'Check-list con firmas completas',
            'Inspección visual del área',
            'Reunión de seguridad realizada',
            'Condiciones Tarjeta Verde verificadas',
        ],
    },

    // ─────────────────────────────────────────────
    // Step 4: Desmontaje - Flow Diagram
    // ─────────────────────────────────────────────
    {
        stepNumber: 4,
        layout: 'flow-diagram',
        flowNodes: [
            { id: '1', label: 'Desconectar', icon: '🔌', type: 'start', sublabel: 'Cañerías agua' },
            { id: '2', label: 'Sacar tuercas', icon: '🔧', type: 'process', sublabel: 'Culata' },
            { id: '3', label: 'Retirar culata', icon: '📦', type: 'process', sublabel: 'Lugar seguro' },
            { id: '4', label: 'Verificar', icon: '📏', type: 'decision', sublabel: 'Holguras' },
            { id: '5', label: 'Desmontar', icon: '⚙️', type: 'end', sublabel: 'Émbolo' },
        ],
    },

    // ─────────────────────────────────────────────
    // Step 5: Sellos - Stats + Content
    // ─────────────────────────────────────────────
    {
        stepNumber: 5,
        layout: 'stats-dashboard',
        stats: [
            { value: '0.06-0.10', label: 'Huelgo diametral (mm)', icon: '📐', color: COLORS.primary },
            { value: '~0.2', label: 'Huelgo axial (mm)', icon: '↔️', color: COLORS.accent },
            { value: '0.1', label: 'Conicidad (mm)', icon: '📏', color: COLORS.warning },
        ],
    },

    // ─────────────────────────────────────────────
    // Step 6: Rascadores - Checklist
    // ─────────────────────────────────────────────
    {
        stepNumber: 6,
        layout: 'checklist',
        checklistItems: [
            'Conicidad de entrada arriba',
            'Arista viva de rascado abajo',
            'Entrada y arista en perfecto estado',
            'Contacto total con vástago',
            'Altura superficie 1-2 mm',
            'Resorte con tensión correcta',
            'Superficie vástago perfecta',
        ],
    },

    // ─────────────────────────────────────────────
    // Step 7: Riesgos Críticos - Flow Diagram
    // ─────────────────────────────────────────────
    {
        stepNumber: 7,
        layout: 'flow-diagram',
        flowNodes: [
            { id: 'rc1', label: 'Eléctrico', icon: '⚡', type: 'warning', sublabel: 'RC-1' },
            { id: 'rc2', label: 'Altura', icon: '🏗️', type: 'warning', sublabel: 'RC-2' },
            { id: 'rc3', label: 'Izaje', icon: '🏗️', type: 'warning', sublabel: 'RC-3' },
            { id: 'rc4', label: 'Presión', icon: '💨', type: 'warning', sublabel: 'RC-4' },
            { id: 'rc6', label: 'Fuego', icon: '🔥', type: 'warning', sublabel: 'RC-6' },
        ],
    },

    // ─────────────────────────────────────────────
    // Step 8: Emergencias - Icon Showcase
    // ─────────────────────────────────────────────
    {
        stepNumber: 8,
        layout: 'icon-showcase',
        icons: [
            { icon: '📞', label: '55-2-327-327', color: '#FFEBEE' },
            { icon: '🔥', label: 'Incendio', color: '#FFF3E0' },
            { icon: '🚑', label: 'Ambulancia', color: '#E8F5E9' },
            { icon: '🏃', label: 'Evacuación', color: '#E3F2FD' },
        ],
    },

    // ─────────────────────────────────────────────
    // Step 9: Medio Ambiente - Icon Showcase
    // ─────────────────────────────────────────────
    {
        stepNumber: 9,
        layout: 'icon-showcase',
        icons: [
            { icon: '🟡', label: 'Domésticos', color: '#FFF9C4' },
            { icon: '🟢', label: 'Reciclables', color: '#C8E6C9' },
            { icon: '🔵', label: 'No peligrosos', color: '#BBDEFB' },
            { icon: '🔴', label: 'Peligrosos', color: '#FFCDD2' },
        ],
    },
];

// ══════════════════════════════════════════════════════════════════════════════
// PRESET FLOW DIAGRAMS
// ══════════════════════════════════════════════════════════════════════════════

/** LOTO (Lock Out Tag Out) Flow */
export const FLOW_LOTO_FULL: FlowNode[] = [
    { id: '1', label: 'Identificar', icon: '🔍', type: 'start', sublabel: 'Fuentes de energía' },
    { id: '2', label: 'Notificar', icon: '📢', type: 'process', sublabel: 'Personal afectado' },
    { id: '3', label: 'Aislar', icon: '⚡', type: 'warning', sublabel: 'Desconectar equipos' },
    { id: '4', label: 'Bloquear', icon: '🔒', type: 'process', sublabel: 'Instalar candado' },
    { id: '5', label: 'Verificar', icon: '✅', type: 'end', sublabel: 'Energía cero' },
];

/** Pre-work verification flow */
export const FLOW_VERIFICACION: FlowNode[] = [
    { id: '1', label: 'Documentos', icon: '📋', type: 'start', sublabel: 'OT y permisos' },
    { id: '2', label: 'Coordinación', icon: '👥', type: 'process', sublabel: 'Supervisor' },
    { id: '3', label: 'EPP', icon: '🦺', type: 'process', sublabel: 'Inspección' },
    { id: '4', label: 'Área', icon: '🔍', type: 'decision', sublabel: 'Verificar' },
    { id: '5', label: 'Tarjeta Verde', icon: '✅', type: 'end', sublabel: 'Aprobado' },
];

/** Emergency response flow */
export const FLOW_EMERGENCIA: FlowNode[] = [
    { id: '1', label: 'Detectar', icon: '👁️', type: 'start', sublabel: 'Emergencia' },
    { id: '2', label: 'Llamar', icon: '📞', type: 'warning', sublabel: '327-327' },
    { id: '3', label: 'Informar', icon: '🗣️', type: 'process', sublabel: 'Datos' },
    { id: '4', label: 'Evacuar', icon: '🏃', type: 'process', sublabel: 'Zona segura' },
    { id: '5', label: 'Esperar', icon: '🚑', type: 'end', sublabel: 'Ayuda' },
];

// ══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Get slide configuration for a specific step
 */
export const getSlideConfig = (stepNumber: number): SlideConfig | undefined => {
    return C701_SLIDE_CONFIGS.find(config => config.stepNumber === stepNumber);
};

/**
 * Get all configurations of a specific layout type
 */
export const getConfigsByLayout = (layout: SlideLayout): SlideConfig[] => {
    return C701_SLIDE_CONFIGS.filter(config => config.layout === layout);
};

export default C701_SLIDE_CONFIGS;
