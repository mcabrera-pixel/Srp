import React from 'react';
import {
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
} from 'remotion';
import { EPP_ICONS, EPP_LABELS } from '../icons/epp';
import type { EPPType } from '../types';

interface EPPBarProps {
    epp: EPPType[];
    /** Tamaño de cada icono */
    iconSize?: number;
}

export const EPPBar: React.FC<EPPBarProps> = ({ epp, iconSize = 36 }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    if (!epp || epp.length === 0) return null;

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 20px',
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(10px)',
                borderRadius: 16,
                border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
        >
            {/* Label */}
            <span
                style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'rgba(255, 255, 255, 0.6)',
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    marginRight: 8,
                    whiteSpace: 'nowrap',
                }}
            >
                EPP Requerido
            </span>

            {/* Divider */}
            <div
                style={{
                    width: 1,
                    height: 30,
                    background: 'rgba(255, 255, 255, 0.2)',
                    marginRight: 4,
                }}
            />

            {/* Icons */}
            {epp.map((item, index) => {
                const IconComponent = EPP_ICONS[item];
                if (!IconComponent) return null;

                // Staggered entry animation
                const delay = index * 4;
                const progress = spring({
                    frame: frame - delay,
                    fps,
                    config: { damping: 80, stiffness: 260, mass: 0.4 },
                });

                const scale = interpolate(progress, [0, 1], [0.3, 1]);
                const opacity = interpolate(progress, [0, 1], [0, 1]);
                const translateY = interpolate(progress, [0, 1], [15, 0]);

                return (
                    <div
                        key={item}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4,
                            transform: `scale(${scale}) translateY(${translateY}px)`,
                            opacity,
                        }}
                        title={EPP_LABELS[item]}
                    >
                        <div
                            style={{
                                padding: 6,
                                borderRadius: 10,
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <IconComponent
                                size={iconSize}
                                color="#ffffff"
                            />
                        </div>
                        <span
                            style={{
                                fontSize: 9,
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                            }}
                        >
                            {EPP_LABELS[item] || item}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};
