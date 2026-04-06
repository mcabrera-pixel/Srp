# SRP Vision — RAG Service

Microservicio RAG multimodal basado en RAG-Anything para procedimientos de mantención minera.

## Setup

```bash
cd services/rag

# Crear entorno virtual
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Configurar
cp .env.example .env
# Editar .env con tus API keys
```

## Uso

### 1. Levantar el servicio
```bash
python server.py
# Corre en http://localhost:8100
```

### 2. Ingestar procedimientos CODELCO
```bash
# Todos los procedimientos + riesgos fatales
python ingest_procedures.py --include-risks

# Solo un archivo
python ingest_procedures.py --file "../../srp-suite-main/docs/procedimientos/SIGO y otros/PRO.0908.MPER1 (1).pdf"
```

### 3. Consultar
```bash
# Query de texto
curl -X POST http://localhost:8100/query \
  -H "Content-Type: application/json" \
  -d '{"query": "procedimiento aislacion y bloqueo CAEX 930E"}'

# Health check
curl http://localhost:8100/health
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /status | Estado del RAG (docs, modelos) |
| POST | /ingest | Ingestar un archivo (multipart) |
| POST | /ingest/folder | Ingestar toda una carpeta |
| POST | /query | Búsqueda de texto |
| POST | /query_multimodal | Búsqueda con imagen + texto |

## Integración con SRP Vision

El backend Node.js consulta este servicio automáticamente:
- Al iniciar una sesión de visión → busca SOPs del equipo
- Cuando el técnico hace una pregunta → busca contexto específico
- Graceful degradation: si el RAG no está disponible, funciona sin contexto

Variable de entorno en el backend: `RAG_SERVICE_URL=http://localhost:8100`
