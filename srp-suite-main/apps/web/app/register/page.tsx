'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '../../lib/auth-context';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const { register, user } = useAuth();
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [orgName, setOrgName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (user) {
        router.replace('/dashboard');
        return null;
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register({
                email,
                password,
                full_name: fullName || undefined,
                org_name: orgName || undefined,
            });
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al registrar');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="register-page">
            {/* Left Panel */}
            <div className="register-hero">
                <div className="register-hero-overlay" />
                <div className="register-hero-content">
                    <div className="register-brand">
                        <div className="register-logo">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                                <rect width="40" height="40" rx="10" fill="#7d9fa6" fillOpacity="0.2" />
                                <path d="M12 28V16l8-6 8 6v12H22v-6h-4v6H12z" stroke="#7d9fa6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>SRP Suite</span>
                        </div>
                        <h1>Comienza a<br />Transformar tu<br />Operación</h1>
                        <p>Únete a las faenas que ya confían en SRP Suite para su gestión de seguridad operacional.</p>
                    </div>

                    <div className="register-features">
                        <div className="register-feature">
                            <span className="feature-icon">📄</span>
                            <div>
                                <strong>SRP Docs</strong>
                                <p>Gestión documental inteligente</p>
                            </div>
                        </div>
                        <div className="register-feature">
                            <span className="feature-icon">🎓</span>
                            <div>
                                <strong>SRP Learn</strong>
                                <p>Capacitación con videos IA</p>
                            </div>
                        </div>
                        <div className="register-feature">
                            <span className="feature-icon">🛡️</span>
                            <div>
                                <strong>SRP Guard</strong>
                                <p>Compliance automatizado</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="register-form-panel">
                <div className="register-form-container">
                    <div className="register-form-header">
                        <h2>Crear Cuenta</h2>
                        <p>Registra tu organización para acceder a SRP Suite</p>
                    </div>

                    {error && (
                        <div className="register-error">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zm.75 6.25a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-field">
                            <label className="glass-input-label" htmlFor="reg-name">Nombre completo</label>
                            <input
                                id="reg-name"
                                className="glass-input"
                                type="text"
                                placeholder="Mario Cabrera"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                autoComplete="name"
                            />
                        </div>

                        <div className="form-field">
                            <label className="glass-input-label" htmlFor="reg-email">Correo electrónico</label>
                            <input
                                id="reg-email"
                                className="glass-input"
                                type="email"
                                placeholder="tu@empresa.cl"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-field">
                            <label className="glass-input-label" htmlFor="reg-password">Contraseña</label>
                            <input
                                id="reg-password"
                                className="glass-input"
                                type="password"
                                placeholder="Mínimo 8 caracteres"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                autoComplete="new-password"
                            />
                        </div>

                        <div className="form-field">
                            <label className="glass-input-label" htmlFor="reg-org">Nombre de la organización</label>
                            <input
                                id="reg-org"
                                className="glass-input"
                                type="text"
                                placeholder="Minera Chile S.A."
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary register-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner" />
                                    Registrando...
                                </>
                            ) : 'Crear Cuenta'}
                        </button>
                    </form>

                    <div className="register-footer">
                        <p>
                            ¿Ya tienes cuenta?{' '}
                            <a href="/login">Iniciar sesión</a>
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .register-page {
          display: flex;
          min-height: 100vh;
        }

        .register-hero {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          padding: var(--space-2xl);
          background:
            linear-gradient(135deg, rgba(10, 15, 26, 0.9) 0%, rgba(125, 159, 166, 0.15) 100%),
            url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect fill="%230a0f1a"/><circle cx="400" cy="300" r="200" fill="%237d9fa6" opacity="0.08"/></svg>');
          background-size: cover;
          overflow: hidden;
        }

        .register-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(10, 15, 26, 0.6) 0%, rgba(10, 15, 26, 0.9) 100%);
        }

        .register-hero-content {
          position: relative;
          z-index: 1;
          max-width: 420px;
        }

        .register-logo {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--accent);
          margin-bottom: var(--space-xl);
        }

        .register-brand h1 {
          font-size: 2rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: var(--space-md);
          background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent-light) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .register-brand p {
          font-size: 1rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: var(--space-2xl);
        }

        .register-features {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .register-feature {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          background: rgba(125, 159, 166, 0.06);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
        }

        .feature-icon {
          font-size: 1.5rem;
          width: 40px;
          text-align: center;
          flex-shrink: 0;
        }

        .register-feature strong {
          display: block;
          font-size: 0.9375rem;
          color: var(--text-primary);
        }

        .register-feature p {
          font-size: 0.8125rem;
          color: var(--text-tertiary);
          margin: 0;
        }

        .register-form-panel {
          width: 480px;
          min-width: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          border-left: 1px solid var(--border);
        }

        .register-form-container {
          width: 100%;
          max-width: 360px;
          padding: var(--space-xl);
        }

        .register-form-header {
          margin-bottom: var(--space-xl);
        }

        .register-form-header h2 {
          font-size: 1.5rem;
          margin-bottom: var(--space-xs);
        }

        .register-form-header p {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .register-error {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: 0.75rem 1rem;
          background: var(--error-bg);
          color: var(--error);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          margin-bottom: var(--space-lg);
          animation: slideUp 200ms ease;
        }

        .form-field {
          margin-bottom: var(--space-lg);
        }

        .register-submit {
          width: 100%;
          padding: 0.75rem;
          font-size: 1rem;
          margin-top: var(--space-sm);
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 600ms linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .register-footer {
          text-align: center;
          margin-top: var(--space-xl);
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .register-footer a {
          color: var(--accent);
          font-weight: 500;
        }

        @media (max-width: 900px) {
          .register-page { flex-direction: column; }
          .register-hero { min-height: 30vh; padding: var(--space-xl); }
          .register-brand h1 { font-size: 1.5rem; }
          .register-form-panel {
            width: 100%;
            min-width: unset;
            border-left: none;
            border-top: 1px solid var(--border);
          }
        }
      `}</style>
        </div>
    );
}
