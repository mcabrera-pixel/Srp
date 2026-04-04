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

export type BentoSize = '1x1' | '2x1' | '1x2' | '2x2';

export interface BentoItem {
    id: string;
    size: BentoSize;
    content: React.ReactNode;
    /** Background color or gradient */
    background?: string;
    /** Border color */
    borderColor?: string;
    /** Custom padding */
    padding?: number;
}

export interface BentoGridProps {
    items: BentoItem[];
    /** Number of columns in the grid */
    columns?: number;
    /** Gap between items in pixels */
    gap?: number;
    /** Base cell size in pixels */
    cellSize?: number;
    /** Stagger delay between items appearing (frames) */
    staggerDelay?: number;
    /** Additional container style */
    style?: React.CSSProperties;
}

// ══════════════════════════════════════════════════════════════════════════════
// COLORS — Apple style
// ══════════════════════════════════════════════════════════════════════════════

const COLORS = {
    background: '#FFFFFF',
    surface: '#FBFBFD',
    surfaceAlt: '#F5F5F7',
    primary: '#00A651',
    accent: '#007AFF',
    text: '#1D1D1F',
    textSecondary: '#424245',
    textMuted: '#86868B',
    border: '#E8E8ED',
    borderLight: '#F0F0F5',
    shadow: 'rgba(0, 0, 0, 0.04)',
    shadowMedium: 'rgba(0, 0, 0, 0.08)',
};

// ══════════════════════════════════════════════════════════════════════════════
// BENTO CELL COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

interface BentoCellProps {
    item: BentoItem;
    index: number;
    cellSize: number;
    gap: number;
    staggerDelay: number;
}

const BentoCell: React.FC<BentoCellProps> = ({
    item,
    index,
    cellSize,
    gap,
    staggerDelay,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const startFrame = index * staggerDelay;

    // Spring animation for appearance
    const appearProgress = spring({
        frame: Math.max(0, frame - startFrame),
        fps,
        config: { damping: 14, stiffness: 100, mass: 0.9 },
    });

    const scale = interpolate(appearProgress, [0, 1], [0.92, 1]);
    const opacity = interpolate(appearProgress, [0, 1], [0, 1]);
    const y = interpolate(appearProgress, [0, 1], [15, 0]);

    // Size calculations
    const sizeMap: Record<BentoSize, { cols: number; rows: number }> = {
        '1x1': { cols: 1, rows: 1 },
        '2x1': { cols: 2, rows: 1 },
        '1x2': { cols: 1, rows: 2 },
        '2x2': { cols: 2, rows: 2 },
    };

    const { cols, rows } = sizeMap[item.size];
    const width = cellSize * cols + gap * (cols - 1);
    const height = cellSize * rows + gap * (rows - 1);

    return (
        <div
            style={{
                width,
                height,
                borderRadius: 20,
                backgroundColor: item.background || COLORS.surface,
                border: `1px solid ${item.borderColor || COLORS.border}`,
                padding: item.padding ?? 24,
                boxShadow: `0 2px 12px ${COLORS.shadow}`,
                overflow: 'hidden',
                opacity,
                transform: `scale(${scale}) translateY(${y}px)`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            {item.content}
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN BENTO GRID COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export const BentoGrid: React.FC<BentoGridProps> = ({
    items,
    columns = 4,
    gap = 16,
    cellSize = 160,
    staggerDelay = 8,
    style = {},
}) => {
    return (
        <div
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap,
                maxWidth: cellSize * columns + gap * (columns - 1),
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
                ...style,
            }}
        >
            {items.map((item, index) => (
                <BentoCell
                    key={item.id}
                    item={item}
                    index={index}
                    cellSize={cellSize}
                    gap={gap}
                    staggerDelay={staggerDelay}
                />
            ))}
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// BENTO CONTENT HELPERS
// ══════════════════════════════════════════════════════════════════════════════

interface StatCardProps {
    value: string | number;
    label: string;
    icon?: string;
    color?: string;
}

export const BentoStatCard: React.FC<StatCardProps> = ({
    value,
    label,
    icon,
    color = COLORS.primary,
}) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: 8,
            }}
        >
            {icon && (
                <div
                    style={{
                        fontSize: 32,
                        marginBottom: 8,
                    }}
                >
                    {icon}
                </div>
            )}
            <div
                style={{
                    fontSize: 36,
                    fontWeight: 700,
                    color,
                    letterSpacing: '-0.02em',
                }}
            >
                {value}
            </div>
            <div
                style={{
                    fontSize: 14,
                    color: COLORS.textMuted,
                    fontWeight: 500,
                }}
            >
                {label}
            </div>
        </div>
    );
};

interface TextCardProps {
    title: string;
    description?: string;
    icon?: string;
}

export const BentoTextCard: React.FC<TextCardProps> = ({
    title,
    description,
    icon,
}) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                gap: 12,
                width: '100%',
            }}
        >
            {icon && (
                <div
                    style={{
                        fontSize: 28,
                    }}
                >
                    {icon}
                </div>
            )}
            <div
                style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: COLORS.text,
                    lineHeight: 1.3,
                }}
            >
                {title}
            </div>
            {description && (
                <div
                    style={{
                        fontSize: 14,
                        color: COLORS.textSecondary,
                        lineHeight: 1.5,
                    }}
                >
                    {description}
                </div>
            )}
        </div>
    );
};

interface IconListProps {
    items: Array<{ icon: string; label: string }>;
}

export const BentoIconList: React.FC<IconListProps> = ({ items }) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                width: '100%',
            }}
        >
            {items.map((item, index) => (
                <div
                    key={index}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                    }}
                >
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            backgroundColor: COLORS.surfaceAlt,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                        }}
                    >
                        {item.icon}
                    </div>
                    <div
                        style={{
                            fontSize: 14,
                            color: COLORS.text,
                            fontWeight: 500,
                        }}
                    >
                        {item.label}
                    </div>
                </div>
            ))}
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// PRESET BENTO LAYOUTS
// ══════════════════════════════════════════════════════════════════════════════

/** Safety stats layout */
export const createSafetyStatsBento = (): BentoItem[] => [
    {
        id: 'risk',
        size: '1x1',
        content: <BentoStatCard value="Alto" label="Nivel de Riesgo" icon="⚠️" color="#FF9500" />,
        background: '#FFF8F0',
        borderColor: '#FFD9B3',
    },
    {
        id: 'time',
        size: '1x1',
        content: <BentoStatCard value="45" label="Minutos Est." icon="⏱️" color="#007AFF" />,
    },
    {
        id: 'steps',
        size: '1x1',
        content: <BentoStatCard value="8" label="Pasos" icon="📋" color="#00A651" />,
    },
    {
        id: 'team',
        size: '1x1',
        content: <BentoStatCard value="2" label="Personas" icon="👷" color="#AF52DE" />,
    },
];

/** EPP requirements layout */
export const createEPPBento = (): BentoItem[] => [
    {
        id: 'epp-list',
        size: '2x2',
        content: (
            <BentoIconList
                items={[
                    { icon: '⛑️', label: 'Casco de seguridad' },
                    { icon: '🥽', label: 'Lentes de protección' },
                    { icon: '🧤', label: 'Guantes dieléctricos' },
                    { icon: '👢', label: 'Zapatos de seguridad' },
                    { icon: '🦺', label: 'Chaleco reflectante' },
                ]}
            />
        ),
    },
];

export default BentoGrid;
