# RAG Patterns — Estándares MCCO

Fuente: onyx (25k stars), OpenViking (21.2k stars).

Patrones de Retrieval Augmented Generation para búsqueda sobre documentos de licitaciones.

---

## 1. Búsqueda Híbrida (Vector + Keyword)

NUNCA usar solo búsqueda vectorial. Combinar con keywords para no perder términos exactos:

```
Estrategia Dual:
├── Vectorial: Embeddings para similitud semántica ("requisitos de entrega")
├── BM25/Keyword: Coincidencia exacta de términos ("ISO 9001", "RUT", "UF")
└── Reranking: Modelo liviano ordena resultados combinados
```

### Por Qué Híbrido

| Tipo búsqueda | Encuentra bien | Pierde |
|---------------|----------------|--------|
| Solo vectorial | "capacidad de entrega" ≈ "plazo de despacho" | "ISO 9001" exacto |
| Solo keyword | "ISO 9001" exacto | Sinónimos, paráfrasis |
| Híbrido | Ambos | Nada significativo |

### Implementación con Onyx (self-hosted)

```python
import requests

def buscar_licitacion(query: str, collection: str = "licitaciones") -> list:
    """Búsqueda híbrida sobre documentos de licitación."""
    response = requests.post(
        "http://localhost:8080/api/search",
        json={
            "query": query,
            "collection": collection,
            "mode": "agentic",
            "expand_queries": True,
            "rerank": True
        },
        headers={"Authorization": f"Bearer {ONYX_TOKEN}"},
        timeout=10
    )
    response.raise_for_status()
    return response.json().get("documents", [])
```

---

## 2. Agentic RAG (Decisión Automática de Búsqueda)

Para queries complejas, el agente descompone automáticamente:

```
Query: "¿Qué empresa cumple todos los requisitos de esta licitación?"

Descomposición automática:
├── Sub-query 1: "requisitos técnicos licitación X"
├── Sub-query 2: "certificaciones requeridas"
├── Sub-query 3: "experiencia mínima exigida"
└── Síntesis: Combina resultados + identifica gaps
```

### Patrón para Agentes MCCO

```python
def busqueda_agentica(ca_id: str, pregunta: str) -> dict:
    """Busca información relevante descomponiendo la pregunta."""
    # Paso 1: Descomponer pregunta
    sub_preguntas = llm_call(
        system="Descompón esta pregunta en 2-4 sub-preguntas específicas.",
        user=pregunta,
        temperature=0.1
    )

    # Paso 2: Buscar cada sub-pregunta
    resultados = []
    for sp in sub_preguntas:
        docs = buscar_licitacion(sp, collection=f"ca_{ca_id}")
        resultados.extend(docs[:3])  # Top 3 por sub-pregunta

    # Paso 3: Sintetizar con contexto
    respuesta = llm_call(
        system="Responde basándote SOLO en los documentos proporcionados.",
        user=f"Pregunta: {pregunta}\n\nDocumentos:\n{format_docs(resultados)}",
        temperature=0.1
    )
    return {"respuesta": respuesta, "fuentes": resultados}
```

---

## 3. Context Database (OpenViking)

### Jerarquía L0/L1/L2

Cargar contexto gradualmente para reducir tokens:

| Nivel | Contenido | Tokens aprox. |
|-------|-----------|---------------|
| L0 (Abstract) | Sumario 1-2 líneas generado por IA | ~20 |
| L1 (Overview) | Descripción estructurada con campos clave | ~500 |
| L2 (Full Read) | Contenido completo del documento | ~2000+ |

```python
# Patrón de carga gradual para agentes
def cargar_contexto_ca(ca_id: str, nivel: str = "L1") -> dict:
    """Carga contexto de CA al nivel apropiado."""
    if nivel == "L0":
        return db.execute(
            "SELECT id, titulo, organismo, presupuesto FROM cas WHERE id = ?",
            (ca_id,)
        ).fetchone()
    elif nivel == "L1":
        return db.execute(
            "SELECT id, titulo, organismo, presupuesto, region, "
            "fecha_cierre, requisitos_resumen FROM cas WHERE id = ?",
            (ca_id,)
        ).fetchone()
    else:  # L2
        return db.execute(
            "SELECT * FROM cas WHERE id = ?",
            (ca_id,)
        ).fetchone()
```

### Regla de Selección de Nivel

```
¿El agente necesita tomar una decisión sobre esta CA?
  → Sí: L2 (contexto completo)
  → No: ¿Necesita filtrar/categorizar?
    → Sí: L1 (overview)
    → No: L0 (abstract — solo para listados)
```

---

## 4. Procesamiento de PDFs de Licitación

### Chunking Recomendado

```python
def chunk_pdf(text: str, chunk_size: int = 1000, overlap: int = 200) -> list:
    """Dividir PDF en chunks con overlap para mantener contexto."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append({
            "content": chunk,
            "start_char": start,
            "end_char": end
        })
        start = end - overlap
    return chunks
```

### Metadatos Obligatorios por Chunk

```python
CHUNK_METADATA = {
    "source": str,       # "bases_licitacion_12345.pdf"
    "ca_id": str,        # "12345"
    "page": int,         # Página del PDF
    "section": str,      # "requisitos_tecnicos", "bases_administrativas"
    "organismo": str,
    "fecha_documento": str,  # ISO 8601
    "indexed_at": str,       # ISO 8601
}
```

---

## 5. Deployment

### MVP: qmd + SQLite (equipo pequeno, <500 documentos)

Busqueda local sobre markdown con BM25 + vector + re-ranking LLM. Sin Docker ni infra externa.
Ver configuracion en `tools-ecosystem.md` (seccion qmd).

### Produccion: Onyx (>500 documentos, equipo creciendo)

Self-hosted RAG con 50+ conectores. Requiere: Docker, 4GB+ RAM, 50GB storage.

### Conectores Relevantes para MCCO

| Conector | Uso |
|----------|-----|
| File Upload | PDFs de bases de licitacion |
| Google Drive | Documentos compartidos del equipo |
| Google Sheets (gspread) | Datos de proveedores y precios |
| Email (IMAP) | Correspondencia con proveedores |
| REST API | Integracion con MercadoPublico |

---

## 6. Anti-Patterns

| NO hagas esto | HAZ esto |
|---------------|----------|
| Solo búsqueda vectorial | Híbrido vector + keyword |
| Chunks sin metadata | Siempre incluir source, ca_id, page |
| Cargar todo el contexto siempre | Jerarquía L0/L1/L2 según necesidad |
| Indexar sin limpiar | Sanitizar PII antes de indexar |
| Un solo índice para todo | Colecciones por CA o por tipo |
