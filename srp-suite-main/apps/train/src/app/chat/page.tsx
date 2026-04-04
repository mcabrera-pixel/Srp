"use client";

import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    references?: string[];
    timestamp: Date;
    feedback?: "up" | "down" | null;
}

const SUGGESTIONS = [
    "¿Qué EPP necesito para soldar en altura?",
    "Explícame el ECF 1 de Aislación y Bloqueo",
    "¿Qué dice el Art. 52 del DS 132?",
    "Procedimiento para ingreso a espacio confinado",
    "¿Cuáles son los límites de exposición a sílice?",
    "¿Cómo se calcula el Factor de Altitud (Fa)?",
];

const DEMO_RESPONSES: Record<string, { content: string; refs: string[] }> = {
    default: {
        content:
            "Soy tu asistente de seguridad minera. Tengo acceso al DS 132, DS 594, los 12 ECFs y procedimientos internos. ¿En qué te puedo ayudar?",
        refs: [],
    },
    epp: {
        content: `Para **soldadura en altura** se requiere la siguiente combinación de EPP según el ECF 2 (Trabajo en Altura) y ECF 7 (Trabajo en Caliente):

**EPP Obligatorio:**
1. 🦺 **Arnés de seguridad** con doble cabo de vida — Art. 42 DS 132
2. 🧤 **Guantes de soldador** (cuero cromo) — protección contra salpicaduras
3. 👓 **Careta de soldador** con filtro según proceso (MIG: #10-12, Arco: #12-14)
4. 👢 **Zapatos de seguridad** con puntera reforzada y suela antideslizante
5. 🔥 **Ropa ignífuga** o cuero manga larga — ECF 7 requisito B3
6. 🫁 **Protección respiratoria** con filtro para humos metálicos (P100)

**Controles Adicionales:**
- Línea de vida retráctil anclada a punto certificado
- Biombo ignífugo bajo zona de trabajo
- Extintor ABC a menos de 10 metros
- Vigía de fuego durante y 30 min después`,
        refs: ["ECF 2 — Trabajo en Altura", "ECF 7 — Trabajo en Caliente", "DS 132 Art. 42"],
    },
    ecf1: {
        content: `El **ECF 1 — Aislación y Bloqueo de Energías** es el estándar de control de fatalidad que establece los requisitos mínimos para intervenir equipos:

**Flujo de 6 Pasos:**
1. **Identificación** de todas las fuentes de energía (eléctrica, neumática, hidráulica, potencial, química)
2. **Notificación** a todas las partes afectadas
3. **Apagado** seguro del equipo según manual del fabricante
4. **Aislamiento** físico de cada fuente de energía
5. **Bloqueo y Etiquetado (LOTO)** — candado personal + tarjeta con nombre, fecha y motivo
6. **Verificación** de energía cero antes de iniciar la intervención

**Requisitos Críticos (Art. 52 DS 132):**
- Solo el trabajador que colocó el candado puede retirarlo
- Cada trabajador debe tener **su propio candado** (no compartir)
- En caso de cambio de turno: protocolo de transferencia documentada
- Prohibido usar alambre, cinta u otros elementos en reemplazo del candado

**Consecuencia de incumplimiento:** Riesgo de fatalidad por liberación descontrolada de energía (ECF 4).`,
        refs: ["ECF 1 — Aislación y Bloqueo", "DS 132 Art. 52", "ECF 4 — Liberación de Energía"],
    },
    art52: {
        content: `**Artículo 52 del DS 132 (Reglamento de Seguridad Minera):**

> *"Antes de proceder a la mantención o reparación de cualquier maquinaria o equipo, se deberá cortar su fuente de energía y colocar en el mecanismo de corte un dispositivo de bloqueo que solo pueda ser retirado por la persona a cargo de los trabajos."*

**Puntos clave:**
1. Aplica a **toda** maquinaria, no solo eléctrica
2. El dispositivo de bloqueo debe ser **personal** — no grupales
3. La persona que bloquea es la **única** que puede desbloquear
4. Se complementa con el Art. 51 sobre registro de mantenimiento

**Relación con ECF 1:**
Este artículo es la base legal del estándar LOTO (Lockout/Tagout) implementado en todas las divisiones de Codelco a través del ECF 1.

**Sanciones:**
Su incumplimiento puede resultar en:
- Paralización de tareas por SERNAGEOMIN
- Multas según gravedad (Ley 16.744)
- Responsabilidad penal en caso de accidente`,
        refs: ["DS 132 Art. 52", "DS 132 Art. 51", "ECF 1", "Ley 16.744"],
    },
};

function getResponse(input: string): { content: string; refs: string[] } {
    const lower = input.toLowerCase();
    if (lower.includes("epp") || lower.includes("soldar") || lower.includes("soldadura"))
        return DEMO_RESPONSES.epp;
    if (lower.includes("ecf 1") || lower.includes("aislación") || lower.includes("bloqueo"))
        return DEMO_RESPONSES.ecf1;
    if (lower.includes("art") && lower.includes("52"))
        return DEMO_RESPONSES.art52;
    return DEMO_RESPONSES.default;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        const currentInput = input.trim();
        setInput("");
        setIsTyping(true);

        // Simulate RAG lookup delay
        await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

        const response = getResponse(currentInput);

        const assistantMsg: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: response.content,
            references: response.refs,
            timestamp: new Date(),
            feedback: null,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setIsTyping(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSuggestion = (text: string) => {
        setInput(text);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleFeedback = (msgId: string, type: "up" | "down") => {
        setMessages((prev) =>
            prev.map((m) =>
                m.id === msgId
                    ? { ...m, feedback: m.feedback === type ? null : type }
                    : m
            )
        );
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <header className="page-header">
                    <div>
                        <h1 className="page-title">
                            <span className="page-title-icon">🤖</span>
                            Consulta IA
                        </h1>
                        <p className="page-subtitle">
                            Pregunta sobre normativas, procedimientos y protocolos de seguridad
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <span className="badge badge-info">RAG Activo</span>
                        <span className="badge badge-success">DS 132 · DS 594 · ECFs</span>
                    </div>
                </header>

                <div className="page-body">
                    <div className="chat-container">
                        {/* Messages */}
                        <div className="chat-messages">
                            {messages.length === 0 && (
                                <div className="empty-state">
                                    <div className="empty-state-icon">🛡️</div>
                                    <h3 className="empty-state-title">
                                        Asistente de Seguridad Minera
                                    </h3>
                                    <p className="empty-state-desc">
                                        Consulta cualquier duda sobre normativas, procedimientos y
                                        protocolos. Todas las respuestas incluyen citas directas a la
                                        fuente.
                                    </p>
                                    <div className="empty-state-suggestions">
                                        {SUGGESTIONS.map((s, i) => (
                                            <button
                                                key={i}
                                                className="suggestion-chip"
                                                onClick={() => handleSuggestion(s)}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`chat-message ${msg.role}`}
                                >
                                    <div className="chat-message-avatar">
                                        {msg.role === "assistant" ? "🛡️" : "👤"}
                                    </div>
                                    <div>
                                        <div className="chat-message-bubble">
                                            {msg.content.split("\n").map((line, i) => (
                                                <span key={i}>
                                                    {line}
                                                    {i < msg.content.split("\n").length - 1 && <br />}
                                                </span>
                                            ))}
                                        </div>

                                        {/* References */}
                                        {msg.references && msg.references.length > 0 && (
                                            <div style={{ marginTop: 8 }}>
                                                {msg.references.map((ref, i) => (
                                                    <span key={i} className="chat-reference">
                                                        📜 {ref}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Feedback */}
                                        {msg.role === "assistant" && (
                                            <div className="chat-feedback">
                                                <button
                                                    className={
                                                        msg.feedback === "up" ? "active-up" : ""
                                                    }
                                                    onClick={() => handleFeedback(msg.id, "up")}
                                                    title="Respuesta útil"
                                                >
                                                    👍
                                                </button>
                                                <button
                                                    className={
                                                        msg.feedback === "down" ? "active-down" : ""
                                                    }
                                                    onClick={() => handleFeedback(msg.id, "down")}
                                                    title="Respuesta incorrecta"
                                                >
                                                    👎
                                                </button>
                                            </div>
                                        )}

                                        <div className="chat-message-meta">
                                            {msg.timestamp.toLocaleTimeString("es-CL", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Typing indicator */}
                            {isTyping && (
                                <div className="chat-message assistant">
                                    <div className="chat-message-avatar">🛡️</div>
                                    <div className="chat-message-bubble">
                                        <div className="typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="chat-input-area">
                            <div className="chat-input-wrapper">
                                <textarea
                                    ref={inputRef}
                                    className="chat-input"
                                    placeholder="Pregunta sobre seguridad minera..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    rows={1}
                                    id="chat-input"
                                />
                                <button
                                    className="chat-send-btn"
                                    onClick={handleSend}
                                    disabled={!input.trim() || isTyping}
                                    id="chat-send"
                                >
                                    ➤
                                </button>
                            </div>
                            <p className="chat-disclaimer">
                                Las respuestas son generadas por IA con base en normativa vigente.
                                Siempre valida con tu supervisor antes de aplicar en terreno.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
