// Tipos para procedimientos de seguridad
// Tipos de EPP disponibles
export type EPPType =
    | 'casco'
    | 'guantes'
    | 'lentes'
    | 'arnes'
    | 'zapatos'
    | 'chaleco'
    | 'respirador'
    | 'protector_auditivo'
    | 'lampara'
    | 'autorrescatador';

// Niveles de riesgo
export type RiskLevel = 'bajo' | 'medio' | 'alto' | 'critico';

// Tipos de video para el sistema híbrido
export type VideoType = 'manim' | 'ai' | 'static' | 'lottie';

// Configuración para clips de video IA (Minimax, Sora, etc.)
export interface AIVideoConfig {
    /** Tint color for color grading */
    tint?: string;
    /** Tint opacity (0-1) */
    tintOpacity?: number;
    /** Apply vignette effect */
    vignette?: boolean;
    /** Volume (0-1) */
    volume?: number;
    /** Start from this second */
    startFrom?: number;
}

// Configuración para clips de Manim
export interface ManimVideoConfig {
    /** Apply color grade overlay */
    colorGrade?: boolean;
    /** Grade tint color */
    gradeTint?: string;
    /** Ken Burns zoom effect */
    kenBurns?: boolean;
    /** Zoom range [start, end] */
    zoomRange?: [number, number];
}

export interface ProcedureStep {
    numero: number;
    titulo: string;
    contenido: string;
    duracion: number; // segundos
    imagen?: string; // URL de imagen de fondo (foto real de faena, equipo, etc.)
    lottie?: string; // URL o nombre de archivo de animación Lottie
    icono?: string; // Nombre de icono predefinido para el paso
    riesgo?: RiskLevel; // Nivel de riesgo del paso
    epp?: EPPType[]; // Lista de EPP requerido para el paso

    // === VIDEO HÍBRIDO (Manim + IA) ===
    /** Ruta a archivo de video (relativo a public/) */
    video?: string;
    /** Tipo de video: manim (whiteboard), ai (Minimax/Sora), static, lottie */
    videoType?: VideoType;
    /** Configuración específica para clips de video IA */
    aiVideoConfig?: AIVideoConfig;
    /** Configuración específica para clips de Manim */
    manimVideoConfig?: ManimVideoConfig;

    quiz?: {
        pregunta: string;
        opciones: string[];
        correcta: number;
    };
}

export interface Procedure {
    id: string;
    titulo: string;
    subtitulo?: string;
    duracion_total: number; // segundos
    pasos: ProcedureStep[];
    metadata?: {
        version: string;
        fecha_vigencia: string;
        normativa: string[];
    };
}
