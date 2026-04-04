'use client';

import { useAuth } from '../../lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/procedures', label: 'Procedimientos', icon: '📋' },
  { href: '/dashboard/docs', label: 'SRP Docs', icon: '📄' },
  { href: '/dashboard/learn', label: 'SRP Learn', icon: '🎓' },
  { href: '/dashboard/jobs', label: 'Jobs Queue', icon: '⚡' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Cargando SRP Suite...</p>
        <style jsx>{`
          .loading-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            gap: var(--space-md);
            color: var(--text-secondary);
          }
          .loading-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid var(--border);
            border-top-color: var(--accent);
            border-radius: 50%;
            animation: spin 800ms linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="dashboard-shell">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#7d9fa6" fillOpacity="0.2" />
              <path d="M12 28V16l8-6 8 6v12H22v-6h-4v6H12z" stroke="#7d9fa6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {!sidebarCollapsed && <span className="logo-text">SRP Suite</span>}
          </div>
          <button
            className="btn btn-ghost sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expandir' : 'Colapsar'}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="sidebar-label">{item.label}</span>}
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user.full_name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user.full_name || user.email}</span>
                <span className="sidebar-user-role">{user.role}</span>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button className="btn btn-ghost sidebar-logout" onClick={logout} title="Cerrar sesión">
              ↪
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {children}
      </main>

      <style jsx>{`
        .dashboard-shell {
          display: flex;
          min-height: 100vh;
        }

        /* ── Sidebar ── */
        .sidebar {
          width: var(--sidebar-width);
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          transition: width var(--transition-base);
          overflow: hidden;
          z-index: 50;
        }

        .sidebar.collapsed {
          width: var(--sidebar-collapsed);
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-lg);
          border-bottom: 1px solid var(--border);
          min-height: 64px;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .logo-text {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--accent);
          white-space: nowrap;
        }

        .sidebar-toggle {
          font-size: 0.875rem;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          flex-shrink: 0;
        }

        /* ── Nav ── */
        .sidebar-nav {
          flex: 1;
          padding: var(--space-md);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: 0.625rem 0.75rem;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          transition: all var(--transition-fast);
          white-space: nowrap;
          text-decoration: none;
        }

        .sidebar-link:hover {
          color: var(--text-primary);
          background: var(--accent-glow);
        }

        .sidebar-link.active {
          color: var(--accent);
          background: var(--accent-glow);
          border-left: 2px solid var(--accent);
        }

        .sidebar-icon {
          font-size: 1.125rem;
          width: 24px;
          text-align: center;
          flex-shrink: 0;
        }

        /* ── Footer ── */
        .sidebar-footer {
          padding: var(--space-md) var(--space-lg);
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          overflow: hidden;
        }

        .sidebar-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--accent-glow-strong);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8125rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .sidebar-user-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .sidebar-user-name {
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-user-role {
          font-size: 0.6875rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .sidebar-logout {
          font-size: 1rem;
          flex-shrink: 0;
        }

        /* ── Main ── */
        .dashboard-main {
          flex: 1;
          padding: var(--space-xl) var(--space-2xl);
          overflow-y: auto;
          min-height: 100vh;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 100;
            transform: translateX(-100%);
            transition: transform var(--transition-base);
          }

          .sidebar:not(.collapsed) {
            transform: translateX(0);
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
          }

          .dashboard-main {
            padding: var(--space-lg);
          }
        }
      `}</style>
    </div>
  );
}
