import React from 'react';
import {
    Sequence,
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
} from 'remotion';
import { Procedure } from '../../types';
import { WhiteboardStepSlide } from './WhiteboardStepSlide';
import { WhiteboardIntro } from './WhiteboardIntro';
import { WhiteboardOutro } from './WhiteboardOutro';

interface WhiteboardProcedureVideoProps extends Record<string, unknown> {
    procedure: Procedure;
}

// Durations in seconds
const INTRO_DURATION = 7;
const OUTRO_DURATION = 8;
const TRANSITION_DURATION = 1.5;

/**
 * WhiteboardProcedureVideo — chalk-on-whiteboard style video composition.
 * Uses WhiteboardStepSlide with per-step SVG scene animations
 * themed as hand-drawn chalk diagrams on a warm cream board.
 */
export const WhiteboardProcedureVideo: React.FC<WhiteboardProcedureVideoProps> = ({
    procedure,
}) => {
    const { fps } = useVideoConfig();

    const introFrames = Math.round(fps * INTRO_DURATION);
    const outroFrames = Math.round(fps * OUTRO_DURATION);
    const transitionFrames = Math.round(fps * TRANSITION_DURATION);

    // Build the timeline
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

    // Content steps + transitions
    procedure.pasos.forEach((paso, index) => {
        const stepFrames = paso.duracion * fps;

        sequences.push({
            type: 'content',
            from: currentFrame,
            duration: stepFrames,
            stepIndex: index,
        });
        currentFrame += stepFrames;

        // Transition between steps (marker swipe)
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

    return (
        <AbsoluteFill style={{ backgroundColor: '#f5f0e8' }}>
            {sequences.map((seq, i) => (
                <Sequence
                    key={i}
                    from={seq.from}
                    durationInFrames={seq.duration}
                    name={
                        seq.type === 'content'
                            ? `Paso ${procedure.pasos[seq.stepIndex!].numero}: ${procedure.pasos[seq.stepIndex!].titulo}`
                            : seq.type === 'transition'
                                ? `Transición`
                                : seq.type
                    }
                >
                    {seq.type === 'intro' && (
                        <WhiteboardIntro
                            titulo={procedure.titulo}
                            subtitulo={procedure.subtitulo}
                            metadata={procedure.metadata}
                        />
                    )}

                    {seq.type === 'content' && (
                        <WhiteboardStepSlide
                            paso={procedure.pasos[seq.stepIndex!]}
                            totalPasos={procedure.pasos.length}
                            stepIndex={seq.stepIndex!}
                        />
                    )}

                    {seq.type === 'transition' && (
                        <WhiteboardTransition />
                    )}

                    {seq.type === 'outro' && (
                        <WhiteboardOutro
                            titulo={procedure.titulo}
                            totalPasos={procedure.pasos.length}
                        />
                    )}
                </Sequence>
            ))}
        </AbsoluteFill>
    );
};

/**
 * Simple eraser-wipe transition between steps.
 */
const WhiteboardTransition: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    const wipeProgress = interpolate(frame, [0, durationInFrames], [0, 1], {
        extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill style={{ backgroundColor: '#f5f0e8' }}>
            {/* Eraser block sweeping across */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: `${wipeProgress * 100 - 8}%`,
                    width: '15%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(210,200,185,0.6) 30%, rgba(210,200,185,0.8) 50%, rgba(210,200,185,0.6) 70%, transparent)',
                }}
            />
            {/* Chalk dust particles */}
            {Array.from({ length: 8 }).map((_, i) => {
                const px = wipeProgress * 1920 + (i % 3 - 1) * 30;
                const py = 200 + i * 100 + Math.sin(frame * 0.2 + i) * 30;
                const size = 3 + (i % 3) * 2;
                const opacity = Math.max(0, 0.6 - Math.abs(wipeProgress - 0.5));
                return (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            left: px,
                            top: py,
                            width: size,
                            height: size,
                            borderRadius: '50%',
                            backgroundColor: '#d4c9b8',
                            opacity,
                        }}
                    />
                );
            })}
        </AbsoluteFill>
    );
};

/**
 * Calculate total frames for the whiteboard composition.
 */
export const calculateWhiteboardTotalFrames = (
    procedure: Procedure,
    fps: number
): number => {
    const introFrames = Math.round(fps * INTRO_DURATION);
    const outroFrames = Math.round(fps * OUTRO_DURATION);
    const transitionFrames = Math.round(fps * TRANSITION_DURATION);

    let total = introFrames + outroFrames;

    procedure.pasos.forEach((paso, index) => {
        total += paso.duracion * fps;
        if (index < procedure.pasos.length - 1) total += transitionFrames;
    });

    return total;
};
