import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
} from 'remotion';

interface WhiteboardIntroProps {
    titulo: string;
    subtitulo?: string;
    metadata?: {
        version: string;
        fecha_vigencia: string;
        normativa: string[];
    };
}

export const WhiteboardIntro: React.FC<WhiteboardIntroProps> = ({
    titulo,
    subtitulo,
    metadata,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Board "appears" with slight scale
    const boardScale = spring({
        frame,
        fps,
        config: { damping: 30, stiffness: 120, mass: 0.8 },
    });

    // Title writes in character by character
    const titleChars = titulo.length;
    const titleReveal = interpolate(frame, [20, 20 + titleChars * 2], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const visibleTitle = titulo.slice(0, Math.floor(titleReveal * titleChars));

    // Subtitle fade
    const subtitleOpacity = interpolate(frame, [60, 80], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Decorative line draws
    const lineWidth = interpolate(frame, [80, 120], [0, 400], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Metadata
    const metaOpacity = interpolate(frame, [110, 140], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Chalk dust particles
    const dustParticles = Array.from({ length: 12 }).map((_, i) => {
        const startFrame = 20 + i * 4;
        const age = Math.max(0, frame - startFrame);
        const x = 960 + (i % 5 - 2) * 80 + Math.sin(i * 3.7) * 60;
        const y = 400 + age * 1.5 + Math.sin(age * 0.1 + i) * 10;
        const opacity = Math.max(0, 0.5 - age / 80);
        const size = 2 + (i % 3);
        return { x, y, opacity, size };
    });

    return (
        <AbsoluteFill
            style={{
                backgroundColor: '#f5f0e8',
                justifyContent: 'center',
                alignItems: 'center',
                transform: `scale(${boardScale})`,
            }}
        >
            {/* Paper texture — subtle grid */}
            <svg
                width="100%"
                height="100%"
                style={{ position: 'absolute', opacity: 0.06 }}
            >
                <defs>
                    <pattern id="wbGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#8b7355" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#wbGrid)" />
            </svg>

            {/* Board frame */}
            <div
                style={{
                    position: 'absolute',
                    inset: 20,
                    border: '4px solid #c4a882',
                    borderRadius: 8,
                    boxShadow: 'inset 0 0 60px rgba(139,115,85,0.1)',
                }}
            />

            {/* Chalk tray at bottom */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 16,
                    left: 100,
                    right: 100,
                    height: 8,
                    backgroundColor: '#c4a882',
                    borderRadius: 4,
                    opacity: 0.6,
                }}
            />

            {/* SRP LEARN branding — chalk style */}
            <div
                style={{
                    position: 'absolute',
                    top: 50,
                    left: 60,
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#8b7355',
                    letterSpacing: 4,
                    opacity: metaOpacity,
                    fontFamily: 'Georgia, serif',
                }}
            >
                SRP LEARN
            </div>

            {/* Title — handwritten effect */}
            <h1
                style={{
                    fontSize: 68,
                    fontWeight: 800,
                    textAlign: 'center',
                    marginBottom: 16,
                    color: '#2c1810',
                    fontFamily: 'Georgia, serif',
                    letterSpacing: 2,
                    textShadow: '2px 2px 0px rgba(139,115,85,0.15)',
                    minHeight: 80,
                }}
            >
                {visibleTitle}
                {titleReveal < 1 && (
                    <span
                        style={{
                            display: 'inline-block',
                            width: 3,
                            height: 60,
                            backgroundColor: '#c4a882',
                            marginLeft: 4,
                            opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                        }}
                    />
                )}
            </h1>

            {/* Chalk line decoration */}
            <div
                style={{
                    width: lineWidth,
                    height: 3,
                    backgroundColor: '#d4883a',
                    marginBottom: 24,
                    borderRadius: 2,
                    opacity: 0.7,
                }}
            />

            {/* Subtitle */}
            {subtitulo && (
                <p
                    style={{
                        fontSize: 28,
                        fontWeight: 400,
                        color: '#6b5840',
                        textAlign: 'center',
                        marginBottom: 40,
                        opacity: subtitleOpacity,
                        fontFamily: 'Georgia, serif',
                        letterSpacing: 1,
                    }}
                >
                    {subtitulo}
                </p>
            )}

            {/* Metadata — chalk tags */}
            {metadata && (
                <div
                    style={{
                        display: 'flex',
                        gap: 50,
                        opacity: metaOpacity,
                    }}
                >
                    {[
                        { label: 'Versión', value: metadata.version },
                        { label: 'Vigencia', value: metadata.fecha_vigencia },
                        { label: 'Normativa', value: metadata.normativa.join(' · ') },
                    ].map((item, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                            <span
                                style={{
                                    fontSize: 13,
                                    color: '#a08060',
                                    fontFamily: 'Georgia, serif',
                                    letterSpacing: 2,
                                }}
                            >
                                {item.label.toUpperCase()}
                            </span>
                            <p
                                style={{
                                    fontSize: 20,
                                    fontWeight: 600,
                                    color: '#d4883a',
                                    fontFamily: 'Georgia, serif',
                                    margin: '4px 0 0',
                                }}
                            >
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Chalk dust particles */}
            {dustParticles.map((p, i) => (
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        left: p.x,
                        top: p.y,
                        width: p.size,
                        height: p.size,
                        borderRadius: '50%',
                        backgroundColor: '#d4c9b8',
                        opacity: p.opacity,
                    }}
                />
            ))}
        </AbsoluteFill>
    );
};
