# Guía de Deployment - Mining RAG

Este documento cubre la configuración y despliegue del sistema.

---

## Prerrequisitos

- **Node.js** ≥ 18
- **Wrangler CLI** ≥ 3.0
- Cuenta **Cloudflare** con:
  - Workers (plan gratuito o pagado)
  - D1 Database
  - R2 Storage
  - Vectorize
  - Workers AI

---

## Configuración Inicial

### 1. Clonar e Instalar

```bash
git clone <repo>
cd mining-rag
npm install
```

### 2. Crear Recursos Cloudflare

```bash
# Base de datos D1
wrangler d1 create mining-rag-db

# Bucket R2
wrangler r2 bucket create mining-documents

# Índice Vectorize
wrangler vectorize create procedure-embeddings --dimensions=768 --metric=cosine
```

### 3. Configurar `wrangler.toml`

Actualiza los IDs generados:

```toml
name = "mining-rag"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "mining-rag-db"
database_id = "TU-DATABASE-ID"  # ← Actualizar

[[r2_buckets]]
binding = "DOCUMENTS"
bucket_name = "mining-documents"

[[vectorize]]
binding = "VECTORIZE"
index_name = "procedure-embeddings"

[ai]
binding = "AI"

[vars]
WASENDER_URL = "https://www.wasenderapi.com/api/send-message"
WORKER_URL = "https://mining-rag.TU-SUBDOMAIN.workers.dev"  # ← Actualizar
```

### 4. Aplicar Migraciones

```bash
# Local
wrangler d1 execute mining-rag-db --local --file=migrations/0001_initial.sql
wrangler d1 execute mining-rag-db --local --file=migrations/0002_add_metadata.sql

# Producción
wrangler d1 execute mining-rag-db --file=migrations/0001_initial.sql
wrangler d1 execute mining-rag-db --file=migrations/0002_add_metadata.sql
```

### 5. Configurar Secrets

```bash
wrangler secret put WASENDER_API_KEY
wrangler secret put WASENDER_SECRET
wrangler secret put OPENROUTER_API_KEY
```

---

## Variables de Entorno

### Secrets (via `wrangler secret`)

| Variable | Descripción |
|----------|-------------|
| `WASENDER_API_KEY` | API key de Wasender |
| `WASENDER_SECRET` | Secret para validar webhooks |
| `OPENROUTER_API_KEY` | API key de OpenRouter |

### Variables públicas (`wrangler.toml`)

| Variable | Descripción |
|----------|-------------|
| `WASENDER_URL` | URL del API de Wasender |
| `WORKER_URL` | URL pública del worker |

### Desarrollo Local (`.dev.vars`)

```env
WASENDER_API_KEY=wa_xxx
WASENDER_SECRET=mi_secret
OPENROUTER_API_KEY=sk-xxx
```

---

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo local con hot reload |
| `npm run deploy` | Deploy a producción |
| `npm run db:migrate` | Aplicar migraciones |
| `wrangler tail` | Logs en tiempo real |

---

## Configuración Wasender

1. Ve a tu panel de Wasender
2. Configura el webhook con:
   - **URL:** `https://mining-rag.TU-SUBDOMAIN.workers.dev/webhook`
   - **Secret:** El mismo valor de `WASENDER_SECRET`
   - **Eventos:** `messages.upsert`

---

## Verificación Post-Deploy

```bash
# Health check
curl https://mining-rag.TU-SUBDOMAIN.workers.dev/

# Verificar bindings
curl https://mining-rag.TU-SUBDOMAIN.workers.dev/debug-bindings

# Estado del sistema
curl https://mining-rag.TU-SUBDOMAIN.workers.dev/admin/status
```

---

## Estructura de Archivos

```
mining-rag/
├── src/
│   ├── index.ts          # Entry point
│   ├── types.ts          # Interfaces
│   ├── services/         # Lógica de negocio
│   └── db/               # Queries D1
├── migrations/           # SQL
├── scripts/              # CLI tools
├── documents/            # Docs para ingesta
├── wrangler.toml         # Config Cloudflare
├── .dev.vars             # Secrets locales (git ignored)
└── package.json
```
