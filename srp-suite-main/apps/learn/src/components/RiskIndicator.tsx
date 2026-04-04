import React from 'react';
import {
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
} from 'remotion';
import type { RiskLevel } from '../types';

interface RiskIndicatorProps {
    level: RiskLevel;
    size?: number;
}

const RISK_CONFIG: Record<
    RiskLevel,
    { color: string; label: string; emoji: string; pulse: boolean }
> = {
    bajo: {
        color: '#2ecc71',
        label: 'BAJO',
        emoji: '🟢',
        pulse: false,
    },
    medio: {
        color: '#f1c40f',
        label: 'MEDIO',
        emoji: '🟡',
        pulse: false,
    },
    alto: {
        color: '#e67e22',
        label: 'ALTO',
        emoji: '🟠',
        pulse: true,
    },
    critico: {
        color: '#e74c3c',
        label: 'CRÍTICO',
        emoji: '🔴',
        pulse: true,
    },
};

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({
    level,
    size = 1,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const config = RISK_CONFIG[level];

    const entryProgress = spring({
        frame,
        fps,
        config: { damping: 80, stiffness: 200, mass: 0.5 },
    });

    // Pulso para riesgos altos/críticos
    const pulseScale = config.pulse
        ? 1 + 0.05 * Math.sin(frame * 0.15)
        : 1;

    const pulseOpacity = config.pulse
        ? interpolate(Math.sin(frame * 0.1), [-1, 1], [0.7, 1])
        : 1;

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10 * size,
                padding: `${8 * size}px ${16 * size}px`,
                borderRadius: 12 * size,
                background: `${config.color}18`,
                border: `2px solid ${config.color}60`,
                transform: `scale(${entryProgress * pulseScale})`,
                opacity: entryProgress * pulseOpacity,
            }}
        >
            {/* Dot indicator */}
            <div
                style={{
                    width: 12 * size,
                    height: 12 * size,
                    borderRadius: '50%',
                    background: config.color,
                    boxShadow: config.pulse
                        ? `0 0 ${10 * size}px ${config.color}80`
                        : 'none',
                }}
            />
            {/* Risk shield icon */}
            <svg
                width={24 * size}
                height={24 * size}
                viewBox="0 0 24 24"
                fill="none"
            >
                <path
                    d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
                    fill={config.color}
                    opacity={0.3}
                />
                <path
                    d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
                    stroke={config.color}
                    strokeWidth={1.5}
                    fill="none"
                />
                {level === 'critico' && (
                    <text
                        x="12"
                        y="16"
                        textAnchor="middle"
                        fontSize="14"
                        fontWeight="bold"
                        fill={config.color}
                    >
                        !
                    </text>
                )}
                {level === 'alto' && (
                    <text
                        x="12"
                        y="16"
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="bold"
                        fill={config.color}
                    >
                        ⚠
                    </text>
                )}
            </svg>
            {/* Label */}
            <span
                style={{
                    fontSize: 14 * size,
                    fontWeight: 700,
                    color: config.color,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                }}
            >
                Riesgo {config.label}
            </span>
        </div>
    );
};
