"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
    label: string;
    icon: string;
    href: string;
    badge?: string;
}

const navItems: NavItem[] = [
    { label: "Dashboard", icon: "📊", href: "/" },
    { label: "Consulta IA", icon: "🤖", href: "/chat" },
    { label: "Quiz Adaptativo", icon: "📝", href: "/quiz", badge: "Nuevo" },
    { label: "Simulación", icon: "🎭", href: "/scenario", badge: "Próx." },
];

const normativeItems: NavItem[] = [
    { label: "DS 132", icon: "📜", href: "/normativa/ds132" },
    { label: "DS 594", icon: "📋", href: "/normativa/ds594" },
    { label: "ECFs", icon: "🛡️", href: "/normativa/ecf" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            {/* Mobile toggle */}
            <button
                className="btn btn-ghost"
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{
                    position: "fixed",
                    top: 16,
                    left: 16,
                    zIndex: 200,
                    display: "none",
                    fontSize: "1.25rem",
                }}
                id="sidebar-toggle"
            >
                ☰
            </button>

            <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
                {/* Header */}
                <div className="sidebar-header">
                    <div className="sidebar-logo">S</div>
                    <div className="sidebar-brand">
                        <span className="sidebar-brand-name">SRP Train</span>
                        <span className="sidebar-brand-sub">Safety RAFT Procedures</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    <span className="nav-section-label">Entrenamiento</span>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-link ${pathname === item.href ? "active" : ""}`}
                            onClick={() => setMobileOpen(false)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                            {item.badge && <span className="nav-badge">{item.badge}</span>}
                        </Link>
                    ))}

                    <span className="nav-section-label" style={{ marginTop: 8 }}>
                        Base de Conocimiento
                    </span>
                    {normativeItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-link ${pathname === item.href ? "active" : ""}`}
                            onClick={() => setMobileOpen(false)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    <div className="sidebar-avatar">RA</div>
                    <div className="sidebar-user-info">
                        <span className="sidebar-user-name">Raúl Aguirre</span>
                        <span className="sidebar-user-role">Jefe Unidad · DCH</span>
                    </div>
                </div>
            </aside>
        </>
    );
}
