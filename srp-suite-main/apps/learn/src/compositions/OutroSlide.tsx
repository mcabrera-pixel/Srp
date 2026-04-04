import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
} from 'remotion';

interface OutroSlideProps {
    titulo: string;
    totalPasos: number;
}

export const OutroSlide: React.FC<OutroSlideProps> = ({ titulo, totalPasos }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const progress = spring({
        frame,
        fps,
        config: { damping: 100, stiffness: 200, mass: 0.5 },
    });

    const checkProgress = spring({
        frame: frame - 20,
        fps,
        config: { damping: 80, stiffness: 180, mass: 0.6 },
    });

    return (
        <AbsoluteFill
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                padding: 80,
            }}
        >
            {/* Check animado */}
            <div
                style={{
                    width: 150,
                    height: 150,
                    borderRadius: 75,
                    background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 40,
                    transform: `scale(${checkProgress})`,
                    boxShadow: '0 20px 60px rgba(46, 204, 113, 0.4)',
                }}
            >
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M5 13l4 4L19 7"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray={interpolate(checkProgress, [0, 1], [100, 0])}
                    />
                </svg>
            </div>

            {/* Mensaje de finalización */}
            <h1
                style={{
                    fontSize: 56,
                    fontWeight: 800,
                    textAlign: 'center',
                    marginBottom: 20,
                    opacity: progress,
                    transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
                    color: 'white',
                }}
            >
                ¡Capacitación Completada!
            </h1>

            <p
                style={{
                    fontSize: 28,
                    color: '#a0a0a0',
                    textAlign: 'center',
                    marginBottom: 40,
                    opacity: progress,
                }}
            >
                {titulo}
            </p>

            {/* Estadísticas */}
            <div
                style={{
                    display: 'flex',
                    gap: 60,
                    opacity: progress,
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 48, fontWeight: 800, color: '#f39c12' }}>
                        {totalPasos}
                    </p>
                    <span style={{ fontSize: 18, color: '#666' }}>Pasos completados</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 48, fontWeight: 800, color: '#3498db' }}>5</p>
                    <span style={{ fontSize: 18, color: '#666' }}>Preguntas de quiz</span>
                </div>
            </div>

            {/* Instrucción */}
            <p
                style={{
                    position: 'absolute',
                    bottom: 60,
                    fontSize: 24,
                    color: '#f39c12',
                    opacity: progress,
                }}
            >
                Ahora responde el quiz para obtener tu certificado →
            </p>
        </AbsoluteFill>
    );
};
