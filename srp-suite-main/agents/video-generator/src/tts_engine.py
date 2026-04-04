"""
Motor de Text-to-Speech profesional para narracion en espanol
Usa Edge TTS (gratis, calidad premium de Microsoft)
"""
import asyncio
import edge_tts
from pathlib import Path
import sys
sys.path.append(str(Path(__file__).parent))
from config import TTS_CONFIG, OUTPUT_DIR


class NarradorProfesional:
    """Generador de narracion profesional en espanol chileno"""

    VOCES_DISPONIBLES = {
        "catalina": "es-CL-CatalinaNeural",     # Femenina chilena
        "lorenzo": "es-CL-LorenzoNeural",       # Masculino chileno
        "elena": "es-ES-ElviraNeural",          # Femenina espanola
        "alvaro": "es-ES-AlvaroNeural",         # Masculino espanol
        "dalia": "es-MX-DaliaNeural",           # Femenina mexicana
        "jorge": "es-MX-JorgeNeural",           # Masculino mexicano
    }

    def __init__(self, voz="catalina", velocidad="+0%", tono="+0Hz"):
        self.voz = self.VOCES_DISPONIBLES.get(voz, voz)
        self.velocidad = velocidad
        self.tono = tono
        self.output_dir = OUTPUT_DIR / "audio"
        self.output_dir.mkdir(parents=True, exist_ok=True)

    async def generar_audio(self, texto: str, archivo_salida: str) -> Path:
        """
        Genera archivo de audio desde texto

        Args:
            texto: Texto a narrar
            archivo_salida: Nombre del archivo (sin extension)

        Returns:
            Path al archivo MP3 generado
        """
        output_path = self.output_dir / f"{archivo_salida}.mp3"

        communicate = edge_tts.Communicate(
            text=texto,
            voice=self.voz,
            rate=self.velocidad,
            pitch=self.tono
        )

        await communicate.save(str(output_path))
        print(f"Audio generado: {output_path}")
        return output_path

    async def generar_con_subtitulos(self, texto: str, archivo_salida: str) -> tuple:
        """
        Genera audio con marcas de tiempo para subtitulos

        Returns:
            Tuple (path_audio, lista_subtitulos)
        """
        output_path = self.output_dir / f"{archivo_salida}.mp3"
        subtitles = []

        communicate = edge_tts.Communicate(
            text=texto,
            voice=self.voz,
            rate=self.velocidad,
            pitch=self.tono
        )

        with open(output_path, "wb") as audio_file:
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_file.write(chunk["data"])
                elif chunk["type"] == "WordBoundary":
                    subtitles.append({
                        "text": chunk["text"],
                        "start": chunk["offset"] / 10_000_000,  # Convertir a segundos
                        "duration": chunk["duration"] / 10_000_000
                    })

        return output_path, subtitles

    def generar_sync(self, texto: str, archivo_salida: str) -> Path:
        """Version sincrona del generador"""
        return asyncio.run(self.generar_audio(texto, archivo_salida))


class GuionCapacitacion:
    """Estructura para guiones de capacitacion"""

    def __init__(self, titulo: str):
        self.titulo = titulo
        self.secciones = []

    def agregar_seccion(self, nombre: str, narracion: str, duracion_visual: float = 5.0):
        """
        Agrega una seccion al guion

        Args:
            nombre: Nombre de la seccion
            narracion: Texto a narrar
            duracion_visual: Duracion sugerida de la animacion
        """
        self.secciones.append({
            "nombre": nombre,
            "narracion": narracion,
            "duracion": duracion_visual
        })

    def exportar_markdown(self) -> str:
        """Exporta el guion como markdown"""
        md = f"# {self.titulo}\n\n"
        for i, seccion in enumerate(self.secciones, 1):
            md += f"## {i}. {seccion['nombre']}\n"
            md += f"**Duracion:** {seccion['duracion']}s\n\n"
            md += f"**Narracion:**\n> {seccion['narracion']}\n\n"
            md += "---\n\n"
        return md


# Ejemplo de uso
GUION_EJEMPLO_RAFT = GuionCapacitacion("Modelo RAFT para Mineria Segura")

GUION_EJEMPLO_RAFT.agregar_seccion(
    "Introduccion",
    "Bienvenidos al modulo de capacitacion sobre el modelo RAFT. "
    "Este sistema combina inteligencia artificial con las normativas de seguridad minera "
    "para garantizar procedimientos seguros y actualizados.",
    duracion_visual=8
)

GUION_EJEMPLO_RAFT.agregar_seccion(
    "Que es RAFT",
    "RAFT significa Retrieval Augmented Fine Tuning. "
    "Combina dos tecnologias poderosas: la recuperacion de informacion actualizada "
    "y el ajuste fino del modelo para hablar el lenguaje tecnico de Codelco.",
    duracion_visual=10
)

GUION_EJEMPLO_RAFT.agregar_seccion(
    "Beneficios Clave",
    "Los principales beneficios son: primero, precision factual maxima "
    "al anclar las respuestas en documentos oficiales. "
    "Segundo, actualizacion dinamica cuando cambian las normativas. "
    "Tercero, trazabilidad total de cada instruccion generada.",
    duracion_visual=12
)

GUION_EJEMPLO_RAFT.agregar_seccion(
    "Aplicacion Practica",
    "En terreno, un supervisor puede solicitar un procedimiento por WhatsApp. "
    "El sistema recupera la normativa vigente, genera el borrador "
    "y lo envia para validacion en minutos, no en dias.",
    duracion_visual=10
)

GUION_EJEMPLO_RAFT.agregar_seccion(
    "Conclusion",
    "El modelo RAFT representa un cambio fundamental hacia una inteligencia artificial "
    "responsable y preparada para entornos criticos. "
    "La precision no es opcional, es condicion imprescindible "
    "para proteger la vida y la continuidad operacional.",
    duracion_visual=10
)


if __name__ == "__main__":
    # Test del sistema
    narrador = NarradorProfesional(voz="catalina")

    print("Generando audio de prueba...")
    audio_path = narrador.generar_sync(
        "Bienvenidos al sistema de capacitacion MCCO. "
        "Hoy aprenderemos sobre seguridad minera.",
        "test_narracion"
    )
    print(f"Audio generado en: {audio_path}")

    print("\nGuion de ejemplo:")
    print(GUION_EJEMPLO_RAFT.exportar_markdown())
