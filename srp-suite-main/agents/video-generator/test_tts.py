"""
Test de generacion de audio TTS
"""
import asyncio
import edge_tts
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent / "output" / "audio"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

async def test_tts():
    """Genera audio de prueba en espanol chileno"""

    texto = """
    Bienvenidos al sistema de capacitacion MCCO.
    Hoy aprenderemos sobre el modelo RAFT para mineria segura.
    Este sistema combina inteligencia artificial con normativas de seguridad
    para garantizar procedimientos actualizados y precisos.
    Recuerden: la seguridad es responsabilidad de todos.
    """

    voz = "es-CL-CatalinaNeural"  # Voz femenina chilena

    print(f"Generando audio con voz: {voz}")
    print(f"Texto: {texto[:100]}...")

    communicate = edge_tts.Communicate(
        text=texto.strip(),
        voice=voz,
        rate="+0%",
        pitch="+0Hz"
    )

    output_file = OUTPUT_DIR / "test_narracion_raft.mp3"
    await communicate.save(str(output_file))

    print(f"\nAudio generado exitosamente!")
    print(f"Archivo: {output_file}")
    print(f"Tamano: {output_file.stat().st_size / 1024:.1f} KB")

    return output_file

if __name__ == "__main__":
    print("="*50)
    print("TEST DE TEXT-TO-SPEECH MCCO")
    print("="*50)

    result = asyncio.run(test_tts())

    print("\n" + "="*50)
    print("TEST COMPLETADO")
    print("="*50)
