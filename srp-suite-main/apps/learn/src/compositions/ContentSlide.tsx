import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
} from 'remotion';
import { ProcedureStep } from '../types';
import { LottieIcon } from '../components/LottieIcon';
import { RiskIndicator } from '../components/RiskIndicator';
import { EPPBar } from '../components/EPPBar';

interface ContentSlideProps {
    paso: ProcedureStep;
    totalPasos: number;
    stepIndex: number;
}

export const ContentSlide: React.FC<ContentSlideProps> = ({
    paso,
    totalPasos,
    stepIndex,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const hasVisual = !!paso.lottie || !!paso.imagen;
    const hasEPP = paso.epp && paso.epp.length > 0;
    const hasRisk = !!paso.riesgo;

    // Animaciones
    const progress = spring({
        frame,
        fps,
        config: { damping: 100, stiffness: 200, mass: 0.5 },
    });

    const contentProgress = spring({
        frame: frame - 10,
        fps,
        config: { damping: 100, stiffness: 200, mass: 0.5 },
    });

    const visualProgress = spring({
        frame: frame - 15,
        fps,
        config: { damping: 80, stiffness: 180, mass: 0.6 },
    });

    // Colores por paso 
    const stepColors = ['#e74c3c', '#f39c12', '#2ecc71', '#3498db', '#9b59b6'];
    const stepColor = stepColors[stepIndex % stepColors.length];

    // Borde lateral según riesgo
    const riskBorderColor = paso.riesgo
        ? {
            bajo: '#2ecc71',
            medio: '#f1c40f',
            alto: '#e67e22',
            critico: '#e74c3c',
        }[paso.riesgo]
        : 'transparent';

    return (
        <AbsoluteFill
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                padding: 0,
            }}
        >
            {/* Imagen de fondo (si tiene y no hay Lottie) */}
            {paso.imagen && (
                <>
                    <img
                        src={paso.imagen}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: interpolate(contentProgress, [0, 1], [0, 0.4]),
                            transform: `scale(${interpolate(frame, [0, paso.duracion * 30], [1, 1.05], { extrapolateRight: 'clamp' })})`,
                        }}
                    />
                    {/* Overlay oscuro para legibilidad */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background:
                                'linear-gradient(135deg, rgba(26,26,46,0.85) 0%, rgba(15,15,35,0.92) 100%)',
                        }}
                    />
                </>
            )}

            {/* Borde lateral de riesgo */}
            {hasRisk && (
                <div
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 6,
                        background: riskBorderColor,
                        opacity: contentProgress,
                        boxShadow: `4px 0 20px ${riskBorderColor}40`,
                    }}
                />
            )}

            {/* Indicador de progreso (top right) */}
            <div
                style={{
                    position: 'absolute',
                    top: 40,
                    right: 40,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                }}
            >
                <span style={{ fontSize: 18, color: '#666' }}>Paso</span>
                <span
                    style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: stepColor,
                    }}
                >
                    {paso.numero} / {totalPasos}
                </span>
            </div>

            {/* Risk indicator (top left) */}
            {hasRisk && (
                <div
                    style={{
                        position: 'absolute',
                        top: 36,
                        left: 40,
                    }}
                >
                    <RiskIndicator level={paso.riesgo!} />
                </div>
            )}

            {/* Barra de progreso inferior */}
            <div
                style={{
                    position: 'absolute',
                    bottom: hasEPP ? 80 : 0,
                    left: 0,
                    width: '100%',
                    height: 6,
                    background: 'rgba(255,255,255,0.1)',
                }}
            >
                <div
                    style={{
                        width: `${((stepIndex + 1) / totalPasos) * 100}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${stepColor} 0%, ${stepColor}bb 100%)`,
                    }}
                />
            </div>

            {/* ===== LAYOUT PRINCIPAL ===== */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    padding: '100px 80px',
                    gap: 60,
                }}
            >
                {/* Zona de texto (60% si hay visual, 100% si no) */}
                <div
                    style={{
                        flex: hasVisual ? '0 0 55%' : '0 0 80%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: hasVisual ? 'flex-start' : 'center',
                        opacity: progress,
                    }}
                >
                    {/* Número de paso badge */}
                    <div
                        style={{
                            width: hasVisual ? 70 : 100,
                            height: hasVisual ? 70 : 100,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${stepColor} 0%, ${stepColor}cc 100%)`,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 24,
                            boxShadow: `0 10px 40px ${stepColor}40`,
                            transform: `scale(${progress})`,
                        }}
                    >
                        <span
                            style={{
                                fontSize: hasVisual ? 32 : 48,
                                fontWeight: 800,
                                color: 'white',
                            }}
                        >
                            {paso.numero}
                        </span>
                    </div>

                    {/* Título */}
                    <h2
                        style={{
                            fontSize: hasVisual ? 42 : 48,
                            fontWeight: 700,
                            textAlign: hasVisual ? 'left' : 'center',
                            marginBottom: 24,
                            color: 'white',
                            lineHeight: 1.15,
                            transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
                        }}
                    >
                        {paso.titulo}
                    </h2>

                    {/* Contenido */}
                    <p
                        style={{
                            fontSize: hasVisual ? 28 : 32,
                            lineHeight: 1.6,
                            textAlign: hasVisual ? 'left' : 'center',
                            color: '#c0c0c0',
                            maxWidth: hasVisual ? '100%' : 1000,
                            opacity: contentProgress,
                            transform: `translateY(${interpolate(contentProgress, [0, 1], [20, 0])}px)`,
                        }}
                    >
                        {paso.contenido}
                    </p>
                </div>

                {/* Zona visual (40% - solo si hay lottie) */}
                {paso.lottie && (
                    <div
                        style={{
                            flex: '0 0 35%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            opacity: visualProgress,
                            transform: `scale(${interpolate(visualProgress, [0, 1], [0.8, 1])}) translateX(${interpolate(visualProgress, [0, 1], [40, 0])}px)`,
                        }}
                    >
                        <div
                            style={{
                                padding: 30,
                                borderRadius: 24,
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                backdropFilter: 'blur(10px)',
                            }}
                        >
                            <LottieIcon
                                src={paso.lottie}
                                size={320}
                                opacity={visualProgress}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* EPP Bar (bottom center) */}
            {hasEPP && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 20,
                        left: '50%',
                        transform: `translateX(-50%) translateY(${interpolate(contentProgress, [0, 1], [30, 0])}px)`,
                        opacity: contentProgress,
                    }}
                >
                    <EPPBar epp={paso.epp!} />
                </div>
            )}

        </AbsoluteFill>
    );
};
