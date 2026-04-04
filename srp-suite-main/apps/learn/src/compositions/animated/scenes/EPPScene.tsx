import React from 'react';
import { interpolate, spring } from 'remotion';

interface SceneProps {
    frame: number;
    fps: number;
    durationInFrames: number;
}

const EPP_ITEMS = [
    { icon: '🪖', label: 'Casco', color: '#f1c40f' },
    { icon: '🥽', label: 'Lentes', color: '#3498db' },
    { icon: '🧤', label: 'Guantes', color: '#e67e22' },
    { icon: '👢', label: 'Zapatos', color: '#8b4513' },
    { icon: '🦺', label: 'Chaleco', color: '#2ecc71' },
    { icon: '🎧', label: 'Protector', color: '#9b59b6' },
];

export const EPPScene: React.FC<SceneProps> = ({ frame, fps }) => {
    return (
        <svg viewBox="0 0 960 560" width="100%" height="100%">
            <defs>
                <filter id="eppGlow">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Worker silhouette in center */}
            <g transform="translate(480, 280)">
                {/* Body */}
                <ellipse cx={0} cy={-60} rx={25} ry={30} fill="#1a2a4a" stroke="#00d4ff" strokeWidth={1.5} opacity={0.5} />
                <rect x={-30} y={-30} width={60} height={90} rx={10} fill="#1a2a4a" stroke="#00d4ff" strokeWidth={1.5} opacity={0.5} />
                {/* Legs */}
                <rect x={-25} y={60} width={18} height={50} rx={5} fill="#1a2a4a" stroke="#00d4ff" strokeWidth={1.5} opacity={0.5} />
                <rect x={7} y={60} width={18} height={50} rx={5} fill="#1a2a4a" stroke="#00d4ff" strokeWidth={1.5} opacity={0.5} />
            </g>

            {/* EPP items orbiting around worker */}
            {EPP_ITEMS.map((item, i) => {
                const delay = i * 10;
                const scale = spring({ frame: frame - delay - 5, fps, config: { damping: 12, mass: 0.8 } });
                const angle = (i / EPP_ITEMS.length) * Math.PI * 2 - Math.PI / 2;
                const radius = 180;
                const x = 480 + Math.cos(angle) * radius;
                const y = 280 + Math.sin(angle) * radius * 0.7;

                // Connection line from item to worker
                const lineOpacity = interpolate(frame, [delay + 15, delay + 25], [0, 0.4], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                });

                return (
                    <g key={i}>
                        {/* Connection line */}
                        <line
                            x1={480}
                            y1={280}
                            x2={x}
                            y2={y}
                            stroke={item.color}
                            strokeWidth={1}
                            strokeDasharray="4 3"
                            opacity={lineOpacity}
                        />

                        {/* EPP circle */}
                        <g transform={`translate(${x}, ${y}) scale(${scale})`}>
                            <circle
                                cx={0}
                                cy={0}
                                r={42}
                                fill={`${item.color}15`}
                                stroke={item.color}
                                strokeWidth={2}
                            />
                            <text
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={32}
                                y={-4}
                            >
                                {item.icon}
                            </text>
                            <text
                                textAnchor="middle"
                                y={53}
                                fill={item.color}
                                fontSize={12}
                                fontWeight={700}
                                letterSpacing={1}
                            >
                                {item.label.toUpperCase()}
                            </text>
                        </g>
                    </g>
                );
            })}

            {/* OBLIGATORIO label */}
            <g opacity={interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
                <text
                    x={480}
                    y={480}
                    textAnchor="middle"
                    fill="#ff4757"
                    fontSize={18}
                    fontWeight={800}
                    letterSpacing={4}
                >
                    ⚠ USO OBLIGATORIO ⚠
                </text>
            </g>
        </svg>
    );
};
