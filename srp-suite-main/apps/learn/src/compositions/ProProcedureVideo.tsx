import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
} from 'remotion';
import {
    TransitionSeries,
    linearTiming,
    springTiming,
} from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { Procedure } from '../types';
import { IntroSlide } from './IntroSlide';
import { ContentSlide } from './ContentSlide';
import { OutroSlide } from './OutroSlide';
import { NoiseBackground } from '../components/NoiseBackground';
import { AnimatedCaptions } from '../components/AnimatedCaptions';

// ─── Constantes de duración (segundos) ───────────────────────
const INTRO_DURATION = 5;
const OUTRO_DURATION = 5;
const TRANSITION_FRAMES = 20; // frames de overlap entre escenas

// ─── Transición por posición ─────────────────────────────────
// Returns both timing and presentation for a given index
const getTransition = (index: number) => {
    const variant = index % 3;

    if (variant === 0) {
        return {
            timing: springTiming({
                config: { damping: 200, stiffness: 100, mass: 0.5 },
                durationInFrames: TRANSITION_FRAMES,
                durationRestThreshold: 0.001,
            }),
            presentation: fade(),
        };
    }
    if (variant === 1) {
        return {
            timing: linearTiming({ durationInFrames: TRANSITION_FRAMES }),
            presentation: slide({ direction: 'from-right' }),
        };
    }
    return {
        timing: linearTiming({ durationInFrames: TRANSITION_FRAMES }),
        presentation: wipe({ direction: 'from-left' }),
    };
};

// ─── Cálculo de frames totales ───────────────────────────────
export const calculateProTotalFrames = (procedure: Procedure, fps: number): number => {
    let total = INTRO_DURATION * fps;

    procedure.pasos.forEach((paso) => {
        total += paso.duracion * fps;
    });

    total += OUTRO_DURATION * fps;

    // TransitionSeries reduces total by the overlap of each transition
    // Transitions: 1 (intro→step1) + (steps-1) (step→step) + 1 (lastStep→outro)
    const numTransitions = procedure.pasos.length + 1;
    total -= numTransitions * TRANSITION_FRAMES;

    return Math.ceil(total);
};

// ─── Estilos ─────────────────────────────────────────────────
const styles = {
    logo: {
        position: 'absolute' as const,
        top: 40,
        left: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        zIndex: 100,
    },
    logoText: {
        fontSize: 28,
        fontWeight: 700,
        background: 'linear-gradient(135deg, #f39c12 0%, #e74c3c 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    progressBar: {
        position: 'absolute' as const,
        bottom: 0,
        left: 0,
        height: 4,
        background: 'linear-gradient(90deg, #f39c12, #e74c3c)',
        zIndex: 100,
    },
};

// ─── Componente Principal ────────────────────────────────────
interface ProProcedureVideoProps {
    procedure: Procedure;
}

export const ProProcedureVideo: React.FC<ProProcedureVideoProps> = ({ procedure }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    // ═══ Animated logo opacity ═══
    const logoOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
        extrapolateRight: 'clamp',
    });

    // ═══ Global progress bar ═══
    const progress = interpolate(frame, [0, durationInFrames], [0, 100], {
        extrapolateRight: 'clamp',
    });

    // ═══ Determine current caption text based on frame position ═══
    const introFrames = fps * INTRO_DURATION;
    let currentCaptionText = '';
    let frameAccum = introFrames;

    for (let i = 0; i < procedure.pasos.length; i++) {
        const stepFrames = procedure.pasos[i].duracion * fps;
        if (frame >= frameAccum - TRANSITION_FRAMES && frame < frameAccum + stepFrames) {
            currentCaptionText = procedure.pasos[i].contenido;
            break;
        }
        frameAccum += stepFrames;
    }

    // ═══ Build transition elements ═══
    // We need to render TransitionSeries.Transition with homogeneous types
    // so we pre-compute the transition configs
    const transitionConfigs = procedure.pasos.map((_, index) => getTransition(index));

    return (
        <AbsoluteFill style={{
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
            color: 'white',
        }}>
            {/* ═══ Animated Noise Background ═══ */}
            <NoiseBackground
                variant="dark"
                baseColor="#0a0a2e"
                accentColor="#00d4ff"
                speed={0.6}
                opacity={0.1}
            />

            {/* ═══ Persistent Logo ═══ */}
            <div style={{ ...styles.logo, opacity: logoOpacity }}>
                <svg width="40" height="40" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="#f39c12" />
                    <text
                        x="50"
                        y="65"
                        textAnchor="middle"
                        fontSize="50"
                        fontWeight="bold"
                        fill="white"
                    >
                        L
                    </text>
                </svg>
                <span style={styles.logoText}>SRP Learn</span>
            </div>

            {/* ═══ TransitionSeries — Scene Flow ═══ */}
            <TransitionSeries>
                {/* 1. Intro Slide */}
                <TransitionSeries.Sequence durationInFrames={introFrames}>
                    <IntroSlide
                        titulo={procedure.titulo}
                        subtitulo={procedure.subtitulo}
                        metadata={procedure.metadata}
                    />
                </TransitionSeries.Sequence>

                {/* 2. Content Steps — with transitions between them */}
                {procedure.pasos.map((paso, index) => {
                    const config = transitionConfigs[index];
                    // Render each transition type separately to satisfy TS types
                    const variant = index % 3;

                    return (
                        <React.Fragment key={`step-${index}`}>
                            {variant === 0 && (
                                <TransitionSeries.Transition
                                    timing={config.timing}
                                    presentation={fade()}
                                />
                            )}
                            {variant === 1 && (
                                <TransitionSeries.Transition
                                    timing={config.timing}
                                    presentation={slide({ direction: 'from-right' })}
                                />
                            )}
                            {variant === 2 && (
                                <TransitionSeries.Transition
                                    timing={config.timing}
                                    presentation={wipe({ direction: 'from-left' })}
                                />
                            )}

                            <TransitionSeries.Sequence
                                durationInFrames={paso.duracion * fps}
                            >
                                <ContentSlide
                                    paso={paso}
                                    totalPasos={procedure.pasos.length}
                                    stepIndex={index}
                                />
                            </TransitionSeries.Sequence>
                        </React.Fragment>
                    );
                })}

                {/* 3. Transition to Outro */}
                <TransitionSeries.Transition
                    timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
                    presentation={fade()}
                />

                {/* 4. Outro Slide */}
                <TransitionSeries.Sequence durationInFrames={fps * OUTRO_DURATION}>
                    <OutroSlide
                        titulo={procedure.titulo}
                        totalPasos={procedure.pasos.length}
                    />
                </TransitionSeries.Sequence>
            </TransitionSeries>

            {/* ═══ Animated Captions Overlay ═══ */}
            {currentCaptionText && (
                <AnimatedCaptions
                    text={currentCaptionText}
                    variant="default"
                    fontSize={32}
                    position="bottom"
                    wordsPerGroup={5}
                    startDelay={15}
                />
            )}

            {/* ═══ Global Progress Bar ═══ */}
            <div style={{
                ...styles.progressBar,
                width: `${progress}%`,
            }} />
        </AbsoluteFill>
    );
};
