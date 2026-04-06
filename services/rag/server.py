"""
SRP Vision — RAG Service (LightRAG + Knowledge Graph)
======================================================

Microservicio RAG con Knowledge Graph para procedimientos de mantención minera.
Usa LightRAG (vector + graph hybrid) con Gemini 2.5 Flash vía OpenRouter.

Endpoints:
  POST /ingest          — Ingestar un documento (PDF, DOCX, TXT, MD)
  POST /ingest/folder   — Ingestar todos los docs de una carpeta
  POST /ingest/text     — Ingestar texto directo
  POST /query           — Búsqueda híbrida (vector + knowledge graph)
  GET  /status          — Estado del RAG
  GET  /health          — Health check

Uso:
  python server.py
"""

import asyncio
import json
import os
import logging
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")
logger = logging.getLogger("rag-service")

# ── Config ────────────────────────────────────────────────────────────────────

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
TEXT_MODEL = os.getenv("TEXT_MODEL", "google/gemini-2.5-flash-preview-05-20")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
RAG_WORKING_DIR = os.getenv("RAG_WORKING_DIR", "./rag_data")
PORT = int(os.getenv("PORT", "8100"))

# ── Document Parsing ─────────────────────────────────────────────────────────

def parse_pdf(filepath: str) -> str:
    """Extrae texto de un PDF usando PyMuPDF."""
    import fitz
    doc = fitz.open(filepath)
    text_parts = []
    for page_num, page in enumerate(doc, 1):
        text = page.get_text()
        if text.strip():
            text_parts.append(f"[Página {page_num}]\n{text}")
    doc.close()
    return "\n\n".join(text_parts)


def parse_docx(filepath: str) -> str:
    """Extrae texto de un DOCX usando mammoth."""
    import mammoth
    with open(filepath, "rb") as f:
        result = mammoth.extract_raw_text(f)
    return result.value


def parse_document(filepath: str) -> str:
    """Parsea un documento según su extensión."""
    ext = Path(filepath).suffix.lower()
    if ext == ".pdf":
        return parse_pdf(filepath)
    elif ext in (".docx", ".doc"):
        return parse_docx(filepath)
    elif ext in (".txt", ".md"):
        return Path(filepath).read_text(encoding="utf-8", errors="replace")
    else:
        raise ValueError(f"Formato no soportado: {ext}")


# ── LLM Functions for LightRAG ──────────────────────────────────────────────

async def llm_model_func(
    prompt: str,
    system_prompt: str = "",
    history_messages: list = [],
    keyword_extraction: bool = False,
    **kwargs,
) -> str:
    """LLM function compatible con LightRAG."""
    import httpx

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    for msg in history_messages:
        messages.append(msg)
    messages.append({"role": "user", "content": prompt})

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": TEXT_MODEL,
                "messages": messages,
                "max_tokens": 4000,
                "temperature": 0.1 if keyword_extraction else 0.3,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]


async def embedding_func(texts: list[str]) -> list[list[float]]:
    """Embedding function via OpenAI API."""
    import httpx
    import numpy as np

    api_key = OPENAI_API_KEY or OPENROUTER_API_KEY
    endpoint = "https://api.openai.com/v1/embeddings" if OPENAI_API_KEY else "https://openrouter.ai/api/v1/embeddings"

    # Procesar en batches de 20
    all_embeddings = []
    for i in range(0, len(texts), 20):
        batch = texts[i:i+20]
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                endpoint,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": EMBEDDING_MODEL,
                    "input": batch,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            embeddings = [item["embedding"] for item in data["data"]]
            all_embeddings.extend(embeddings)

    return np.array(all_embeddings)


# ── LightRAG Instance ───────────────────────────────────────────────────────

rag_instance = None
ingested_docs: list[dict] = []  # Track de documentos ingestados


async def get_rag():
    """Lazy init del LightRAG instance."""
    global rag_instance
    if rag_instance is not None:
        return rag_instance

    from lightrag import LightRAG
    from lightrag.utils import EmbeddingFunc

    Path(RAG_WORKING_DIR).mkdir(parents=True, exist_ok=True)

    rag_instance = LightRAG(
        working_dir=RAG_WORKING_DIR,
        llm_model_func=llm_model_func,
        embedding_func=EmbeddingFunc(
            embedding_dim=1536,  # text-embedding-3-small dimension
            max_token_size=8192,
            func=embedding_func,
        ),
    )
    await rag_instance.initialize_storages()
    logger.info(f"LightRAG inicializado en {RAG_WORKING_DIR}")
    return rag_instance


# ── FastAPI App ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="SRP Vision RAG Service",
    description="RAG con Knowledge Graph para procedimientos de mantención minera",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Models ───────────────────────────────────────────────────────────────────

class QueryRequest(BaseModel):
    query: str
    mode: str = "hybrid"  # naive, local, global, hybrid
    top_k: int = 5

class IngestTextRequest(BaseModel):
    text: str
    doc_id: str = "manual"

class QueryResponse(BaseModel):
    ok: bool
    answer: str
    mode: str

# ── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"ok": True, "service": "rag-lightrag", "working_dir": RAG_WORKING_DIR}


@app.get("/status")
async def status():
    rag_dir = Path(RAG_WORKING_DIR)
    return {
        "ok": True,
        "initialized": rag_instance is not None,
        "working_dir": RAG_WORKING_DIR,
        "documents_ingested": len(ingested_docs),
        "documents": ingested_docs[-20:],  # últimos 20
        "models": {
            "llm": TEXT_MODEL,
            "embedding": EMBEDDING_MODEL,
        },
    }


@app.post("/ingest")
async def ingest_file(
    file: UploadFile = File(...),
    doc_id: Optional[str] = Form(None),
):
    """Ingestar un documento (PDF, DOCX, TXT, MD)."""
    rag = await get_rag()

    # Guardar archivo temporalmente
    tmp_dir = Path(RAG_WORKING_DIR) / "uploads"
    tmp_dir.mkdir(parents=True, exist_ok=True)
    tmp_path = tmp_dir / file.filename

    content = await file.read()
    tmp_path.write_bytes(content)

    doc_name = doc_id or file.filename
    logger.info(f"Ingestando: {doc_name} ({len(content)} bytes)")

    try:
        text = parse_document(str(tmp_path))
        if not text.strip():
            raise ValueError("Documento vacío después de parsear")

        logger.info(f"Parseado: {doc_name} ({len(text)} chars)")

        # Insertar en LightRAG
        await rag.ainsert(text)

        ingested_docs.append({
            "doc_id": doc_name,
            "filename": file.filename,
            "chars": len(text),
            "pages": text.count("[Página") if "[Página" in text else None,
        })

        logger.info(f"Ingestado OK: {doc_name}")
        return {"ok": True, "document": doc_name, "chars": len(text), "message": "Documento ingestado"}

    except Exception as e:
        logger.error(f"Error ingestando {doc_name}: {e}")
        raise HTTPException(500, f"Error: {e}")


@app.post("/ingest/text")
async def ingest_text(req: IngestTextRequest):
    """Ingestar texto directo."""
    rag = await get_rag()

    if not req.text.strip():
        raise HTTPException(400, "Texto vacío")

    try:
        await rag.ainsert(req.text)
        ingested_docs.append({"doc_id": req.doc_id, "chars": len(req.text)})
        logger.info(f"Texto ingestado: {req.doc_id} ({len(req.text)} chars)")
        return {"ok": True, "document": req.doc_id, "chars": len(req.text)}
    except Exception as e:
        raise HTTPException(500, f"Error: {e}")


@app.post("/ingest/folder")
async def ingest_folder(folder_path: str = Form(...)):
    """Ingestar todos los documentos de una carpeta."""
    rag = await get_rag()

    folder = Path(folder_path)
    if not folder.exists():
        raise HTTPException(404, f"Carpeta no encontrada: {folder_path}")

    extensions = {".pdf", ".docx", ".doc", ".txt", ".md"}
    files = sorted(f for f in folder.rglob("*") if f.suffix.lower() in extensions)

    if not files:
        raise HTTPException(404, f"No se encontraron documentos en {folder_path}")

    results = []
    for f in files:
        doc_id = f.stem
        logger.info(f"[{len(results)+1}/{len(files)}] Ingestando: {f.name}")
        try:
            text = parse_document(str(f))
            if not text.strip():
                results.append({"file": f.name, "status": "skip", "reason": "vacío"})
                continue

            await rag.ainsert(text)
            ingested_docs.append({"doc_id": doc_id, "filename": f.name, "chars": len(text)})
            results.append({"file": f.name, "status": "ok", "chars": len(text)})
        except Exception as e:
            logger.error(f"Error en {f.name}: {e}")
            results.append({"file": f.name, "status": "error", "error": str(e)})

    ok_count = sum(1 for r in results if r["status"] == "ok")
    return {
        "ok": True,
        "total": len(files),
        "ingested": ok_count,
        "errors": len(files) - ok_count,
        "results": results,
    }


@app.post("/query", response_model=QueryResponse)
async def query(req: QueryRequest):
    """Búsqueda híbrida (vector + knowledge graph)."""
    rag = await get_rag()

    try:
        from lightrag import QueryParam
        result = await rag.aquery(
            query=req.query,
            param=QueryParam(mode=req.mode, top_k=req.top_k),
        )
        return QueryResponse(ok=True, answer=result, mode=req.mode)
    except Exception as e:
        logger.error(f"Error en query: {e}")
        raise HTTPException(500, f"Error en búsqueda: {e}")


# ── Run ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=PORT, reload=True)
