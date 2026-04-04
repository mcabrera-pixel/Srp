'use client';

import { useEffect, useState } from 'react';
import { api, type Document } from '../../../lib/api';

export default function DocsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUpload, setShowUpload] = useState(false);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadDocuments();
    }, []);

    async function loadDocuments() {
        try {
            const res = await api.documents.list();
            setDocuments(res.documents);
        } catch (err) {
            console.error('Failed to load documents:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleUpload() {
        if (!uploadTitle) return;
        setUploading(true);

        try {
            const res = await api.documents.create({ title: uploadTitle });

            if (uploadFile) {
                await api.documents.upload(res.id, uploadFile);
            }

            setShowUpload(false);
            setUploadTitle('');
            setUploadFile(null);
            loadDocuments();
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
        }
    }

    async function handleDelete(id: string) {
        try {
            await api.documents.delete(id);
            setDocuments(docs => docs.filter(d => d.id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
        }
    }

    const filtered = documents.filter(d =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    function formatDate(d: string) {
        return new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function getStatusInfo(doc: Document) {
        if (doc.expires_at && new Date(doc.expires_at) < new Date(Date.now() + 7 * 86400000)) {
            return { class: 'badge-error', label: 'Por vencer' };
        }
        if (doc.status === 'archived') return { class: 'badge-neutral', label: 'Archivado' };
        return { class: 'badge-success', label: 'Vigente' };
    }

    return (
        <div className="docs-page">
            <div className="page-header">
                <div>
                    <h1>SRP Docs</h1>
                    <p className="text-secondary">Gestión documental de procedimientos y normativa</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
                    + Nuevo Documento
                </button>
            </div>

            {/* Search */}
            <div className="docs-toolbar">
                <div className="search-bar" style={{ flex: 1, maxWidth: 400 }}>
                    <span>🔍</span>
                    <input
                        placeholder="Buscar documentos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="docs-count text-sm text-secondary">
                    {filtered.length} documento{filtered.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Document Grid */}
            {loading ? (
                <div className="docs-grid">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="skeleton" style={{ height: 180, borderRadius: 12 }} />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-card-static empty-state">
                    <div className="empty-state-icon">📄</div>
                    <div className="empty-state-title">
                        {searchQuery ? 'No se encontraron documentos' : 'Sin documentos'}
                    </div>
                    <p className="text-secondary text-sm">
                        {searchQuery ? 'Intenta con otra búsqueda' : 'Sube tu primer procedimiento para comenzar'}
                    </p>
                    {!searchQuery && (
                        <button className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }} onClick={() => setShowUpload(true)}>
                            + Subir Documento
                        </button>
                    )}
                </div>
            ) : (
                <div className="docs-grid">
                    {filtered.map(doc => {
                        const status = getStatusInfo(doc);
                        return (
                            <div className="doc-card glass-card" key={doc.id}>
                                <div className="doc-card-header">
                                    <span className="doc-icon">📄</span>
                                    <span className={`badge ${status.class}`}>{status.label}</span>
                                </div>
                                <h3 className="doc-title">{doc.title}</h3>
                                <div className="doc-meta">
                                    <span className="text-xs text-muted">v{doc.version}</span>
                                    <span className="text-xs text-muted">{formatDate(doc.created_at)}</span>
                                </div>
                                <div className="doc-actions">
                                    <a href={`/dashboard/jobs?doc=${doc.id}`} className="btn btn-ghost text-sm">
                                        ⚡ Generar Video
                                    </a>
                                    <button className="btn btn-ghost text-sm" onClick={() => handleDelete(doc.id)}>
                                        🗑
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Upload Modal */}
            {showUpload && (
                <div className="modal-overlay" onClick={() => setShowUpload(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ marginBottom: 'var(--space-lg)' }}>Nuevo Documento</h2>

                        <div className="form-field">
                            <label className="glass-input-label" htmlFor="doc-title">Título del documento</label>
                            <input
                                id="doc-title"
                                className="glass-input"
                                placeholder="PRO-0908 Mantención Eléctrica"
                                value={uploadTitle}
                                onChange={(e) => setUploadTitle(e.target.value)}
                            />
                        </div>

                        <div className="form-field">
                            <label className="glass-input-label" htmlFor="doc-file">Archivo (PDF, Word)</label>
                            <input
                                id="doc-file"
                                type="file"
                                accept=".pdf,.docx,.doc,.md"
                                className="glass-input"
                                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                style={{ paddingTop: 10 }}
                            />
                        </div>

                        <div className="flex gap-sm" style={{ justifyContent: 'flex-end', marginTop: 'var(--space-lg)' }}>
                            <button className="btn btn-secondary" onClick={() => setShowUpload(false)}>
                                Cancelar
                            </button>
                            <button className="btn btn-primary" onClick={handleUpload} disabled={!uploadTitle || uploading}>
                                {uploading ? 'Subiendo...' : 'Crear Documento'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        .docs-page {
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

        .docs-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-xl);
        }

        .docs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-lg);
        }

        .doc-card {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .doc-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .doc-icon {
          font-size: 1.5rem;
        }

        .doc-title {
          font-size: 0.9375rem;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .doc-meta {
          display: flex;
          gap: var(--space-md);
          margin-top: auto;
        }

        .doc-actions {
          display: flex;
          gap: var(--space-xs);
          margin-top: var(--space-sm);
          border-top: 1px solid var(--border);
          padding-top: var(--space-sm);
        }

        .form-field {
          margin-bottom: var(--space-lg);
        }
      `}</style>
        </div>
    );
}
