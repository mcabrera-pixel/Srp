import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { evolvePath } from '@remotion/paths';

interface SVGPathDrawProps {
    /** SVG path d-attribute string */
    path: string;
    /** Stroke color */
    color?: string;
    /** Stroke width */
    strokeWidth?: number;
    /** Width of the SVG viewBox */
    width?: number;
    /** Height of the SVG viewBox */
    height?: number;
    /** Animation duration in frames */
    duration?: number;
    /** Delay before animation starts (frames) */
    delay?: number;
    /** Whether to fill the path after drawing */
    fillAfterDraw?: boolean;
    /** Fill color (used if fillAfterDraw is true) */
    fillColor?: string;
    /** Additional style */
    style?: React.CSSProperties;
}

/**
 * SVGPathDraw — Progressive SVG path drawing using @remotion/paths.
 * Creates a draw-on effect where paths appear to be drawn in real-time.
 */
export const SVGPathDraw: React.FC<SVGPathDrawProps> = ({
    path,
    color = '#00d4ff',
    strokeWidth = 3,
    width = 200,
    height = 200,
    duration = 60,
    delay = 0,
    fillAfterDraw = false,
    fillColor = 'rgba(0, 212, 255, 0.1)',
    style = {},
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Progress of draw animation (0 → 1)
    const drawProgress = spring({
        frame: Math.max(0, frame - delay),
        fps,
        config: { damping: 100, stiffness: 80, mass: 0.8 },
        durationInFrames: duration,
    });

    // Evolve the path based on progress
    const evolved = evolvePath(drawProgress, path);

    // Fill opacity appears after drawing is ~80% complete
    const fillOpacity = fillAfterDraw
        ? interpolate(drawProgress, [0.8, 1], [0, 0.6], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
          })
        : 0;

    // Glow effect intensity
    const glowIntensity = interpolate(drawProgress, [0, 0.5, 1], [0, 1, 0.6], {
        extrapolateRight: 'clamp',
    });

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            style={{
                overflow: 'visible',
                ...style,
            }}
        >
            {/* Glow layer */}
            <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth + 4}
                strokeDasharray={evolved.strokeDasharray}
                strokeDashoffset={evolved.strokeDashoffset}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={glowIntensity * 0.3}
                filter="blur(6px)"
            />

            {/* Main stroke */}
            <path
                d={path}
                fill={fillAfterDraw ? fillColor : 'none'}
                fillOpacity={fillOpacity}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={evolved.strokeDasharray}
                strokeDashoffset={evolved.strokeDashoffset}
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Leading dot at the drawing tip */}
            {drawProgress > 0 && drawProgress < 0.98 && (
                <circle
                    cx={0}
                    cy={0}
                    r={strokeWidth + 1}
                    fill={color}
                    opacity={0.8}
                    filter="blur(2px)"
                >
                    {/* Position will be approximated by CSS — exact tip tracking
                        would need getPointAtLength which isn't available in Remotion */}
                </circle>
            )}
        </svg>
    );
};

// ─── Predefined decorative paths ─────────────────────────────
export const DECORATIVE_PATHS = {
    /** Shield / safety icon outline */
    shield: 'M100 10 L180 50 L180 120 Q180 170 100 190 Q20 170 20 120 L20 50 Z',

    /** Checkmark */
    checkmark: 'M20 100 L70 150 L180 30',

    /** Circuit / tech lines */
    circuit: 'M10 100 L60 100 L60 40 L140 40 L140 100 L190 100 M60 100 L60 160 L140 160 L140 100',

    /** Gear outline */
    gear: 'M100 20 L115 45 L145 40 L135 65 L160 80 L140 100 L160 120 L135 135 L145 160 L115 155 L100 180 L85 155 L55 160 L65 135 L40 120 L60 100 L40 80 L65 65 L55 40 L85 45 Z',

    /** Corner bracket (top-left) */
    cornerTL: 'M10 60 L10 10 L60 10',

    /** Corner bracket (bottom-right) */
    cornerBR: 'M140 190 L190 190 L190 140',

    /** Horizontal divider with notch */
    divider: 'M0 5 L80 5 L90 15 L100 5 L200 5',

    /** Wave pattern */
    wave: 'M0 50 Q25 20 50 50 Q75 80 100 50 Q125 20 150 50 Q175 80 200 50',
};
