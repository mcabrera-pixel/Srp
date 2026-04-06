#!/usr/bin/env python3
"""
Ingestar procedimientos CODELCO en RAG-Anything.

Uso:
  # Ingestar toda la carpeta de procedimientos
  python ingest_procedures.py

  # Ingestar un archivo específico
  python ingest_procedures.py --file "path/to/documento.pdf"

  # Ingestar también los riesgos fatales (JSON)
  python ingest_procedures.py --include-risks
"""

import argparse
import asyncio
import json
import sys
from pathlib import Path

import httpx

RAG_URL = "http://localhost:8100"
PROCEDURES_DIR = Path(__file__).parent.parent.parent / "srp-suite-main" / "docs" / "procedimientos"
RISKS_FILE = Path(__file__).parent.parent.parent / "srp-suite-main" / "data" / "seed" / "fatality-risks.json"


async def ingest_file(filepath: Path, doc_id: str = None):
    """Ingestar un archivo vía el endpoint /ingest."""
    doc_id = doc_id or filepath.stem
    print(f"  📄 {filepath.name}...", end=" ", flush=True)

    try:
        async with httpx.AsyncClient(timeout=120) as client:
            with open(filepath, "rb") as f:
                resp = await client.post(
                    f"{RAG_URL}/ingest",
                    files={"file": (filepath.name, f)},
                    data={"doc_id": doc_id},
                )
            if resp.status_code == 200:
                print("✅")
                return True
            else:
                print(f"❌ {resp.status_code}: {resp.text[:100]}")
                return False
    except Exception as e:
        print(f"❌ {e}")
        return False


async def ingest_risks(risks_path: Path):
    """Convierte riesgos fatales JSON a texto e ingesta como documento."""
    print("\n🔴 Ingestando riesgos fatales CODELCO...")

    with open(risks_path) as f:
        risks = json.load(f)

    # Convertir a documento de texto para el RAG
    lines = ["# CATÁLOGO DE RIESGOS DE FATALIDAD — CODELCO\n"]
    for risk in risks:
        lines.append(f"## {risk['code']}: {risk['name']}")
        lines.append(f"**{risk['full_title']}**\n")
        lines.append(f"**Alcance:** {risk['scope']}\n")
        if risk.get("exclusions"):
            lines.append(f"**Exclusiones:** {risk['exclusions']}\n")
        lines.append("**Controles Críticos:**")
        for ctrl in risk.get("controls", []):
            lines.append(f"- **{ctrl['control_code']} — {ctrl['control_name']}**: {ctrl['objective']}")
        lines.append("")

    text = "\n".join(lines)

    # Guardar como .md temporal e ingestar
    tmp_file = risks_path.parent / "fatality-risks-catalog.md"
    tmp_file.write_text(text, encoding="utf-8")

    return await ingest_file(tmp_file, doc_id="catalogo-riesgos-fatalidad-codelco")


async def main():
    parser = argparse.ArgumentParser(description="Ingestar procedimientos en RAG-Anything")
    parser.add_argument("--file", help="Archivo específico a ingestar")
    parser.add_argument("--include-risks", action="store_true", help="Incluir catálogo de riesgos fatales")
    parser.add_argument("--url", default=RAG_URL, help="URL del servicio RAG")
    args = parser.parse_args()

    global RAG_URL
    RAG_URL = args.url

    # Verificar que el servicio está corriendo
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(f"{RAG_URL}/health")
            resp.raise_for_status()
            print(f"✅ RAG Service activo en {RAG_URL}\n")
    except Exception:
        print(f"❌ RAG Service no disponible en {RAG_URL}")
        print(f"   Ejecuta: cd services/rag && python server.py")
        sys.exit(1)

    if args.file:
        # Ingestar archivo específico
        filepath = Path(args.file)
        if not filepath.exists():
            print(f"❌ Archivo no encontrado: {filepath}")
            sys.exit(1)
        await ingest_file(filepath)
        return

    # Ingestar toda la carpeta de procedimientos
    if not PROCEDURES_DIR.exists():
        print(f"❌ Carpeta de procedimientos no encontrada: {PROCEDURES_DIR}")
        sys.exit(1)

    extensions = {".pdf", ".docx", ".doc", ".txt", ".md"}
    files = sorted(f for f in PROCEDURES_DIR.rglob("*") if f.suffix.lower() in extensions)

    print(f"📁 Encontrados {len(files)} documentos en {PROCEDURES_DIR}\n")

    # Agrupar por carpeta
    by_folder = {}
    for f in files:
        folder = f.parent.name
        by_folder.setdefault(folder, []).append(f)

    ok = 0
    fail = 0

    for folder, folder_files in by_folder.items():
        print(f"\n📂 {folder} ({len(folder_files)} docs)")
        for f in folder_files:
            success = await ingest_file(f)
            if success:
                ok += 1
            else:
                fail += 1

    # Riesgos fatales
    if args.include_risks and RISKS_FILE.exists():
        success = await ingest_risks(RISKS_FILE)
        if success:
            ok += 1
        else:
            fail += 1

    print(f"\n{'='*50}")
    print(f"📊 Resultado: {ok} ingestados, {fail} errores, {ok+fail} total")


if __name__ == "__main__":
    asyncio.run(main())
