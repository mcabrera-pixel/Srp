# Arquitectura del Sistema Mining RAG

## Visión General

Mining RAG es un sistema de generación automática de procedimientos mineros estandarizados, operando sobre **Cloudflare Workers**. Convierte descripciones de tareas (texto/audio vía WhatsApp) en documentos **DOCX** profesionales con:
- Análisis de riesgos automático
- **Riesgos de fatalidad** (24 RF del Excel)
- **Riesgos de zona** (RC específicos por área, ej: POX)

---

## Diagrama de Contexto (C4 Level 1)

```mermaid
graph TD
    User((Operador Minero))
    WA[WhatsApp]
    Worker[Mining RAG Worker]
    Admin((Administrador))
    
    User -->|Audio/Texto| WA
    WA -->|Webhook| Worker
    Worker -->|PDF + Mensajes| WA
    WA -->|Entrega| User
    Admin -->|Ingesta docs| Worker
    Admin -->|Monitor| Worker
```

**Actores:**
- **Operador Minero**: Usuario final que describe tareas vía WhatsApp
- **Administrador**: Gestiona documentos base y monitorea el sistema

---

## Diagrama de Contenedores (C4 Level 2)

```mermaid
graph TB
    subgraph "Cloudflare Edge"
        Worker[Hono Worker<br/>src/index.ts]
        
        subgraph "Storage"
            D1[(D1 Database<br/>SQLite)]
            R2[(R2 Bucket<br/>PDFs)]
            Vec[(Vectorize<br/>Embeddings)]
        end
        
        subgraph "AI Services"
            Whisper[Workers AI<br/>Whisper]
            Embed[Workers AI<br/>Embeddings]
        end
    end
    
    subgraph "External"
        WA[Wasender API<br/>WhatsApp]
        Claude[OpenRouter<br/>Claude Sonnet]
    end
    
    Worker --> D1
    Worker --> R2
    Worker --> Vec
    Worker --> Whisper
    Worker --> Embed
    Worker <--> WA
    Worker --> Claude
```

---

## Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|------------|-----------|
| **Runtime** | Cloudflare Workers | Serverless edge computing |
| **Framework** | Hono.js | Routing HTTP ligero |
| **Database** | Cloudflare D1 | Persistencia SQL (SQLite) |
| **Vector DB** | Cloudflare Vectorize | Búsqueda semántica RAG |
| **Storage** | Cloudflare R2 | Almacenamiento de DOCX y templates |
| **Transcripción** | Cloudflare Whisper | Audio → Texto |
| **Embeddings** | Cloudflare AI | Vectorización de texto |
| **LLM** | MiniMax (OpenRouter) | Generación de contenido |
| **WhatsApp** | Wasender API | Mensajería bidireccional |
| **DOCX** | docxtemplater + pizzip | Generación de documentos Word |

---

## Flujo de Datos Principal

```mermaid
sequenceDiagram
    participant U as Usuario
    participant W as WhatsApp
    participant H as Worker
    participant AI as Claude
    participant DB as D1/R2
    
    U->>W: Audio/Texto
    W->>H: POST /webhook
    H-->>W: 200 OK (inmediato)
    
    alt Audio recibido
        H->>H: Transcribir (Whisper)
    end
    
    H->>AI: Análisis de gaps
    
    alt Información incompleta
        H->>W: Preguntas aclaratorias
        W->>U: ⚠️ Necesito más info...
    else Información completa
        H->>H: Extraer pasos
        H->>W: Confirmar pasos
        W->>U: ✅ ¿Es correcto?
        U->>W: Sí
        W->>H: Confirmación
        H->>AI: Generar procedimiento + riesgos
        H->>DB: Guardar JSON + PDF
        H->>W: Link de descarga
        W->>U: 📄 Tu procedimiento
    end
```

---

## Decisiones de Arquitectura

| Decisión | Justificación |
|----------|---------------|
| **Background Processing** | `ctx.waitUntil()` para evitar timeouts de 30s en generación |
| **RAG con Vectorize** | Búsqueda semántica en documentos base para contexto relevante |
| **Gap Analysis preventivo** | LLM valida completitud antes de generar, mejora calidad |
| **D1 + R2 separados** | Metadatos en SQL, binarios (DOCX) en object storage |
| **OpenRouter como gateway** | Flexibilidad para cambiar modelo LLM sin reescribir código |
| **DOCX con templates** | docxtemplater permite loops dinámicos para tablas de riesgos |
| **Riesgos por zona** | POX tiene matriz específica, otras zonas usan solo RF generales |

---

## Seguridad

- **Webhook Secret**: Header `X-Webhook-Secret` valida origen de mensajes
- **Admin Secret**: Rutas `/admin/*` protegidas con `X-Admin-Secret`
- **Secrets seguros**: API keys almacenadas via `wrangler secret`
- **Sanitización JSON**: Limpieza de respuestas LLM antes de parsing
