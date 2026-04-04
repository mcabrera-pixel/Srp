'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/* ── Types ── */
interface GenerationConfig {
    docType: string;
    area: string;
    title: string;
    normativa: string[];
    detailLevel: number;
    context: string;
}

interface GeneratedSection {
    title: string;
    content: string;
}

/* ── Constants ── */
const DOC_TYPES = [
    { value: 'pts', label: 'Procedimiento de Trabajo Seguro (PTS)' },
    { value: 'instruccion', label: 'Instrucción Operativa' },
    { value: 'manual', label: 'Manual' },
    { value: 'protocolo', label: 'Protocolo de Emergencia' },
    { value: 'checklist', label: 'Check List' },
];

const AREAS = [
    'Planta Concentradora',
    'Fundición',
    'Mina Subterránea',
    'Refinería',
    'Taller Mecánico',
    'Protección Industrial',
    'Seguridad',
    'Todas las Áreas',
];

type NormCategory = 'decreto' | 'ecf' | 'iso' | 'interno';

interface NormativaOption {
    id: string;
    label: string;
    fullName: string;
    desc: string;
    category: NormCategory;
    relevantAreas: string[];
    relevantKeywords: string[];
    alwaysApply?: boolean;
}

const CATEGORY_META: Record<NormCategory, { color: string; icon: string; label: string }> = {
    decreto: { color: '#f59e0b', icon: '📜', label: 'Decreto Supremo' },
    ecf: { color: '#ef4444', icon: '⚠️', label: 'Estándar de Control de Fatalidades' },
    iso: { color: '#3b82f6', icon: '🌐', label: 'Norma Internacional' },
    interno: { color: '#8b5cf6', icon: '🏢', label: 'Normativa Interna' },
};

const ALL_AREAS = '__ALL__';

const NORMATIVA_OPTIONS: NormativaOption[] = [
    {
        id: 'ds132', label: 'DS 132',
        fullName: 'Decreto Supremo 132',
        desc: 'Reglamento de Seguridad Minera — Marco legal base para toda operación minera en Chile.',
        category: 'decreto',
        relevantAreas: [ALL_AREAS],
        relevantKeywords: [],
        alwaysApply: true,
    },
    {
        id: 'ds594', label: 'DS 594',
        fullName: 'Decreto Supremo 594',
        desc: 'Condiciones sanitarias y ambientales básicas en los lugares de trabajo.',
        category: 'decreto',
        relevantAreas: [ALL_AREAS],
        relevantKeywords: [],
        alwaysApply: true,
    },
    {
        id: 'ecf1', label: 'ECF-1',
        fullName: 'Aislación, Bloqueo y Permiso de Trabajo',
        desc: 'Aplica cuando se intervienen equipos con energías peligrosas (eléctrica, mecánica, hidráulica, neumática).',
        category: 'ecf',
        relevantAreas: ['Planta Concentradora', 'Fundición', 'Refinería', 'Taller Mecánico'],
        relevantKeywords: ['aislación', 'bloqueo', 'lockout', 'loto', 'energía', 'mantención', 'mantenimiento'],
    },
    {
        id: 'ecf2', label: 'ECF-2',
        fullName: 'Trabajo en Altura',
        desc: 'Aplica a trabajos sobre 1.8 m de altura con riesgo de caída. Incluye andamios, escaleras y techumbres.',
        category: 'ecf',
        relevantAreas: [ALL_AREAS],
        relevantKeywords: ['altura', 'andamio', 'escalera', 'techo', 'techumbre', 'caída'],
    },
    {
        id: 'ecf3', label: 'ECF-3',
        fullName: 'Espacios Confinados',
        desc: 'Aplica al ingreso a espacios con acceso restringido, ventilación insuficiente o riesgo de atmósfera peligrosa.',
        category: 'ecf',
        relevantAreas: ['Planta Concentradora', 'Fundición', 'Refinería', 'Mina Subterránea'],
        relevantKeywords: ['confinado', 'espacio', 'tanque', 'silo', 'tolva', 'estanque', 'cámara'],
    },
    {
        id: 'ecf4', label: 'ECF-4',
        fullName: 'Izaje de Cargas',
        desc: 'Aplica en operaciones con grúas, puentes grúa, aparejos de levante y maniobras de cargas suspendidas.',
        category: 'ecf',
        relevantAreas: ['Planta Concentradora', 'Fundición', 'Taller Mecánico', 'Mina Subterránea'],
        relevantKeywords: ['izaje', 'grúa', 'carga', 'levantamiento', 'maniobra', 'eslinga'],
    },
    {
        id: 'ecf5', label: 'ECF-5',
        fullName: 'Vehículos Livianos',
        desc: 'Aplica a la conducción de vehículos livianos dentro y fuera de faena minera.',
        category: 'ecf',
        relevantAreas: ['Mina Subterránea', 'Todas las Áreas'],
        relevantKeywords: ['vehículo', 'camioneta', 'conducción', 'transporte', 'traslado'],
    },
    {
        id: 'ecf6', label: 'ECF-6',
        fullName: 'Equipos y Herramientas Portátiles y Manuales',
        desc: 'Aplica al uso de herramientas eléctricas, neumáticas, hidráulicas y manuales.',
        category: 'ecf',
        relevantAreas: [ALL_AREAS],
        relevantKeywords: ['herramienta', 'equipo', 'esmeril', 'soldadura', 'amoladora', 'taladro'],
    },
    {
        id: 'ecf7', label: 'ECF-7',
        fullName: 'Materiales o Sustancias Peligrosas',
        desc: 'Aplica a la manipulación, almacenamiento y transporte de sustancias químicas peligrosas.',
        category: 'ecf',
        relevantAreas: ['Planta Concentradora', 'Fundición', 'Refinería'],
        relevantKeywords: ['químico', 'peligroso', 'sustancia', 'ácido', 'reactivo', 'hds', 'sds'],
    },
    {
        id: 'ecf8', label: 'ECF-8',
        fullName: 'Guardas y Protecciones de Equipos',
        desc: 'Aplica a equipos con partes móviles expuestas: correas, rodillos, engranajes, poleas.',
        category: 'ecf',
        relevantAreas: ['Planta Concentradora', 'Fundición', 'Taller Mecánico'],
        relevantKeywords: ['guarda', 'protección', 'máquina', 'correa', 'rodillo', 'polea', 'engranaje'],
    },
    {
        id: 'ecf9', label: 'ECF-9',
        fullName: 'Explosivos',
        desc: 'Aplica a operaciones de tronadura, manipulación de explosivos y detonadores.',
        category: 'ecf',
        relevantAreas: ['Mina Subterránea'],
        relevantKeywords: ['explosivo', 'tronadura', 'detonación', 'polvorín', 'anfo', 'detonador'],
    },
    {
        id: 'ecf10', label: 'ECF-10',
        fullName: 'Incendio',
        desc: 'Aplica a prevención y respuesta a incendios. Incluye trabajo en caliente y brigadas de emergencia.',
        category: 'ecf',
        relevantAreas: [ALL_AREAS],
        relevantKeywords: ['incendio', 'fuego', 'extintor', 'emergencia', 'caliente', 'llama'],
    },
    {
        id: 'ecf11', label: 'ECF-11',
        fullName: 'Equipos Móviles',
        desc: 'Aplica a la operación de camiones, excavadoras, cargadores, bulldozers y otros equipos pesados.',
        category: 'ecf',
        relevantAreas: ['Mina Subterránea', 'Planta Concentradora'],
        relevantKeywords: ['equipo móvil', 'camión', 'excavadora', 'cargador', 'bulldozer', 'pala'],
    },
    {
        id: 'ecf12', label: 'ECF-12',
        fullName: 'Planos Inclinados y Escaleras',
        desc: 'Aplica a trabajos en rampas, planos inclinados y escaleras permanentes de faena.',
        category: 'ecf',
        relevantAreas: ['Mina Subterránea'],
        relevantKeywords: ['inclinado', 'rampa', 'pendiente', 'plano', 'declive'],
    },
    {
        id: 'nch45001', label: 'NCh ISO 45001',
        fullName: 'Sistema de Gestión de Seguridad y Salud en el Trabajo',
        desc: 'Norma internacional de referencia para sistemas de gestión SST. Siempre aplica.',
        category: 'iso',
        relevantAreas: [ALL_AREAS],
        relevantKeywords: [],
        alwaysApply: true,
    },
    {
        id: 'reglamento', label: 'Reg. Interno',
        fullName: 'Reglamento Interno de Orden, Higiene y Seguridad',
        desc: 'Normativa interna de la empresa. Siempre aplica como marco regulador interno.',
        category: 'interno',
        relevantAreas: [ALL_AREAS],
        relevantKeywords: [],
        alwaysApply: true,
    },
];

/* ── Smart Normativa Suggestion Engine ── */
function getSmartNormativas(config: GenerationConfig): string[] {
    const titleLower = config.title.toLowerCase();
    const suggested: string[] = [];

    for (const norm of NORMATIVA_OPTIONS) {
        // Always-apply norms
        if (norm.alwaysApply) {
            suggested.push(norm.id);
            continue;
        }

        // Check area relevance
        const areaMatch = norm.relevantAreas.includes(ALL_AREAS) ||
            norm.relevantAreas.some(a => config.area.includes(a));

        // Check keyword match in title
        const keywordMatch = norm.relevantKeywords.some(kw => titleLower.includes(kw.toLowerCase()));

        if (keywordMatch) {
            // Keyword match = strong signal, always suggest
            suggested.push(norm.id);
        } else if (areaMatch && config.title.trim()) {
            // Area match only = suggest if title is provided
            suggested.push(norm.id);
        }
    }

    return suggested;
}

const STEPS = [
    { id: 1, label: 'Configurar', icon: '⚙️' },
    { id: 2, label: 'Generar', icon: '🤖' },
    { id: 3, label: 'Revisar', icon: '🔍' },
    { id: 4, label: 'Publicar', icon: '🚀' },
];

/* ── Mock AI generation result ── */
function generateDocument(config: GenerationConfig): GeneratedSection[] {
    const normLabels = config.normativa
        .map(id => NORMATIVA_OPTIONS.find(n => n.id === id))
        .filter(Boolean)
        .map(n => `${n!.label} — ${n!.desc}`);

    return [
        {
            title: '1. OBJETIVO',
            content: `Establecer las condiciones, controles y medidas de seguridad necesarias para la ejecución segura de trabajos en el área de ${config.area}, asegurando la protección de todos los trabajadores, tanto propios como contratistas, y el cumplimiento de la normativa vigente.`,
        },
        {
            title: '2. ALCANCE',
            content: `Este procedimiento aplica a todo el personal propio y contratista que realice actividades relacionadas con "${config.title}" en el área de ${config.area}. Incluye actividades de preparación, ejecución, supervisión y cierre de los trabajos descritos.`,
        },
        {
            title: '3. REFERENCIAS NORMATIVAS',
            content: normLabels.map(n => `• ${n}`).join('\n'),
        },
        {
            title: '4. DEFINICIONES',
            content: `• Área de trabajo: Zona delimitada y señalizada donde se ejecutan las actividades.\n• Permiso de trabajo: Documento autorizado por el supervisor responsable.\n• Análisis de riesgo: Evaluación documentada de los peligros y controles asociados.\n• EPP: Equipo de Protección Personal requerido según la actividad.\n• Supervisor responsable: Persona designada con autoridad para aprobar y supervisar las actividades.`,
        },
        {
            title: '5. RESPONSABILIDADES',
            content: `**Gerente de Área:**\n• Asegurar los recursos necesarios para el cumplimiento del procedimiento.\n• Verificar la implementación de controles críticos.\n\n**Supervisor Directo:**\n• Verificar condiciones de seguridad antes de iniciar trabajos.\n• Emitir y controlar permisos de trabajo.\n• Realizar charla de 5 minutos incluyendo los riesgos específicos.\n\n**Trabajadores:**\n• Cumplir las instrucciones del presente procedimiento.\n• Reportar condiciones sub-estándar.\n• Utilizar correctamente los EPP asignados.\n• Ejercer el derecho a negarse a trabajar en condiciones inseguras.`,
        },
        {
            title: '6. EQUIPOS DE PROTECCIÓN PERSONAL',
            content: `• Casco de seguridad con barbiquejo\n• Lentes de seguridad\n• Zapatos/botas de seguridad con punta de acero\n• Guantes según actividad\n• Protección auditiva (en zonas > 85 dB)\n• Ropa de trabajo con cintas reflectantes\n• Arnés de seguridad (si aplica trabajo en altura)`,
        },
        {
            title: '7. PROCEDIMIENTO',
            content: `**7.1 Preparación:**\n1. Verificar que existe permiso de trabajo vigente para la actividad.\n2. Realizar AST (Análisis de Seguridad del Trabajo) con todo el equipo.\n3. Inspeccionar el área de trabajo e identificar peligros.\n4. Verificar disponibilidad de EPP y equipos en buen estado.\n5. Delimitar y señalizar el área de trabajo.\n\n**7.2 Ejecución:**\n6. Ejecutar las actividades según lo planificado en el AST.\n7. Mantener orden y limpieza durante toda la ejecución.\n8. Verificar condiciones continuamente durante la actividad.\n${config.context ? `\n**7.3 Condiciones específicas:**\n${config.context}\n` : ''}\n**7.${config.context ? '4' : '3'} Cierre:**\n${config.context ? '9' : '8'}. Retirar señalización y materiales del área.\n${config.context ? '10' : '9'}. Realizar inspección final del área.\n${config.context ? '11' : '10'}. Cerrar el permiso de trabajo con el supervisor.`,
        },
        {
            title: '8. REGISTROS',
            content: `• Permiso de Trabajo\n• AST — Análisis de Seguridad del Trabajo\n• Registro de charla de 5 minutos\n• Check list de inspección de EPP\n• Registro de capacitación del personal`,
        },
    ];
}

/* ── Component ── */
export default function GeneratePage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [visibleSections, setVisibleSections] = useState(0);
    const [generatedDoc, setGeneratedDoc] = useState<GeneratedSection[]>([]);
    const [complianceChecked, setComplianceChecked] = useState(false);
    const [compliancePassed, setCompliancePassed] = useState(false);
    const [reviewComment, setReviewComment] = useState('');
    const [saving, setSaving] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [config, setConfig] = useState<GenerationConfig>({
        docType: 'pts',
        area: 'Mina Subterránea',
        title: '',
        normativa: ['ds132', 'ds594'],
        detailLevel: 75,
        context: '',
    });

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const suggestedNorms = useMemo(() => getSmartNormativas(config), [config.area, config.title, config.docType]);

    const [hoveredNorm, setHoveredNorm] = useState<string | null>(null);

    function toggleNormativa(id: string) {
        setConfig(prev => ({
            ...prev,
            normativa: prev.normativa.includes(id)
                ? prev.normativa.filter(n => n !== id)
                : [...prev.normativa, id],
        }));
    }

    const applySmartSelection = useCallback(() => {
        setConfig(prev => ({ ...prev, normativa: [...suggestedNorms] }));
    }, [suggestedNorms]);

    function handleGenerate() {
        if (!config.title.trim()) return;
        setCurrentStep(2);
        setGenerating(true);
        setProgress(0);
        setVisibleSections(0);
        setGeneratedDoc([]);

        const doc = generateDocument(config);
        const totalSections = doc.length;
        let currentProgress = 0;

        intervalRef.current = setInterval(() => {
            currentProgress += Math.random() * 8 + 3;
            if (currentProgress >= 100) {
                currentProgress = 100;
                if (intervalRef.current) clearInterval(intervalRef.current);
                setGenerating(false);
            }

            setProgress(Math.min(currentProgress, 100));
            const sectionsToShow = Math.floor((currentProgress / 100) * totalSections);
            setVisibleSections(sectionsToShow);
            setGeneratedDoc(doc.slice(0, sectionsToShow));

            if (currentProgress >= 100) {
                setGeneratedDoc(doc);
                setVisibleSections(totalSections);
            }
        }, 400);
    }

    function handleComplianceCheck() {
        setComplianceChecked(false);
        setTimeout(() => {
            setCompliancePassed(true);
            setComplianceChecked(true);
        }, 1500);
    }

    async function handlePublish(status: 'borrador' | 'revision') {
        setSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));
        setSaving(false);
        router.push('/dashboard/procedures');
    }

    const docTypeLabel = DOC_TYPES.find(t => t.value === config.docType)?.label || '';
    const generatedCode = `PTS-${config.area.substring(0, 3).toUpperCase()}-${String(Math.floor(Math.random() * 900 + 100))}`;

    return (
        <div className="generate-page">
            {/* Top Stepper */}
            <div className="wizard-header">
                <div>
                    <h1>SRP Docs — Generador de Procedimientos</h1>
                    <p className="text-secondary">Crea un procedimiento de trabajo seguro con asistencia de IA</p>
                </div>
                <div className="wizard-stepper">
                    {STEPS.map((step) => (
                        <div
                            key={step.id}
                            className={`wizard-step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
                        >
                            <div className="step-dot">
                                {currentStep > step.id ? '✓' : step.icon}
                            </div>
                            <span className="step-label">{step.label}</span>
                            {step.id < STEPS.length && <div className="step-connector" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step 1: Configure */}
            {currentStep === 1 && (
                <div className="step-content">
                    <div className="config-layout">
                        <div className="config-form glass-card-static">
                            <h2 style={{ marginBottom: 'var(--space-lg)' }}>Configuración del Documento</h2>

                            <div className="form-field">
                                <label className="glass-input-label" htmlFor="gen-type">Tipo de Documento</label>
                                <select
                                    id="gen-type"
                                    className="glass-input"
                                    value={config.docType}
                                    onChange={e => setConfig(p => ({ ...p, docType: e.target.value }))}
                                >
                                    {DOC_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-field">
                                <label className="glass-input-label" htmlFor="gen-area">Área / Faena</label>
                                <select
                                    id="gen-area"
                                    className="glass-input"
                                    value={config.area}
                                    onChange={e => setConfig(p => ({ ...p, area: e.target.value }))}
                                >
                                    {AREAS.map(a => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-field">
                                <label className="glass-input-label" htmlFor="gen-title">Título del Procedimiento</label>
                                <input
                                    id="gen-title"
                                    className="glass-input"
                                    placeholder="Ej: Procedimiento de Ingreso a Espacios Confinados"
                                    value={config.title}
                                    onChange={e => setConfig(p => ({ ...p, title: e.target.value }))}
                                />
                            </div>

                            <div className="form-field">
                                <div className="normativa-header">
                                    <label className="glass-input-label">Normativa Aplicable</label>
                                    <button
                                        className="btn-smart-select"
                                        onClick={applySmartSelection}
                                        title="Seleccionar automáticamente según área y título"
                                    >
                                        🤖 Auto-seleccionar ({suggestedNorms.length})
                                    </button>
                                </div>

                                {/* Category groups */}
                                {(['decreto', 'ecf', 'iso', 'interno'] as NormCategory[]).map(cat => {
                                    const catNorms = NORMATIVA_OPTIONS.filter(n => n.category === cat);
                                    const meta = CATEGORY_META[cat];
                                    return (
                                        <div key={cat} className="normativa-group">
                                            <div className="normativa-group-label">
                                                <span className="cat-dot" style={{ background: meta.color }} />
                                                <span>{meta.icon} {meta.label}</span>
                                            </div>
                                            <div className="normativa-cards">
                                                {catNorms.map(n => {
                                                    const isSelected = config.normativa.includes(n.id);
                                                    const isSuggested = suggestedNorms.includes(n.id);
                                                    const isHovered = hoveredNorm === n.id;
                                                    return (
                                                        <button
                                                            key={n.id}
                                                            className={`norm-card ${isSelected ? 'selected' : ''} ${isSuggested && !isSelected ? 'suggested' : ''}`}
                                                            onClick={() => toggleNormativa(n.id)}
                                                            onMouseEnter={() => setHoveredNorm(n.id)}
                                                            onMouseLeave={() => setHoveredNorm(null)}
                                                            style={{ borderColor: isSelected ? meta.color : undefined }}
                                                        >
                                                            <div className="norm-card-top">
                                                                <span className="norm-label" style={{ color: isSelected ? meta.color : undefined }}>
                                                                    {n.label}
                                                                </span>
                                                                {isSuggested && (
                                                                    <span className="norm-suggested-badge">✨ Sugerido</span>
                                                                )}
                                                            </div>
                                                            <span className="norm-fullname">{n.fullName}</span>
                                                            {(isHovered || isSelected) && (
                                                                <span className="norm-desc">{n.desc}</span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="normativa-count">
                                    {config.normativa.length} normativa{config.normativa.length !== 1 ? 's' : ''} seleccionada{config.normativa.length !== 1 ? 's' : ''}
                                </div>
                            </div>

                            <div className="form-field">
                                <label className="glass-input-label">
                                    Nivel de Detalle: {config.detailLevel}%
                                </label>
                                <div className="slider-row">
                                    <span className="text-xs text-muted">Básico</span>
                                    <input
                                        type="range"
                                        min={25}
                                        max={100}
                                        value={config.detailLevel}
                                        onChange={e => setConfig(p => ({ ...p, detailLevel: parseInt(e.target.value) }))}
                                        className="detail-slider"
                                    />
                                    <span className="text-xs text-muted">Detallado</span>
                                </div>
                            </div>

                            <div className="form-field">
                                <label className="glass-input-label" htmlFor="gen-context">Contexto Adicional (opcional)</label>
                                <textarea
                                    id="gen-context"
                                    className="glass-input"
                                    rows={4}
                                    placeholder="Describe condiciones específicas del área, equipos involucrados, riesgos particulares..."
                                    value={config.context}
                                    onChange={e => setConfig(p => ({ ...p, context: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="config-preview glass-card-static">
                            <h3 style={{ marginBottom: 'var(--space-md)' }}>Vista Previa de Configuración</h3>
                            <div className="preview-item">
                                <span className="text-xs text-muted">Tipo</span>
                                <span className="text-sm">{docTypeLabel}</span>
                            </div>
                            <div className="preview-item">
                                <span className="text-xs text-muted">Área</span>
                                <span className="text-sm">{config.area}</span>
                            </div>
                            <div className="preview-item">
                                <span className="text-xs text-muted">Título</span>
                                <span className="text-sm">{config.title || '—'}</span>
                            </div>
                            <div className="preview-item">
                                <span className="text-xs text-muted">Normativa</span>
                                <span className="text-sm">
                                    {config.normativa.length > 0
                                        ? config.normativa.map(id => NORMATIVA_OPTIONS.find(n => n.id === id)?.label).join(', ')
                                        : 'Ninguna seleccionada'}
                                </span>
                            </div>
                            <div className="preview-item">
                                <span className="text-xs text-muted">Detalle</span>
                                <div className="detail-bar-track">
                                    <div className="detail-bar-fill" style={{ width: `${config.detailLevel}%` }} />
                                </div>
                            </div>

                            <div className="preview-badges">
                                <div className="preview-badge">
                                    <span>🛡️</span>
                                    <span className="text-xs">SRP Guard validará automáticamente</span>
                                </div>
                                <div className="preview-badge">
                                    <span>📹</span>
                                    <span className="text-xs">SRP Learn generará video de capacitación</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="step-actions">
                        <button className="btn btn-secondary" onClick={() => router.push('/dashboard/procedures')}>
                            Cancelar
                        </button>
                        <button
                            className="btn btn-primary"
                            disabled={!config.title.trim()}
                            onClick={handleGenerate}
                        >
                            🤖 Generar con IA
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Generate */}
            {currentStep === 2 && (
                <div className="step-content">
                    <div className="generate-layout">
                        <div className="generate-preview glass-card-static">
                            <div className="doc-preview-header">
                                <div>
                                    <h2>{config.title || 'PROCEDIMIENTO DE TRABAJO SEGURO'}</h2>
                                    <span className="text-xs text-accent" style={{ fontFamily: 'var(--font-mono)' }}>
                                        Código: {generatedCode}
                                    </span>
                                </div>
                                <span className="badge badge-info">{docTypeLabel}</span>
                            </div>

                            <div className="doc-preview-body">
                                {generatedDoc.map((section, i) => (
                                    <div key={i} className="doc-section" style={{ animationDelay: `${i * 100}ms` }}>
                                        <h3 className="section-title">{section.title}</h3>
                                        <p className="section-content">{section.content}</p>
                                    </div>
                                ))}

                                {generating && (
                                    <div className="typing-indicator">
                                        <span className="typing-dot" />
                                        <span className="typing-dot" />
                                        <span className="typing-dot" />
                                    </div>
                                )}
                            </div>

                            <div className="progress-section">
                                <div className="progress-bar-track">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <span className="text-xs text-secondary">
                                    {progress < 100
                                        ? `Generando... ${Math.round(progress)}% completado`
                                        : '✅ Generación completada'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="step-actions">
                        <button className="btn btn-secondary" onClick={() => { setCurrentStep(1); setGenerating(false); if (intervalRef.current) clearInterval(intervalRef.current); }}>
                            ← Volver
                        </button>
                        <button
                            className="btn btn-primary"
                            disabled={generating}
                            onClick={() => { setCurrentStep(3); handleComplianceCheck(); }}
                        >
                            Continuar a Revisión →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
                <div className="step-content">
                    <div className="review-layout">
                        <div className="review-doc glass-card-static">
                            <div className="review-doc-header">
                                <h2>{config.title}</h2>
                                <span className="badge badge-info">{generatedCode}</span>
                            </div>

                            {generatedDoc.map((section, i) => (
                                <div key={i} className="review-section">
                                    <h3 className="section-title">{section.title}</h3>
                                    <pre className="section-content-pre">{section.content}</pre>
                                </div>
                            ))}
                        </div>

                        <div className="review-panel">
                            <div className="glass-card-static">
                                <h3 style={{ marginBottom: 'var(--space-md)' }}>🛡️ Validación SRP Guard</h3>
                                {!complianceChecked ? (
                                    <div className="compliance-loading">
                                        <div className="loading-spinner-small" />
                                        <span className="text-sm text-secondary">Validando contra normativa...</span>
                                    </div>
                                ) : (
                                    <div className="compliance-result">
                                        <div className={`compliance-badge ${compliancePassed ? 'pass' : 'fail'}`}>
                                            {compliancePassed ? '✅' : '❌'}
                                            <span>{compliancePassed ? 'Cumple normativa vigente' : 'Observaciones detectadas'}</span>
                                        </div>
                                        <div className="compliance-details">
                                            {config.normativa.map(id => {
                                                const norm = NORMATIVA_OPTIONS.find(n => n.id === id);
                                                return norm ? (
                                                    <div key={id} className="compliance-line">
                                                        <span className="text-xs">✅ {norm.label}</span>
                                                        <span className="text-xs text-muted">{norm.desc}</span>
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="glass-card-static">
                                <h3 style={{ marginBottom: 'var(--space-md)' }}>💬 Observaciones</h3>
                                <textarea
                                    className="glass-input"
                                    rows={4}
                                    placeholder="Agregar comentario o observación..."
                                    value={reviewComment}
                                    onChange={e => setReviewComment(e.target.value)}
                                />
                            </div>

                            <div className="glass-card-static">
                                <h3 style={{ marginBottom: 'var(--space-md)' }}>📋 Metadatos</h3>
                                <div className="meta-grid">
                                    <div className="meta-item">
                                        <span className="text-xs text-muted">Código</span>
                                        <span className="text-sm">{generatedCode}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="text-xs text-muted">Tipo</span>
                                        <span className="text-sm">{docTypeLabel}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="text-xs text-muted">Área</span>
                                        <span className="text-sm">{config.area}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="text-xs text-muted">Generado por</span>
                                        <span className="text-sm">🤖 SRP Docs (IA)</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="text-xs text-muted">Secciones</span>
                                        <span className="text-sm">{generatedDoc.length}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="text-xs text-muted">Versión</span>
                                        <span className="text-sm">v1.0</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="step-actions">
                        <button className="btn btn-secondary" onClick={() => setCurrentStep(2)}>
                            ← Volver
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => setCurrentStep(4)}
                            disabled={!complianceChecked}
                        >
                            Continuar a Publicar →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 4: Publish */}
            {currentStep === 4 && (
                <div className="step-content">
                    <div className="publish-layout">
                        <div className="publish-card glass-card-static">
                            <div className="publish-icon">🚀</div>
                            <h2>Documento listo para publicar</h2>
                            <p className="text-secondary" style={{ marginBottom: 'var(--space-xl)' }}>
                                Selecciona el estado inicial del procedimiento
                            </p>

                            <div className="publish-summary glass-card-static">
                                <div className="publish-summary-row">
                                    <span className="text-muted text-sm">Título</span>
                                    <span>{config.title}</span>
                                </div>
                                <div className="publish-summary-row">
                                    <span className="text-muted text-sm">Código</span>
                                    <span className="text-accent" style={{ fontFamily: 'var(--font-mono)' }}>{generatedCode}</span>
                                </div>
                                <div className="publish-summary-row">
                                    <span className="text-muted text-sm">Tipo</span>
                                    <span>{docTypeLabel}</span>
                                </div>
                                <div className="publish-summary-row">
                                    <span className="text-muted text-sm">Área</span>
                                    <span>{config.area}</span>
                                </div>
                                <div className="publish-summary-row">
                                    <span className="text-muted text-sm">Normativa</span>
                                    <span>{config.normativa.map(id => NORMATIVA_OPTIONS.find(n => n.id === id)?.label).join(', ')}</span>
                                </div>
                                <div className="publish-summary-row">
                                    <span className="text-muted text-sm">Compliance</span>
                                    <span className="badge badge-success">✅ Aprobado</span>
                                </div>
                                <div className="publish-summary-row">
                                    <span className="text-muted text-sm">Secciones</span>
                                    <span>{generatedDoc.length}</span>
                                </div>
                            </div>

                            <div className="publish-actions">
                                <button
                                    className="btn btn-secondary publish-option"
                                    onClick={() => handlePublish('borrador')}
                                    disabled={saving}
                                >
                                    <span className="publish-option-icon">📝</span>
                                    <span className="publish-option-label">Guardar como Borrador</span>
                                    <span className="text-xs text-muted">Se guarda para edición posterior</span>
                                </button>
                                <button
                                    className="btn btn-primary publish-option"
                                    onClick={() => handlePublish('revision')}
                                    disabled={saving}
                                >
                                    <span className="publish-option-icon">🔍</span>
                                    <span className="publish-option-label">Enviar a Revisión</span>
                                    <span className="text-xs" style={{ opacity: 0.8 }}>Se envía al flujo de aprobación</span>
                                </button>
                            </div>

                            {saving && (
                                <div className="saving-indicator">
                                    <div className="loading-spinner-small" />
                                    <span className="text-sm text-secondary">Guardando procedimiento...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="step-actions">
                        <button className="btn btn-secondary" onClick={() => setCurrentStep(3)} disabled={saving}>
                            ← Volver
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                .generate-page {
                    animation: fadeIn 300ms ease;
                }

                /* ── Wizard Header ── */
                .wizard-header {
                    margin-bottom: var(--space-xl);
                }

                .wizard-header h1 {
                    margin-bottom: var(--space-xs);
                }

                .wizard-stepper {
                    display: flex;
                    align-items: center;
                    gap: 0;
                    margin-top: var(--space-lg);
                    padding: var(--space-md) var(--space-lg);
                    background: var(--bg-glass);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    backdrop-filter: blur(16px);
                }

                .wizard-step {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    position: relative;
                    flex: 1;
                }

                .step-dot {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.875rem;
                    background: var(--bg-tertiary);
                    border: 2px solid var(--border);
                    transition: all var(--transition-base);
                    flex-shrink: 0;
                }

                .wizard-step.active .step-dot {
                    background: var(--accent-glow-strong);
                    border-color: var(--accent);
                    box-shadow: 0 0 16px var(--accent-glow);
                }

                .wizard-step.completed .step-dot {
                    background: var(--success-bg);
                    border-color: var(--success);
                    color: var(--success);
                }

                .step-label {
                    font-size: 0.8125rem;
                    color: var(--text-tertiary);
                    font-weight: 500;
                    white-space: nowrap;
                }

                .wizard-step.active .step-label {
                    color: var(--accent);
                    font-weight: 600;
                }

                .wizard-step.completed .step-label {
                    color: var(--success);
                }

                .step-connector {
                    flex: 1;
                    height: 2px;
                    background: var(--border);
                    margin: 0 var(--space-sm);
                    min-width: 20px;
                }

                .wizard-step.completed .step-connector {
                    background: var(--success);
                    opacity: 0.5;
                }

                /* ── Step Content ── */
                .step-content {
                    animation: slideUp 300ms ease;
                }

                /* ── Step 1: Configure ── */
                .config-layout {
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr;
                    gap: var(--space-xl);
                    margin-bottom: var(--space-xl);
                }

                .form-field {
                    margin-bottom: var(--space-lg);
                }

                /* ── Enhanced Normativa Section ── */
                .normativa-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-sm);
                }

                .btn-smart-select {
                    padding: 6px 14px;
                    border-radius: var(--radius-full);
                    font-size: 0.75rem;
                    font-weight: 600;
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15));
                    color: #a78bfa;
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    letter-spacing: 0.01em;
                }

                .btn-smart-select:hover {
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(139, 92, 246, 0.25));
                    border-color: rgba(139, 92, 246, 0.6);
                    box-shadow: 0 0 16px rgba(139, 92, 246, 0.2);
                    transform: translateY(-1px);
                }

                .normativa-group {
                    margin-bottom: var(--space-md);
                }

                .normativa-group-label {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    font-size: 0.6875rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: var(--text-tertiary);
                    margin-bottom: var(--space-sm);
                }

                .cat-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .normativa-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: var(--space-sm);
                }

                .norm-card {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                    padding: 10px 14px;
                    border-radius: var(--radius-md);
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    text-align: left;
                    min-height: 52px;
                }

                .norm-card:hover {
                    border-color: var(--text-tertiary);
                    background: rgba(255, 255, 255, 0.04);
                    transform: translateY(-1px);
                }

                .norm-card.selected {
                    background: rgba(255, 255, 255, 0.06);
                    box-shadow: 0 0 12px rgba(255, 255, 255, 0.03);
                }

                .norm-card.suggested:not(.selected) {
                    border-style: dashed;
                    border-color: rgba(139, 92, 246, 0.4);
                    background: rgba(139, 92, 246, 0.04);
                }

                .norm-card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: var(--space-sm);
                }

                .norm-label {
                    font-size: 0.8125rem;
                    font-weight: 700;
                    letter-spacing: 0.01em;
                    color: var(--text-primary);
                    white-space: nowrap;
                }

                .norm-suggested-badge {
                    font-size: 0.625rem;
                    font-weight: 600;
                    color: #a78bfa;
                    white-space: nowrap;
                    animation: pulse 2s ease infinite;
                }

                .norm-fullname {
                    font-size: 0.6875rem;
                    color: var(--text-secondary);
                    line-height: 1.3;
                }

                .norm-desc {
                    font-size: 0.625rem;
                    color: var(--text-tertiary);
                    line-height: 1.4;
                    margin-top: 2px;
                    animation: fadeIn 200ms ease;
                }

                .normativa-count {
                    font-size: 0.75rem;
                    color: var(--text-tertiary);
                    text-align: right;
                    margin-top: var(--space-xs);
                }

                .slider-row {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                }

                .detail-slider {
                    flex: 1;
                    -webkit-appearance: none;
                    appearance: none;
                    height: 6px;
                    background: var(--bg-tertiary);
                    border-radius: 3px;
                    outline: none;
                }

                .detail-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: var(--accent);
                    cursor: pointer;
                    box-shadow: 0 0 8px var(--accent-glow);
                }

                /* ── Config Preview ── */
                .config-preview {
                    position: sticky;
                    top: var(--space-xl);
                    align-self: start;
                }

                .preview-item {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    padding: var(--space-sm) 0;
                    border-bottom: 1px solid var(--border);
                }

                .preview-item:last-of-type {
                    border-bottom: none;
                }

                .detail-bar-track {
                    width: 100%;
                    height: 6px;
                    background: var(--bg-tertiary);
                    border-radius: 3px;
                    overflow: hidden;
                    margin-top: 4px;
                }

                .detail-bar-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--accent), var(--accent-light));
                    border-radius: 3px;
                    transition: width 300ms ease;
                }

                .preview-badges {
                    margin-top: var(--space-lg);
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-sm);
                }

                .preview-badge {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    padding: var(--space-sm) var(--space-md);
                    background: var(--bg-tertiary);
                    border-radius: var(--radius-md);
                    color: var(--text-secondary);
                }

                /* ── Step 2: Generate ── */
                .generate-layout {
                    margin-bottom: var(--space-xl);
                }

                .doc-preview-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: var(--space-xl);
                    padding-bottom: var(--space-lg);
                    border-bottom: 1px solid var(--border);
                }

                .doc-preview-body {
                    min-height: 300px;
                }

                .doc-section {
                    margin-bottom: var(--space-lg);
                    animation: slideUp 400ms ease both;
                }

                .section-title {
                    font-size: 0.9375rem;
                    font-weight: 600;
                    color: var(--accent);
                    margin-bottom: var(--space-sm);
                }

                .section-content {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    line-height: 1.7;
                    white-space: pre-line;
                }

                .typing-indicator {
                    display: flex;
                    gap: 4px;
                    padding: var(--space-md) 0;
                }

                .typing-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: var(--accent);
                    animation: pulse 1s ease infinite;
                }

                .typing-dot:nth-child(2) { animation-delay: 200ms; }
                .typing-dot:nth-child(3) { animation-delay: 400ms; }

                .progress-section {
                    margin-top: var(--space-xl);
                    padding-top: var(--space-lg);
                    border-top: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-sm);
                }

                .progress-bar-track {
                    width: 100%;
                    height: 8px;
                    background: var(--bg-tertiary);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-bar-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--accent), var(--accent-light));
                    border-radius: 4px;
                    transition: width 300ms ease;
                }

                /* ── Step 3: Review ── */
                .review-layout {
                    display: grid;
                    grid-template-columns: 1.3fr 0.7fr;
                    gap: var(--space-xl);
                    margin-bottom: var(--space-xl);
                }

                .review-doc-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-xl);
                    padding-bottom: var(--space-lg);
                    border-bottom: 1px solid var(--border);
                }

                .review-section {
                    margin-bottom: var(--space-lg);
                    padding-bottom: var(--space-lg);
                    border-bottom: 1px solid var(--border);
                }

                .review-section:last-child {
                    border-bottom: none;
                }

                .section-content-pre {
                    font-family: var(--font-sans);
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    line-height: 1.7;
                    white-space: pre-line;
                    background: none;
                    border: none;
                    margin: 0;
                    padding: 0;
                }

                .review-panel {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-lg);
                }

                .compliance-loading {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    padding: var(--space-md);
                }

                .loading-spinner-small {
                    width: 20px;
                    height: 20px;
                    border: 2px solid var(--border);
                    border-top-color: var(--accent);
                    border-radius: 50%;
                    animation: spin 800ms linear infinite;
                }

                @keyframes spin { to { transform: rotate(360deg); } }

                .compliance-result {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-md);
                }

                .compliance-badge {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    padding: var(--space-sm) var(--space-md);
                    border-radius: var(--radius-md);
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .compliance-badge.pass {
                    background: var(--success-bg);
                    color: var(--success);
                }

                .compliance-badge.fail {
                    background: var(--error-bg);
                    color: var(--error);
                }

                .compliance-details {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .compliance-line {
                    display: flex;
                    justify-content: space-between;
                    padding: 4px 0;
                }

                .meta-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--space-md);
                }

                .meta-item {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                /* ── Step 4: Publish ── */
                .publish-layout {
                    display: flex;
                    justify-content: center;
                    margin-bottom: var(--space-xl);
                }

                .publish-card {
                    max-width: 640px;
                    width: 100%;
                    text-align: center;
                }

                .publish-icon {
                    font-size: 3rem;
                    margin-bottom: var(--space-md);
                }

                .publish-summary {
                    text-align: left;
                    margin-bottom: var(--space-xl);
                }

                .publish-summary-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--space-sm) 0;
                    border-bottom: 1px solid var(--border);
                    font-size: 0.875rem;
                }

                .publish-summary-row:last-child {
                    border-bottom: none;
                }

                .publish-actions {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--space-md);
                }

                .publish-option {
                    flex-direction: column;
                    padding: var(--space-lg);
                    height: auto;
                    gap: var(--space-xs);
                    text-align: center;
                }

                .publish-option-icon {
                    font-size: 1.5rem;
                }

                .publish-option-label {
                    font-weight: 600;
                    font-size: 0.9375rem;
                }

                .saving-indicator {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: var(--space-md);
                    margin-top: var(--space-lg);
                }

                /* ── Step Actions ── */
                .step-actions {
                    display: flex;
                    justify-content: space-between;
                    padding-top: var(--space-lg);
                    border-top: 1px solid var(--border);
                }

                /* ── Responsive ── */
                @media (max-width: 1024px) {
                    .config-layout,
                    .review-layout {
                        grid-template-columns: 1fr;
                    }

                    .config-preview {
                        position: static;
                    }
                }

                @media (max-width: 640px) {
                    .wizard-stepper {
                        flex-wrap: wrap;
                        gap: var(--space-sm);
                    }

                    .step-connector {
                        display: none;
                    }

                    .publish-actions {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
