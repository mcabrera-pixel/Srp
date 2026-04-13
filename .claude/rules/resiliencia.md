# Resiliencia MCCO — Estandares de Ingenieria

## 1. Retry Pattern (OBLIGATORIO en todos los HTTP calls)

Usar `tenacity` para cualquier llamada HTTP externa.

```python
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception

RETRY_EXCEPTIONS = (ConnectionError, TimeoutError)

def _is_retryable_http(exc):
    import httpx
    if isinstance(exc, httpx.HTTPStatusError):
        return exc.response.status_code in (429, 500, 501, 502, 503)
    return isinstance(exc, RETRY_EXCEPTIONS)

@retry(
    stop=stop_after_attempt(4),
    wait=wait_exponential(multiplier=1, min=1, max=8),
    retry=retry_if_exception(_is_retryable_http),
    reraise=True,
)
def http_get(url, **kwargs):
    return client.get(url, **kwargs)
```

- Backoff: 1s → 2s → 4s → 8s (max 4 intentos)
- Reintentar en: `ConnectionError`, `TimeoutError`, HTTP 429, 500-503
- NO reintentar en: HTTP 400, 401, 403, 404 (fallo permanente)

## 2. Circuit Breaker (para dependencias criticas)

Aplicar en: Worker API, LLM, MercadoPublico, MeLi.

```python
from collections import defaultdict
import time

_failures = defaultdict(int)
_opened_at = {}

def circuit_call(dep_name: str, fn, *args, threshold=5, cooldown=60, **kwargs):
    now = time.time()
    if dep_name in _opened_at:
        if now - _opened_at[dep_name] < cooldown:
            raise RuntimeError(f"Circuit abierto: {dep_name}")
        else:
            _failures[dep_name] = 0  # half-open: intentar
            del _opened_at[dep_name]
    try:
        result = fn(*args, **kwargs)
        _failures[dep_name] = 0
        return result
    except Exception as e:
        _failures[dep_name] += 1
        if _failures[dep_name] >= threshold:
            _opened_at[dep_name] = now
        raise
```

- Abrir circuito: 5 fallos consecutivos
- Half-open: 60s de cooldown, luego un intento de prueba
- Circuito abierto: rechazar llamadas inmediatamente sin tocar la dependencia

## 3. Timeouts (no negociables)

| Contexto | Timeout |
|----------|---------|
| HTTP externo (MeLi, Serper, etc.) | 30s |
| Worker API interno | 10s |
| LLM (MiniMax M2.7) | 60s |
| D1 / base de datos | 5s |

Usar siempre `httpx.Client` o `httpx.AsyncClient` con timeout explicito:

```python
import httpx
client = httpx.Client(timeout=30.0)          # HTTP externo
internal_client = httpx.Client(timeout=10.0) # Worker API
```

NUNCA usar `requests` sin timeout. NUNCA usar `timeout=None`.

## 4. Graceful Degradation

- Motor de precios falla → retornar `[]`, loguear warning, continuar con otros motores
- LLM falla → usar respuesta cacheada o default, NO bloquear pipeline
- Worker API falla → encolar operacion localmente, reintentar luego
- NUNCA dejar que el fallo de un agente mate el pipeline completo
- Cada `run(ca)` debe tener `try/except` que capture y loguee, retornando estado `"error"` en lugar de propagar

```python
def run(self, ca):
    try:
        return self._run_interno(ca)
    except Exception as e:
        self.logger.error(f"[{self.nombre}] fallo CA {ca['id']}: {e}", exc_info=True)
        return {"status": "error", "error": str(e)}
```

## 5. Dead Letter Queue (DLQ)

Operaciones fallidas no se descartan: van a la DLQ.

- Cola local (lista en memoria o archivo JSON) para operaciones que fallaron tras todos los reintentos
- Reintentar desde DLQ con backoff: 1min → 5min → 15min
- Despues de 3 reintentos desde DLQ → marcar como `permanent_failure` y enviar alerta
- El Supervisor lee la DLQ cada 10 min y emite alertas si hay entradas

```python
DLQ = []  # o persistir en data/dlq.json

def enqueue_dlq(op: dict, error: str):
    op["dlq_retries"] = op.get("dlq_retries", 0) + 1
    op["last_error"] = error
    if op["dlq_retries"] > 3:
        alert(f"Fallo permanente: {op}")
        return
    DLQ.append(op)
```

## 6. Roadmap — Decision Ratchet

> Aplica cuando MCCO tenga historial de 100+ decisiones con resultados.

Registrar cada decision con estrategia y resultado. Solo avanzar si la metrica mejora >= 5%.
Requiere: tabla `agent_decisions` en D1, historial persistente, funcion de evaluacion inmutable.

Ver detalle completo en `memory-knowledge.md` (contadores atomicos) y `multi-agent.md` (feedback loop).
