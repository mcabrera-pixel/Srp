"""
Escenas de introduccion profesionales estilo pizarra
Supera COMPLETAMENTE lo que hace AntiGravity con Remotion
"""
from manim import *
import sys
sys.path.append(str(Path(__file__).parent.parent))
from config import COLORS, VIDEO_CONFIG

class ProfessionalIntro(Scene):
    """Intro cinematografica profesional"""

    def construct(self):
        # Fondo con gradiente simulado
        self.camera.background_color = COLORS["background"]

        # Logo/Titulo principal con efecto de dibujo
        title = Text("MCCO", font_size=120, color=COLORS["primary"])
        subtitle = Text("Mineria Inteligente", font_size=48, color=COLORS["text"])
        subtitle.next_to(title, DOWN, buff=0.5)

        # Linea decorativa que se dibuja
        line = Line(LEFT * 4, RIGHT * 4, color=COLORS["primary"], stroke_width=3)
        line.next_to(subtitle, DOWN, buff=0.3)

        # Animacion de entrada cinematografica
        self.play(
            Write(title, run_time=2),
            rate_func=smooth
        )
        self.play(
            FadeIn(subtitle, shift=UP * 0.3),
            Create(line),
            run_time=1.5
        )
        self.wait(1)

        # Transicion elegante
        self.play(
            FadeOut(title, shift=UP),
            FadeOut(subtitle, shift=UP),
            FadeOut(line),
            run_time=1
        )


class WhiteboardTitle(Scene):
    """Titulo estilo pizarra con efecto de dibujo a mano"""

    def __init__(self, title_text="Titulo", subtitle_text="Subtitulo", **kwargs):
        super().__init__(**kwargs)
        self.title_text = title_text
        self.subtitle_text = subtitle_text

    def construct(self):
        self.camera.background_color = "#0f0f23"  # Pizarra oscura

        # Crear efecto de pizarra
        board = Rectangle(
            width=14, height=8,
            fill_color="#1a1a2e",
            fill_opacity=0.9,
            stroke_color=COLORS["primary"],
            stroke_width=4
        )

        # Titulo con efecto de tiza
        title = Text(
            self.title_text,
            font_size=64,
            color=WHITE,
            font="Arial"
        )

        subtitle = Text(
            self.subtitle_text,
            font_size=36,
            color=COLORS["info"],
            font="Arial"
        )
        subtitle.next_to(title, DOWN, buff=0.5)

        # Decoracion tipo pizarra
        underline = Line(
            title.get_left() + DOWN * 0.3,
            title.get_right() + DOWN * 0.3,
            color=COLORS["primary"],
            stroke_width=4
        )

        # Animaciones estilo dibujo a mano
        self.play(FadeIn(board, scale=0.9), run_time=0.5)
        self.play(Write(title, run_time=2))
        self.play(Create(underline, run_time=0.8))
        self.play(Write(subtitle, run_time=1.5))
        self.wait(2)


class ProcedureTitle(Scene):
    """Titulo especifico para procedimientos tecnicos"""

    def __init__(self, procedure_code="PRO.0001", procedure_name="Nombre del Procedimiento", **kwargs):
        super().__init__(**kwargs)
        self.procedure_code = procedure_code
        self.procedure_name = procedure_name

    def construct(self):
        self.camera.background_color = COLORS["background"]

        # Header con codigo de procedimiento
        code_box = RoundedRectangle(
            width=4, height=1,
            corner_radius=0.2,
            fill_color=COLORS["primary"],
            fill_opacity=1,
            stroke_width=0
        )
        code_text = Text(
            self.procedure_code,
            font_size=36,
            color=WHITE,
            weight=BOLD
        )
        code_group = VGroup(code_box, code_text)
        code_group.to_edge(UP, buff=1)

        # Nombre del procedimiento
        name = Text(
            self.procedure_name,
            font_size=48,
            color=WHITE
        ).next_to(code_group, DOWN, buff=1)

        # Linea divisora animada
        divider = Line(LEFT * 5, RIGHT * 5, color=COLORS["primary"], stroke_width=2)
        divider.next_to(name, DOWN, buff=0.5)

        # Icono de seguridad
        safety_icon = self._create_safety_icon()
        safety_icon.to_edge(DOWN, buff=1)

        # Animaciones
        self.play(
            FadeIn(code_box, scale=0.8),
            Write(code_text),
            run_time=1
        )
        self.play(Write(name, run_time=1.5))
        self.play(Create(divider, run_time=0.5))
        self.play(FadeIn(safety_icon, shift=UP), run_time=1)
        self.wait(2)

    def _create_safety_icon(self):
        """Crear icono de casco de seguridad estilizado"""
        # Triangulo de advertencia
        triangle = Triangle(
            fill_color=COLORS["warning"],
            fill_opacity=1,
            stroke_color=BLACK,
            stroke_width=2
        ).scale(0.8)

        exclamation = Text("!", font_size=48, color=BLACK, weight=BOLD)
        exclamation.move_to(triangle.get_center() + DOWN * 0.1)

        label = Text(
            "SEGURIDAD PRIMERO",
            font_size=24,
            color=COLORS["warning"]
        ).next_to(triangle, RIGHT, buff=0.5)

        return VGroup(triangle, exclamation, label)
