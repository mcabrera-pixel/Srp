"""
MCCO VIDEO GENERATOR - Script Principal
Sistema profesional de generacion de videos de capacitacion

SUPERA COMPLETAMENTE A ANTIGRAVITY:
- Videos estilo 3Blue1Brown (no solo logos animados)
- Narracion profesional en espanol chileno
- Animaciones tecnicas de procedimientos
- Pipeline automatizado documento -> video
"""
import subprocess
import asyncio
import sys
from pathlib import Path

# Agregar src al path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from config import OUTPUT_DIR
from tts_engine import NarradorProfesional, GUION_EJEMPLO_RAFT


def check_dependencies():
    """Verifica que las dependencias esten instaladas"""
    print("\n" + "="*60)
    print("VERIFICANDO DEPENDENCIAS")
    print("="*60)

    deps = {
        "manim": "Motor de animacion (3Blue1Brown)",
        "edge_tts": "Text-to-Speech Microsoft",
        "ffmpeg": "Procesamiento de video",
    }

    all_ok = True

    for dep, desc in deps.items():
        try:
            if dep == "ffmpeg":
                result = subprocess.run(["ffmpeg", "-version"],
                                        capture_output=True, timeout=5)
                ok = result.returncode == 0
            else:
                __import__(dep.replace("-", "_"))
                ok = True
        except Exception:
            ok = False

        status = "" if ok else ""
        print(f"  {status} {dep}: {desc}")
        if not ok:
            all_ok = False

    return all_ok


def install_dependencies():
    """Instala las dependencias necesarias"""
    print("\nInstalando dependencias...")
    subprocess.run([sys.executable, "-m", "pip", "install", "-r",
                    str(Path(__file__).parent / "requirements.txt")])


async def generate_narration_audio():
    """Genera audio de narracion para el video de ejemplo"""
    print("\n" + "="*60)
    print("GENERANDO NARRACION")
    print("="*60)

    narrador = NarradorProfesional(voz="catalina")

    for i, seccion in enumerate(GUION_EJEMPLO_RAFT.secciones):
        print(f"\n  Generando audio para: {seccion['nombre']}")
        await narrador.generar_audio(
            seccion['narracion'],
            f"scene_{i:03d}_{seccion['nombre'].lower().replace(' ', '_')}"
        )

    print("\n  Todos los audios generados en: output/audio/")


def render_video_scenes():
    """Renderiza las escenas del video de ejemplo"""
    print("\n" + "="*60)
    print("RENDERIZANDO VIDEO")
    print("="*60)

    script_path = Path(__file__).parent / "src" / "generate_raft_video.py"

    scenes = [
        "Scene001_IntroMCCO",
        "Scene002_TituloRAFT",
        "Scene003_ProblemaActual",
        "Scene004_ComoFuncionaRAFT",
        "Scene005_BeneficiosClave",
        "Scene006_FlujoPractico",
        "Scene007_Conclusion",
    ]

    for scene in scenes:
        print(f"\n  Renderizando: {scene}")
        cmd = [
            sys.executable, "-m", "manim",
            "-qm",  # Calidad media para demo rapido
            str(script_path),
            scene
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode == 0:
            print(f"    OK")
        else:
            print(f"    Error: {result.stderr[:200]}")


def combine_final_video():
    """Combina todas las escenas en un video final"""
    print("\n" + "="*60)
    print("COMBINANDO VIDEO FINAL")
    print("="*60)

    media_dir = Path(__file__).parent / "media" / "videos" / "generate_raft_video" / "720p30"

    if not media_dir.exists():
        print("  No se encontraron videos renderizados.")
        return

    # Crear lista de archivos
    video_files = sorted(media_dir.glob("Scene*.mp4"))

    if not video_files:
        print("  No hay escenas para combinar.")
        return

    # Crear archivo de lista para ffmpeg
    list_file = OUTPUT_DIR / "video_list.txt"
    with open(list_file, "w") as f:
        for video in video_files:
            f.write(f"file '{video.absolute()}'\n")

    # Combinar con ffmpeg
    output_file = OUTPUT_DIR / "MCCO_RAFT_Capacitacion.mp4"
    cmd = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(list_file),
        "-c", "copy",
        str(output_file)
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode == 0:
        print(f"\n  VIDEO FINAL GENERADO: {output_file}")
    else:
        print(f"  Error combinando video: {result.stderr[:200]}")


def show_comparison():
    """Muestra comparacion con AntiGravity"""
    print("""

    ╔══════════════════════════════════════════════════════════════╗
    ║           MCCO VIDEO GENERATOR vs ANTIGRAVITY                ║
    ╠══════════════════════════════════════════════════════════════╣
    ║                                                              ║
    ║  AntiGravity + Remotion:           MCCO Video Generator:     ║
    ║  ─────────────────────             ───────────────────────   ║
    ║  ✗ Solo logos animados             ✓ Explicaciones tecnicas  ║
    ║  ✗ Templates genericos             ✓ Personalizado CODELCO   ║
    ║  ✗ Sin narracion                   ✓ TTS profesional chileno ║
    ║  ✗ Motion graphics basicos         ✓ Diagramas de flujo      ║
    ║  ✗ Sin documentacion tecnica       ✓ Integra DS132, DS594    ║
    ║  ✗ Videos de 5 segundos            ✓ Capacitaciones completas║
    ║  ✗ Sin validacion                  ✓ Human-in-the-loop       ║
    ║                                                              ║
    ║  Motor: Remotion (basico)          Motor: Manim (3Blue1Brown)║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝

    """)


def main():
    """Funcion principal"""
    print("""

    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║           M C C O   V I D E O   G E N E R A T O R            ║
    ║                                                              ║
    ║        Sistema Profesional de Videos de Capacitacion         ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝

    Este sistema genera videos de capacitacion estilo pizarra
    (como 3Blue1Brown) a partir de documentos tecnicos.

    Comandos disponibles:
    1. check    - Verificar dependencias
    2. audio    - Generar narracion de ejemplo
    3. render   - Renderizar escenas de video
    4. combine  - Combinar en video final
    5. full     - Pipeline completo
    6. compare  - Ver comparacion con AntiGravity

    """)

    if len(sys.argv) < 2:
        print("Uso: python main.py [check|audio|render|combine|full|compare]")
        return

    command = sys.argv[1].lower()

    if command == "check":
        if not check_dependencies():
            print("\n  Ejecuta: pip install -r requirements.txt")
            print("  Y asegurate de tener ffmpeg instalado.")

    elif command == "audio":
        asyncio.run(generate_narration_audio())

    elif command == "render":
        render_video_scenes()

    elif command == "combine":
        combine_final_video()

    elif command == "full":
        if check_dependencies():
            asyncio.run(generate_narration_audio())
            render_video_scenes()
            combine_final_video()
        else:
            print("\n  Por favor instala las dependencias primero.")

    elif command == "compare":
        show_comparison()

    else:
        print(f"Comando no reconocido: {command}")


if __name__ == "__main__":
    main()
