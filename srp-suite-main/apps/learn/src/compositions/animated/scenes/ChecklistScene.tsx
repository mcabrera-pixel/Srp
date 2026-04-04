import React from 'react';
import { interpolate, spring } from 'remotion';

interface SceneProps {
    frame: number;
    fps: number;
    durationInFrames: number;
}

const CHECKS = [
    'Zona libre de materiales combustibles',
    'Equipos de corte y soldadura en buen estado',
    'Ventilación adecuada del taller',
    'Permisos de trabajo en caliente vigentes',
];

export const ChecklistScene: React.FC<SceneProps> = ({ frame, fps }) => {
    return (
        <svg viewBox="0 0 960 560" width="100%" height="100%">
            <defs>
                <filter id="checkGlow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Clipboard shape */}
            <g transform="translate(480, 20)">
                <rect x={-220} y={20} width={440} height={480} rx={12} fill="#0d1535" stroke="#00d4ff" strokeWidth={2} opacity={0.8} />
                <rect x={-50} y={8} width={100} height={28} rx={14} fill="#0d1535" stroke="#00d4ff" strokeWidth={2} />
                <text x={0} y={60} textAnchor="middle" fill="#00d4ff" fontSize={16} fontWeight={700} letterSpacing={3}>
                    CHECK LIST
                </text>
            </g>

            {/* Check items */}
            {CHECKS.map((check, i) => {
                const checkDelay = 20 + i * 30;
                const itemOpacity = interpolate(frame, [checkDelay, checkDelay + 10], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                });
                const checkmarkProgress = spring({
                    frame: frame - checkDelay - 15,
                    fps,
                    config: { damping: 10, mass: 0.5 },
                });
                const isChecked = checkmarkProgress > 0.1;
                const y = 130 + i * 100;

                return (
                    <g key={i} opacity={itemOpacity} transform={`translate(280, ${y})`}>
                        {/* Checkbox */}
                        <rect
                            x={0}
                            y={0}
                            width={36}
                            height={36}
                            rx={6}
                            fill={isChecked ? '#2ecc7122' : 'transparent'}
                            stroke={isChecked ? '#2ecc71' : '#445'}
                            strokeWidth={2}
                        />

                        {/* Checkmark */}
                        {isChecked && (
                            <g transform="translate(8, 8)" opacity={checkmarkProgress}>
                                <path
                                    d="M 2 10 L 8 18 L 20 2"
                                    fill="none"
                                    stroke="#2ecc71"
                                    strokeWidth={3.5}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    filter="url(#checkGlow)"
                                    strokeDasharray={30}
                                    strokeDashoffset={30 * (1 - checkmarkProgress)}
                                />
                            </g>
                        )}

                        {/* Text */}
                        <text
                            x={52}
                            y={24}
                            fill={isChecked ? '#ffffff' : '#8888aa'}
                            fontSize={18}
                            fontWeight={isChecked ? 600 : 400}
                        >
                            {check}
                        </text>

                        {/* Status */}
                        {isChecked && (
                            <text
                                x={380}
                                y={24}
                                fill="#2ecc71"
                                fontSize={12}
                                fontWeight={700}
                                opacity={checkmarkProgress}
                            >
                                ✓ OK
                            </text>
                        )}
                    </g>
                );
            })}
        </svg>
    );
};
