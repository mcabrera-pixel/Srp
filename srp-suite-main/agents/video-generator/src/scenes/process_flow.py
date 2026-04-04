"""
Visualizaciones de flujos de proceso - El corazon de videos de capacitacion
ESTO es lo que AntiGravity NO puede hacer
"""
from manim import *
from pathlib import Path
import sys
sys.path.append(str(Path(__file__).parent.parent))
from config import COLORS


class ProcessFlowDiagram(Scene):
    """Diagrama de flujo animado para procedimientos"""

    def __init__(self, steps=None, **kwargs):
        super().__init__(**kwargs)
        self.steps = steps or [
            {"title": "Paso 1", "description": "Identificar peligros"},
            {"title": "Paso 2", "description": "Evaluar riesgos"},
            {"title": "Paso 3", "description": "Aplicar controles"},
        ]

    def construct(self):
        self.camera.background_color = COLORS["background"]

        # Crear nodos del flujo
        nodes = []
        arrows = []

        for i, step in enumerate(self.steps):
            node = self._create_step_node(step["title"], step["description"], i)
            nodes.append(node)

        # Posicionar nodos
        if len(nodes) <= 4:
            # Horizontal para pocos pasos
            group = VGroup(*nodes).arrange(RIGHT, buff=1.5)
        else:
            # Grid para muchos pasos
            rows = [nodes[i:i+3] for i in range(0, len(nodes), 3)]
            row_groups = [VGroup(*row).arrange(RIGHT, buff=1.5) for row in rows]
            group = VGroup(*row_groups).arrange(DOWN, buff=1.5)

        group.move_to(ORIGIN)

        # Crear flechas entre nodos
        for i in range(len(nodes) - 1):
            arrow = Arrow(
                nodes[i].get_right(),
                nodes[i + 1].get_left(),
                color=COLORS["primary"],
                buff=0.2,
                stroke_width=3
            )
            arrows.append(arrow)

        # Titulo
        title = Text(
            "FLUJO DEL PROCESO",
            font_size=48,
            color=COLORS["primary"]
        ).to_edge(UP, buff=0.5)

        # Animaciones secuenciales
        self.play(Write(title, run_time=1))

        for i, node in enumerate(nodes):
            self.play(
                FadeIn(node, scale=0.8),
                run_time=0.8
            )
            if i < len(arrows):
                self.play(GrowArrow(arrows[i]), run_time=0.5)

        self.wait(2)

    def _create_step_node(self, title, description, index):
        """Crear nodo visual de paso"""
        # Numero del paso
        number = Text(
            str(index + 1),
            font_size=36,
            color=WHITE,
            weight=BOLD
        )

        circle = Circle(
            radius=0.4,
            fill_color=COLORS["primary"],
            fill_opacity=1,
            stroke_width=0
        )
        number.move_to(circle.get_center())
        number_group = VGroup(circle, number)

        # Caja del paso
        box = RoundedRectangle(
            width=3.5,
            height=2,
            corner_radius=0.2,
            fill_color=COLORS["accent"],
            fill_opacity=0.8,
            stroke_color=COLORS["primary"],
            stroke_width=2
        )

        title_text = Text(
            title,
            font_size=24,
            color=WHITE,
            weight=BOLD
        )

        desc_text = Text(
            description,
            font_size=18,
            color=COLORS["text"]
        )

        title_text.move_to(box.get_center() + UP * 0.4)
        desc_text.move_to(box.get_center() + DOWN * 0.3)

        number_group.next_to(box, UP, buff=0.1)

        return VGroup(number_group, box, title_text, desc_text)


class StepByStepAnimation(Scene):
    """Animacion paso a paso con highlighting"""

    def __init__(self, steps=None, **kwargs):
        super().__init__(**kwargs)
        self.steps = steps or [
            "Verificar condiciones del area",
            "Aplicar bloqueo LOTO",
            "Confirmar energia cero",
            "Proceder con la tarea",
            "Retirar bloqueos en orden inverso"
        ]

    def construct(self):
        self.camera.background_color = COLORS["background"]

        # Titulo
        title = Text(
            "PASOS DEL PROCEDIMIENTO",
            font_size=42,
            color=COLORS["primary"]
        ).to_edge(UP, buff=0.5)

        self.play(Write(title, run_time=1))

        # Lista de pasos
        step_items = []
        start_y = 2

        for i, step_text in enumerate(self.steps):
            item = self._create_step_item(i + 1, step_text)
            item.move_to(UP * (start_y - i * 1.2))
            step_items.append(item)

        # Animar cada paso secuencialmente
        for i, item in enumerate(step_items):
            # Aparecer
            self.play(FadeIn(item, shift=RIGHT * 0.5), run_time=0.6)

            # Highlight temporal
            highlight = SurroundingRectangle(
                item,
                color=COLORS["warning"],
                buff=0.1,
                stroke_width=3
            )
            self.play(Create(highlight), run_time=0.3)
            self.wait(1.5)  # Tiempo para narracion
            self.play(FadeOut(highlight), run_time=0.3)

        # Checkmark final
        self._show_completion()
        self.wait(2)

    def _create_step_item(self, number, text):
        """Crear item de lista con numero"""
        # Circulo con numero
        circle = Circle(
            radius=0.35,
            fill_color=COLORS["primary"],
            fill_opacity=1,
            stroke_width=0
        )
        num_text = Text(str(number), font_size=28, color=WHITE, weight=BOLD)
        num_text.move_to(circle.get_center())

        # Texto del paso
        step_text = Text(
            text,
            font_size=28,
            color=WHITE
        )
        step_text.next_to(circle, RIGHT, buff=0.5)

        return VGroup(circle, num_text, step_text).move_to(LEFT * 2)

    def _show_completion(self):
        """Mostrar animacion de completado"""
        check = Text(
            "PROCEDIMIENTO COMPLETO",
            font_size=36,
            color=COLORS["primary"]
        ).to_edge(DOWN, buff=1)

        check_mark = Text(
            "",  # Checkmark unicode
            font_size=72,
            color=COLORS["primary"]
        ).next_to(check, LEFT, buff=0.3)

        self.play(
            Write(check),
            FadeIn(check_mark, scale=0.5),
            run_time=1
        )


class SafetyWarning(Scene):
    """Advertencia de seguridad animada"""

    def __init__(self, warning_text="PELIGRO", details="Descripcion del riesgo", **kwargs):
        super().__init__(**kwargs)
        self.warning_text = warning_text
        self.details = details

    def construct(self):
        self.camera.background_color = COLORS["background"]

        # Triangulo de advertencia grande
        triangle = RegularPolygon(
            n=3,
            fill_color=COLORS["warning"],
            fill_opacity=1,
            stroke_color=BLACK,
            stroke_width=4
        ).scale(2)

        exclamation = Text("!", font_size=120, color=BLACK, weight=BOLD)
        exclamation.move_to(triangle.get_center() + DOWN * 0.2)

        warning_group = VGroup(triangle, exclamation)

        # Texto de advertencia
        warning_label = Text(
            self.warning_text,
            font_size=64,
            color=COLORS["danger"],
            weight=BOLD
        ).next_to(warning_group, DOWN, buff=0.5)

        details_text = Text(
            self.details,
            font_size=28,
            color=WHITE
        ).next_to(warning_label, DOWN, buff=0.3)

        # Animacion de alerta
        self.play(
            GrowFromCenter(triangle),
            run_time=0.5
        )
        self.play(
            FadeIn(exclamation, scale=0.5),
            run_time=0.3
        )

        # Parpadeo de alerta
        for _ in range(3):
            self.play(
                warning_group.animate.set_opacity(0.3),
                run_time=0.15
            )
            self.play(
                warning_group.animate.set_opacity(1),
                run_time=0.15
            )

        self.play(
            Write(warning_label),
            FadeIn(details_text, shift=UP),
            run_time=1
        )

        self.wait(3)


class EPPRequirements(Scene):
    """Visualizacion de Equipos de Proteccion Personal"""

    def __init__(self, epp_list=None, **kwargs):
        super().__init__(**kwargs)
        self.epp_list = epp_list or [
            {"name": "Casco", "icon": "helmet", "required": True},
            {"name": "Lentes", "icon": "glasses", "required": True},
            {"name": "Guantes", "icon": "gloves", "required": True},
            {"name": "Chaleco", "icon": "vest", "required": True},
            {"name": "Zapatos", "icon": "boots", "required": True},
        ]

    def construct(self):
        self.camera.background_color = COLORS["background"]

        # Titulo
        title = Text(
            "EPP REQUERIDO",
            font_size=48,
            color=COLORS["primary"]
        ).to_edge(UP, buff=0.5)

        self.play(Write(title, run_time=1))

        # Crear iconos de EPP
        epp_icons = []
        for i, epp in enumerate(self.epp_list):
            icon = self._create_epp_icon(epp["name"], i)
            epp_icons.append(icon)

        # Organizar en fila
        icons_group = VGroup(*epp_icons).arrange(RIGHT, buff=0.8)
        icons_group.move_to(ORIGIN)

        # Animar cada EPP
        for icon in epp_icons:
            self.play(
                FadeIn(icon, scale=0.5),
                run_time=0.5
            )
            # Check mark de aprobacion
            check = Text("", font_size=36, color=COLORS["primary"])
            check.next_to(icon, DOWN, buff=0.2)
            self.play(FadeIn(check, scale=0.5), run_time=0.3)

        self.wait(2)

    def _create_epp_icon(self, name, index):
        """Crear icono simplificado de EPP"""
        # Caja con icono
        box = RoundedRectangle(
            width=2,
            height=2.5,
            corner_radius=0.2,
            fill_color=COLORS["accent"],
            fill_opacity=0.8,
            stroke_color=COLORS["primary"],
            stroke_width=2
        )

        # Icono placeholder (circulo con letra)
        icon_circle = Circle(
            radius=0.5,
            fill_color=COLORS["primary"],
            fill_opacity=1,
            stroke_width=0
        )
        icon_letter = Text(
            name[0].upper(),
            font_size=36,
            color=WHITE,
            weight=BOLD
        )
        icon_letter.move_to(icon_circle.get_center())

        icon_group = VGroup(icon_circle, icon_letter)
        icon_group.move_to(box.get_center() + UP * 0.3)

        # Nombre del EPP
        label = Text(
            name,
            font_size=20,
            color=WHITE
        )
        label.move_to(box.get_center() + DOWN * 0.7)

        return VGroup(box, icon_group, label)
