import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
} from 'remotion';

interface TransitionSlideProps {
    fromStep: number;
    toStep: number;
    totalSteps: number;
    nextTitle: string;
}

export const TransitionSlide: React.FC<TransitionSlideProps> = ({
    fromStep,
    toStep,
    totalSteps,
    nextTitle,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Animación del número
    const numberProgress = spring({
        frame,
        fps,
        config: { damping: 80, stiffness: 200, mass: 0.4 },
    });

    const titleProgress = spring({
        frame: frame - 10,
        fps,
        config: { damping: 100, stiffness: 200, mass: 0.5 },
    });

    // Barra de progreso
    const progressWidth = (toStep / totalSteps) * 100;

    // Colores por paso
    const stepColors = ['#e74c3c', '#f39c12', '#2ecc71', '#3498db', '#9b59b6'];
    const color = stepColors[(toStep - 1) % stepColors.length];

    return (
        <AbsoluteFill
            style={{
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            {/* Fondo con gradient radial sutil */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(circle at center, ${color}10 0%, transparent 60%)`,
                }}
            />

            {/* "Siguiente paso" label */}
            <p
                style={{
                    fontSize: 20,
                    fontWeight: 500,
                    color: '#666',
                    letterSpacing: 3,
                    textTransform: 'uppercase',
                    marginBottom: 24,
                    opacity: numberProgress,
                }}
            >
                Siguiente paso
            </p>

            {/* Número grande */}
            <div
                style={{
                    fontSize: 160,
                    fontWeight: 900,
                    color: color,
                    lineHeight: 1,
                    marginBottom: 24,
                    transform: `scale(${numberProgress})`,
                    opacity: numberProgress,
                    textShadow: `0 0 80px ${color}40`,
                }}
            >
                {toStep}
            </div>

            {/* Título del siguiente paso */}
            <p
                style={{
                    fontSize: 32,
                    fontWeight: 600,
                    color: '#e0e0e0',
                    textAlign: 'center',
                    maxWidth: 800,
                    opacity: titleProgress,
                    transform: `translateY(${interpolate(titleProgress, [0, 1], [20, 0])}px)`,
                }}
            >
                {nextTitle}
            </p>

            {/* Barra de progreso */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 60,
                    left: '15%',
                    right: '15%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 12,
                }}
            >
                <div
                    style={{
                        width: '100%',
                        height: 6,
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.08)',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            width: `${interpolate(numberProgress, [0, 1], [((fromStep) / totalSteps) * 100, progressWidth])}%`,
                            height: '100%',
                            background: `linear-gradient(90deg, ${color} 0%, ${color}cc 100%)`,
                            borderRadius: 3,
                        }}
                    />
                </div>
                <span
                    style={{
                        fontSize: 16,
                        color: '#555',
                        opacity: titleProgress,
                    }}
                >
                    {toStep} de {totalSteps} pasos
                </span>
            </div>
        </AbsoluteFill>
    );
};
