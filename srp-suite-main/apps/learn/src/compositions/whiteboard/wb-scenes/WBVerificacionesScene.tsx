import React from 'react';
import { interpolate } from 'remotion';

interface SceneProps {
    frame: number;
    fps: number;
    durationInFrames: number;
}

/**
 * WBVerificacionesScene — Clipboard with checklist items ticked off one by one.
 */
export const WBVerificacionesScene: React.FC<SceneProps> = ({ frame }) => {
    const checkItems = [
        { text: 'Aviso y Orden de Trabajo', drawFrame: 15 },
        { text: 'Permisos de Trabajo', drawFrame: 45 },
        { text: 'Inspección Visual del Área', drawFrame: 75 },
        { text: 'Reunión de Seguridad', drawFrame: 105 },
        { text: 'Tarjeta Verde Verificada', drawFrame: 135 },
        { text: 'ART con Todas las Firmas', drawFrame: 165 },
    ];

    // Clipboard draws in
    const clipOpacity = interpolate(frame, [0, 15], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const clipDraw = interpolate(frame, [0, 20], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    return (
        <svg viewBox="0 0 960 520" width="100%" height="100%">
            <defs>
                <filter id="chalkV">
                    <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
                </filter>
            </defs>

            {/* Clipboard body */}
            <g opacity={clipOpacity} filter="url(#chalkV)">
                {/* Board */}
                <rect
                    x={280}
                    y={30}
                    width={400}
                    height={460}
                    fill="none"
                    stroke="#8b7355"
                    strokeWidth={3}
                    rx={8}
                    strokeDasharray="1800"
                    strokeDashoffset={interpolate(clipDraw, [0, 1], [1800, 0])}
                />
                {/* Clip at top */}
                <rect x={430} y={15} width={100} height={30} fill="none" stroke="#8b7355" strokeWidth={2.5} rx={5}
                    strokeDasharray="260"
                    strokeDashoffset={interpolate(clipDraw, [0, 1], [260, 0])}
                />
                {/* Circle hole */}
                <circle cx={480} cy={30} r={6} fill="none" stroke="#8b7355" strokeWidth={2} />

                {/* Title */}
                <text x={480} y={85} textAnchor="middle" fill="#2c1810" fontSize={16} fontWeight={700} fontFamily="Georgia, serif" letterSpacing={3}
                    opacity={interpolate(frame, [15, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
                    VERIFICACIONES PREVIAS
                </text>
                <line x1={340} y1={95} x2={620} y2={95} stroke="#c4a882" strokeWidth={1.5} opacity={0.5} />
            </g>

            {/* Check items */}
            {checkItems.map((item, i) => {
                const itemOpacity = interpolate(frame, [item.drawFrame, item.drawFrame + 12], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                });
                const checkDraw = interpolate(frame, [item.drawFrame + 8, item.drawFrame + 18], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                });
                const yPos = 130 + i * 62;

                return (
                    <g key={i} opacity={itemOpacity}>
                        {/* Checkbox */}
                        <rect
                            x={310}
                            y={yPos}
                            width={22}
                            height={22}
                            fill="none"
                            stroke="#8b7355"
                            strokeWidth={2}
                            rx={3}
                        />

                        {/* Checkmark inside */}
                        <path
                            d={`M ${315} ${yPos + 12} L ${319} ${yPos + 18} L ${328} ${yPos + 5}`}
                            fill="none"
                            stroke="#2c6b3f"
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            strokeDasharray="30"
                            strokeDashoffset={interpolate(checkDraw, [0, 1], [30, 0])}
                        />

                        {/* Text */}
                        <text
                            x={345}
                            y={yPos + 16}
                            fill="#4a3828"
                            fontSize={16}
                            fontFamily="Georgia, serif"
                            opacity={itemOpacity}
                        >
                            {item.text}
                        </text>

                        {/* Underline */}
                        <line
                            x1={345}
                            y1={yPos + 25}
                            x2={345 + item.text.length * 8.5}
                            y2={yPos + 25}
                            stroke="#c4a882"
                            strokeWidth={0.8}
                            opacity={itemOpacity * 0.3}
                        />
                    </g>
                );
            })}

            {/* Pen icon on current item */}
            {checkItems.map((item, i) => {
                const isWriting = frame >= item.drawFrame && frame < item.drawFrame + 15;
                if (!isWriting) return null;
                const yPos = 130 + i * 62;
                return (
                    <g key={`pen-${i}`} transform={`translate(${345 + ((frame - item.drawFrame) / 15) * item.text.length * 8.5}, ${yPos + 10})`}>
                        <line x1={0} y1={0} x2={5} y2={-14} stroke="#2c1810" strokeWidth={2} strokeLinecap="round" />
                        <circle cx={0} cy={0} r={1.5} fill="#d4883a" />
                    </g>
                );
            })}

            {/* "All verified" stamp */}
            <g opacity={interpolate(frame, [210, 240], [0, 0.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
                transform={`translate(480, 300) rotate(-12)`}>
                <rect x={-80} y={-25} width={160} height={50} fill="none" stroke="#2c6b3f" strokeWidth={3} rx={6} />
                <text textAnchor="middle" y={7} fill="#2c6b3f" fontSize={20} fontWeight={800} fontFamily="Georgia, serif" letterSpacing={4}>
                    ✓ LISTO
                </text>
            </g>
        </svg>
    );
};
