import React from 'react';
import {
    AbsoluteFill,
    Video,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    staticFile,
} from 'remotion';

interface AIVideoClipProps {
    /** Path to the .mp4 file (relative to public/) */
    src: string;
    /** Start playback from this second */
    startFrom?: number;
    /** Volume (0-1) */
    volume?: number;
    /** Overlay color grading tint */
    tint?: string;
    /** Tint opacity (0-1) */
    tintOpacity?: number;
    /** Whether to apply a vignette */
    vignette?: boolean;
    /** Fade in duration in frames */
    fadeInFrames?: number;
    /** Fade out duration in frames */
    fadeOutFrames?: number;
    /** Additional style */
    style?: React.CSSProperties;
}

/**
 * AIVideoClip — Wrapper for Minimax/IA-generated .mp4 clips in Remotion.
 * Provides consistent color grading, vignette, and fade transitions
 * so AI clips blend naturally with the rest of the composition.
 */
export const AIVideoClip: React.FC<AIVideoClipProps> = ({
    src,
    startFrom = 0,
    volume = 0,
    tint = '#0a0a2e',
    tintOpacity = 0.15,
    vignette = true,
    fadeInFrames = 15,
    fadeOutFrames = 15,
    style = {},
}) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    // Fade in/out
    const opacity = interpolate(
        frame,
        [0, fadeInFrames, durationInFrames - fadeOutFrames, durationInFrames],
        [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    // Subtle Ken Burns zoom
    const scale = interpolate(
        frame,
        [0, durationInFrames],
        [1.0, 1.06],
        { extrapolateRight: 'clamp' }
    );

    return (
        <AbsoluteFill style={{ opacity, ...style }}>
            {/* Video layer */}
            <Video
                src={staticFile(src)}
                startFrom={Math.round(startFrom * 30)}
                volume={volume}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: `scale(${scale})`,
                }}
            />

            {/* Color grading tint */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: tint,
                    opacity: tintOpacity,
                    mixBlendMode: 'multiply',
                }}
            />

            {/* Vignette overlay */}
            {vignette && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
                    }}
                />
            )}
        </AbsoluteFill>
    );
};
