'use client';

import { useEffect, useState } from 'react';
import { api, type Job, type Document } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        documents: 0,
        videos: 0,
        compliance: 98.5,
        activeJobs: 0,
    });
    const [recentJobs, setRecentJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [docsRes, jobsRes] = await Promise.all([
                    api.documents.list({ limit: 50 }).catch(() => ({ documents: [], count: 0 })),
                    api.jobs.list({ limit: 10 }).catch(() => ({ jobs: [], count: 0 })),
                ]);

                const videoJobs = jobsRes.jobs.filter(j => j.content_type === 'video' && j.status === 'completed');
                const activeJobs = jobsRes.jobs.filter(j => j.status === 'pending' || j.status === 'processing');

                setStats({
                    documents: docsRes.count,
                    videos: videoJobs.length,
                    compliance: 98.5,
                    activeJobs: activeJobs.length,
                });

                setRecentJobs(jobsRes.jobs.slice(0, 5));
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const kpis = [
        { label: 'Documentos', value: stats.documents, icon: '📄', trend: '+12%', up: true },
        { label: 'Videos Generados', value: stats.videos, icon: '🎥', trend: '+8', up: true },
        { label: 'Compliance Score', value: `${stats.compliance}%`, icon: '🛡️', trend: '+0.3%', up: true },
        { label: 'Jobs Activos', value: stats.activeJobs, icon: '⚡', trend: '', up: true },
    ];

    function getStatusBadge(status: string) {
        const map: Record<string, { class: string; label: string }> = {
            pending: { class: 'badge-warning', label: 'Pendiente' },
            processing: { class: 'badge-info', label: 'Procesando' },
            completed: { class: 'badge-success', label: 'Completado' },
            failed: { class: 'badge-error', label: 'Fallido' },
        };
        return map[status] || { class: 'badge-neutral', label: status };
    }

    function timeAgo(date: string) {
        const diff = Date.now() - new Date(date).getTime();
        const min = Math.floor(diff / 60000);
        if (min < 1) return 'ahora';
        if (min < 60) return `hace ${min}m`;
        const hrs = Math.floor(min / 60);
        if (hrs < 24) return `hace ${hrs}h`;
        const days = Math.floor(hrs / 24);
        return `hace ${days}d`;
    }

    return (
        <div className="dashboard-home">
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p className="text-secondary">Bienvenido, {user?.full_name || user?.email}</p>
                </div>
                <div className="dashboard-actions">
                    <a href="/dashboard/docs" className="btn btn-secondary">
                        📄 Subir Documento
                    </a>
                    <a href="/dashboard/jobs" className="btn btn-primary">
                        ⚡ Generar Contenido
                    </a>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                {kpis.map((kpi) => (
                    <div className="kpi-card" key={kpi.label}>
                        <div className="flex items-center justify-between">
                            <span className="kpi-label">{kpi.label}</span>
                            <span style={{ fontSize: '1.5rem' }}>{kpi.icon}</span>
                        </div>
                        <div className="kpi-value">
                            {loading ? <div className="skeleton" style={{ width: 80, height: 36 }} /> : kpi.value}
                        </div>
                        {kpi.trend && (
                            <span className={`kpi-trend ${kpi.up ? 'up' : 'down'}`}>
                                {kpi.up ? '↑' : '↓'} {kpi.trend}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="dashboard-section">
                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-lg)' }}>
                    <h2>Actividad Reciente</h2>
                    <a href="/dashboard/jobs" className="btn btn-ghost text-sm">Ver todo →</a>
                </div>

                {loading ? (
                    <div className="glass-card-static">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8, borderRadius: 8 }} />
                        ))}
                    </div>
                ) : recentJobs.length === 0 ? (
                    <div className="glass-card-static empty-state">
                        <div className="empty-state-icon">📋</div>
                        <div className="empty-state-title">Sin actividad reciente</div>
                        <p className="text-secondary text-sm">Comienza subiendo un documento o generando contenido</p>
                    </div>
                ) : (
                    <div className="glass-card-static" style={{ padding: 0, overflow: 'hidden' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Título</th>
                                    <th>Tipo</th>
                                    <th>Estado</th>
                                    <th>Tiempo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentJobs.map((job) => {
                                    const badge = getStatusBadge(job.status);
                                    return (
                                        <tr key={job.id}>
                                            <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{job.title}</td>
                                            <td>{job.content_type}</td>
                                            <td><span className={`badge ${badge.class}`}>{badge.label}</span></td>
                                            <td className="text-muted text-sm">{timeAgo(job.created_at)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Quick Stats Row */}
            <div className="dashboard-section">
                <div className="stats-row">
                    <div className="glass-card">
                        <h3>Compliance por Área</h3>
                        <div className="compliance-bars">
                            {[
                                { area: 'Planta Concentradora', score: 99 },
                                { area: 'Fundición', score: 97 },
                                { area: 'Mina Subterránea', score: 96 },
                                { area: 'Refinería', score: 100 },
                            ].map((item) => (
                                <div className="compliance-bar-item" key={item.area}>
                                    <div className="flex items-center justify-between text-sm" style={{ marginBottom: 4 }}>
                                        <span>{item.area}</span>
                                        <span className="text-accent">{item.score}%</span>
                                    </div>
                                    <div className="compliance-bar-track">
                                        <div
                                            className="compliance-bar-fill"
                                            style={{ width: `${item.score}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card">
                        <h3>Próximos Vencimientos</h3>
                        <div className="expiry-list">
                            {[
                                { doc: 'PRO-0908 Mantención Eléctrica', days: 5 },
                                { doc: 'ECF Trabajo en Altura', days: 12 },
                                { doc: 'PTS Voladura', days: 18 },
                            ].map((item) => (
                                <div className="expiry-item" key={item.doc}>
                                    <div>
                                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{item.doc}</span>
                                    </div>
                                    <span className={`badge ${item.days <= 7 ? 'badge-error' : item.days <= 14 ? 'badge-warning' : 'badge-neutral'}`}>
                                        {item.days} días
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .dashboard-home {
          animation: fadeIn 300ms ease;
        }

        .dashboard-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: var(--space-xl);
        }

        .dashboard-header h1 {
          margin-bottom: var(--space-xs);
        }

        .dashboard-actions {
          display: flex;
          gap: var(--space-sm);
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-lg);
          margin-bottom: var(--space-2xl);
        }

        .dashboard-section {
          margin-bottom: var(--space-2xl);
        }

        .stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-lg);
        }

        .compliance-bars {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          margin-top: var(--space-lg);
        }

        .compliance-bar-track {
          width: 100%;
          height: 6px;
          background: var(--bg-tertiary);
          border-radius: 3px;
          overflow: hidden;
        }

        .compliance-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent), var(--accent-light));
          border-radius: 3px;
          transition: width 600ms ease;
        }

        .expiry-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          margin-top: var(--space-lg);
        }

        .expiry-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-sm) 0;
          border-bottom: 1px solid var(--border);
        }
        .expiry-item:last-child {
          border-bottom: none;
        }

        @media (max-width: 1024px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr); }
          .stats-row { grid-template-columns: 1fr; }
          .dashboard-header { flex-direction: column; gap: var(--space-md); }
        }

        @media (max-width: 640px) {
          .kpi-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </div>
    );
}
