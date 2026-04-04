import React from 'react';
import { interpolate, spring } from 'remotion';

interface SceneProps {
    frame: number;
    fps: number;
    durationInFrames: number;
}

export const MedicionScene: React.FC<SceneProps> = ({ frame, fps }) => {
    // Grating appears
    const gratingOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

    // Ruler slides in from left
    const rulerX = interpolate(frame, [15, 40], [-200, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    // Trace lines draw
    const traceLine1 = interpolate(frame, [45, 65], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const traceLine2 = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    // Measurements appear
    const measureOpacity = interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    // Grating bars
    const bars: JSX.Element[] = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 12; c++) {
            const x = c * 70 + 80;
            const y = r * 55 + 60;
            bars.push(
                <rect key={`h${r}${c}`} x={x} y={y} width={60} height={3} fill="#334" rx={1} />,
                <rect key={`v${r}${c}`} x={x} y={y} width={3} height={45} fill="#334" rx={1} />,
            );
        }
    }

    // Cut zone coordinates
    const cutX = 280;
    const cutY = 140;
    const cutW = 380;
    const cutH = 260;

    return (
        <svg viewBox="0 0 960 560" width="100%" height="100%">
            <defs>
                <filter id="traceGlow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Grating base */}
            <g opacity={gratingOpacity}>
                {bars}
            </g>

            {/* Ruler sliding in */}
            <g transform={`translate(${rulerX}, 0)`}>
                {/* Ruler body */}
                <rect x={cutX - 15} y={cutY - 15} width={cutW + 30} height={20} fill="#f39c12" opacity={0.9} rx={3} />
                {/* Ruler markings */}
                {Array.from({ length: 20 }).map((_, i) => (
                    <g key={i}>
                        <line
                            x1={cutX - 10 + i * 20}
                            y1={cutY - 15}
                            x2={cutX - 10 + i * 20}
                            y2={cutY - 5 + (i % 5 === 0 ? -5 : 0)}
                            stroke="#333"
                            strokeWidth={i % 5 === 0 ? 1.5 : 0.8}
                        />
                    </g>
                ))}
            </g>

            {/* Trace lines — dashed white/yellow showing where to cut */}
            {/* Top line */}
            <line
                x1={cutX}
                y1={cutY}
                x2={cutX + cutW * traceLine1}
                y2={cutY}
                stroke="#ffd700"
                strokeWidth={2.5}
                strokeDasharray="8 4"
                filter="url(#traceGlow)"
            />
            {/* Right line */}
            <line
                x1={cutX + cutW}
                y1={cutY}
                x2={cutX + cutW}
                y2={cutY + cutH * traceLine2}
                stroke="#ffd700"
                strokeWidth={2.5}
                strokeDasharray="8 4"
                filter="url(#traceGlow)"
                opacity={traceLine1 > 0.8 ? 1 : 0}
            />
            {/* Bottom line */}
            <line
                x1={cutX + cutW}
                y1={cutY + cutH}
                x2={cutX + cutW - cutW * Math.max(0, traceLine2 - 0.3) / 0.7}
                y2={cutY + cutH}
                stroke="#ffd700"
                strokeWidth={2.5}
                strokeDasharray="8 4"
                filter="url(#traceGlow)"
                opacity={traceLine2 > 0.5 ? 1 : 0}
            />
            {/* Left line */}
            <line
                x1={cutX}
                y1={cutY + cutH}
                x2={cutX}
                y2={cutY + cutH - cutH * Math.max(0, traceLine2 - 0.6) / 0.4}
                stroke="#ffd700"
                strokeWidth={2.5}
                strokeDasharray="8 4"
                filter="url(#traceGlow)"
                opacity={traceLine2 > 0.7 ? 1 : 0}
            />

            {/* Measurement labels */}
            <g opacity={measureOpacity}>
                <text x={cutX + cutW / 2} y={cutY - 25} textAnchor="middle" fill="#ffd700" fontSize={18} fontWeight={700}>
                    600 mm
                </text>
                <text
                    x={cutX + cutW + 35}
                    y={cutY + cutH / 2}
                    textAnchor="middle"
                    fill="#ffd700"
                    fontSize={18}
                    fontWeight={700}
                    transform={`rotate(90, ${cutX + cutW + 35}, ${cutY + cutH / 2})`}
                >
                    400 mm
                </text>
            </g>

            {/* Tiza/marker icon */}
            <g transform={`translate(${cutX + cutW * Math.min(traceLine1, 1)}, ${cutY - 5})`} opacity={traceLine1 < 1 ? 1 : 0}>
                <rect x={-3} y={-18} width={6} height={20} fill="#ffd700" rx={2} />
                <polygon points="-3,2 3,2 0,8" fill="#ffd700" />
            </g>
        </svg>
    );
};
