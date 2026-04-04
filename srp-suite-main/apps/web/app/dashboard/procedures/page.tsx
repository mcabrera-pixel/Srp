'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/* ── Types ── */
interface Procedure {
    id: string;
    code: string;
    title: string;
    area: string;
    responsible: string;
    status: ProcedureStatus;
    version: number;
    riskLevel: 'alto' | 'medio' | 'bajo';
    createdAt: string;
    updatedAt: string;
    expiresAt: string | null;
    reviewedBy: string | null;
    approvedBy: string | null;
}

type ProcedureStatus = 'borrador' | 'revision' | 'aprobado' | 'vigente' | 'por_vencer' | 'archivado';

interface KanbanColumn {
    id: ProcedureStatus;
    label: string;
    icon: string;
    color: string;
    colorVar: string;
}

/* ── Column Definitions ── */
const COLUMNS: KanbanColumn[] = [
    { id: 'borrador', label: 'Borrador', icon: '📝', color: '#64748b', colorVar: '--text-tertiary' },
    { id: 'revision', label: 'En Revisión', icon: '🔍', color: '#3b82f6', colorVar: '--info' },
    { id: 'aprobado', label: 'Aprobado', icon: '✅', color: '#22c55e', colorVar: '--success' },
    { id: 'vigente', label: 'Vigente', icon: '📋', color: '#10b981', colorVar: '--success' },
    { id: 'por_vencer', label: 'Por Vencer', icon: '⚠️', color: '#f59e0b', colorVar: '--warning' },
    { id: 'archivado', label: 'Archivado', icon: '📦', color: '#475569', colorVar: '--text-muted' },
];

/* ── Mock Data (CODELCO-realistic) ── */
const MOCK_PROCEDURES: Procedure[] = [
    {
        id: '1', code: 'PRO-0908', title: 'Mantención Eléctrica en Planta Concentradora',
        area: 'Planta Concentradora', responsible: 'Carlos Muñoz', status: 'vigente',
        version: 3, riskLevel: 'alto', createdAt: '2025-11-15', updatedAt: '2026-01-20',
        expiresAt: '2026-04-20', reviewedBy: 'Ing. Soto', approvedBy: 'Ger. López',
    },
    {
        id: '2', code: 'P-GFR-354', title: 'Gobernanza Documental y Control de Versiones',
        area: 'Gerencia FURE', responsible: 'Gerente FURE', status: 'borrador',
        version: 1, riskLevel: 'medio', createdAt: '2026-02-24', updatedAt: '2026-02-24',
        expiresAt: null, reviewedBy: null, approvedBy: null,
    },
    {
        id: '3', code: 'PRO-EC-001', title: 'Trabajo en Espacio Confinado — Material a Granel',
        area: 'Mina Subterránea', responsible: 'Javier Rojas', status: 'revision',
        version: 1, riskLevel: 'alto', createdAt: '2026-02-20', updatedAt: '2026-02-23',
        expiresAt: null, reviewedBy: null, approvedBy: null,
    },
    {
        id: '4', code: 'SIM-RF11-01', title: 'Simulacro RF-11 Atrapamiento en EC con Brigada',
        area: 'Protección Industrial', responsible: 'Dir. Emergencias', status: 'borrador',
        version: 1, riskLevel: 'alto', createdAt: '2026-02-24', updatedAt: '2026-02-24',
        expiresAt: null, reviewedBy: null, approvedBy: null,
    },
    {
        id: '5', code: 'PTS-BLQ-797F', title: 'Bloqueo y Aislación CAT 797F — Taller Nivel 3500',
        area: 'Taller Mecánico', responsible: 'Felipe Contreras', status: 'aprobado',
        version: 2, riskLevel: 'alto', createdAt: '2026-01-10', updatedAt: '2026-02-15',
        expiresAt: null, reviewedBy: 'Ing. Soto', approvedBy: 'Ger. López',
    },
    {
        id: '6', code: 'ECF-02-SUB', title: 'Estándar Control de Fatalidad N°2 — Subterránea',
        area: 'Mina Subterránea', responsible: 'Andrea Vega', status: 'por_vencer',
        version: 4, riskLevel: 'alto', createdAt: '2025-03-01', updatedAt: '2025-09-15',
        expiresAt: '2026-03-01', reviewedBy: 'Ing. Soto', approvedBy: 'Ger. López',
    },
    {
        id: '7', code: 'PRO-VOL-012', title: 'Procedimiento de Tronadura — Nivel 2400',
        area: 'Mina Subterránea', responsible: 'Roberto Pizarro', status: 'vigente',
        version: 5, riskLevel: 'alto', createdAt: '2025-06-10', updatedAt: '2026-01-05',
        expiresAt: '2026-07-05', reviewedBy: 'Ing. Paredes', approvedBy: 'Ger. López',
    },
    {
        id: '8', code: 'PTS-LOTO-GEN', title: 'Lockout/Tagout General — Todas las Áreas',
        area: 'Seguridad', responsible: 'María González', status: 'vigente',
        version: 6, riskLevel: 'medio', createdAt: '2025-04-20', updatedAt: '2025-12-10',
        expiresAt: '2026-06-10', reviewedBy: 'Ing. Soto', approvedBy: 'Ger. Seguridad',
    },
    {
        id: '9', code: 'PRO-ALT-003', title: 'Trabajo en Altura sobre 1.8m — Fundición',
        area: 'Fundición', responsible: 'Luis Herrera', status: 'archivado',
        version: 2, riskLevel: 'alto', createdAt: '2024-08-15', updatedAt: '2025-08-20',
        expiresAt: '2025-08-20', reviewedBy: 'Ing. Paredes', approvedBy: 'Ger. López',
    },
    {
        id: '10', code: 'PRO-QUIM-007', title: 'Manejo de Sustancias Químicas — Refinería',
        area: 'Refinería', responsible: 'Patricia Fuentes', status: 'revision',
        version: 2, riskLevel: 'medio', createdAt: '2026-01-15', updatedAt: '2026-02-22',
        expiresAt: null, reviewedBy: null, approvedBy: null,
    },
    {
        id: '11', code: 'PRO-INC-005', title: 'Plan de Respuesta ante Incendio — Nivel 3200',
        area: 'Protección Industrial', responsible: 'Dir. Emergencias', status: 'por_vencer',
        version: 3, riskLevel: 'alto', createdAt: '2025-02-10', updatedAt: '2025-08-15',
        expiresAt: '2026-03-15', reviewedBy: 'Ing. Soto', approvedBy: 'Ger. López',
    },
    {
        id: '12', code: 'CHK-DIARIO-01', title: 'Checklist Verificación Pre-Tarea No Rutinaria',
        area: 'Todas las Áreas', responsible: 'Supervisores de Turno', status: 'aprobado',
        version: 1, riskLevel: 'bajo', createdAt: '2026-02-24', updatedAt: '2026-02-24',
        expiresAt: null, reviewedBy: 'Ing. Soto', approvedBy: 'Ger. FURE',
    },
];

/* ── Component ── */
const STATUS_ORDER: ProcedureStatus[] = ['borrador', 'revision', 'aprobado', 'vigente', 'por_vencer', 'archivado'];

export default function ProceduresPage() {
    const router = useRouter();
    const [procedures, setProcedures] = useState<Procedure[]>(MOCK_PROCEDURES);
    const [selectedCard, setSelectedCard] = useState<Procedure | null>(null);
    const [filterArea, setFilterArea] = useState<string>('all');

    const areas = Array.from(new Set(procedures.map(p => p.area)));

    const filtered = filterArea === 'all'
        ? procedures
        : procedures.filter(p => p.area === filterArea);

    function getColumnProcedures(status: ProcedureStatus) {
        return filtered.filter(p => p.status === status);
    }

    function getRiskBadge(level: string) {
        const map: Record<string, { cls: string; label: string }> = {
            alto: { cls: 'badge-error', label: '🔴 Alto' },
            medio: { cls: 'badge-warning', label: '🟡 Medio' },
            bajo: { cls: 'badge-success', label: '🟢 Bajo' },
        };
        return map[level] || { cls: 'badge-neutral', label: level };
    }

    function formatDate(d: string) {
        return new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
    }

    function daysUntil(d: string | null) {
        if (!d) return null;
        const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
        return diff;
    }

    const totalByStatus = COLUMNS.map(col => ({
        ...col,
        count: getColumnProcedures(col.id).length,
    }));

    function advanceStatus(proc: Procedure) {
        const currentIdx = STATUS_ORDER.indexOf(proc.status);
        if (currentIdx < 0 || currentIdx >= STATUS_ORDER.length - 1) return;
        const nextStatus = STATUS_ORDER[currentIdx + 1];
        if (!nextStatus) return;

        const today = new Date().toISOString().split('T')[0] || proc.updatedAt;
        const updated: Procedure = { ...proc, status: nextStatus, updatedAt: today };
        setProcedures(prev => prev.map(p => p.id === proc.id ? updated : p));
        setSelectedCard(updated);
    }

    return (
        <div className="procedures-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>Procedimientos</h1>
                    <p className="text-secondary">Flujo de vida centralizado — Kanban de gestión documental</p>
                </div>
                <div className="header-actions">
                    <select
                        className="glass-input area-filter"
                        value={filterArea}
                        onChange={(e) => setFilterArea(e.target.value)}
                    >
                        <option value="all">Todas las áreas</option>
                        {areas.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <button className="btn btn-primary" onClick={() => router.push('/dashboard/procedures/generate')}>
                        + Nuevo Procedimiento
                    </button>
                </div>
            </div>

            {/* Summary Strip */}
            <div className="summary-strip">
                {totalByStatus.map(col => (
                    <div className="summary-chip" key={col.id}>
                        <span className="chip-icon">{col.icon}</span>
                        <span className="chip-count" style={{ color: col.color }}>{col.count}</span>
                        <span className="chip-label">{col.label}</span>
                    </div>
                ))}
            </div>

            {/* Kanban Board */}
            <div className="kanban-board">
                {COLUMNS.map(col => {
                    const items = getColumnProcedures(col.id);
                    return (
                        <div className="kanban-column" key={col.id}>
                            <div className="column-header">
                                <div className="column-header-left">
                                    <span className="column-icon">{col.icon}</span>
                                    <span className="column-title">{col.label}</span>
                                </div>
                                <span className="column-count" style={{ background: `${col.color}22`, color: col.color }}>
                                    {items.length}
                                </span>
                            </div>
                            <div className="column-indicator" style={{ background: col.color }} />
                            <div className="column-cards">
                                {items.length === 0 ? (
                                    <div className="empty-column">
                                        <span className="text-muted text-xs">Sin procedimientos</span>
                                    </div>
                                ) : (
                                    items.map(proc => {
                                        const risk = getRiskBadge(proc.riskLevel);
                                        const expDays = daysUntil(proc.expiresAt);
                                        return (
                                            <div
                                                className="kanban-card"
                                                key={proc.id}
                                                onClick={() => setSelectedCard(proc)}
                                            >
                                                <div className="card-top-row">
                                                    <span className="card-code">{proc.code}</span>
                                                    <span className={`badge ${risk.cls}`} style={{ fontSize: '0.625rem' }}>
                                                        {risk.label}
                                                    </span>
                                                </div>
                                                <h4 className="card-title">{proc.title}</h4>
                                                <div className="card-meta">
                                                    <span className="card-area">📍 {proc.area}</span>
                                                </div>
                                                <div className="card-footer">
                                                    <span className="card-responsible">👤 {proc.responsible}</span>
                                                    <span className="card-version">v{proc.version}</span>
                                                </div>
                                                {expDays !== null && expDays <= 30 && col.id !== 'archivado' && (
                                                    <div className={`card-expiry ${expDays <= 7 ? 'critical' : 'warning'}`}>
                                                        ⏰ {expDays <= 0 ? 'VENCIDO' : `Vence en ${expDays}d`}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detail Modal */}
            {selectedCard && (
                <div className="modal-overlay" onClick={() => setSelectedCard(null)}>
                    <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="detail-header">
                            <div>
                                <span className="card-code" style={{ fontSize: '0.75rem' }}>{selectedCard.code}</span>
                                <h2 style={{ marginTop: 4 }}>{selectedCard.title}</h2>
                            </div>
                            <button className="btn btn-ghost" onClick={() => setSelectedCard(null)}>✕</button>
                        </div>

                        <div className="detail-grid">
                            <div className="detail-item">
                                <label className="glass-input-label">Área</label>
                                <span>{selectedCard.area}</span>
                            </div>
                            <div className="detail-item">
                                <label className="glass-input-label">Responsable</label>
                                <span>{selectedCard.responsible}</span>
                            </div>
                            <div className="detail-item">
                                <label className="glass-input-label">Versión</label>
                                <span>v{selectedCard.version}</span>
                            </div>
                            <div className="detail-item">
                                <label className="glass-input-label">Magnitud de Riesgo</label>
                                <span className={`badge ${getRiskBadge(selectedCard.riskLevel).cls}`}>
                                    {getRiskBadge(selectedCard.riskLevel).label}
                                </span>
                            </div>
                            <div className="detail-item">
                                <label className="glass-input-label">Creado</label>
                                <span>{formatDate(selectedCard.createdAt)}</span>
                            </div>
                            <div className="detail-item">
                                <label className="glass-input-label">Última Modificación</label>
                                <span>{formatDate(selectedCard.updatedAt)}</span>
                            </div>
                            {selectedCard.expiresAt && (
                                <div className="detail-item">
                                    <label className="glass-input-label">Vence</label>
                                    <span>{formatDate(selectedCard.expiresAt)}</span>
                                </div>
                            )}
                            {selectedCard.reviewedBy && (
                                <div className="detail-item">
                                    <label className="glass-input-label">Revisado por</label>
                                    <span>{selectedCard.reviewedBy}</span>
                                </div>
                            )}
                            {selectedCard.approvedBy && (
                                <div className="detail-item">
                                    <label className="glass-input-label">Aprobado por</label>
                                    <span>{selectedCard.approvedBy}</span>
                                </div>
                            )}
                        </div>

                        {/* Lifecycle Timeline */}
                        <div className="lifecycle-timeline">
                            <label className="glass-input-label" style={{ marginBottom: 12 }}>Ciclo de Vida</label>
                            <div className="timeline-track">
                                {COLUMNS.map((col, i) => {
                                    const isActive = col.id === selectedCard.status;
                                    const isPast = COLUMNS.findIndex(c => c.id === selectedCard.status) > i;
                                    return (
                                        <div className={`timeline-step ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`} key={col.id}>
                                            <div className="timeline-dot" style={isActive || isPast ? { background: col.color, borderColor: col.color } : {}} />
                                            <span className="timeline-label">{col.icon} {col.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="detail-actions">
                            <button className="btn btn-secondary">📄 Ver Documento</button>
                            <button className="btn btn-secondary">🎥 Generar Video</button>
                            {selectedCard.status !== 'archivado' && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => advanceStatus(selectedCard)}
                                >
                                    → Avanzar a {COLUMNS[STATUS_ORDER.indexOf(selectedCard.status) + 1]?.label || ''}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )
            }

            <style jsx>{`
                .procedures-page {
                    animation: fadeIn 300ms ease;
                }

                .page-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    margin-bottom: var(--space-lg);
                }

                .page-header h1 {
                    margin-bottom: var(--space-xs);
                }

                .header-actions {
                    display: flex;
                    gap: var(--space-sm);
                    align-items: center;
                }

                .area-filter {
                    width: auto;
                    min-width: 180px;
                    padding: 0.5rem 0.75rem;
                    font-size: 0.8125rem;
                }

                /* ── Summary Strip ── */
                .summary-strip {
                    display: flex;
                    gap: var(--space-sm);
                    margin-bottom: var(--space-xl);
                    flex-wrap: wrap;
                }

                .summary-chip {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 14px;
                    background: var(--bg-glass);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-full);
                    font-size: 0.75rem;
                }

                .chip-icon { font-size: 0.875rem; }
                .chip-count { font-weight: 700; font-size: 0.875rem; }
                .chip-label { color: var(--text-secondary); }

                /* ── Kanban Board ── */
                .kanban-board {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: var(--space-md);
                    overflow-x: auto;
                    padding-bottom: var(--space-md);
                    min-height: 500px;
                }

                .kanban-column {
                    min-width: 220px;
                    display: flex;
                    flex-direction: column;
                }

                .column-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--space-sm) var(--space-sm);
                    margin-bottom: 2px;
                }

                .column-header-left {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .column-icon { font-size: 1rem; }

                .column-title {
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-secondary);
                }

                .column-count {
                    font-size: 0.6875rem;
                    font-weight: 700;
                    padding: 2px 8px;
                    border-radius: var(--radius-full);
                }

                .column-indicator {
                    height: 3px;
                    border-radius: 2px;
                    margin-bottom: var(--space-md);
                    opacity: 0.6;
                }

                /* ── Cards ── */
                .column-cards {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-sm);
                    flex: 1;
                }

                .empty-column {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: var(--space-xl) var(--space-sm);
                    border: 1px dashed var(--border);
                    border-radius: var(--radius-md);
                    min-height: 80px;
                }

                .kanban-card {
                    background: var(--bg-glass);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    padding: var(--space-md);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    position: relative;
                }

                .kanban-card:hover {
                    border-color: var(--border-hover);
                    box-shadow: var(--shadow-glow);
                    transform: translateY(-2px);
                }

                .card-top-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 6px;
                }

                .card-code {
                    font-size: 0.6875rem;
                    font-weight: 600;
                    color: var(--accent);
                    font-family: var(--font-mono);
                    letter-spacing: 0.02em;
                }

                .card-title {
                    font-size: 0.8125rem;
                    font-weight: 500;
                    line-height: 1.3;
                    margin-bottom: 8px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .card-meta {
                    margin-bottom: 6px;
                }

                .card-area {
                    font-size: 0.6875rem;
                    color: var(--text-tertiary);
                }

                .card-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-top: 8px;
                    border-top: 1px solid var(--border);
                }

                .card-responsible {
                    font-size: 0.6875rem;
                    color: var(--text-secondary);
                }

                .card-version {
                    font-size: 0.625rem;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    font-family: var(--font-mono);
                }

                .card-expiry {
                    margin-top: 8px;
                    padding: 4px 8px;
                    border-radius: var(--radius-sm);
                    font-size: 0.6875rem;
                    font-weight: 600;
                    text-align: center;
                }

                .card-expiry.warning {
                    background: var(--warning-bg);
                    color: var(--warning);
                }

                .card-expiry.critical {
                    background: var(--error-bg);
                    color: var(--error);
                    animation: pulse 2s ease infinite;
                }

                /* ── Detail Modal ── */
                .detail-modal {
                    max-width: 600px;
                    width: 95%;
                }

                .detail-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: var(--space-xl);
                    padding-bottom: var(--space-lg);
                    border-bottom: 1px solid var(--border);
                }

                .detail-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--space-md);
                    margin-bottom: var(--space-xl);
                }

                .detail-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .detail-item label {
                    font-size: 0.6875rem;
                }

                .detail-item span {
                    font-size: 0.875rem;
                    color: var(--text-primary);
                }

                /* ── Lifecycle Timeline ── */
                .lifecycle-timeline {
                    margin-bottom: var(--space-xl);
                    padding: var(--space-lg);
                    background: var(--bg-tertiary);
                    border-radius: var(--radius-md);
                }

                .timeline-track {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                }

                .timeline-step {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    position: relative;
                }

                .timeline-step::after {
                    content: '';
                    position: absolute;
                    top: 6px;
                    left: 50%;
                    width: 100%;
                    height: 2px;
                    background: var(--border);
                    z-index: 0;
                }

                .timeline-step:last-child::after { display: none; }

                .timeline-step.past::after {
                    background: var(--accent);
                    opacity: 0.5;
                }

                .timeline-dot {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    border: 2px solid var(--border);
                    background: var(--bg-primary);
                    z-index: 1;
                    transition: all var(--transition-fast);
                }

                .timeline-step.active .timeline-dot {
                    transform: scale(1.3);
                    box-shadow: 0 0 12px currentColor;
                }

                .timeline-step.past .timeline-dot {
                    opacity: 0.7;
                }

                .timeline-label {
                    font-size: 0.5625rem;
                    color: var(--text-tertiary);
                    text-align: center;
                    white-space: nowrap;
                }

                .timeline-step.active .timeline-label {
                    color: var(--text-primary);
                    font-weight: 600;
                }

                .detail-actions {
                    display: flex;
                    gap: var(--space-sm);
                    justify-content: flex-end;
                }

                /* ── Responsive ── */
                @media (max-width: 1400px) {
                    .kanban-board {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                @media (max-width: 900px) {
                    .kanban-board {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .page-header {
                        flex-direction: column;
                        gap: var(--space-md);
                    }
                    .header-actions {
                        flex-wrap: wrap;
                    }
                }

                @media (max-width: 640px) {
                    .kanban-board {
                        grid-template-columns: 1fr;
                    }
                    .detail-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div >
    );
}
