"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    reference: string;
    difficulty: "básico" | "intermedio" | "avanzado";
}

const quizQuestions: QuizQuestion[] = [
    {
        id: 1,
        question:
            "Según el ECF 1, ¿quién es la ÚNICA persona autorizada para retirar un candado de bloqueo?",
        options: [
            "El supervisor de turno",
            "El trabajador que lo instaló",
            "El jefe de área",
            "Cualquier trabajador capacitado en LOTO",
        ],
        correctIndex: 1,
        explanation:
            "El Art. 52 del DS 132 y el ECF 1 establecen que el dispositivo de bloqueo solo puede ser retirado por la persona que lo colocó. Esto garantiza que ningún equipo sea re-energizado mientras alguien trabaja en él.",
        reference: "DS 132 Art. 52 · ECF 1 Requisito B1",
        difficulty: "básico",
    },
    {
        id: 2,
        question:
            "¿Cuál es el Límite Permisible Ponderado (LPP) de Sílice Cristalina según el DS 594?",
        options: [
            "0,15 mg/m³",
            "0,08 mg/m³",
            "0,50 mg/m³",
            "0,01 mg/m³",
        ],
        correctIndex: 1,
        explanation:
            "El DS 594 Art. 66 establece el LPP de Sílice Cristalina en 0,08 mg/m³ como límite ponderado. Además, el Art. 58 bis exige humectación obligatoria como medida de control.",
        reference: "DS 594 Art. 66 · Art. 58 bis",
        difficulty: "intermedio",
    },
    {
        id: 3,
        question:
            "Al detectar gas en un nivel subterráneo, ¿cuál es la PRIMERA acción según el protocolo de emergencia?",
        options: [
            "Notificar al supervisor por radio",
            "Evaluar el nivel de concentración con detector",
            "Evacuar inmediatamente hacia la corriente de aire fresco",
            "Colocar la señalética de advertencia",
        ],
        correctIndex: 2,
        explanation:
            "Ante detección de gas, la primera prioridad es siempre la evacuación. El Art. 99 del DS 132 establece que los trabajadores deben alejarse inmediatamente hacia aire fresco por las rutas de escape establecidas. La notificación y evaluación son pasos posteriores una vez que el personal está seguro.",
        reference: "DS 132 Art. 99 · Art. 100 · Plan de Emergencia",
        difficulty: "básico",
    },
    {
        id: 4,
        question:
            "¿Cuál es la fórmula correcta del Factor de Reducción de Jornada (Fj) para exposición a contaminantes?",
        options: [
            "Fj = 8/h",
            "Fj = (8/h) × ((24-h)/16)",
            "Fj = h/8 × 16/(24-h)",
            "Fj = (24-h)/16",
        ],
        correctIndex: 1,
        explanation:
            "El Factor Fj se calcula como Fj = (8/h) × ((24-h)/16), donde h son las horas de jornada. Este factor ajusta los límites de exposición para jornadas que excedan las 8 horas estándar, según el Título IV del DS 594.",
        reference: "DS 594 Título IV",
        difficulty: "avanzado",
    },
    {
        id: 5,
        question:
            "Según el ECF 2, ¿a partir de qué altura se considera trabajo en altura y requiere arnés de seguridad?",
        options: [
            "1,2 metros",
            "1,5 metros",
            "1,8 metros",
            "2,0 metros",
        ],
        correctIndex: 2,
        explanation:
            "El ECF 2 define trabajo en altura como toda actividad realizada a 1,8 metros o más sobre el nivel del piso. A partir de esta altura, es obligatorio el uso de arnés de seguridad completo con doble cabo de vida anclado a punto certificado.",
        reference: "ECF 2 — Trabajo en Altura · Requisito A1",
        difficulty: "básico",
    },
];

export default function QuizPage() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [answered, setAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);

    const current = quizQuestions[currentIndex];
    const progress = ((currentIndex + (answered ? 1 : 0)) / quizQuestions.length) * 100;

    const handleSelect = (optIndex: number) => {
        if (answered) return;
        setSelectedOption(optIndex);
        setAnswered(true);
        if (optIndex === current.correctIndex) {
            setScore((prev) => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < quizQuestions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setSelectedOption(null);
            setAnswered(false);
        } else {
            setFinished(true);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setSelectedOption(null);
        setAnswered(false);
        setScore(0);
        setFinished(false);
    };

    const getOptionClass = (optIndex: number) => {
        if (!answered) return selectedOption === optIndex ? "selected" : "";
        if (optIndex === current.correctIndex) return "correct";
        if (optIndex === selectedOption && optIndex !== current.correctIndex)
            return "incorrect";
        return "";
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <header className="page-header">
                    <div>
                        <h1 className="page-title">
                            <span className="page-title-icon">📝</span>
                            Quiz Adaptativo
                        </h1>
                        <p className="page-subtitle">
                            Evalúa tu conocimiento en seguridad minera
                        </p>
                    </div>
                    <span className="badge badge-info">
                        Módulo: Normativa General
                    </span>
                </header>

                <div className="page-body">
                    {!finished ? (
                        <div className="quiz-container animate-slide-up">
                            {/* Progress */}
                            <div className="quiz-progress">
                                <div className="quiz-progress-bar">
                                    <div
                                        className="quiz-progress-fill"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <span className="quiz-progress-label">
                                    {currentIndex + 1} / {quizQuestions.length}
                                </span>
                            </div>

                            {/* Question Card */}
                            <div className="quiz-question-card">
                                <div className="quiz-question-number">
                                    Pregunta {currentIndex + 1} ·{" "}
                                    <span
                                        className={`badge ${current.difficulty === "básico"
                                                ? "badge-success"
                                                : current.difficulty === "intermedio"
                                                    ? "badge-warning"
                                                    : "badge-danger"
                                            }`}
                                    >
                                        {current.difficulty}
                                    </span>
                                </div>

                                <h2 className="quiz-question-text">{current.question}</h2>

                                <div className="quiz-options">
                                    {current.options.map((opt, i) => (
                                        <button
                                            key={i}
                                            className={`quiz-option ${getOptionClass(i)}`}
                                            onClick={() => handleSelect(i)}
                                            id={`quiz-option-${i}`}
                                        >
                                            <span className="quiz-option-letter">
                                                {answered && i === current.correctIndex
                                                    ? "✓"
                                                    : answered && i === selectedOption && i !== current.correctIndex
                                                        ? "✗"
                                                        : String.fromCharCode(65 + i)}
                                            </span>
                                            {opt}
                                        </button>
                                    ))}
                                </div>

                                {/* Explanation */}
                                {answered && (
                                    <div className="quiz-explanation animate-fade-in">
                                        <strong style={{ color: "var(--accent-primary)" }}>
                                            💡 Explicación:
                                        </strong>
                                        <br />
                                        {current.explanation}
                                        <br />
                                        <span className="chat-reference" style={{ marginTop: 8, display: "inline-flex" }}>
                                            📜 {current.reference}
                                        </span>
                                    </div>
                                )}

                                {/* Next Button */}
                                {answered && (
                                    <div style={{ marginTop: 20, textAlign: "right" }}>
                                        <button className="btn btn-primary" onClick={handleNext} id="quiz-next">
                                            {currentIndex < quizQuestions.length - 1
                                                ? "Siguiente →"
                                                : "Ver Resultados"}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Score indicator */}
                            <div
                                style={{
                                    marginTop: 16,
                                    textAlign: "center",
                                    fontSize: "0.8rem",
                                    color: "var(--text-muted)",
                                }}
                            >
                                Score actual: {score}/{currentIndex + (answered ? 1 : 0)} correctas
                            </div>
                        </div>
                    ) : (
                        /* Results */
                        <div className="quiz-container animate-slide-up">
                            <div className="quiz-question-card" style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "4rem", marginBottom: 16 }}>
                                    {score >= quizQuestions.length * 0.8
                                        ? "🏆"
                                        : score >= quizQuestions.length * 0.6
                                            ? "👍"
                                            : "📚"}
                                </div>
                                <h2 style={{ marginBottom: 8 }}>
                                    {score >= quizQuestions.length * 0.8
                                        ? "¡Excelente!"
                                        : score >= quizQuestions.length * 0.6
                                            ? "Buen trabajo"
                                            : "Necesitas repasar"}
                                </h2>
                                <p
                                    style={{
                                        fontSize: "0.9rem",
                                        color: "var(--text-secondary)",
                                        marginBottom: 24,
                                    }}
                                >
                                    Respondiste correctamente{" "}
                                    <strong style={{ color: "var(--accent-primary)" }}>
                                        {score} de {quizQuestions.length}
                                    </strong>{" "}
                                    preguntas.
                                </p>

                                <div className="stats-row" style={{ marginBottom: 24 }}>
                                    <div className="stat-card">
                                        <div className="stat-icon green">✅</div>
                                        <div>
                                            <div className="stat-value">{score}</div>
                                            <div className="stat-label">Correctas</div>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon red">❌</div>
                                        <div>
                                            <div className="stat-value">
                                                {quizQuestions.length - score}
                                            </div>
                                            <div className="stat-label">Incorrectas</div>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon blue">📊</div>
                                        <div>
                                            <div className="stat-value">
                                                {Math.round((score / quizQuestions.length) * 100)}%
                                            </div>
                                            <div className="stat-label">Porcentaje</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                                    <button className="btn btn-secondary" onClick={handleRestart} id="quiz-restart">
                                        🔄 Intentar de nuevo
                                    </button>
                                    <button className="btn btn-primary" id="quiz-certificate">
                                        📜 Descargar Certificado
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
