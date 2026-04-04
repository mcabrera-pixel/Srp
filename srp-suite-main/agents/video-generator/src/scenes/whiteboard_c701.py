"""
Whiteboard Scenes for Compresor C-701 - 3Blue1Brown Style
=========================================================
Professional training video with animated whiteboard effects.

PRO.0908.MPEF1 - Mantencion Preventiva Compresor de Oxigeno C-701
CODELCO Chuquicamata

Usage:
    manim -pql whiteboard_c701.py IntroScene
    manim -pqh whiteboard_c701.py CompresorC701Whiteboard  (Full video 1080p)
"""
from manim import *
import sys
from pathlib import Path

# Add project path
sys.path.insert(0, str(Path(__file__).parent.parent))

from styles.whiteboard import (
    WhiteboardScene,
    ChalkText, ChalkTitle, ChalkBox, ChalkArrow,
    WarningBox, StepIndicator, ProgressBar, FlowDiagram,
    draw_then_fill, indicate_element,
    BOARD_DARK, CHALK_WHITE, CHALK_BLUE, CHALK_YELLOW, CHALK_GREEN,
    CODELCO_GREEN, CODELCO_ORANGE, SAFETY_RED, SAFETY_YELLOW,
)


# ══════════════════════════════════════════════════════════════════════════════
# SCENE 1: INTRO - Cinematic Opening
# ══════════════════════════════════════════════════════════════════════════════

class IntroScene(WhiteboardScene):
    """
    Cinematic intro with CODELCO branding and procedure title.
    Duration: ~12 seconds
    """

    def construct(self):
        self.setup_board()

        # Particles background effect
        particles = VGroup(*[
            Dot(
                point=[np.random.uniform(-8, 8), np.random.uniform(-5, 5), 0],
                radius=0.03,
                color=CODELCO_GREEN,
                fill_opacity=0.4,
            )
            for _ in range(80)
        ])

        # Logo CODELCO
        logo = ChalkTitle("CODELCO", color=CODELCO_ORANGE)
        logo.scale(1.5)

        # Decorative lines
        line_top = Line(LEFT * 6, RIGHT * 6, color=CODELCO_ORANGE, stroke_width=3)
        line_bot = line_top.copy()
        line_top.next_to(logo, UP, buff=0.5)
        line_bot.next_to(logo, DOWN, buff=0.5)

        # Animate particles
        self.play(FadeIn(particles, lag_ratio=0.01), run_time=1.5)

        # Draw lines then logo
        self.play(
            GrowFromCenter(line_top),
            GrowFromCenter(line_bot),
            run_time=0.8
        )
        self.play(
            Write(logo, run_time=2),
            particles.animate.set_opacity(0.15),
            rate_func=smooth
        )

        self.wait(1)

        # Transform to procedure title
        self.play(
            logo.animate.scale(0.5).to_edge(UP, buff=0.8),
            FadeOut(line_top),
            FadeOut(line_bot),
            FadeOut(particles),
            run_time=1.2
        )

        # Procedure code box
        code_box = ChalkBox(width=7, height=1.2, stroke_color=CODELCO_GREEN)
        code_text = ChalkText("PRO.0908.MPEF1", font_size=36, color=CODELCO_GREEN)
        code_text.move_to(code_box)
        code_group = VGroup(code_box, code_text)
        code_group.next_to(logo, DOWN, buff=0.8)

        draw_then_fill(self, code_box, fill_color=CODELCO_GREEN, fill_opacity=0.15)
        self.play(Write(code_text, run_time=1))

        # Main title
        title = ChalkTitle("Mantencion Preventiva", color=CHALK_WHITE)
        title.scale(0.9)
        title.next_to(code_group, DOWN, buff=0.6)

        subtitle = ChalkText(
            "Compresor de Oxigeno C-701",
            font_size=38,
            color=CODELCO_ORANGE
        )
        subtitle.next_to(title, DOWN, buff=0.3)

        location = ChalkText(
            "Fundicion Chuquicamata",
            font_size=24,
            color=CHALK_BLUE
        )
        location.next_to(subtitle, DOWN, buff=0.4)

        self.play(Write(title, run_time=1.5))
        self.play(FadeIn(subtitle, shift=UP * 0.2), run_time=0.8)
        self.play(FadeIn(location, shift=UP * 0.2), run_time=0.6)

        self.wait(2)

        # Transition out
        self.play(
            *[FadeOut(mob) for mob in self.mobjects],
            run_time=1
        )


# ══════════════════════════════════════════════════════════════════════════════
# SCENE 2: EPP - Equipment Visualization
# ══════════════════════════════════════════════════════════════════════════════

class EPPScene(WhiteboardScene):
    """
    EPP requirements with animated icons.
    Duration: ~15 seconds
    """

    def construct(self):
        self.setup_board()

        # Header
        header = ChalkTitle("EPP Especifico", color=CODELCO_ORANGE)
        header.to_edge(UP, buff=0.6)
        self.play(Write(header, run_time=1))

        # Subheader
        subheader = ChalkText(
            "Ambiente con Oxigeno - Precauciones Especiales",
            font_size=24,
            color=CHALK_BLUE
        )
        subheader.next_to(header, DOWN, buff=0.3)
        self.play(FadeIn(subheader, shift=UP * 0.2), run_time=0.6)

        # EPP items in grid
        epp_items = [
            ("1", "Buzo ignifugo", "Sin grasas"),
            ("2", "Full-Face", "Para soplado"),
            ("3", "Arnes seguridad", "Altura"),
            ("4", "Guantes antigolpe", "Limpios O2"),
            ("5", "Lentes claros", "Proteccion"),
            ("6", "Zapato seguridad", "Sin aceite"),
        ]

        epp_grid = VGroup()

        for num, name, detail in epp_items:
            # Step indicator
            indicator = StepIndicator(int(num), color=CHALK_BLUE)

            # Labels
            name_text = ChalkText(name, font_size=20)
            detail_text = ChalkText(detail, font_size=14, color=CHALK_BLUE)

            name_text.next_to(indicator, DOWN, buff=0.15)
            detail_text.next_to(name_text, DOWN, buff=0.08)

            item = VGroup(indicator, name_text, detail_text)
            epp_grid.add(item)

        epp_grid.arrange_in_grid(rows=2, cols=3, buff=(1.0, 0.8))
        epp_grid.move_to(ORIGIN).shift(DOWN * 0.2)

        # Animate each EPP item
        for item in epp_grid:
            self.play(
                FadeIn(item[0], scale=0.5),  # StepIndicator
                run_time=0.3
            )
            self.play(
                Write(item[1]),  # Name
                FadeIn(item[2], shift=UP * 0.1),  # Detail
                run_time=0.4
            )

        self.wait(0.5)

        # Critical warning at bottom
        warning = WarningBox(
            "TODO libre de grasas y aceites - Riesgo ignicion con O2",
            level="danger"
        )
        warning.to_edge(DOWN, buff=0.6)

        self.play(FadeIn(warning, scale=0.9), run_time=0.8)

        # Pulse warning
        self.play(
            warning[0].animate.set_stroke(width=5),
            rate_func=there_and_back,
            run_time=0.6
        )

        self.wait(2)
        self.fade_all()


# ══════════════════════════════════════════════════════════════════════════════
# SCENE 3: COMPRESSOR DIAGRAM - Technical Drawing
# ══════════════════════════════════════════════════════════════════════════════

class CompressorDiagramScene(WhiteboardScene):
    """
    Animated technical diagram of compressor with labels.
    Duration: ~25 seconds
    """

    def construct(self):
        self.setup_board()

        # Title
        title = ChalkTitle("Compresor C-701", color=CODELCO_ORANGE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title, run_time=1))

        subtitle = ChalkText("Componentes Principales", font_size=28, color=CHALK_BLUE)
        subtitle.next_to(title, DOWN, buff=0.2)
        self.play(FadeIn(subtitle), run_time=0.5)

        # ══════════ Draw Compressor ══════════

        # Cylinder (main body)
        cylinder = Rectangle(
            width=3, height=5,
            color=CHALK_BLUE,
            stroke_width=4,
        ).shift(LEFT * 1.5)

        # Draw cylinder with fill effect
        draw_then_fill(self, cylinder, fill_color=CHALK_BLUE, fill_opacity=0.1)

        # Culata (head)
        head = Rectangle(
            width=3.5, height=0.6,
            color=CODELCO_ORANGE,
            stroke_width=4,
        )
        head.next_to(cylinder, UP, buff=0)

        draw_then_fill(self, head, fill_color=CODELCO_ORANGE, fill_opacity=0.2)

        # Embolo (piston)
        piston = Rectangle(
            width=2.7, height=1,
            color=SAFETY_YELLOW,
            stroke_width=4,
        )
        piston.move_to(cylinder.get_center() + UP * 0.5)

        draw_then_fill(self, piston, fill_color=SAFETY_YELLOW, fill_opacity=0.25)

        # Vastago (rod)
        rod = Line(
            piston.get_bottom(),
            piston.get_bottom() + DOWN * 2.2,
            color=CHALK_WHITE,
            stroke_width=5,
        )
        self.play(Create(rod, run_time=0.8))

        # Seals
        seal_l = Rectangle(
            width=0.25, height=0.7,
            color=CHALK_GREEN,
            stroke_width=3,
            fill_color=CHALK_GREEN,
            fill_opacity=0.4,
        )
        seal_l.next_to(rod, LEFT, buff=0).shift(DOWN * 0.5)
        seal_r = seal_l.copy().next_to(rod, RIGHT, buff=0).shift(DOWN * 0.5)

        self.play(FadeIn(seal_l), FadeIn(seal_r), run_time=0.5)

        # ══════════ Add Labels with Arrows ══════════

        labels_data = [
            ("Culata", head, RIGHT * 3 + UP * 0.5),
            ("Cilindro", cylinder.get_center() + RIGHT * 4, cylinder.get_center()),
            ("Embolo", piston, RIGHT * 3),
            ("Vastago", rod.get_center() + LEFT * 2.5, rod.get_center()),
            ("Sellos", seal_l, LEFT * 2 + DOWN * 0.5),
        ]

        for name, target, offset in labels_data:
            target_point = target.get_center() if hasattr(target, 'get_center') else target

            label = ChalkText(name, font_size=18, color=CHALK_WHITE)
            if isinstance(offset, np.ndarray):
                label.move_to(target_point + offset)
            else:
                label.next_to(target, offset, buff=1.5)

            # Determine arrow direction
            arrow = ChalkArrow(
                label.get_center(),
                target_point,
                color=CHALK_BLUE,
            )

            self.play(
                FadeIn(label),
                GrowArrow(arrow),
                run_time=0.5
            )

        # ══════════ Zoom to tolerances ══════════

        self.wait(1)

        # Tolerances box on right
        tol_title = ChalkText("Tolerancias Criticas", font_size=22, color=SAFETY_YELLOW)
        tol_items = VGroup(
            ChalkText("Huelgo diametral:", font_size=16, color=CHALK_WHITE),
            ChalkText("0.06 - 0.10 mm", font_size=20, color=CHALK_GREEN),
            ChalkText("", font_size=8),
            ChalkText("Huelgo axial:", font_size=16, color=CHALK_WHITE),
            ChalkText("~ 0.2 mm", font_size=20, color=CHALK_GREEN),
        ).arrange(DOWN, buff=0.1, aligned_edge=LEFT)

        tol_group = VGroup(tol_title, tol_items).arrange(DOWN, buff=0.2)
        tol_box = ChalkBox(
            width=tol_group.width + 0.6,
            height=tol_group.height + 0.4,
            stroke_color=SAFETY_YELLOW,
        )
        tol_box.move_to(tol_group)
        tol_full = VGroup(tol_box, tol_group)
        tol_full.to_edge(RIGHT, buff=0.5).shift(DOWN)

        draw_then_fill(self, tol_box, fill_color=BOARD_DARK, fill_opacity=0.9)
        self.play(FadeIn(tol_group), run_time=0.8)

        # Camera zoom to piston area
        self.camera_zoom(0.7, target=piston)
        self.wait(1.5)
        self.camera_reset()

        self.wait(2)
        self.fade_all()


# ══════════════════════════════════════════════════════════════════════════════
# SCENE 4: DISASSEMBLY STEPS
# ══════════════════════════════════════════════════════════════════════════════

class DisassemblyScene(WhiteboardScene):
    """
    Step-by-step disassembly with progress bar.
    Duration: ~30 seconds
    """

    def construct(self):
        self.setup_board()

        # Title
        title = ChalkTitle("Desmontaje", color=CODELCO_ORANGE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title, run_time=1))

        # Pre-requisite warning
        prereq = WarningBox(
            "BLOQUEO verificado - Compresor FUERA de operacion",
            level="warning"
        )
        prereq.scale(0.85)
        prereq.next_to(title, DOWN, buff=0.3)
        self.play(FadeIn(prereq, scale=0.9), run_time=0.6)

        # Steps
        steps = [
            "Desconectar canerias de refrigeracion",
            "Sacar tuercas fijacion culata→cilindro",
            "Retirar ajuste de goma y culata",
            "Verificar holgura embolo↔cilindro",
            "Soltar tuerca chaveta + tornillo seguridad",
            "Sacar tuercas vastago piston",
            "Desmontar embolo → lugar limpio",
        ]

        step_colors = [
            CHALK_BLUE, CHALK_WHITE, CODELCO_ORANGE,
            SAFETY_YELLOW, CHALK_WHITE, CHALK_BLUE, CHALK_GREEN
        ]

        # Progress bar at bottom
        progress = ProgressBar(len(steps), width=8)
        progress.to_edge(DOWN, buff=0.5)
        self.play(Create(progress.bg), run_time=0.3)

        # Step list
        step_vgroup = VGroup()

        for i, (step_text, color) in enumerate(zip(steps, step_colors)):
            indicator = StepIndicator(i + 1, color=color)
            indicator.scale(0.8)

            desc = ChalkText(step_text, font_size=18, color=CHALK_WHITE)
            desc.next_to(indicator, RIGHT, buff=0.4)

            row = VGroup(indicator, desc)
            step_vgroup.add(row)

        step_vgroup.arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        step_vgroup.next_to(prereq, DOWN, buff=0.4).shift(LEFT * 0.5)

        # Animate steps one by one with progress
        for i, row in enumerate(step_vgroup):
            self.play(
                FadeIn(row[0], scale=0.5),  # Indicator
                Write(row[1], run_time=0.6),  # Description
                progress.set_progress(i + 1),
                run_time=0.6
            )
            self.wait(0.3)

        # Highlight final step
        indicate_element(self, step_vgroup[-1], color=CHALK_GREEN)

        self.wait(2)
        self.fade_all()


# ══════════════════════════════════════════════════════════════════════════════
# SCENE 5: RISKS
# ══════════════════════════════════════════════════════════════════════════════

class RisksScene(WhiteboardScene):
    """
    Critical risks with color-coded badges.
    Duration: ~20 seconds
    """

    def construct(self):
        self.setup_board()

        # Title
        title = ChalkTitle("Riesgos Criticos", color=SAFETY_RED)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title, run_time=1))

        # Risk data
        risks = [
            ("RC-1", "Energia Electrica", "Solo tableros autorizados", SAFETY_YELLOW),
            ("RC-2", "Trabajo en Altura", "Arnes + detencion caidas", SAFETY_RED),
            ("RC-3", "Maniobras Izaje", "Comunicacion operador↔rigger", CODELCO_ORANGE),
            ("RC-4", "Presion Neumatica", "Bloqueo + energia cero", SAFETY_RED),
            ("RC-6", "Variables Fuego", "Protocolo trabajo caliente", SAFETY_YELLOW),
            ("RC-9", "Partes Moviles", "Guardas + bloqueo verificado", CODELCO_ORANGE),
        ]

        risk_group = VGroup()

        for code, name, control, color in risks:
            # Badge
            badge_box = ChalkBox(
                width=1.3, height=0.55,
                stroke_color=color,
            )
            badge_text = ChalkText(code, font_size=18, color=color)
            badge_text.move_to(badge_box)
            badge = VGroup(badge_box, badge_text)

            # Description
            name_text = ChalkText(name, font_size=20, color=CHALK_WHITE)
            ctrl_text = ChalkText(control, font_size=15, color=CHALK_BLUE)
            desc = VGroup(name_text, ctrl_text).arrange(DOWN, buff=0.05, aligned_edge=LEFT)

            row = VGroup(badge, desc).arrange(RIGHT, buff=0.6)
            risk_group.add(row)

        risk_group.arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        risk_group.move_to(ORIGIN).shift(UP * 0.3)

        # Animate risks
        for row in risk_group:
            self.play(
                FadeIn(row[0], scale=0.8),  # Badge
                run_time=0.3
            )
            self.play(
                Write(row[1][0], run_time=0.4),  # Name
                FadeIn(row[1][1], shift=UP * 0.1),  # Control
                run_time=0.4
            )

        # Critical alert
        alert = WarningBox(
            "Si O2 > 22% → DETENGA la tarea inmediatamente",
            level="danger"
        )
        alert.to_edge(DOWN, buff=0.5)

        self.play(FadeIn(alert, scale=0.9), run_time=0.8)

        # Pulse effect
        for _ in range(2):
            self.play(
                alert[0].animate.set_stroke(width=5),
                rate_func=there_and_back,
                run_time=0.5
            )

        self.wait(2)
        self.fade_all()


# ══════════════════════════════════════════════════════════════════════════════
# SCENE 6: EMERGENCY
# ══════════════════════════════════════════════════════════════════════════════

class EmergencyScene(WhiteboardScene):
    """
    Emergency procedures with phone number.
    Duration: ~15 seconds
    """

    def construct(self):
        self.setup_board()

        # Title
        title = ChalkTitle("Emergencias", color=SAFETY_RED)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title, run_time=1))

        # Phone number prominent
        phone = ChalkTitle("55-2-327-327", color=SAFETY_YELLOW)
        phone.scale(1.3)

        phone_icon = ChalkText("Fono:", font_size=28, color=CHALK_WHITE)
        phone_icon.next_to(phone, LEFT, buff=0.4)

        phone_label = ChalkText(
            "Fundicion Chuquicamata",
            font_size=24,
            color=CHALK_WHITE
        )
        phone_label.next_to(phone, DOWN, buff=0.3)

        phone_group = VGroup(phone_icon, phone, phone_label)
        phone_box = ChalkBox(
            width=phone_group.width + 1,
            height=phone_group.height + 0.6,
            stroke_color=SAFETY_YELLOW,
        )
        phone_box.move_to(phone_group)
        phone_full = VGroup(phone_box, phone_group)
        phone_full.shift(UP * 0.5)

        draw_then_fill(self, phone_box, fill_color=BOARD_DARK, fill_opacity=0.8)
        self.play(
            Write(phone, run_time=1),
            FadeIn(phone_icon),
            FadeIn(phone_label, shift=UP * 0.2),
        )

        # Pulse phone
        self.play(
            phone.animate.set_color(SAFETY_RED),
            rate_func=there_and_back,
            run_time=0.5
        )

        # Emergency types
        emergencies = [
            ("Incendio", "Solo si es incipiente y capacitado"),
            ("Accidente", "Fono emergencias → ambulancia"),
            ("Sismo", "Evacuacion → zona seguridad"),
        ]

        em_group = VGroup()
        for em_title, em_desc in emergencies:
            t = ChalkText(em_title, font_size=22, color=CODELCO_ORANGE)
            d = ChalkText(em_desc, font_size=16, color=CHALK_WHITE)
            em_group.add(VGroup(t, d).arrange(DOWN, buff=0.08, aligned_edge=LEFT))

        em_group.arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        em_group.next_to(phone_full, DOWN, buff=0.6)

        for em in em_group:
            self.play(FadeIn(em, shift=UP * 0.2), run_time=0.4)

        self.wait(2)
        self.fade_all()


# ══════════════════════════════════════════════════════════════════════════════
# SCENE 7: CLOSING
# ══════════════════════════════════════════════════════════════════════════════

class ClosingScene(WhiteboardScene):
    """
    Closing message with safety reminder.
    Duration: ~12 seconds
    """

    def construct(self):
        self.setup_board()

        # Main message
        msg1 = ChalkText(
            "Si las condiciones cambian,",
            font_size=42,
            color=CHALK_WHITE
        )
        msg2 = ChalkTitle(
            "DETEN la tarea",
            color=SAFETY_YELLOW
        )
        msg2.scale(0.9)
        msg3 = ChalkText(
            "y reevalua los riesgos.",
            font_size=42,
            color=CHALK_WHITE
        )

        messages = VGroup(msg1, msg2, msg3).arrange(DOWN, buff=0.5)

        self.play(Write(msg1, run_time=1.2))
        self.play(Write(msg2, run_time=1))
        self.play(Write(msg3, run_time=1.2))

        self.wait(1)

        # Final emphasis
        final = ChalkTitle(
            "Tu seguridad es lo primero.",
            color=CODELCO_ORANGE
        )
        final.scale(0.85)
        final.next_to(messages, DOWN, buff=0.8)

        self.play(FadeIn(final, scale=0.8), run_time=1)

        # Branding
        brand = ChalkText(
            "PRO.0908.MPEF1 - SRP Learn x CODELCO",
            font_size=18,
            color=CHALK_BLUE
        )
        brand.to_edge(DOWN, buff=0.5)
        self.play(FadeIn(brand), run_time=0.5)

        self.wait(2)

        # Fade out
        self.play(
            *[FadeOut(mob) for mob in self.mobjects],
            run_time=1.5
        )


# ══════════════════════════════════════════════════════════════════════════════
# COMPLETE VIDEO - All Scenes Combined
# ══════════════════════════════════════════════════════════════════════════════

class CompresorC701Whiteboard(WhiteboardScene):
    """
    Complete training video combining all scenes.

    Render:
        manim -pqh whiteboard_c701.py CompresorC701Whiteboard

    Duration: ~2:00 minutes
    """

    def construct(self):
        self.setup_board()

        # Scene 1: Intro
        self._intro()

        # Scene 2: EPP
        self._epp()

        # Scene 3: Compressor Diagram
        self._diagram()

        # Scene 4: Disassembly
        self._disassembly()

        # Scene 5: Risks
        self._risks()

        # Scene 6: Emergency
        self._emergency()

        # Scene 7: Closing
        self._closing()

    def _intro(self):
        """Cinematic intro."""
        # Particles
        particles = VGroup(*[
            Dot(
                point=[np.random.uniform(-8, 8), np.random.uniform(-5, 5), 0],
                radius=0.03,
                color=CODELCO_GREEN,
                fill_opacity=0.4,
            )
            for _ in range(80)
        ])

        logo = ChalkTitle("CODELCO", color=CODELCO_ORANGE).scale(1.5)
        lines = VGroup(
            Line(LEFT * 6, RIGHT * 6, color=CODELCO_ORANGE, stroke_width=3).next_to(logo, UP, buff=0.5),
            Line(LEFT * 6, RIGHT * 6, color=CODELCO_ORANGE, stroke_width=3).next_to(logo, DOWN, buff=0.5)
        )

        self.play(FadeIn(particles, lag_ratio=0.01), run_time=1.5)
        self.play(*[GrowFromCenter(l) for l in lines], run_time=0.8)
        self.play(Write(logo, run_time=2), particles.animate.set_opacity(0.15))
        self.wait(1)

        self.play(
            logo.animate.scale(0.5).to_edge(UP, buff=0.8),
            FadeOut(lines), FadeOut(particles),
            run_time=1.2
        )

        # Procedure info
        code_box = ChalkBox(width=7, height=1.2, stroke_color=CODELCO_GREEN)
        code_text = ChalkText("PRO.0908.MPEF1", font_size=36, color=CODELCO_GREEN)
        code_text.move_to(code_box)
        code_group = VGroup(code_box, code_text).next_to(logo, DOWN, buff=0.8)

        draw_then_fill(self, code_box, fill_color=CODELCO_GREEN, fill_opacity=0.15)
        self.play(Write(code_text, run_time=1))

        title = ChalkTitle("Mantencion Preventiva", color=CHALK_WHITE).scale(0.9)
        title.next_to(code_group, DOWN, buff=0.6)
        subtitle = ChalkText("Compresor de Oxigeno C-701", font_size=38, color=CODELCO_ORANGE)
        subtitle.next_to(title, DOWN, buff=0.3)
        location = ChalkText("Fundicion Chuquicamata", font_size=24, color=CHALK_BLUE)
        location.next_to(subtitle, DOWN, buff=0.4)

        self.play(Write(title, run_time=1.5))
        self.play(FadeIn(subtitle, shift=UP * 0.2), run_time=0.8)
        self.play(FadeIn(location, shift=UP * 0.2), run_time=0.6)
        self.wait(2)
        self.fade_all()

    def _epp(self):
        """EPP scene."""
        header = ChalkTitle("EPP Especifico", color=CODELCO_ORANGE).to_edge(UP, buff=0.6)
        self.play(Write(header, run_time=1))

        subheader = ChalkText("Ambiente con Oxigeno", font_size=24, color=CHALK_BLUE)
        subheader.next_to(header, DOWN, buff=0.3)
        self.play(FadeIn(subheader), run_time=0.5)

        epp_items = [
            ("1", "Buzo ignifugo", "Sin grasas"),
            ("2", "Full-Face", "Para soplado"),
            ("3", "Arnes", "Altura"),
            ("4", "Guantes", "Limpios"),
            ("5", "Lentes", "Proteccion"),
            ("6", "Zapatos", "Sin aceite"),
        ]

        epp_grid = VGroup()
        for num, name, detail in epp_items:
            indicator = StepIndicator(int(num), color=CHALK_BLUE)
            name_text = ChalkText(name, font_size=18)
            detail_text = ChalkText(detail, font_size=12, color=CHALK_BLUE)
            name_text.next_to(indicator, DOWN, buff=0.12)
            detail_text.next_to(name_text, DOWN, buff=0.06)
            epp_grid.add(VGroup(indicator, name_text, detail_text))

        epp_grid.arrange_in_grid(rows=2, cols=3, buff=(0.9, 0.7))
        epp_grid.move_to(ORIGIN).shift(DOWN * 0.2)

        for item in epp_grid:
            self.play(FadeIn(item[0], scale=0.5), run_time=0.25)
            self.play(Write(item[1]), FadeIn(item[2]), run_time=0.35)

        warning = WarningBox("TODO libre de grasas - Riesgo ignicion O2", level="danger")
        warning.to_edge(DOWN, buff=0.5)
        self.play(FadeIn(warning, scale=0.9), run_time=0.7)
        self.wait(2)
        self.fade_all()

    def _diagram(self):
        """Compressor diagram."""
        title = ChalkTitle("Compresor C-701", color=CODELCO_ORANGE).to_edge(UP, buff=0.5)
        self.play(Write(title, run_time=1))

        # Simplified compressor
        cylinder = Rectangle(width=3, height=5, color=CHALK_BLUE, stroke_width=4).shift(LEFT * 1.5)
        draw_then_fill(self, cylinder, fill_color=CHALK_BLUE, fill_opacity=0.1)

        head = Rectangle(width=3.5, height=0.6, color=CODELCO_ORANGE, stroke_width=4)
        head.next_to(cylinder, UP, buff=0)
        draw_then_fill(self, head, fill_color=CODELCO_ORANGE, fill_opacity=0.2)

        piston = Rectangle(width=2.7, height=1, color=SAFETY_YELLOW, stroke_width=4)
        piston.move_to(cylinder.get_center() + UP * 0.5)
        draw_then_fill(self, piston, fill_color=SAFETY_YELLOW, fill_opacity=0.25)

        rod = Line(piston.get_bottom(), piston.get_bottom() + DOWN * 2.2, color=CHALK_WHITE, stroke_width=5)
        self.play(Create(rod, run_time=0.8))

        # Labels
        labels = [("Culata", head), ("Embolo", piston), ("Vastago", rod)]
        for name, target in labels:
            label = ChalkText(name, font_size=16, color=CHALK_WHITE)
            label.next_to(target, RIGHT, buff=1.5)
            arrow = ChalkArrow(label.get_left(), target.get_right(), color=CHALK_BLUE)
            self.play(FadeIn(label), GrowArrow(arrow), run_time=0.4)

        # Tolerances
        tol = VGroup(
            ChalkText("Tolerancias:", font_size=20, color=SAFETY_YELLOW),
            ChalkText("Diametral: 0.06-0.10mm", font_size=16, color=CHALK_GREEN),
            ChalkText("Axial: ~0.2mm", font_size=16, color=CHALK_GREEN),
        ).arrange(DOWN, buff=0.12, aligned_edge=LEFT)
        tol.to_edge(RIGHT, buff=0.6).shift(DOWN)
        self.play(FadeIn(tol), run_time=0.8)

        self.camera_zoom(0.7, target=piston)
        self.wait(1)
        self.camera_reset()
        self.wait(1)
        self.fade_all()

    def _disassembly(self):
        """Disassembly steps."""
        title = ChalkTitle("Desmontaje", color=CODELCO_ORANGE).to_edge(UP, buff=0.5)
        self.play(Write(title, run_time=1))

        prereq = WarningBox("BLOQUEO verificado", level="warning")
        prereq.scale(0.8).next_to(title, DOWN, buff=0.3)
        self.play(FadeIn(prereq), run_time=0.5)

        steps = [
            "Desconectar refrigeracion",
            "Sacar tuercas culata",
            "Retirar culata",
            "Verificar holgura",
            "Soltar seguridad",
            "Desmontar embolo",
        ]
        colors = [CHALK_BLUE, CHALK_WHITE, CODELCO_ORANGE, SAFETY_YELLOW, CHALK_WHITE, CHALK_GREEN]

        progress = ProgressBar(len(steps), width=7).to_edge(DOWN, buff=0.5)
        self.play(Create(progress.bg), run_time=0.3)

        step_group = VGroup()
        for i, (s, c) in enumerate(zip(steps, colors)):
            ind = StepIndicator(i + 1, color=c).scale(0.75)
            txt = ChalkText(s, font_size=16, color=CHALK_WHITE)
            txt.next_to(ind, RIGHT, buff=0.3)
            step_group.add(VGroup(ind, txt))

        step_group.arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        step_group.next_to(prereq, DOWN, buff=0.35).shift(LEFT * 0.5)

        for i, row in enumerate(step_group):
            self.play(
                FadeIn(row[0], scale=0.5),
                Write(row[1], run_time=0.5),
                progress.set_progress(i + 1),
                run_time=0.5
            )

        self.wait(1.5)
        self.fade_all()

    def _risks(self):
        """Risks scene."""
        title = ChalkTitle("Riesgos Criticos", color=SAFETY_RED).to_edge(UP, buff=0.5)
        self.play(Write(title, run_time=1))

        risks = [
            ("RC-1", "Energia Electrica", SAFETY_YELLOW),
            ("RC-2", "Trabajo Altura", SAFETY_RED),
            ("RC-3", "Izaje", CODELCO_ORANGE),
            ("RC-4", "Presion", SAFETY_RED),
        ]

        risk_group = VGroup()
        for code, name, color in risks:
            badge = ChalkBox(width=1.1, height=0.5, stroke_color=color)
            badge_text = ChalkText(code, font_size=16, color=color)
            badge_text.move_to(badge)
            name_text = ChalkText(name, font_size=18, color=CHALK_WHITE)
            name_text.next_to(badge, RIGHT, buff=0.5)
            risk_group.add(VGroup(badge, badge_text, name_text))

        risk_group.arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        risk_group.move_to(ORIGIN)

        for row in risk_group:
            self.play(FadeIn(row), run_time=0.4)

        alert = WarningBox("Si O2 > 22% → DETENGA tarea", level="danger")
        alert.to_edge(DOWN, buff=0.5)
        self.play(FadeIn(alert), run_time=0.6)
        self.wait(2)
        self.fade_all()

    def _emergency(self):
        """Emergency scene."""
        title = ChalkTitle("Emergencias", color=SAFETY_RED).to_edge(UP, buff=0.5)
        self.play(Write(title, run_time=1))

        phone = ChalkTitle("55-2-327-327", color=SAFETY_YELLOW).scale(1.2)
        phone_label = ChalkText("Fundicion Chuquicamata", font_size=22, color=CHALK_WHITE)
        phone_label.next_to(phone, DOWN, buff=0.3)
        phone_group = VGroup(phone, phone_label)

        phone_box = ChalkBox(
            width=phone_group.width + 0.8,
            height=phone_group.height + 0.5,
            stroke_color=SAFETY_YELLOW
        )
        phone_box.move_to(phone_group)
        phone_full = VGroup(phone_box, phone_group).shift(UP * 0.3)

        draw_then_fill(self, phone_box, fill_color=BOARD_DARK, fill_opacity=0.8)
        self.play(Write(phone), FadeIn(phone_label), run_time=1)
        self.play(phone.animate.set_color(SAFETY_RED), rate_func=there_and_back, run_time=0.5)

        em = VGroup(
            ChalkText("Incendio - Capacitado", font_size=18, color=CODELCO_ORANGE),
            ChalkText("Accidente - Ambulancia", font_size=18, color=CODELCO_ORANGE),
            ChalkText("Sismo - Evacuacion", font_size=18, color=CODELCO_ORANGE),
        ).arrange(DOWN, buff=0.2).next_to(phone_full, DOWN, buff=0.5)

        self.play(FadeIn(em), run_time=0.8)
        self.wait(2)
        self.fade_all()

    def _closing(self):
        """Closing scene."""
        msg1 = ChalkText("Si las condiciones cambian,", font_size=38, color=CHALK_WHITE)
        msg2 = ChalkTitle("DETEN la tarea", color=SAFETY_YELLOW).scale(0.85)
        msg3 = ChalkText("y reevalua los riesgos.", font_size=38, color=CHALK_WHITE)
        messages = VGroup(msg1, msg2, msg3).arrange(DOWN, buff=0.4)

        self.play(Write(msg1, run_time=1))
        self.play(Write(msg2, run_time=0.8))
        self.play(Write(msg3, run_time=1))

        final = ChalkTitle("Tu seguridad es lo primero.", color=CODELCO_ORANGE).scale(0.8)
        final.next_to(messages, DOWN, buff=0.7)
        self.play(FadeIn(final, scale=0.8), run_time=0.8)

        brand = ChalkText("PRO.0908.MPEF1 - CODELCO", font_size=16, color=CHALK_BLUE)
        brand.to_edge(DOWN, buff=0.4)
        self.play(FadeIn(brand), run_time=0.4)

        self.wait(2)
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1.5)


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("""
    ╔═══════════════════════════════════════════════════════════════╗
    ║  WHITEBOARD C-701 - 3Blue1Brown Style Training Video          ║
    ╠═══════════════════════════════════════════════════════════════╣
    ║                                                               ║
    ║  Available scenes:                                            ║
    ║    IntroScene            - Cinematic intro (~12s)             ║
    ║    EPPScene              - EPP requirements (~15s)            ║
    ║    CompressorDiagramScene- Technical diagram (~25s)           ║
    ║    DisassemblyScene      - Step-by-step (~30s)                ║
    ║    RisksScene            - Critical risks (~20s)              ║
    ║    EmergencyScene        - Emergency procedures (~15s)        ║
    ║    ClosingScene          - Closing message (~12s)             ║
    ║                                                               ║
    ║    CompresorC701Whiteboard - COMPLETE VIDEO (~2:00 min)       ║
    ║                                                               ║
    ╠═══════════════════════════════════════════════════════════════╣
    ║  Render commands:                                             ║
    ║                                                               ║
    ║  Preview (fast):                                              ║
    ║    manim -pql whiteboard_c701.py IntroScene                   ║
    ║                                                               ║
    ║  Full HD (1080p):                                             ║
    ║    manim -pqh whiteboard_c701.py CompresorC701Whiteboard      ║
    ║                                                               ║
    ║  4K:                                                          ║
    ║    manim -pqk whiteboard_c701.py CompresorC701Whiteboard      ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝
    """)
