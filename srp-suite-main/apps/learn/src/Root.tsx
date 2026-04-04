import { Composition } from 'remotion';
import { ProcedureVideo, calculateTotalFrames } from './compositions/ProcedureVideo';
import { VisualProcedureVideo, calculateVisualTotalFrames } from './compositions/VisualProcedureVideo';
import { WhiteboardProcedureVideo, calculateWhiteboardTotalFrames } from './compositions/whiteboard/WhiteboardProcedureVideo';
import { ProProcedureVideo, calculateProTotalFrames } from './compositions/ProProcedureVideo';
import { HybridProcedureVideo } from './compositions/HybridProcedureVideo';
import { PROCEDURE_EXAMPLE } from './data/example';
import { PROCEDURE_ESCOTILLA } from './data/escotilla-grating';
import { PROCEDURE_ESCOTILLA_VISUAL } from './data/escotilla-visual';
import { PROCEDURE_COMPRESOR_C701 } from './data/compresor-c701';
import { C701_HYBRID_SEGMENTS } from './data/compresor-c701-hybrid';
import { PROCEDURE_CAMBIO_POLIN_CT } from './data/cambio-polin-ct';
import { POLIN_CT_HYBRID_SEGMENTS } from './data/cambio-polin-hybrid';

const FPS = 30;

export const RemotionRoot: React.FC = () => {
    const totalFrames = calculateTotalFrames(PROCEDURE_EXAMPLE, FPS);
    const totalFramesEscotilla = calculateTotalFrames(PROCEDURE_ESCOTILLA, FPS);
    const totalFramesVisual = calculateVisualTotalFrames(PROCEDURE_ESCOTILLA_VISUAL, FPS);
    const totalFramesPizarra = calculateWhiteboardTotalFrames(PROCEDURE_ESCOTILLA, FPS);
    const totalFramesPro = calculateProTotalFrames(PROCEDURE_ESCOTILLA, FPS);

    // C-701 Compresor de Oxígeno — CODELCO Chuquicamata
    const totalFramesC701 = calculateTotalFrames(PROCEDURE_COMPRESOR_C701, FPS);
    const totalFramesC701Pizarra = calculateWhiteboardTotalFrames(PROCEDURE_COMPRESOR_C701, FPS);
    const totalFramesC701Pro = calculateProTotalFrames(PROCEDURE_COMPRESOR_C701, FPS);

    return (
        <>
            {/* Video completo con quiz */}
            <Composition
                id="ProcedureVideo"
                component={ProcedureVideo}
                durationInFrames={totalFrames}
                fps={FPS}
                width={1920}
                height={1080}
                defaultProps={{
                    procedure: PROCEDURE_EXAMPLE,
                }}
            />

            {/* Versión corta sin quiz (para preview rápido) */}
            <Composition
                id="QuickProcedure"
                component={ProcedureVideo}
                durationInFrames={FPS * (5 + PROCEDURE_EXAMPLE.pasos.length * 10 + 5)}
                fps={FPS}
                width={1920}
                height={1080}
                defaultProps={{
                    procedure: {
                        ...PROCEDURE_EXAMPLE,
                        pasos: PROCEDURE_EXAMPLE.pasos.map(p => ({
                            ...p,
                            duracion: 8,
                            quiz: undefined,
                        })),
                    },
                }}
            />

            {/* Video Escotilla Grating (original) */}
            <Composition
                id="EscotillaVideo"
                component={ProcedureVideo}
                durationInFrames={totalFramesEscotilla}
                fps={FPS}
                width={1920}
                height={1080}
                defaultProps={{
                    procedure: PROCEDURE_ESCOTILLA,
                }}
            />

            {/* ★ NUEVO: Video Visual — Escotilla (image-first, 13 slides) */}
            <Composition
                id="EscotillaVisual"
                component={VisualProcedureVideo}
                durationInFrames={totalFramesVisual}
                fps={FPS}
                width={1920}
                height={1080}
                defaultProps={{
                    procedure: PROCEDURE_ESCOTILLA_VISUAL,
                }}
            />

            {/* ★ PIZARRA: Video Pizarra — Escotilla (chalk-on-whiteboard, 7 steps) */}
            <Composition
                id="EscotillaPizarra"
                component={WhiteboardProcedureVideo}
                durationInFrames={totalFramesPizarra}
                fps={FPS}
                width={1920}
                height={1080}
                defaultProps={{
                    procedure: PROCEDURE_ESCOTILLA,
                }}
            />

            {/* ★ PRO: TransitionSeries + Noise Background + Animated Captions */}
            <Composition
                id="EscotillaPro"
                component={ProProcedureVideo}
                durationInFrames={totalFramesPro}
                fps={FPS}
                width={1920}
                height={1080}
                defaultProps={{
                    procedure: PROCEDURE_ESCOTILLA,
                }}
            />

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* C-701 COMPRESOR DE OXÍGENO — CODELCO CHUQUICAMATA            */}
            {/* ═══════════════════════════════════════════════════════════════ */}

            {/* C-701: Video básico con quiz */}
            <Composition
                id="CompresorC701"
                component={ProcedureVideo}
                durationInFrames={totalFramesC701}
                fps={FPS}
                width={1920}
                height={1080}
                defaultProps={{
                    procedure: PROCEDURE_COMPRESOR_C701,
                }}
            />

            {/* C-701: Estilo Pizarra (whiteboard chalk) */}
            <Composition
                id="CompresorC701Pizarra"
                component={WhiteboardProcedureVideo}
                durationInFrames={totalFramesC701Pizarra}
                fps={FPS}
                width={1920}
                height={1080}
                defaultProps={{
                    procedure: PROCEDURE_COMPRESOR_C701,
                }}
            />

            {/* C-701: PRO con transiciones + noise background */}
            <Composition
                id="CompresorC701Pro"
                component={ProProcedureVideo}
                durationInFrames={totalFramesC701Pro}
                fps={FPS}
                width={1920}
                height={1080}
                defaultProps={{
                    procedure: PROCEDURE_COMPRESOR_C701,
                }}
            />

            {/* ★★★ HYBRID: Manim 3Blue1Brown + Video IA (Minimax/Sora) ★★★ */}
            <Composition
                id="CompresorC701Hybrid"
                component={HybridProcedureVideo}
                durationInFrames={C701_HYBRID_SEGMENTS.reduce(
                    (acc, seg) => acc + Math.round(seg.durationInSeconds * FPS),
                    0
                ) + 15 * (C701_HYBRID_SEGMENTS.length - 1)} // Add transition frames
                fps={FPS}
                width={1920}
                height={1080}
                defaultProps={{
                    procedure: PROCEDURE_COMPRESOR_C701,
                    segments: C701_HYBRID_SEGMENTS,
                    transitionFrames: 15,
                    showLogo: true,
                    logoPosition: 'top-right',
                }}
            />

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* CAMBIO DE POLÍN — CORREA TRANSPORTADORA SUBTERRÁNEA            */}
            {/* ═══════════════════════════════════════════════════════════════ */}

            {/* Polín CT: Video básico con quiz */}
            <Composition
                id="PolinCT"
                component={ProcedureVideo}
                durationInFrames={calculateTotalFrames(PROCEDURE_CAMBIO_POLIN_CT, FPS)}
                fps={FPS}
                width={1920}
                height={1080}
                defaultProps={{
                    procedure: PROCEDURE_CAMBIO_POLIN_CT,
                }}
            />

            {/* Polín CT: Estilo Pizarra */}
            <Composition
                id="PolinCTPizarra"
                component={WhiteboardProcedureVideo}
                durationInFrames={calculateWhiteboardTotalFrames(PROCEDURE_CAMBIO_POLIN_CT, FPS)}
                fps={FPS}
                width={1920}
                height={1080}
                defaultProps={{
                    procedure: PROCEDURE_CAMBIO_POLIN_CT,
                }}
            />

            {/* Polín CT: PRO con transiciones */}
            <Composition
                id="PolinCTPro"
                component={ProProcedureVideo}
                durationInFrames={calculateProTotalFrames(PROCEDURE_CAMBIO_POLIN_CT, FPS)}
                fps={FPS}
                width={1920}
                height={1080}
                defaultProps={{
                    procedure: PROCEDURE_CAMBIO_POLIN_CT,
                }}
            />

            {/* ★★★ HYBRID: Video IA + Diagramas Apple Style ★★★ */}
            <Composition
                id="PolinCTHybrid"
                component={HybridProcedureVideo}
                durationInFrames={POLIN_CT_HYBRID_SEGMENTS.reduce(
                    (acc, seg) => acc + Math.round(seg.durationInSeconds * FPS),
                    0
                ) + 15 * (POLIN_CT_HYBRID_SEGMENTS.length - 1)}
                fps={FPS}
                width={1920}
                height={1080}
                defaultProps={{
                    procedure: PROCEDURE_CAMBIO_POLIN_CT,
                    segments: POLIN_CT_HYBRID_SEGMENTS,
                    transitionFrames: 15,
                    showLogo: true,
                    logoPosition: 'top-right',
                }}
            />
        </>
    );
};
