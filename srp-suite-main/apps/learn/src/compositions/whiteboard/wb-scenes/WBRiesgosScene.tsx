import React from 'react';
import { interpolate } from 'remotion';

interface SceneProps {
    frame: number;
    fps: number;
    durationInFrames: number;
}

/**
 * WBRiesgosScene — Warning triangle with 6 risks radiating outward like a mind-map.
 */
export const WBRiesgosScene: React.FC<SceneProps> = ({ frame }) => {
    const risks = [
        { label: 'INCENDIO', control: 'EPP cuero + biombos', angle: -60, color: '#c44a2a', icon: '🔥', drawFrame: 40 },
        { label: 'ELÉCTRICO', control: 'Tableros autorizados', angle: 0, color: '#d4883a', icon: '⚡', drawFrame: 100 },
        { label: 'PARTÍCULAS', control: 'Máscara facial', angle: 60, color: '#8b7355', icon: '💥', drawFrame: 160 },
        { label: 'ATRAPAMIENTO', control: 'Guardas ok · No ropa suelta', angle: 120, color: '#6b5840', icon: '⚙️', drawFrame: 240 },
        { label: 'CAÍDA ALTURA', control: 'Arnés + check-list', angle: 180, color: '#c44a2a', icon: '⬇️', drawFrame: 320 },
        { label: 'SOBREESFUERZO', control: 'Máx 25 kg · Ayuda mecánica', angle: 240, color: '#2c6b3f', icon: '💪', drawFrame: 400 },
    ];

    const cx = 480, cy = 230;
    const radius = 180;

    // Central triangle draws
    const triDraw = interpolate(frame, [0, 35], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    return (
        <svg viewBox="0 0 960 480" width="100%" height="100%">
            <defs>
                <filter id="chalkR">
                    <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
                </filter>
            </defs>

            {/* Central warning triangle */}
            <g filter="url(#chalkR)">
                <path
                    d={`M ${cx} ${cy - 50} L ${cx - 45} ${cy + 25} L ${cx + 45} ${cy + 25} Z`}
                    fill="none"
                    stroke="#c44a2a"
                    strokeWidth={3.5}
                    strokeLinejoin="round"
                    strokeDasharray="300"
                    strokeDashoffset={interpolate(triDraw, [0, 1], [300, 0])}
                />
                {/* Exclamation mark */}
                <text
                    x={cx}
                    y={cy + 5}
                    textAnchor="middle"
                    fill="#c44a2a"
                    fontSize={32}
                    fontWeight={800}
                    fontFamily="Georgia, serif"
                    opacity={triDraw}
                >
                    !
                </text>
            </g>

            {/* "RIESGOS" label */}
            <text
                x={cx}
                y={cy + 55}
                textAnchor="middle"
                fill="#c44a2a"
                fontSize={13}
                fontWeight={700}
                fontFamily="Georgia, serif"
                letterSpacing={4}
                opacity={interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
            >
                RIESGOS CRÍTICOS
            </text>

            {/* Risk items radiating outward */}
            {risks.map((risk, i) => {
                const riskProgress = interpolate(frame, [risk.drawFrame, risk.drawFrame + 25], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                });

                const rad = (risk.angle * Math.PI) / 180;
                const nodeX = cx + Math.cos(rad) * radius;
                const nodeY = cy + Math.sin(rad) * radius;

                // Line from center to node
                const lineEndX = cx + Math.cos(rad) * (radius * riskProgress);
                const lineEndY = cy + Math.sin(rad) * (radius * riskProgress);

                return (
                    <g key={i}>
                        {/* Connection line */}
                        <line
                            x1={cx + Math.cos(rad) * 50}
                            y1={cy + Math.sin(rad) * 50}
                            x2={lineEndX}
                            y2={lineEndY}
                            stroke={risk.color}
                            strokeWidth={1.5}
                            strokeDasharray="5 3"
                            opacity={riskProgress * 0.6}
                        />

                        {/* Node circle */}
                        <circle
                            cx={nodeX}
                            cy={nodeY}
                            r={28}
                            fill="none"
                            stroke={risk.color}
                            strokeWidth={2}
                            opacity={riskProgress}
                            strokeDasharray="176"
                            strokeDashoffset={interpolate(riskProgress, [0, 1], [176, 0])}
                        />

                        {/* Icon */}
                        <text
                            x={nodeX}
                            y={nodeY + 6}
                            textAnchor="middle"
                            fontSize={22}
                            opacity={riskProgress}
                        >
                            {risk.icon}
                        </text>

                        {/* Risk label */}
                        <text
                            x={nodeX}
                            y={nodeY + 45}
                            textAnchor="middle"
                            fill={risk.color}
                            fontSize={10}
                            fontWeight={700}
                            fontFamily="Georgia, serif"
                            letterSpacing={1}
                            opacity={riskProgress}
                        >
                            {risk.label}
                        </text>

                        {/* Control measure */}
                        <text
                            x={nodeX}
                            y={nodeY + 58}
                            textAnchor="middle"
                            fill="#8b7355"
                            fontSize={9}
                            fontFamily="Georgia, serif"
                            opacity={riskProgress * 0.8}
                        >
                            {risk.control}
                        </text>
                    </g>
                );
            })}

            {/* Pulsing warning glow behind triangle */}
            <circle
                cx={cx}
                cy={cy}
                r={40 + Math.sin(frame * 0.08) * 8}
                fill="none"
                stroke="#c44a2a"
                strokeWidth={1}
                opacity={Math.sin(frame * 0.08) * 0.15 + 0.1}
            />
        </svg>
    );
};
