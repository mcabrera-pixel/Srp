import React from 'react';
import { interpolate, spring } from 'remotion';

interface SceneProps {
    frame: number;
    fps: number;
    durationInFrames: number;
}

export const IntroScene: React.FC<SceneProps> = ({ frame, fps }) => {
    // Grating pattern reveals from center
    const gridReveal = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: 'clamp' });
    const titleScale = spring({ frame: frame - 10, fps, config: { damping: 15 } });
    const glowPulse = Math.sin(frame * 0.05) * 0.3 + 0.7;

    // Generate grating bars
    const bars: { x: number; y: number; w: number; h: number }[] = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 12; col++) {
            bars.push({ x: col * 70 + 60, y: row * 60 + 40, w: 60, h: 4 });
            bars.push({ x: col * 70 + 60, y: row * 60 + 40, w: 4, h: 50 });
        }
    }

    // Center of SVG for reveal mask
    const cx = 480;
    const cy = 280;

    return (
        <svg viewBox="0 0 960 560" width="100%" height="100%">
            <defs>
                <radialGradient id="revealGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="white" />
                    <stop offset={`${gridReveal * 100}%`} stopColor="white" />
                    <stop offset={`${gridReveal * 100 + 1}%`} stopColor="black" />
                    <stop offset="100%" stopColor="black" />
                </radialGradient>
                <mask id="revealMask">
                    <rect width="960" height="560" fill="url(#revealGrad)" />
                </mask>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Grating pattern */}
            <g mask="url(#revealMask)" opacity={0.6}>
                {bars.map((bar, i) => (
                    <rect
                        key={i}
                        x={bar.x}
                        y={bar.y}
                        width={bar.w}
                        height={bar.h}
                        fill="#00d4ff"
                        opacity={0.4}
                        rx={1}
                    />
                ))}
            </g>

            {/* Central highlight — the escotilla opening */}
            <rect
                x={cx - 120}
                y={cy - 80}
                width={240}
                height={160}
                fill="none"
                stroke="#00d4ff"
                strokeWidth={3}
                strokeDasharray="10 5"
                opacity={gridReveal}
                filter="url(#glow)"
                rx={4}
            />

            {/* Label: ESCOTILLA */}
            <g transform={`translate(${cx}, ${cy}) scale(${titleScale})`} opacity={titleScale}>
                <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#00d4ff"
                    fontSize={28}
                    fontWeight="800"
                    letterSpacing={6}
                    filter="url(#glow)"
                    opacity={glowPulse}
                >
                    ESCOTILLA
                </text>
                <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    y={35}
                    fill="#8888cc"
                    fontSize={14}
                    letterSpacing={3}
                >
                    ZONA DE CORTE
                </text>
            </g>

            {/* Dimension arrows */}
            {gridReveal > 0.7 && (
                <g opacity={interpolate(frame, [30, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
                    {/* Horizontal dimension */}
                    <line x1={cx - 120} y1={cy + 100} x2={cx + 120} y2={cy + 100} stroke="#ff9f43" strokeWidth={1.5} />
                    <text x={cx} y={cy + 118} textAnchor="middle" fill="#ff9f43" fontSize={13} fontWeight={600}>600 mm</text>

                    {/* Vertical dimension */}
                    <line x1={cx + 140} y1={cy - 80} x2={cx + 140} y2={cy + 80} stroke="#ff9f43" strokeWidth={1.5} />
                    <text x={cx + 165} y={cy + 5} textAnchor="middle" fill="#ff9f43" fontSize={13} fontWeight={600} transform={`rotate(90, ${cx + 165}, ${cy + 5})`}>400 mm</text>
                </g>
            )}
        </svg>
    );
};
