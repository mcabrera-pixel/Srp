import React from 'react';
import { interpolate } from 'remotion';

interface SceneProps {
    frame: number;
    fps: number;
    durationInFrames: number;
}

export const SoldaduraScene: React.FC<SceneProps> = ({ frame }) => {
    // Frame positioning
    const frameOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

    // Welding progress around the frame perimeter
    const weldProgress = interpolate(frame, [30, 250], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    const cutX = 230;
    const cutY = 80;
    const cutW = 460;
    const cutH = 300;
    const frameW = 18; // Frame width

    // Weld position along perimeter
    const perimeter = 2 * (cutW + cutH);
    const dist = weldProgress * perimeter;
    const weldPos = (() => {
        if (dist <= cutW) return { x: cutX + dist, y: cutY };
        if (dist <= cutW + cutH) return { x: cutX + cutW, y: cutY + dist - cutW };
        if (dist <= 2 * cutW + cutH) return { x: cutX + cutW - (dist - cutW - cutH), y: cutY + cutH };
        return { x: cutX, y: cutY + cutH - (dist - 2 * cutW - cutH) };
    })();

    // Arc intensity
    const arcIntensity = weldProgress > 0 && weldProgress < 1 ?
        interpolate(Math.sin(frame * 0.8), [-1, 1], [0.5, 1]) : 0;

    // Weld bead path (already welded portion)
    const weldPath = `M ${cutX} ${cutY} L ${cutX + cutW} ${cutY} L ${cutX + cutW} ${cutY + cutH} L ${cutX} ${cutY + cutH} Z`;

    // Verification after welding
    const verifyOpacity = interpolate(frame, [260, 280], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    return (
        <svg viewBox="0 0 960 560" width="100%" height="100%">
            <defs>
                <filter id="weldGlow">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <filter id="arcFlash">
                    <feGaussianBlur stdDeviation="15" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <linearGradient id="beadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#999" />
                    <stop offset="50%" stopColor="#ccc" />
                    <stop offset="100%" stopColor="#888" />
                </linearGradient>
            </defs>

            {/* Grating background */}
            <g opacity={0.4}>
                {Array.from({ length: 7 }).map((_, r) =>
                    Array.from({ length: 10 }).map((_, c) => (
                        <g key={`${r}${c}`}>
                            <rect x={c * 80 + 80} y={r * 60 + 50} width={65} height={3} fill="#223" />
                            <rect x={c * 80 + 80} y={r * 60 + 50} width={3} height={48} fill="#223" />
                        </g>
                    ))
                )}
            </g>

            {/* Steel frame (L-profile) */}
            <g opacity={frameOpacity}>
                {/* Outer frame */}
                <rect x={cutX - frameW} y={cutY - frameW} width={cutW + 2 * frameW} height={cutH + 2 * frameW} fill="none" stroke="#667" strokeWidth={frameW} rx={2} />
                {/* Inner edge */}
                <rect x={cutX} y={cutY} width={cutW} height={cutH} fill="none" stroke="#556" strokeWidth={1.5} />
                {/* Frame label */}
                <text x={cutX + cutW / 2} y={cutY - 25} textAnchor="middle" fill="#8888aa" fontSize={12} letterSpacing={2}>
                    MARCO PERIMETRAL
                </text>
            </g>

            {/* Weld bead (completed portion) */}
            <path
                d={weldPath}
                fill="none"
                stroke="url(#beadGrad)"
                strokeWidth={5}
                strokeDasharray={perimeter}
                strokeDashoffset={perimeter * (1 - weldProgress)}
                opacity={0.8}
            />

            {/* Welding arc */}
            {weldProgress > 0 && weldProgress < 1 && (
                <g>
                    {/* Arc light */}
                    <circle
                        cx={weldPos.x}
                        cy={weldPos.y}
                        r={25}
                        fill="#00bfff"
                        opacity={arcIntensity * 0.6}
                        filter="url(#arcFlash)"
                    />
                    <circle
                        cx={weldPos.x}
                        cy={weldPos.y}
                        r={8}
                        fill="white"
                        opacity={arcIntensity}
                        filter="url(#weldGlow)"
                    />

                    {/* Welding rod */}
                    <line
                        x1={weldPos.x}
                        y1={weldPos.y}
                        x2={weldPos.x + 20}
                        y2={weldPos.y - 35}
                        stroke="#ff9f43"
                        strokeWidth={3}
                        strokeLinecap="round"
                    />

                    {/* Smoke particles */}
                    {Array.from({ length: 6 }).map((_, i) => {
                        const age = (frame * 1.5 + i * 20) % 60;
                        return (
                            <circle
                                key={i}
                                cx={weldPos.x + (i % 3 - 1) * 8}
                                cy={weldPos.y - age * 1.2}
                                r={3 + age * 0.15}
                                fill="#8888aa"
                                opacity={Math.max(0, 0.4 - age / 60)}
                            />
                        );
                    })}
                </g>
            )}

            {/* Cordón verification */}
            <g opacity={verifyOpacity}>
                <rect x={cutX + cutW + 40} y={cutY + 80} width={150} height={100} fill="#0d1535" stroke="#2ecc71" strokeWidth={1.5} rx={6} />
                <text x={cutX + cutW + 115} y={cutY + 108} textAnchor="middle" fill="#2ecc71" fontSize={12} fontWeight={700}>
                    INSPECCIÓN
                </text>
                <text x={cutX + cutW + 60} y={cutY + 132} fill="#8888aa" fontSize={11}>Penetración: ✓</text>
                <text x={cutX + cutW + 60} y={cutY + 150} fill="#8888aa" fontSize={11}>Continuidad: ✓</text>
                <text x={cutX + cutW + 60} y={cutY + 168} fill="#8888aa" fontSize={11}>Visual: ✓</text>
            </g>

            {/* Danger warning */}
            <g opacity={arcIntensity > 0 ? 0.7 : 0}>
                <text x={480} y={470} textAnchor="middle" fill="#ff4757" fontSize={13} fontWeight={700} letterSpacing={2}>
                    ⚡ RADIACIÓN UV — NO MIRAR DIRECTAMENTE EL ARCO ⚡
                </text>
            </g>
        </svg>
    );
};
