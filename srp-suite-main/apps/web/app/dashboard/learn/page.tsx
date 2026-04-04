'use client';

import { useEffect, useState } from 'react';
import { api, type Job } from '../../../lib/api';

export default function LearnPage() {
    const [videos, setVideos] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'completed' | 'processing'>('all');

    useEffect(() => {
        async function loadVideos() {
            try {
                const res = await api.jobs.list({ limit: 50 });
                const videoJobs = res.jobs.filter(j => j.content_type === 'video');
                setVideos(videoJobs);
            } catch (err) {
                console.error('Failed to load videos:', err);
            } finally {
                setLoading(false);
            }
        }
        loadVideos();
    }, []);

    const filtered = videos.filter(v => {
        if (filter === 'all') return true;
        return v.status === filter;
    });

    const completedCount = videos.filter(v => v.status === 'completed').length;
    const processingCount = videos.filter(v => v.status === 'processing' || v.status === 'pending').length;

    function formatDate(d: string) {
        return new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    return (
        <div className="learn-page">
            <div className="page-header">
                <div>
                    <h1>SRP Learn</h1>
                    <p className="text-secondary">Hub de capacitación — Videos de procedimientos generados por IA</p>
                </div>
            </div>

            {/* Stats */}
            <div className="learn-stats">
                <div className="learn-stat-card glass-card-static">
                    <span className="learn-stat-icon">🎥</span>
                    <div>
                        <div className="learn-stat-value">{loading ? '—' : completedCount}</div>
                        <div className="learn-stat-label text-sm text-secondary">Videos Listos</div>
                    </div>
                </div>
                <div className="learn-stat-card glass-card-static">
                    <span className="learn-stat-icon">⏳</span>
                    <div>
                        <div className="learn-stat-value">{loading ? '—' : processingCount}</div>
                        <div className="learn-stat-label text-sm text-secondary">En Proceso</div>
                    </div>
                </div>
                <div className="learn-stat-card glass-card-static">
                    <span className="learn-stat-icon">👷</span>
                    <div>
                        <div className="learn-stat-value">—</div>
                        <div className="learn-stat-label text-sm text-secondary">Trabajadores Capacitados</div>
                    </div>
                </div>
                <div className="learn-stat-card glass-card-static">
                    <span className="learn-stat-icon">✅</span>
                    <div>
                        <div className="learn-stat-value">—</div>
                        <div className="learn-stat-label text-sm text-secondary">Evaluaciones Aprobadas</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="learn-filters">
                {(['all', 'completed', 'processing'] as const).map(f => (
                    <button
                        key={f}
                        className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'all' ? 'Todos' : f === 'completed' ? 'Completados' : 'En Proceso'}
                    </button>
                ))}
            </div>

            {/* Video Grid */}
            {loading ? (
                <div className="video-grid">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="skeleton" style={{ height: 240, borderRadius: 12 }} />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-card-static empty-state">
                    <div className="empty-state-icon">🎓</div>
                    <div className="empty-state-title">Sin videos de capacitación</div>
                    <p className="text-secondary text-sm">
                        Genera tu primer video desde SRP Docs o Jobs Queue
                    </p>
                    <a href="/dashboard/jobs" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>
                        ⚡ Generar Video
                    </a>
                </div>
            ) : (
                <div className="video-grid">
                    {filtered.map(video => (
                        <div className="video-card glass-card" key={video.id}>
                            <div className="video-thumb">
                                <div className="video-thumb-inner">
                                    {video.status === 'completed' ? (
                                        <>
                                            <span className="video-play">▶</span>
                                            <span className="video-duration">~3 min</span>
                                        </>
                                    ) : (
                                        <div className="video-processing">
                                            <div className="processing-spinner" />
                                            <span>{video.status === 'pending' ? 'En cola...' : 'Generando...'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="video-info">
                                <h3>{video.title}</h3>
                                <div className="video-meta">
                                    <span className={`badge ${video.status === 'completed' ? 'badge-success' : video.status === 'failed' ? 'badge-error' : 'badge-info'}`}>
                                        {video.status === 'completed' ? 'Listo' : video.status === 'failed' ? 'Error' : 'Procesando'}
                                    </span>
                                    <span className="text-xs text-muted">{formatDate(video.created_at)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
        .learn-page {
          animation: fadeIn 300ms ease;
        }

        .page-header {
          margin-bottom: var(--space-xl);
        }

        .page-header h1 {
          margin-bottom: var(--space-xs);
        }

        .learn-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-md);
          margin-bottom: var(--space-xl);
        }

        .learn-stat-card {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-lg);
        }

        .learn-stat-icon {
          font-size: 1.75rem;
        }

        .learn-stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .learn-filters {
          display: flex;
          gap: var(--space-sm);
          margin-bottom: var(--space-xl);
        }

        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-lg);
        }

        .video-card {
          padding: 0;
          overflow: hidden;
        }

        .video-thumb {
          aspect-ratio: 16/9;
          background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .video-thumb-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
        }

        .video-play {
          width: 48px;
          height: 48px;
          background: var(--accent-glow-strong);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          color: var(--accent);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .video-play:hover {
          background: var(--accent);
          color: var(--bg-primary);
          transform: scale(1.1);
        }

        .video-duration {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        .video-processing {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
          color: var(--text-tertiary);
          font-size: 0.875rem;
        }

        .processing-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 800ms linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .video-info {
          padding: var(--space-md) var(--space-lg) var(--space-lg);
        }

        .video-info h3 {
          font-size: 0.9375rem;
          margin-bottom: var(--space-sm);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .video-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        @media (max-width: 1024px) {
          .learn-stats { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .learn-stats { grid-template-columns: 1fr; }
        }
      `}</style>
        </div>
    );
}
