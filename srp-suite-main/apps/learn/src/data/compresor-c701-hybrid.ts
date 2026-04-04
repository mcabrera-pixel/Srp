/**
 * Hybrid Video Segments for Compresor C-701
 *
 * This file defines the sequence of video segments combining:
 * - AI-generated video clips (Minimax Hailuo 2.3)
 * - Remotion content slides
 *
 * Total duration: ~2:30 minutes
 */

import type { VideoSegment } from '../compositions/HybridProcedureVideo';
import { PROCEDURE_COMPRESOR_C701 } from './compresor-c701';

/**
 * Video segment sequence for C-701 Hybrid video
 *
 * Structure:
 * 1. [Intro] - Animated CODELCO intro
 * 2. [AI] - Epic shot of compressor house
 * 3. [AI] - Documentation + work order
 * 4. [AI] - EPP equipment
 * 5. [AI] - Safety meeting
 * 6. [AI] - LOTO lockout
 * 7. [Content] - Procedure steps
 * 8. [AI] - Process clips
 * 9. [AI] - Risks
 * 10. [AI] - Closing
 * 11. [Outro] - Safety message
 */
export const C701_HYBRID_SEGMENTS: VideoSegment[] = [
    // ══════════════════════════════════════════════════════════════
    // INTRO SECTION
    // ══════════════════════════════════════════════════════════════
    {
        id: 'intro',
        type: 'intro',
        durationInSeconds: 8,
        title: 'Mantencion Preventiva',
        subtitle: 'Compresor de Oxigeno C-701',
    },

    // ══════════════════════════════════════════════════════════════
    // AI CLIP: Epic shot of compressor house
    // ══════════════════════════════════════════════════════════════
    {
        id: 'ai-01-intro',
        type: 'ai',
        durationInSeconds: 6,
        src: 'ai-clips/c701/01_intro_casa_compresora.mp4',
    },

    // ══════════════════════════════════════════════════════════════
    // AI CLIP: Documentation and work order
    // ══════════════════════════════════════════════════════════════
    {
        id: 'ai-02-doc',
        type: 'ai',
        durationInSeconds: 6,
        src: 'ai-clips/c701/02_documentacion_orden_trabajo.mp4',
    },

    // ══════════════════════════════════════════════════════════════
    // AI CLIP: EPP equipment
    // ══════════════════════════════════════════════════════════════
    {
        id: 'ai-03-epp',
        type: 'ai',
        durationInSeconds: 6,
        src: 'ai-clips/c701/03_epp_oxigeno_limpio.mp4',
    },

    // ══════════════════════════════════════════════════════════════
    // AI CLIP: Safety meeting - tarjeta verde
    // ══════════════════════════════════════════════════════════════
    {
        id: 'ai-04-reunion',
        type: 'ai',
        durationInSeconds: 6,
        src: 'ai-clips/c701/04_reunion_seguridad_tarjeta_verde.mp4',
    },

    // ══════════════════════════════════════════════════════════════
    // AI CLIP: LOTO lockout
    // ══════════════════════════════════════════════════════════════
    {
        id: 'ai-05-bloqueo',
        type: 'ai',
        durationInSeconds: 6,
        src: 'ai-clips/c701/05_bloqueo_loto_compresor.mp4',
    },

    // ══════════════════════════════════════════════════════════════
    // CONTENT: First 3 procedure steps
    // ══════════════════════════════════════════════════════════════
    ...PROCEDURE_COMPRESOR_C701.pasos.slice(0, 3).map((step, index) => ({
        id: `content-step-${index + 1}`,
        type: 'content' as const,
        durationInSeconds: Math.min(step.duracion, 12),
        step: step,
    })),

    // ══════════════════════════════════════════════════════════════
    // AI CLIP: Disconnect cooling pipes
    // ══════════════════════════════════════════════════════════════
    {
        id: 'ai-06-desconectar',
        type: 'ai',
        durationInSeconds: 6,
        src: 'ai-clips/c701/06_desconectar_canerias_refrigeracion.mp4',
    },

    // ══════════════════════════════════════════════════════════════
    // AI CLIP: Cylinder head disassembly
    // ══════════════════════════════════════════════════════════════
    {
        id: 'ai-07-desmontaje',
        type: 'ai',
        durationInSeconds: 6,
        src: 'ai-clips/c701/07_desmontaje_culata_cilindro.mp4',
    },

    // ══════════════════════════════════════════════════════════════
    // CONTENT: Next 2 procedure steps
    // ══════════════════════════════════════════════════════════════
    ...PROCEDURE_COMPRESOR_C701.pasos.slice(3, 5).map((step, index) => ({
        id: `content-step-${index + 4}`,
        type: 'content' as const,
        durationInSeconds: Math.min(step.duracion, 12),
        step: step,
    })),

    // ══════════════════════════════════════════════════════════════
    // AI CLIP: Piston clearance check
    // ══════════════════════════════════════════════════════════════
    {
        id: 'ai-08-holgura',
        type: 'ai',
        durationInSeconds: 6,
        src: 'ai-clips/c701/08_verificar_holgura_embolo.mp4',
    },

    // ══════════════════════════════════════════════════════════════
    // AI CLIP: Seal disassembly
    // ══════════════════════════════════════════════════════════════
    {
        id: 'ai-09-sellos',
        type: 'ai',
        durationInSeconds: 6,
        src: 'ai-clips/c701/09_sellos_prensaestopas_desmontaje.mp4',
    },

    // ══════════════════════════════════════════════════════════════
    // AI CLIP: Oil scraper inspection
    // ══════════════════════════════════════════════════════════════
    {
        id: 'ai-10-rascadores',
        type: 'ai',
        durationInSeconds: 6,
        src: 'ai-clips/c701/10_inspeccion_rascadores_aceite.mp4',
    },

    // ══════════════════════════════════════════════════════════════
    // AI CLIP: Critical risks
    // ══════════════════════════════════════════════════════════════
    {
        id: 'ai-14-riesgos',
        type: 'ai',
        durationInSeconds: 6,
        src: 'ai-clips/c701/14_riesgos_criticos_oxigeno.mp4',
    },

    // ══════════════════════════════════════════════════════════════
    // AI CLIP: Compressor operational
    // ══════════════════════════════════════════════════════════════
    {
        id: 'ai-15-cierre',
        type: 'ai',
        durationInSeconds: 6,
        src: 'ai-clips/c701/15_cierre_compresor_operativo.mp4',
    },

    // ══════════════════════════════════════════════════════════════
    // OUTRO
    // ══════════════════════════════════════════════════════════════
    {
        id: 'outro',
        type: 'outro',
        durationInSeconds: 8,
        title: 'Tu seguridad es lo primero.',
    },
];

/**
 * Calculate total duration of hybrid video in seconds
 */
export const calculateHybridDuration = (): number => {
    return C701_HYBRID_SEGMENTS.reduce(
        (total, segment) => total + segment.durationInSeconds,
        0
    );
};

/**
 * Get segment by ID
 */
export const getSegmentById = (id: string): VideoSegment | undefined => {
    return C701_HYBRID_SEGMENTS.find((seg) => seg.id === id);
};

/**
 * Get all segments of a specific type
 */
export const getSegmentsByType = (type: VideoSegment['type']): VideoSegment[] => {
    return C701_HYBRID_SEGMENTS.filter((seg) => seg.type === type);
};

// Export summary for CLI/debugging
export const HYBRID_VIDEO_SUMMARY = {
    totalSegments: C701_HYBRID_SEGMENTS.length,
    totalDurationSeconds: calculateHybridDuration(),
    aiSegments: getSegmentsByType('ai').length,
    contentSegments: getSegmentsByType('content').length,
    estimatedRenderTime: '2-3 minutes',
};
