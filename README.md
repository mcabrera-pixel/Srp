# SRP Suite — Safety & Risk Procedures

Plataforma de inteligencia artificial para la generacion automatica de **procedimientos de trabajo seguro** en la industria minera. Desarrollada por **MCCO Group**.

## Estado

- **Piloto activo:** Division Chuquicamata (Codelco)
- **Fase:** Entrenamiento de modelos y validacion con datos operacionales reales

## Estructura del Repositorio

```
Srp/
├── apps/
│   ├── landing/                 Landing page comercial (HTML/CSS/JS)
│   └── dashboard/               Dashboard web (placeholder)
│
├── agents/                      Agentes Python (categorizador, precios, email, decisor)
├── tests/                       Tests de agentes
│
├── srp-suite-main/              Monorepo principal del backend
│   ├── apps/
│   │   ├── api/                 Backend Express (RAG, LLM, DOCX, WhatsApp)
│   │   ├── web/                 Dashboard Next.js
│   │   ├── train/               Plataforma de capacitacion
│   │   ├── learn/               Generador de videos (Remotion)
│   │   └── landing/             Landing (v1)
│   ├── agents/                  nlm-agent + video-generator (Python)
│   ├── packages/                Shared configs (ESLint, TS, UI)
│   ├── data/                    Templates DOCX + seed data
│   ├── docs/                    Documentos mineros reales
│   └── scripts/                 Utilidades
│
├── docs/
│   ├── informe-cto-ceo-srp-suite.md         Informe tecnico del proyecto
│   ├── prompt-stitch-web.md                  Prompt Stitch v1 (panel interno)
│   └── prompt-stitch-2.0-web-comercial.md    Prompt Stitch v2 (web comercial)
│
└── README.md
```

## Tech Stack

| Componente | Tecnologia |
|------------|-----------|
| Backend | Express + TypeScript + Node.js 22 |
| Base de datos | SQLite (better-sqlite3) |
| Almacenamiento | MinIO (S3-compatible) + disco local |
| LLM | MiniMax M2.5, OpenRouter (Gemini/Claude/DeepSeek), OpenAI, Ollama |
| RAG | Embeddings multi-proveedor (Jina, Gemini, OpenAI, Ollama) |
| Documentos | docxtemplater + mammoth + pdf-parse |
| WhatsApp | Wasender API + Cloudflare Workers proxy |
| Frontend | Next.js + React + Turborepo |
| Agentes | Python (categorizador, precios, email, decisor) |
| Infra | Docker Compose + GitLab CI (SAST + Secret Detection) |

## Productos SRP

| Producto | Descripcion |
|----------|-------------|
| **SRP Docs** | Generacion de procedimientos via WhatsApp/Web |
| **SRP Learn** | Videos de capacitacion automatizados |
| **SRP Guard** | Validacion de cumplimiento regulatorio |
| **SRP Vault** | Gestion del ciclo de vida documental |
| **SRP Mobile** | Acceso offline para trabajadores en terreno |
| **SRP Vision** | Asistencia IA en tiempo real con camara en casco ([ver detalle](docs/srp-vision/)) |

## Documentacion

- [Informe CTO → CEO](docs/informe-cto-ceo-srp-suite.md) — Arquitectura, equipo y estado completo
- [Prompt Stitch v1](docs/prompt-stitch-web.md) — Especificacion del panel de administracion
- [Prompt Stitch v2](docs/prompt-stitch-2.0-web-comercial.md) — Especificacion de la web comercial minera
- [SRP Vision](docs/srp-vision/) — Asistencia IA en tiempo real para tecnicos en terreno (propuesta PUCV)

## Quick Start (Backend API)

```bash
cd srp-suite-main
cp .env.example .env    # Editar con API keys
npm install
npm run dev             # → http://localhost:3000
```

---

MCCO Group SpA — 2026
