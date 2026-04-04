import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
} from 'remotion';
import { Animated, Fade, Move } from 'remotion-animated';
import { ProcedureStep } from '../../types';

// Scene imports
import { WBIntroScene } from './wb-scenes/WBIntroScene';
import { WBEPPScene } from './wb-scenes/WBEPPScene';
import { WBVerificacionesScene } from './wb-scenes/WBVerificacionesScene';
import { WBPasosScene } from './wb-scenes/WBPasosScene';
import { WBRiesgosScene } from './wb-scenes/WBRiesgosScene';
import { WBEmergenciaScene } from './wb-scenes/WBEmergenciaScene';
import { WBCierreScene } from './wb-scenes/WBCierreScene';

interface WhiteboardStepSlideProps {
    paso: ProcedureStep;
    totalPasos: number;
    stepIndex: number;
}

const RISK_COLORS: Record<string, string> = {
    bajo: '#2c6b3f',
    medio: '#c4882a',
    alto: '#c44a2a',
    critico: '#a81030',
};

const RISK_LABELS: Record<string, string> = {
    bajo: 'BAJO',
    medio: 'MEDIO',
    alto: 'ALTO',
    critico: 'CRÍTICO',
};

const EPP_ICONS: Record<string, string> = {
    casco: '⛑',
    guantes: '🧤',
    lentes: '🥽',
    arnes: '🪢',
    zapatos: '👢',
    chaleco: '🦺',
    respirador: '😷',
    protector_auditivo: '🎧',
};

// Map step numbers (from escotilla-grating.ts) to whiteboard scenes
const SCENE_MAP: Record<number, React.FC<{ frame: number; fps: number; durationInFrames: number }>> = {
    1: WBIntroScene,
    2: WBEPPScene,
    3: WBVerificacionesScene,
    4: WBPasosScene,
    5: WBRiesgosScene,
    6: WBEmergenciaScene,
    7: WBCierreScene,
};

export const WhiteboardStepSlide: React.FC<WhiteboardStepSlideProps> = ({
    paso,
    totalPasos,
    stepIndex,
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    const riskColor = paso.riesgo ? RISK_COLORS[paso.riesgo] || '#6b5840' : '#6b5840';

    // Get the scene component for this step
    const SceneComponent = SCENE_MAP[paso.numero];

    // Tag & text fade in
    const headerOpacity = interpolate(frame, [10, 25], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Progress
    const progress = (stepIndex + 1) / totalPasos;
    const progressWidth = interpolate(frame, [0, 20], [0, progress * 100], {
        extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill style={{ backgroundColor: '#f5f0e8' }}>
            {/* Paper texture grid */}
            <svg
                width="100%"
                height="100%"
                style={{ position: 'absolute', opacity: 0.05 }}
            >
                <defs>
                    <pattern id={`wbGridS${stepIndex}`} width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#8b7355" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#wbGridS${stepIndex})`} />
            </svg>

            {/* Board frame */}
            <div
                style={{
                    position: 'absolute',
                    inset: 16,
                    border: '3px solid #c4a882',
                    borderRadius: 6,
                    pointerEvents: 'none',
                }}
            />

            {/* Top bar: SRP LEARN + step counter + risk + EPP */}
            <div
                style={{
                    position: 'absolute',
                    top: 28,
                    left: 50,
                    right: 50,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    opacity: headerOpacity,
                }}
            >
                {/* Left: branding */}
                <span
                    style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: '#a08060',
                        letterSpacing: 3,
                        fontFamily: 'Georgia, serif',
                    }}
                >
                    SRP LEARN
                </span>

                {/* Center: step counter */}
                <span
                    style={{
                        fontSize: 16,
                        color: '#8b7355',
                        fontFamily: 'Georgia, serif',
                        letterSpacing: 2,
                    }}
                >
                    PASO {paso.numero} DE {totalPasos}
                </span>

                {/* Right: risk + EPP */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {/* EPP icons */}
                    {paso.epp && paso.epp.slice(0, 5).map((epp, i) => (
                        <span
                            key={i}
                            style={{
                                fontSize: 18,
                                opacity: interpolate(frame, [15 + i * 5, 20 + i * 5], [0, 1], {
                                    extrapolateLeft: 'clamp',
                                    extrapolateRight: 'clamp',
                                }),
                            }}
                            title={epp}
                        >
                            {EPP_ICONS[epp] || '🔧'}
                        </span>
                    ))}

                    {/* Risk badge */}
                    {paso.riesgo && (
                        <div
                            style={{
                                padding: '3px 12px',
                                borderRadius: 14,
                                border: `2px solid ${riskColor}`,
                                backgroundColor: `${riskColor}15`,
                                fontSize: 11,
                                fontWeight: 800,
                                color: riskColor,
                                letterSpacing: 2,
                                fontFamily: 'Georgia, serif',
                            }}
                        >
                            {RISK_LABELS[paso.riesgo]}
                        </div>
                    )}
                </div>
            </div>

            {/* Animated SVG Scene — center of screen */}
            <div
                style={{
                    position: 'absolute',
                    top: 75,
                    left: 50,
                    right: 50,
                    bottom: 210,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {SceneComponent && (
                    <SceneComponent frame={frame} fps={fps} durationInFrames={durationInFrames} />
                )}
            </div>

            {/* Bottom panel: Title + description */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 55,
                    left: 50,
                    right: 50,
                }}
            >
                {/* Title */}
                <Animated
                    animations={[
                        Fade({ to: 1, initial: 0, start: 5 }),
                        Move({ y: 0, initialY: 15, start: 5 }),
                    ]}
                >
                    <h2
                        style={{
                            fontSize: 38,
                            fontWeight: 800,
                            color: '#2c1810',
                            marginBottom: 6,
                            fontFamily: 'Georgia, serif',
                            letterSpacing: 1,
                        }}
                    >
                        {paso.titulo}
                    </h2>
                </Animated>

                {/* Chalk underline */}
                <div
                    style={{
                        width: interpolate(frame, [8, 25], [0, 200], {
                            extrapolateLeft: 'clamp',
                            extrapolateRight: 'clamp',
                        }),
                        height: 2,
                        backgroundColor: '#d4883a',
                        marginBottom: 10,
                        borderRadius: 1,
                        opacity: 0.6,
                    }}
                />

                {/* Description bullets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {paso.contenido.split('\n').map((line, i) => {
                        const lineOpacity = interpolate(
                            frame,
                            [18 + i * 10, 28 + i * 10],
                            [0, 1],
                            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                        );
                        return (
                            <p
                                key={i}
                                style={{
                                    fontSize: 19,
                                    color: '#4a3828',
                                    opacity: lineOpacity,
                                    transform: `translateX(${interpolate(lineOpacity, [0, 1], [15, 0])}px)`,
                                    margin: 0,
                                    lineHeight: 1.5,
                                    fontFamily: 'Georgia, serif',
                                }}
                            >
                                {paso.contenido.includes('\n') ? `✏️ ${line}` : line}
                            </p>
                        );
                    })}
                </div>

                {/* Progress bar — hand-drawn style */}
                <div
                    style={{
                        marginTop: 14,
                        height: 4,
                        backgroundColor: 'rgba(139,115,85,0.15)',
                        borderRadius: 2,
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            width: `${progressWidth}%`,
                            height: '100%',
                            background: `linear-gradient(90deg, #d4883a, ${riskColor})`,
                            borderRadius: 2,
                        }}
                    />
                </div>
            </div>
        </AbsoluteFill>
    );
};
