import Sidebar from "@/components/Sidebar";

const scenarios = [
    {
        id: 1,
        title: "Detección de Gas en Nivel 2400",
        desc: "Se detecta gas CH4 en un nivel subterráneo mientras supervisas una cuadrilla. Toma las decisiones correctas paso a paso.",
        risk: "alto",
        ecf: "ECF 9",
        duration: "~5 min",
        status: "disponible",
    },
    {
        id: 2,
        title: "Falla de Bloqueo en Mantenimiento",
        desc: "Durante una reparación de correa transportadora, descubres que un candado LOTO fue removido sin autorización. ¿Qué haces?",
        risk: "crítico",
        ecf: "ECF 1 · ECF 4",
        duration: "~8 min",
        status: "disponible",
    },
    {
        id: 3,
        title: "Caída de Material en Pique",
        desc: "Un operador reporta caída de material desde la boca del pique. Hay personal trabajando en niveles inferiores.",
        risk: "crítico",
        ecf: "ECF 3 · ECF 5",
        duration: "~6 min",
        status: "próximamente",
    },
];

function getRiskBadge(risk: string) {
    if (risk === "crítico") return "badge-danger";
    if (risk === "alto") return "badge-warning";
    return "badge-info";
}

export default function ScenarioPage() {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <header className="page-header">
                    <div>
                        <h1 className="page-title">
                            <span className="page-title-icon">🎭</span>
                            Simulación de Escenarios
                        </h1>
                        <p className="page-subtitle">
                            Enfrenta situaciones de riesgo simuladas y practica tu respuesta
                        </p>
                    </div>
                    <span className="badge badge-warning">En desarrollo</span>
                </header>

                <div className="page-body">
                    <div className="card-grid animate-slide-up">
                        {scenarios.map((s) => (
                            <div
                                key={s.id}
                                className="card"
                                style={{
                                    opacity: s.status === "próximamente" ? 0.6 : 1,
                                    cursor:
                                        s.status === "disponible" ? "pointer" : "not-allowed",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: 12,
                                    }}
                                >
                                    <span className={`badge ${getRiskBadge(s.risk)}`}>
                                        ⚠️ Riesgo {s.risk}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: "0.75rem",
                                            color: "var(--text-muted)",
                                        }}
                                    >
                                        {s.duration}
                                    </span>
                                </div>

                                <h3 className="card-title">{s.title}</h3>
                                <p className="card-desc">{s.desc}</p>

                                <div
                                    style={{
                                        marginTop: 16,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <span className="chat-reference">📜 {s.ecf}</span>
                                    {s.status === "disponible" ? (
                                        <button className="btn btn-primary btn-sm">
                                            Iniciar →
                                        </button>
                                    ) : (
                                        <span
                                            style={{
                                                fontSize: "0.75rem",
                                                color: "var(--text-muted)",
                                            }}
                                        >
                                            Próximamente
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* How it works */}
                    <div
                        className="card animate-slide-up"
                        style={{ marginTop: 24 }}
                    >
                        <h3 className="card-title" style={{ marginBottom: 16 }}>
                            ¿Cómo funciona?
                        </h3>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                gap: 20,
                            }}
                        >
                            <div>
                                <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>📖</div>
                                <strong style={{ fontSize: "0.9rem" }}>Lee el escenario</strong>
                                <p
                                    style={{
                                        fontSize: "0.8rem",
                                        color: "var(--text-secondary)",
                                        marginTop: 4,
                                    }}
                                >
                                    Se te presenta una situación de riesgo basada en casos reales
                                </p>
                            </div>
                            <div>
                                <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>🤔</div>
                                <strong style={{ fontSize: "0.9rem" }}>Toma decisiones</strong>
                                <p
                                    style={{
                                        fontSize: "0.8rem",
                                        color: "var(--text-secondary)",
                                        marginTop: 4,
                                    }}
                                >
                                    Elige entre opciones con consecuencias reales
                                </p>
                            </div>
                            <div>
                                <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>📊</div>
                                <strong style={{ fontSize: "0.9rem" }}>Aprende del resultado</strong>
                                <p
                                    style={{
                                        fontSize: "0.8rem",
                                        color: "var(--text-secondary)",
                                        marginTop: 4,
                                    }}
                                >
                                    Cada decisión se evalúa contra normativa vigente
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
