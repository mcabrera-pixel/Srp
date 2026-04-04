# NLM Daemon 🤖

Daemon autónomo que usa **Claude Code headless + NotebookLM MCP** para generar contenido de capacitación minera 24/7.

## Cómo funciona

```
[Worker API] → poll job → [Claude Code -p] → [MCP] → [NotebookLM] → [R2 Storage]
```

1. El daemon consulta la API por el próximo job pendiente
2. Lee el documento asociado al job
3. Se lo pasa a Claude Code en modo headless (`claude -p`)
4. Claude Code usa MCP de NotebookLM nativamente
5. El resultado se sube a R2 y se actualiza el job

## Quick Start (Local)

```bash
# 1. Verificar que Claude Code está instalado
claude --version

# 2. Verificar NotebookLM auth
nlm login --check

# 3. Test rápido del pipeline
./test-pipeline.sh documento.md

# 4. Correr daemon en modo continuo
./daemon.sh
```

## Estructura

```
nlm-agent/
├── daemon.sh              # Loop principal del daemon
├── process-job.sh         # Procesa un job individual
├── test-pipeline.sh       # Test local del pipeline
├── prompts/
│   ├── generate-video.md  # Prompt template: video
│   ├── generate-audio.md  # Prompt template: audio
│   └── generate-infographic.md
├── deploy/
│   ├── nlm-daemon.service # Systemd unit
│   └── setup-vm.sh        # Setup VM
├── input/                 # Documentos a procesar (modo local)
├── output/                # Contenido generado (modo local)
└── logs/                  # Logs del daemon
```

## Configuración

El daemon usa variables de entorno (ver `.env.example`):

| Variable | Default | Descripción |
|---|---|---|
| `API_BASE_URL` | `http://localhost:8787` | URL del Worker API |
| `API_TOKEN` | — | Token de auth para el API |
| `POLL_INTERVAL` | `30` | Segundos entre polls |
| `MODE` | `local` | `local` (input/) o `api` (Worker API) |
