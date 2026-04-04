import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
} from 'remotion';

interface WhiteboardOutroProps {
    titulo: string;
    totalPasos: number;
}

export const WhiteboardOutro: React.FC<WhiteboardOutroProps> = ({
    titulo,
    totalPasos,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Shield icon scales in
    const shieldScale = spring({
        frame: frame - 10,
        fps,
        config: { damping: 12, stiffness: 100 },
    });

    // Text reveals
    const messageOpacity = interpolate(frame, [30, 50], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const statsOpacity = interpolate(frame, [60, 80], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const brandOpacity = interpolate(frame, [100, 120], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Final eraser wipe at end
    const { durationInFrames } = useVideoConfig();
    const wipeStart = durationInFrames - 30;
    const eraserProgress = interpolate(frame, [wipeStart, durationInFrames], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill style={{ backgroundColor: '#f5f0e8' }}>
            {/* Paper texture grid */}
            <svg
                width="100%"
                height="100%"
                style={{ position: 'absolute', opacity: 0.06 }}
            >
                <defs>
                    <pattern id="wbGridO" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#8b7355" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#wbGridO)" />
            </svg>

            {/* Board frame */}
            <div
                style={{
                    position: 'absolute',
                    inset: 20,
                    border: '4px solid #c4a882',
                    borderRadius: 8,
                }}
            />

            {/* Main content centered */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: 20,
                }}
            >
                {/* Safety shield icon — chalk drawn */}
                <svg
                    width="120"
                    height="140"
                    viewBox="0 0 120 140"
                    style={{ transform: `scale(${shieldScale})`, opacity: shieldScale }}
                >
                    <path
                        d="M 60 10 L 15 35 L 15 75 Q 15 120 60 135 Q 105 120 105 75 L 105 35 Z"
                        fill="none"
                        stroke="#2c6b3f"
                        strokeWidth={3.5}
                        strokeLinejoin="round"
                        strokeDasharray="400"
                        strokeDashoffset={interpolate(frame, [10, 50], [400, 0], {
                            extrapolateLeft: 'clamp',
                            extrapolateRight: 'clamp',
                        })}
                    />
                    {/* Checkmark inside */}
                    <path
                        d="M 38 70 L 52 88 L 82 50"
                        fill="none"
                        stroke="#2c6b3f"
                        strokeWidth={4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="80"
                        strokeDashoffset={interpolate(frame, [40, 60], [80, 0], {
                            extrapolateLeft: 'clamp',
                            extrapolateRight: 'clamp',
                        })}
                    />
                </svg>

                {/* Main message */}
                <h2
                    style={{
                        fontSize: 48,
                        fontWeight: 800,
                        color: '#2c1810',
                        textAlign: 'center',
                        opacity: messageOpacity,
                        fontFamily: 'Georgia, serif',
                        letterSpacing: 1,
                        transform: `translateY(${interpolate(messageOpacity, [0, 1], [20, 0])}px)`,
                    }}
                >
                    ¡Trabaja Seguro, Trabaja con Orgullo!
                </h2>

                {/* Subtitle */}
                <p
                    style={{
                        fontSize: 24,
                        color: '#6b5840',
                        textAlign: 'center',
                        opacity: messageOpacity,
                        fontFamily: 'Georgia, serif',
                        maxWidth: 700,
                        lineHeight: 1.5,
                    }}
                >
                    Recuerda: si las condiciones cambian, detén la tarea y reevalúa los riesgos.
                </p>

                {/* Stats */}
                <div
                    style={{
                        display: 'flex',
                        gap: 60,
                        marginTop: 20,
                        opacity: statsOpacity,
                    }}
                >
                    <div style={{ textAlign: 'center' }}>
                        <span
                            style={{
                                fontSize: 36,
                                fontWeight: 800,
                                color: '#d4883a',
                                fontFamily: 'Georgia, serif',
                            }}
                        >
                            {totalPasos}
                        </span>
                        <p style={{ fontSize: 14, color: '#8b7355', margin: '4px 0 0', letterSpacing: 2 }}>
                            PASOS
                        </p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <span
                            style={{
                                fontSize: 36,
                                fontWeight: 800,
                                color: '#2c6b3f',
                                fontFamily: 'Georgia, serif',
                            }}
                        >
                            100%
                        </span>
                        <p style={{ fontSize: 14, color: '#8b7355', margin: '4px 0 0', letterSpacing: 2 }}>
                            SEGURO
                        </p>
                    </div>
                </div>

                {/* Branding */}
                <div
                    style={{
                        marginTop: 30,
                        opacity: brandOpacity,
                        textAlign: 'center',
                    }}
                >
                    <span
                        style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: '#c4a882',
                            letterSpacing: 5,
                            fontFamily: 'Georgia, serif',
                        }}
                    >
                        SRP LEARN
                    </span>
                    <p style={{ fontSize: 12, color: '#a08060', margin: '4px 0 0', letterSpacing: 2 }}>
                        CAPACITACIÓN SEGURA
                    </p>
                </div>
            </div>

            {/* Final eraser wipe */}
            {eraserProgress > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: `${eraserProgress * 100}%`,
                        height: '100%',
                        backgroundColor: '#f5f0e8',
                    }}
                />
            )}
        </AbsoluteFill>
    );
};
