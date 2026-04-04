import React from 'react';
import {
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
    Easing,
} from 'remotion';

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

export type IconAnimation =
    | 'bounce'
    | 'pulse'
    | 'rotate'
    | 'shake'
    | 'float'
    | 'pop'
    | 'glow';

export interface AnimatedIconProps {
    /** Emoji or text icon */
    icon: string;
    /** Size in pixels */
    size?: number;
    /** Animation type */
    animation?: IconAnimation;
    /** Delay before animation starts (frames) */
    delay?: number;
    /** Background color */
    backgroundColor?: string;
    /** Whether to show circular background */
    showBackground?: boolean;
    /** Border radius (defaults to circle) */
    borderRadius?: number | string;
    /** Shadow intensity (0-1) */
    shadowIntensity?: number;
    /** Custom style */
    style?: React.CSSProperties;
}

// ══════════════════════════════════════════════════════════════════════════════
// COLORS
// ══════════════════════════════════════════════════════════════════════════════

const COLORS = {
    primary: '#00A651',
    accent: '#007AFF',
    surface: '#F5F5F7',
    shadow: 'rgba(0, 0, 0, 0.1)',
};

// ══════════════════════════════════════════════════════════════════════════════
// ANIMATION HOOKS
// ══════════════════════════════════════════════════════════════════════════════

const useIconAnimation = (
    animation: IconAnimation,
    delay: number
): React.CSSProperties => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    const adjustedFrame = Math.max(0, frame - delay);

    // Initial appear animation
    const appearProgress = spring({
        frame: adjustedFrame,
        fps,
        config: { damping: 12, stiffness: 150, mass: 0.8 },
    });

    const baseScale = interpolate(appearProgress, [0, 1], [0, 1]);
    const baseOpacity = interpolate(appearProgress, [0, 1], [0, 1]);

    switch (animation) {
        case 'bounce': {
            const bouncePhase = (adjustedFrame % 60) / 60;
            const bounceY = Math.sin(bouncePhase * Math.PI * 2) * 8;
            return {
                transform: `scale(${baseScale}) translateY(${-Math.abs(bounceY)}px)`,
                opacity: baseOpacity,
            };
        }

        case 'pulse': {
            const pulsePhase = (adjustedFrame % 45) / 45;
            const pulseScale = 1 + Math.sin(pulsePhase * Math.PI * 2) * 0.08;
            return {
                transform: `scale(${baseScale * pulseScale})`,
                opacity: baseOpacity,
            };
        }

        case 'rotate': {
            const rotation = interpolate(adjustedFrame, [0, 120], [0, 360], {
                extrapolateRight: 'extend',
            });
            return {
                transform: `scale(${baseScale}) rotate(${rotation % 360}deg)`,
                opacity: baseOpacity,
            };
        }

        case 'shake': {
            const shakePhase = adjustedFrame % 30;
            const shakeX =
                shakePhase < 15
                    ? interpolate(shakePhase, [0, 5, 10, 15], [0, -3, 3, 0])
                    : 0;
            return {
                transform: `scale(${baseScale}) translateX(${shakeX}px)`,
                opacity: baseOpacity,
            };
        }

        case 'float': {
            const floatPhase = (adjustedFrame % 90) / 90;
            const floatY = Math.sin(floatPhase * Math.PI * 2) * 6;
            const floatRotate = Math.sin(floatPhase * Math.PI * 2) * 3;
            return {
                transform: `scale(${baseScale}) translateY(${floatY}px) rotate(${floatRotate}deg)`,
                opacity: baseOpacity,
            };
        }

        case 'pop': {
            const popScale = spring({
                frame: adjustedFrame,
                fps,
                config: { damping: 8, stiffness: 200, mass: 0.5 },
            });
            return {
                transform: `scale(${popScale})`,
                opacity: baseOpacity,
            };
        }

        case 'glow': {
            const glowPhase = (adjustedFrame % 60) / 60;
            const glowIntensity = 0.3 + Math.sin(glowPhase * Math.PI * 2) * 0.2;
            return {
                transform: `scale(${baseScale})`,
                opacity: baseOpacity,
                filter: `drop-shadow(0 0 ${12 * glowIntensity}px currentColor)`,
            };
        }

        default:
            return {
                transform: `scale(${baseScale})`,
                opacity: baseOpacity,
            };
    }
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
    icon,
    size = 64,
    animation = 'pop',
    delay = 0,
    backgroundColor = COLORS.surface,
    showBackground = true,
    borderRadius = '50%',
    shadowIntensity = 0.15,
    style = {},
}) => {
    const animationStyles = useIconAnimation(animation, delay);

    return (
        <div
            style={{
                width: size,
                height: size,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: size * 0.5,
                borderRadius: showBackground ? borderRadius : 0,
                backgroundColor: showBackground ? backgroundColor : 'transparent',
                boxShadow: showBackground
                    ? `0 4px 16px rgba(0, 0, 0, ${shadowIntensity})`
                    : 'none',
                ...animationStyles,
                ...style,
            }}
        >
            {icon}
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// ICON ROW COMPONENT — Multiple icons in a row with stagger
// ══════════════════════════════════════════════════════════════════════════════

export interface IconRowProps {
    icons: Array<{
        icon: string;
        label?: string;
        color?: string;
    }>;
    size?: number;
    gap?: number;
    staggerDelay?: number;
    animation?: IconAnimation;
    style?: React.CSSProperties;
}

export const IconRow: React.FC<IconRowProps> = ({
    icons,
    size = 56,
    gap = 24,
    staggerDelay = 8,
    animation = 'pop',
    style = {},
}) => {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap,
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
                ...style,
            }}
        >
            {icons.map((item, index) => (
                <div
                    key={index}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                    }}
                >
                    <AnimatedIcon
                        icon={item.icon}
                        size={size}
                        animation={animation}
                        delay={index * staggerDelay}
                        backgroundColor={item.color || '#F5F5F7'}
                    />
                    {item.label && (
                        <div
                            style={{
                                fontSize: 12,
                                color: '#86868B',
                                fontWeight: 500,
                                textAlign: 'center',
                                maxWidth: size + 20,
                            }}
                        >
                            {item.label}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// ICON GRID COMPONENT — Icons in a grid layout
// ══════════════════════════════════════════════════════════════════════════════

export interface IconGridProps {
    icons: Array<{
        icon: string;
        label?: string;
        color?: string;
    }>;
    columns?: number;
    size?: number;
    gap?: number;
    staggerDelay?: number;
    animation?: IconAnimation;
    style?: React.CSSProperties;
}

export const IconGrid: React.FC<IconGridProps> = ({
    icons,
    columns = 4,
    size = 48,
    gap = 20,
    staggerDelay = 6,
    animation = 'pop',
    style = {},
}) => {
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap,
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
                ...style,
            }}
        >
            {icons.map((item, index) => (
                <div
                    key={index}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                    }}
                >
                    <AnimatedIcon
                        icon={item.icon}
                        size={size}
                        animation={animation}
                        delay={index * staggerDelay}
                        backgroundColor={item.color || '#F5F5F7'}
                        borderRadius={12}
                    />
                    {item.label && (
                        <div
                            style={{
                                fontSize: 11,
                                color: '#86868B',
                                fontWeight: 500,
                                textAlign: 'center',
                            }}
                        >
                            {item.label}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// PRESET ICON SETS
// ══════════════════════════════════════════════════════════════════════════════

/** EPP Icons */
export const EPP_ICONS = [
    { icon: '⛑️', label: 'Casco', color: '#FFF3E0' },
    { icon: '🥽', label: 'Lentes', color: '#E3F2FD' },
    { icon: '🧤', label: 'Guantes', color: '#F3E5F5' },
    { icon: '👢', label: 'Zapatos', color: '#E8F5E9' },
    { icon: '🦺', label: 'Chaleco', color: '#FFF8E1' },
    { icon: '👂', label: 'Auditivos', color: '#FCE4EC' },
];

/** Safety Icons */
export const SAFETY_ICONS = [
    { icon: '⚠️', label: 'Peligro', color: '#FFF3E0' },
    { icon: '🔒', label: 'Bloqueo', color: '#E3F2FD' },
    { icon: '⚡', label: 'Energía', color: '#FFFDE7' },
    { icon: '🔥', label: 'Fuego', color: '#FFEBEE' },
    { icon: '☣️', label: 'Químico', color: '#F3E5F5' },
    { icon: '✅', label: 'Seguro', color: '#E8F5E9' },
];

/** Tool Icons */
export const TOOL_ICONS = [
    { icon: '🔧', label: 'Llave' },
    { icon: '🔩', label: 'Tornillo' },
    { icon: '⚙️', label: 'Engranaje' },
    { icon: '🛠️', label: 'Herramientas' },
];

export default AnimatedIcon;
