# SISTEMA SPR - FLUJO DE TRABAJO COMPLETO
## Generación Inteligente de Procedimientos Mineros con IA

> **Versión**: 2.0 | **Fecha**: 2026-02-16
> **Modelos Base**: MiniMax M2.5 (principal) | Claude Code Opus 4.6 (fallback)
> **Infraestructura**: Máquina Virtual dedicada
> **Audio/Visual**: NotebookLM MCP
> **Fine-Tuning**: Stack dedicado (LoRA + Unsloth)

---

## TABLA DE CONTENIDOS

1. [Visión General del Sistema](#1-visión-general-del-sistema)
2. [Arquitectura de Infraestructura (VM)](#2-arquitectura-de-infraestructura)
3. [Stack de Modelos IA](#3-stack-de-modelos-ia)
4. [Stack de Fine-Tuning](#4-stack-de-fine-tuning)
5. [Skills del LLM](#5-skills-del-llm)
6. [Fase 1: Entrada Multimodal (WhatsApp)](#6-fase-1-entrada-multimodal)
7. [Fase 2: Enriquecimiento de Contexto](#7-fase-2-enriquecimiento-de-contexto)
8. [Fase 3: Búsqueda RAG + Generación de Documentos](#8-fase-3-búsqueda-rag--generación-de-documentos)
9. [Fase 4: Generación Audiovisual (NotebookLM MCP)](#9-fase-4-generación-audiovisual)
10. [Fase 5: Entrega Formal + Validación](#10-fase-5-entrega-formal--validación)
11. [Fase 6: Capacitación + Auditoría](#11-fase-6-capacitación--auditoría)
12. [Ciclo de Aprendizaje (Fine-Tuning Continuo)](#12-ciclo-de-aprendizaje)
13. [Mapa Completo: Genera vs Aprende](#13-mapa-completo-genera-vs-aprende)
14. [Diagrama de Flujo Integral](#14-diagrama-de-flujo-integral)

---

## 1. VISIÓN GENERAL DEL SISTEMA

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║   ┌─────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────┐  ║
║   │ HUMANO  │───→│  COMPRENSIÓN │───→│  GENERACIÓN  │───→│ENTREGA│  ║
║   │(WhatsApp)│   │  + CONTEXTO  │    │  DOCS+VIDEO  │    │FORMAL │  ║
║   └─────────┘    └──────────────┘    └──────────────┘    └───────┘  ║
║        │                │                    │                │      ║
║        │                │                    │                │      ║
║        ▼                ▼                    ▼                ▼      ║
║   ┌─────────────────────────────────────────────────────────────┐   ║
║   │              CICLO DE APRENDIZAJE CONTINUO                  │   ║
║   │         (Fine-Tuning LoRA → el sistema MEJORA)              │   ║
║   └─────────────────────────────────────────────────────────────┘   ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

### Principio Fundamental

El sistema tiene **dos modos de operación** que ocurren en paralelo:

| Modo | Cuándo | Qué hace |
|------|--------|----------|
| **GENERA** | Cada solicitud del usuario | Produce documentos, videos, capacitación |
| **APRENDE** | Continuamente en background | Fine-tuning con feedback, correcciones, documentos aprobados |

---

## 2. ARQUITECTURA DE INFRAESTRUCTURA

### Máquina Virtual Dedicada

Todo el sistema corre en una **VM única** que centraliza procesamiento, almacenamiento y servicios.

```
╔══════════════════════════════════════════════════════════════════════╗
║                    MÁQUINA VIRTUAL (VM DEDICADA)                     ║
║                    Ubuntu Server 22.04 LTS / GPU                     ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ┌────────────────────────────────────────────────────────────────┐  ║
║  │                    CAPA DE SERVICIOS                            │  ║
║  │                                                                │  ║
║  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │  ║
║  │  │ API SPR  │  │ WhatsApp │  │NotebookLM│  │ Fine-Tuning  │  │  ║
║  │  │ (Hono.js)│  │ Webhook  │  │   MCP    │  │   Worker     │  │  ║
║  │  │ :3000    │  │ (Wasender)│ │  Server  │  │ (Background) │  │  ║
║  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │  ║
║  │       │              │             │                │          │  ║
║  └───────┼──────────────┼─────────────┼────────────────┼──────────┘  ║
║          │              │             │                │              ║
║  ┌───────┼──────────────┼─────────────┼────────────────┼──────────┐  ║
║  │       ▼              ▼             ▼                ▼          │  ║
║  │                 CAPA DE IA / MODELOS                            │  ║
║  │                                                                │  ║
║  │  ┌────────────────────────┐   ┌────────────────────────────┐  │  ║
║  │  │   MiniMax M2.5         │   │   Claude Code Opus 4.6     │  │  ║
║  │  │   ══════════════       │   │   ════════════════════     │  │  ║
║  │  │   Modelo PRINCIPAL     │   │   Modelo FALLBACK          │  │  ║
║  │  │                        │   │                            │  │  ║
║  │  │   - Generación docs    │   │   - Si M2.5 falla/timeout │  │  ║
║  │  │   - Análisis multimodal│   │   - Tareas complejas       │  │  ║
║  │  │   - Conversación       │   │   - Razonamiento avanzado  │  │  ║
║  │  │   - Extracción datos   │   │   - Validación de calidad  │  │  ║
║  │  │   + Fine-Tuned (LoRA)  │   │   + Skills especializados  │  │  ║
║  │  └────────────────────────┘   └────────────────────────────┘  │  ║
║  │                                                                │  ║
║  └────────────────────────────────────────────────────────────────┘  ║
║                                                                      ║
║  ┌────────────────────────────────────────────────────────────────┐  ║
║  │                    CAPA DE DATOS                                │  ║
║  │                                                                │  ║
║  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │  ║
║  │  │ SQLite   │  │ ChromaDB │  │  Disco    │  │  Redis       │  │  ║
║  │  │ (D1-like)│  │ (Vector) │  │  Local    │  │  (Cache/     │  │  ║
║  │  │ Metadata │  │ 768-dim  │  │  Storage  │  │   Sessions)  │  │  ║
║  │  │ + Hist.  │  │ Embeds   │  │  DOCX/PDF │  │              │  │  ║
║  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘  │  ║
║  │                                                                │  ║
║  └────────────────────────────────────────────────────────────────┘  ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

### Stack de la VM

| Componente | Tecnología | Función |
|------------|-----------|---------|
| **OS** | Ubuntu 22.04 LTS | Sistema operativo servidor |
| **GPU** | NVIDIA A100/H100 o RTX 4090 | Fine-tuning + inferencia local |
| **Runtime** | Node.js 20 LTS + Python 3.11 | API + Fine-tuning |
| **API** | Hono.js 4.0 (Node) | HTTP server, webhooks, rutas |
| **DB Relacional** | SQLite (via better-sqlite3) | Metadata, historial, sesiones |
| **DB Vectorial** | ChromaDB | Embeddings + búsqueda semántica |
| **Cache** | Redis 7 | Sesiones WhatsApp, cola de trabajos |
| **Storage** | Disco local + MinIO (S3-compatible) | DOCX, PDF, videos, audios |
| **Queue** | BullMQ (sobre Redis) | Cola de generación docs/videos |
| **Containers** | Docker Compose | Orquestación de servicios |
| **Reverse Proxy** | Nginx / Caddy | HTTPS, routing, certificados |
| **Monitor** | Prometheus + Grafana | Métricas, alertas, health checks |

---

## 3. STACK DE MODELOS IA

### Jerarquía de Modelos

```
┌─────────────────────────────────────────────────────────────┐
│                   SELECCIÓN DE MODELO                        │
│                                                             │
│   Solicitud                                                 │
│      │                                                      │
│      ▼                                                      │
│   ┌──────────────────┐                                      │
│   │  MiniMax M2.5    │◄── Intento principal                 │
│   │  (Fine-Tuned)    │                                      │
│   └────────┬─────────┘                                      │
│            │                                                │
│            ├── ✅ Respuesta OK ──→ Continuar flujo          │
│            │                                                │
│            └── ❌ Error/Timeout/Baja calidad                │
│                      │                                      │
│                      ▼                                      │
│            ┌──────────────────┐                              │
│            │ Claude Opus 4.6  │◄── Fallback automático      │
│            │ (via API/Skills) │                              │
│            └────────┬─────────┘                              │
│                     │                                       │
│                     ├── ✅ Respuesta OK ──→ Continuar       │
│                     │                                       │
│                     └── ❌ Error ──→ Notificar admin        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Distribución de Tareas por Modelo

| Tarea | MiniMax M2.5 | Claude Opus 4.6 | Razón |
|-------|:---:|:---:|-------|
| Transcripción audio | ✅ | Fallback | M2.5 soporta audio nativo |
| Análisis de imágenes | ✅ | Fallback | Multimodal nativo |
| Lectura de PDFs | ✅ | Fallback | Extracción de texto |
| Análisis de links/web | ✅ | Fallback | Scraping + resumen |
| Generación de procedimientos | ✅ (Fine-Tuned) | Fallback | Estilo Codelco aprendido |
| Razonamiento complejo | Fallback | ✅ | Opus superior en lógica |
| Validación de calidad | Fallback | ✅ | Revisión crítica |
| Conversación natural | ✅ | Fallback | Más rápido, más barato |
| Skills especializados | ✅ | ✅ | Ambos con skills |

---

## 4. STACK DE FINE-TUNING

### Objetivo
Entrenar MiniMax M2.5 para que "hable Codelco": terminología minera, formato de procedimientos DS 132, estilo formal chileno, y estructura SIGO/RESSO.

### Stack Tecnológico de Fine-Tuning

```
╔══════════════════════════════════════════════════════════════════════╗
║                   PIPELINE DE FINE-TUNING                            ║
║                   (Corre en la misma VM - GPU)                       ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ┌────────────────────────────────────────────────────────────────┐  ║
║  │  1. RECOLECCIÓN DE DATOS                                       │  ║
║  │     ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │  ║
║  │     │Procedim. │  │Correccio-│  │Normativa │  │Feedback   │  │  ║
║  │     │Aprobados │  │nes de    │  │DS132/594 │  │Validadores│  │  ║
║  │     │(Gold Std)│  │Expertos  │  │ECF/RESSO │  │(SIGO)     │  │  ║
║  │     └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬─────┘  │  ║
║  │           └──────┬──────┴──────┬───────┘             │        │  ║
║  │                  ▼             ▼                      ▼        │  ║
║  └──────────────────┼─────────────┼──────────────────────┼────────┘  ║
║                     │             │                      │           ║
║  ┌──────────────────▼─────────────▼──────────────────────▼────────┐  ║
║  │  2. PREPARACIÓN DE DATASET                                     │  ║
║  │                                                                │  ║
║  │  Herramientas:                                                 │  ║
║  │  ┌──────────────────────────────────────────────────────────┐  │  ║
║  │  │  Python 3.11 + Pandas + datasets (HuggingFace)           │  │  ║
║  │  └──────────────────────────────────────────────────────────┘  │  ║
║  │                                                                │  ║
║  │  Formato de entrenamiento (Chat Template):                     │  ║
║  │  ┌──────────────────────────────────────────────────────────┐  │  ║
║  │  │  {                                                       │  │  ║
║  │  │    "messages": [                                         │  │  ║
║  │  │      {"role": "system", "content": "Eres experto en     │  │  ║
║  │  │       procedimientos mineros de Codelco..."},            │  │  ║
║  │  │      {"role": "user", "content": "Genera procedimiento  │  │  ║
║  │  │       para cambio de polines en correa transportadora"}, │  │  ║
║  │  │      {"role": "assistant", "content": "## PROCEDIMIENTO  │  │  ║
║  │  │       TÉCNICO\n### 1. OBJETIVO\nEstablecer..."}          │  │  ║
║  │  │    ]                                                     │  │  ║
║  │  │  }                                                       │  │  ║
║  │  └──────────────────────────────────────────────────────────┘  │  ║
║  │                                                                │  ║
║  │  Datasets:                                                     │  ║
║  │  ├─ train.jsonl  (~500-2000 ejemplos)                          │  ║
║  │  ├─ eval.jsonl   (~100 ejemplos validación)                    │  ║
║  │  └─ test.jsonl   (~50 ejemplos test final)                     │  ║
║  │                                                                │  ║
║  └────────────────────────────────────────────────────────────────┘  ║
║                                                                      ║
║  ┌────────────────────────────────────────────────────────────────┐  ║
║  │  3. ENTRENAMIENTO (Fine-Tuning LoRA)                           │  ║
║  │                                                                │  ║
║  │  Stack:                                                        │  ║
║  │  ┌──────────────────────────────────────────────────────────┐  │  ║
║  │  │  Unsloth        → Acelerador 2-5x para LoRA             │  │  ║
║  │  │  PEFT (LoRA)    → Adapters livianos (no full retrain)   │  │  ║
║  │  │  Transformers   → HuggingFace base framework            │  │  ║
║  │  │  bitsandbytes   → Cuantización 4-bit (ahorra VRAM)      │  │  ║
║  │  │  TRL (SFTTrainer) → Supervised Fine-Tuning trainer      │  │  ║
║  │  │  Weights & Biases → Tracking de experimentos            │  │  ║
║  │  └──────────────────────────────────────────────────────────┘  │  ║
║  │                                                                │  ║
║  │  Configuración LoRA:                                           │  ║
║  │  ┌──────────────────────────────────────────────────────────┐  │  ║
║  │  │  r = 64              (rango de adaptación)               │  │  ║
║  │  │  lora_alpha = 128    (factor de escala)                  │  │  ║
║  │  │  lora_dropout = 0.05 (regularización)                    │  │  ║
║  │  │  target_modules = ["q_proj","v_proj","k_proj","o_proj"]  │  │  ║
║  │  │  quantization = 4bit (QLoRA para ahorrar VRAM)           │  │  ║
║  │  │  batch_size = 4      (micro-batch)                       │  │  ║
║  │  │  gradient_accumulation = 8                               │  │  ║
║  │  │  epochs = 3-5        (según convergencia)                │  │  ║
║  │  │  learning_rate = 2e-4                                    │  │  ║
║  │  └──────────────────────────────────────────────────────────┘  │  ║
║  │                                                                │  ║
║  │  Tiempo estimado: ~2-4 horas (500 ejemplos, RTX 4090)         │  ║
║  │  VRAM requerida: ~24GB (4-bit) o ~48GB (8-bit)                │  ║
║  │                                                                │  ║
║  └────────────────────────────────────────────────────────────────┘  ║
║                                                                      ║
║  ┌────────────────────────────────────────────────────────────────┐  ║
║  │  4. EVALUACIÓN + DEPLOY                                        │  ║
║  │                                                                │  ║
║  │  Métricas:                                                     │  ║
║  │  ├─ ROUGE-L score (similitud con procedimientos gold)          │  ║
║  │  ├─ Compliance check (¿cita DS 132 correctamente?)             │  ║
║  │  ├─ Estructura check (¿tiene todas las secciones?)             │  ║
║  │  └─ Evaluación humana (validador SIGO puntúa 1-5)             │  ║
║  │                                                                │  ║
║  │  Deploy:                                                       │  ║
║  │  ├─ Merge LoRA adapter → modelo base                           │  ║
║  │  ├─ Cuantizar a GGUF (llama.cpp) o GPTQ                       │  ║
║  │  ├─ Servir con vLLM o Ollama                                   │  ║
║  │  └─ Hot-swap: reemplazar modelo en producción sin downtime     │  ║
║  │                                                                │  ║
║  └────────────────────────────────────────────────────────────────┘  ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

### Ciclo de Fine-Tuning (Cuándo APRENDE el sistema)

```
┌──────────────────────────────────────────────────────────┐
│              TRIGGERS DE RE-ENTRENAMIENTO                 │
│                                                          │
│  ┌─────────────────┐                                     │
│  │ Cada 50 nuevos  │──→ Auto-trigger entrenamiento       │
│  │ docs aprobados  │    (batch incremental)               │
│  └─────────────────┘                                     │
│                                                          │
│  ┌─────────────────┐                                     │
│  │ Corrección de   │──→ Par (incorrecto, correcto) se    │
│  │ un validador    │    agrega al dataset + retrain      │
│  └─────────────────┘                                     │
│                                                          │
│  ┌─────────────────┐                                     │
│  │ Cambio en DS132 │──→ Nuevos ejemplos con normativa    │
│  │ o ECF actualizd │    actualizada + retrain urgente    │
│  └─────────────────┘                                     │
│                                                          │
│  ┌─────────────────┐                                     │
│  │ Programado      │──→ Re-entrenamiento semanal/mensual │
│  │ (cron job)      │    con todo el dataset acumulado    │
│  └─────────────────┘                                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 5. SKILLS DEL LLM

Los Skills son **capacidades especializadas** que el LLM activa según el contexto. Funcionan como "modos expertos" que modifican el comportamiento del modelo.

### Catálogo de Skills

```
╔══════════════════════════════════════════════════════════════════════╗
║                     SKILLS DEL SISTEMA SPR                           ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ┌─ SKILLS DE COMPRENSIÓN (Input) ─────────────────────────────┐    ║
║  │                                                              │    ║
║  │  /transcribir-audio                                          │    ║
║  │  Convierte audio WhatsApp a texto con contexto minero.       │    ║
║  │  Reconoce jerga: "tranque", "polines", "CAEX", "ECF".       │    ║
║  │                                                              │    ║
║  │  /analizar-imagen                                            │    ║
║  │  Identifica equipos, EPP, zonas, riesgos visibles            │    ║
║  │  en fotos de terreno. Extrae texto de señalética.            │    ║
║  │                                                              │    ║
║  │  /extraer-pdf                                                │    ║
║  │  Lee PDFs de normativa, manuales, procedimientos previos.    │    ║
║  │  Estructura contenido en secciones procesables.              │    ║
║  │                                                              │    ║
║  │  /scrape-web                                                 │    ║
║  │  Extrae contenido de URLs y páginas web. Útil para           │    ║
║  │  fichas técnicas de fabricantes, normativa online.            │    ║
║  │                                                              │    ║
║  │  /enriquecer-contexto                                        │    ║
║  │  Cuando la información es vaga, genera preguntas             │    ║
║  │  inteligentes y usa NotebookLM para investigar más.          │    ║
║  │                                                              │    ║
║  └──────────────────────────────────────────────────────────────┘    ║
║                                                                      ║
║  ┌─ SKILLS DE GENERACIÓN (Output) ─────────────────────────────┐    ║
║  │                                                              │    ║
║  │  /generar-procedimiento                                      │    ║
║  │  Produce DOCX completo con todas las secciones normadas.     │    ║
║  │  Incluye citas, riesgos fatales, controles CCP.              │    ║
║  │                                                              │    ║
║  │  /generar-art                                                │    ║
║  │  Crea Análisis de Riesgo del Trabajo auto-llenado            │    ║
║  │  específico para la tarea descrita.                          │    ║
║  │                                                              │    ║
║  │  /generar-video                                              │    ║
║  │  Orquesta NotebookLM MCP para crear contenido audiovisual   │    ║
║  │  de capacitación con narración y quiz integrado.             │    ║
║  │                                                              │    ║
║  │  /generar-checklist                                          │    ║
║  │  Produce lista de verificación pre-tarea con EPP,            │    ║
║  │  permisos, bloqueos requeridos.                              │    ║
║  │                                                              │    ║
║  └──────────────────────────────────────────────────────────────┘    ║
║                                                                      ║
║  ┌─ SKILLS DE VALIDACIÓN (Calidad) ────────────────────────────┐    ║
║  │                                                              │    ║
║  │  /validar-normativa                                          │    ║
║  │  Verifica que el documento cite correctamente DS 132,        │    ║
║  │  DS 594, ECFs aplicables. Detecta omisiones.                 │    ║
║  │                                                              │    ║
║  │  /validar-riesgos                                            │    ║
║  │  Cruza la tarea contra RF01-RF29 y verifica que              │    ║
║  │  todos los controles críticos estén presentes.               │    ║
║  │                                                              │    ║
║  │  /clasificar-riesgo                                          │    ║
║  │  Calcula Magnitud de Riesgo (MR) = Prob × Consecuencia      │    ║
║  │  con factores Fj (jornada) y Fa (altitud).                   │    ║
║  │                                                              │    ║
║  └──────────────────────────────────────────────────────────────┘    ║
║                                                                      ║
║  ┌─ SKILLS DE APRENDIZAJE (Fine-Tuning) ───────────────────────┐    ║
║  │                                                              │    ║
║  │  /registrar-corrección                                       │    ║
║  │  Cuando un validador corrige un documento, el skill          │    ║
║  │  captura el par (original, corregido) para el dataset.       │    ║
║  │                                                              │    ║
║  │  /evaluar-calidad                                            │    ║
║  │  Compara output generado vs gold standard. Reporta           │    ║
║  │  métricas de calidad para decidir si reentrenar.             │    ║
║  │                                                              │    ║
║  └──────────────────────────────────────────────────────────────┘    ║
║                                                                      ║
║  ┌─ SKILLS DE INVESTIGACIÓN (NotebookLM) ──────────────────────┐    ║
║  │                                                              │    ║
║  │  /nlm-investigar                                             │    ║
║  │  Crea notebook en NotebookLM con fuentes del tema,           │    ║
║  │  genera resumen ejecutivo y preguntas de profundización.     │    ║
║  │                                                              │    ║
║  │  /nlm-podcast                                                │    ║
║  │  Genera audio overview (podcast) del procedimiento           │    ║
║  │  para capacitación auditiva en terreno.                      │    ║
║  │                                                              │    ║
║  │  /nlm-quiz                                                   │    ║
║  │  Genera cuestionario de comprensión basado en el             │    ║
║  │  procedimiento para certificación de trabajadores.           │    ║
║  │                                                              │    ║
║  └──────────────────────────────────────────────────────────────┘    ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

### Cuándo se activa cada Skill en el flujo

```
ENTRADA           COMPRENSIÓN        GENERACIÓN         VALIDACIÓN
────────          ──────────         ──────────         ──────────
Audio ──→ /transcribir-audio ──┐
Imagen ─→ /analizar-imagen ────┤
PDF ────→ /extraer-pdf ────────┼──→ /enriquecer ──→ /generar-proc ──→ /validar-normativa
Link ───→ /scrape-web ─────────┤     -contexto       /generar-art      /validar-riesgos
Texto ──→ (directo) ───────────┘                      /generar-video    /clasificar-riesgo
                                                      /generar-checklist
```

---

## 6. FASE 1: ENTRADA MULTIMODAL (WhatsApp)

### El sistema acepta 6 tipos de input desde WhatsApp

```
╔══════════════════════════════════════════════════════════════════════╗
║           FASE 1: ENTRADA MULTIMODAL (WhatsApp → VM)                 ║
║           ══════════════════════════════════════════                  ║
║           🔵 MODO: GENERA                                            ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  SUPERVISOR EN TERRENO envía por WhatsApp:                           ║
║                                                                      ║
║  ┌──────────┐ ┌──────────┐ ┌──────────┐                            ║
║  │  AUDIO   │ │  IMAGEN  │ │  TEXTO   │                            ║
║  │  (.ogg)  │ │ (.jpg/png│ │  "Necesito│                           ║
║  │  "Neces- │ │  foto del│ │  proc..."│                            ║
║  │  ito..." │ │  equipo) │ │          │                            ║
║  └────┬─────┘ └────┬─────┘ └────┬─────┘                            ║
║       │             │            │                                   ║
║  ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐                            ║
║  │   PDF    │ │   LINK   │ │ PÁGINA   │                            ║
║  │(.pdf adj)│ │(URL ficha│ │  WEB     │                            ║
║  │ manual   │ │ técnica) │ │(captura) │                            ║
║  │ equipo   │ │          │ │          │                            ║
║  └────┬─────┘ └────┬─────┘ └────┬─────┘                            ║
║       │             │            │                                   ║
║       └──────┬──────┴────────────┘                                   ║
║              ▼                                                       ║
║  ┌─────────────────────────────────────────────────────────────┐    ║
║  │                  WASENDER WEBHOOK                            │    ║
║  │                  POST /webhook                               │    ║
║  │                                                             │    ║
║  │  Recibe:                                                    │    ║
║  │  {                                                          │    ║
║  │    phone: "56912345678",                                    │    ║
║  │    type: "audio" | "image" | "text" | "document" | "link", │    ║
║  │    content: "texto o URL del archivo",                      │    ║
║  │    mediaUrl: "https://wasender.../media/...",               │    ║
║  │    mimeType: "audio/ogg" | "image/jpeg" | "application/pdf"│    ║
║  │  }                                                          │    ║
║  └──────────────────────┬──────────────────────────────────────┘    ║
║                         ▼                                            ║
║  ┌─────────────────────────────────────────────────────────────┐    ║
║  │              ROUTER DE PROCESAMIENTO                         │    ║
║  │                                                             │    ║
║  │  switch (type) {                                            │    ║
║  │                                                             │    ║
║  │    case "audio":                                            │    ║
║  │      → Skill: /transcribir-audio                            │    ║
║  │      → MiniMax M2.5 (Whisper-compatible)                    │    ║
║  │      → Output: texto transcrito en español                  │    ║
║  │                                                             │    ║
║  │    case "image":                                            │    ║
║  │      → Skill: /analizar-imagen                              │    ║
║  │      → MiniMax M2.5 (vision multimodal)                     │    ║
║  │      → Output: descripción del equipo/zona/riesgo           │    ║
║  │      → Extrae: modelo equipo, señalética, estado visual     │    ║
║  │                                                             │    ║
║  │    case "text":                                             │    ║
║  │      → Directo al pipeline de procesamiento                 │    ║
║  │      → MiniMax M2.5 analiza intención                       │    ║
║  │                                                             │    ║
║  │    case "document" (PDF):                                   │    ║
║  │      → Skill: /extraer-pdf                                  │    ║
║  │      → Extrae texto + tablas + diagramas                    │    ║
║  │      → Identifica: manual fabricante, normativa, proc prev  │    ║
║  │                                                             │    ║
║  │    case "link" (URL):                                       │    ║
║  │      → Skill: /scrape-web                                   │    ║
║  │      → Fetch + parse HTML/PDF remoto                        │    ║
║  │      → Extrae: ficha técnica, especificaciones              │    ║
║  │                                                             │    ║
║  │    case "webpage" (captura):                                │    ║
║  │      → Skill: /scrape-web + /analizar-imagen                │    ║
║  │      → OCR si es screenshot, scrape si es URL               │    ║
║  │  }                                                          │    ║
║  │                                                             │    ║
║  │  RESULTADO UNIFICADO:                                       │    ║
║  │  {                                                          │    ║
║  │    texto_unificado: "Todo el contexto extraído...",         │    ║
║  │    archivos_adjuntos: [urls...],                            │    ║
║  │    tipo_solicitud: "procedimiento" | "consulta" | "art",   │    ║
║  │    confianza: 0.85,                                         │    ║
║  │    datos_detectados: {                                      │    ║
║  │      equipo: "Compresor C-701",                             │    ║
║  │      zona: "POX",                                           │    ║
║  │      tarea: "Mantención preventiva",                        │    ║
║  │      epp_mencionado: ["casco", "lentes"]                    │    ║
║  │    }                                                        │    ║
║  │  }                                                          │    ║
║  └─────────────────────────────────────────────────────────────┘    ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 7. FASE 2: ENRIQUECIMIENTO DE CONTEXTO

### Cuando la información es insuficiente o vaga

```
╔══════════════════════════════════════════════════════════════════════╗
║        FASE 2: ENRIQUECIMIENTO DE CONTEXTO                          ║
║        ════════════════════════════════════                          ║
║        🔵 MODO: GENERA + 🟢 MODO: APRENDE (registra patrones)       ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  Texto unificado del Fase 1                                          ║
║       │                                                              ║
║       ▼                                                              ║
║  ┌─────────────────────────────────────────────────────────────┐    ║
║  │  ANÁLISIS DE COMPLETITUD                                     │    ║
║  │  Skill: /enriquecer-contexto                                 │    ║
║  │                                                             │    ║
║  │  MiniMax M2.5 evalúa:                                       │    ║
║  │  ┌────────────────────────────────────────────────────────┐ │    ║
║  │  │  Campo                │ Estado    │ Fuente             │ │    ║
║  │  │  ─────────────────────┼───────────┼──────────────────  │ │    ║
║  │  │  Descripción tarea    │ ✅ Tiene  │ Audio del usuario  │ │    ║
║  │  │  Zona operacional     │ ❌ Falta  │ Preguntar          │ │    ║
║  │  │  Equipo específico    │ ⚠️ Vago   │ Investigar + Preg. │ │    ║
║  │  │  EPP requerido        │ ❌ Falta  │ Auto (RAG + NLM)   │ │    ║
║  │  │  Normativa aplicable  │ ❌ Falta  │ Auto (RAG)         │ │    ║
║  │  │  Bloqueo de energías  │ ❌ Falta  │ Auto (RAG + NLM)   │ │    ║
║  │  │  Personal requerido   │ ❌ Falta  │ Preguntar          │ │    ║
║  │  └────────────────────────────────────────────────────────┘ │    ║
║  │                                                             │    ║
║  │  Completitud: 25% ──→ NECESITA ENRIQUECIMIENTO              │    ║
║  └──────────────────────┬──────────────────────────────────────┘    ║
║                         │                                            ║
║         ┌───────────────┼───────────────┐                            ║
║         ▼               ▼               ▼                            ║
║  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────────┐   ║
║  │  RUTA A     │ │  RUTA B     │ │  RUTA C                     │   ║
║  │  PREGUNTAR  │ │  INVESTIGAR │ │  INVESTIGAR CON             │   ║
║  │  AL USUARIO │ │  CON LLM    │ │  NOTEBOOKLM MCP             │   ║
║  │             │ │             │ │                             │   ║
║  │ Para datos  │ │ Para datos  │ │ Para contexto              │   ║
║  │ que SOLO el │ │ que el LLM  │ │ profundo que requiere      │   ║
║  │ usuario     │ │ puede inferir│ │ múltiples fuentes          │   ║
║  │ conoce:     │ │ del contexto:│ │ cruzadas:                  │   ║
║  │             │ │             │ │                             │   ║
║  │ - Zona      │ │ - EPP std   │ │ Skill: /nlm-investigar     │   ║
║  │ - Personal  │ │ - Normativa │ │                             │   ║
║  │ - Turno     │ │ - Riesgos   │ │ 1. Crea Notebook con:      │   ║
║  │ - Equipo    │ │   típicos   │ │    - Transcripción usuario  │   ║
║  │   exacto    │ │ - Definic.  │ │    - PDFs adjuntos          │   ║
║  │             │ │   técnicas  │ │    - URLs compartidas       │   ║
║  │             │ │             │ │    - Docs RAG relevantes    │   ║
║  │             │ │             │ │                             │   ║
║  │ WhatsApp:   │ │ MiniMax:    │ │ 2. Genera:                  │   ║
║  │ "¿En qué    │ │ "Según el   │ │    - Resumen ejecutivo      │   ║
║  │  zona se    │ │  equipo, el │ │    - Contexto enriquecido   │   ║
║  │  realizará  │ │  EPP mínimo │ │    - Preguntas clave        │   ║
║  │  el trabajo │ │  incluye:   │ │    - Riesgos identificados  │   ║
║  │  ?"         │ │  ..."       │ │    - Normativa cruzada      │   ║
║  └──────┬──────┘ └──────┬──────┘ └──────────────┬──────────────┘   ║
║         │               │                        │                   ║
║         └───────────────┴────────────────────────┘                   ║
║                         │                                            ║
║                         ▼                                            ║
║  ┌─────────────────────────────────────────────────────────────┐    ║
║  │  LOOP DE COMPLETITUD                                         │    ║
║  │                                                             │    ║
║  │  while (completitud < 100%) {                               │    ║
║  │    if (falta_dato_usuario) → preguntar por WhatsApp         │    ║
║  │    if (falta_dato_inferible) → LLM genera                   │    ║
║  │    if (contexto_vago) → NotebookLM investiga                │    ║
║  │    actualizar_plan(completitud++)                            │    ║
║  │  }                                                          │    ║
║  │                                                             │    ║
║  │  25% ──→ 50% ──→ 75% ──→ 100% ✅                           │    ║
║  │                                                             │    ║
║  │  🟢 APRENDE: Cada interacción de enriquecimiento se         │    ║
║  │     registra como patrón. Si el mismo tipo de tarea         │    ║
║  │     siempre requiere las mismas preguntas, el sistema       │    ║
║  │     las pregunta proactivamente la próxima vez.             │    ║
║  │                                                             │    ║
║  └──────────────────────┬──────────────────────────────────────┘    ║
║                         │                                            ║
║                         ▼                                            ║
║              CONFIRMACIÓN DEL USUARIO                                ║
║              "Dale, generar" ✅                                      ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

### Ejemplo concreto de enriquecimiento con NotebookLM

```
USUARIO: "Necesito procedimiento para el compresor"  (MUY VAGO)

SISTEMA (Skill: /enriquecer-contexto):
  │
  ├─ Detecta: "compresor" → múltiples compresores en Codelco
  │
  ├─ RUTA A (Preguntar):
  │   → "¿Qué compresor específico? Ej: C-701 (oxígeno), C-400 (aire)?"
  │   → "¿En qué división? Chuquicamata, Radomiro Tomic, El Teniente?"
  │
  ├─ RUTA C (NotebookLM investiga mientras espera respuesta):
  │   → Crea notebook con fuentes:
  │     - "Listado equipos compresores Codelco" (RAG)
  │     - "ECF 1 - Bloqueo y Aislación" (RAG)
  │     - "Manual compresor C-701" (si existe en storage)
  │   → NotebookLM genera:
  │     "Compresores en Codelco incluyen C-701 (oxígeno, alto riesgo
  │      de ignición), C-400 (aire comprimido), C-220 (nitrógeno).
  │      Los de oxígeno requieren EPP libre de grasas según Art. 52..."
  │
  └─ RESULTADO: Cuando el usuario responde "C-701, en Chuqui",
     el sistema YA tiene contexto profundo pre-cargado
     → Completitud salta de 25% a 80% instantáneamente
```

---

## 8. FASE 3: BÚSQUEDA RAG + GENERACIÓN DE DOCUMENTOS

```
╔══════════════════════════════════════════════════════════════════════╗
║     FASE 3: RAG + GENERACIÓN DE DOCUMENTOS                          ║
║     ═══════════════════════════════════════                          ║
║     🔵 MODO: GENERA                                                 ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  Datos completos (100%) del Fase 2                                   ║
║       │                                                              ║
║       ▼                                                              ║
║  ┌─────────────────────────────────────────────────────────────┐    ║
║  │  PASO 1: BÚSQUEDA SEMÁNTICA (RAG)                           │    ║
║  │                                                             │    ║
║  │  Texto de la tarea ──→ Embedding (BGE-Base 768-dim)         │    ║
║  │       │                                                     │    ║
║  │       ▼                                                     │    ║
║  │  ChromaDB (Vector Search, coseno, topK=10)                  │    ║
║  │       │                                                     │    ║
║  │       ├──→ Documentos Gold:                                 │    ║
║  │       │     ├─ DS 132 Art. 26-68 (bloqueo)                  │    ║
║  │       │     ├─ DS 594 (condiciones ambientales)              │    ║
║  │       │     ├─ ECF 1 (aislación), ECF 9 (partes móviles)    │    ║
║  │       │     └─ Manual fabricante compresor C-701             │    ║
║  │       │                                                     │    ║
║  │       ├──→ Matrices de Riesgo:                               │    ║
║  │       │     ├─ RF01-RF29 (riesgos fatales)                   │    ║
║  │       │     └─ Controles CCP1-CCPn por cada RF               │    ║
║  │       │                                                     │    ║
║  │       └──→ Procedimientos Aprobados Previos:                 │    ║
║  │             └─ Similares ya validados (referencia estilo)    │    ║
║  │                                                             │    ║
║  └──────────────────────┬──────────────────────────────────────┘    ║
║                         ▼                                            ║
║  ┌─────────────────────────────────────────────────────────────┐    ║
║  │  PASO 2: GENERACIÓN CON LLM (Fine-Tuned)                    │    ║
║  │  Skill: /generar-procedimiento                               │    ║
║  │                                                             │    ║
║  │  ┌───────────────────────────────────────────────────────┐  │    ║
║  │  │  PROMPT ESTRUCTURADO                                  │  │    ║
║  │  │                                                       │  │    ║
║  │  │  SYSTEM: "Eres experto en procedimientos mineros      │  │    ║
║  │  │   de Codelco. Genera según DS 132 y estándares SIGO.  │  │    ║
║  │  │   Cita SIEMPRE artículos específicos."                │  │    ║
║  │  │                                                       │  │    ║
║  │  │  CONTEXTO RAG: [chunks de ChromaDB]                   │  │    ║
║  │  │  DATOS USUARIO: [zona, equipo, tarea, personal]       │  │    ║
║  │  │  PASOS EXTRAÍDOS: [TaskStep[]]                        │  │    ║
║  │  │  CONTEXTO NOTEBOOKLM: [investigación enriquecida]     │  │    ║
║  │  │                                                       │  │    ║
║  │  │  OUTPUT REQUERIDO: ProcedureSections JSON              │  │    ║
║  │  └───────────────────────────────────────────────────────┘  │    ║
║  │                                                             │    ║
║  │  MiniMax M2.5 (Fine-Tuned con LoRA) genera:                 │    ║
║  │       │                                                     │    ║
║  │       ▼                                                     │    ║
║  │  {                                                          │    ║
║  │    objetivo: "Establecer el procedimiento seguro para...",  │    ║
║  │    alcance: "Aplica a Casa de Compresores, División...",    │    ║
║  │    responsabilidades: "Supervisor: verificar...",           │    ║
║  │    definiciones: "LOTO: Lock Out Tag Out...",               │    ║
║  │    epp_equipos: "Casco, lentes, traje anti-ignición...",   │    ║
║  │    descripcion_tarea: "Paso 1: Verificar permisos...",     │    ║
║  │    bloqueo_energias: "Según ECF 1, aislar energía...",     │    ║
║  │    riesgos_criticos: [                                     │    ║
║  │      {codigo:"RF01", nombre:"ENERGÍA ELÉCTRICA",           │    ║
║  │       controles:"CCP1: Verificar ausencia tensión..."}     │    ║
║  │    ],                                                      │    ║
║  │    referencias: "[1] DS 132 Art. 52 [2] ECF 1 Punto 4.1"  │    ║
║  │  }                                                          │    ║
║  │                                                             │    ║
║  │  Si MiniMax falla → Fallback a Claude Opus 4.6              │    ║
║  │                                                             │    ║
║  └──────────────────────┬──────────────────────────────────────┘    ║
║                         ▼                                            ║
║  ┌─────────────────────────────────────────────────────────────┐    ║
║  │  PASO 3: VALIDACIÓN AUTOMÁTICA                               │    ║
║  │  Skills: /validar-normativa + /validar-riesgos               │    ║
║  │                                                             │    ║
║  │  Claude Opus 4.6 (como revisor de calidad):                  │    ║
║  │                                                             │    ║
║  │  CHECK 1: ¿Cita DS 132 correctamente?          ✅ / ❌     │    ║
║  │  CHECK 2: ¿Todos los RF aplicables incluidos?   ✅ / ❌     │    ║
║  │  CHECK 3: ¿EPP completo para la tarea?          ✅ / ❌     │    ║
║  │  CHECK 4: ¿Bloqueo de energías presente?        ✅ / ❌     │    ║
║  │  CHECK 5: ¿Estructura SIGO completa?            ✅ / ❌     │    ║
║  │                                                             │    ║
║  │  Si algún CHECK falla:                                      │    ║
║  │    → Re-generar sección específica                          │    ║
║  │    → Hasta 3 intentos, luego flag para revisión humana      │    ║
║  │                                                             │    ║
║  └──────────────────────┬──────────────────────────────────────┘    ║
║                         ▼                                            ║
║  ┌─────────────────────────────────────────────────────────────┐    ║
║  │  PASO 4: RENDERIZADO DOCX                                    │    ║
║  │                                                             │    ║
║  │  Template (prototype-template-v1.docx)                      │    ║
║  │       +                                                     │    ║
║  │  ProcedureSections JSON                                     │    ║
║  │       │                                                     │    ║
║  │       ▼                                                     │    ║
║  │  docxtemplater + PizZip                                     │    ║
║  │       │                                                     │    ║
║  │       ├─ Variables simples: {objetivo}, {alcance}           │    ║
║  │       ├─ Loops: {{#riesgos_criticos}}...{{/}}               │    ║
║  │       ├─ Metadata: código, versión, fechas, firmas          │    ║
║  │       └─ Sanitización XML                                   │    ║
║  │       │                                                     │    ║
║  │       ▼                                                     │    ║
║  │  OUTPUT: procedimiento_C701_20260216.docx                   │    ║
║  │  → Guardado en: /storage/procedures/{uuid}.docx             │    ║
║  │  → Registro en: SQLite (procedures table)                   │    ║
║  │                                                             │    ║
║  │  Skill: /generar-art (en paralelo)                          │    ║
║  │  → ART auto-llenado específico para la tarea                │    ║
║  │  → OUTPUT: art_C701_20260216.docx                           │    ║
║  │                                                             │    ║
║  │  Skill: /generar-checklist (en paralelo)                    │    ║
║  │  → Lista de verificación pre-tarea                          │    ║
║  │  → OUTPUT: checklist_C701_20260216.pdf                      │    ║
║  │                                                             │    ║
║  └─────────────────────────────────────────────────────────────┘    ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 9. FASE 4: GENERACIÓN AUDIOVISUAL (NotebookLM MCP)

```
╔══════════════════════════════════════════════════════════════════════╗
║      FASE 4: GENERACIÓN AUDIOVISUAL                                  ║
║      ══════════════════════════════                                  ║
║      🔵 MODO: GENERA                                                ║
║      Herramienta: NotebookLM MCP (todo el contenido A/V)            ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  DOCX generado (Fase 3) + Contexto RAG + Datos usuario              ║
║       │                                                              ║
║       ▼                                                              ║
║  ┌─────────────────────────────────────────────────────────────┐    ║
║  │  PASO 1: CREAR NOTEBOOK EN NOTEBOOKLM                       │    ║
║  │  Skill: /nlm-investigar                                      │    ║
║  │  Tool: nlm create-notebook                                   │    ║
║  │                                                             │    ║
║  │  Notebook: "Procedimiento C-701 - Capacitación"             │    ║
║  │                                                             │    ║
║  │  Agregar fuentes:                                            │    ║
║  │  ┌──────────────────────────────────────────────────────┐   │    ║
║  │  │  nlm add-source --type text                          │   │    ║
║  │  │    → Contenido completo del procedimiento DOCX       │   │    ║
║  │  │                                                      │   │    ║
║  │  │  nlm add-source --type text                          │   │    ║
║  │  │    → Pasos detallados con notas de seguridad         │   │    ║
║  │  │                                                      │   │    ║
║  │  │  nlm add-source --type url                           │   │    ║
║  │  │    → Links de normativa DS 132 (si públicos)         │   │    ║
║  │  │                                                      │   │    ║
║  │  │  nlm add-source --type text                          │   │    ║
║  │  │    → Contexto RAG (riesgos + controles)              │   │    ║
║  │  │                                                      │   │    ║
║  │  │  nlm add-source --type text                          │   │    ║
║  │  │    → Quiz y preguntas de verificación                │   │    ║
║  │  └──────────────────────────────────────────────────────┘   │    ║
║  │                                                             │    ║
║  └──────────────────────┬──────────────────────────────────────┘    ║
║                         ▼                                            ║
║  ┌─────────────────────────────────────────────────────────────┐    ║
║  │  PASO 2: GENERAR PODCAST / AUDIO OVERVIEW                   │    ║
║  │  Skill: /nlm-podcast                                        │    ║
║  │  Tool: nlm generate --type podcast                          │    ║
║  │                                                             │    ║
║  │  Configuración:                                             │    ║
║  │  {                                                          │    ║
║  │    type: "podcast",                                         │    ║
║  │    instructions: "Genera una conversación educativa         │    ║
║  │      sobre el procedimiento de mantención del compresor     │    ║
║  │      C-701. Enfócate en: 1) Por qué el EPP debe estar      │    ║
║  │      libre de grasas (riesgo ignición con oxígeno),         │    ║
║  │      2) Los 10 pasos del procedimiento en orden,            │    ║
║  │      3) Qué hacer en caso de emergencia.                    │    ║
║  │      Tono: profesional pero accesible. Idioma: español      │    ║
║  │      chileno. Duración: 5-10 minutos."                      │    ║
║  │  }                                                          │    ║
║  │                                                             │    ║
║  │  OUTPUT: podcast_C701.mp3 (~8 min, dos voces IA)            │    ║
║  │  → Audio conversacional que explica el procedimiento        │    ║
║  │  → Ideal para escuchar en terreno / transporte              │    ║
║  │                                                             │    ║
║  └──────────────────────┬──────────────────────────────────────┘    ║
║                         ▼                                            ║
║  ┌─────────────────────────────────────────────────────────────┐    ║
║  │  PASO 3: GENERAR CONTENIDO EDUCATIVO ADICIONAL              │    ║
║  │                                                             │    ║
║  │  ┌──────────────────────┐  ┌─────────────────────────────┐ │    ║
║  │  │  QUIZ                │  │  FLASHCARDS                 │ │    ║
║  │  │  Skill: /nlm-quiz    │  │  nlm generate --type        │ │    ║
║  │  │  nlm generate        │  │    study_guide              │ │    ║
║  │  │   --type quiz        │  │                             │ │    ║
║  │  │                      │  │  "¿Qué es LOTO?" →          │ │    ║
║  │  │  10 preguntas sobre  │  │  "Lock Out Tag Out:         │ │    ║
║  │  │  el procedimiento    │  │   sistema de bloqueo..."    │ │    ║
║  │  │  con opciones        │  │                             │ │    ║
║  │  │  múltiples           │  │  20 tarjetas de estudio     │ │    ║
║  │  └──────────┬───────────┘  └──────────────┬──────────────┘ │    ║
║  │             │                              │                │    ║
║  │  ┌──────────▼───────────┐  ┌──────────────▼──────────────┐ │    ║
║  │  │  RESUMEN EJECUTIVO   │  │  INFOGRAFÍA / MIND MAP      │ │    ║
║  │  │  nlm generate        │  │  nlm generate --type        │ │    ║
║  │  │   --type briefing    │  │    mind_map                 │ │    ║
║  │  │    _doc              │  │                             │ │    ║
║  │  │                      │  │  Mapa visual del            │ │    ║
║  │  │  Documento de 1 pág  │  │  procedimiento con          │ │    ║
║  │  │  con puntos clave    │  │  conexiones entre           │ │    ║
║  │  │  para supervisores   │  │  pasos y riesgos            │ │    ║
║  │  └──────────────────────┘  └─────────────────────────────┘ │    ║
║  │                                                             │    ║
║  └──────────────────────┬──────────────────────────────────────┘    ║
║                         ▼                                            ║
║  ┌─────────────────────────────────────────────────────────────┐    ║
║  │  PASO 4: COMPILAR PAQUETE DE CAPACITACIÓN                   │    ║
║  │                                                             │    ║
║  │  Paquete final almacenado en disco local:                   │    ║
║  │                                                             │    ║
║  │  /storage/packages/{uuid}/                                  │    ║
║  │  ├── procedimiento_C701.docx        (Documento formal)      │    ║
║  │  ├── art_C701.docx                  (Análisis de Riesgo)    │    ║
║  │  ├── checklist_C701.pdf             (Lista verificación)    │    ║
║  │  ├── podcast_C701.mp3               (Audio capacitación)    │    ║
║  │  ├── quiz_C701.json                 (Preguntas + respuestas)│    ║
║  │  ├── flashcards_C701.json           (Tarjetas de estudio)   │    ║
║  │  ├── resumen_C701.md                (Briefing 1 página)     │    ║
║  │  └── mindmap_C701.md                (Mapa mental)           │    ║
║  │                                                             │    ║
║  └─────────────────────────────────────────────────────────────┘    ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 10. FASE 5: ENTREGA FORMAL + VALIDACIÓN

```
╔══════════════════════════════════════════════════════════════════════╗
║       FASE 5: ENTREGA FORMAL + CADENA DE VALIDACIÓN                  ║
║       ═════════════════════════════════════════════                   ║
║       🔵 MODO: GENERA                                                ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  Paquete completo (Fase 4)                                           ║
║       │                                                              ║
║       ▼                                                              ║
║  ┌─────────────────────────────────────────────────────────────┐    ║
║  │  ENTREGA POR WHATSAPP                                        │    ║
║  │                                                             │    ║
║  │  Mensaje al supervisor:                                     │    ║
║  │  ┌──────────────────────────────────────────────────────┐   │    ║
║  │  │                                                      │   │    ║
║  │  │  ✅ PAQUETE DE PROCEDIMIENTO GENERADO                │   │    ║
║  │  │                                                      │   │    ║
║  │  │  Mantención Preventiva Compresor C-701               │   │    ║
║  │  │  División: Chuquicamata | Zona: POX                  │   │    ║
║  │  │                                                      │   │    ║
║  │  │  DOCUMENTOS:                                         │   │    ║
║  │  │  [1] Procedimiento DOCX  → link descarga             │   │    ║
║  │  │  [2] ART (Análisis Riesgo) → link descarga           │   │    ║
║  │  │  [3] Checklist Pre-Tarea → link descarga              │   │    ║
║  │  │                                                      │   │    ║
║  │  │  CAPACITACIÓN:                                       │   │    ║
║  │  │  [4] Podcast explicativo (8 min) → link audio        │   │    ║
║  │  │  [5] Quiz de certificación → link                    │   │    ║
║  │  │                                                      │   │    ║
║  │  │  CLASIFICACIÓN DE RIESGO:                            │   │    ║
║  │  │  MR = 48 (ALTO) → Requiere aprobación Gerencia      │   │    ║
║  │  │                                                      │   │    ║
║  │  │  Fuentes: DS 132 Art.52, ECF 1, ECF 9               │   │    ║
║  │  │  PRO.0908.MPEF1, Manual C-701                        │   │    ║
║  │  │                                                      │   │    ║
║  │  │  Responde "ok" para enviar a validación              │   │    ║
║  │  │                                                      │   │    ║
║  │  └──────────────────────────────────────────────────────┘   │    ║
║  │                                                             │    ║
║  └──────────────────────┬──────────────────────────────────────┘    ║
║                         ▼                                            ║
║  ┌─────────────────────────────────────────────────────────────┐    ║
║  │  CADENA DE VALIDACIÓN (según nivel de riesgo)                │    ║
║  │  Skill: /clasificar-riesgo                                   │    ║
║  │                                                             │    ║
║  │  MR = Probabilidad × Consecuencia × Fj × Fa                │    ║
║  │  Fj = (8/h) × (24-h)/16  (factor jornada >8h)              │    ║
║  │  Fa = P/760              (factor altitud >1000 msnm)        │    ║
║  │                                                             │    ║
║  │  ┌────────────────────────────────────────────────────────┐ │    ║
║  │  │                                                        │ │    ║
║  │  │  RIESGO BAJO (MR < 8)                                 │ │    ║
║  │  │  ┌─────────────┐                                      │ │    ║
║  │  │  │ Supervisor  │──→ Aprueba vía WhatsApp              │ │    ║
║  │  │  │ de Turno    │    (responde "aprobado")             │ │    ║
║  │  │  └─────────────┘                                      │ │    ║
║  │  │                                                        │ │    ║
║  │  │  RIESGO MEDIO (MR 8-31)                               │ │    ║
║  │  │  ┌─────────────┐    ┌──────────────┐                  │ │    ║
║  │  │  │ Supervisor  │──→ │ Ing. Prev.   │──→ Aprueba       │ │    ║
║  │  │  │ de Turno    │    │ de Riesgos   │    con firma     │ │    ║
║  │  │  └─────────────┘    └──────────────┘                  │ │    ║
║  │  │                                                        │ │    ║
║  │  │  RIESGO ALTO (MR 32-64)                               │ │    ║
║  │  │  ┌─────────────┐    ┌──────────────┐   ┌──────────┐  │ │    ║
║  │  │  │ Supervisor  │──→ │ Ing. Prev.   │─→ │ Gerencia │  │ │    ║
║  │  │  │ de Turno    │    │ de Riesgos   │   │ General  │  │ │    ║
║  │  │  └─────────────┘    └──────────────┘   │ División │  │ │    ║
║  │  │                                         └──────────┘  │ │    ║
║  │  │  Si "Modificación Significativa" → BLOQUEADO           │ │    ║
║  │  │  hasta revisión completa según Art. 603                │ │    ║
║  │  │                                                        │ │    ║
║  │  └────────────────────────────────────────────────────────┘ │    ║
║  │                                                             │    ║
║  └─────────────────────────────────────────────────────────────┘    ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 11. FASE 6: CAPACITACIÓN + AUDITORÍA

```
╔══════════════════════════════════════════════════════════════════════╗
║       FASE 6: CAPACITACIÓN + AUDITORÍA CONTINUA                     ║
║       ═════════════════════════════════════════                      ║
║       🔵 GENERA (certificaciones) + 🟢 APRENDE (feedback)           ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ┌─────────────────────────────────────────────────────────────┐    ║
║  │  CAPACITACIÓN                                                │    ║
║  │                                                             │    ║
║  │  Supervisor comparte paquete al turno (WhatsApp/tablet)     │    ║
║  │       │                                                     │    ║
║  │       ├──→ Trabajadores escuchan podcast (8 min)            │    ║
║  │       │    → En transporte, antes del turno, en descanso    │    ║
║  │       │                                                     │    ║
║  │       ├──→ Revisan checklist y procedimiento DOCX           │    ║
║  │       │    → En tablet/celular, en terreno                  │    ║
║  │       │                                                     │    ║
║  │       └──→ Responden quiz de certificación                  │    ║
║  │            │                                                │    ║
║  │            ├── ≥ 80% → CERTIFICACIÓN EMITIDA                │    ║
║  │            │    → Registro: nombre, fecha, score, proc_id   │    ║
║  │            │    → Válida por 1 año                          │    ║
║  │            │                                                │    ║
║  │            └── < 80% → Re-escuchar podcast + reintentar     │    ║
║  │                                                             │    ║
║  │  🟢 APRENDE: Preguntas donde más fallan →                   │    ║
║  │     el sistema refuerza esos temas en futuros podcasts      │    ║
║  │                                                             │    ║
║  └─────────────────────────────────────────────────────────────┘    ║
║                                                                      ║
║  ┌─────────────────────────────────────────────────────────────┐    ║
║  │  AUDITORÍA CONTINUA                                          │    ║
║  │                                                             │    ║
║  │  MONITOREO AUTOMÁTICO (cron cada 6 meses):                  │    ║
║  │  ├─ Verifica cambios en DS 132, DS 594, ECFs               │    ║
║  │  ├─ Si cambio detectado:                                    │    ║
║  │  │    ├─ ALERTA a administradores                           │    ║
║  │  │    ├─ FLAG procedimientos afectados                      │    ║
║  │  │    ├─ Sugiere re-generación automática                   │    ║
║  │  │    └─ 🟢 APRENDE: Actualiza dataset de fine-tuning       │    ║
║  │  │         con nueva normativa                              │    ║
║  │  └─ Trazabilidad completa para SERNAGEOMIN:                 │    ║
║  │       ├─ Quién creó y validó cada documento                 │    ║
║  │       ├─ Fuentes citadas con links directos                 │    ║
║  │       ├─ Trabajadores capacitados por procedimiento         │    ║
║  │       ├─ Scores de quiz y tasas de aprobación               │    ║
║  │       └─ Historial inmutable (versionado)                   │    ║
║  │                                                             │    ║
║  └─────────────────────────────────────────────────────────────┘    ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 12. CICLO DE APRENDIZAJE (Fine-Tuning Continuo)

```
╔══════════════════════════════════════════════════════════════════════╗
║        CICLO COMPLETO DE APRENDIZAJE                                 ║
║        🟢 MODO: APRENDE (siempre en background)                     ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║                    ┌─────────────────────┐                           ║
║                    │  PRODUCCIÓN         │                           ║
║                    │  (el sistema GENERA)│                           ║
║                    └─────────┬───────────┘                           ║
║                              │                                       ║
║              ┌───────────────┼───────────────┐                       ║
║              ▼               ▼               ▼                       ║
║     ┌────────────┐  ┌────────────┐  ┌────────────────┐              ║
║     │ Documento  │  │ Validador  │  │ Quiz results   │              ║
║     │ generado   │  │ corrige    │  │ (dónde fallan  │              ║
║     │ y aprobado │  │ documento  │  │  trabajadores) │              ║
║     └─────┬──────┘  └─────┬──────┘  └───────┬────────┘              ║
║           │               │                  │                       ║
║           ▼               ▼                  ▼                       ║
║     ┌─────────────────────────────────────────────────┐             ║
║     │         RECOLECTOR DE DATOS                      │             ║
║     │         Skill: /registrar-corrección             │             ║
║     │                                                  │             ║
║     │  Acumula:                                        │             ║
║     │  ├─ Pares (generado, aprobado) → "gold examples" │             ║
║     │  ├─ Pares (incorrecto, corrección) → "fix data"  │             ║
║     │  ├─ Patrones de preguntas frecuentes             │             ║
║     │  └─ Áreas donde quiz scores son bajos            │             ║
║     │                                                  │             ║
║     └────────────────────┬─────────────────────────────┘             ║
║                          │                                           ║
║                          ▼                                           ║
║     ┌─────────────────────────────────────────────────┐             ║
║     │         TRIGGER DE RE-ENTRENAMIENTO              │             ║
║     │                                                  │             ║
║     │  ¿Se activa cuando?                              │             ║
║     │                                                  │             ║
║     │  [A] Cada 50 documentos aprobados nuevos         │             ║
║     │  [B] Corrección de un validador senior           │             ║
║     │  [C] Cambio en normativa (DS 132 / ECF)          │             ║
║     │  [D] Cron semanal/mensual programado             │             ║
║     │  [E] Calidad medida cae bajo umbral (ROUGE < 0.7)│             ║
║     │                                                  │             ║
║     └────────────────────┬─────────────────────────────┘             ║
║                          │                                           ║
║                          ▼                                           ║
║     ┌─────────────────────────────────────────────────┐             ║
║     │         PIPELINE DE FINE-TUNING                  │             ║
║     │         (En background, no afecta producción)    │             ║
║     │                                                  │             ║
║     │  1. Preparar dataset (train.jsonl + eval.jsonl)  │             ║
║     │  2. Cargar modelo base MiniMax M2.5              │             ║
║     │  3. Aplicar LoRA (Unsloth + PEFT)                │             ║
║     │  4. Entrenar 3-5 epochs (~2-4 horas GPU)         │             ║
║     │  5. Evaluar en test set                          │             ║
║     │     Skill: /evaluar-calidad                      │             ║
║     │                                                  │             ║
║     │  ┌──────────────────────────────────────────┐    │             ║
║     │  │ Métricas:                                │    │             ║
║     │  │ ROUGE-L: 0.82 (↑ de 0.75)               │    │             ║
║     │  │ Compliance: 98% (↑ de 94%)               │    │             ║
║     │  │ Estructura: 100%                         │    │             ║
║     │  │ Evaluación humana: 4.3/5                 │    │             ║
║     │  └──────────────────────────────────────────┘    │             ║
║     │                                                  │             ║
║     │  6. ¿Métricas mejoran?                           │             ║
║     │     ├── SI → Deploy nuevo modelo (hot-swap)      │             ║
║     │     └── NO → Rollback, investigar problema       │             ║
║     │                                                  │             ║
║     └────────────────────┬─────────────────────────────┘             ║
║                          │                                           ║
║                          ▼                                           ║
║                    ┌─────────────────────┐                           ║
║                    │  PRODUCCIÓN         │                           ║
║                    │  (modelo mejorado)  │◄── Ciclo se repite        ║
║                    └─────────────────────┘                           ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 13. MAPA COMPLETO: GENERA vs APRENDE

### Vista de una sola página

```
═══════════════════════════════════════════════════════════════════════
              CUÁNDO GENERA  🔵  vs  CUÁNDO APRENDE  🟢
═══════════════════════════════════════════════════════════════════════

FASE 1: ENTRADA MULTIMODAL
├── 🔵 Transcribe audio, analiza imágenes, lee PDFs, scrape web
└── 🟢 Registra qué tipo de inputs son más comunes por zona/área

FASE 2: ENRIQUECIMIENTO
├── 🔵 Pregunta al usuario, investiga con NotebookLM, infiere con LLM
└── 🟢 Aprende qué preguntas hacer proactivamente por tipo de tarea

FASE 3: RAG + DOCUMENTOS
├── 🔵 Busca en ChromaDB, genera con MiniMax, valida con Claude
├── 🔵 Renderiza DOCX, ART, Checklist
└── 🟢 Cuando un validador corrige → par (original,corregido) al dataset

FASE 4: AUDIOVISUAL
├── 🔵 NotebookLM genera: podcast, quiz, flashcards, resumen, mindmap
└── 🟢 Temas donde quiz scores son bajos → refuerzo en próximos podcasts

FASE 5: ENTREGA + VALIDACIÓN
├── 🔵 Envía paquete por WhatsApp, ejecuta cadena de aprobación
└── 🟢 Cada aprobación/rechazo alimenta métricas de calidad

FASE 6: CAPACITACIÓN + AUDITORÍA
├── 🔵 Certificaciones automáticas, monitoreo normativo
├── 🟢 Quiz results → áreas débiles → ajuste de contenido futuro
└── 🟢 Cambios normativos → re-entrenamiento urgente del modelo

BACKGROUND CONTINUO:
└── 🟢 Fine-Tuning LoRA cada 50 docs o semanal (cron)
    └── Modelo mejora iterativamente sin intervención humana

═══════════════════════════════════════════════════════════════════════
```

---

## 14. DIAGRAMA DE FLUJO INTEGRAL

### El viaje completo de una solicitud

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║    HUMANO                    MÁQUINA                       HUMANO            ║
║  (Supervisor)              (VM + IA)                    (Validadores)        ║
║                                                                              ║
║  ┌──────────┐                                                                ║
║  │ WhatsApp │                                                                ║
║  │ Audio/   │                                                                ║
║  │ Imagen/  │──────────────────┐                                             ║
║  │ Texto/   │                  │                                             ║
║  │ PDF/     │                  ▼                                             ║
║  │ Link/    │        ┌─────────────────┐                                     ║
║  │ Web      │        │  PROCESA INPUT  │ Skills: /transcribir-audio          ║
║  └──────────┘        │  (Multimodal)   │         /analizar-imagen            ║
║                      │  MiniMax M2.5   │         /extraer-pdf                ║
║                      └────────┬────────┘         /scrape-web                 ║
║                               │                                              ║
║                               ▼                                              ║
║                      ┌─────────────────┐                                     ║
║                      │  ¿Info          │                                     ║
║                      │  suficiente?    │                                     ║
║                      └───┬─────────┬───┘                                     ║
║                          │         │                                         ║
║                     NO   │         │  SI                                     ║
║                          ▼         │                                         ║
║                 ┌─────────────┐    │                                         ║
║  ┌──────────┐  │ ENRIQUECER  │    │                                         ║
║  │ Responde │◄─│ Preguntar + │    │                                         ║
║  │ preguntas│  │ NotebookLM  │    │                                         ║
║  │ del      │─→│ investiga   │    │                                         ║
║  │ sistema  │  │             │    │                                         ║
║  └──────────┘  └──────┬──────┘    │                                         ║
║                       │           │                                         ║
║                       └─────┬─────┘                                         ║
║                             │ 100% completo                                  ║
║                             ▼                                                ║
║                    ┌─────────────────┐                                       ║
║  ┌──────────┐     │   BÚSQUEDA RAG  │                                       ║
║  │ Confirma │◄────│   ChromaDB      │                                       ║
║  │ "dale,   │     │   DS132, ECFs   │                                       ║
║  │ generar" │────→│   RF01-RF29     │                                       ║
║  └──────────┘     └────────┬────────┘                                       ║
║                            │                                                 ║
║                            ▼                                                 ║
║                   ┌─────────────────┐                                        ║
║                   │  GENERA DOCS    │ Skills: /generar-procedimiento         ║
║                   │  MiniMax M2.5   │         /generar-art                   ║
║                   │  (Fine-Tuned)   │         /generar-checklist             ║
║                   │                 │                                        ║
║                   │  Fallback:      │ Skills: /validar-normativa             ║
║                   │  Claude Opus4.6 │         /validar-riesgos               ║
║                   └────────┬────────┘                                        ║
║                            │                                                 ║
║                            ▼                                                 ║
║                   ┌─────────────────┐                                        ║
║                   │  GENERA A/V     │ Skills: /nlm-podcast                   ║
║                   │  NotebookLM MCP │         /nlm-quiz                      ║
║                   │  Podcast + Quiz │         /nlm-investigar                ║
║                   │  + Flashcards   │                                        ║
║                   └────────┬────────┘                                        ║
║                            │                                                 ║
║                            ▼                                                 ║
║  ┌──────────┐    ┌─────────────────┐                                        ║
║  │ Recibe   │◄───│ ENTREGA         │                     ┌──────────┐       ║
║  │ paquete  │    │ WhatsApp:       │────────────────────→ │ VALIDA   │       ║
║  │ completo │    │ DOCX+Audio+Quiz │                     │ Según MR │       ║
║  │          │    └─────────────────┘                     │          │       ║
║  │ Envía a  │                                            │ Bajo:    │       ║
║  │ validar  │                                            │ Superv.  │       ║
║  └──────────┘                                            │          │       ║
║                                                          │ Medio:   │       ║
║                                                          │ Ing.Prev │       ║
║                                                          │          │       ║
║                                                          │ Alto:    │       ║
║                                                          │ Gerencia │       ║
║                                                          └─────┬────┘       ║
║                                                                │             ║
║                            ┌───────────────────────────────────┘             ║
║                            ▼                                                 ║
║                   ┌─────────────────┐                                        ║
║                   │  ¿APROBADO?     │                                        ║
║                   └───┬─────────┬───┘                                        ║
║                       │         │                                            ║
║                  SI   │         │  NO (correcciones)                         ║
║                       │         │                                            ║
║                       ▼         ▼                                            ║
║  ┌──────────┐   ┌──────────┐  ┌──────────────────┐                          ║
║  │Trabaja-  │   │PUBLICADO │  │ 🟢 APRENDE        │                          ║
║  │dores     │◄──│ Paquete  │  │ Registra par      │                          ║
║  │escuchan  │   │ oficial  │  │ (original,correc- │                          ║
║  │podcast + │   │          │  │  ción) al dataset │                          ║
║  │hacen quiz│   │ 🟢 APRENDE│  │ de fine-tuning    │                          ║
║  └────┬─────┘   │ Doc apro-│  └──────────────────┘                          ║
║       │         │ bado →   │                                                 ║
║       │         │ dataset  │                                                 ║
║       │         └──────────┘                                                 ║
║       │                                                                      ║
║       ▼                                                                      ║
║  ┌──────────┐                                                                ║
║  │ ≥80% →   │──→ CERTIFICADO EMITIDO                                        ║
║  │ Quiz OK  │    (registro para auditoría SERNAGEOMIN)                       ║
║  │          │                                                                ║
║  │ <80% →   │──→ Re-escuchar + reintentar                                   ║
║  │ Repasar  │    🟢 APRENDE: temas débiles → refuerzo futuro                │
║  └──────────┘                                                                ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## RESUMEN EJECUTIVO

| Aspecto | Detalle |
|---------|---------|
| **Modelo principal** | MiniMax M2.5 (Fine-Tuned con LoRA) |
| **Modelo fallback** | Claude Code Opus 4.6 (validación + tareas complejas) |
| **Infraestructura** | VM dedicada (Ubuntu + GPU NVIDIA) |
| **Audiovisual** | NotebookLM MCP (podcast, quiz, flashcards, mindmaps) |
| **Fine-Tuning** | Unsloth + PEFT/LoRA + TRL (QLoRA 4-bit en GPU) |
| **Input WhatsApp** | Audio, imagen, texto, PDF, links, páginas web |
| **Skills** | 15 skills especializados (comprensión, generación, validación, aprendizaje, investigación) |
| **RAG** | ChromaDB (768-dim, BGE-Base, coseno) |
| **Documentos** | docxtemplater (DOCX) con template normado |
| **Enriquecimiento** | LLM + NotebookLM cuando la info es vaga |
| **Tiempo total** | < 1 día (vs 3-4 semanas manual) |
| **El sistema GENERA** | En cada solicitud: docs, audio, quiz, certificaciones |
| **El sistema APRENDE** | Continuamente: correcciones, aprobaciones, feedback quiz, cambios normativos |
