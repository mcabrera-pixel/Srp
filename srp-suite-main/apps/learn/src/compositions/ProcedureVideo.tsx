import React from 'react';
import {
    AbsoluteFill,
    Sequence,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
} from 'remotion';
import { Procedure } from '../types';
import { IntroSlide } from './IntroSlide';
import { ContentSlide } from './ContentSlide';
import { TransitionSlide } from './TransitionSlide';
import { OutroSlide } from './OutroSlide';

// Constantes de duración (en segundos)
const INTRO_DURATION = 5;
const OUTRO_DURATION = 5;
const TRANSITION_DURATION = 1.5;

// Calcula la duración total en frames para un procedimiento
export const calculateTotalFrames = (procedure: Procedure, fps: number): number => {
    let total = INTRO_DURATION * fps; // Intro

    procedure.pasos.forEach((paso, index) => {
        total += paso.duracion * fps; // Contenido del paso

        // Transición entre pasos (no después del último)
        if (index < procedure.pasos.length - 1) {
            total += TRANSITION_DURATION * fps;
        }
    });

    total += OUTRO_DURATION * fps; // Outro

    return Math.ceil(total);
};

// Estilos CSS-in-JS para el video
const styles = {
    container: {
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
        fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
        color: 'white',
    },
    logo: {
        position: 'absolute' as const,
        top: 40,
        left: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        zIndex: 10,
    },
    logoText: {
        fontSize: 28,
        fontWeight: 700,
        background: 'linear-gradient(135deg, #f39c12 0%, #e74c3c 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
};

interface ProcedureVideoProps {
    procedure: Procedure;
}

export const ProcedureVideo: React.FC<ProcedureVideoProps> = ({ procedure }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Duración de secciones en frames
    const introFrames = fps * INTRO_DURATION;
    const outroFrames = fps * OUTRO_DURATION;
    const transitionFrames = fps * TRANSITION_DURATION;

    // Construir la timeline de secuencias
    const sequences: Array<{
        type: 'intro' | 'content' | 'transition' | 'outro';
        from: number;
        duration: number;
        stepIndex?: number;
    }> = [];

    let currentFrame = 0;

    // Intro
    sequences.push({ type: 'intro', from: currentFrame, duration: introFrames });
    currentFrame += introFrames;

    // Pasos del procedimiento
    procedure.pasos.forEach((paso, index) => {
        // Contenido del paso
        sequences.push({
            type: 'content',
            from: currentFrame,
            duration: paso.duracion * fps,
            stepIndex: index,
        });
        currentFrame += paso.duracion * fps;

        // Transición (excepto después del último paso)
        if (index < procedure.pasos.length - 1) {
            sequences.push({
                type: 'transition',
                from: currentFrame,
                duration: transitionFrames,
                stepIndex: index,
            });
            currentFrame += transitionFrames;
        }
    });

    // Outro
    sequences.push({ type: 'outro', from: currentFrame, duration: outroFrames });

    // Opacidad del logo
    const logoOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
        extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill style={styles.container}>
            {/* Logo persistente */}
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

            {/* Renderizar secuencias */}
            {sequences.map((seq, i) => {
                switch (seq.type) {
                    case 'intro':
                        return (
                            <Sequence key={`intro-${i}`} from={seq.from} durationInFrames={seq.duration}>
                                <IntroSlide
                                    titulo={procedure.titulo}
                                    subtitulo={procedure.subtitulo}
                                    metadata={procedure.metadata}
                                />
                            </Sequence>
                        );

                    case 'content':
                        return (
                            <Sequence key={`content-${i}`} from={seq.from} durationInFrames={seq.duration}>
                                <ContentSlide
                                    paso={procedure.pasos[seq.stepIndex!]}
                                    totalPasos={procedure.pasos.length}
                                    stepIndex={seq.stepIndex!}
                                />
                            </Sequence>
                        );



                    case 'transition': {
                        const nextPaso = procedure.pasos[seq.stepIndex! + 1];
                        return (
                            <Sequence key={`transition-${i}`} from={seq.from} durationInFrames={seq.duration}>
                                <TransitionSlide
                                    fromStep={seq.stepIndex! + 1}
                                    toStep={seq.stepIndex! + 2}
                                    totalSteps={procedure.pasos.length}
                                    nextTitle={nextPaso.titulo}
                                />
                            </Sequence>
                        );
                    }

                    case 'outro':
                        return (
                            <Sequence key={`outro-${i}`} from={seq.from} durationInFrames={seq.duration}>
                                <OutroSlide
                                    titulo={procedure.titulo}
                                    totalPasos={procedure.pasos.length}
                                />
                            </Sequence>
                        );

                    default:
                        return null;
                }
            })}
        </AbsoluteFill>
    );
};
