import Sidebar from "@/components/Sidebar";
import Link from "next/link";

const modules = [
    {
        icon: "🤖",
        title: "Consulta IA",
        desc: "Pregunta sobre normativas, procedimientos y protocolos de seguridad. Respuestas con citas directas al DS 132, DS 594 y ECFs.",
        href: "/chat",
        stat: { value: "∞", label: "consultas disponibles" },
        color: "var(--accent-primary)",
    },
    {
        icon: "📝",
        title: "Quiz Adaptativo",
        desc: "Preguntas que se adaptan a tu nivel. Evalúa tu conocimiento en bloqueo de energías, trabajo en altura, manejo de explosivos y más.",
        href: "/quiz",
        stat: { value: "5", label: "módulos activos" },
        color: "var(--accent-success)",
    },
    {
        icon: "🎭",
        title: "Simulación de Escenarios",
        desc: "Enfrenta situaciones de riesgo simuladas. Toma decisiones y aprende de las consecuencias sin peligro real.",
        href: "/scenario",
        stat: { value: "3", label: "escenarios" },
        color: "var(--accent-warning)",
    },
];

const recentActivity = [
    {
        action: "Quiz completado",
        topic: "ECF 1 — Aislación y Bloqueo",
        score: "85%",
        time: "Hace 2h",
    },
    {
        action: "Consulta IA",
        topic: "EPP para soldadura en altura",
        score: "",
        time: "Hace 4h",
    },
    {
        action: "Quiz completado",
        topic: "DS 132 Art. 52-55",
        score: "92%",
        time: "Ayer",
    },
];

export default function DashboardPage() {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <header className="page-header">
                    <div>
                        <h1 className="page-title">
                            <span className="page-title-icon">📊</span>
                            Dashboard
                        </h1>
                        <p className="page-subtitle">
                            Tu progreso en capacitación de seguridad
                        </p>
                    </div>
                    <span className="badge badge-success">● En línea</span>
                </header>

                <div className="page-body">
                    {/* Stats */}
                    <div className="stats-row animate-slide-up">
                        <div className="stat-card">
                            <div className="stat-icon blue">🎯</div>
                            <div>
                                <div className="stat-value">12</div>
                                <div className="stat-label">Consultas hoy</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon green">✅</div>
                            <div>
                                <div className="stat-value">87%</div>
                                <div className="stat-label">Score promedio</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon yellow">🔥</div>
                            <div>
                                <div className="stat-value">5</div>
                                <div className="stat-label">Días seguidos</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon red">📜</div>
                            <div>
                                <div className="stat-value">2</div>
                                <div className="stat-label">Certificaciones</div>
                            </div>
                        </div>
                    </div>

                    {/* Modules */}
                    <h2 style={{ marginBottom: 16, fontSize: "1.1rem" }}>
                        Módulos de Entrenamiento
                    </h2>
                    <div className="card-grid animate-slide-up">
                        {modules.map((mod) => (
                            <Link
                                key={mod.href}
                                href={mod.href}
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                <div className="card" style={{ cursor: "pointer" }}>
                                    <div className="card-icon">{mod.icon}</div>
                                    <h3 className="card-title">{mod.title}</h3>
                                    <p className="card-desc">{mod.desc}</p>
                                    <div className="card-stat">
                                        <span
                                            className="card-stat-value"
                                            style={{ color: mod.color }}
                                        >
                                            {mod.stat.value}
                                        </span>
                                        <span className="card-stat-label">{mod.stat.label}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Recent Activity */}
                    <h2 style={{ margin: "28px 0 16px", fontSize: "1.1rem" }}>
                        Actividad Reciente
                    </h2>
                    <div className="card animate-slide-up">
                        <table
                            style={{ width: "100%", borderCollapse: "collapse" }}
                        >
                            <thead>
                                <tr
                                    style={{
                                        borderBottom: "1px solid var(--border-color)",
                                        textAlign: "left",
                                    }}
                                >
                                    <th
                                        style={{
                                            padding: "8px 0",
                                            fontSize: "0.75rem",
                                            color: "var(--text-muted)",
                                            fontWeight: 600,
                                        }}
                                    >
                                        Acción
                                    </th>
                                    <th
                                        style={{
                                            padding: "8px 0",
                                            fontSize: "0.75rem",
                                            color: "var(--text-muted)",
                                            fontWeight: 600,
                                        }}
                                    >
                                        Tema
                                    </th>
                                    <th
                                        style={{
                                            padding: "8px 0",
                                            fontSize: "0.75rem",
                                            color: "var(--text-muted)",
                                            fontWeight: 600,
                                        }}
                                    >
                                        Score
                                    </th>
                                    <th
                                        style={{
                                            padding: "8px 0",
                                            fontSize: "0.75rem",
                                            color: "var(--text-muted)",
                                            fontWeight: 600,
                                        }}
                                    >
                                        Hora
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentActivity.map((item, i) => (
                                    <tr
                                        key={i}
                                        style={{
                                            borderBottom: "1px solid var(--border-color)",
                                        }}
                                    >
                                        <td
                                            style={{
                                                padding: "12px 0",
                                                fontSize: "0.85rem",
                                            }}
                                        >
                                            {item.action}
                                        </td>
                                        <td
                                            style={{
                                                padding: "12px 0",
                                                fontSize: "0.85rem",
                                                color: "var(--text-secondary)",
                                            }}
                                        >
                                            {item.topic}
                                        </td>
                                        <td style={{ padding: "12px 0" }}>
                                            {item.score && (
                                                <span className="badge badge-success">
                                                    {item.score}
                                                </span>
                                            )}
                                        </td>
                                        <td
                                            style={{
                                                padding: "12px 0",
                                                fontSize: "0.8rem",
                                                color: "var(--text-muted)",
                                            }}
                                        >
                                            {item.time}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
