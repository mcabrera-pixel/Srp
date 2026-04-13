# Multi-Agent System Rules — MCCO

Fuente: supermemory, OpenSpace, claude-peers, autoresearch, deer-flow (58.2k), deepagents (19.4k), open-swe (9.2k).
Para memoria avanzada ver: `memory-knowledge.md` | Para specs de agentes ver: `agent-specification.md`

## 1. Agent Base Class Contract

- Todo agente DEBE heredar de `BaseAgent` (agents/base.py)
- Obligatorio implementar: `run(ca)` y definir atributo `name`
- Proporcionado por BaseAgent: `get_cola`, `update_status`, `llm_call`, `remember`, `recall`, `read_messages`, `send_message`
- `execute()` es el entry point del scheduler — no sobreescribir, extender `run()`
- CLI: `python -m agents.<agent_id> --limit N`

## 2. Memory System (supermemory + OpenSpace)

- Entries usan `is_latest=True` + cadena `parent_id` para resolucion temporal — nunca borrar, solo superseder
- 4 contadores atomicos: `times_selected`, `times_applied`, `times_helped`, `times_failed`
- Metrica derivada: `reliability = times_helped / times_selected`
- Auto-desactivar entries con `reliability < 0.3` despues de 5+ usos
- Detectar contradicciones al escribir: antes de `remember()`, buscar entries similares y validar con LLM
- Categorias: `fact`, `heuristic`, `skill`, `supplier`, `result`
- `recall()` filtra por `is_latest=True AND is_active=True`, ordena por recencia + reliability

## 3. Inter-Agent Communication (claude-peers)

- Todos los mensajes usan schemas tipados — prohibido texto libre entre agentes
- Campos: `from_agent`, `to_agent`, `type`, `payload` (JSON), `ca_id`, `created_at`
- Tipos: `REQUEST_PRICE`, `PRICE_RESULT`, `DECISION`, `RESULT_FEEDBACK`, `ALERT`
- Cada agente publica estado a D1 en cambio: `idle | processing | waiting | error`
- Mensajes son read-once: marcar `read=True` inmediatamente despues de leer
- Rutear todo via Worker API (`/api/agent-comms`) — sin llamadas directas entre agentes

## 4. Orchestration (scheduler.py)

- Respetar dependencias: A7 solo se encola despues de que A3 marca CA como `precios_ok`
- Dos agentes NO pueden procesar la misma CA concurrentemente — usar campo `claimed_by` en D1
- Dead letter queue: despues de 3 fallos, mover CA a `estado=bloqueado` y alertar Supervisor
- Timeout hard por agente (configurable, default 5 min); Supervisor mata y re-encola
- Scheduler loguea cada trigger con: agent_name, CA count, duracion, success rate

## 5. Feedback Loop (autoresearch)

- Toda decision de A7 se persiste con contexto completo: CA id, producto, precio_oferta, costos, reasoning
- Cuando llega resultado (ganada/perdida), Worker auto-envia `RESULT_FEEDBACK` a A7
- A7 llama `reflect(decision_id, outcome)` al recibir — actualiza contadores de reliability
- `reflect()` corre un pase LLM: "Dado esta decision y resultado, que haria diferente?"
- Output de reflexion se guarda como nuevo entry `heuristic`, vinculado via `parent_id`
- Feedback loop debe completarse en 24h; Supervisor alerta si se pasa

## 6. Auto-Adjust (OpenSpace)

- Cada agente trackea metricas semanales: win_rate, avg_margin, response_time, error_rate
- Parametros ajustables por agente: A7 temperature, A3 search depth, A4 retry wait
- Trigger: metrica se desvia > 15% del baseline rolling 4 semanas
- Magnitud: pasos pequeños (temperature ±0.05, depth ±1)
- Todos los ajustes logueados en D1: param_name, old_value, new_value, trigger_metric, timestamp
- Cooldown: minimo 24h entre ajustes al mismo parametro
- Hard bounds en codigo — auto-adjust NO puede sobreescribir constantes de reglas de negocio

## 7. Container Tags (supermemory)

- Aislar memoria por contexto: licitación, organismo, categoría
- NUNCA mezclar conocimiento entre CAs distintas sin container tag
- Niveles: `global` (reglas MCCO), `organismo` (CODELCO), `ca` (ca_12345), `categoria` (válvulas)
- Ver implementación completa en `memory-knowledge.md`

## 8. Scoping de Comunicación (claude-peers)

- 3 niveles: `pipeline` (todos los agentes), `stage` (agentes del mismo paso), `direct` (punto a punto)
- Cada agente publica `summary` de qué está haciendo — visible en `list_peers`
- Mensajes son read-once: marcar `consumed_at` inmediatamente después de leer
- Limpieza proactiva: si un agente no actualiza `last_heartbeat` en 60s, marcarlo inactivo

## 9. Roadmap — Orquestación Avanzada

> Estos patrones aplican cuando MCCO escale a 20+ agentes o requiera replay/checkpointing.

**StateGraph (deepagents/LangGraph):** Máquina de estados con checkpoints automáticos y replay. Referencia para evolucionar scheduler.py cuando las dependencias lineales no basten.

**Sub-Agentes Aislados (deer-flow):** Ejecución en sandbox (Docker/proceso separado), contexto del padre NO se hereda completo. Útil para prevenir contaminación entre agentes pesados.

**Compactación Automática (deepagents):** SummarizationMiddleware que comprime contexto reteniendo últimos 10%. Para flujos multi-fase largos.

**Multi-Canal (open-swe):** Disparar agentes desde Slack, WhatsApp, GitHub. Mensajes posteriores rutean al mismo agente.

## 10. Especificación de Agentes (agency-agents)

Todo agente DEBE tener archivo de especificación en `agents/specs/`.
Ver formato completo en `agent-specification.md`.
