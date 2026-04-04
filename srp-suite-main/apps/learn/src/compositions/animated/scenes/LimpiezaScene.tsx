import React from 'react';
import { interpolate, spring } from 'remotion';

interface SceneProps {
    frame: number;
    fps: number;
    durationInFrames: number;
}

const CLEANUP_ITEMS = [
    { icon: '🗑️', label: 'Retirar residuos de corte y soldadura', done: false },
    { icon: '🔧', label: 'Almacenar herramientas en lugar designado', done: false },
    { icon: '🔥', label: 'Verificar: sin fuentes de calor activas', done: false },
    { icon: '✅', label: 'Zona de trabajo en condiciones seguras', done: false },
];

export const LimpiezaScene: React.FC<SceneProps> = ({ frame, fps }) => {
    // Workshop area (top-down view)
    const areaOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

    return (
        <svg viewBox="0 0 960 560" width="100%" height="100%">
            {/* Workshop floor */}
            <g opacity={areaOpacity}>
                <rect x={60} y={50} width={500} height={400} fill="#0d1535" stroke="#334" strokeWidth={2} rx={6} />
                <text x={310} y={35} textAnchor="middle" fill="#556" fontSize={12} letterSpacing={2}>ZONA DE TRABAJO</text>
            </g>

            {/* Debris items that disappear */}
            {[
                { x: 120, y: 150, label: '🔩' },
                { x: 250, y: 200, label: '⚡' },
                { x: 180, y: 300, label: '🔩' },
                { x: 380, y: 180, label: '💥' },
                { x: 300, y: 350, label: '🔩' },
                { x: 450, y: 280, label: '💫' },
            ].map((item, i) => {
                const disappearFrame = 30 + i * 15;
                const opacity = interpolate(frame, [disappearFrame, disappearFrame + 10], [0.7, 0], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                });
                return (
                    <text
                        key={i}
                        x={item.x}
                        y={item.y}
                        fontSize={20}
                        opacity={opacity}
                        transform={`translate(0, ${interpolate(opacity, [0.7, 0], [0, -20])})`}
                    >
                        {item.label}
                    </text>
                );
            })}

            {/* Tools moving to storage */}
            {[
                { x: 200, y: 250, targetX: 680, targetY: 120 },
                { x: 350, y: 150, targetX: 680, targetY: 180 },
                { x: 420, y: 330, targetX: 680, targetY: 240 },
            ].map((tool, i) => {
                const moveStart = 60 + i * 25;
                const moveProgress = interpolate(frame, [moveStart, moveStart + 30], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                });
                const currentX = interpolate(moveProgress, [0, 1], [tool.x, tool.targetX]);
                const currentY = interpolate(moveProgress, [0, 1], [tool.y, tool.targetY]);
                const icons = ['🔧', '🔨', '⚙️'];
                const toolOpacity = interpolate(frame, [5, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

                return (
                    <text key={i} x={currentX} y={currentY} fontSize={24} opacity={toolOpacity}>
                        {icons[i]}
                    </text>
                );
            })}

            {/* Storage cabinet */}
            <g opacity={areaOpacity}>
                <rect x={640} y={80} width={120} height={200} fill="#0d1535" stroke="#2ecc71" strokeWidth={2} rx={6} />
                <text x={700} y={65} textAnchor="middle" fill="#2ecc71" fontSize={11} letterSpacing={2}>ALMACÉN</text>
                {/* Shelves */}
                <line x1={650} y1={140} x2={750} y2={140} stroke="#334" strokeWidth={1} />
                <line x1={650} y1={200} x2={750} y2={200} stroke="#334" strokeWidth={1} />
                <line x1={650} y1={260} x2={750} y2={260} stroke="#334" strokeWidth={1} />
            </g>

            {/* Right side checklist */}
            {CLEANUP_ITEMS.map((item, i) => {
                const delay = 50 + i * 25;
                const checked = spring({ frame: frame - delay - 15, fps, config: { damping: 10 } });
                const y = 340 + i * 50;

                return (
                    <g key={i} opacity={interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
                        {/* Checkbox */}
                        <rect x={600} y={y} width={24} height={24} rx={4} fill={checked > 0.1 ? '#2ecc7122' : 'transparent'} stroke={checked > 0.1 ? '#2ecc71' : '#445'} strokeWidth={1.5} />
                        {checked > 0.1 && (
                            <path
                                d={`M ${605} ${y + 12} L ${609} ${y + 18} L ${620} ${y + 6}`}
                                fill="none"
                                stroke="#2ecc71"
                                strokeWidth={2.5}
                                strokeLinecap="round"
                                opacity={checked}
                            />
                        )}
                        <text x={635} y={y + 17} fill={checked > 0.1 ? 'white' : '#8888aa'} fontSize={13} fontWeight={checked > 0.1 ? 600 : 400}>
                            {item.label}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};
