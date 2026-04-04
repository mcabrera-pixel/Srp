'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, type Job } from '../../../lib/api';

const CONTENT_TYPES = [
    { value: 'video', label: 'Video Whiteboard' },
    { value: 'audio', label: 'Audio Overview' },
    { value: 'infographic', label: 'Infografía' },
    { value: 'report', label: 'Reporte' },
];

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newType, setNewType] = useState('video');
    const [creating, setCreating] = useState(false);

    const loadJobs = useCallback(async () => {
        try {
            const params: { status?: string } = {};
            if (statusFilter) params.status = statusFilter;
            const res = await api.jobs.list(params);
            setJobs(res.jobs);
        } catch (err) {
            console.error('Failed to load jobs:', err);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        loadJobs();
        // Auto-refresh every 10 seconds
        const interval = setInterval(loadJobs, 10000);
        return () => clearInterval(interval);
    }, [loadJobs]);

    async function handleCreate() {
        if (!newTitle) return;
        setCreating(true);
        try {
            await api.jobs.create({ title: newTitle, content_type: newType });
            setShowCreate(false);
            setNewTitle('');
            setNewType('video');
            loadJobs();
        } catch (err) {
            console.error('Create job failed:', err);
        } finally {
            setCreating(false);
        }
    }

    function getStatusBadge(status: string) {
        const map: Record<string, { class: string; label: string; dot: string }> = {
            pending: { class: 'badge-warning', label: 'Pendiente', dot: '🟡' },
            processing: { class: 'badge-info', label: 'Procesando', dot: '🔵' },
            completed: { class: 'badge-success', label: 'Completado', dot: '🟢' },
            failed: { class: 'badge-error', label: 'Fallido', dot: '🔴' },
        };
        return map[status] || { class: 'badge-neutral', label: status, dot: '⚪' };
    }

    function getTypeIcon(type: string) {
        const map: Record<string, string> = {
            video: '🎥',
            audio: '🎙️',
            infographic: '📊',
            report: '📝',
        };
        return map[type] || '📦';
    }

    function formatDateTime(d: string) {
        return new Date(d).toLocaleString('es-CL', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    const counts = {
        all: jobs.length,
        pending: jobs.filter(j => j.status === 'pending').length,
        processing: jobs.filter(j => j.status === 'processing').length,
        completed: jobs.filter(j => j.status === 'completed').length,
        failed: jobs.filter(j => j.status === 'failed').length,
    };

    return (
        <div className="jobs-page">
            <div className="page-header">
                <div>
                    <h1>Jobs Queue</h1>
                    <p className="text-secondary">
                        Mission control — Generación de contenido en tiempo real
                        <span className="auto-refresh-badge">● Auto-refresh 10s</span>
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                    + Nuevo Job
                </button>
            </div>

            {/* Status Filter Tabs */}
            <div className="jobs-filters">
                {[
                    { value: '', label: `Todos (${counts.all})` },
                    { value: 'pending', label: `Pendientes (${counts.pending})` },
                    { value: 'processing', label: `Procesando (${counts.processing})` },
                    { value: 'completed', label: `Completados (${counts.completed})` },
                    { value: 'failed', label: `Fallidos (${counts.failed})` },
                ].map(f => (
                    <button
                        key={f.value}
                        className={`btn ${statusFilter === f.value ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setStatusFilter(f.value)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Jobs Table */}
            {loading ? (
                <div className="glass-card-static">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8, borderRadius: 8 }} />
                    ))}
                </div>
            ) : jobs.length === 0 ? (
                <div className="glass-card-static empty-state">
                    <div className="empty-state-icon">⚡</div>
                    <div className="empty-state-title">Sin jobs en la cola</div>
                    <p className="text-secondary text-sm">
                        Crea un nuevo job para generar contenido de capacitación
                    </p>
                    <button className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }} onClick={() => setShowCreate(true)}>
                        + Crear Job
                    </button>
                </div>
            ) : (
                <div className="glass-card-static" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Título</th>
                                <th>Tipo</th>
                                <th>Estado</th>
                                <th>Creado</th>
                                <th>Completado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map(job => {
                                const badge = getStatusBadge(job.status);
                                return (
                                    <tr key={job.id}>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                                            {job.title}
                                        </td>
                                        <td>
                                            <span className="flex items-center gap-sm">
                                                {getTypeIcon(job.content_type)} {job.content_type}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${badge.class}`}>
                                                {job.status === 'processing' && (
                                                    <span className="processing-dot" />
                                                )}
                                                {badge.label}
                                            </span>
                                        </td>
                                        <td className="text-sm text-muted">{formatDateTime(job.created_at)}</td>
                                        <td className="text-sm text-muted">
                                            {job.completed_at ? formatDateTime(job.completed_at) : '—'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Modal */}
            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ marginBottom: 'var(--space-lg)' }}>Crear Nuevo Job</h2>

                        <div className="form-field">
                            <label className="glass-input-label" htmlFor="job-title">Título</label>
                            <input
                                id="job-title"
                                className="glass-input"
                                placeholder="Video capacitación PRO-0908"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                            />
                        </div>

                        <div className="form-field">
                            <label className="glass-input-label" htmlFor="job-type">Tipo de contenido</label>
                            <select
                                id="job-type"
                                className="glass-input"
                                value={newType}
                                onChange={(e) => setNewType(e.target.value)}
                            >
                                {CONTENT_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-sm" style={{ justifyContent: 'flex-end', marginTop: 'var(--space-lg)' }}>
                            <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>
                                Cancelar
                            </button>
                            <button className="btn btn-primary" onClick={handleCreate} disabled={!newTitle || creating}>
                                {creating ? 'Creando...' : 'Crear Job'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        .jobs-page {
          animation: fadeIn 300ms ease;
        }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: var(--space-xl);
        }

        .page-header h1 {
          margin-bottom: var(--space-xs);
        }

        .auto-refresh-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-left: var(--space-md);
          font-size: 0.75rem;
          color: var(--success);
          animation: pulse 2s ease infinite;
        }

        .jobs-filters {
          display: flex;
          gap: var(--space-sm);
          margin-bottom: var(--space-xl);
          flex-wrap: wrap;
        }

        .processing-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse 1s ease infinite;
        }

        .form-field {
          margin-bottom: var(--space-lg);
        }

        select.glass-input {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M3 4.5L6 8l3-3.5H3z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 32px;
        }

        select.glass-input option {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }
      `}</style>
        </div>
    );
}
