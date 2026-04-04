import React from 'react';
import { interpolate, spring } from 'remotion';

interface SceneProps {
    frame: number;
    fps: number;
    durationInFrames: number;
}

export const CierreScene: React.FC<SceneProps> = ({ frame, fps }) => {
    // Helmet appears
    const helmetScale = spring({ frame: frame - 10, fps, config: { damping: 12 } });

    // Checkmark draws
    const checkProgress = interpolate(frame, [40, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    // Message reveals
    const msgOpacity = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    // Glow pulse
    const glowPulse = interpolate(Math.sin(frame * 0.06), [-1, 1], [0.5, 1]);

    return (
        <svg viewBox="0 0 960 560" width="100%" height="100%">
            <defs>
                <filter id="cierreGlow">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <linearGradient id="checkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2ecc71" />
                    <stop offset="100%" stopColor="#00d4ff" />
                </linearGradient>
            </defs>

            {/* Large safety helmet */}
            <g transform={`translate(480, 180) scale(${helmetScale})`} opacity={helmetScale}>
                {/* Helmet shape */}
                <ellipse cx={0} cy={0} rx={80} ry={60} fill="#f1c40f" stroke="#e2b800" strokeWidth={3} />
                <rect x={-80} y={0} width={160} height={15} fill="#e2b800" rx={3} />
                {/* Visor */}
                <path d="M -50 -10 Q 0 -30 50 -10" fill="none" stroke="#fff" strokeWidth={2} opacity={0.5} />
                {/* Shield text */}
                <text x={0} y={-10} textAnchor="middle" fill="#996c00" fontSize={16} fontWeight={800}>⛑️</text>
            </g>

            {/* Large circular checkmark */}
            <g transform="translate(480, 180)" opacity={checkProgress > 0 ? 1 : 0}>
                <circle
                    cx={0}
                    cy={0}
                    r={100}
                    fill="none"
                    stroke="url(#checkGrad)"
                    strokeWidth={4}
                    strokeDasharray={628}
                    strokeDashoffset={628 * (1 - checkProgress)}
                    filter="url(#cierreGlow)"
                    opacity={glowPulse}
                />
                <path
                    d="M -35 5 L -10 35 L 40 -25"
                    fill="none"
                    stroke="#2ecc71"
                    strokeWidth={8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={120}
                    strokeDashoffset={120 * (1 - checkProgress)}
                    filter="url(#cierreGlow)"
                />
            </g>

            {/* Motivational message */}
            <g opacity={msgOpacity}>
                <text x={480} y={340} textAnchor="middle" fill="white" fontSize={24} fontWeight={800}>
                    TRABAJO COMPLETADO CON SEGURIDAD
                </text>
                <text x={480} y={380} textAnchor="middle" fill="#00d4ff" fontSize={16} fontWeight={600}>
                    Cada paso seguro te acerca a tu familia
                </text>
            </g>

            {/* Stats bar */}
            <g opacity={interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
                {[
                    { label: 'Pasos', value: '13', icon: '📋' },
                    { label: 'Riesgos', value: '6', icon: '⚠️' },
                    { label: 'EPP', value: '7', icon: '🦺' },
                    { label: 'Controles', value: '6', icon: '✅' },
                ].map((stat, i) => {
                    const x = 180 + i * 200;
                    return (
                        <g key={i} transform={`translate(${x}, 440)`}>
                            <text x={0} y={0} textAnchor="middle" fontSize={22}>{stat.icon}</text>
                            <text x={0} y={25} textAnchor="middle" fill="white" fontSize={20} fontWeight={800}>{stat.value}</text>
                            <text x={0} y={43} textAnchor="middle" fill="#8888aa" fontSize={12}>{stat.label}</text>
                        </g>
                    );
                })}
            </g>
        </svg>
    );
};
