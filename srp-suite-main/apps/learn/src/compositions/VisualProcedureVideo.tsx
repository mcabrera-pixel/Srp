import React from 'react';
import {
    Sequence,
    useVideoConfig,
    AbsoluteFill,
} from 'remotion';
import { Procedure } from '../types';
import { AnimatedStepSlide } from './animated/AnimatedStepSlide';
import { IntroSlide } from './IntroSlide';
import { TransitionSlide } from './TransitionSlide';
import { OutroSlide } from './OutroSlide';


interface VisualProcedureVideoProps {
    procedure: Procedure;
}

// Durations in seconds
const INTRO_DURATION = 6;
const OUTRO_DURATION = 8;
const TRANSITION_DURATION = 2;

/**
 * VisualProcedureVideo — animated SVG diagram video composition.
 * Uses AnimatedStepSlide with per-step SVG scene animations.
 */
export const VisualProcedureVideo: React.FC<VisualProcedureVideoProps> = ({
    procedure,
}) => {
    const { fps } = useVideoConfig();

    const introFrames = fps * INTRO_DURATION;
    const outroFrames = fps * OUTRO_DURATION;
    const transitionFrames = fps * TRANSITION_DURATION;

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

        // Transition between steps
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
        <AbsoluteFill style={{ backgroundColor: '#0a0a1a' }}>
            {sequences.map((seq, i) => (
                <Sequence
                    key={i}
                    from={seq.from}
                    durationInFrames={seq.duration}
                    name={
                        seq.type === 'content'
                            ? `Paso ${procedure.pasos[seq.stepIndex!].numero}`
                            : seq.type
                    }
                >
                    {seq.type === 'intro' && (
                        <IntroSlide
                            titulo={procedure.titulo}
                            subtitulo={procedure.subtitulo}
                            metadata={procedure.metadata}
                        />
                    )}
                    {seq.type === 'content' && (
                        <AnimatedStepSlide
                            paso={procedure.pasos[seq.stepIndex!]}
                            totalPasos={procedure.pasos.length}
                            stepIndex={seq.stepIndex!}
                        />
                    )}
                    {seq.type === 'transition' && (
                        <TransitionSlide
                            fromStep={seq.stepIndex! + 1}
                            toStep={seq.stepIndex! + 2}
                            totalSteps={procedure.pasos.length}
                            nextTitle={procedure.pasos[seq.stepIndex! + 1].titulo}
                        />
                    )}

                    {seq.type === 'outro' && (
                        <OutroSlide
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
 * Calculate total frames including quizzes.
 */
export const calculateVisualTotalFrames = (
    procedure: Procedure,
    fps: number
): number => {
    const introFrames = fps * INTRO_DURATION;
    const outroFrames = fps * OUTRO_DURATION;
    const transitionFrames = fps * TRANSITION_DURATION;

    let total = introFrames + outroFrames;

    procedure.pasos.forEach((paso, index) => {
        total += paso.duracion * fps;
        if (index < procedure.pasos.length - 1) total += transitionFrames;
    });

    return total;
};
