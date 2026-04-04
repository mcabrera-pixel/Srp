import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { noise2D } from '@remotion/noise';

interface NoiseBackgroundProps {
    /** Base color in hex, e.g. '#0a0a2e' */
    baseColor?: string;
    /** Accent color for the gradient pulse, e.g. '#00d4ff' */
    accentColor?: string;
    /** Overall opacity of the noise layer (0-1) */
    opacity?: number;
    /** Animation speed multiplier */
    speed?: number;
    /** Style variant */
    variant?: 'dark' | 'light' | 'blueprint';
}

/**
 * NoiseBackground — Procedural animated noise background.
 * Uses @remotion/noise to create dynamic, evolving backgrounds
 * that look more professional than flat solid colors.
 */
export const NoiseBackground: React.FC<NoiseBackgroundProps> = ({
    baseColor = '#0a0a2e',
    accentColor = '#00d4ff',
    opacity = 0.12,
    speed = 1,
    variant = 'dark',
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const time = (frame / fps) * speed;

    // Generate noise-driven values for subtle gradient animation
    const gradientX = interpolate(noise2D('gx', time * 0.3, 0), [-1, 1], [30, 70]);
    const gradientY = interpolate(noise2D('gy', 0, time * 0.3), [-1, 1], [30, 70]);
    const pulseIntensity = interpolate(noise2D('pi', time * 0.5, time * 0.5), [-1, 1], [0.02, 0.08]);

    // Helper: convert float intensity to 2-digit hex
    const toHex = (val: number) => Math.min(255, Math.max(0, Math.round(val * 255))).toString(16).padStart(2, '0');

    const presets = {
        dark: {
            bg: baseColor,
            grad1: `radial-gradient(ellipse at ${gradientX}% ${gradientY}%, ${accentColor}${toHex(pulseIntensity)} 0%, transparent 60%)`,
            grad2: `radial-gradient(ellipse at ${100 - gradientX}% ${100 - gradientY}%, #f39c12${toHex(pulseIntensity * 0.5)} 0%, transparent 50%)`,
        },
        light: {
            bg: '#f5f0e8',
            grad1: `radial-gradient(ellipse at ${gradientX}% ${gradientY}%, #ddd5c5${toHex(pulseIntensity * 3)} 0%, transparent 60%)`,
            grad2: `radial-gradient(ellipse at ${100 - gradientX}% ${100 - gradientY}%, #c4b89a${toHex(pulseIntensity * 2)} 0%, transparent 50%)`,
        },
        blueprint: {
            bg: '#0a0a2e',
            grad1: `radial-gradient(ellipse at ${gradientX}% ${gradientY}%, #00d4ff08 0%, transparent 60%)`,
            grad2: `radial-gradient(ellipse at ${100 - gradientX}% ${100 - gradientY}%, #0066ff06 0%, transparent 50%)`,
        },
    };

    const preset = presets[variant];

    // Floating particle positions driven by noise
    const cells: { x: number; y: number; size: number; alpha: number }[] = [];
    const cellCount = 12;
    for (let i = 0; i < cellCount; i++) {
        const nx = noise2D('cx' + i, i * 0.7, time * 0.2);
        const ny = noise2D('cy' + i, time * 0.2, i * 0.7);
        cells.push({
            x: interpolate(nx, [-1, 1], [0, 1920]),
            y: interpolate(ny, [-1, 1], [0, 1080]),
            size: interpolate(noise2D('cs' + i, i, time * 0.1), [-1, 1], [2, 6]),
            alpha: interpolate(noise2D('ca' + i, time * 0.3, i * 1.5), [-1, 1], [0, opacity]),
        });
    }

    return (
        <AbsoluteFill>
            {/* Base solid color */}
            <div style={{ position: 'absolute', inset: 0, backgroundColor: preset.bg }} />

            {/* Animated gradient layer 1 */}
            <div style={{ position: 'absolute', inset: 0, background: preset.grad1 }} />

            {/* Animated gradient layer 2 */}
            <div style={{ position: 'absolute', inset: 0, background: preset.grad2 }} />

            {/* Subtle floating particles driven by noise */}
            <svg
                width="1920"
                height="1080"
                style={{ position: 'absolute', inset: 0, opacity: opacity * 2 }}
            >
                {cells.map((cell, i) => (
                    <circle
                        key={i}
                        cx={cell.x}
                        cy={cell.y}
                        r={cell.size}
                        fill={accentColor}
                        opacity={cell.alpha}
                    />
                ))}
            </svg>

            {/* Subtle vignette overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)',
            }} />
        </AbsoluteFill>
    );
};
