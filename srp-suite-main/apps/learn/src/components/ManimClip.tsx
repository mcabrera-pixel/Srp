import React from 'react';
import {
    AbsoluteFill,
    Video,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    staticFile,
    Easing,
} from 'remotion';

interface ManimClipProps {
    /** Path to the Manim-generated .mp4 file (relative to public/) */
    src: string;
    /** Start playback from this second */
    startFrom?: number;
    /** Volume (0-1), default 0 since Manim videos usually have no audio */
    volume?: number;
    /** Apply subtle color grading overlay */
    colorGrade?: boolean;
    /** Color grade tint (hex color) */
    gradeTint?: string;
    /** Grade intensity (0-1) */
    gradeOpacity?: number;
    /** Fade in duration in frames */
    fadeInFrames?: number;
    /** Fade out duration in frames */
    fadeOutFrames?: number;
    /** Scale mode: 'fit' (letterbox), 'cover' (fill), 'contain' */
    scaleMode?: 'fit' | 'cover' | 'contain';
    /** Background color for letterboxing */
    backgroundColor?: string;
    /** Apply subtle zoom animation (Ken Burns effect) */
    kenBurns?: boolean;
    /** Ken Burns zoom range [start, end], e.g., [1.0, 1.05] */
    zoomRange?: [number, number];
    /** Additional style */
    style?: React.CSSProperties;
}

/**
 * ManimClip — Component for embedding Manim-generated videos in Remotion compositions.
 *
 * Features:
 * - Seamless integration of Manim whiteboard animations
 * - Optional color grading to match overall video aesthetic
 * - Configurable fade in/out transitions
 * - Ken Burns zoom effect for added visual interest
 * - Multiple scale modes (fit, cover, contain)
 *
 * Usage:
 * ```tsx
 * <ManimClip
 *   src="manim/intro.mp4"
 *   fadeInFrames={15}
 *   fadeOutFrames={15}
 *   colorGrade={true}
 * />
 * ```
 */
export const ManimClip: React.FC<ManimClipProps> = ({
    src,
    startFrom = 0,
    volume = 0,
    colorGrade = false,
    gradeTint = '#1a1a2e',
    gradeOpacity = 0.08,
    fadeInFrames = 10,
    fadeOutFrames = 10,
    scaleMode = 'cover',
    backgroundColor = '#1a1a2e',
    kenBurns = false,
    zoomRange = [1.0, 1.03],
    style = {},
}) => {
    const frame = useCurrentFrame();
    const { durationInFrames, fps } = useVideoConfig();

    // Calculate opacity for fade in/out
    const opacity = interpolate(
        frame,
        [0, fadeInFrames, durationInFrames - fadeOutFrames, durationInFrames],
        [0, 1, 1, 0],
        {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.ease,
        }
    );

    // Ken Burns zoom effect
    const scale = kenBurns
        ? interpolate(
              frame,
              [0, durationInFrames],
              zoomRange,
              { extrapolateRight: 'clamp' }
          )
        : 1.0;

    // Determine object-fit based on scale mode
    const objectFit: React.CSSProperties['objectFit'] =
        scaleMode === 'fit' ? 'contain' :
        scaleMode === 'cover' ? 'cover' : 'contain';

    return (
        <AbsoluteFill
            style={{
                backgroundColor,
                opacity,
                ...style,
            }}
        >
            {/* Video layer */}
            <Video
                src={staticFile(src)}
                startFrom={Math.round(startFrom * fps)}
                volume={volume}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                }}
            />

            {/* Color grading overlay (optional) */}
            {colorGrade && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: gradeTint,
                        opacity: gradeOpacity,
                        mixBlendMode: 'overlay',
                        pointerEvents: 'none',
                    }}
                />
            )}
        </AbsoluteFill>
    );
};

/**
 * ManimClipWithBorder — Manim clip with decorative border frame.
 *
 * Useful for creating a "presentation within presentation" effect,
 * like showing a whiteboard animation inside a framed area.
 */
interface ManimClipWithBorderProps extends ManimClipProps {
    /** Border color */
    borderColor?: string;
    /** Border width in pixels */
    borderWidth?: number;
    /** Border radius */
    borderRadius?: number;
    /** Padding between border and video */
    padding?: number;
}

export const ManimClipWithBorder: React.FC<ManimClipWithBorderProps> = ({
    borderColor = '#00A651',
    borderWidth = 4,
    borderRadius = 12,
    padding = 20,
    ...manimClipProps
}) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    // Animate border opacity
    const borderOpacity = interpolate(
        frame,
        [0, 15, durationInFrames - 15, durationInFrames],
        [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return (
        <AbsoluteFill
            style={{
                padding,
                backgroundColor: manimClipProps.backgroundColor || '#1a1a2e',
            }}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    border: `${borderWidth}px solid ${borderColor}`,
                    borderRadius,
                    overflow: 'hidden',
                    opacity: borderOpacity,
                    boxShadow: `0 0 30px ${borderColor}40`,
                }}
            >
                <ManimClip
                    {...manimClipProps}
                    fadeInFrames={manimClipProps.fadeInFrames || 20}
                    fadeOutFrames={manimClipProps.fadeOutFrames || 20}
                />
            </div>
        </AbsoluteFill>
    );
};

/**
 * ManimTransition — Animated transition between two Manim clips.
 *
 * Creates a smooth crossfade or wipe transition.
 */
interface ManimTransitionProps {
    /** First clip source */
    srcA: string;
    /** Second clip source */
    srcB: string;
    /** Transition type */
    type?: 'crossfade' | 'wipe-left' | 'wipe-right';
    /** Transition duration in frames */
    transitionFrames?: number;
}

export const ManimTransition: React.FC<ManimTransitionProps> = ({
    srcA,
    srcB,
    type = 'crossfade',
    transitionFrames = 30,
}) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    // Calculate transition progress
    const transitionStart = (durationInFrames - transitionFrames) / 2;
    const transitionEnd = transitionStart + transitionFrames;

    const progress = interpolate(
        frame,
        [transitionStart, transitionEnd],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    if (type === 'crossfade') {
        return (
            <AbsoluteFill>
                <ManimClip
                    src={srcA}
                    fadeInFrames={0}
                    fadeOutFrames={0}
                    style={{ opacity: 1 - progress }}
                />
                <ManimClip
                    src={srcB}
                    fadeInFrames={0}
                    fadeOutFrames={0}
                    style={{ opacity: progress }}
                />
            </AbsoluteFill>
        );
    }

    // Wipe transitions
    const clipPathA = type === 'wipe-left'
        ? `inset(0 ${progress * 100}% 0 0)`
        : `inset(0 0 0 ${progress * 100}%)`;

    const clipPathB = type === 'wipe-left'
        ? `inset(0 0 0 ${(1 - progress) * 100}%)`
        : `inset(0 ${(1 - progress) * 100}% 0 0)`;

    return (
        <AbsoluteFill>
            <div style={{ position: 'absolute', inset: 0, clipPath: clipPathA }}>
                <ManimClip src={srcA} fadeInFrames={0} fadeOutFrames={0} />
            </div>
            <div style={{ position: 'absolute', inset: 0, clipPath: clipPathB }}>
                <ManimClip src={srcB} fadeInFrames={0} fadeOutFrames={0} />
            </div>
        </AbsoluteFill>
    );
};

export default ManimClip;
