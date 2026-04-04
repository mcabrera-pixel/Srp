import React from 'react';
import { interpolate } from 'remotion';

interface SceneProps {
    frame: number;
    fps: number;
    durationInFrames: number;
}

export const PinturaScene: React.FC<SceneProps> = ({ frame }) => {
    // Paint progress
    const paintProgress = interpolate(frame, [20, 180], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    // Safety stripe progress (yellow/black)
    const stripeProgress = interpolate(frame, [140, 220], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    const cutX = 250;
    const cutY = 100;
    const cutW = 420;
    const cutH = 280;

    // Paint roller position
    const rollerY = cutY + paintProgress * cutH;

    return (
        <svg viewBox="0 0 960 560" width="100%" height="100%">
            <defs>
                <linearGradient id="antiCorrosion" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#e74c3c" />
                    <stop offset="100%" stopColor="#c0392b" />
                </linearGradient>
                <pattern id="safetyStripes" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="10" height="20" fill="#f1c40f" />
                    <rect x="10" width="10" height="20" fill="#2c3e50" />
                </pattern>
                <clipPath id="paintClip">
                    <rect x={cutX} y={cutY} width={cutW} height={paintProgress * cutH} />
                </clipPath>
                <clipPath id="stripeClip">
                    <rect x={cutX - 12} y={cutY - 12} width={cutW + 24} height={(cutH + 24) * stripeProgress} />
                </clipPath>
            </defs>

            {/* Unpainted hatch frame */}
            <rect x={cutX - 12} y={cutY - 12} width={cutW + 24} height={cutH + 24} fill="none" stroke="#556" strokeWidth={12} rx={3} />
            <rect x={cutX} y={cutY} width={cutW} height={cutH} fill="#1a1a2e" stroke="#445" strokeWidth={1.5} />

            {/* Anti-corrosion paint layer (red primer) — fills top to bottom */}
            <g clipPath="url(#paintClip)">
                <rect x={cutX} y={cutY} width={cutW} height={cutH} fill="url(#antiCorrosion)" opacity={0.7} />
                {/* Texture */}
                {Array.from({ length: 20 }).map((_, i) => (
                    <line
                        key={i}
                        x1={cutX}
                        y1={cutY + i * 14}
                        x2={cutX + cutW}
                        y2={cutY + i * 14 + 2}
                        stroke="#d63031"
                        strokeWidth={0.5}
                        opacity={0.3}
                    />
                ))}
            </g>

            {/* Safety yellow stripes on frame border */}
            <g clipPath="url(#stripeClip)">
                <rect x={cutX - 12} y={cutY - 12} width={cutW + 24} height={12} fill="url(#safetyStripes)" />
                <rect x={cutX - 12} y={cutY + cutH} width={cutW + 24} height={12} fill="url(#safetyStripes)" />
                <rect x={cutX - 12} y={cutY} width={12} height={cutH} fill="url(#safetyStripes)" />
                <rect x={cutX + cutW} y={cutY} width={12} height={cutH} fill="url(#safetyStripes)" />
            </g>

            {/* Paint roller */}
            {paintProgress < 1 && (
                <g transform={`translate(${cutX + cutW / 2}, ${rollerY})`}>
                    {/* Handle */}
                    <line x1={0} y1={0} x2={60} y2={-40} stroke="#8b7355" strokeWidth={4} strokeLinecap="round" />
                    {/* Roller */}
                    <rect x={-60} y={-5} width={120} height={10} rx={5} fill="#c0392b" stroke="#a93226" strokeWidth={1} />
                    {/* Wet paint drips */}
                    {Array.from({ length: 4 }).map((_, i) => (
                        <rect
                            key={i}
                            x={-40 + i * 25}
                            y={5}
                            width={3}
                            height={5 + Math.sin(frame * 0.2 + i) * 3}
                            fill="#c0392b"
                            opacity={0.7}
                            rx={1}
                        />
                    ))}
                </g>
            )}

            {/* Legend */}
            <g transform="translate(720, 140)" opacity={interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
                <rect x={0} y={0} width={170} height={130} fill="#0d1535" stroke="#334" strokeWidth={1.5} rx={8} />
                <text x={85} y={28} textAnchor="middle" fill="#00d4ff" fontSize={12} fontWeight={700} letterSpacing={1}>LEYENDA</text>
                <line x1={15} y1={40} x2={155} y2={40} stroke="#223" />
                <rect x={15} y={55} width={18} height={12} fill="url(#antiCorrosion)" rx={2} />
                <text x={42} y={65} fill="#8888aa" fontSize={11}>Anticorrosivo</text>
                <rect x={15} y={80} width={18} height={12} fill="url(#safetyStripes)" rx={2} />
                <text x={42} y={90} fill="#8888aa" fontSize={11}>Señalización</text>
                <text x={15} y={118} fill="#f39c12" fontSize={11} fontWeight={600}>Secado: 24 hrs</text>
            </g>

            {/* Drying notice */}
            <g opacity={interpolate(frame, [200, 220], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
                <text x={480} y={460} textAnchor="middle" fill="#f39c12" fontSize={15} fontWeight={700} letterSpacing={2}>
                    ⏰ DEJAR SECAR SEGÚN ESPECIFICACIONES DEL FABRICANTE
                </text>
            </g>
        </svg>
    );
};
