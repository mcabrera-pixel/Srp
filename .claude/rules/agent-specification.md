# Agent Specification — Estándares MCCO

Fuente: agency-agents (67.1k stars), mattpocock/skills (12.2k stars).

Todo agente MCCO tiene especificación. Formato concentrado: YAML frontmatter + 3 secciones esenciales.

---

## 1. Formato Concentrado

Cada agente es un archivo Markdown con frontmatter YAML mínimo:

```yaml
---
name: A7_Decisor
description: "Agente de decisión de pricing para licitaciones públicas"
category: Decision Engine
dependencies: [A3_Precios]
timeout: 300  # segundos
---
```

Campos obligatorios: `name`, `description`, `category`, `dependencies`, `timeout`.
Categorías válidas: `Data Acquisition`, `Processing`, `Decision Engine`, `Communication`, `Orchestration`, `Knowledge`.

---

## 2. Secciones Obligatorias (3)

### Misión y Reglas

Combina qué hace + qué NO debe hacer. Máximo 5 objetivos + 5 restricciones.

```markdown
## Misión y Reglas

### Objetivos
1. Evaluar cada CA con contexto completo (precios, competencia, historial)
2. Calcular precio de oferta respetando margen mínimo 15%
3. Registrar decisión con reasoning para feedback loop
4. Escalar a Supervisor cuando confianza < 0.5

### Restricciones
- NUNCA ofertar bajo margen mínimo 15%
- NUNCA procesar CA sin precios validados de A3
- SIEMPRE validar JSON del LLM antes de actuar
- SIEMPRE registrar decisión en D1 con reasoning
- TIMEOUT: 60s para LLM, 300s total por CA
```

### Proceso

Step-by-step de ejecución. Incluir comunicación con otros agentes inline.

```markdown
## Proceso
1. Recibir CA de cola (estado: `precios_ok`)
2. Cargar contexto: precios de A3, historial, knowledge
3. Llamar LLM (multi-pass si CA > $10M CLP)
4. Validar output JSON y aplicar reglas de negocio en código
5. Registrar decisión en `agent_decisions`, enviar a Worker API
6. Actualizar estado CA a `decision_ok` o `rechazada`
```

### Métricas de Éxito

KPIs cuantitativos con valores target.

```markdown
## Métricas de Éxito
- Win rate: > 25% de ofertas enviadas
- Margen promedio: 18-25%
- Tiempo decisión: < 60s por CA
- Error rate: < 5% de decisiones fallidas
- Fallback rate: < 10% (respuestas LLM inválidas)
```

---

## 3. Catálogo de Agentes MCCO

| ID | Nombre | Categoría | Dependencia |
|----|--------|-----------|-------------|
| A0 | Scraper | Data Acquisition | — |
| A1 | Categorizador | Processing | A0 |
| A2 | Buscador | Data Acquisition | A1 |
| A2.5 | Scraper Precios | Data Acquisition | A2 |
| A3 | Precios | Processing | A2.5 |
| A4 | Email | Communication | A7 |
| A5 | WhatsApp | Communication | A7 |
| A7 | Decisor | Decision Engine | A3 |
| — | Curador | Knowledge | A7 (feedback) |
| — | Supervisor | Orchestration | Todos |
| — | Trainer | Knowledge | Curador |

---

## 4. Ubicación de Archivos

```
proyecto/
├── agents/
│   ├── specs/           # Especificaciones (este formato)
│   │   ├── a0_scraper.md
│   │   ├── a7_decisor.md
│   │   └── supervisor.md
│   ├── base.py          # BaseAgent
│   ├── a0_scraper.py    # Implementación
│   └── ...
```

Cada `specs/*.md` es la fuente de verdad del comportamiento del agente.
Al modificar comportamiento, actualizar spec ANTES de modificar código.
