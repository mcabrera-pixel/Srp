# Scraping & Automation — Estándares MCCO

Fuente: lightpanda (27.3k stars), MoneyPrinterV2 (28.5k stars).

Patrones para scraping de portales públicos y automatización de procesos.

---

## 1. Lightpanda — Referencia para Optimización Futura

Browser headless en Zig, 11x más rápido que Chrome, 16x menos memoria.
Compatible CDP (Chrome DevTools Protocol) — migración sin cambios de código.

> Referencia para optimización futura. Hoy MCCO usa Playwright/Selenium estándar.

### Cuándo Considerar Migración

| Escenario | Lightpanda | Chrome headless |
|-----------|------------|-----------------|
| Scraping HTML + JS dinámico | Si | Si |
| 10+ scrapers concurrentes | Si (16x menos RAM) | Costoso en RAM |
| Captura de screenshots | No | Si |
| Renderizado CSS/layout | No | Si |
| MercadoPublico.cl | Si (AJAX funciona) | Si |
| Sitios con captcha visual | No | Si (con solver) |

---

## 2. Patrones de Scraping MCCO

### Rate Limiting Obligatorio

```python
import time
import random

class ScraperBase:
    MIN_DELAY = 2.0  # segundos entre requests
    MAX_DELAY = 5.0
    MAX_CONCURRENT = 3  # máximo scrapers simultáneos

    def delay(self):
        """Delay aleatorio para no saturar el portal."""
        time.sleep(random.uniform(self.MIN_DELAY, self.MAX_DELAY))
```

### Retry con Backoff (usar tenacity)

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=2, min=2, max=30))
def fetch_page(url: str) -> str:
    response = client.get(url, timeout=30)
    response.raise_for_status()
    return response.text
```

### Estructura de Datos Scraped

```python
# Formato estándar para CAs scraped
CA_SCHEMA = {
    "id": str,           # ID de MercadoPublico
    "titulo": str,
    "organismo": str,
    "region": int,        # 1-16
    "presupuesto": int,   # CLP entero
    "fecha_cierre": str,  # ISO 8601
    "estado": str,        # enum: activa, cerrada, adjudicada
    "url": str,
    "scraped_at": str,    # ISO 8601 con timezone Chile
}
```

---

## 3. Automatización Multi-Canal (MoneyPrinterV2)

Patrón de canales plug-and-play aplicable a comunicación de agentes:

### Clase Base de Canal

```python
from abc import ABC, abstractmethod

class CanalBase(ABC):
    """Base para canales de comunicación (Email, WhatsApp, etc.)."""

    @abstractmethod
    def enviar(self, destinatario: str, mensaje: dict) -> dict:
        """Enviar mensaje. Retorna {"ok": True/False, ...}."""

    @abstractmethod
    def verificar_estado(self) -> bool:
        """Healthcheck del canal."""
```

### Registro de Canales

```python
CANALES = {}

def registrar_canal(nombre: str, canal: CanalBase):
    CANALES[nombre] = canal

def enviar_por_canal(nombre: str, destinatario: str, mensaje: dict) -> dict:
    if nombre not in CANALES:
        return {"ok": False, "error": f"Canal {nombre} no registrado"}
    return CANALES[nombre].enviar(destinatario, mensaje)
```

---

## 4. Scheduling

En producción, preferir systemd timers sobre scheduling in-process (ver `cli-standards.md`).

```bash
# /etc/systemd/system/mcco-scraper.timer
# Scraping de nuevas CAs cada 30 minutos
[Timer]
OnCalendar=*:0/30
Persistent=true
```

Para tareas internas del daemon (healthcheck, limpieza DLQ), usar `schedule` como fallback:

```python
import schedule

schedule.every(10).minutes.do(check_pipeline_health)
schedule.every(1).hours.do(process_dlq)
```
