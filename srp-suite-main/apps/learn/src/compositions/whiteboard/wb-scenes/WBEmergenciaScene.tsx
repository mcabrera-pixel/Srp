import React from 'react';
import { interpolate } from 'remotion';

interface SceneProps {
    frame: number;
    fps: number;
    durationInFrames: number;
}

export const WBEmergenciaScene: React.FC<SceneProps> = ({ frame }) => {
    const cx = 480;
    const phoneDraw = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const numberOpacity = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    const flowItems = [
        { text: '¿Qué ocurrió?', icon: '❓', x: 180, drawFrame: 50 },
        { text: 'Tu nombre', icon: '👤', x: 380, drawFrame: 80 },
        { text: 'Lugar exacto', icon: '📍', x: 580, drawFrame: 110 },
        { text: 'Equipo afectado', icon: '⚙️', x: 780, drawFrame: 140 },
    ];

    return (
        <svg viewBox="0 0 960 460" width="100%" height="100%">
            <defs>
                <filter id="chalkEm">
                    <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
                </filter>
            </defs>

            {/* Phone icon */}
            <g transform={`translate(${cx}, 100)`} filter="url(#chalkEm)">
                <rect x={-30} y={-50} width={60} height={100} rx={12} fill="none" stroke="#2c1810" strokeWidth={3}
                    strokeDasharray="320" strokeDashoffset={interpolate(phoneDraw, [0, 1], [320, 0])} />
                <rect x={-22} y={-35} width={44} height={60} rx={4} fill="none" stroke="#8b7355" strokeWidth={1.5} opacity={phoneDraw} />
                <circle cx={0} cy={38} r={6} fill="none" stroke="#8b7355" strokeWidth={1.5} opacity={phoneDraw} />
                {[1, 2, 3].map((r) => (
                    <circle key={r} cx={35} cy={-40} r={10 + r * 12} fill="none" stroke="#c44a2a" strokeWidth={1.5}
                        opacity={phoneDraw > 0.8 ? Math.sin(frame * 0.15 + r * 1.5) * 0.3 + 0.3 : 0} strokeDasharray="4 4" />
                ))}
            </g>

            {/* Number 3911 */}
            <g opacity={numberOpacity}>
                <text x={cx} y={200} textAnchor="middle" fill="#c44a2a" fontSize={48} fontWeight={800} fontFamily="Georgia, serif" letterSpacing={8}>3911</text>
                <text x={cx} y={225} textAnchor="middle" fill="#8b7355" fontSize={13} fontFamily="Georgia, serif" letterSpacing={2}>POTRERILLOS · Cel: 52 246 3911</text>
            </g>

            <line x1={cx - 120} y1={238} x2={cx + 120} y2={238} stroke="#c4a882" strokeWidth={1.5} opacity={numberOpacity * 0.5} />

            <text x={cx} y={280} textAnchor="middle" fill="#4a3828" fontSize={14} fontWeight={700} fontFamily="Georgia, serif" letterSpacing={3}
                opacity={interpolate(frame, [45, 55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>INFORMA:</text>

            {/* Flow items */}
            {flowItems.map((item, i) => {
                const p = interpolate(frame, [item.drawFrame, item.drawFrame + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                return (
                    <g key={i} opacity={p}>
                        <rect x={item.x - 70} y={300} width={140} height={80} fill="none" stroke="#8b7355" strokeWidth={2} rx={6}
                            strokeDasharray="440" strokeDashoffset={interpolate(p, [0, 1], [440, 0])} />
                        <circle cx={item.x - 55} cy={315} r={10} fill="#d4883a" opacity={0.8} />
                        <text x={item.x - 55} y={319} textAnchor="middle" fill="white" fontSize={11} fontWeight={700}>{i + 1}</text>
                        <text x={item.x} y={340} textAnchor="middle" fontSize={22} opacity={p}>{item.icon}</text>
                        <text x={item.x} y={368} textAnchor="middle" fill="#4a3828" fontSize={11} fontWeight={600} fontFamily="Georgia, serif" opacity={p}>{item.text}</text>
                    </g>
                );
            })}

            <g opacity={interpolate(frame, [180, 210], [0, 0.7], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} transform="translate(860, 90)">
                <text textAnchor="middle" fontSize={36}>🚑</text>
            </g>
        </svg>
    );
};
