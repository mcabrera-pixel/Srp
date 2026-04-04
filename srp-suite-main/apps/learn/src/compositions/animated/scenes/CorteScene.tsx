import React from 'react';
import { interpolate } from 'remotion';

interface SceneProps {
    frame: number;
    fps: number;
    durationInFrames: number;
}

export const CorteScene: React.FC<SceneProps> = ({ frame, fps }) => {
    // Cut progress (angle grinder moves along the top edge)
    const cutProgress = interpolate(frame, [20, 200], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    // Grating
    const cutX = 200;
    const cutY = 120;
    const cutW = 500;
    const cutH = 300;

    // Grinder position along cut path
    const grinderPos = (() => {
        const perimeter = 2 * (cutW + cutH);
        const dist = cutProgress * perimeter;
        if (dist <= cutW) return { x: cutX + dist, y: cutY, angle: 0 };
        if (dist <= cutW + cutH) return { x: cutX + cutW, y: cutY + (dist - cutW), angle: 90 };
        if (dist <= 2 * cutW + cutH) return { x: cutX + cutW - (dist - cutW - cutH), y: cutY + cutH, angle: 180 };
        return { x: cutX, y: cutY + cutH - (dist - 2 * cutW - cutH), angle: 270 };
    })();

    // Sparks
    const sparks = Array.from({ length: 8 }).map((_, i) => {
        const seed = i * 137.5;
        const sparkAngle = (seed % 360) * (Math.PI / 180);
        const sparkDist = (frame * 3 + seed) % 40;
        const sparkOpacity = Math.max(0, 1 - sparkDist / 40);
        return {
            x: grinderPos.x + Math.cos(sparkAngle) * sparkDist,
            y: grinderPos.y + Math.sin(sparkAngle) * sparkDist - sparkDist * 0.3,
            opacity: sparkOpacity * (cutProgress > 0 && cutProgress < 1 ? 1 : 0),
            size: 2 + (seed % 3),
        };
    });

    // Grating bars
    const bars: JSX.Element[] = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 10; c++) {
            const x = c * 80 + 80;
            const y = r * 55 + 50;
            bars.push(
                <rect key={`h${r}${c}`} x={x} y={y} width={70} height={3} fill="#334" rx={1} />,
                <rect key={`v${r}${c}`} x={x} y={y} width={3} height={45} fill="#334" rx={1} />,
            );
        }
    }

    // Cut line (already cut portion glows)
    const cutLinePath = `M ${cutX} ${cutY} L ${cutX + cutW} ${cutY} L ${cutX + cutW} ${cutY + cutH} L ${cutX} ${cutY + cutH} Z`;

    return (
        <svg viewBox="0 0 960 560" width="100%" height="100%">
            <defs>
                <filter id="sparkGlow">
                    <feGaussianBlur stdDeviation="2" />
                </filter>
                <filter id="cutGlow">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Grating */}
            <g opacity={0.7}>{bars}</g>

            {/* Cut line glowing */}
            <path
                d={cutLinePath}
                fill="none"
                stroke="#ff6b35"
                strokeWidth={3}
                strokeDasharray={`${2 * (cutW + cutH)}`}
                strokeDashoffset={2 * (cutW + cutH) * (1 - cutProgress)}
                filter="url(#cutGlow)"
                opacity={0.9}
            />

            {/* Grinder icon */}
            {cutProgress > 0 && cutProgress < 1 && (
                <g transform={`translate(${grinderPos.x}, ${grinderPos.y})`}>
                    {/* Grinder body */}
                    <rect x={-25} y={-12} width={50} height={24} rx={5} fill="#555" stroke="#888" strokeWidth={1.5} />
                    {/* Disc */}
                    <circle
                        cx={0}
                        cy={0}
                        r={18}
                        fill="none"
                        stroke="#ff6b35"
                        strokeWidth={3}
                        opacity={0.8}
                        strokeDasharray="6 4"
                        transform={`rotate(${frame * 15})`}
                    />
                    {/* Center */}
                    <circle cx={0} cy={0} r={4} fill="#ff6b35" />
                </g>
            )}

            {/* Sparks */}
            {sparks.map((spark, i) => (
                <circle
                    key={i}
                    cx={spark.x}
                    cy={spark.y}
                    r={spark.size}
                    fill="#ffa502"
                    opacity={spark.opacity}
                    filter="url(#sparkGlow)"
                />
            ))}

            {/* Prensas (clamps) */}
            <g opacity={interpolate(frame, [0, 15], [0, 0.8], { extrapolateRight: 'clamp' })}>
                {/* Top-left clamp */}
                <g transform={`translate(${cutX - 30}, ${cutY - 10})`}>
                    <rect x={0} y={0} width={20} height={40} fill="#e74c3c" rx={3} opacity={0.7} />
                    <text x={10} y={55} textAnchor="middle" fill="#e74c3c" fontSize={10} fontWeight={600}>PRENSA</text>
                </g>
                {/* Bottom-right clamp */}
                <g transform={`translate(${cutX + cutW + 10}, ${cutY + cutH - 30})`}>
                    <rect x={0} y={0} width={20} height={40} fill="#e74c3c" rx={3} opacity={0.7} />
                    <text x={10} y={55} textAnchor="middle" fill="#e74c3c" fontSize={10} fontWeight={600}>PRENSA</text>
                </g>
            </g>

            {/* Warning: hot zone */}
            <g opacity={cutProgress > 0.1 ? interpolate(Math.sin(frame * 0.1), [-1, 1], [0.4, 0.8]) : 0}>
                <text x={480} y={500} textAnchor="middle" fill="#ff6b35" fontSize={14} fontWeight={700} letterSpacing={2}>
                    🔥 ZONA CALIENTE — NO TOCAR 🔥
                </text>
            </g>
        </svg>
    );
};
