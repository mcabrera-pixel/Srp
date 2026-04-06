# Plan: Aplicar MCCO Standards v2.1 a SRP Suite

Fecha: 2026-04-06
Fuente: MCCO Engineering Standards v2.1 (31 repos analizados)
Perfil: AGENT (18 reglas)
Estado actual: 0/18 reglas, ~30 tests (solo Python), desarrollo activo

---

## Fase S0 — Inmediato (1 sesion)

### S0.1: Crear estructura `.claude/`
- Perfil AGENT: copiar las 18 reglas a `.claude/rules/`
- Crear `CLAUDE.md` adaptado a SRP

### S0.2: Fixes de seguridad criticos
1. **Auth middleware en Express** — Bearer token en endpoints mutantes
2. **CORS whitelist** — Agregar middleware (no wildcard)
3. **Rate limiting** — express-rate-limit en endpoints publicos
4. **Validacion de input** — zod o joi para schemas
5. **Sanitizacion prompt injection** — XML tags para datos WhatsApp/Vision → LLM
6. **Timeout en Wasender fetch** — AbortController 30s
7. **Token auth → httpOnly cookies**

### S0.3: Pinear dependencias

---

## Fase S1 — Esta semana (2-3 sesiones)

### S1.1: Error handling centralizado en Express
### S1.2: Fallback chain LLM + circuit breaker
### S1.3: Agent specs (4 agentes)
### S1.4: Schema validation post-LLM

---

## Fase S2 — Proxima semana

### S2.1: Tests vitest del backend Express
### S2.2: CI/CD GitHub Actions
### S2.3: promptfoo para prompts de procedimientos mineros
### S2.4: Health check `/health/ready`

---

## Brechas vs Iron Laws

| Iron Law | Estado | Fix |
|---|---|---|
| 1. No SQL sin parametros | CUMPLE | — |
| 2. No codigo sin test | PARCIAL | S2.1 |
| 3. No secretos en codigo | CUMPLE | — |
| 4. No LLM sin validacion | PARCIAL | S1.4 |
| 5. No timeout infinito | PARCIAL | S0.2 |
| 6. No fix sin root cause | N/A | — |

---

## Herramientas v2.1 por impacto

| Herramienta | Impacto | Fase |
|---|---|---|
| 18 reglas AGENT | Alto | S0 |
| Auth + CORS + rate limit | Alto | S0 |
| Prompt injection defense | Alto | S0 |
| Error handling | Medio | S1 |
| Fallback chain + CB | Medio | S1 |
| Agent specs | Medio | S1 |
| Tests vitest | Medio | S2 |
| promptfoo procedimientos | Medio | S2 |
| GitHub Actions CI | Medio | S2 |
