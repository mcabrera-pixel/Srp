import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { Animated, Fade, Move } from 'remotion-animated';
import { ProcedureStep } from '../../types';

// Scene imports
import { IntroScene } from './scenes/IntroScene';
import { EPPScene } from './scenes/EPPScene';
import { ChecklistScene } from './scenes/ChecklistScene';
import { MedicionScene } from './scenes/MedicionScene';
import { CorteScene } from './scenes/CorteScene';
import { DesbasteScene } from './scenes/DesbasteScene';
import { SoldaduraScene } from './scenes/SoldaduraScene';
import { BisagrasScene } from './scenes/BisagrasScene';
import { PinturaScene } from './scenes/PinturaScene';
import { RiesgosScene } from './scenes/RiesgosScene';
import { EmergenciaScene } from './scenes/EmergenciaScene';
import { LimpiezaScene } from './scenes/LimpiezaScene';
import { CierreScene } from './scenes/CierreScene';

interface AnimatedStepSlideProps {
    paso: ProcedureStep;
    totalPasos: number;
    stepIndex: number;
}

const RISK_COLORS: Record<string, string> = {
    bajo: '#2ecc71',
    medio: '#f39c12',
    alto: '#e74c3c',
    critico: '#ff0040',
};

const RISK_LABELS: Record<string, string> = {
    bajo: 'BAJO',
    medio: 'MEDIO',
    alto: 'ALTO',
    critico: 'CRÍTICO',
};

// Maps step number to its SVG scene
const SCENE_MAP: Record<number, React.FC<{ frame: number; fps: number; durationInFrames: number }>> = {
    1: IntroScene,
    2: EPPScene,
    3: ChecklistScene,
    4: MedicionScene,
    5: CorteScene,
    6: DesbasteScene,
    7: SoldaduraScene,
    8: BisagrasScene,
    9: PinturaScene,
    10: RiesgosScene,
    11: EmergenciaScene,
    12: LimpiezaScene,
    13: CierreScene,
};

export const AnimatedStepSlide: React.FC<AnimatedStepSlideProps> = ({
    paso,
    totalPasos,
    stepIndex,
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    const riskColor = paso.riesgo ? RISK_COLORS[paso.riesgo] || '#666' : '#666';

    // Get the scene component for this step
    const SceneComponent = SCENE_MAP[paso.numero];

    // Text fade in
    const textOpacity = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    // Progress bar
    const progress = (stepIndex + 1) / totalPasos;
    const progressWidth = interpolate(frame, [0, 20], [0, progress * 100], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill style={{ backgroundColor: '#0a0a2e' }}>
            {/* Blueprint grid background */}
            <svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.08 }}>
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00d4ff" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Animated SVG Scene — takes up center of screen */}
            <div style={{
                position: 'absolute',
                top: 80,
                left: 60,
                right: 60,
                bottom: 200,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                {SceneComponent && (
                    <SceneComponent frame={frame} fps={fps} durationInFrames={durationInFrames} />
                )}
            </div>

            {/* Top bar: Logo + step counter + risk badge */}
            <div style={{
                position: 'absolute',
                top: 20,
                left: 40,
                right: 40,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: textOpacity,
            }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#00d4ff', letterSpacing: 3 }}>
                    SRP LEARN
                </span>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <span style={{ fontSize: 16, color: '#8888aa' }}>
                        PASO {paso.numero} / {totalPasos}
                    </span>
                    {paso.riesgo && (
                        <div style={{
                            padding: '4px 14px',
                            borderRadius: 20,
                            border: `2px solid ${riskColor}`,
                            backgroundColor: `${riskColor}22`,
                            fontSize: 13,
                            fontWeight: 800,
                            color: riskColor,
                            letterSpacing: 2,
                        }}>
                            RIESGO {RISK_LABELS[paso.riesgo]}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom panel: Title + description */}
            <div style={{
                position: 'absolute',
                bottom: 60,
                left: 40,
                right: 40,
            }}>
                {/* Title */}
                <Animated
                    animations={[
                        Fade({ to: 1, initial: 0, start: 5 }),
                        Move({ y: 0, initialY: 20, start: 5 }),
                    ]}
                >
                    <h2 style={{
                        fontSize: 42,
                        fontWeight: 800,
                        color: 'white',
                        marginBottom: 8,
                        textShadow: '0 0 30px rgba(0,212,255,0.3)',
                    }}>
                        {paso.titulo}
                    </h2>
                </Animated>

                {/* Description with staggered bullets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    {paso.contenido.split('\n').map((line, i) => {
                        const lineOpacity = interpolate(
                            frame,
                            [20 + i * 12, 30 + i * 12],
                            [0, 1],
                            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                        );
                        return (
                            <p key={i} style={{
                                fontSize: 22,
                                color: '#c0c8e0',
                                opacity: lineOpacity,
                                transform: `translateX(${interpolate(lineOpacity, [0, 1], [20, 0])}px)`,
                                margin: 0,
                                lineHeight: 1.5,
                            }}>
                                {paso.contenido.includes('\n') ? `▸ ${line}` : line}
                            </p>
                        );
                    })}
                </div>

                {/* Progress bar */}
                <div style={{
                    marginTop: 16,
                    height: 3,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderRadius: 2,
                    overflow: 'hidden',
                }}>
                    <div style={{
                        width: `${progressWidth}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, #00d4ff, ${riskColor})`,
                        borderRadius: 2,
                    }} />
                </div>
            </div>
        </AbsoluteFill>
    );
};
