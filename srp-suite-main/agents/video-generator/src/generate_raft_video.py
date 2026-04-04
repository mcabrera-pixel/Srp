"""
DEMO: Generar video profesional del Modelo RAFT para CODELCO
Este script demuestra la capacidad completa del sistema
"""
from manim import *
from pathlib import Path
import sys

# Agregar path del proyecto
sys.path.append(str(Path(__file__).parent))

# Colores MCCO/CODELCO
VERDE_CODELCO = "#00A651"
AZUL_OSCURO = "#1a1a2e"
NARANJA_ALERTA = "#F7931E"
ROJO_PELIGRO = "#ED1C24"
AMARILLO = "#FFF200"
AZUL_INFO = "#00AEEF"


class Scene001_IntroMCCO(Scene):
    """Intro cinematografica MCCO"""

    def construct(self):
        self.camera.background_color = AZUL_OSCURO

        # Logo MCCO con efecto de dibujo
        logo_text = Text("MCCO", font_size=144, color=VERDE_CODELCO, weight=BOLD)

        # Particulas decorativas
        dots = VGroup(*[
            Dot(point=[np.random.uniform(-7, 7), np.random.uniform(-4, 4), 0],
                radius=0.05, color=VERDE_CODELCO, fill_opacity=0.3)
            for _ in range(50)
        ])

        # Subtitulo
        subtitle = Text(
            "Sistema de Capacitacion Inteligente",
            font_size=36,
            color=WHITE
        )
        subtitle.next_to(logo_text, DOWN, buff=0.8)

        # Linea decorativa
        line = Line(LEFT * 5, RIGHT * 5, color=VERDE_CODELCO, stroke_width=4)
        line.next_to(subtitle, DOWN, buff=0.4)

        # Animaciones
        self.play(FadeIn(dots, lag_ratio=0.02), run_time=1)
        self.play(
            Write(logo_text, run_time=2.5),
            dots.animate.set_opacity(0.1),
            rate_func=smooth
        )
        self.play(
            FadeIn(subtitle, shift=UP * 0.3),
            Create(line),
            run_time=1.5
        )
        self.wait(2)

        # Transicion
        self.play(
            logo_text.animate.scale(0.5).to_edge(UP),
            FadeOut(subtitle),
            FadeOut(line),
            FadeOut(dots),
            run_time=1.5
        )


class Scene002_TituloRAFT(Scene):
    """Titulo del modulo RAFT"""

    def construct(self):
        self.camera.background_color = AZUL_OSCURO

        # Codigo del procedimiento
        code_box = RoundedRectangle(
            width=6, height=1.2,
            corner_radius=0.3,
            fill_color=VERDE_CODELCO,
            fill_opacity=1,
            stroke_width=0
        )
        code_text = Text(
            "MODELO RAFT",
            font_size=42,
            color=WHITE,
            weight=BOLD
        )
        code_text.move_to(code_box)
        code_group = VGroup(code_box, code_text)
        code_group.to_edge(UP, buff=1.5)

        # Titulo principal
        title = Text(
            "Retrieval Augmented Fine-Tuning",
            font_size=48,
            color=WHITE
        )
        title.next_to(code_group, DOWN, buff=0.8)

        # Subtitulo
        subtitle = Text(
            "Inteligencia Artificial para Procedimientos Mineros Seguros",
            font_size=28,
            color=AZUL_INFO
        )
        subtitle.next_to(title, DOWN, buff=0.5)

        # Logos institucionales (simulados)
        codelco_text = Text("CODELCO", font_size=24, color=NARANJA_ALERTA)
        codelco_text.to_edge(DOWN, buff=1).to_edge(LEFT, buff=2)

        sernageomin_text = Text("SERNAGEOMIN", font_size=24, color=AMARILLO)
        sernageomin_text.to_edge(DOWN, buff=1).to_edge(RIGHT, buff=2)

        # Animaciones
        self.play(
            FadeIn(code_box, scale=0.8),
            Write(code_text),
            run_time=1.2
        )
        self.play(Write(title, run_time=1.5))
        self.play(FadeIn(subtitle, shift=UP * 0.2), run_time=1)
        self.play(
            FadeIn(codelco_text, shift=RIGHT),
            FadeIn(sernageomin_text, shift=LEFT),
            run_time=0.8
        )
        self.wait(3)


class Scene003_ProblemaActual(Scene):
    """Explica el problema que RAFT resuelve"""

    def construct(self):
        self.camera.background_color = AZUL_OSCURO

        title = Text("El Problema Actual", font_size=48, color=ROJO_PELIGRO)
        title.to_edge(UP, buff=0.8)

        problems = [
            "Procedimientos desactualizados",
            "Variabilidad en redaccion",
            "Errores de cumplimiento normativo",
            "Tiempos de revision excesivos",
        ]

        # Crear lista de problemas con X rojas
        problem_items = VGroup()
        for i, problem in enumerate(problems):
            x_mark = Text("X", font_size=36, color=ROJO_PELIGRO, weight=BOLD)
            text = Text(problem, font_size=28, color=WHITE)
            text.next_to(x_mark, RIGHT, buff=0.3)
            item = VGroup(x_mark, text)
            problem_items.add(item)

        problem_items.arrange(DOWN, aligned_edge=LEFT, buff=0.6)
        problem_items.move_to(ORIGIN)

        # Animaciones
        self.play(Write(title, run_time=1))

        for item in problem_items:
            self.play(
                FadeIn(item[0], scale=0.5),  # X
                Write(item[1]),  # Texto
                run_time=0.8
            )
            self.wait(0.5)

        # Efecto de tachado
        strike = Line(
            problem_items.get_left() + LEFT * 0.5,
            problem_items.get_right() + RIGHT * 0.5,
            color=VERDE_CODELCO,
            stroke_width=6
        )
        self.wait(1)
        self.play(Create(strike, run_time=1))

        solution_text = Text(
            "SOLUCION: Modelo RAFT",
            font_size=36,
            color=VERDE_CODELCO,
            weight=BOLD
        )
        solution_text.to_edge(DOWN, buff=1)
        self.play(Write(solution_text, run_time=1))
        self.wait(2)


class Scene004_ComoFuncionaRAFT(Scene):
    """Diagrama de como funciona RAFT"""

    def construct(self):
        self.camera.background_color = AZUL_OSCURO

        title = Text("Como Funciona RAFT", font_size=48, color=VERDE_CODELCO)
        title.to_edge(UP, buff=0.5)

        # Componentes del diagrama
        # 1. RAG (Retrieval)
        rag_box = RoundedRectangle(
            width=3.5, height=2,
            corner_radius=0.2,
            fill_color="#16213E",
            fill_opacity=0.9,
            stroke_color=AZUL_INFO,
            stroke_width=3
        )
        rag_title = Text("RAG", font_size=28, color=AZUL_INFO, weight=BOLD)
        rag_desc = Text("Recuperacion de\nDocumentos", font_size=18, color=WHITE)
        rag_title.move_to(rag_box.get_center() + UP * 0.4)
        rag_desc.move_to(rag_box.get_center() + DOWN * 0.3)
        rag_group = VGroup(rag_box, rag_title, rag_desc)

        # 2. Fine-Tuning
        ft_box = RoundedRectangle(
            width=3.5, height=2,
            corner_radius=0.2,
            fill_color="#16213E",
            fill_opacity=0.9,
            stroke_color=NARANJA_ALERTA,
            stroke_width=3
        )
        ft_title = Text("Fine-Tuning", font_size=28, color=NARANJA_ALERTA, weight=BOLD)
        ft_desc = Text("Ajuste al Estilo\nCodelco", font_size=18, color=WHITE)
        ft_title.move_to(ft_box.get_center() + UP * 0.4)
        ft_desc.move_to(ft_box.get_center() + DOWN * 0.3)
        ft_group = VGroup(ft_box, ft_title, ft_desc)

        # 3. Output
        out_box = RoundedRectangle(
            width=3.5, height=2,
            corner_radius=0.2,
            fill_color="#16213E",
            fill_opacity=0.9,
            stroke_color=VERDE_CODELCO,
            stroke_width=3
        )
        out_title = Text("RAFT", font_size=28, color=VERDE_CODELCO, weight=BOLD)
        out_desc = Text("Procedimiento\nSeguro y Preciso", font_size=18, color=WHITE)
        out_title.move_to(out_box.get_center() + UP * 0.4)
        out_desc.move_to(out_box.get_center() + DOWN * 0.3)
        out_group = VGroup(out_box, out_title, out_desc)

        # Posicionar
        rag_group.move_to(LEFT * 4.5)
        ft_group.move_to(ORIGIN)
        out_group.move_to(RIGHT * 4.5)

        # Flechas
        arrow1 = Arrow(rag_group.get_right(), ft_group.get_left(),
                       color=WHITE, buff=0.2, stroke_width=3)
        arrow2 = Arrow(ft_group.get_right(), out_group.get_left(),
                       color=WHITE, buff=0.2, stroke_width=3)

        plus_sign = Text("+", font_size=48, color=WHITE)
        plus_sign.move_to(arrow1.get_center())

        equals_sign = Text("=", font_size=48, color=WHITE)
        equals_sign.move_to(arrow2.get_center())

        # Animaciones
        self.play(Write(title, run_time=1))
        self.play(FadeIn(rag_group, scale=0.8), run_time=0.8)
        self.play(Write(plus_sign), run_time=0.3)
        self.play(FadeIn(ft_group, scale=0.8), run_time=0.8)
        self.play(Write(equals_sign), run_time=0.3)
        self.play(FadeIn(out_group, scale=0.8), run_time=0.8)

        # Highlight final
        highlight = SurroundingRectangle(out_group, color=VERDE_CODELCO, buff=0.2)
        self.play(Create(highlight), run_time=0.5)
        self.wait(3)


class Scene005_BeneficiosClave(Scene):
    """Lista de beneficios con animacion"""

    def construct(self):
        self.camera.background_color = AZUL_OSCURO

        title = Text("Beneficios Clave", font_size=48, color=VERDE_CODELCO)
        title.to_edge(UP, buff=0.5)

        benefits = [
            ("Precision Maxima", "Anclaje en fuentes verificables"),
            ("Actualizacion Dinamica", "Cambios normativos en minutos"),
            ("Trazabilidad Total", "Cada instruccion documentada"),
            ("Cumplimiento Legal", "DS 132, DS 594 integrados"),
        ]

        self.play(Write(title, run_time=1))

        benefit_groups = []
        for i, (benefit, detail) in enumerate(benefits):
            # Icono de check
            check_circle = Circle(
                radius=0.4,
                fill_color=VERDE_CODELCO,
                fill_opacity=1,
                stroke_width=0
            )
            check = Text("", font_size=28, color=WHITE)
            check.move_to(check_circle)

            # Textos
            benefit_text = Text(benefit, font_size=28, color=WHITE, weight=BOLD)
            detail_text = Text(detail, font_size=20, color=AZUL_INFO)

            benefit_text.next_to(check_circle, RIGHT, buff=0.4)
            detail_text.next_to(benefit_text, DOWN, aligned_edge=LEFT, buff=0.1)

            group = VGroup(check_circle, check, benefit_text, detail_text)
            group.move_to(LEFT * 2 + UP * (1.5 - i * 1.3))
            benefit_groups.append(group)

        for group in benefit_groups:
            self.play(
                FadeIn(group[0], scale=0.5),  # Circulo
                FadeIn(group[1], scale=0.5),  # Check
                run_time=0.3
            )
            self.play(
                Write(group[2]),  # Beneficio
                FadeIn(group[3], shift=UP * 0.1),  # Detalle
                run_time=0.8
            )
            self.wait(0.5)

        self.wait(2)


class Scene006_FlujoPractico(Scene):
    """Flujo practico de uso en terreno"""

    def construct(self):
        self.camera.background_color = AZUL_OSCURO

        title = Text("Aplicacion en Terreno", font_size=48, color=VERDE_CODELCO)
        title.to_edge(UP, buff=0.5)

        steps = [
            ("1", "Supervisor solicita\nprocedimiento", AZUL_INFO),
            ("2", "Sistema recupera\nnormativas", NARANJA_ALERTA),
            ("3", "IA genera\nborrador", VERDE_CODELCO),
            ("4", "Validacion y\naprobacion", AMARILLO),
        ]

        self.play(Write(title, run_time=1))

        step_groups = []
        for i, (num, text, color) in enumerate(steps):
            # Circulo numerado
            circle = Circle(
                radius=0.5,
                fill_color=color,
                fill_opacity=1,
                stroke_width=0
            )
            num_text = Text(num, font_size=36, color=WHITE if color != AMARILLO else "#1a1a2e", weight=BOLD)
            num_text.move_to(circle)

            # Caja de descripcion
            box = RoundedRectangle(
                width=2.8, height=1.5,
                corner_radius=0.15,
                fill_color="#16213E",
                fill_opacity=0.9,
                stroke_color=color,
                stroke_width=2
            )
            desc = Text(text, font_size=18, color=WHITE, line_spacing=1.2)
            desc.move_to(box)

            circle.next_to(box, UP, buff=0.2)
            group = VGroup(circle, num_text, box, desc)
            step_groups.append(group)

        # Posicionar horizontalmente
        all_steps = VGroup(*step_groups).arrange(RIGHT, buff=0.8)
        all_steps.move_to(DOWN * 0.5)

        # Flechas entre pasos
        arrows = []
        for i in range(len(step_groups) - 1):
            arrow = Arrow(
                step_groups[i].get_right() + LEFT * 0.3,
                step_groups[i+1].get_left() + RIGHT * 0.3,
                color=WHITE,
                buff=0.1,
                stroke_width=2
            )
            arrows.append(arrow)

        # Animaciones secuenciales
        for i, group in enumerate(step_groups):
            self.play(
                FadeIn(group[0], scale=0.5),  # Circulo
                FadeIn(group[1]),  # Numero
                FadeIn(group[2], scale=0.9),  # Caja
                Write(group[3]),  # Descripcion
                run_time=0.8
            )
            if i < len(arrows):
                self.play(GrowArrow(arrows[i]), run_time=0.4)

        self.wait(3)


class Scene007_Conclusion(Scene):
    """Conclusion y llamado a la accion"""

    def construct(self):
        self.camera.background_color = AZUL_OSCURO

        # Mensaje principal
        main_text = Text(
            "RAFT: El Futuro de la\nSeguridad Minera",
            font_size=56,
            color=WHITE,
            line_spacing=1.3
        )

        # Subrayado animado
        underline = Line(
            main_text.get_left() + DOWN * 0.3,
            main_text.get_right() + DOWN * 0.3,
            color=VERDE_CODELCO,
            stroke_width=4
        )

        # Mensaje de cierre
        closing = Text(
            "Precision. Seguridad. Cumplimiento.",
            font_size=32,
            color=VERDE_CODELCO
        )
        closing.next_to(main_text, DOWN, buff=1)

        # Logo final
        logo = Text("MCCO", font_size=48, color=VERDE_CODELCO, weight=BOLD)
        logo.to_edge(DOWN, buff=1)

        # Animaciones
        self.play(Write(main_text, run_time=2))
        self.play(Create(underline, run_time=0.8))
        self.play(FadeIn(closing, shift=UP * 0.3), run_time=1)
        self.wait(1)
        self.play(FadeIn(logo, scale=0.8), run_time=0.8)

        # Fade final
        self.wait(2)
        self.play(
            *[FadeOut(mob) for mob in self.mobjects],
            run_time=1.5
        )


# Para renderizar todo el video:
# manim -pqh generate_raft_video.py Scene001_IntroMCCO Scene002_TituloRAFT ...

if __name__ == "__main__":
    print("""
    =====================================================
    SISTEMA DE GENERACION DE VIDEOS MCCO
    =====================================================

    Para renderizar el video completo, ejecuta:

    manim -pqh generate_raft_video.py Scene001_IntroMCCO
    manim -pqh generate_raft_video.py Scene002_TituloRAFT
    manim -pqh generate_raft_video.py Scene003_ProblemaActual
    manim -pqh generate_raft_video.py Scene004_ComoFuncionaRAFT
    manim -pqh generate_raft_video.py Scene005_BeneficiosClave
    manim -pqh generate_raft_video.py Scene006_FlujoPractico
    manim -pqh generate_raft_video.py Scene007_Conclusion

    O todas juntas con:
    manim -pqh generate_raft_video.py

    Opciones de calidad:
    -ql  : Baja (480p, rapido para preview)
    -qm  : Media (720p)
    -qh  : Alta (1080p)
    -qk  : 4K (2160p, lento)

    El video se guardara en: media/videos/
    =====================================================
    """)
