'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '../../lib/auth-context';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const { login, user } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in
    if (user) {
        router.replace('/dashboard');
        return null;
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error de autenticación');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">
            {/* Left Panel — Atmospheric Mine Image */}
            <div className="login-hero">
                <div className="login-hero-overlay" />
                <div className="login-hero-content">
                    <div className="login-brand">
                        <div className="login-logo">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                                <rect width="40" height="40" rx="10" fill="#7d9fa6" fillOpacity="0.2" />
                                <path d="M12 28V16l8-6 8 6v12H22v-6h-4v6H12z" stroke="#7d9fa6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>SRP Suite</span>
                        </div>
                        <h1>Seguridad Operacional<br />de Clase Mundial</h1>
                        <p>Gestión documental inteligente, capacitación interactiva y compliance automatizado para la industria minera.</p>
                    </div>
                    <div className="login-hero-stats">
                        <div className="login-hero-stat">
                            <span className="stat-value">99.5%</span>
                            <span className="stat-label">Compliance</span>
                        </div>
                        <div className="login-hero-stat">
                            <span className="stat-value">2.5K+</span>
                            <span className="stat-label">Documentos</span>
                        </div>
                        <div className="login-hero-stat">
                            <span className="stat-value">850+</span>
                            <span className="stat-label">Trabajadores</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel — Login Form */}
            <div className="login-form-panel">
                <div className="login-form-container">
                    <div className="login-form-header">
                        <h2>Iniciar Sesión</h2>
                        <p>Ingresa tus credenciales para acceder a la plataforma</p>
                    </div>

                    {error && (
                        <div className="login-error">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zm.75 6.25a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-field">
                            <label className="glass-input-label" htmlFor="login-email">Correo electrónico</label>
                            <input
                                id="login-email"
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
                            <label className="glass-input-label" htmlFor="login-password">Contraseña</label>
                            <input
                                id="login-password"
                                className="glass-input"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary login-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner" />
                                    Ingresando...
                                </>
                            ) : 'Ingresar'}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>
                            ¿No tienes cuenta?{' '}
                            <a href="/register">Registrar organización</a>
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .login-page {
          display: flex;
          min-height: 100vh;
        }

        /* ── Hero Panel ── */
        .login-hero {
          flex: 1;
          position: relative;
          display: flex;
          align-items: flex-end;
          padding: var(--space-2xl);
          background:
            linear-gradient(135deg, rgba(10, 15, 26, 0.85) 0%, rgba(125, 159, 166, 0.2) 100%),
            url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect fill="%230a0f1a"/><circle cx="400" cy="300" r="200" fill="%237d9fa6" opacity="0.08"/><circle cx="200" cy="400" r="150" fill="%237d9fa6" opacity="0.05"/><circle cx="600" cy="100" r="120" fill="%237d9fa6" opacity="0.06"/></svg>');
          background-size: cover;
          background-position: center;
          overflow: hidden;
        }

        .login-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(10, 15, 26, 0.95) 0%, rgba(10, 15, 26, 0.3) 60%, rgba(10, 15, 26, 0.6) 100%);
        }

        .login-hero-content {
          position: relative;
          z-index: 1;
          width: 100%;
        }

        .login-brand {
          margin-bottom: var(--space-2xl);
        }

        .login-logo {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--accent);
          margin-bottom: var(--space-xl);
        }

        .login-brand h1 {
          font-size: 2rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: var(--space-md);
          background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent-light) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-brand p {
          font-size: 1rem;
          color: var(--text-secondary);
          max-width: 400px;
          line-height: 1.6;
        }

        .login-hero-stats {
          display: flex;
          gap: var(--space-xl);
        }

        .login-hero-stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--accent);
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* ── Form Panel ── */
        .login-form-panel {
          width: 480px;
          min-width: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          border-left: 1px solid var(--border);
        }

        .login-form-container {
          width: 100%;
          max-width: 360px;
          padding: var(--space-xl);
        }

        .login-form-header {
          margin-bottom: var(--space-xl);
        }

        .login-form-header h2 {
          font-size: 1.5rem;
          margin-bottom: var(--space-xs);
        }

        .login-form-header p {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .login-error {
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

        .login-submit {
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

        .login-footer {
          text-align: center;
          margin-top: var(--space-xl);
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .login-footer a {
          color: var(--accent);
          font-weight: 500;
        }
        .login-footer a:hover {
          color: var(--accent-light);
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .login-page {
            flex-direction: column;
          }

          .login-hero {
            min-height: 30vh;
            padding: var(--space-xl);
          }

          .login-brand h1 {
            font-size: 1.5rem;
          }

          .login-form-panel {
            width: 100%;
            min-width: unset;
            border-left: none;
            border-top: 1px solid var(--border);
          }

          .login-form-container {
            max-width: 100%;
            padding: var(--space-xl);
          }
        }
      `}</style>
        </div>
    );
}
