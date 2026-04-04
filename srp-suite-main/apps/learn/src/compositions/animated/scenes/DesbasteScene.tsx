import React from 'react';
import { interpolate } from 'remotion';

interface SceneProps {
    frame: number;
    fps: number;
    durationInFrames: number;
}

export const DesbasteScene: React.FC<SceneProps> = ({ frame }) => {
    // Show rough edges becoming smooth
    const smoothProgress = interpolate(frame, [20, 150], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    // The grating piece — cut edges
    const cutX = 230;
    const cutY = 100;
    const cutW = 460;
    const cutH = 300;

    // Rough edge points (jagged)
    const roughnessTop = Array.from({ length: 24 }).map((_, i) => {
        const x = cutX + (i / 23) * cutW;
        const roughY = cutY + (Math.sin(i * 2.5) * 6 + Math.cos(i * 4) * 3) * (1 - smoothProgress);
        return `${x},${roughY}`;
    }).join(' ');

    // Grinding sparks at current edge position
    const grindX = cutX + smoothProgress * cutW;
    const sparkOpacity = smoothProgress < 1 ? 0.8 : 0;

    // Measurement verification appears after smoothing
    const verifyOpacity = interpolate(frame, [160, 180], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    return (
        <svg viewBox="0 0 960 560" width="100%" height="100%">
            <defs>
                <filter id="debasteGlow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Cut grating piece */}
            <rect x={cutX} y={cutY} width={cutW} height={cutH} fill="#0d1535" stroke="#334" strokeWidth={2} rx={3} />

            {/* Interior grating pattern */}
            {Array.from({ length: 5 }).map((_, r) =>
                Array.from({ length: 6 }).map((_, c) => (
                    <g key={`${r}${c}`}>
                        <rect x={cutX + 20 + c * 72} y={cutY + 20 + r * 55} width={60} height={3} fill="#223" rx={1} />
                        <rect x={cutX + 20 + c * 72} y={cutY + 20 + r * 55} width={3} height={45} fill="#223" rx={1} />
                    </g>
                ))
            )}

            {/* Rough top edge */}
            <polyline
                points={roughnessTop}
                fill="none"
                stroke={smoothProgress > 0.9 ? '#2ecc71' : '#ff6b35'}
                strokeWidth={3}
                filter="url(#debasteGlow)"
            />

            {/* Rough edges on sides (left, right, bottom) */}
            {['left', 'right', 'bottom'].map((side) => {
                const pts = Array.from({ length: 16 }).map((_, i) => {
                    const rough = (Math.sin(i * 3 + (side === 'left' ? 1 : side === 'right' ? 2 : 3)) * 5) * (1 - smoothProgress);
                    if (side === 'left') return `${cutX + rough},${cutY + (i / 15) * cutH}`;
                    if (side === 'right') return `${cutX + cutW + rough},${cutY + (i / 15) * cutH}`;
                    return `${cutX + (i / 15) * cutW},${cutY + cutH + rough}`;
                }).join(' ');
                return (
                    <polyline
                        key={side}
                        points={pts}
                        fill="none"
                        stroke={smoothProgress > 0.9 ? '#2ecc71' : '#ff6b35'}
                        strokeWidth={2.5}
                        filter="url(#debasteGlow)"
                    />
                );
            })}

            {/* Grinder tool at current position */}
            {smoothProgress < 1 && (
                <g transform={`translate(${grindX}, ${cutY})`}>
                    <rect x={-12} y={-30} width={24} height={25} fill="#666" rx={4} stroke="#888" strokeWidth={1} />
                    <circle cx={0} cy={0} r={10} fill="none" stroke="#ff6b35" strokeWidth={2} strokeDasharray="4 2" transform={`rotate(${frame * 12})`} />
                    {/* Sparks */}
                    {Array.from({ length: 5 }).map((_, i) => {
                        const a = (i * 72 + frame * 8) * (Math.PI / 180);
                        const d = (frame * 2 + i * 10) % 25;
                        return (
                            <circle
                                key={i}
                                cx={Math.cos(a) * d}
                                cy={Math.sin(a) * d - 5}
                                r={1.5}
                                fill="#ffa502"
                                opacity={Math.max(0, 1 - d / 25) * sparkOpacity}
                            />
                        );
                    })}
                </g>
            )}

            {/* Bisel angle indicator after smoothing */}
            <g opacity={verifyOpacity} transform={`translate(${cutX + cutW + 60}, ${cutY + 30})`}>
                <line x1={0} y1={0} x2={40} y2={0} stroke="#2ecc71" strokeWidth={1.5} />
                <line x1={0} y1={0} x2={35} y2={-15} stroke="#2ecc71" strokeWidth={1.5} />
                <path d="M 15 0 A 15 15 0 0 0 13 -6" fill="none" stroke="#2ecc71" strokeWidth={1} />
                <text x={25} y={-18} fill="#2ecc71" fontSize={13} fontWeight={700}>30°</text>
                <text x={0} y={25} fill="#8888aa" fontSize={11}>Bisel para soldadura</text>
            </g>

            {/* Verification result */}
            <g opacity={verifyOpacity}>
                <text x={480} y={470} textAnchor="middle" fill="#2ecc71" fontSize={16} fontWeight={700} letterSpacing={2}>
                    ✓ DIMENSIONES VERIFICADAS — LISTO PARA SOLDAR
                </text>
            </g>
        </svg>
    );
};
