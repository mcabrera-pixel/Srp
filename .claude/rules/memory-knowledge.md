# Memory & Knowledge System — Estándares MCCO

Fuente: supermemory (20.8k), OpenSpace (3.3k), claude-subconscious (2.5k), OpenViking (21.2k).

Patrones de gestión de conocimiento para el pipeline multi-agente MCCO.
Para RAG sobre documentos ver: `rag-patterns.md`

---

## 1. Resolución Temporal (supermemory)

NUNCA borrar knowledge. Siempre superseder con `is_latest`:

```sql
-- Al detectar contradicción:
UPDATE paola_knowledge SET is_latest = 0 WHERE id = ?;  -- viejo
INSERT INTO paola_knowledge (content, is_latest, parent_id, ...) VALUES (?, 1, ?, ...);  -- nuevo

-- SIEMPRE filtrar:
SELECT * FROM paola_knowledge WHERE is_latest = 1 AND is_active = 1;
```

### Tres tipos de relación al escribir

| Relación | Cuándo | Acción |
|----------|--------|--------|
| **Update** | Nuevo contradice viejo | Viejo `is_latest=0`, nuevo `parent_id=viejo.id` |
| **Extension** | Nuevo agrega detalle sin contradecir | Ambos `is_latest=1`, vinculados |
| **Derivation** | Inferencia combinando múltiples entries | Nuevo con `parent_ids[]` múltiples |

### LLM-in-the-loop al ESCRIBIR

Antes de `remember()`:
1. Buscar entries similares existentes (`is_latest=1`)
2. Si hay candidatos, preguntar al LLM: "¿Este hecho nuevo contradice, extiende, o es independiente del existente?"
3. Aplicar la relación correspondiente
4. Si no hay candidatos, insertar directamente

---

## 2. Cuatro Contadores Atómicos (OpenSpace)

Cada entry de knowledge mantiene 4 contadores actualizados atómicamente:

```sql
ALTER TABLE paola_knowledge ADD COLUMN times_selected INTEGER DEFAULT 0;
ALTER TABLE paola_knowledge ADD COLUMN times_applied INTEGER DEFAULT 0;
ALTER TABLE paola_knowledge ADD COLUMN times_helped INTEGER DEFAULT 0;
ALTER TABLE paola_knowledge ADD COLUMN times_failed INTEGER DEFAULT 0;

-- Actualización atómica (una sola query, en transacción):
UPDATE paola_knowledge SET
    times_selected = times_selected + 1,
    times_applied = times_applied + ?,
    times_helped = times_helped + ?,
    times_failed = times_failed + ?
WHERE id = ?;
```

### Métricas Derivadas (calcular, NO almacenar)

```python
@property
def reliability(self) -> float:
    return self.times_helped / self.times_selected if self.times_selected else 0.0

@property
def fallback_rate(self) -> float:
    return self.times_failed / self.times_selected if self.times_selected else 0.0
```

### Filtrado Pre-Selección

Antes de inyectar knowledge en el contexto del agente:
- `reliability < 0.3` después de 5+ usos → auto-desactivar (`is_active=0`)
- `fallback_rate > 0.5` después de 3+ usos → excluir del catálogo
- Knowledge recién creado/evolucionado → necesita `min_selections=5` datos frescos antes de re-evaluación

---

## 3. Container Tags (supermemory)

Aislar memoria por contexto. NUNCA mezclar memoria entre scopes distintos:

```sql
ALTER TABLE paola_knowledge ADD COLUMN container_tag TEXT;

-- Cada licitación tiene su container
INSERT INTO paola_knowledge (content, container_tag, ...) VALUES (?, 'ca_12345', ...);

-- Buscar SOLO en el container relevante
SELECT * FROM paola_knowledge
WHERE container_tag = ? AND is_latest = 1 AND is_active = 1;
```

### Niveles de Container

| Nivel | Ejemplo | Uso |
|-------|---------|-----|
| Organismo | `codelco`, `enami` | Datos del mandante |
| Licitación | `ca_12345` | Requisitos, plazos, bases de una CA |
| Categoría | `valvulas`, `cobre` | Conocimiento de producto |
| Global | `mcco_internal` | Reglas de negocio, preferencias |

---

## 4. Anti-Loop (OpenSpace)

Mecanismos para evitar ciclos infinitos de evolución de knowledge:

### Cooldown post-evolución
```python
# Knowledge recién evolucionado: times_selected = 0
# Requiere min_selections = 5 datos frescos antes de re-evaluar
if entry.times_selected < MIN_SELECTIONS_BEFORE_REEVAL:
    skip_evaluation(entry)
```

### Guard de degradación
```python
# Dict de "ya procesado" por trigger
_addressed = {}  # {trigger_key: set(knowledge_ids)}

# Cuando el trigger se resuelve, limpiar para permitir re-evaluación futura
def on_trigger_resolved(trigger_key):
    _addressed.pop(trigger_key, None)
```

### Límites duros
- Max 5 iteraciones de evolución por entry
- Max 3 reintentos de parche
- Confirmación LLM obligatoria antes de evolucionar (los umbrales proponen, el LLM dispone)

---

## 5. Auto-Expiración (supermemory)

```sql
ALTER TABLE paola_knowledge ADD COLUMN is_static INTEGER DEFAULT 0;
ALTER TABLE paola_knowledge ADD COLUMN forget_after TEXT;  -- ISO date

-- Hechos estáticos (preferencias, certificaciones): is_static = 1, sin expiración
-- Hechos episódicos (plazos, reuniones): is_static = 0, forget_after = fecha

-- Limpiar expirados periódicamente:
UPDATE paola_knowledge SET is_active = 0
WHERE forget_after IS NOT NULL AND forget_after < date('now');
```

---

## 6. Diffs Incrementales (claude-subconscious)

NO reenviar toda la memoria en cada invocación LLM. Primera invocación envía bloques completos; las siguientes envían solo deltas (`+`/`-`). Formato XML liviano:

```xml
<memoria tipo="proveedor" confianza="0.85" status="modified">
- Proveedor X: precio base $5.000/kg
+ Proveedor X: precio actualizado $4.800/kg (descuento volumen)
</memoria>
```

---

## 7. Perfil Estático vs Dinámico (supermemory)

| Tipo | Contenido | Expiración |
|------|-----------|------------|
| **Estático** | RUT empresa, certificaciones, experiencia, capacidades | Nunca (hasta contradicción) |
| **Dinámico** | Licitación activa, plazos próximos, estado de proceso | Auto-expira por `forget_after` |

Doble timestamp:
- `document_date`: Cuándo se registró el hecho
- `event_date`: Cuándo ocurre/ocurrió el evento referido

---

## 8. Carga Jerárquica de Contexto (OpenViking)

Cargar contexto gradualmente para reducir tokens. Tres niveles:

| Nivel | Contenido | Tokens aprox. | Cuándo usar |
|-------|-----------|---------------|-------------|
| L0 (Abstract) | Sumario 1-2 líneas | ~20 | Listados, filtros rápidos |
| L1 (Overview) | Campos clave estructurados | ~500 | Categorización, priorización |
| L2 (Full Read) | Documento completo | ~2000+ | Decisiones, análisis profundo |

```python
def cargar_contexto(ca_id: str, nivel: str = "L1") -> dict:
    """Carga contexto de CA al nivel apropiado."""
    queries = {
        "L0": "SELECT id, titulo, organismo, presupuesto FROM cas WHERE id = ?",
        "L1": "SELECT id, titulo, organismo, presupuesto, region, fecha_cierre, requisitos_resumen FROM cas WHERE id = ?",
        "L2": "SELECT * FROM cas WHERE id = ?",
    }
    return db.execute(queries[nivel], (ca_id,)).fetchone()
```

### Regla de Selección de Nivel

```
¿El agente toma una decisión sobre esta CA? → L2
¿El agente filtra/categoriza? → L1
¿Solo necesita listar? → L0
```

---

## 9. Compresión Automática de Sesiones (OpenViking)

Para agentes que procesan muchas CAs en batch: al finalizar, comprimir historial via LLM, extraer hechos discretos con timestamps, persistir como entries con `container_tag` del batch, y limpiar contexto. Usar `forget_after` de 30 días para summaries de sesión. El decay automático (cada 60 min) marca entries expirados como `is_active = 0`.

---

## Roadmap — Patrones para Escalar

> Estos patrones aplican cuando MCCO procese 500+ CAs/año o tenga 3+ developers.

### Arquitectura LLM Wiki (Karpathy)

Fuente: gist.github.com/karpathy — patrón donde el LLM mantiene un wiki estructurado.

**Tres capas**: Raw (fuentes inmutables: PDFs, exports), Wiki (páginas markdown generadas por LLM), Schema (configuración humana). El vault de Obsidian MCCO ya sigue esta arquitectura: `00-INBOX/` = raw, `04-CONOCIMIENTO/` = wiki, `07-CLAUDE/` = schema.

**Tres operaciones**: Ingest (incorporar fuente nueva, actualizar páginas afectadas), Query (buscar en index, sintetizar con citas a raw), Lint (auditoría periódica: contradicciones, entries huérfanos, datos stale).

Escala hasta ~100 fuentes sin vector search.

### Anti-Sycophancy (ai-2027)

Los modelos tienden a producir resultados que "se ven bien" en vez de verdaderos. Un A7 sycophantic podría inflar confianza o justificar decisiones malas post-hoc.

**Mitigación principal — Debate technique**: framings opuestos en vez de self-critique genérica:

```python
pro = llm_call(system=PRO_FRAMING, user=ca_context)
con = llm_call(system=CON_FRAMING, user=ca_context)
decision = llm_call(system=JUDGE_FRAMING, user=f"PRO:\n{pro}\n\nCON:\n{con}")
```

Complementar con: métricas objetivas post-decisión (comparar predicciones vs resultados reales) y honeypot testing (ver `prompt-testing.md`).
