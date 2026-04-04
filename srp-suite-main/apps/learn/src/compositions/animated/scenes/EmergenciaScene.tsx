import React from 'react';
import { interpolate, spring } from 'remotion';

interface SceneProps {
    frame: number;
    fps: number;
    durationInFrames: number;
}

const STEPS = [
    { icon: '📢', label: 'Comunicar al\nsupervisor', color: '#e74c3c' },
    { icon: '🚨', label: 'Activar alarma\nde zona', color: '#ff6b35' },
    { icon: '🧯', label: 'Usar extintor\ntipo ABC', color: '#f39c12' },
    { icon: '🩹', label: 'Primeros\nauxilios', color: '#3498db' },
    { icon: '🏃', label: 'Evacuar a punto\nde reunión', color: '#2ecc71' },
];

export const EmergenciaScene: React.FC<SceneProps> = ({ frame, fps }) => {
    return (
        <svg viewBox="0 0 960 560" width="100%" height="100%">
            <defs>
                <filter id="emergGlow">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Emergency header — pulsing */}
            <g opacity={interpolate(Math.sin(frame * 0.08), [-1, 1], [0.6, 1])}>
                <text x={480} y={40} textAnchor="middle" fill="#ff4757" fontSize={20} fontWeight={800} letterSpacing={3}>
                    🚨 PLAN DE EMERGENCIA 🚨
                </text>
            </g>

            {/* Flowchart: horizontal steps connected by arrows */}
            {STEPS.map((step, i) => {
                const delay = i * 20 + 10;
                const nodeScale = spring({ frame: frame - delay, fps, config: { damping: 12, mass: 0.6 } });
                const arrowOpacity = interpolate(frame, [delay + 15, delay + 25], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                });
                const x = 90 + i * 180;
                const y = 200;

                return (
                    <g key={i}>
                        {/* Node */}
                        <g transform={`translate(${x}, ${y}) scale(${nodeScale})`} opacity={nodeScale}>
                            {/* Circle background */}
                            <circle cx={0} cy={0} r={55} fill={`${step.color}18`} stroke={step.color} strokeWidth={2.5} />
                            {/* Step number */}
                            <circle cx={-38} cy={-38} r={14} fill={step.color} />
                            <text x={-38} y={-33} textAnchor="middle" fill="white" fontSize={13} fontWeight={800}>{i + 1}</text>
                            {/* Icon */}
                            <text x={0} y={-5} textAnchor="middle" fontSize={30}>{step.icon}</text>
                            {/* Label below */}
                            {step.label.split('\n').map((line, li) => (
                                <text
                                    key={li}
                                    x={0}
                                    y={80 + li * 18}
                                    textAnchor="middle"
                                    fill="#c0c8e0"
                                    fontSize={13}
                                    fontWeight={600}
                                >
                                    {line}
                                </text>
                            ))}
                        </g>

                        {/* Arrow to next */}
                        {i < STEPS.length - 1 && (
                            <g opacity={arrowOpacity}>
                                <line
                                    x1={x + 58}
                                    y1={y}
                                    x2={x + 118}
                                    y2={y}
                                    stroke={step.color}
                                    strokeWidth={2}
                                    strokeDasharray="6 3"
                                />
                                <polygon
                                    points={`${x + 118},${y - 5} ${x + 126},${y} ${x + 118},${y + 5}`}
                                    fill={step.color}
                                />
                            </g>
                        )}
                    </g>
                );
            })}

            {/* Emergency number */}
            <g opacity={interpolate(frame, [120, 140], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
                <rect x={330} y={370} width={300} height={60} rx={30} fill="#e74c3c22" stroke="#e74c3c" strokeWidth={2} />
                <text x={480} y={406} textAnchor="middle" fill="#e74c3c" fontSize={18} fontWeight={800} letterSpacing={2}>
                    📞 EMERGENCIA: 132
                </text>
            </g>
        </svg>
    );
};
