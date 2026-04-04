import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
} from 'remotion';

interface IntroSlideProps {
    titulo: string;
    subtitulo?: string;
    metadata?: {
        version: string;
        fecha_vigencia: string;
        normativa: string[];
    };
}

export const IntroSlide: React.FC<IntroSlideProps> = ({
    titulo,
    subtitulo,
    metadata,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Animaciones de entrada
    const titleProgress = spring({
        frame,
        fps,
        config: { damping: 100, stiffness: 200, mass: 0.5 },
    });

    const subtitleProgress = spring({
        frame: frame - 15,
        fps,
        config: { damping: 100, stiffness: 200, mass: 0.5 },
    });

    const metadataProgress = spring({
        frame: frame - 30,
        fps,
        config: { damping: 100, stiffness: 200, mass: 0.5 },
    });

    const titleTranslate = interpolate(titleProgress, [0, 1], [100, 0]);
    const subtitleTranslate = interpolate(subtitleProgress, [0, 1], [50, 0]);

    return (
        <AbsoluteFill
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                padding: 80,
            }}
        >
            {/* Título principal */}
            <h1
                style={{
                    fontSize: 72,
                    fontWeight: 800,
                    textAlign: 'center',
                    marginBottom: 20,
                    opacity: titleProgress,
                    transform: `translateY(${titleTranslate}px)`,
                    background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}
            >
                {titulo}
            </h1>

            {/* Subtítulo */}
            {subtitulo && (
                <p
                    style={{
                        fontSize: 32,
                        fontWeight: 400,
                        color: '#a0a0a0',
                        textAlign: 'center',
                        marginBottom: 40,
                        opacity: subtitleProgress,
                        transform: `translateY(${subtitleTranslate}px)`,
                    }}
                >
                    {subtitulo}
                </p>
            )}

            {/* Línea decorativa */}
            <div
                style={{
                    width: interpolate(metadataProgress, [0, 1], [0, 200]),
                    height: 3,
                    background: 'linear-gradient(90deg, #f39c12 0%, #e74c3c 100%)',
                    marginBottom: 40,
                    borderRadius: 2,
                }}
            />

            {/* Metadata */}
            {metadata && (
                <div
                    style={{
                        display: 'flex',
                        gap: 40,
                        opacity: metadataProgress,
                    }}
                >
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 14, color: '#666' }}>Versión</span>
                        <p style={{ fontSize: 20, fontWeight: 600, color: '#f39c12' }}>
                            {metadata.version}
                        </p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 14, color: '#666' }}>Vigencia</span>
                        <p style={{ fontSize: 20, fontWeight: 600, color: '#f39c12' }}>
                            {metadata.fecha_vigencia}
                        </p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 14, color: '#666' }}>Normativa</span>
                        <p style={{ fontSize: 20, fontWeight: 600, color: '#f39c12' }}>
                            {metadata.normativa.join(' | ')}
                        </p>
                    </div>
                </div>
            )}
        </AbsoluteFill>
    );
};
