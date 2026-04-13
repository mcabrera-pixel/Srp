# Cost Optimization — Estándares MCCO

Fuente: everything-claude-code (131k), claude-subconscious (2.5k).

Estrategias para optimizar costos de LLM y tokens en desarrollo y producción.

---

## 1. Estrategia de 3 Modelos

| Modelo | Costo | Uso Recomendado | Reducción |
|--------|-------|-----------------|-----------|
| **Haiku** | Bajo | Subagentes de exploración, lecturas simples, clasificación rápida | ~80% más barato |
| **Sonnet** | Medio | ~80% de tareas de código, refactoring, debugging | ~60% menos vs Opus |
| **Opus** | Alto | Razonamiento arquitectural, debugging sutil, decisiones complejas | Baseline |

### Regla de selección

```
¿Requiere razonamiento profundo o decisiones arquitecturales?
  → Sí: Opus
  → No: ¿Es tarea mecánica (1-2 archivos, cambio simple)?
    → Sí: Haiku
    → No: Sonnet
```

Para agentes en producción (Python):
- Tareas de categorización, parsing → modelo barato (MiniMax M2.7, Haiku)
- Decisiones de pricing, evaluación de proveedores → modelo capaz
- Reflexión, self-critique → modelo capaz pero con prompt corto

---

## 2. Gestión de Contexto

### `/clear` — Limpiar contexto entre tareas

Usar `/clear` entre tareas no relacionadas. No arrastrar contexto de Feature A cuando trabajas en Bug B.

### `/compact` — Comprimir contexto

- Usar después de exploración o milestones completados
- NUNCA usar mid-implementation (pierde contexto crítico de lo que estás construyendo)
- Auto-compact recomendado al 80% de ventana de contexto

### Reglas de token

- Mantener < 10 servidores MCP activos por proyecto
- `MAX_THINKING_TOKENS=10000` reduce costo de razonamiento interno ~70%
- Leer archivos selectivamente (`offset` + `limit`), no archivos completos
- En prompts de producción: mínimo contexto necesario, no "por si acaso"

---

## 3. Diffs Incrementales en Memoria (claude-subconscious)

NO reenviar toda la memoria en cada interacción con el LLM:

```
Primera invocación  →  Bloques completos de memoria
Invocaciones 2..N   →  Solo deltas (líneas +/-)
```

Esto reduce drásticamente tokens en sesiones largas o agentes que procesan muchas CAs.

### Implementación

```python
_last_memory_snapshot = {}

def get_memory_for_prompt(agent_memories: dict) -> str:
    global _last_memory_snapshot
    if not _last_memory_snapshot:
        _last_memory_snapshot = agent_memories.copy()
        return format_full_blocks(agent_memories)

    diffs = compute_diffs(_last_memory_snapshot, agent_memories)
    _last_memory_snapshot = agent_memories.copy()
    if not diffs:
        return ""  # Sin cambios = sin inyección
    return format_diff_blocks(diffs)
```

---

## 4. Whisper Mode para Context Injection

En vez de inundar el prompt con toda la memoria disponible:

- Inyectar como XML liviano DESPUÉS de la instrucción principal
- Hard cap: 500 tokens de contexto inyectado total
- Filtrar top-3 entries más relevantes por similarity score
- Si no hay nada relevante, NO inyectar nada (zero tokens)

```xml
<memoria tipo="proveedor" confianza="0.85">
Proveedor X responde en 2h, 12% descuento en válvulas de cobre.
</memoria>
```

---

## 5. Subagentes Económicos

Cuando se delega trabajo a subagentes:

- Subagente de exploración/lectura → Haiku (solo necesita Read, Grep, Glob)
- Subagente de implementación → Sonnet (necesita Edit, Write, Bash)
- Subagente de revisión → Sonnet o Opus según complejidad
- NUNCA pasar todo el contexto del padre al hijo — solo el resumen relevante

```python
# Patrón zero-context-cost (hermes-agent):
# Solo el resumen final del subagente entra al contexto del padre
result = delegate_task(
    task="Buscar precio de válvulas en MeLi",
    tools=["search", "fetch"],  # Toolset restringido
    skip_memory=True,           # Sin cargar memoria del padre
    skip_context=True,          # Sin cargar CLAUDE.md del padre
)
parent_context.append(result.summary)  # Solo el resumen
```

---

## 6. Monitoreo de Costos

### En desarrollo (Claude Code)
- Usar `/cost` periódicamente para ver gasto de la sesión
- Si una sesión supera el presupuesto, `/clear` y empezar fresca

### En producción (agentes Python)
- Loguear tokens de input + output por cada llamada LLM
- Agregar campo `tokens_used` en tabla de decisiones D1
- Alerta si un agente consume > 2x su promedio semanal
- Dashboard semanal: costo por agente, por CA, por tipo de decisión

```python
# Después de cada llamada LLM:
logger.info(f"LLM call: agent={self.name} tokens_in={usage.prompt_tokens} "
            f"tokens_out={usage.completion_tokens} cost_usd={estimated_cost:.4f}")
```
