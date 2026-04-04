import React from 'react';
import { interpolate } from 'remotion';

interface SceneProps {
    frame: number;
    fps: number;
    durationInFrames: number;
}

/**
 * WBCierreScene — Final step: order & tidiness, tool return, sign-off.
 * Shows a tidy workspace with tools returned and checklist signed.
 */
export const WBCierreScene: React.FC<SceneProps> = ({ frame }) => {
    const cx = 480;

    // Broom sweeps across
    const sweepX = interpolate(frame, [10, 60], [100, 860], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const sweepOpacity = interpolate(frame, [10, 20, 50, 60], [0, 0.6, 0.6, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    // Closure items
    const items = [
        { label: 'Herramientas\nDevueltas', icon: '🔧', x: 160, y: 220, drawFrame: 60 },
        { label: 'Área Limpia\ny Ordenada', icon: '🧹', x: 380, y: 220, drawFrame: 100 },
        { label: 'Informe\nCompletado', icon: '📋', x: 580, y: 220, drawFrame: 140 },
        { label: 'Firma\nSupervisor', icon: '✍️', x: 780, y: 220, drawFrame: 180 },
    ];

    return (
        <svg viewBox="0 0 960 460" width="100%" height="100%">
            <defs>
                <filter id="chalkC">
                    <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
                </filter>
            </defs>

            {/* Title */}
            <text x={cx} y={45} textAnchor="middle" fill="#2c1810" fontSize={18} fontWeight={700}
                fontFamily="Georgia, serif" letterSpacing={3}
                opacity={interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
                CIERRE DE TAREA
            </text>
            <line x1={cx - 100} y1={55} x2={cx + 100} y2={55} stroke="#c4a882" strokeWidth={1.5}
                opacity={interpolate(frame, [8, 15], [0, 0.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />

            {/* Sweeping broom line */}
            <line x1={sweepX - 40} y1={130} x2={sweepX + 40} y2={130} stroke="#8b7355" strokeWidth={2}
                opacity={sweepOpacity} strokeLinecap="round" />
            <line x1={sweepX} y1={130} x2={sweepX - 10} y2={80} stroke="#6b5840" strokeWidth={2.5}
                opacity={sweepOpacity} strokeLinecap="round" />

            {/* Dust particles behind broom */}
            {frame > 15 && frame < 55 && Array.from({ length: 4 }).map((_, i) => {
                const px = sweepX - 50 - i * 15;
                const py = 125 + Math.sin(frame * 0.3 + i) * 8;
                return <circle key={i} cx={px} cy={py} r={1.5} fill="#c4a882" opacity={sweepOpacity * 0.5} />;
            })}

            {/* Closure items */}
            {items.map((item, i) => {
                const p = interpolate(frame, [item.drawFrame, item.drawFrame + 25], [0, 1], {
                    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
                });
                const checkP = interpolate(frame, [item.drawFrame + 20, item.drawFrame + 30], [0, 1], {
                    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
                });
                return (
                    <g key={i} opacity={p}>
                        {/* Circle border */}
                        <circle cx={item.x} cy={item.y} r={50} fill="none" stroke="#8b7355" strokeWidth={2} rx={6}
                            strokeDasharray="314" strokeDashoffset={interpolate(p, [0, 1], [314, 0])} />
                        {/* Icon */}
                        <text x={item.x} y={item.y + 8} textAnchor="middle" fontSize={32} opacity={p}>{item.icon}</text>
                        {/* Label */}
                        {item.label.split('\n').map((line, j) => (
                            <text key={j} x={item.x} y={item.y + 75 + j * 16} textAnchor="middle" fill="#4a3828"
                                fontSize={11} fontWeight={600} fontFamily="Georgia, serif" letterSpacing={1} opacity={p}>{line}</text>
                        ))}
                        {/* Green check */}
                        <circle cx={item.x + 35} cy={item.y - 35} r={12} fill="#2c6b3f" opacity={checkP * 0.8} />
                        <path d={`M ${item.x + 29} ${item.y - 35} L ${item.x + 34} ${item.y - 30} L ${item.x + 42} ${item.y - 40}`}
                            fill="none" stroke="white" strokeWidth={2} strokeLinecap="round"
                            strokeDasharray="20" strokeDashoffset={interpolate(checkP, [0, 1], [20, 0])} />
                    </g>
                );
            })}

            {/* Arrow flow between items */}
            {items.slice(0, -1).map((item, i) => {
                const nextItem = items[i + 1];
                const arrowP = interpolate(frame, [item.drawFrame + 15, item.drawFrame + 25], [0, 1], {
                    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
                });
                return (
                    <line key={`a${i}`} x1={item.x + 55} y1={item.y} x2={nextItem.x - 55} y2={nextItem.y}
                        stroke="#c4a882" strokeWidth={1.5} strokeDasharray="6 4" opacity={arrowP * 0.5} />
                );
            })}

            {/* Final stamp "COMPLETADO" */}
            <g opacity={interpolate(frame, [230, 260], [0, 0.65], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
                transform={`translate(${cx}, 390) rotate(-8)`}>
                <rect x={-90} y={-22} width={180} height={44} fill="none" stroke="#2c6b3f" strokeWidth={3} rx={6} />
                <text textAnchor="middle" y={6} fill="#2c6b3f" fontSize={18} fontWeight={800} fontFamily="Georgia, serif" letterSpacing={5}>
                    COMPLETADO
                </text>
            </g>
        </svg>
    );
};
