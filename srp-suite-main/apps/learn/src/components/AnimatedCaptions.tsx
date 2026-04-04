import React from 'react';
import {
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
} from 'remotion';

interface AnimatedCaptionsProps {
    /** The text to display as captions */
    text: string;
    /** Style variant for the captions */
    variant?: 'default' | 'highlight' | 'minimal' | 'banner';
    /** Font size in px */
    fontSize?: number;
    /** Position on screen */
    position?: 'bottom' | 'center' | 'top';
    /** Accent color for highlights */
    accentColor?: string;
    /** Words per group for animation timing */
    wordsPerGroup?: number;
    /** Start delay in frames before captions begin */
    startDelay?: number;
}

/**
 * AnimatedCaptions — Animated subtitle/caption overlay.
 * Displays text word-by-word with smooth reveal animations.
 * Designed to sync with TTS narration for explainer videos.
 */
export const AnimatedCaptions: React.FC<AnimatedCaptionsProps> = ({
    text,
    variant = 'default',
    fontSize = 36,
    position = 'bottom',
    accentColor = '#00d4ff',
    wordsPerGroup = 4,
    startDelay = 10,
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    if (!text) return null;

    // Split text into words
    const words = text.replace(/\n/g, ' ').split(/\s+/).filter(Boolean);
    const totalWords = words.length;

    // Calculate timing: how many frames per word group
    const availableFrames = durationInFrames - startDelay - 15; // leave 15 frames at end for fade out
    const totalGroups = Math.ceil(totalWords / wordsPerGroup);
    const framesPerGroup = Math.max(15, Math.floor(availableFrames / totalGroups));

    // Determine which word group is currently active
    const adjustedFrame = Math.max(0, frame - startDelay);
    const currentGroupIndex = Math.min(
        totalGroups - 1,
        Math.floor(adjustedFrame / framesPerGroup)
    );

    // Get the words for the current group
    const groupStart = currentGroupIndex * wordsPerGroup;
    const groupEnd = Math.min(groupStart + wordsPerGroup, totalWords);
    const currentWords = words.slice(groupStart, groupEnd);

    // Animation within the group
    const groupFrame = adjustedFrame - currentGroupIndex * framesPerGroup;

    // Entrance animation
    const enterProgress = spring({
        frame: groupFrame,
        fps,
        config: { damping: 100, stiffness: 300, mass: 0.4 },
    });

    // Fade out at end of video
    const fadeOut = interpolate(
        frame,
        [durationInFrames - 15, durationInFrames],
        [1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    // Don't show before start delay
    if (frame < startDelay) return null;

    const positionStyles: Record<string, React.CSSProperties> = {
        bottom: { bottom: 80, left: 0, right: 0 },
        center: { top: '50%', left: 0, right: 0, transform: 'translateY(-50%)' },
        top: { top: 80, left: 0, right: 0 },
    };

    const variantStyles: Record<string, {
        container: React.CSSProperties;
        text: React.CSSProperties;
    }> = {
        default: {
            container: {
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(10px)',
                padding: '16px 32px',
                borderRadius: 12,
                maxWidth: '80%',
                margin: '0 auto',
            },
            text: {
                color: 'white',
                fontSize,
                fontWeight: 600,
                textAlign: 'center' as const,
                lineHeight: 1.4,
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            },
        },
        highlight: {
            container: {
                padding: '16px 32px',
                maxWidth: '85%',
                margin: '0 auto',
            },
            text: {
                color: 'white',
                fontSize: fontSize * 1.1,
                fontWeight: 800,
                textAlign: 'center' as const,
                lineHeight: 1.4,
                textShadow: `0 0 20px ${accentColor}60, 0 2px 10px rgba(0,0,0,0.8)`,
            },
        },
        minimal: {
            container: {
                padding: '12px 24px',
                maxWidth: '70%',
                margin: '0 auto',
            },
            text: {
                color: 'rgba(255,255,255,0.9)',
                fontSize: fontSize * 0.85,
                fontWeight: 400,
                textAlign: 'center' as const,
                lineHeight: 1.5,
                letterSpacing: 0.5,
            },
        },
        banner: {
            container: {
                background: `linear-gradient(135deg, ${accentColor}dd, ${accentColor}99)`,
                padding: '20px 40px',
                maxWidth: '90%',
                margin: '0 auto',
                borderRadius: 8,
                boxShadow: `0 8px 32px ${accentColor}40`,
            },
            text: {
                color: 'white',
                fontSize,
                fontWeight: 700,
                textAlign: 'center' as const,
                lineHeight: 1.3,
            },
        },
    };

    const styles = variantStyles[variant];

    return (
        <div
            style={{
                position: 'absolute',
                ...positionStyles[position],
                display: 'flex',
                justifyContent: 'center',
                zIndex: 50,
                opacity: fadeOut,
            }}
        >
            <div
                style={{
                    ...styles.container,
                    opacity: enterProgress,
                    transform: `translateY(${interpolate(enterProgress, [0, 1], [15, 0])}px)`,
                }}
            >
                {/* Per-word animation */}
                <div style={{ ...styles.text, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 8px' }}>
                    {currentWords.map((word, i) => {
                        const wordDelay = i * 3; // 3 frames stagger per word
                        const wordOpacity = interpolate(
                            groupFrame,
                            [wordDelay, wordDelay + 8],
                            [0, 1],
                            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                        );
                        const wordScale = interpolate(
                            groupFrame,
                            [wordDelay, wordDelay + 8],
                            [0.85, 1],
                            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                        );
                        return (
                            <span
                                key={`${currentGroupIndex}-${i}`}
                                style={{
                                    opacity: wordOpacity,
                                    transform: `scale(${wordScale})`,
                                    display: 'inline-block',
                                }}
                            >
                                {word}
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
