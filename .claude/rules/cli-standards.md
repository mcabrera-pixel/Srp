# CLI & Daemon Standards — Estándares MCCO

Fuente: CLI-Anything (26.1k), Google Workspace CLI (23.5k).

Estándares para CLIs auxiliares y daemons de agentes MCCO.
Los agentes corren como daemons systemd en GCP VMs, NO como CLIs invocados por humanos.
Estos patrones aplican a scripts auxiliares (deploy, admin, diagnóstico).

---

## 1. Flags Obligatorios para CLIs Auxiliares

### `--json` — OBLIGATORIO en todo comando

Toda salida pasa por función centralizada:

```python
def output(data, json_mode=False):
    if json_mode:
        click.echo(json.dumps(data, indent=2, default=str))
    else:
        _print_human_readable(data)
```

### `--dry-run` — OBLIGATORIO en operaciones mutantes

Cortar ejecución después de construir el request, mostrando qué se haría sin ejecutar.

---

## 2. Formato de Respuesta

- Éxito: `{"ok": true, "data": ...}`
- Error: `{"ok": false, "error": "tipo", "message": "descripción"}`

---

## 3. Manejo de Errores Centralizado

```python
def handle_error(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except FileNotFoundError as e:
            _emit_error("FileNotFoundError", str(e))
        except ValueError as e:
            _emit_error("ValueError", str(e))
        except Exception as e:
            _emit_error("UnexpectedError", str(e))
    return wrapper

def _emit_error(error_type, message):
    output({"ok": False, "error": error_type, "message": message}, json_mode=True)
    sys.exit(1)
```

---

## 4. Daemons de Agentes (systemd)

Los agentes MCCO corren como servicios systemd en GCP VMs:

```ini
# /etc/systemd/system/mcco-a7-decisor.service
[Unit]
Description=MCCO A7 Decisor Agent
After=network.target

[Service]
Type=simple
User=mcco
WorkingDirectory=/opt/mcco/paola-agent
ExecStart=/opt/mcco/venv/bin/python -m agents.a7_decisor
Restart=on-failure
RestartSec=10
Environment=PYTHONUNBUFFERED=1
EnvironmentFile=/opt/mcco/.env

[Install]
WantedBy=multi-user.target
```

- `Restart=on-failure` con `RestartSec=10` — no reiniciar en loop si hay error persistente
- `EnvironmentFile` apunta a `.env` — secretos nunca en el unit file
- Logs via `journalctl -u mcco-a7-decisor -f` — no reinventar logging
- Un servicio por agente — aislar fallos entre agentes

---

## 5. Convenciones de Nombres

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Grupo principal | Nombre del producto/proyecto | `mcco`, `paola`, `condrone` |
| Subgrupo | Dominio funcional | `pipeline`, `agent`, `worker` |
| Comando | Verbo en infinitivo | `run`, `status`, `deploy`, `list` |
| Flag booleano | `--flag-name` (kebab-case) | `--dry-run`, `--json`, `--verbose` |
| Argumento | `UPPER_CASE` | `AGENT_ID`, `CA_ID` |
| Servicio systemd | `mcco-<agent_id>.service` | `mcco-a7-decisor.service` |
