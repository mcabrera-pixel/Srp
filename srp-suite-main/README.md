# SRP Suite

Sistema integral de generacion de procedimientos mineros con IA. Combina RAG (Retrieval-Augmented Generation), analisis de riesgos fatales y generacion automatica de documentos DOCX para la industria minera chilena.

## Estructura del Proyecto

```
srp-suite/
├── apps/
│   ├── api/          Backend Express (RAG, LLM, DOCX, WhatsApp)
│   ├── web/          Dashboard Next.js
│   ├── train/        Plataforma de capacitacion
│   ├── learn/        Generador de videos (Remotion)
│   └── landing/      Sitio publico
├── packages/
│   ├── ui/           Componentes React compartidos
│   ├── eslint-config/
│   └── typescript-config/
├── agents/
│   ├── nlm-agent/    Daemon NotebookLM (Python)
│   └── video-generator/  Videos Manim + TTS (Python)
├── data/
│   ├── storage/      Templates DOCX + archivos generados
│   └── seed/         Datos semilla (riesgos fatales, matriz POX)
├── docs/
│   ├── procedimientos/   73 documentos mineros reales
│   ├── architecture/     Documentacion tecnica
│   ├── strategy/         Documentos estrategicos
│   ├── presentations/    Material comercial
│   └── examples/         Procedimientos generados de ejemplo
└── scripts/              Utilidades de conversion
```

## Inicio Rapido

### Requisitos
- Node.js >= 22.5.0
- Python 3.11+ (para agentes)

### Instalacion

```bash
# Instalar dependencias del monorepo
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus API keys

# Sembrar base de datos con riesgos fatales
cd apps/api && node scripts/seed-risks.mjs

# Ingestar documentos al RAG
cd apps/api && node scripts/ingest-folder.mjs
```

### Desarrollo

```bash
# Todos los apps
npm run dev

# Solo el backend API
npm run dev:api

# App individual
npm run dev --workspace=apps/web
```

## Productos

| Producto | Descripcion |
|----------|-------------|
| **SRP Docs** | Generacion de procedimientos via WhatsApp/Web |
| **SRP Learn** | Videos de capacitacion automatizados |
| **SRP Guard** | Validacion de cumplimiento regulatorio |
| **SRP Vault** | Gestion del ciclo de vida documental |
| **SRP Mobile** | Acceso offline para trabajadores en terreno |

## Tech Stack

- **Backend**: Express, SQLite (better-sqlite3), TypeScript
- **Frontend**: Next.js, React, Turborepo
- **LLM**: MiniMax M2.5, OpenRouter (Gemini/Claude/DeepSeek), OpenAI, Ollama
- **RAG**: Embeddings multi-proveedor + vector store local (JSON)
- **Documentos**: docxtemplater, mammoth, pdf-parse
- **Video**: Remotion, Manim, TTS
- **WhatsApp**: Wasender API
