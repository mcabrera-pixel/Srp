# LLM Integration Rules — MCCO Multi-Agent Projects

Patterns derived from hermes-agent (18.1k stars), autoresearch (61.5k stars), claude-subconscious (2.3k stars).

## 1. Business Rules in Code, Not Prompts

- Critical constraints (margin minimum 15%, region 13 only, budget >= $500K CLP) MUST be enforced in Python code after LLM output
- Prompts guide behavior; code enforces hard limits
- Never trust LLM output blindly — always run output through validation layer
- If LLM violates a rule, code rejects and falls back; do not retry the same prompt

## 2. JSON Output Validation

- Always wrap `json.loads()` in try/except — never assume valid JSON
- Strip markdown fences (` ```json `) and `<think>` tags before parsing
- Define expected schema explicitly; validate all required fields exist before use
- On malformed response: log raw output, apply fallback default, never crash
- Example pattern:
  ```python
  raw = llm_response.strip().removeprefix("```json").removesuffix("```")
  try:
      data = json.loads(raw)
      assert "precio" in data and "confianza" in data
  except Exception:
      data = FALLBACK_DEFAULTS
  ```

## 3. Multi-Pass Pattern (from autoresearch + ai-2027 debate technique)

- Use only for high-stakes decisions: pricing offers, supplier selection
- Pass 1 — Quick decision: low temperature (0.2), fast, structured output
- Pass 2 — Self-critique: "Find 3 problems or risks with this decision"
- Pass 3 — Final: incorporate critique, produce revised decision
- For routine tasks (categorization, status updates) single-pass is sufficient
- Log all 3 passes to D1 for audit

### Debate Technique (ai-2027)

Para decisiones de alto impacto, usar framings opuestos en vez de self-critique genérica:

```python
# En vez de: "Critica esta decisión" (el modelo tiende a ser suave consigo mismo)
# Usar: framings explícitamente adversariales

pro = llm_call(system="Argumenta POR QUÉ deberíamos ofertar esta CA. Sé convincente.", user=context)
con = llm_call(system="Argumenta POR QUÉ NO deberíamos ofertar. Encuentra todos los riesgos.", user=context)
decision = llm_call(system="Dado argumentos a favor y en contra, decide objetivamente.", 
                    user=f"A FAVOR:\n{pro}\n\nEN CONTRA:\n{con}\n\nDatos:\n{context}")
```

Ventaja: reduce sycophancy (tendencia del modelo a confirmar su propia decisión inicial).
Referencia: ai-2027 documenta que modelos avanzados producen resultados que "se ven bien"
en vez de resultados verdaderos. El debate fuerza evaluación genuinamente adversarial.

## 4. Whisper Mode / Context Injection (from claude-subconscious)

- Inject historical context as XML blocks appended after the main prompt
- Hard cap: 500 tokens of injected context total
- Format: `<memoria tipo="proveedor" confianza="0.85">content</memoria>`
- Types: `proveedor`, `categoria`, `decision`, `regla`, `skill`
- Do not let injected context dominate the prompt — main instruction comes first
- Filter to top-3 most relevant memories by similarity score before injecting

## 5. Skill Generation (from hermes-agent)

- Include `SKILL_NUDGE` in system prompts for agents that learn (A7, Trainer)
- Agent can persist reusable heuristics via `remember(category='skill')`
- Skills must show reliability >= 0.7 (times_helped / times_selected) before promotion
- Validate skill usefulness by comparing outcomes with vs. without skill applied
- Skills are reviewed by Curador agent weekly; low-confidence skills are pruned

## 6. Fallback Chain

Order on LLM failure or invalid output:
1. Primary LLM (MiniMax M2.7)
2. Retry once with simplified prompt
3. Use cached response from last successful run (if < 24h old)
4. Apply hard-coded default / escalate to Supervisor alert
- Never raise an unhandled exception to the scheduler — always return a result or status
- Log each fallback step with reason for post-mortem analysis
