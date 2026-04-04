import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
} from 'remotion';
import { ProcedureStep } from '../types';

interface QuizSlideProps {
    paso: ProcedureStep;
    stepIndex: number;
}

export const QuizSlide: React.FC<QuizSlideProps> = ({ paso, stepIndex }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    if (!paso.quiz) return null;

    const { pregunta, opciones, correcta } = paso.quiz;

    // Animaciones
    const questionProgress = spring({
        frame,
        fps,
        config: { damping: 100, stiffness: 200, mass: 0.5 },
    });

    // Cada opción entra con delay
    const optionProgresses = opciones.map((_, i) =>
        spring({
            frame: frame - 15 - i * 8,
            fps,
            config: { damping: 100, stiffness: 200, mass: 0.5 },
        })
    );

    // Revelar respuesta correcta después de 3 segundos
    const revealFrame = fps * 3;
    const revealProgress = spring({
        frame: frame - revealFrame,
        fps,
        config: { damping: 80, stiffness: 150, mass: 0.6 },
    });

    const isRevealed = frame > revealFrame;

    // Colores
    const stepColors = ['#e74c3c', '#f39c12', '#2ecc71', '#3498db', '#9b59b6'];
    const accentColor = stepColors[stepIndex % stepColors.length];

    return (
        <AbsoluteFill
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                padding: 100,
            }}
        >
            {/* Header "Quiz" */}
            <div
                style={{
                    position: 'absolute',
                    top: 50,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 12,
                    opacity: questionProgress,
                }}
            >
                <span style={{ fontSize: 36 }}>❓</span>
                <span
                    style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: accentColor,
                        textTransform: 'uppercase',
                        letterSpacing: 4,
                    }}
                >
                    Pregunta de verificación
                </span>
            </div>

            {/* Pregunta */}
            <h2
                style={{
                    fontSize: 44,
                    fontWeight: 700,
                    textAlign: 'center',
                    marginBottom: 60,
                    color: 'white',
                    opacity: questionProgress,
                    transform: `translateY(${interpolate(questionProgress, [0, 1], [40, 0])}px)`,
                    maxWidth: 1200,
                    lineHeight: 1.3,
                }}
            >
                {pregunta}
            </h2>

            {/* Opciones */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20,
                    width: '100%',
                    maxWidth: 900,
                }}
            >
                {opciones.map((opcion, i) => {
                    const isCorrect = i === correcta;
                    const optionProgress = optionProgresses[i];

                    // Colores según estado
                    let bgColor = 'rgba(255, 255, 255, 0.06)';
                    let borderColor = 'rgba(255, 255, 255, 0.12)';
                    let textColor = '#e0e0e0';

                    if (isRevealed && isCorrect) {
                        bgColor = 'rgba(46, 204, 113, 0.15)';
                        borderColor = '#2ecc71';
                        textColor = '#2ecc71';
                    } else if (isRevealed && !isCorrect) {
                        bgColor = 'rgba(231, 76, 60, 0.08)';
                        borderColor = 'rgba(231, 76, 60, 0.3)';
                        textColor = '#888';
                    }

                    const label = String.fromCharCode(65 + i); // A, B, C

                    return (
                        <div
                            key={i}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 24,
                                padding: '22px 32px',
                                borderRadius: 16,
                                background: bgColor,
                                border: `2px solid ${borderColor}`,
                                opacity: optionProgress,
                                transform: `translateX(${interpolate(optionProgress, [0, 1], [60, 0])}px) scale(${isRevealed && isCorrect ? interpolate(revealProgress, [0, 1], [1, 1.03]) : 1})`,
                                transition: 'background 0.4s, border-color 0.4s',
                            }}
                        >
                            {/* Letra de opción */}
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 24,
                                    background: isRevealed && isCorrect
                                        ? '#2ecc71'
                                        : 'rgba(255, 255, 255, 0.08)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 22,
                                        fontWeight: 700,
                                        color: isRevealed && isCorrect ? 'white' : '#aaa',
                                    }}
                                >
                                    {isRevealed && isCorrect ? '✓' : label}
                                </span>
                            </div>

                            {/* Texto de opción */}
                            <span
                                style={{
                                    fontSize: 28,
                                    fontWeight: isRevealed && isCorrect ? 600 : 400,
                                    color: textColor,
                                }}
                            >
                                {opcion}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Footer "Piensa tu respuesta" → "¡Correcto!" */}
            <p
                style={{
                    position: 'absolute',
                    bottom: 50,
                    fontSize: 22,
                    color: isRevealed ? '#2ecc71' : '#666',
                    fontWeight: isRevealed ? 600 : 400,
                    opacity: interpolate(
                        frame,
                        [fps * 1, fps * 1.5],
                        [0, 1],
                        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                    ),
                }}
            >
                {isRevealed
                    ? `✅ Respuesta correcta: ${opciones[correcta]}`
                    : '🤔 Piensa tu respuesta...'}
            </p>
        </AbsoluteFill>
    );
};
