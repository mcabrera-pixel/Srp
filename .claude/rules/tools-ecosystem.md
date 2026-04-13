# Tools & Skills Ecosystem — Estándares MCCO

Fuente: mattpocock/skills (12.2k), claude-skills (9.6k).

Herramientas y skills recomendados para desarrollo con Claude Code.

---

## 1. Skills Recomendadas

Skills prioritarias para proyectos MCCO:

| Skill | Fuente | Para qué |
|-------|--------|----------|
| **tdd** | mattpocock | Red-Green-Refactor con vertical slices |
| **write-a-prd** | mattpocock | Product Requirements → GitHub issue |
| **design-an-interface** | mattpocock | 3+ subagentes generan diseños en paralelo |
| **security-auditor** | claude-skills | Escaneo de vulnerabilidades pre-deploy |
| **agent-designer** | claude-skills | Orquestación multi-agente |

---

## 2. Formato SKILL.md (para crear skills propias)

```yaml
---
name: mcco-pricing-review
description: "Revisa decisiones de pricing de A7 contra reglas de negocio MCCO.
  Activar cuando se mencione: pricing, margen, oferta, licitación, A7."
user-invocable: true
---

## Instrucciones

Cuando se active este skill:

1. Leer la decisión de pricing (JSON de A7)
2. Verificar contra reglas MCCO:
   - Margen >= 15%
   - Región válida (1-16)
   - Presupuesto >= $500K CLP
   - Proveedor con reliability >= 0.7
3. Si alguna regla falla, rechazar con razón específica
4. Si todas pasan, aprobar con score de confianza

## Verificación
- Ejecutar promptfoo eval contra casos de prueba
- Verificar que no hay falsos positivos en rechazos
```

### Ubicación

```
~/.claude/skills/          # Skills globales (personales)
.claude/skills/            # Skills de proyecto (compartidas)
```

---

## 3. Vertical Slices (mattpocock)

Patrón de desarrollo extraído de skill `tdd`:

```
NUNCA hacer horizontal slicing:
  Escribir TODOS los tests → Luego TODO el código

SIEMPRE hacer vertical slicing:
  1 test → 1 implementación → refactor → repetir

Cada slice atraviesa todas las capas:
  Test → Modelo → Lógica → API → Verificación
```

### Aplicación en MCCO

```
Feature: "Agregar filtro por región a A7"

Slice 1: Test que verifica rechazo de CA fuera de región → Implementar filtro
Slice 2: Test que verifica aceptación de CA en región → Verificar pass-through
Slice 3: Test que verifica logging de filtro → Agregar log
```

---

## 4. Sub-Agentes Paralelos (mattpocock)

Para explorar múltiples soluciones simultáneamente:

```
Lanzar 3+ subagentes en UN SOLO mensaje:
  - Subagente A: Explora enfoque con RAG
  - Subagente B: Explora enfoque con reglas hardcoded
  - Subagente C: Explora enfoque híbrido

Cada subagente:
  - Contexto independiente
  - Solo herramientas de lectura (Read, Grep, Glob)
  - Reporta resumen al padre
  - NO puede spawnar más subagentes
  - NO edita archivos
```

---

## 5. Adaptive Thinking

Controlar profundidad de razonamiento con `/effort`:
- `medium` — Tareas rutinarias (categorización, status)
- `high` — Implementación de features, debugging
- `max` — Decisiones arquitecturales, diseño de sistemas

---

## 6. Referencia: qmd — Búsqueda Local sobre Markdown

Motor de búsqueda local sobre markdown con BM25 + vector + re-ranking LLM (github.com/tobi/qmd).
Funciona como CLI y MCP server. Alternativa liviana a Onyx para equipos pequeños.
Escala hasta ~500 archivos sin Docker ni vector DB externa.
Uso MCCO: buscar en Obsidian vault, knowledge de proyecto, o PDFs convertidos a markdown.
