/**
 * Hybrid Video Segments for Cambio de Polín en Correa Transportadora
 *
 * This file defines the sequence of video segments combining:
 * - AI-generated video clips (Minimax Hailuo)
 * - Visual content slides with diagrams and flows
 *
 * Total duration: ~3:00 minutes
 */

import type { VideoSegment } from '../compositions/HybridProcedureVideo';
import { PROCEDURE_CAMBIO_POLIN_CT } from './cambio-polin-ct';

/**
 * Video segment sequence for Cambio de Polín Hybrid video
 *
 * Structure:
 * 1. [Intro] - Animated intro
 * 2. [AI] - Underground mining environment
 * 3. [AI] - Conveyor belt system
 * 4. [Content] - Preparation
 * 5. [AI] - EPP equipment
 * 6. [Content] - EPP showcase
 * 7. [AI] - LOTO procedure
 * 8. [Content] - LOTO flow diagram
 * 9. [AI] - Inspection
 * 10. [Content] - Checklist
 * 11. [AI] - Idler removal
 * 12. [Content] - Removal flow
 * 13. [AI] - Installation
 * 14. [Content] - Installation checklist
 * 15. [AI] - Testing
 * 16. [Content] - Verification flow
 * 17. [AI] - Emergency procedures
 * 18. [Content] - Emergency icons
 * 19. [AI] - Closeout
 * 20. [Outro] - Safety message
 */
export const POLIN_CT_HYBRID_SEGMENTS: VideoSegment[] = [
    // ══════════════════════════════════════════════════════════════
    // INTRO SECTION
    // ══════════════════════════════════════════════════════════════
    {
        id: 'intro',
        type: 'intro',
        durationInSeconds: 8,
        title: 'Cambio de Polín',
        subtitle: 'Correa Transportadora Subterránea',
    },

    // ══════════════════════════════════════════════════════════════
    // AI CLIP: Underground mining tunnel with conveyor
    // Prompt: "Cinematic shot of underground mining tunnel with
    // conveyor belt system, dramatic lighting from mining lamps,
    // industrial atmosphere, 4K quality"
    // ══════════════════════════════════════════════════════════════
    {
        id: 'ai-01-tunel',
        type: 'ai',
        durationInSeconds: 6,
        src: 'ai-clips/polin-ct/01_tunel_subterraneo.mp4',
    },

    // ══════════════════════════════════════════════════════════════
    // AI CLIP: Conveyor belt idlers close-up
    // Prompt: "Close-up of conveyor belt idlers (rollers) in
    // underground mine, industrial machinery, technical detail"
    // ══════════════════════════════════════════════════════════════
    {
        id: 'ai-02-polines',
        type: 'ai',
        durationInSeconds: 5,
        src: 'ai-clips/polin-ct/02_polines_correa.mp4',
    },

    // ══════════════════════════════════════════════════════════════
    // CONTENT: Step 1 - Preparation (Stats Dashboard)
    // ══════════════════════════════════════════════════════════════
    {
        id: 'content-step-1',
        type: 'content',
        durationInSeconds: 12,
        step: PROCEDURE_CAMBIO_POLIN_CT.pasos[0],
    },

    // ══════════════════════════════════════════════════════════════
    // AI CLIP: Mining PPE equipment
    // Prompt: "Underground mining safety equipment, hard hat with
    // lamp, respirator, safety vest, professional lighting"
    // ══════════════════════════════════════════════════════════════
    {
        id: 'ai-03-epp',
        type: 'ai',
        durationInSeconds: 5,
        src: 'ai-clips/polin-ct/03_epp_mineria.mp4',
    },

    // ══════════════════════════════════════════════════════════════
    // CONTENT: Step 2 - EPP (Icon Showcase)
    // ══════════════════════════════════════════════════════════════
    {
        id: 'content-step-2',
        type: 'content',
        durationInSeconds: 15,
        step: PROCEDURE_CAMBIO_POLIN_CT.pasos[1],
    },

    // ══════════════════════════════════════════════════════════════
    // AI CLIP: LOTO lockout tagout
    // Prompt: "Industrial lockout tagout procedure, worker applying
    // padlock to electrical panel, safety tags visible, mining"
    // ══════════════════════════════════════════════════════════════
    {
        id: 'ai-04-loto',
        type: 'ai',
        durationInSeconds: 6,
        src: 'ai-clips/polin-ct/04_bloqueo_loto.mp4',
    },

    // ══════════════════════════════════════════════════════════════
    // CONTENT: Step 3 - LOTO (Flow Diagram) - CRITICAL
    // ══════════════════════════════════════════════════════════════
    {
        id: 'content-step-3',
        type: 'content',
        durationInSeconds: 20,
        step: PROCEDURE_CAMBIO_POLIN_CT.pasos[2],
    },

    // ══════════════════════════════════════════════════════════════
    // AI CLIP: Underground area inspection
    // Prompt: "Mining worker inspecting underground tunnel ceiling
    // with lamp, checking for loose rocks, safety inspection"
    // ══════════════════════════════════════════════════════════════
    {
        id: 'ai-05-inspeccion',
        type: 'ai',
        durationInSeconds: 5,
        src: 'ai-clips/polin-ct/05_inspeccion_area.mp4',
    },

    // ══════════════════════════════════════════════════════════════
    // CONTENT: Step 4 - Inspection (Checklist)
    // ══════════════════════════════════════════════════════════════
    {
        id: 'content-step-4',
        type: 'content',
        durationInSeconds: 15,
        step: PROCEDURE_CAMBIO_POLIN_CT.pasos[3],
    },

    // ══════════════════════════════════════════════════════════════
    // AI CLIP: Idler removal with hydraulic jack
    // Prompt: "Workers removing conveyor belt idler using hydraulic
    // jack, underground mine, industrial maintenance"
    // ══════════════════════════════════════════════════════════════
    {
        id: 'ai-06-retiro',
        type: 'ai',
        durationInSeconds: 6,
        src: 'ai-clips/polin-ct/06_retiro_polin.mp4',
    },

    // ══════════════════════════════════════════════════════════════
    // CONTENT: Step 5 - Removal (Flow Diagram) - CRITICAL
    // ══════════════════════════════════════════════════════════════
    {
        id: 'content-step-5',
        type: 'content',
        durationInSeconds: 20,
        step: PROCEDURE_CAMBIO_POLIN_CT.pasos[4],
    },

    // ══════════════════════════════════════════════════════════════
    // AI CLIP: New idler installation
    // Prompt: "Worker installing new conveyor belt idler, aligning
    // roller, tightening bolts, underground mine maintenance"
    // ══════════════════════════════════════════════════════════════
    {
        id: 'ai-07-instalacion',
        type: 'ai',
        durationInSeconds: 6,
        src: 'ai-clips/polin-ct/07_instalacion_polin.mp4',
    },

    // ══════════════════════════════════════════════════════════════
    // CONTENT: Step 6 - Installation (Checklist)
    // ══════════════════════════════════════════════════════════════
    {
        id: 'content-step-6',
        type: 'content',
        durationInSeconds: 18,
        step: PROCEDURE_CAMBIO_POLIN_CT.pasos[5],
    },

    // ══════════════════════════════════════════════════════════════
    // AI CLIP: Testing conveyor belt
    // Prompt: "Conveyor belt starting up in underground mine,
    // worker observing operation, maintenance testing"
    // ══════════════════════════════════════════════════════════════
    {
        id: 'ai-08-prueba',
        type: 'ai',
        durationInSeconds: 5,
        src: 'ai-clips/polin-ct/08_prueba_arranque.mp4',
    },

    // ══════════════════════════════════════════════════════════════
    // CONTENT: Step 7 - Verification (Flow Diagram)
    // ══════════════════════════════════════════════════════════════
    {
        id: 'content-step-7',
        type: 'content',
        durationInSeconds: 15,
        step: PROCEDURE_CAMBIO_POLIN_CT.pasos[6],
    },

    // ══════════════════════════════════════════════════════════════
    // AI CLIP: Emergency procedures
    // Prompt: "Mining emergency evacuation, self-rescuer device,
    // emergency lights, underground mine safety"
    // ══════════════════════════════════════════════════════════════
    {
        id: 'ai-09-emergencia',
        type: 'ai',
        durationInSeconds: 5,
        src: 'ai-clips/polin-ct/09_emergencia_mina.mp4',
    },

    // ══════════════════════════════════════════════════════════════
    // CONTENT: Step 8 - Emergency (Icon Showcase) - CRITICAL
    // ══════════════════════════════════════════════════════════════
    {
        id: 'content-step-8',
        type: 'content',
        durationInSeconds: 12,
        step: PROCEDURE_CAMBIO_POLIN_CT.pasos[7],
    },

    // ══════════════════════════════════════════════════════════════
    // AI CLIP: Documentation and closeout
    // Prompt: "Mining worker completing paperwork, documenting
    // maintenance, underground mine office area"
    // ══════════════════════════════════════════════════════════════
    {
        id: 'ai-10-cierre',
        type: 'ai',
        durationInSeconds: 5,
        src: 'ai-clips/polin-ct/10_registro_cierre.mp4',
    },

    // ══════════════════════════════════════════════════════════════
    // CONTENT: Step 9 - Closure (Stats)
    // ══════════════════════════════════════════════════════════════
    {
        id: 'content-step-9',
        type: 'content',
        durationInSeconds: 10,
        step: PROCEDURE_CAMBIO_POLIN_CT.pasos[8],
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
export const calculatePolinHybridDuration = (): number => {
    return POLIN_CT_HYBRID_SEGMENTS.reduce(
        (total, segment) => total + segment.durationInSeconds,
        0
    );
};

/**
 * Get segment by ID
 */
export const getPolinSegmentById = (id: string): VideoSegment | undefined => {
    return POLIN_CT_HYBRID_SEGMENTS.find((seg) => seg.id === id);
};

/**
 * AI Clip prompts for Minimax generation
 */
export const POLIN_AI_PROMPTS = {
    '01_tunel_subterraneo':
        'Cinematic establishing shot of underground mining tunnel with industrial conveyor belt system running through the center, dramatic lighting from mining lamps mounted on walls and helmets, dust particles visible in light beams, rocky walls with support beams, 4K cinematic quality, professional industrial documentary style',

    '02_polines_correa':
        'Close-up technical shot of conveyor belt idlers (support rollers) in underground mine, showing the cylindrical steel rollers supporting a heavy-duty rubber belt, industrial machinery detail, slight motion blur from belt movement, mining environment lighting',

    '03_epp_mineria':
        'Professional shot of underground mining personal protective equipment laid out: hard hat with integrated headlamp, clear safety goggles, N95 respirator mask, leather work gloves, high-visibility orange vest, self-rescuer device, arranged on industrial surface, clean professional lighting',

    '04_bloqueo_loto':
        'Industrial lockout tagout procedure scene, worker in mining PPE applying personal padlock to electrical disconnect panel, red "DO NOT OPERATE" tags visible, control panel with warning labels, underground mine electrical room, professional safety training video style',

    '05_inspeccion_area':
        'Mining worker in full PPE using headlamp to inspect underground tunnel ceiling for loose rocks, careful examination of rock bolting and mesh, dramatic shadows from lamp, documentary style footage of pre-work safety inspection',

    '06_retiro_polin':
        'Technical shot of maintenance workers using hydraulic jack to lift conveyor belt, removing damaged idler roller, underground mine setting, coordinated team effort, industrial maintenance procedure, practical lighting',

    '07_instalacion_polin':
        'Close-up of new idler roller being positioned into mounting brackets under conveyor belt, worker using torque wrench on bolts, alignment verification, professional maintenance procedure in mining environment',

    '08_prueba_arranque':
        'Conveyor belt slowly starting up in underground mine after maintenance, worker standing at safe distance observing operation, belt gaining speed, idler rollers turning smoothly, successful restart sequence',

    '09_emergencia_mina':
        'Emergency preparedness scene in underground mine: self-rescuer device being demonstrated, emergency escape route signs visible, emergency lighting system, refuge chamber entrance, professional safety training context',

    '10_registro_cierre':
        'Mining maintenance worker completing documentation on tablet device, logging work order completion, underground mine break room or office area, professional lighting, closeout procedure',
};

// Export summary for CLI/debugging
export const POLIN_HYBRID_VIDEO_SUMMARY = {
    totalSegments: POLIN_CT_HYBRID_SEGMENTS.length,
    totalDurationSeconds: calculatePolinHybridDuration(),
    aiSegments: POLIN_CT_HYBRID_SEGMENTS.filter(s => s.type === 'ai').length,
    contentSegments: POLIN_CT_HYBRID_SEGMENTS.filter(s => s.type === 'content').length,
    estimatedRenderTime: '3-4 minutes',
    aiClipsNeeded: 10,
};

export default POLIN_CT_HYBRID_SEGMENTS;
