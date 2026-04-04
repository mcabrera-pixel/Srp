# API Reference - Mining RAG

Este documento describe todos los endpoints HTTP del sistema.

---

## Base URL

- **Producción:** `https://mining-rag.amiranda-9c4.workers.dev`
- **Desarrollo:** `http://localhost:8787`

---

## Endpoints Públicos

### Health Check

```http
GET /
```

**Response:**
```json
{
    "status": "ok",
    "service": "Mining RAG System",
    "version": "1.0.0"
}
```

---

### Webhook WhatsApp (Wasender)

```http
POST /webhook
```

**Headers:**
| Header | Requerido | Descripción |
|--------|-----------|-------------|
| `X-Webhook-Secret` | Sí | Secret configurado en Wasender |

**Body (Wasender format):**
```json
{
    "event": "messages.upsert",
    "data": {
        "messages": {
            "key": {
                "id": "ABC123",
                "fromMe": false,
                "remoteJid": "56912345678@s.whatsapp.net"
            },
            "messageTimestamp": 1699999999,
            "pushName": "Juan Pérez",
            "message": {
                "conversation": "Necesito crear procedimiento para cambio de neumático"
            }
        }
    }
}
```

**Response:**
```json
{ "status": "ok" }
```

> **Nota:** El procesamiento real ocurre en background via `ctx.waitUntil()`.

---

### Obtener Procedimiento (JSON)

```http
GET /procedures/:id/json
```

**Parámetros:**
| Param | Descripción |
|-------|-------------|
| `id` | UUID del procedimiento |

**Response 200:**
```json
{
    "id": "abc-123-def",
    "title": "Cambio de Neumático CAEX",
    "content": { /* ProcedureContent */ },
    "created_at": "2025-02-06T10:00:00Z"
}
```

**Response 404:**
```json
{ "error": "Procedure not found" }
```

---

### Descargar PDF

```http
GET /procedures/:id/pdf
```

**Response:** Binary PDF file

**Headers de respuesta:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="procedimiento-{id}.pdf"
```

---

## Endpoints de Administración

> ⚠️ Requieren header `X-Admin-Secret` con el valor de `WASENDER_SECRET`

### Estado del Sistema

```http
GET /admin/status
```

**Response:**
```json
{
    "timestamp": "2025-02-06T10:00:00Z",
    "system": "Mining RAG v2",
    "health": "operational",
    "stats": {
        "total_requests": 150,
        "active_requests": 3,
        "total_procedures": 120,
        "total_documents": 25
    },
    "active_jobs": [
        {
            "id": "abc1234",
            "phone": "5691****",
            "state": "generating",
            "specialist": "Juan",
            "last_message": "Cambio de neumático...",
            "last_update": "2025-02-06T10:00:00Z"
        }
    ],
    "recent_procedures": [
        {
            "id": "def5678",
            "title": "Procedimiento Cambio Neumático",
            "created": "2025-02-06T09:30:00Z"
        }
    ]
}
```

---

### Listar Procedimientos

```http
GET /admin/procedures
```

**Response:**
```json
{
    "procedures": [
        {
            "id": "abc-123",
            "title": "Cambio de Neumático",
            "created_at": "2025-02-06T10:00:00Z",
            "pdf_url": "https://..."
        }
    ]
}
```

---

### Limpiar Sesiones Atascadas

```http
POST /admin/clear-stuck
```

Marca todas las solicitudes no completadas como `completed`.

**Response:**
```json
{
    "status": "ok",
    "message": "Stuck sessions cleared",
    "affected": 3
}
```

---

### Ingesta de Documentos

```http
POST /admin/ingest
```

**Headers:**
| Header | Requerido | Descripción |
|--------|-----------|-------------|
| `X-Admin-Secret` | Sí | Secret de administración |

**Body:**
```json
{
    "name": "Matriz Riesgos Mecánica 2024",
    "content": "Contenido completo del documento...",
    "type": "risk_critical"
}
```

**Tipos válidos:**
- `prototype` - Procedimientos modelo
- `risk_critical` - Matrices de riesgos críticos
- `risk_general` - Matrices de riesgos generales
- `regulation` - Normativas legales

**Response:**
```json
{ "status": "ok", "id": "uuid-generado" }
```

**Response (ya indexado):**
```json
{ "status": "skipped", "id": "uuid-existente" }
```

---

## Endpoints de Debug

> Solo para desarrollo

| Endpoint | Descripción |
|----------|-------------|
| `GET /debug-bindings` | Verifica bindings de Cloudflare |
| `GET /debug/pdf` | Genera PDF de prueba |
| `GET /debug/generate-test` | Genera procedimiento mock completo |
| `GET /debug/send-message?phone=X` | Envía mensaje de prueba |

---

## Códigos de Error

| Código | Significado |
|--------|-------------|
| 200 | Éxito |
| 400 | Datos faltantes o inválidos |
| 401 | No autorizado (secret inválido) |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |
