import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    Easing,
    Audio,
    staticFile,
} from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';

import { ManimClip } from '../components/ManimClip';
import { AIVideoClip } from '../components/AIVideoClip';
import type { Procedure, ProcedureStep } from '../types';

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

export type SegmentType = 'manim' | 'ai' | 'content' | 'intro' | 'outro';

export interface VideoSegment {
    id: string;
    type: SegmentType;
    durationInSeconds: number;
    /** Path to video file (for manim/ai types) */
    src?: string;
    /** Procedure step data (for content type) */
    step?: ProcedureStep;
    /** Custom title for intro/outro */
    title?: string;
    /** Subtitle */
    subtitle?: string;
    /** Audio file path */
    audio?: string;
}

export interface HybridProcedureVideoProps {
    /** Procedure data */
    procedure: Procedure;
    /** Video segments in order */
    segments: VideoSegment[];
    /** Frames per second */
    fps?: number;
    /** Transition duration in frames */
    transitionFrames?: number;
    /** Show logo watermark */
    showLogo?: boolean;
    /** Logo position */
    logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

// ══════════════════════════════════════════════════════════════════════════════
// COLORS — Apple-inspired minimalist palette
// ══════════════════════════════════════════════════════════════════════════════

const COLORS = {
    // Backgrounds - Clean whites and subtle grays
    background: '#FFFFFF',
    backgroundAlt: '#F5F5F7',
    backgroundGradientStart: '#FFFFFF',
    backgroundGradientEnd: '#F5F5F7',
    surface: '#FBFBFD',

    // Brand colors
    primary: '#00A651',      // CODELCO Green
    primaryLight: '#34C759', // Apple green
    secondary: '#E87722',    // CODELCO Orange
    secondaryLight: '#FF9F0A', // Apple orange

    // Accents
    accent: '#007AFF',       // Apple blue
    accentLight: '#5AC8FA',  // Light blue
    purple: '#AF52DE',       // Apple purple

    // Text - High contrast on white
    text: '#1D1D1F',         // Apple primary text
    textSecondary: '#424245', // Darker secondary
    textMuted: '#86868B',    // Apple muted
    textLight: '#FFFFFF',    // For dark backgrounds

    // Status colors
    danger: '#FF3B30',       // Apple red
    warning: '#FF9500',      // Apple warning
    success: '#34C759',      // Apple success

    // Borders and dividers
    border: '#D2D2D7',
    borderLight: '#E8E8ED',

    // Shadows (for CSS)
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowMedium: 'rgba(0, 0, 0, 0.08)',
};

// ══════════════════════════════════════════════════════════════════════════════
// INTRO SEGMENT
// ══════════════════════════════════════════════════════════════════════════════

interface IntroSegmentProps {
    title: string;
    subtitle?: string;
    code?: string;
}

const IntroSegment: React.FC<IntroSegmentProps> = ({ title, subtitle, code }) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    // Animations - smoother Apple-style easing
    const logoOpacity = interpolate(frame, [0, 40], [0, 1], {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
    });
    const logoScale = interpolate(frame, [0, 40], [0.95, 1], {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
    });
    const titleOpacity = interpolate(frame, [25, 55], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
    });
    const titleY = interpolate(frame, [25, 55], [20, 0], {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
    });
    const subtitleOpacity = interpolate(frame, [45, 75], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
    });
    const fadeOut = interpolate(
        frame,
        [durationInFrames - 25, durationInFrames],
        [1, 0],
        { extrapolateLeft: 'clamp', easing: Easing.in(Easing.cubic) }
    );

    // Subtle gradient animation
    const gradientShift = interpolate(frame, [0, durationInFrames], [0, 10], {
        extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill
            style={{
                background: COLORS.background,
                opacity: fadeOut,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
            }}
        >
            {/* Subtle gradient overlay - Apple style */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(ellipse 80% 50% at 50% ${20 + gradientShift}%, ${COLORS.primary}08 0%, transparent 70%)`,
                }}
            />

            {/* Top accent line */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: '20%',
                    right: '20%',
                    height: 4,
                    background: `linear-gradient(90deg, transparent, ${COLORS.primary}, transparent)`,
                    opacity: logoOpacity * 0.6,
                }}
            />

            {/* Logo */}
            <div
                style={{
                    position: 'absolute',
                    top: '18%',
                    left: '50%',
                    transform: `translateX(-50%) scale(${logoScale})`,
                    opacity: logoOpacity,
                }}
            >
                <div
                    style={{
                        fontSize: 64,
                        fontWeight: 700,
                        color: COLORS.text,
                        letterSpacing: '-0.02em',
                    }}
                >
                    CODELCO
                </div>
            </div>

            {/* Procedure code pill */}
            {code && (
                <div
                    style={{
                        position: 'absolute',
                        top: '34%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        opacity: titleOpacity,
                        padding: '14px 48px',
                        borderRadius: 50,
                        backgroundColor: COLORS.primary,
                        boxShadow: `0 4px 20px ${COLORS.primary}40`,
                    }}
                >
                    <div
                        style={{
                            fontSize: 26,
                            fontWeight: 600,
                            color: COLORS.textLight,
                            letterSpacing: '0.05em',
                        }}
                    >
                        {code}
                    </div>
                </div>
            )}

            {/* Title */}
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, ${titleY}px)`,
                    opacity: titleOpacity,
                    textAlign: 'center',
                    width: '80%',
                }}
            >
                <div
                    style={{
                        fontSize: 52,
                        fontWeight: 700,
                        color: COLORS.text,
                        lineHeight: 1.15,
                        letterSpacing: '-0.02em',
                    }}
                >
                    {title}
                </div>
            </div>

            {/* Subtitle */}
            {subtitle && (
                <div
                    style={{
                        position: 'absolute',
                        top: '64%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        opacity: subtitleOpacity,
                        textAlign: 'center',
                    }}
                >
                    <div
                        style={{
                            fontSize: 32,
                            color: COLORS.textSecondary,
                            fontWeight: 500,
                            letterSpacing: '-0.01em',
                        }}
                    >
                        {subtitle}
                    </div>
                </div>
            )}

            {/* Location badge */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '12%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    opacity: subtitleOpacity,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                }}
            >
                <div
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: COLORS.accent,
                    }}
                />
                <div
                    style={{
                        fontSize: 20,
                        color: COLORS.textMuted,
                        fontWeight: 500,
                    }}
                >
                    Fundición Chuquicamata
                </div>
            </div>
        </AbsoluteFill>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// CONTENT SEGMENT (Procedure Step)
// ══════════════════════════════════════════════════════════════════════════════

interface ContentSegmentProps {
    step: ProcedureStep;
    stepNumber: number;
    totalSteps: number;
}

const ContentSegment: React.FC<ContentSegmentProps> = ({
    step,
    stepNumber,
    totalSteps,
}) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    // Staggered animations for Apple-style reveal
    const containerOpacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
    });
    const headerY = interpolate(frame, [5, 30], [15, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
    });
    const contentY = interpolate(frame, [15, 40], [20, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
    });
    const badgesOpacity = interpolate(frame, [30, 50], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const fadeOut = interpolate(
        frame,
        [durationInFrames - 20, durationInFrames],
        [1, 0],
        { extrapolateLeft: 'clamp', easing: Easing.in(Easing.cubic) }
    );

    // Progress animation
    const progressWidth = interpolate(
        frame,
        [0, 30],
        [(stepNumber - 1) / totalSteps * 100, stepNumber / totalSteps * 100],
        { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
    );

    // Risk level config with Apple-style colors
    const riskConfig: Record<string, { color: string; bg: string; label: string }> = {
        bajo: { color: COLORS.success, bg: `${COLORS.success}15`, label: 'Bajo' },
        medio: { color: COLORS.warning, bg: `${COLORS.warning}15`, label: 'Medio' },
        alto: { color: COLORS.secondary, bg: `${COLORS.secondary}15`, label: 'Alto' },
        critico: { color: COLORS.danger, bg: `${COLORS.danger}15`, label: 'Crítico' },
    };

    const risk = step.riesgo ? riskConfig[step.riesgo] : null;

    return (
        <AbsoluteFill
            style={{
                background: COLORS.background,
                opacity: fadeOut,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
            }}
        >
            {/* Subtle top gradient */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '40%',
                    background: `linear-gradient(180deg, ${COLORS.backgroundAlt} 0%, ${COLORS.background} 100%)`,
                }}
            />

            {/* Background video/image if available */}
            {step.video && step.videoType === 'ai' && (
                <AIVideoClip
                    src={step.video}
                    tintOpacity={0.6}
                    vignette
                    fadeInFrames={15}
                    fadeOutFrames={15}
                    {...step.aiVideoConfig}
                />
            )}
            {step.video && step.videoType === 'manim' && (
                <ManimClip
                    src={step.video}
                    colorGrade
                    fadeInFrames={15}
                    fadeOutFrames={15}
                    {...step.manimVideoConfig}
                />
            )}

            {/* Main content - Bento-style layout */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    padding: 72,
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: containerOpacity,
                }}
            >
                {/* Header row */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 40,
                        transform: `translateY(${headerY}px)`,
                    }}
                >
                    {/* Step indicator - pill style */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                        }}
                    >
                        <div
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: 16,
                                backgroundColor: COLORS.primary,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 24,
                                fontWeight: 700,
                                color: COLORS.textLight,
                                boxShadow: `0 4px 16px ${COLORS.primary}30`,
                            }}
                        >
                            {stepNumber}
                        </div>
                        <div>
                            <div style={{
                                color: COLORS.textMuted,
                                fontSize: 14,
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                            }}>
                                Paso {stepNumber} de {totalSteps}
                            </div>
                        </div>
                    </div>

                    {/* Risk badge - Apple pill style */}
                    {risk && (
                        <div
                            style={{
                                padding: '10px 20px',
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
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: risk.color,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.03em',
                                }}
                            >
                                Riesgo {risk.label}
                            </span>
                        </div>
                    )}
                </div>

                {/* Title - large Apple typography */}
                <div
                    style={{
                        fontSize: 44,
                        fontWeight: 700,
                        color: COLORS.text,
                        marginBottom: 28,
                        lineHeight: 1.15,
                        letterSpacing: '-0.02em',
                        maxWidth: '90%',
                        transform: `translateY(${contentY}px)`,
                    }}
                >
                    {step.titulo}
                </div>

                {/* Content card - Bento box style */}
                <div
                    style={{
                        backgroundColor: COLORS.surface,
                        borderRadius: 20,
                        padding: 32,
                        border: `1px solid ${COLORS.borderLight}`,
                        flex: 1,
                        maxHeight: '45%',
                        transform: `translateY(${contentY}px)`,
                        boxShadow: `0 2px 12px ${COLORS.shadowColor}`,
                    }}
                >
                    <div
                        style={{
                            fontSize: 24,
                            color: COLORS.textSecondary,
                            lineHeight: 1.7,
                        }}
                    >
                        {step.contenido}
                    </div>
                </div>

                {/* EPP badges - Apple tag style */}
                {step.epp && step.epp.length > 0 && (
                    <div
                        style={{
                            marginTop: 32,
                            display: 'flex',
                            gap: 10,
                            flexWrap: 'wrap',
                            opacity: badgesOpacity,
                        }}
                    >
                        <span style={{
                            fontSize: 14,
                            color: COLORS.textMuted,
                            fontWeight: 500,
                            marginRight: 8,
                            alignSelf: 'center',
                        }}>
                            EPP Requerido:
                        </span>
                        {step.epp.map((item) => (
                            <div
                                key={item}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: 50,
                                    backgroundColor: COLORS.backgroundAlt,
                                    border: `1px solid ${COLORS.border}`,
                                    color: COLORS.textSecondary,
                                    fontSize: 14,
                                    fontWeight: 500,
                                    textTransform: 'capitalize',
                                }}
                            >
                                {item.replace('_', ' ')}
                            </div>
                        ))}
                    </div>
                )}

                {/* Progress bar - thin Apple style */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 48,
                        left: 72,
                        right: 72,
                        height: 4,
                        backgroundColor: COLORS.borderLight,
                        borderRadius: 2,
                    }}
                >
                    <div
                        style={{
                            width: `${progressWidth}%`,
                            height: '100%',
                            backgroundColor: COLORS.primary,
                            borderRadius: 2,
                        }}
                    />
                </div>
            </div>
        </AbsoluteFill>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// OUTRO SEGMENT
// ══════════════════════════════════════════════════════════════════════════════

interface OutroSegmentProps {
    message?: string;
}

const OutroSegment: React.FC<OutroSegmentProps> = ({
    message = 'Tu seguridad es lo primero.',
}) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    // Staggered Apple-style animations
    const line1Opacity = interpolate(frame, [0, 25], [0, 1], {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
    });
    const line1Y = interpolate(frame, [0, 25], [15, 0], {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
    });
    const line2Opacity = interpolate(frame, [15, 40], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
    });
    const line2Scale = interpolate(frame, [15, 40], [0.98, 1], {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
    });
    const line3Opacity = interpolate(frame, [30, 55], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
    });
    const messageOpacity = interpolate(frame, [50, 80], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
    });
    const fadeOut = interpolate(
        frame,
        [durationInFrames - 30, durationInFrames],
        [1, 0],
        { extrapolateLeft: 'clamp', easing: Easing.in(Easing.cubic) }
    );

    return (
        <AbsoluteFill
            style={{
                background: COLORS.background,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: fadeOut,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
            }}
        >
            {/* Subtle radial gradient */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(ellipse 60% 40% at 50% 45%, ${COLORS.warning}08 0%, transparent 70%)`,
                }}
            />

            {/* Main content */}
            <div
                style={{
                    textAlign: 'center',
                    maxWidth: '80%',
                }}
            >
                {/* Line 1 */}
                <div
                    style={{
                        fontSize: 28,
                        color: COLORS.textSecondary,
                        marginBottom: 16,
                        opacity: line1Opacity,
                        transform: `translateY(${line1Y}px)`,
                        fontWeight: 500,
                    }}
                >
                    Si las condiciones cambian,
                </div>

                {/* Line 2 - Highlighted */}
                <div
                    style={{
                        fontSize: 56,
                        fontWeight: 700,
                        marginBottom: 16,
                        opacity: line2Opacity,
                        transform: `scale(${line2Scale})`,
                        letterSpacing: '-0.02em',
                    }}
                >
                    <span style={{ color: COLORS.warning }}>DETÉN</span>
                    <span style={{ color: COLORS.text }}> la tarea</span>
                </div>

                {/* Line 3 */}
                <div
                    style={{
                        fontSize: 28,
                        color: COLORS.textSecondary,
                        marginBottom: 60,
                        opacity: line3Opacity,
                        fontWeight: 500,
                    }}
                >
                    y reevalúa los riesgos.
                </div>

                {/* Message box - Apple card style */}
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 16,
                        padding: '20px 40px',
                        borderRadius: 16,
                        backgroundColor: COLORS.surface,
                        border: `1px solid ${COLORS.borderLight}`,
                        boxShadow: `0 4px 20px ${COLORS.shadowMedium}`,
                        opacity: messageOpacity,
                    }}
                >
                    <div
                        style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: COLORS.primary,
                        }}
                    />
                    <div
                        style={{
                            fontSize: 32,
                            fontWeight: 600,
                            color: COLORS.text,
                            letterSpacing: '-0.01em',
                        }}
                    >
                        {message}
                    </div>
                </div>
            </div>

            {/* Branding footer */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 48,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    opacity: messageOpacity,
                }}
            >
                <div
                    style={{
                        fontSize: 16,
                        color: COLORS.textMuted,
                        fontWeight: 500,
                    }}
                >
                    SRP Learn
                </div>
                <div
                    style={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        backgroundColor: COLORS.border,
                    }}
                />
                <div
                    style={{
                        fontSize: 16,
                        color: COLORS.primary,
                        fontWeight: 600,
                    }}
                >
                    CODELCO
                </div>
            </div>
        </AbsoluteFill>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// LOGO WATERMARK
// ══════════════════════════════════════════════════════════════════════════════

interface LogoWatermarkProps {
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const LogoWatermark: React.FC<LogoWatermarkProps> = ({ position }) => {
    const positionStyles: Record<string, React.CSSProperties> = {
        'top-left': { top: 20, left: 20 },
        'top-right': { top: 20, right: 20 },
        'bottom-left': { bottom: 20, left: 20 },
        'bottom-right': { bottom: 20, right: 20 },
    };

    return (
        <div
            style={{
                position: 'absolute',
                ...positionStyles[position],
                fontSize: 18,
                fontWeight: 'bold',
                color: COLORS.primary,
                opacity: 0.7,
                letterSpacing: '0.05em',
            }}
        >
            MCCO
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export const HybridProcedureVideo: React.FC<HybridProcedureVideoProps> = ({
    procedure,
    segments,
    fps = 30,
    transitionFrames = 15,
    showLogo = true,
    logoPosition = 'top-right',
}) => {
    const { fps: configFps } = useVideoConfig();
    const actualFps = configFps || fps;

    // Calculate frames for each segment
    const segmentData = segments.map((segment, index) => {
        const durationInFrames = Math.round(segment.durationInSeconds * actualFps);
        return {
            ...segment,
            durationInFrames,
            index,
        };
    });

    // Count content steps for progress
    const contentSteps = segments.filter((s) => s.type === 'content');
    let contentIndex = 0;

    return (
        <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
            <TransitionSeries>
                {segmentData.map((segment) => {
                    let content: React.ReactNode = null;

                    switch (segment.type) {
                        case 'intro':
                            content = (
                                <IntroSegment
                                    title={segment.title || procedure.titulo}
                                    subtitle={segment.subtitle || procedure.subtitulo}
                                    code={procedure.id}
                                />
                            );
                            break;

                        case 'manim':
                            content = segment.src ? (
                                <ManimClip
                                    src={segment.src}
                                    colorGrade
                                    fadeInFrames={transitionFrames}
                                    fadeOutFrames={transitionFrames}
                                />
                            ) : null;
                            break;

                        case 'ai':
                            content = segment.src ? (
                                <AIVideoClip
                                    src={segment.src}
                                    tint={COLORS.background}
                                    tintOpacity={0.15}
                                    vignette
                                    fadeInFrames={transitionFrames}
                                    fadeOutFrames={transitionFrames}
                                />
                            ) : null;
                            break;

                        case 'content':
                            contentIndex++;
                            content = segment.step ? (
                                <ContentSegment
                                    step={segment.step}
                                    stepNumber={contentIndex}
                                    totalSteps={contentSteps.length}
                                />
                            ) : null;
                            break;

                        case 'outro':
                            content = <OutroSegment message={segment.title} />;
                            break;
                    }

                    return (
                        <React.Fragment key={segment.id}>
                            <TransitionSeries.Sequence
                                durationInFrames={segment.durationInFrames}
                            >
                                {content}
                                {/* Audio for segment if available */}
                                {segment.audio && (
                                    <Audio src={staticFile(segment.audio)} />
                                )}
                            </TransitionSeries.Sequence>

                            {/* Add transition between segments */}
                            {segment.index < segmentData.length - 1 && (
                                <TransitionSeries.Transition
                                    presentation={fade()}
                                    timing={linearTiming({
                                        durationInFrames: transitionFrames,
                                    })}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </TransitionSeries>

            {/* Logo watermark */}
            {showLogo && <LogoWatermark position={logoPosition} />}
        </AbsoluteFill>
    );
};

export default HybridProcedureVideo;
