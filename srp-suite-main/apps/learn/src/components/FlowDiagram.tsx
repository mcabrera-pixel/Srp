import React from 'react';
import {
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
    Easing,
} from 'remotion';

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

export interface FlowNode {
    id: string;
    label: string;
    icon?: string; // emoji or text icon
    type?: 'default' | 'start' | 'end' | 'decision' | 'process' | 'warning';
    sublabel?: string;
}

export interface FlowConnection {
    from: string;
    to: string;
    label?: string;
    animated?: boolean;
}

export interface FlowDiagramProps {
    nodes: FlowNode[];
    connections?: FlowConnection[];
    layout?: 'horizontal' | 'vertical' | 'grid';
    staggerDelay?: number; // frames between each node appearing
    showConnections?: boolean;
    style?: React.CSSProperties;
}

// ══════════════════════════════════════════════════════════════════════════════
// COLORS — Apple style
// ══════════════════════════════════════════════════════════════════════════════

const COLORS = {
    background: '#FFFFFF',
    surface: '#F5F5F7',
    surfaceHover: '#E8E8ED',
    primary: '#00A651',
    primaryLight: '#34C759',
    secondary: '#E87722',
    accent: '#007AFF',
    text: '#1D1D1F',
    textSecondary: '#424245',
    textMuted: '#86868B',
    textLight: '#FFFFFF',
    border: '#D2D2D7',
    borderLight: '#E8E8ED',
    warning: '#FF9500',
    danger: '#FF3B30',
    success: '#34C759',
};

// Node type styles
const NODE_STYLES: Record<string, { bg: string; border: string; iconBg: string }> = {
    default: {
        bg: COLORS.surface,
        border: COLORS.border,
        iconBg: COLORS.accent,
    },
    start: {
        bg: `${COLORS.primaryLight}15`,
        border: COLORS.primaryLight,
        iconBg: COLORS.primaryLight,
    },
    end: {
        bg: `${COLORS.primary}15`,
        border: COLORS.primary,
        iconBg: COLORS.primary,
    },
    process: {
        bg: `${COLORS.accent}10`,
        border: COLORS.accent,
        iconBg: COLORS.accent,
    },
    decision: {
        bg: `${COLORS.warning}10`,
        border: COLORS.warning,
        iconBg: COLORS.warning,
    },
    warning: {
        bg: `${COLORS.danger}10`,
        border: COLORS.danger,
        iconBg: COLORS.danger,
    },
};

// ══════════════════════════════════════════════════════════════════════════════
// FLOW NODE COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

interface FlowNodeComponentProps {
    node: FlowNode;
    index: number;
    staggerDelay: number;
    layout: 'horizontal' | 'vertical' | 'grid';
}

const FlowNodeComponent: React.FC<FlowNodeComponentProps> = ({
    node,
    index,
    staggerDelay,
    layout,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const nodeStyle = NODE_STYLES[node.type || 'default'];
    const startFrame = index * staggerDelay;

    // Spring animation for appearance
    const appearProgress = spring({
        frame: Math.max(0, frame - startFrame),
        fps,
        config: { damping: 15, stiffness: 120, mass: 0.8 },
    });

    const scale = interpolate(appearProgress, [0, 1], [0.8, 1]);
    const opacity = interpolate(appearProgress, [0, 1], [0, 1]);
    const y = interpolate(appearProgress, [0, 1], [20, 0]);

    // Icon pulse animation
    const pulse = interpolate(
        frame,
        [startFrame + 30, startFrame + 60, startFrame + 90],
        [1, 1.05, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                opacity,
                transform: `scale(${scale}) translateY(${y}px)`,
            }}
        >
            {/* Node card */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: layout === 'horizontal' ? 'row' : 'column',
                    alignItems: 'center',
                    gap: 16,
                    padding: layout === 'horizontal' ? '16px 24px' : '24px 32px',
                    borderRadius: 16,
                    backgroundColor: nodeStyle.bg,
                    border: `2px solid ${nodeStyle.border}`,
                    boxShadow: `0 4px 16px rgba(0,0,0,0.06)`,
                    minWidth: layout === 'horizontal' ? 180 : 140,
                }}
            >
                {/* Icon circle */}
                {node.icon && (
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            backgroundColor: nodeStyle.iconBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 24,
                            transform: `scale(${pulse})`,
                            boxShadow: `0 2px 8px ${nodeStyle.iconBg}40`,
                        }}
                    >
                        {node.icon}
                    </div>
                )}

                {/* Text */}
                <div
                    style={{
                        textAlign: layout === 'horizontal' ? 'left' : 'center',
                    }}
                >
                    <div
                        style={{
                            fontSize: 18,
                            fontWeight: 600,
                            color: COLORS.text,
                            lineHeight: 1.3,
                        }}
                    >
                        {node.label}
                    </div>
                    {node.sublabel && (
                        <div
                            style={{
                                fontSize: 14,
                                color: COLORS.textMuted,
                                marginTop: 4,
                            }}
                        >
                            {node.sublabel}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// CONNECTION ARROW COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

interface ConnectionArrowProps {
    index: number;
    staggerDelay: number;
    layout: 'horizontal' | 'vertical' | 'grid';
    label?: string;
}

const ConnectionArrow: React.FC<ConnectionArrowProps> = ({
    index,
    staggerDelay,
    layout,
    label,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const startFrame = (index + 0.5) * staggerDelay;

    const drawProgress = spring({
        frame: Math.max(0, frame - startFrame),
        fps,
        config: { damping: 20, stiffness: 100 },
    });

    const isHorizontal = layout === 'horizontal';
    const arrowLength = isHorizontal ? 60 : 40;

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: isHorizontal ? 'row' : 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: isHorizontal ? arrowLength : 'auto',
                height: isHorizontal ? 'auto' : arrowLength,
            }}
        >
            {/* Arrow line */}
            <div
                style={{
                    width: isHorizontal ? `${drawProgress * 100}%` : 3,
                    height: isHorizontal ? 3 : `${drawProgress * 100}%`,
                    backgroundColor: COLORS.border,
                    borderRadius: 2,
                    position: 'relative',
                }}
            >
                {/* Arrow head */}
                {drawProgress > 0.8 && (
                    <div
                        style={{
                            position: 'absolute',
                            [isHorizontal ? 'right' : 'bottom']: -6,
                            [isHorizontal ? 'top' : 'left']: '50%',
                            transform: isHorizontal
                                ? 'translateY(-50%)'
                                : 'translateX(-50%) rotate(90deg)',
                            width: 0,
                            height: 0,
                            borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent',
                            borderTop: `10px solid ${COLORS.border}`,
                            opacity: interpolate(drawProgress, [0.8, 1], [0, 1]),
                        }}
                    />
                )}
            </div>

            {/* Label */}
            {label && drawProgress > 0.5 && (
                <div
                    style={{
                        position: 'absolute',
                        fontSize: 12,
                        color: COLORS.textMuted,
                        backgroundColor: COLORS.background,
                        padding: '2px 8px',
                        borderRadius: 4,
                        opacity: interpolate(drawProgress, [0.5, 1], [0, 1]),
                    }}
                >
                    {label}
                </div>
            )}
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN FLOW DIAGRAM COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export const FlowDiagram: React.FC<FlowDiagramProps> = ({
    nodes,
    connections = [],
    layout = 'horizontal',
    staggerDelay = 12,
    showConnections = true,
    style = {},
}) => {
    const isGrid = layout === 'grid';
    const isHorizontal = layout === 'horizontal';

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: isHorizontal ? 'row' : 'column',
                flexWrap: isGrid ? 'wrap' : 'nowrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: showConnections ? 0 : 24,
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
                ...style,
            }}
        >
            {nodes.map((node, index) => (
                <React.Fragment key={node.id}>
                    <FlowNodeComponent
                        node={node}
                        index={index}
                        staggerDelay={staggerDelay}
                        layout={layout}
                    />

                    {/* Connection arrow to next node */}
                    {showConnections && index < nodes.length - 1 && (
                        <ConnectionArrow
                            index={index}
                            staggerDelay={staggerDelay}
                            layout={layout}
                            label={connections[index]?.label}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// PRESET FLOW DIAGRAMS
// ══════════════════════════════════════════════════════════════════════════════

/** Safety procedure flow - LOTO */
export const FLOW_LOTO: FlowNode[] = [
    { id: '1', label: 'Identificar', icon: '🔍', type: 'start', sublabel: 'Fuentes de energía' },
    { id: '2', label: 'Notificar', icon: '📢', type: 'process', sublabel: 'Personal afectado' },
    { id: '3', label: 'Aislar', icon: '⚡', type: 'warning', sublabel: 'Equipos' },
    { id: '4', label: 'Bloquear', icon: '🔒', type: 'process', sublabel: 'Con candado' },
    { id: '5', label: 'Verificar', icon: '✅', type: 'end', sublabel: 'Energía cero' },
];

/** Maintenance procedure flow */
export const FLOW_MAINTENANCE: FlowNode[] = [
    { id: '1', label: 'Preparación', icon: '📋', type: 'start' },
    { id: '2', label: 'Inspección', icon: '🔍', type: 'process' },
    { id: '3', label: 'Diagnóstico', icon: '🔧', type: 'decision' },
    { id: '4', label: 'Reparación', icon: '⚙️', type: 'process' },
    { id: '5', label: 'Pruebas', icon: '✅', type: 'end' },
];

/** EPP flow */
export const FLOW_EPP: FlowNode[] = [
    { id: '1', label: 'Casco', icon: '⛑️', type: 'default' },
    { id: '2', label: 'Lentes', icon: '🥽', type: 'default' },
    { id: '3', label: 'Guantes', icon: '🧤', type: 'default' },
    { id: '4', label: 'Zapatos', icon: '👢', type: 'default' },
];

export default FlowDiagram;
