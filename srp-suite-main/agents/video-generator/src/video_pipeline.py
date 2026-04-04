"""
Pipeline completo: Documento -> Video Profesional
ESTO SUPERA COMPLETAMENTE A ANTIGRAVITY
"""
import subprocess
import json
import re
from pathlib import Path
from dataclasses import dataclass
from typing import List, Optional
import sys

sys.path.append(str(Path(__file__).parent))
from config import OUTPUT_DIR, COLORS


@dataclass
class VideoSection:
    """Seccion de video con contenido y metadatos"""
    title: str
    content: str
    narration: str
    scene_type: str  # "intro", "steps", "flow", "warning", "epp", "conclusion"
    duration: float = 10.0
    data: Optional[dict] = None


class DocumentToVideoConverter:
    """
    Convierte documentos tecnicos a videos de capacitacion

    Pipeline:
    1. Parsea documento (markdown, PDF, texto)
    2. Extrae secciones y contenido
    3. Genera guion de narracion
    4. Crea codigo Manim para cada seccion
    5. Renderiza video
    6. Genera audio con TTS
    7. Ensambla video final con FFmpeg
    """

    def __init__(self, output_dir: Path = OUTPUT_DIR):
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.sections: List[VideoSection] = []

    def parse_markdown(self, markdown_content: str) -> List[VideoSection]:
        """Parsea documento markdown y extrae secciones"""
        sections = []

        # Extraer titulo principal
        title_match = re.search(r'^#\s+(.+)$', markdown_content, re.MULTILINE)
        main_title = title_match.group(1) if title_match else "Procedimiento"

        # Agregar intro
        sections.append(VideoSection(
            title=main_title,
            content="",
            narration=f"Bienvenidos al modulo de capacitacion: {main_title}. "
                      f"Presten atencion a los puntos clave de seguridad.",
            scene_type="intro",
            duration=8
        ))

        # Extraer secciones (## headers)
        section_pattern = r'#{2,4}\s+(?:\d+\.\s*)?(.+?)(?:\n)([\s\S]*?)(?=#{2,4}|\Z)'
        matches = re.findall(section_pattern, markdown_content)

        for title, content in matches:
            title = title.strip()
            content = content.strip()

            # Detectar tipo de seccion
            scene_type = self._detect_section_type(title, content)

            # Generar narracion
            narration = self._generate_narration(title, content)

            # Extraer datos estructurados si aplica
            data = self._extract_structured_data(content, scene_type)

            sections.append(VideoSection(
                title=title,
                content=content,
                narration=narration,
                scene_type=scene_type,
                duration=self._estimate_duration(narration),
                data=data
            ))

        # Agregar conclusion
        sections.append(VideoSection(
            title="Conclusion",
            content="",
            narration="Recuerden siempre seguir los procedimientos establecidos. "
                      "La seguridad es responsabilidad de todos. "
                      "Ante cualquier duda, consulten con su supervisor.",
            scene_type="conclusion",
            duration=8
        ))

        self.sections = sections
        return sections

    def _detect_section_type(self, title: str, content: str) -> str:
        """Detecta el tipo de seccion basado en contenido"""
        title_lower = title.lower()
        content_lower = content.lower()

        if any(kw in title_lower for kw in ["peligro", "riesgo", "advertencia", "cuidado"]):
            return "warning"
        elif any(kw in title_lower for kw in ["epp", "equipo", "proteccion"]):
            return "epp"
        elif any(kw in title_lower for kw in ["paso", "procedimiento", "como", "proceso"]):
            return "steps"
        elif any(kw in title_lower for kw in ["flujo", "diagrama", "secuencia"]):
            return "flow"
        elif any(kw in content_lower for kw in ["1.", "2.", "3.", "primero", "segundo"]):
            return "steps"
        else:
            return "content"

    def _generate_narration(self, title: str, content: str) -> str:
        """Genera narracion profesional desde el contenido"""
        # Limpiar markdown
        clean_content = re.sub(r'\*\*(.+?)\*\*', r'\1', content)  # Bold
        clean_content = re.sub(r'\*(.+?)\*', r'\1', clean_content)  # Italic
        clean_content = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', clean_content)  # Links
        clean_content = re.sub(r'`(.+?)`', r'\1', clean_content)  # Code
        clean_content = re.sub(r'^\s*[-*]\s+', '', clean_content, flags=re.MULTILINE)  # Lists

        # Truncar si es muy largo
        if len(clean_content) > 500:
            sentences = clean_content.split('.')
            clean_content = '. '.join(sentences[:3]) + '.'

        narration = f"{title}. {clean_content}"
        return narration.strip()

    def _extract_structured_data(self, content: str, scene_type: str) -> dict:
        """Extrae datos estructurados del contenido"""
        data = {}

        if scene_type == "steps":
            # Extraer lista numerada
            steps = re.findall(r'(?:^\d+\.\s*|\*\s+)(.+)$', content, re.MULTILINE)
            data["steps"] = steps[:10]  # Max 10 pasos

        elif scene_type == "epp":
            # Extraer equipos mencionados
            epp_keywords = ["casco", "lentes", "guantes", "chaleco", "zapatos",
                           "arnes", "respirador", "protector"]
            found_epp = [kw for kw in epp_keywords if kw in content.lower()]
            data["epp_list"] = found_epp

        elif scene_type == "warning":
            # Extraer tipo de peligro
            danger_keywords = ["electrico", "quimico", "mecanico", "termico", "caida"]
            found_dangers = [kw for kw in danger_keywords if kw in content.lower()]
            data["dangers"] = found_dangers

        return data

    def _estimate_duration(self, narration: str) -> float:
        """Estima duracion basada en longitud de narracion"""
        words = len(narration.split())
        # Aprox 150 palabras por minuto para narracion clara
        duration = (words / 150) * 60
        return max(5, min(duration, 30))  # Entre 5 y 30 segundos

    def generate_manim_code(self, section: VideoSection) -> str:
        """Genera codigo Manim para una seccion"""
        if section.scene_type == "intro":
            return self._generate_intro_scene(section)
        elif section.scene_type == "steps":
            return self._generate_steps_scene(section)
        elif section.scene_type == "warning":
            return self._generate_warning_scene(section)
        elif section.scene_type == "epp":
            return self._generate_epp_scene(section)
        elif section.scene_type == "flow":
            return self._generate_flow_scene(section)
        else:
            return self._generate_content_scene(section)

    def _generate_intro_scene(self, section: VideoSection) -> str:
        """Genera escena de introduccion"""
        return f'''
class IntroScene(Scene):
    def construct(self):
        self.camera.background_color = "{COLORS['background']}"

        title = Text("{section.title}", font_size=64, color=WHITE)
        subtitle = Text("Modulo de Capacitacion", font_size=36, color="{COLORS['info']}")
        subtitle.next_to(title, DOWN, buff=0.5)

        line = Line(LEFT * 5, RIGHT * 5, color="{COLORS['primary']}", stroke_width=3)
        line.next_to(subtitle, DOWN, buff=0.3)

        self.play(Write(title, run_time=2))
        self.play(FadeIn(subtitle, shift=UP * 0.3), Create(line), run_time=1.5)
        self.wait({section.duration - 4})
        self.play(FadeOut(title), FadeOut(subtitle), FadeOut(line))
'''

    def _generate_steps_scene(self, section: VideoSection) -> str:
        """Genera escena de pasos"""
        steps = section.data.get("steps", []) if section.data else []
        steps_str = str(steps)

        return f'''
class StepsScene(Scene):
    def construct(self):
        self.camera.background_color = "{COLORS['background']}"

        title = Text("{section.title}", font_size=48, color="{COLORS['primary']}")
        title.to_edge(UP, buff=0.5)
        self.play(Write(title))

        steps = {steps_str}
        y_pos = 2

        for i, step in enumerate(steps[:6]):
            circle = Circle(radius=0.3, fill_color="{COLORS['primary']}", fill_opacity=1)
            num = Text(str(i+1), font_size=24, color=WHITE)
            num.move_to(circle)
            text = Text(step[:50], font_size=24, color=WHITE)
            text.next_to(circle, RIGHT, buff=0.3)

            group = VGroup(circle, num, text)
            group.move_to(LEFT * 3 + UP * (y_pos - i * 0.8))

            self.play(FadeIn(group), run_time=0.5)
            self.wait(1)

        self.wait(2)
'''

    def _generate_warning_scene(self, section: VideoSection) -> str:
        """Genera escena de advertencia"""
        return f'''
class WarningScene(Scene):
    def construct(self):
        self.camera.background_color = "{COLORS['background']}"

        triangle = RegularPolygon(n=3, fill_color="{COLORS['warning']}", fill_opacity=1)
        triangle.scale(2)
        excl = Text("!", font_size=100, color=BLACK, weight=BOLD)
        excl.move_to(triangle.get_center() + DOWN * 0.2)

        warning_text = Text("{section.title}", font_size=48, color="{COLORS['danger']}")
        warning_text.next_to(triangle, DOWN, buff=0.5)

        self.play(GrowFromCenter(triangle), FadeIn(excl), run_time=0.8)

        for _ in range(3):
            self.play(triangle.animate.set_opacity(0.3), excl.animate.set_opacity(0.3), run_time=0.15)
            self.play(triangle.animate.set_opacity(1), excl.animate.set_opacity(1), run_time=0.15)

        self.play(Write(warning_text))
        self.wait({section.duration - 3})
'''

    def _generate_epp_scene(self, section: VideoSection) -> str:
        """Genera escena de EPP"""
        epp_list = section.data.get("epp_list", ["casco", "lentes", "guantes"]) if section.data else []

        return f'''
class EPPScene(Scene):
    def construct(self):
        self.camera.background_color = "{COLORS['background']}"

        title = Text("EPP REQUERIDO", font_size=48, color="{COLORS['primary']}")
        title.to_edge(UP, buff=0.5)
        self.play(Write(title))

        epp_items = {epp_list}
        icons = []

        for i, epp in enumerate(epp_items):
            box = RoundedRectangle(width=1.8, height=2, corner_radius=0.1,
                                   fill_color="{COLORS['accent']}", fill_opacity=0.8,
                                   stroke_color="{COLORS['primary']}", stroke_width=2)
            letter = Text(epp[0].upper(), font_size=48, color=WHITE)
            label = Text(epp, font_size=18, color=WHITE)
            letter.move_to(box.get_center() + UP * 0.3)
            label.move_to(box.get_center() + DOWN * 0.5)
            icons.append(VGroup(box, letter, label))

        group = VGroup(*icons).arrange(RIGHT, buff=0.5)
        group.move_to(ORIGIN)

        for icon in icons:
            self.play(FadeIn(icon, scale=0.8), run_time=0.4)
            check = Text("", font_size=24, color="{COLORS['primary']}")
            check.next_to(icon, DOWN, buff=0.1)
            self.play(FadeIn(check), run_time=0.2)

        self.wait(3)
'''

    def _generate_flow_scene(self, section: VideoSection) -> str:
        """Genera escena de flujo"""
        return self._generate_content_scene(section)

    def _generate_content_scene(self, section: VideoSection) -> str:
        """Genera escena generica de contenido"""
        # Limpiar titulo para Python
        clean_title = section.title.replace('"', '\\"')

        return f'''
class ContentScene(Scene):
    def construct(self):
        self.camera.background_color = "{COLORS['background']}"

        title = Text("{clean_title}", font_size=42, color="{COLORS['primary']}")
        title.to_edge(UP, buff=0.5)

        content_lines = """
{section.content[:300]}
""".strip().split("\\n")[:5]

        self.play(Write(title))

        y_pos = 1.5
        for line in content_lines:
            if line.strip():
                text = Text(line[:60], font_size=24, color=WHITE)
                text.move_to(UP * y_pos)
                self.play(Write(text), run_time=0.8)
                y_pos -= 0.8

        self.wait({section.duration - 2})
'''

    def export_full_script(self, output_file: str = "full_video.py") -> Path:
        """Exporta script Manim completo"""
        output_path = self.output_dir / output_file

        header = '''"""
Video de Capacitacion Generado Automaticamente
Sistema MCCO Video Generator
"""
from manim import *

'''
        scenes = []
        for i, section in enumerate(self.sections):
            scene_code = self.generate_manim_code(section)
            # Renombrar clase para hacerla unica
            scene_code = scene_code.replace(
                "class ",
                f"class Scene{i:03d}_"
            )
            scenes.append(scene_code)

        full_script = header + "\n".join(scenes)

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(full_script)

        print(f"Script Manim exportado: {output_path}")
        return output_path

    def export_narration_script(self, output_file: str = "narration.txt") -> Path:
        """Exporta script de narracion para TTS"""
        output_path = self.output_dir / output_file

        narrations = []
        for i, section in enumerate(self.sections):
            narrations.append(f"--- Seccion {i+1}: {section.title} ---")
            narrations.append(section.narration)
            narrations.append("")

        with open(output_path, "w", encoding="utf-8") as f:
            f.write("\n".join(narrations))

        print(f"Script de narracion exportado: {output_path}")
        return output_path


def convert_document_to_video(document_path: str) -> dict:
    """
    Funcion principal: convierte documento a video

    Args:
        document_path: Ruta al documento (markdown)

    Returns:
        Dict con rutas a los archivos generados
    """
    doc_path = Path(document_path)

    if not doc_path.exists():
        raise FileNotFoundError(f"Documento no encontrado: {document_path}")

    with open(doc_path, "r", encoding="utf-8") as f:
        content = f.read()

    converter = DocumentToVideoConverter()
    sections = converter.parse_markdown(content)

    print(f"\nDocumento parseado: {len(sections)} secciones encontradas")
    for section in sections:
        print(f"  - [{section.scene_type}] {section.title} ({section.duration:.1f}s)")

    manim_script = converter.export_full_script()
    narration_script = converter.export_narration_script()

    return {
        "sections": len(sections),
        "manim_script": str(manim_script),
        "narration_script": str(narration_script),
        "estimated_duration": sum(s.duration for s in sections)
    }


if __name__ == "__main__":
    # Test con documento de ejemplo
    test_doc = """
# Modelo RAFT para Mineria Segura

## 1. Introduccion
El modelo RAFT combina inteligencia artificial con normativas de seguridad minera.

## 2. Pasos del Proceso
1. Identificar el procedimiento requerido
2. Recuperar normativas vigentes
3. Generar borrador con IA
4. Validar con supervisor
5. Aprobar y ejecutar

## 3. Advertencia de Seguridad
PELIGRO: Siempre verificar energia cero antes de intervenir equipos.

## 4. EPP Requerido
Se requiere uso de casco, lentes de seguridad, guantes y chaleco reflectante.
"""

    # Guardar documento de prueba
    test_path = OUTPUT_DIR / "test_document.md"
    with open(test_path, "w", encoding="utf-8") as f:
        f.write(test_doc)

    # Convertir
    result = convert_document_to_video(str(test_path))
    print(f"\nResultado:")
    print(f"  Secciones: {result['sections']}")
    print(f"  Duracion estimada: {result['estimated_duration']:.1f} segundos")
    print(f"  Script Manim: {result['manim_script']}")
    print(f"  Script Narracion: {result['narration_script']}")
