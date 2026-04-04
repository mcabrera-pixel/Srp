import React from 'react';
import { interpolate, spring } from 'remotion';

interface SceneProps {
    frame: number;
    fps: number;
    durationInFrames: number;
}

export const BisagrasScene: React.FC<SceneProps> = ({ frame, fps }) => {
    // Hinge installation
    const hingeAppear = spring({ frame: frame - 15, fps, config: { damping: 12 } });
    // Hatch opens
    const hatchAngle = interpolate(frame, [80, 130], [0, -55], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    // Chain appears
    const chainOpacity = interpolate(frame, [140, 160], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    const gratingX = 180;
    const gratingY = 100;
    const hatchW = 280;
    const hatchH = 200;
    const hatchX = gratingX + 150;
    const hatchY = gratingY + 80;

    return (
        <svg viewBox="0 0 960 560" width="100%" height="100%">
            <defs>
                <filter id="hingeGlow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Grating base — top-down view */}
            <g opacity={0.5}>
                {Array.from({ length: 7 }).map((_, r) =>
                    Array.from({ length: 10 }).map((_, c) => (
                        <g key={`${r}${c}`}>
                            <rect x={gratingX + c * 60} y={gratingY + r * 55} width={50} height={3} fill="#334" />
                            <rect x={gratingX + c * 60} y={gratingY + r * 55} width={3} height={45} fill="#334" />
                        </g>
                    ))
                )}
            </g>

            {/* Hatch opening in grating */}
            <rect x={hatchX} y={hatchY} width={hatchW} height={hatchH} fill="#0a0a2e" stroke="#556" strokeWidth={2} />

            {/* Frame around opening */}
            <rect x={hatchX - 8} y={hatchY - 8} width={hatchW + 16} height={hatchH + 16} fill="none" stroke="#667" strokeWidth={8} rx={2} />

            {/* Hatch cover (rotates open from top edge) */}
            <g transform={`translate(${hatchX}, ${hatchY})`}>
                <g transform={`rotate(${hatchAngle}, ${hatchW / 2}, 0)`} style={{ transformOrigin: `${hatchW / 2}px 0px` }}>
                    {/* Cover plate */}
                    <rect x={0} y={0} width={hatchW} height={hatchH} fill="#1a2a4a" stroke="#00d4ff" strokeWidth={1.5} rx={2} />
                    {/* Diamond plate texture */}
                    {Array.from({ length: 5 }).map((_, r) =>
                        Array.from({ length: 6 }).map((_, c) => (
                            <text key={`d${r}${c}`} x={20 + c * 46} y={30 + r * 40} fill="#223" fontSize={14} opacity={0.5}>◆</text>
                        ))
                    )}
                    {/* Handle */}
                    <rect x={hatchW / 2 - 30} y={hatchH / 2 - 6} width={60} height={12} rx={6} fill="#556" stroke="#778" strokeWidth={1} />
                </g>
            </g>

            {/* Hinges (on top edge of hatch) */}
            <g opacity={hingeAppear}>
                {[0.25, 0.75].map((pos, i) => (
                    <g key={i} transform={`translate(${hatchX + hatchW * pos}, ${hatchY})`}>
                        {/* Hinge plates */}
                        <rect x={-15} y={-18} width={30} height={14} fill="#888" stroke="#aaa" strokeWidth={1} rx={2} />
                        <rect x={-15} y={4} width={30} height={14} fill="#888" stroke="#aaa" strokeWidth={1} rx={2} />
                        {/* Pin */}
                        <circle cx={0} cy={0} r={5} fill="#aaa" stroke="#ccc" strokeWidth={1} />
                        {/* Bolt holes */}
                        <circle cx={-8} cy={-11} r={2} fill="#556" />
                        <circle cx={8} cy={-11} r={2} fill="#556" />
                        <circle cx={-8} cy={11} r={2} fill="#556" />
                        <circle cx={8} cy={11} r={2} fill="#556" />
                        {/* Label */}
                        <text x={0} y={-25} textAnchor="middle" fill="#ff9f43" fontSize={10} fontWeight={700} filter="url(#hingeGlow)">
                            BISAGRA {i + 1}
                        </text>
                    </g>
                ))}
            </g>

            {/* Safety chain */}
            <g opacity={chainOpacity}>
                {/* Chain from hatch to frame */}
                <path
                    d={`M ${hatchX + hatchW - 20} ${hatchY + hatchH - 20} 
                        Q ${hatchX + hatchW + 40} ${hatchY + hatchH + 40} 
                          ${hatchX + hatchW + 15} ${hatchY + hatchH + 15}`}
                    fill="none"
                    stroke="#f39c12"
                    strokeWidth={3}
                    strokeDasharray="6 4"
                />
                {/* Chain label */}
                <text x={hatchX + hatchW + 60} y={hatchY + hatchH + 10} fill="#f39c12" fontSize={12} fontWeight={700}>
                    CADENA DE
                </text>
                <text x={hatchX + hatchW + 60} y={hatchY + hatchH + 26} fill="#f39c12" fontSize={12} fontWeight={700}>
                    SEGURIDAD
                </text>
            </g>

            {/* Right panel — specs */}
            <g transform="translate(700, 120)" opacity={interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
                <rect x={0} y={0} width={180} height={180} fill="#0d1535" stroke="#334" strokeWidth={1.5} rx={8} />
                <text x={90} y={28} textAnchor="middle" fill="#00d4ff" fontSize={13} fontWeight={700} letterSpacing={1}>ESPECIFICACIONES</text>
                <line x1={15} y1={40} x2={165} y2={40} stroke="#223" strokeWidth={1} />
                <text x={15} y={65} fill="#8888aa" fontSize={12}>Bisagras: 2 ud</text>
                <text x={15} y={88} fill="#8888aa" fontSize={12}>Apertura: 90°</text>
                <text x={15} y={111} fill="#8888aa" fontSize={12}>Cadena: Acero</text>
                <text x={15} y={134} fill="#8888aa" fontSize={12}>Largo: 500mm</text>
                <text x={15} y={160} fill="#2ecc71" fontSize={12} fontWeight={600}>Estado: Funcional ✓</text>
            </g>
        </svg>
    );
};
