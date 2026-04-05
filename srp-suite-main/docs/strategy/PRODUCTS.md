# 🦜 SRP - Catálogo de Productos

SRP: Suite de IA para Seguridad Minera basada en arquitectura RAFT.

---

## 🎓 SRP Learn
**"Capacitación que sí se ve y se entiende"**

| Problema | Solución |
|----------|----------|
| Videos pasivos sin verificación | Quizzes bloqueantes (Active Recall) |
| Actualización costosa de videos | Video programático (Remotion) - $0 |
| Sin evidencia de comprensión | Certificación automática |

**Stack**: Remotion + Cloudflare Workers AI (TTS) + React Player

---

## 📄 SRP Docs
**"El ingeniero de seguridad que nunca duerme"**

| Problema | Solución |
|----------|----------|
| Redacción inconsistente | Generación IA con estilo corporativo |
| Falta de citas normativas | Referencias automáticas DS 132/594 |
| Proceso lento (días) | Borrador en minutos |

**Stack**: RAFT (RAG + Fine-Tuning) + WhatsApp Bot

---

## 🛡️ SRP Guard
**"El fiscalizador interno que previene multas"**

| Problema | Solución |
|----------|----------|
| Documentos no conformes | Validación automática vs Golden Docs |
| Desconocimiento de cambios normativos | Monitoreo BCN + Alertas |
| Auditorías reactivas | Dashboard de compliance proactivo |

**Stack**: Vectorize + Workers AI + Supabase

---

## 🗄️ SRP Vault
**"El repositorio vivo de tu documentación crítica"**

| Problema | Solución |
|----------|----------|
| Documentos obsoletos en uso | Control de vida útil + alertas |
| Sin trazabilidad de lectura | Check de lectura obligatoria |
| Versiones descontroladas | Versionado automático |

**Stack**: R2 + D1 + Zero Trust

---

## 📱 SRP Mobile
**"La seguridad en el bolsillo del supervisor"**

| Problema | Solución |
|----------|----------|
| Acceso limitado a documentos | Bot WhatsApp + Offline mode |
| Firmas en papel | Firma digital móvil |
| Checklists físicos | Checklist digital en terreno |

**Stack**: WhatsApp Business API + React Native

---

## SRP Vision
**"Un supervisor experto con IA en el oido del tecnico"**

| Problema | Solucion |
|----------|----------|
| Tecnicos junior sin experiencia senior | Asistencia IA en tiempo real por audio |
| Errores no detectados en mantenimiento | Vision por computador detecta anomalias |
| Conocimiento tacito se pierde con jubilacion | Seniors entrenan la IA antes de irse |
| Sin supervision remota de calidad | Multi-pantalla: N mantenciones simultaneas |

**Stack**: GPT-4o Vision / Gemini Flash + WebSocket + OpenAI TTS + Whisper STT

**Hardware**: Camara en casco (Insta360 GO 3S) + Audifonos conduccion osea (Shokz OpenComm2)

**Equipos target**: CAEX Komatsu 930E/980E, Palas P&H 4100XPC

**Colaboracion academica**: PUCV (4 lineas de investigacion, CORFO Innova ~USD $1.1M)

---

## Estructura del Monorepo

```
srp-suite/
├── apps/
│   ├── learn/      # Video Generator (Remotion)
│   ├── docs/       # Document Generator
│   ├── guard/      # Compliance Validator
│   ├── vault/      # Document Lifecycle
│   ├── landing/    # Static Website
│   └── web/        # Next.js App
├── packages/
│   ├── ui/         # Shared Components
│   └── config/     # Shared Configs
└── docs/
    ├── BACKLOG.md
    └── BITACORA.md
```
