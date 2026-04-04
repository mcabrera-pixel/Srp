# Informe Tecnico CTO → CEO
## Plataforma SRP Suite — MCCO Group
**Fecha:** 4 de abril de 2026 | **Clasificacion:** Confidencial

---

## 1. Resumen Ejecutivo

La organizacion MCCO tiene un grupo privado en GitLab (`gitlab.com/mcco2`) con **3 repositorios**. El producto principal es **SRP Suite** (Safety & Risk Procedures Suite): una plataforma de IA que genera automaticamente **procedimientos de trabajo seguro para mineria**, cumpliendo normativas de riesgos fatales. La plataforma recibe instrucciones por **WhatsApp o web chat**, y entrega documentos DOCX listos para revision.

---

## 2. Equipo y Accesos

| Usuario | Nombre | Rol GitLab | Actividad |
|---------|--------|------------|-----------|
| `Piloutz` | Nicolas Verdugo | Owner (nivel 50) | Desarrollador principal — todos los commits de codigo |
| `mcabrera11` | Mario Cabrera | Owner (nivel 50) | Propietario del grupo |

**Observacion:** Nicolas es el unico que ha hecho push de codigo. No hay otros contribuidores.

---

## 3. Inventario de Repositorios

### 3.1 SRP Suite (Repo Principal)
- **URL:** `gitlab.com/mcco2/srp-suite`
- **Creado:** 3 de marzo 2026
- **Ultimo commit:** 30 de marzo 2026
- **Commits totales:** 11
- **Stack:** Node.js 22 + TypeScript + Express + SQLite + MinIO
- **Estado:** Activo, funcional, dockerizado

### 3.2 WhatsApp Handler
- **URL:** `gitlab.com/mcco2/whatsapp-handler`
- **Creado:** 4 de marzo 2026
- **Stack:** Cloudflare Workers + TypeScript (Wrangler)
- **Commits totales:** 4
- **Estado:** Funcional — proxy intermediario entre Wasender y SRP Suite

### 3.3 SIGTP
- **URL:** `gitlab.com/mcco2/sigtp`
- **Creado:** 28 de marzo 2026
- **Commits totales:** 3 (solo initial commit + CI/CD config)
- **Estado:** Vacio — solo tiene README template de GitLab. Aun no tiene codigo.

---

## 4. Arquitectura Tecnica de SRP Suite

### 4.1 Diagrama de Flujo General

```
  Trabajador Minero (WhatsApp)
          │
          ▼
  ┌─────────────────┐     POST /webhook     ┌──────────────────────────┐
  │  Wasender API   │ ──────────────────────▶│  Worker Proxy            │
  │  (WhatsApp SaaS)│                        │  (Cloudflare Workers)    │
  └─────────────────┘                        │  Valida secret,          │
                                             │  reenvía a servidor      │
          ┌──────────────────────────────────▶└──────────┬───────────────┘
          │                                              │
          │  Alternativa: Web Chat                       │ X-Local-Secret
          │  (navegador)                                 ▼
          │                                  ┌──────────────────────────┐
          └──────────────────────────────────│  SRP Suite Server        │
                                             │  (Express + Node.js 22)  │
                                             │                          │
                                             │  ┌── SQLite (datos)     │
                                             │  ├── MinIO (archivos)   │
                                             │  ├── Vector Store (RAG) │
                                             │  ├── LLM (multi-modelo) │
                                             │  └── DOCX Generator     │
                                             └──────────────────────────┘
                                                        │
                                                        ▼
                                             Procedimiento DOCX generado
                                             (descargable por URL)
```

### 4.2 Componentes Internos (20 servicios)

| Servicio | Funcion |
|----------|---------|
| `server.ts` | Servidor principal Express con 15+ endpoints REST + WebSocket |
| `whatsapp-handler.ts` | Orquestador: recibe mensaje → decide flujo → coordina servicios |
| `llm.ts` | Dispatcher multi-modelo con catalogo configurable en runtime |
| `rag.ts` | Busqueda semantica (RAG) con ingestión, chunking y embeddings |
| `procedure-generator.ts` | Pipeline completo: RAG → riesgos → contenido → DOCX |
| `content-generator.ts` | Genera secciones del procedimiento via LLM |
| `risk-analyzer.ts` | Analisis de riesgos con severidad y probabilidad |
| `fatality-risk-service.ts` | Riesgos fatales de mineria con controles preventivos/mitigadores |
| `step-evaluator.ts` | Evalua calidad de cada paso (score 1-10), pide refinamiento |
| `gap-analyzer.ts` | Detecta vacios en la informacion del procedimiento |
| `generation-plan-service.ts` | Plan de generacion con campos requeridos y completeness |
| `task-extractor.ts` | Extrae pasos de tarea desde transcripcion |
| `audio-processor.ts` | Transcripcion de audio via OpenAI Whisper |
| `conversation-service.ts` | Mensajes dinamicos personalizados con LLM |
| `session-service.ts` | Historial de conversaciones persistente en SQLite |
| `profile-service.ts` | Perfiles de trabajadores con estilo de comunicacion |
| `personality-store.ts` | Personalidades del chatbot (strict/permissive/debug) |
| `prompt-store.ts` | Prompts editables en runtime sin redeploy |
| `docx-generator.ts` | Genera DOCX desde template prototipos (.docx) |
| `storage.ts` | Almacenamiento dual: MinIO (S3) + disco local |

### 4.3 Proveedores de IA Configurados

**LLM (Chat y Generacion):**
| Proveedor | Modelo | Uso |
|-----------|--------|-----|
| MiniMax | M2.5 | Modelo principal — razonamiento extendido, 1M contexto |
| MiniMax | Text-01 | Respuestas rapidas y livianas |
| OpenRouter | Gemini Flash, Claude, Deepseek, Qwen | Alternativas via API unificada |
| OpenAI | GPT-4o | Alternativa |

**Embeddings (RAG):**
| Proveedor | Modelo | Estado |
|-----------|--------|--------|
| Jina AI | jina-embeddings-v3 | **Recomendado** — 1M tokens gratis/mes |
| Google Gemini | gemini-embedding-001 | Alternativa — 1500 req/dia gratis |
| OpenAI | text-embedding-3-small | Alternativa de pago |
| Ollama | nomic-embed-text | Local, sin costo |
| MiniMax | embo-01 | Limitado a 1 RPM |

**Transcripcion:** OpenAI Whisper

### 4.4 Base de Datos (SQLite — 10 tablas)

| Tabla | Proposito |
|-------|-----------|
| `procedure_requests` | Solicitudes de procedimientos (estado machine: awaiting_audio → completed) |
| `procedures` | Procedimientos generados (draft → approved → published) |
| `base_documents` | Documentos fuente para RAG (prototipos, regulaciones, etc.) |
| `chat_sessions` | Sesiones de conversacion persistentes |
| `chat_messages` | Mensajes individuales por sesion |
| `generation_plans` | Planes de generacion con completeness tracking |
| `fatality_risks` | Catalogo de riesgos fatales de mineria |
| `fatality_risk_controls` | Controles preventivos y mitigadores por riesgo |
| `zone_risks` | Riesgos por zona geografica/operacional |
| `worker_profiles` | Perfiles de trabajadores (nombre, area, estilo comunicacion) |
| `feedback_entries` | Feedback sobre procedimientos (rating 1-5, correcciones) |

### 4.5 Infraestructura de Despliegue

```
Docker Compose (3 servicios):
├── srp-app        → Node.js 22 Alpine (build multi-stage)
├── srp-minio      → MinIO (Object Storage S3-compatible)
└── srp-minio-init → Inicializacion automatica del bucket
```

- **Dockerfile:** Multi-stage build (builder + runner), imagen Alpine liviana
- **CI/CD:** GitLab CI con SAST + Secret Detection habilitados
- **Exposicion:** Puerto 3000 (app) + Puerto 9000/9001 (MinIO API/Consola)
- **Para WhatsApp en produccion:** Cloudflare Tunnel (HTTPS publico → localhost)

---

## 5. Flujo de Negocio Principal

```
1. TRABAJADOR envía audio/texto por WhatsApp describiendo una tarea
           ↓
2. SISTEMA transcribe audio (Whisper) + identifica al trabajador (perfil)
           ↓
3. SISTEMA extrae pasos de la tarea + evalúa calidad de cada paso (score 1-10)
           ↓
4. Si algún paso tiene score < 7 → PIDE REFINAMIENTO al trabajador
           ↓
5. SISTEMA busca contexto relevante via RAG (procedimientos similares, riesgos)
           ↓
6. SISTEMA analiza riesgos fatales + controles preventivos/mitigadores
           ↓
7. SISTEMA genera DOCX completo usando template prototipo + contenido LLM
           ↓
8. TRABAJADOR recibe link de descarga del DOCX por WhatsApp
           ↓
9. TRABAJADOR puede dar feedback (rating 1-5, correcciones)
```

---

## 6. API Expuesta (15 endpoints)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/` | Interfaz web chat |
| GET | `/health` | Health check |
| POST | `/webhook` | Webhook Wasender/WhatsApp |
| POST | `/api/chat` | Chat desde web |
| POST | `/api/chat/reset` | Reset sesion |
| GET | `/procedures` | Listar procedimientos |
| GET | `/procedures/:id/json` | Ver JSON procedimiento |
| GET | `/procedures/:id/docx` | Descargar DOCX |
| POST | `/ingest` | Ingestar documento en RAG |
| WS | `/ws` | WebSocket para chat en tiempo real |
| GET/PUT | `/api/prompts` | Gestionar prompts en runtime |
| GET/POST/PUT/DELETE | `/api/personalities` | Gestionar personalidades del bot |
| GET/POST | `/api/models` | Gestionar modelos LLM activos |
| GET | `/files/*` | Archivos estaticos |

---

## 7. Seguridad

**Implementado:**
- Autenticacion por password (testing vs admin, dos niveles)
- Secret compartido Worker ↔ Servidor (X-Local-Secret)
- Validacion de firma Wasender en webhook
- GitLab SAST + Secret Detection en CI/CD
- Repositorios privados
- Credenciales via variables de entorno (.env)

**Pendiente/Observaciones:**
- No hay autenticacion JWT ni OAuth
- No hay rate limiting en endpoints publicos
- SIGTP esta vacio — no se observa progreso

---

## 8. Estado General y Recomendaciones

| Area | Estado | Detalle |
|------|--------|---------|
| Codigo | Funcional | 20 servicios TypeScript bien estructurados |
| Docker | Listo | Multi-stage build + docker-compose con MinIO |
| CI/CD | Basico | Solo security scanning, sin deploy automatico |
| Tests | Ausente | No hay tests unitarios ni de integracion |
| Documentacion | Buena | README exhaustivo con instrucciones paso a paso |
| SIGTP | Sin avance | Creado hace 7 dias, solo commit inicial |

**El desarrollador activo es exclusivamente Nicolas Verdugo (Piloutz).** Todo el codigo y avances dependen de una sola persona.

---

*Informe generado a partir del analisis completo del grupo GitLab MCCO y sus 3 repositorios.*
*4 de abril de 2026 — MCCO Group*
