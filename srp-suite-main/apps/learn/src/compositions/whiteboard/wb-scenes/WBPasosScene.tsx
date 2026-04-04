import React from 'react';
import { interpolate } from 'remotion';

interface SceneProps {
    frame: number;
    fps: number;
    durationInFrames: number;
}

/**
 * WBPasosScene — The 6 sub-steps animated along a visual timeline.
 * Each step draws in with its icon and description.
 */
export const WBPasosScene: React.FC<SceneProps> = ({ frame }) => {
    const steps = [
        { num: 1, icon: '🚧', label: 'RETIRAR\nGRATING', color: '#c44a2a', drawFrame: 10 },
        { num: 2, icon: '🚛', label: 'TRANSPORTAR\nAL TALLER', color: '#8b7355', drawFrame: 80 },
        { num: 3, icon: '📏', label: 'MEDIR\nY CORTAR', color: '#d4883a', drawFrame: 160 },
        { num: 4, icon: '⚡', label: 'SOLDAR\nESCOTILLA', color: '#c44a2a', drawFrame: 300 },
        { num: 5, icon: '🧹', label: 'LIMPIAR\nY PINTAR', color: '#2c6b3f', drawFrame: 450 },
        { num: 6, icon: '🔧', label: 'INSTALAR\nEN SITIO', color: '#2c6b3f', drawFrame: 580 },
    ];

    // Timeline bar draws across
    const timelineProgress = interpolate(frame, [5, 700], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const timelineY = 200;
    const startX = 80;
    const endX = 880;
    const totalWidth = endX - startX;

    return (
        <svg viewBox="0 0 960 440" width="100%" height="100%">
            <defs>
                <filter id="chalkP">
                    <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
                </filter>
            </defs>

            {/* Title */}
            <text x={480} y={40} textAnchor="middle" fill="#2c1810" fontSize={18} fontWeight={700}
                fontFamily="Georgia, serif" letterSpacing={3}
                opacity={interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
                PASOS DE LA TAREA
            </text>

            {/* Timeline bar */}
            <line
                x1={startX}
                y1={timelineY}
                x2={startX + totalWidth * timelineProgress}
                y2={timelineY}
                stroke="#c4a882"
                strokeWidth={3}
                strokeLinecap="round"
                filter="url(#chalkP)"
            />

            {/* Steps along timeline */}
            {steps.map((step, i) => {
                const stepX = startX + (i / (steps.length - 1)) * totalWidth;
                const stepProgress = interpolate(frame, [step.drawFrame, step.drawFrame + 30], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                });

                // Alternate above/below timeline
                const isAbove = i % 2 === 0;
                const contentY = isAbove ? timelineY - 40 : timelineY + 40;
                const labelY = isAbove ? timelineY - 70 : timelineY + 95;

                return (
                    <g key={i} opacity={stepProgress}>
                        {/* Timeline node */}
                        <circle
                            cx={stepX}
                            cy={timelineY}
                            r={12}
                            fill={step.color}
                            opacity={stepProgress * 0.8}
                        />
                        <text
                            x={stepX}
                            y={timelineY + 5}
                            textAnchor="middle"
                            fill="white"
                            fontSize={11}
                            fontWeight={700}
                        >
                            {step.num}
                        </text>

                        {/* Connection line */}
                        <line
                            x1={stepX}
                            y1={timelineY + (isAbove ? -12 : 12)}
                            x2={stepX}
                            y2={contentY}
                            stroke={step.color}
                            strokeWidth={1.5}
                            strokeDasharray="4 3"
                            opacity={stepProgress * 0.6}
                        />

                        {/* Icon */}
                        <text
                            x={stepX}
                            y={contentY + (isAbove ? -5 : 10)}
                            textAnchor="middle"
                            fontSize={28}
                            opacity={stepProgress}
                        >
                            {step.icon}
                        </text>

                        {/* Label */}
                        {step.label.split('\n').map((line, j) => (
                            <text
                                key={j}
                                x={stepX}
                                y={labelY + j * 16 + (isAbove ? 0 : 10)}
                                textAnchor="middle"
                                fill="#4a3828"
                                fontSize={10}
                                fontWeight={600}
                                fontFamily="Georgia, serif"
                                letterSpacing={1}
                                opacity={stepProgress}
                            >
                                {line}
                            </text>
                        ))}
                    </g>
                );
            })}

            {/* Sub-step detail boxes */}
            {/* Step 3 detail: ruler + sparks */}
            <g opacity={interpolate(frame, [200, 230], [0, 0.7], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
                <text x={startX + (2 / (steps.length - 1)) * totalWidth} y={380} textAnchor="middle" fill="#d4883a" fontSize={11} fontFamily="Georgia, serif">
                    Esmeril angular · disco de corte fino
                </text>
            </g>

            {/* Step 4 detail: welding */}
            <g opacity={interpolate(frame, [360, 390], [0, 0.7], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
                <text x={480} y={380} textAnchor="middle" fill="#c44a2a" fontSize={11} fontFamily="Georgia, serif">
                    150 Amperes · Varilla E6011/E7018
                </text>
            </g>

            {/* Animated sparks on welding step */}
            {frame > 320 && frame < 450 && (
                <g>
                    {Array.from({ length: 5 }).map((_, i) => {
                        const sparkX = startX + (3 / 5) * totalWidth + (i % 3 - 1) * 6;
                        const sparkAge = ((frame - 320) * 2 + i * 20) % 30;
                        return (
                            <circle
                                key={i}
                                cx={sparkX}
                                cy={timelineY - 55 - sparkAge}
                                r={1.5}
                                fill="#d4883a"
                                opacity={Math.max(0, 0.8 - sparkAge / 30)}
                            />
                        );
                    })}
                </g>
            )}

            {/* Progress arrow */}
            <g opacity={interpolate(frame, [0, 20], [0, 0.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
                <polygon
                    points={`${startX + totalWidth * timelineProgress + 5},${timelineY} ${startX + totalWidth * timelineProgress + 15},${timelineY - 6} ${startX + totalWidth * timelineProgress + 15},${timelineY + 6}`}
                    fill="#d4883a"
                    opacity={timelineProgress < 0.98 ? 0.7 : 0}
                />
            </g>
        </svg>
    );
};
