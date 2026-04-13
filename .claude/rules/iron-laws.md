# Iron Laws — Reglas Inquebrantables MCCO

Fuente: superpowers/obra (124k stars). Estas leyes NO admiten excepciones.
Cada una incluye una tabla de racionalizaciones que el agente DEBE rechazar.

---

## Iron Law 1: NO SQL SIN PARÁMETROS

```
SIEMPRE: cursor.execute("SELECT * FROM t WHERE id = ?", (id,))
NUNCA:   cursor.execute(f"SELECT * FROM t WHERE id = '{id}'")
```

| Excusa | Realidad |
|--------|----------|
| "Es solo una query interna" | SQL injection no distingue interno de externo |
| "El valor viene de otro agente, es seguro" | Los agentes procesan input de usuarios indirectamente |
| "Es solo para debug/testing" | Code review no distingue contexto, va a producción |

---

## Iron Law 2: NO CÓDIGO SIN TEST

Todo PR incluye tests que cubren el cambio. Sin excepción.

| Excusa | Realidad |
|--------|----------|
| "Es un cambio trivial" | Los cambios triviales se rompen con frecuencia |
| "Lo testeo después" | Tests post-implementación pasan automáticamente — no prueban nada |
| "Ya lo probé manualmente" | Testing manual no es repetible ni entra al CI |
| "Es solo un fix de typo" | Si modifica comportamiento, necesita test |

---

## Iron Law 3: NO SECRETOS EN CÓDIGO

Claves API, passwords, tokens → `.env` únicamente. `.env` en `.gitignore`. Punto.

| Excusa | Realidad |
|--------|----------|
| "Es solo para desarrollo local" | `git log` es eterno. El secreto queda en el historial |
| "Lo cambio antes del deploy" | Se te va a olvidar. Siempre se olvida |
| "Es un token temporal" | Temporal hoy, en producción mañana |

---

## Iron Law 4: NO LLM SIN VALIDACIÓN

Toda respuesta LLM pasa por `try/except` + schema check antes de usarse.

| Excusa | Realidad |
|--------|----------|
| "El modelo es muy bueno, siempre responde bien" | Los modelos alucinan. Todos. Siempre |
| "El prompt es muy específico" | Prompts específicos también generan JSON malformado |
| "Es solo categorización, no decisión crítica" | Un error de categorización propaga errores downstream |

---

## Iron Law 5: NO TIMEOUT INFINITO

Todo HTTP call tiene timeout explícito. `timeout=None` está prohibido.

| Excusa | Realidad |
|--------|----------|
| "La API es rápida, siempre responde" | Hasta que no responde y bloquea todo el pipeline 2 horas |
| "Prefiero esperar a perder la respuesta" | Prefiere reintentar con backoff a colgar un thread |
| "El LLM necesita pensar más tiempo" | 60s es suficiente. Si no responde en 60s, la respuesta no sirve |

Timeouts no negociables:

| Contexto | Timeout |
|----------|---------|
| HTTP externo | 30s |
| Worker API interno | 10s |
| LLM | 60s |
| D1 / base de datos | 5s |

---

## Iron Law 6: NO FIX SIN ROOT CAUSE

Si 3+ fixes consecutivos fallan para el mismo problema → STOP. Es problema arquitectural.

| Excusa | Realidad |
|--------|----------|
| "Ya casi lo tengo, un intento más" | Llevas 3. Es hora de pensar, no de intentar |
| "El error cambió, así que estoy avanzando" | Un error diferente no es progreso, es síntoma de otro problema |
| "No tengo tiempo para investigar root cause" | Tienes menos tiempo para 10 fixes que no funcionan |

### Protocolo de Debugging (superpowers)

```
Fase 1: Root Cause Investigation
  - Leer error COMPLETO (no saltear warnings)
  - Reproducir consistentemente
  - git diff para cambios recientes
  - Trazar datos HACIA ATRÁS en el call stack

Fase 2: Pattern Analysis
  - Encontrar código similar que SÍ funciona
  - Listar CADA diferencia entre working/broken

Fase 3: Hypothesis Testing
  - UNA hipótesis: "X causa esto porque Y"
  - Cambio MÍNIMO para testear
  - Si falla: nueva hipótesis, NO acumular fixes

Fase 4: Implementation
  - Test fallando primero → fix → verificar

ESCALACIÓN: 3+ fixes fallidos → problema arquitectural → replantear approach
```

---

## Verification Before Completion (superpowers)

Antes de declarar cualquier tarea como "lista":

1. **IDENTIFICAR** el comando que prueba tu claim
2. **EJECUTAR** el comando completo, fresco, en esta sesión
3. **LEER** la salida completa, exit codes, conteo de fallas
4. **VERIFICAR** que la salida REALMENTE confirma tu claim
5. **SOLO ENTONCES** declarar completado, citando evidencia

### Red Flags — Detenerse inmediatamente si piensas:

- "Debería funcionar ahora" → Ejecuta el comando
- "Estoy seguro de que está bien" → Confianza ≠ evidencia
- "Solo esta vez" → Sin excepciones
- "El subagente dijo que funciona" → Verificar independientemente SIEMPRE
