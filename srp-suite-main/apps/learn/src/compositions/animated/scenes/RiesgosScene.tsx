import React from 'react';
import { interpolate, spring } from 'remotion';

interface SceneProps {
    frame: number;
    fps: number;
    durationInFrames: number;
}

const RISKS = [
    { icon: '🔴', risk: 'Proyección de partículas', control: 'Lentes + pantalla facial', color: '#e74c3c' },
    { icon: '🔥', risk: 'Quemaduras por soldadura', control: 'Guantes de cuero largo', color: '#ff6b35' },
    { icon: '💨', risk: 'Humos metálicos', control: 'Ventilación + respirador', color: '#9b59b6' },
    { icon: '🔥', risk: 'Incendio por chispas', control: 'Manta ignífuga + extintor', color: '#e67e22' },
    { icon: '⚙️', risk: 'Atrapamiento', control: 'Bloqueo de energías (LOTO)', color: '#f1c40f' },
    { icon: '⬇️', risk: 'Caída de tapa', control: 'Cadena de seguridad', color: '#3498db' },
];

export const RiesgosScene: React.FC<SceneProps> = ({ frame, fps }) => {
    return (
        <svg viewBox="0 0 960 560" width="100%" height="100%">
            <defs>
                <filter id="riskGlow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Title */}
            <text x={480} y={40} textAnchor="middle" fill="#ff4757" fontSize={18} fontWeight={800} letterSpacing={3}>
                ⚠ RIESGOS CRÍTICOS Y CONTROLES
            </text>

            {/* Risk→Control rows */}
            {RISKS.map((item, i) => {
                const delay = i * 15 + 10;
                const rowScale = spring({ frame: frame - delay, fps, config: { damping: 14 } });
                const arrowProgress = interpolate(frame, [delay + 20, delay + 35], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                });
                const y = 80 + i * 75;

                return (
                    <g key={i} opacity={rowScale} transform={`translate(0, ${y})`}>
                        {/* Risk box */}
                        <g transform={`scale(${rowScale})`} style={{ transformOrigin: '120px 30px' }}>
                            <rect x={40} y={5} width={320} height={52} rx={8} fill={`${item.color}15`} stroke={item.color} strokeWidth={1.5} />
                            <text x={60} y={38} fontSize={22}>{item.icon}</text>
                            <text x={90} y={36} fill="white" fontSize={14} fontWeight={600}>{item.risk}</text>
                        </g>

                        {/* Arrow → */}
                        <g opacity={arrowProgress}>
                            <line x1={370} y1={30} x2={370 + 80 * arrowProgress} y2={30} stroke={item.color} strokeWidth={2} />
                            <polygon
                                points={`${450},24 ${462},30 ${450},36`}
                                fill={item.color}
                                opacity={arrowProgress > 0.8 ? 1 : 0}
                            />
                        </g>

                        {/* Control box */}
                        <g opacity={arrowProgress > 0.5 ? interpolate(arrowProgress, [0.5, 1], [0, 1]) : 0}>
                            <rect x={470} y={5} width={420} height={52} rx={8} fill="#2ecc7115" stroke="#2ecc71" strokeWidth={1.5} />
                            <text x={490} y={36} fill="#2ecc71" fontSize={14} fontWeight={600}>✓ {item.control}</text>
                        </g>
                    </g>
                );
            })}
        </svg>
    );
};
