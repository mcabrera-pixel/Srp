import React from 'react';
import { interpolate, spring } from 'remotion';

interface SceneProps {
    frame: number;
    fps: number;
    durationInFrames: number;
}

/**
 * WBEPPScene — A stick-figure worker "puts on" each piece of EPP.
 * Items sketch in one by one with chalk checkmarks.
 */
export const WBEPPScene: React.FC<SceneProps> = ({ frame, fps }) => {
    // EPP items with their chalk-drawn positions
    const eppItems = [
        { name: 'Casco', icon: '⛑', x: 160, y: 80, drawFrame: 10 },
        { name: 'Máscara Soldar', icon: '🥽', x: 480, y: 80, drawFrame: 40 },
        { name: 'Lentes Seguridad', icon: '👓', x: 780, y: 80, drawFrame: 70 },
        { name: 'Guantes Cuero', icon: '🧤', x: 160, y: 280, drawFrame: 100 },
        { name: 'Tenida Cuero', icon: '🦺', x: 480, y: 280, drawFrame: 130 },
        { name: 'Tenida Ignífuga', icon: '🔥', x: 780, y: 280, drawFrame: 160 },
    ];

    // Worker stick figure in center
    const workerOpacity = interpolate(frame, [0, 15], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    return (
        <svg viewBox="0 0 960 480" width="100%" height="100%">
            <defs>
                <filter id="chalkE">
                    <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
                </filter>
            </defs>

            {/* Central stick figure (worker) */}
            <g transform="translate(480, 195)" opacity={workerOpacity} filter="url(#chalkE)">
                {/* Head */}
                <circle cx={0} cy={-45} r={18} fill="none" stroke="#4a3828" strokeWidth={2.5} />
                {/* Body */}
                <line x1={0} y1={-27} x2={0} y2={25} stroke="#4a3828" strokeWidth={2.5} />
                {/* Arms */}
                <line x1={-25} y1={-5} x2={25} y2={-5} stroke="#4a3828" strokeWidth={2.5} />
                {/* Legs */}
                <line x1={0} y1={25} x2={-18} y2={55} stroke="#4a3828" strokeWidth={2.5} />
                <line x1={0} y1={25} x2={18} y2={55} stroke="#4a3828" strokeWidth={2.5} />
                {/* Smile */}
                <path d="M -6 -40 Q 0 -35 6 -40" fill="none" stroke="#4a3828" strokeWidth={1.5} />
            </g>

            {/* EPP items */}
            {eppItems.map((item, i) => {
                const itemProgress = interpolate(frame, [item.drawFrame, item.drawFrame + 20], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                });
                const checkProgress = interpolate(frame, [item.drawFrame + 15, item.drawFrame + 25], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                });

                return (
                    <g key={i} opacity={itemProgress}>
                        {/* Box around item */}
                        <rect
                            x={item.x - 65}
                            y={item.y - 30}
                            width={130}
                            height={90}
                            fill="none"
                            stroke="#8b7355"
                            strokeWidth={2}
                            strokeDasharray="200 400"
                            strokeDashoffset={interpolate(itemProgress, [0, 1], [600, 0])}
                            rx={6}
                            opacity={0.5}
                        />

                        {/* Icon */}
                        <text
                            x={item.x}
                            y={item.y + 5}
                            textAnchor="middle"
                            fontSize={32}
                            opacity={itemProgress}
                        >
                            {item.icon}
                        </text>

                        {/* Label */}
                        <text
                            x={item.x}
                            y={item.y + 45}
                            textAnchor="middle"
                            fill="#4a3828"
                            fontSize={12}
                            fontWeight={600}
                            fontFamily="Georgia, serif"
                            letterSpacing={1}
                            opacity={itemProgress}
                        >
                            {item.name.toUpperCase()}
                        </text>

                        {/* Checkmark */}
                        <path
                            d={`M ${item.x + 40} ${item.y - 20} L ${item.x + 48} ${item.y - 10} L ${item.x + 62} ${item.y - 30}`}
                            fill="none"
                            stroke="#2c6b3f"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeDasharray="40"
                            strokeDashoffset={interpolate(checkProgress, [0, 1], [40, 0])}
                        />

                        {/* Dotted line from item to worker */}
                        <line
                            x1={item.x}
                            y1={item.y + 60}
                            x2={480}
                            y2={195}
                            stroke="#c4a882"
                            strokeWidth={1}
                            strokeDasharray="4 6"
                            opacity={itemProgress * 0.3}
                        />
                    </g>
                );
            })}

            {/* Equipment section */}
            <g opacity={interpolate(frame, [200, 220], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
                <text x={480} y={420} textAnchor="middle" fill="#8b7355" fontSize={12} fontFamily="Georgia, serif" letterSpacing={2}>
                    EQUIPOS: MÁQUINA SOLDAR 150A · ESMERIL 4½" · VARILLA E6011/E7018
                </text>
            </g>
        </svg>
    );
};
