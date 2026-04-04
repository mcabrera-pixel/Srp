import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
    Easing,
} from 'remotion';
import { FlowDiagram, FlowNode, FLOW_LOTO, FLOW_MAINTENANCE } from './FlowDiagram';
import { BentoGrid, BentoItem, BentoStatCard, BentoTextCard, BentoIconList } from './BentoGrid';
import { AnimatedIcon, IconRow, IconGrid, EPP_ICONS, SAFETY_ICONS } from './AnimatedIcon';
import { SVGPathDraw, DECORATIVE_PATHS } from './SVGPathDraw';

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

export type SlideLayout =
    | 'title-content'      // Title on left, content on right
    | 'flow-diagram'       // Flow diagram centered
    | 'bento-grid'         // Bento grid layout
    | 'icon-showcase'      // Large icons with labels
    | 'split-visual'       // Split screen with visual
    | 'stats-dashboard'    // Statistics dashboard
    | 'checklist'          // Checklist with checkmarks
    | 'comparison';        // Before/After comparison

export interface ContentSlideProps {
    layout: SlideLayout;
    title: string;
    subtitle?: string;
    content?: string;
    /** Flow diagram nodes */
    flowNodes?: FlowNode[];
    /** Bento grid items */
    bentoItems?: BentoItem[];
    /** Icon items for icon layouts */
    icons?: Array<{ icon: string; label?: string; color?: string }>;
    /** Checklist items */
    checklistItems?: string[];
    /** Stats for dashboard */
    stats?: Array<{ value: string | number; label: string; icon?: string; color?: string }>;
    /** Step number for header */
    stepNumber?: number;
    totalSteps?: number;
    /** Risk level */
    riskLevel?: 'bajo' | 'medio' | 'alto' | 'critico';
    /** Custom accent color */
    accentColor?: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// COLORS — Apple style
// ══════════════════════════════════════════════════════════════════════════════

const COLORS = {
    background: '#FFFFFF',
    backgroundAlt: '#F5F5F7',
    surface: '#FBFBFD',
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
    success: '#34C759',
    warning: '#FF9500',
    danger: '#FF3B30',
    shadow: 'rgba(0, 0, 0, 0.04)',
};

const RISK_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
    bajo: { color: COLORS.success, bg: `${COLORS.success}12`, label: 'Bajo' },
    medio: { color: COLORS.warning, bg: `${COLORS.warning}12`, label: 'Medio' },
    alto: { color: COLORS.secondary, bg: `${COLORS.secondary}12`, label: 'Alto' },
    critico: { color: COLORS.danger, bg: `${COLORS.danger}12`, label: 'Crítico' },
};

// ══════════════════════════════════════════════════════════════════════════════
// HEADER COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

interface SlideHeaderProps {
    stepNumber?: number;
    totalSteps?: number;
    riskLevel?: string;
}

const SlideHeader: React.FC<SlideHeaderProps> = ({ stepNumber, totalSteps, riskLevel }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const headerOpacity = spring({
        frame,
        fps,
        config: { damping: 20, stiffness: 100 },
    });

    const risk = riskLevel ? RISK_CONFIG[riskLevel] : null;

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 32,
                opacity: headerOpacity,
            }}
        >
            {/* Step indicator */}
            {stepNumber && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 14,
                            backgroundColor: COLORS.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 22,
                            fontWeight: 700,
                            color: COLORS.textLight,
                            boxShadow: `0 4px 12px ${COLORS.primary}30`,
                        }}
                    >
                        {stepNumber}
                    </div>
                    <div
                        style={{
                            fontSize: 14,
                            color: COLORS.textMuted,
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                        }}
                    >
                        Paso {stepNumber}{totalSteps ? ` de ${totalSteps}` : ''}
                    </div>
                </div>
            )}

            {/* Risk badge */}
            {risk && (
                <div
                    style={{
                        padding: '8px 18px',
                        borderRadius: 50,
                        backgroundColor: risk.bg,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                    }}
                >
                    <div
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: risk.color,
                        }}
                    />
                    <span
                        style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: risk.color,
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em',
                        }}
                    >
                        Riesgo {risk.label}
                    </span>
                </div>
            )}
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// TITLE COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

interface SlideTitleProps {
    title: string;
    subtitle?: string;
    align?: 'left' | 'center';
}

const SlideTitle: React.FC<SlideTitleProps> = ({ title, subtitle, align = 'left' }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const titleProgress = spring({
        frame: Math.max(0, frame - 5),
        fps,
        config: { damping: 18, stiffness: 100 },
    });

    const titleY = interpolate(titleProgress, [0, 1], [15, 0]);

    return (
        <div
            style={{
                textAlign: align,
                opacity: titleProgress,
                transform: `translateY(${titleY}px)`,
            }}
        >
            <div
                style={{
                    fontSize: 42,
                    fontWeight: 700,
                    color: COLORS.text,
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em',
                    marginBottom: subtitle ? 12 : 0,
                }}
            >
                {title}
            </div>
            {subtitle && (
                <div
                    style={{
                        fontSize: 20,
                        color: COLORS.textSecondary,
                        fontWeight: 500,
                    }}
                >
                    {subtitle}
                </div>
            )}
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// CHECKLIST COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

interface ChecklistProps {
    items: string[];
    staggerDelay?: number;
}

const Checklist: React.FC<ChecklistProps> = ({ items, staggerDelay = 12 }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {items.map((item, index) => {
                const itemProgress = spring({
                    frame: Math.max(0, frame - 20 - index * staggerDelay),
                    fps,
                    config: { damping: 15, stiffness: 120 },
                });

                const checkProgress = spring({
                    frame: Math.max(0, frame - 30 - index * staggerDelay),
                    fps,
                    config: { damping: 12, stiffness: 150 },
                });

                return (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            opacity: itemProgress,
                            transform: `translateX(${interpolate(itemProgress, [0, 1], [-20, 0])}px)`,
                        }}
                    >
                        <div
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: 8,
                                backgroundColor: COLORS.primary,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transform: `scale(${checkProgress})`,
                                boxShadow: `0 2px 8px ${COLORS.primary}30`,
                            }}
                        >
                            <span style={{ color: COLORS.textLight, fontSize: 16 }}>✓</span>
                        </div>
                        <span
                            style={{
                                fontSize: 18,
                                color: COLORS.text,
                                fontWeight: 500,
                            }}
                        >
                            {item}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// STATS DASHBOARD COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

interface StatsDashboardProps {
    stats: Array<{ value: string | number; label: string; icon?: string; color?: string }>;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`,
                gap: 20,
            }}
        >
            {stats.map((stat, index) => {
                const statProgress = spring({
                    frame: Math.max(0, frame - 15 - index * 8),
                    fps,
                    config: { damping: 14, stiffness: 100 },
                });

                return (
                    <div
                        key={index}
                        style={{
                            backgroundColor: COLORS.surface,
                            borderRadius: 16,
                            padding: 24,
                            textAlign: 'center',
                            border: `1px solid ${COLORS.borderLight}`,
                            opacity: statProgress,
                            transform: `scale(${interpolate(statProgress, [0, 1], [0.9, 1])})`,
                            boxShadow: `0 2px 12px ${COLORS.shadow}`,
                        }}
                    >
                        {stat.icon && (
                            <div style={{ fontSize: 28, marginBottom: 12 }}>{stat.icon}</div>
                        )}
                        <div
                            style={{
                                fontSize: 32,
                                fontWeight: 700,
                                color: stat.color || COLORS.primary,
                                letterSpacing: '-0.02em',
                            }}
                        >
                            {stat.value}
                        </div>
                        <div
                            style={{
                                fontSize: 13,
                                color: COLORS.textMuted,
                                fontWeight: 500,
                                marginTop: 6,
                            }}
                        >
                            {stat.label}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN CONTENT SLIDE COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export const ContentSlide: React.FC<ContentSlideProps> = ({
    layout,
    title,
    subtitle,
    content,
    flowNodes,
    bentoItems,
    icons,
    checklistItems,
    stats,
    stepNumber,
    totalSteps,
    riskLevel,
    accentColor,
}) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    const fadeOut = interpolate(
        frame,
        [durationInFrames - 20, durationInFrames],
        [1, 0],
        { extrapolateLeft: 'clamp', easing: Easing.in(Easing.cubic) }
    );

    const renderContent = () => {
        switch (layout) {
            case 'flow-diagram':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                        <SlideTitle title={title} subtitle={subtitle} align="center" />
                        <FlowDiagram
                            nodes={flowNodes || FLOW_LOTO}
                            layout="horizontal"
                            staggerDelay={10}
                            style={{ justifyContent: 'center' }}
                        />
                    </div>
                );

            case 'bento-grid':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        <SlideTitle title={title} subtitle={subtitle} />
                        <BentoGrid
                            items={bentoItems || []}
                            columns={4}
                            cellSize={140}
                            gap={16}
                        />
                    </div>
                );

            case 'icon-showcase':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 40, alignItems: 'center' }}>
                        <SlideTitle title={title} subtitle={subtitle} align="center" />
                        <IconRow
                            icons={icons || EPP_ICONS}
                            size={72}
                            gap={32}
                            animation="pop"
                        />
                    </div>
                );

            case 'stats-dashboard':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        <SlideTitle title={title} subtitle={subtitle} />
                        <StatsDashboard
                            stats={stats || [
                                { value: '45', label: 'Minutos', icon: '⏱️', color: COLORS.accent },
                                { value: '8', label: 'Pasos', icon: '📋', color: COLORS.primary },
                                { value: '2', label: 'Personas', icon: '👷', color: '#AF52DE' },
                            ]}
                        />
                    </div>
                );

            case 'checklist':
                return (
                    <div style={{ display: 'flex', gap: 60 }}>
                        <div style={{ flex: 1 }}>
                            <SlideTitle title={title} subtitle={subtitle} />
                            {content && (
                                <div
                                    style={{
                                        fontSize: 18,
                                        color: COLORS.textSecondary,
                                        lineHeight: 1.6,
                                        marginTop: 20,
                                        marginBottom: 32,
                                    }}
                                >
                                    {content}
                                </div>
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <Checklist items={checklistItems || []} />
                        </div>
                    </div>
                );

            case 'title-content':
            default:
                return (
                    <div style={{ display: 'flex', gap: 60, alignItems: 'flex-start' }}>
                        <div style={{ flex: 1.2 }}>
                            <SlideTitle title={title} subtitle={subtitle} />
                            {content && (
                                <div
                                    style={{
                                        fontSize: 20,
                                        color: COLORS.textSecondary,
                                        lineHeight: 1.7,
                                        marginTop: 24,
                                        backgroundColor: COLORS.surface,
                                        padding: 28,
                                        borderRadius: 16,
                                        border: `1px solid ${COLORS.borderLight}`,
                                    }}
                                >
                                    {content}
                                </div>
                            )}
                        </div>
                        {icons && (
                            <div style={{ flex: 0.8 }}>
                                <IconGrid
                                    icons={icons}
                                    columns={2}
                                    size={56}
                                    gap={16}
                                    animation="float"
                                />
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <AbsoluteFill
            style={{
                background: COLORS.background,
                opacity: fadeOut,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
            }}
        >
            {/* Subtle gradient */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '35%',
                    background: `linear-gradient(180deg, ${COLORS.backgroundAlt} 0%, ${COLORS.background} 100%)`,
                }}
            />

            {/* Decorative corner */}
            <div style={{ position: 'absolute', top: 40, right: 40, opacity: 0.4 }}>
                <SVGPathDraw
                    path={DECORATIVE_PATHS.cornerTL}
                    color={accentColor || COLORS.primary}
                    strokeWidth={2}
                    width={80}
                    height={80}
                    delay={10}
                />
            </div>

            {/* Main content */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    padding: 64,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <SlideHeader
                    stepNumber={stepNumber}
                    totalSteps={totalSteps}
                    riskLevel={riskLevel}
                />

                <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    {renderContent()}
                </div>

                {/* Progress bar */}
                {stepNumber && totalSteps && (
                    <div
                        style={{
                            height: 4,
                            backgroundColor: COLORS.borderLight,
                            borderRadius: 2,
                            marginTop: 32,
                        }}
                    >
                        <div
                            style={{
                                width: `${(stepNumber / totalSteps) * 100}%`,
                                height: '100%',
                                backgroundColor: COLORS.primary,
                                borderRadius: 2,
                            }}
                        />
                    </div>
                )}
            </div>
        </AbsoluteFill>
    );
};

export default ContentSlide;
