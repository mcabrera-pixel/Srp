import React from 'react';
import { interpolate, spring } from 'remotion';

interface SceneProps {
    frame: number;
    fps: number;
    durationInFrames: number;
}

/**
 * WBIntroScene — Chalk-drawn grating pattern with escotilla opening.
 * Sets the context: "This is a grating, and we will make a hatch opening in it."
 */
export const WBIntroScene: React.FC<SceneProps> = ({ frame, fps }) => {
    // Grating draws in from center
    const gridReveal = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
    const titleScale = spring({ frame: frame - 20, fps, config: { damping: 15 } });

    // Chalk sketch effect — lines draw with rough stroke
    const chalkOpacity = 0.7;

    // Generate grating bars (chalk style)
    const bars: { x: number; y: number; w: number; h: number; delay: number }[] = [];
    for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 10; col++) {
            const delay = (row + col) * 0.8;
            bars.push({ x: col * 80 + 80, y: row * 60 + 50, w: 65, h: 3, delay });
            bars.push({ x: col * 80 + 80, y: row * 60 + 50, w: 3, h: 48, delay: delay + 0.3 });
        }
    }

    const cx = 480, cy = 260;

    return (
        <svg viewBox="0 0 960 560" width="100%" height="100%">
            <defs>
                {/* Chalk texture filter */}
                <filter id="chalkI">
                    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
                </filter>
            </defs>

            {/* Grating bars — chalk drawn */}
            <g opacity={chalkOpacity} filter="url(#chalkI)">
                {bars.map((bar, i) => {
                    const barProgress = interpolate(frame, [bar.delay, bar.delay + 15], [0, 1], {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp',
                    });
                    return (
                        <rect
                            key={i}
                            x={bar.x}
                            y={bar.y}
                            width={bar.w * barProgress}
                            height={bar.h}
                            fill="#6b5840"
                            rx={1}
                            opacity={barProgress * 0.5}
                        />
                    );
                })}
            </g>

            {/* Escotilla opening — dashed chalk rectangle */}
            <rect
                x={cx - 130}
                y={cy - 85}
                width={260}
                height={170}
                fill="none"
                stroke="#c44a2a"
                strokeWidth={3}
                strokeDasharray="12 6"
                strokeDashoffset={interpolate(frame, [30, 70], [860, 0], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                })}
                opacity={0.8}
                rx={4}
            />

            {/* Fill the cut zone lighter */}
            <rect
                x={cx - 128}
                y={cy - 83}
                width={256}
                height={166}
                fill="#f5f0e8"
                opacity={interpolate(frame, [60, 80], [0, 0.7], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                })}
                rx={3}
            />

            {/* Label: ESCOTILLA */}
            <g transform={`translate(${cx}, ${cy}) scale(${titleScale})`} opacity={titleScale}>
                <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#c44a2a"
                    fontSize={26}
                    fontWeight="800"
                    letterSpacing={5}
                    fontFamily="Georgia, serif"
                >
                    ESCOTILLA
                </text>
                <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    y={30}
                    fill="#8b7355"
                    fontSize={13}
                    letterSpacing={3}
                    fontFamily="Georgia, serif"
                >
                    ZONA DE CORTE
                </text>
            </g>

            {/* Dimension arrows */}
            {gridReveal > 0.7 && (
                <g opacity={interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
                    {/* Horizontal */}
                    <line x1={cx - 130} y1={cy + 108} x2={cx + 130} y2={cy + 108} stroke="#d4883a" strokeWidth={1.5} />
                    <line x1={cx - 130} y1={cy + 103} x2={cx - 130} y2={cy + 113} stroke="#d4883a" strokeWidth={1.5} />
                    <line x1={cx + 130} y1={cy + 103} x2={cx + 130} y2={cy + 113} stroke="#d4883a" strokeWidth={1.5} />
                    <text x={cx} y={cy + 128} textAnchor="middle" fill="#d4883a" fontSize={14} fontWeight={700} fontFamily="Georgia, serif">
                        600 mm
                    </text>

                    {/* Vertical */}
                    <line x1={cx + 155} y1={cy - 85} x2={cx + 155} y2={cy + 85} stroke="#d4883a" strokeWidth={1.5} />
                    <line x1={cx + 150} y1={cy - 85} x2={cx + 160} y2={cy - 85} stroke="#d4883a" strokeWidth={1.5} />
                    <line x1={cx + 150} y1={cy + 85} x2={cx + 160} y2={cy + 85} stroke="#d4883a" strokeWidth={1.5} />
                    <text x={cx + 180} y={cy + 5} textAnchor="middle" fill="#d4883a" fontSize={14} fontWeight={700} fontFamily="Georgia, serif"
                        transform={`rotate(90, ${cx + 180}, ${cy + 5})`}>
                        400 mm
                    </text>
                </g>
            )}

            {/* Pencil drawing cursor */}
            {gridReveal < 0.9 && (
                <g transform={`translate(${80 + gridReveal * 750}, ${50 + gridReveal * 350})`} opacity={0.7}>
                    <line x1={0} y1={0} x2={-8} y2={-20} stroke="#2c1810" strokeWidth={2.5} strokeLinecap="round" />
                    <circle cx={0} cy={0} r={2} fill="#d4883a" />
                </g>
            )}
        </svg>
    );
};
