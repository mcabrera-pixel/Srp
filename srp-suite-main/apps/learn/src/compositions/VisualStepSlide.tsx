import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
    Img,
} from 'remotion';
import { Animated, Fade, Move, Scale } from 'remotion-animated';
import { ProcedureStep } from '../types';
import { EPPBar } from '../components/EPPBar';

interface VisualStepSlideProps {
    paso: ProcedureStep;
    totalPasos: number;
    stepIndex: number;
}

/**
 * VisualStepSlide — Image-dominant slide with minimal text overlay.
 * Designed for maximum visual impact: full-bleed background image,
 * Ken Burns camera motion, and clean typography overlay.
 */
export const VisualStepSlide: React.FC<VisualStepSlideProps> = ({
    paso,
    totalPasos,
    stepIndex,
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    // Accent colors per step for visual variety
    const accentColors = [
        '#FF6B35', // Orange — intro
        '#4ECDC4', // Teal — EPP
        '#45B7D1', // Sky blue — verificaciones
        '#F7DC6F', // Gold — pasos
        '#E74C3C', // Red — riesgos
        '#FF4757', // Crimson — emergencias
        '#2ECC71', // Green — cierre
    ];
    const accent = accentColors[stepIndex % accentColors.length];

    // Risk to color mapping
    const riskColors: Record<string, string> = {
        bajo: '#2ecc71',
        medio: '#f1c40f',
        alto: '#e67e22',
        critico: '#e74c3c',
    };
    const riskColor = paso.riesgo ? riskColors[paso.riesgo] : accent;
    const riskLabel = paso.riesgo
        ? { bajo: 'BAJO', medio: 'MEDIO', alto: 'ALTO', critico: 'CRÍTICO' }[paso.riesgo]
        : '';

    // Ken Burns effect — slow zoom + pan
    const kenBurnsScale = interpolate(frame, [0, durationInFrames], [1.0, 1.12], {
        extrapolateRight: 'clamp',
    });
    const kenBurnsX = interpolate(frame, [0, durationInFrames], [0, -15], {
        extrapolateRight: 'clamp',
    });

    // Image fade-in
    const imgOpacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: 'clamp',
    });

    // Progress bar
    const progressWidth = interpolate(frame, [0, durationInFrames], [0, 100], {
        extrapolateRight: 'clamp',
    });

    // Content bullets (split by \n)
    const bullets = paso.contenido.split('\n').filter((b) => b.trim().length > 0);
    const isBulletList = bullets.length > 1;

    // Stagger delay for bullets
    const bulletDelay = 15; // frames between each bullet appearing
    const hasEPP = paso.epp && paso.epp.length > 0;

    return (
        <AbsoluteFill style={{ background: '#0a0a1a', overflow: 'hidden' }}>
            {/* ===== FULL-BLEED BACKGROUND IMAGE ===== */}
            {paso.imagen && (
                <>
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            overflow: 'hidden',
                        }}
                    >
                        <Img
                            src={paso.imagen}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                opacity: imgOpacity,
                                transform: `scale(${kenBurnsScale}) translateX(${kenBurnsX}px)`,
                                filter: 'brightness(0.65) contrast(1.1)',
                            }}
                        />
                    </div>

                    {/* Gradient overlay — dark from bottom for text readability */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: `linear-gradient(
                                to top,
                                rgba(0,0,0,0.92) 0%,
                                rgba(0,0,0,0.7) 30%,
                                rgba(0,0,0,0.25) 60%,
                                rgba(0,0,0,0.15) 100%
                            )`,
                        }}
                    />

                    {/* Accent glow from bottom-left */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: -100,
                            left: -100,
                            width: 600,
                            height: 600,
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)`,
                        }}
                    />
                </>
            )}

            {/* ===== TOP BAR: Logo + Step counter ===== */}
            <Animated
                animations={[Fade({ to: 1, initial: 0, start: 5 }), Move({ y: -20, initialY: -40, start: 5 })]}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '30px 50px',
                    zIndex: 10,
                }}
            >
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${accent}, ${accent}99)`,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <span style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>L</span>
                    </div>
                    <span
                        style={{
                            fontSize: 18,
                            fontWeight: 600,
                            color: 'rgba(255,255,255,0.7)',
                            letterSpacing: 2,
                            textTransform: 'uppercase',
                        }}
                    >
                        SRP Learn
                    </span>
                </div>

                {/* Step counter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>Paso</span>
                    <span style={{ fontSize: 28, fontWeight: 800, color: accent }}>
                        {paso.numero}
                    </span>
                    <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)' }}>
                        / {totalPasos}
                    </span>
                </div>
            </Animated>

            {/* ===== RISK BADGE (top-left below logo) ===== */}
            {paso.riesgo && (
                <Animated
                    animations={[
                        Fade({ to: 1, initial: 0, start: 15 }),
                        Scale({ by: 1, initial: 0.5, start: 15 }),
                    ]}
                    style={{
                        position: 'absolute',
                        top: 90,
                        left: 50,
                        zIndex: 10,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 16px',
                            borderRadius: 20,
                            background: `${riskColor}22`,
                            border: `1.5px solid ${riskColor}66`,
                        }}
                    >
                        <div
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: riskColor,
                                boxShadow: `0 0 12px ${riskColor}`,
                            }}
                        />
                        <span
                            style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: riskColor,
                                letterSpacing: 1.5,
                                textTransform: 'uppercase',
                            }}
                        >
                            Riesgo {riskLabel}
                        </span>
                    </div>
                </Animated>
            )}

            {/* ===== MAIN CONTENT — Bottom third ===== */}
            <div
                style={{
                    position: 'absolute',
                    bottom: hasEPP ? 100 : 50,
                    left: 0,
                    right: 0,
                    padding: '0 60px',
                    zIndex: 10,
                }}
            >
                {/* Title */}
                <Animated
                    animations={[
                        Fade({ to: 1, initial: 0, start: 10 }),
                        Move({ y: 0, initialY: 30, start: 10 }),
                    ]}
                >
                    <h2
                        style={{
                            fontSize: 56,
                            fontWeight: 800,
                            color: 'white',
                            lineHeight: 1.1,
                            marginBottom: 16,
                            textShadow: '0 4px 30px rgba(0,0,0,0.5)',
                            maxWidth: 900,
                        }}
                    >
                        {paso.titulo}
                    </h2>

                    {/* Accent underline */}
                    <div
                        style={{
                            width: 60,
                            height: 4,
                            borderRadius: 2,
                            background: accent,
                            marginBottom: 20,
                            boxShadow: `0 0 20px ${accent}80`,
                        }}
                    />
                </Animated>

                {/* Content — short text or bullet list */}
                <div style={{ maxWidth: 950 }}>
                    {isBulletList ? (
                        // Staggered bullet points
                        bullets.map((bullet, i) => {
                            const bulletStart = 20 + i * bulletDelay;
                            const bulletOpacity = interpolate(
                                frame,
                                [bulletStart, bulletStart + 12],
                                [0, 1],
                                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                            );
                            const bulletSlide = interpolate(
                                frame,
                                [bulletStart, bulletStart + 12],
                                [20, 0],
                                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                            );
                            // Clean bullet text (remove "Paso X:", "RIESGO X –", etc.)
                            const cleanBullet = bullet
                                .replace(/^Paso \d+:\s*/i, '')
                                .replace(/^RIESGO \d+\s*[–-]\s*/i, '• ')
                                .replace(/^Control:\s*/i, '→ ')
                                .trim();

                            return (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 12,
                                        marginBottom: 8,
                                        opacity: bulletOpacity,
                                        transform: `translateX(${bulletSlide}px)`,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: '50%',
                                            background: accent,
                                            marginTop: 10,
                                            flexShrink: 0,
                                        }}
                                    />
                                    <span
                                        style={{
                                            fontSize: 22,
                                            color: 'rgba(255,255,255,0.85)',
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        {cleanBullet}
                                    </span>
                                </div>
                            );
                        })
                    ) : (
                        // Single paragraph — short text
                        <Animated
                            animations={[
                                Fade({ to: 1, initial: 0, start: 20 }),
                                Move({ y: 0, initialY: 15, start: 20 }),
                            ]}
                        >
                            <p
                                style={{
                                    fontSize: 26,
                                    color: 'rgba(255,255,255,0.85)',
                                    lineHeight: 1.5,
                                    textShadow: '0 2px 20px rgba(0,0,0,0.4)',
                                }}
                            >
                                {paso.contenido}
                            </p>
                        </Animated>
                    )}
                </div>
            </div>

            {/* ===== EPP BAR — Bottom ===== */}
            {hasEPP && (
                <Animated
                    animations={[
                        Fade({ to: 1, initial: 0, start: 25 }),
                        Move({ y: 0, initialY: 20, start: 25 }),
                    ]}
                    style={{
                        position: 'absolute',
                        bottom: 20,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10,
                    }}
                >
                    <EPPBar epp={paso.epp!} />
                </Animated>
            )}

            {/* ===== PROGRESS BAR — absolute bottom ===== */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: 4,
                    background: 'rgba(255,255,255,0.08)',
                    zIndex: 20,
                }}
            >
                <div
                    style={{
                        width: `${progressWidth}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${accent}, ${accent}bb)`,
                        boxShadow: `0 0 15px ${accent}40`,
                    }}
                />
            </div>
        </AbsoluteFill>
    );
};
