"""
Manim Whiteboard Training Video — Mantención Compresor de Oxígeno C-701
PRO.0908.MPEF1 — CODELCO Chuquicamata

Generates animated whiteboard-style training video with:
- Animated compressor technical diagrams
- EPP equipment visualization
- Step-by-step disassembly animations
- Risk level indicators with color coding
- Tolerance measurements visualization
- Emergency procedures

Usage:
  manim -pql compresor_c701.py CompresorC701Training
  manim -pqh compresor_c701.py CompresorC701Training  (HD 1080p)
"""

from manim import *
import numpy as np


# ── Color Palette (Mining/Industrial) ──────────────────────────────
CODELCO_ORANGE = "#E87722"
CODELCO_DARK = "#1A1A2E"
SAFETY_RED = "#FF3B3B"
SAFETY_YELLOW = "#FFD93D"
SAFETY_GREEN = "#6BCB77"
BLUEPRINT_BLUE = "#4FC3F7"
CHALK_WHITE = "#F5F5F0"
BOARD_GREEN = "#2D4A22"


class TitleScene(Scene):
    """Opening title with mining aesthetic."""

    def construct(self):
        # Dark background
        self.camera.background_color = CODELCO_DARK

        # Title
        title = Text(
            "MANTENCIÓN PREVENTIVA",
            font="Arial",
            font_size=52,
            color=CHALK_WHITE,
            weight=BOLD,
        )
        subtitle = Text(
            "Compresor de Oxígeno C-701",
            font="Arial",
            font_size=44,
            color=CODELCO_ORANGE,
            weight=BOLD,
        )
        code = Text(
            "PRO.0908.MPEF1 — CODELCO Chuquicamata",
            font="Arial",
            font_size=24,
            color=BLUEPRINT_BLUE,
        )

        title_group = VGroup(title, subtitle, code).arrange(DOWN, buff=0.5)

        # Decorative lines
        top_line = Line(LEFT * 6, RIGHT * 6, color=CODELCO_ORANGE, stroke_width=3)
        bot_line = Line(LEFT * 6, RIGHT * 6, color=CODELCO_ORANGE, stroke_width=3)
        top_line.next_to(title_group, UP, buff=0.5)
        bot_line.next_to(title_group, DOWN, buff=0.5)

        # Animate
        self.play(
            GrowFromCenter(top_line),
            GrowFromCenter(bot_line),
            run_time=0.8,
        )
        self.play(
            Write(title),
            run_time=1.2,
        )
        self.play(
            FadeIn(subtitle, shift=UP * 0.3),
            run_time=0.8,
        )
        self.play(
            FadeIn(code, shift=UP * 0.2),
            run_time=0.6,
        )
        self.wait(2)
        self.play(FadeOut(VGroup(title_group, top_line, bot_line)))


class EPPScene(Scene):
    """Animated EPP equipment diagram."""

    def construct(self):
        self.camera.background_color = CODELCO_DARK

        header = Text(
            "EPP ESPECÍFICO — Ambiente con Oxígeno",
            font="Arial",
            font_size=36,
            color=CODELCO_ORANGE,
            weight=BOLD,
        ).to_edge(UP, buff=0.5)

        # Warning box
        warning = VGroup(
            Text("⚠ ALERTA CRÍTICA", font="Arial", font_size=24, color=SAFETY_RED, weight=BOLD),
            Text(
                "TODO el EPP debe estar LIBRE de grasas y aceites",
                font="Arial",
                font_size=20,
                color=SAFETY_YELLOW,
            ),
            Text(
                "Riesgo de ignición al contacto con oxígeno",
                font="Arial",
                font_size=18,
                color=CHALK_WHITE,
            ),
        ).arrange(DOWN, buff=0.15)
        warning_box = SurroundingRectangle(
            warning, color=SAFETY_RED, buff=0.3, stroke_width=3, corner_radius=0.1
        )
        warning_group = VGroup(warning_box, warning).to_edge(DOWN, buff=0.5)

        # EPP Items as animated icons
        epp_items = [
            ("🔵", "Buzo ignífugo", "Limpio, sin grasas"),
            ("🟡", "Full-Face", "Para soplado"),
            ("🔴", "Arnés seguridad", "Trabajo en altura"),
            ("🟢", "Guantes antigolpe", "Limpios (O₂)"),
            ("🔵", "Lentes claros", "Protección ocular"),
            ("🟡", "Zapato seguridad", "Limpio de aceite"),
        ]

        epp_grid = VGroup()
        for i, (icon, name, detail) in enumerate(epp_items):
            # Create circle icon
            circle = Circle(radius=0.4, color=BLUEPRINT_BLUE, fill_opacity=0.2, stroke_width=2)
            num = Text(str(i + 1), font="Arial", font_size=28, color=CHALK_WHITE, weight=BOLD)
            label = Text(name, font="Arial", font_size=16, color=CHALK_WHITE)
            sublabel = Text(detail, font="Arial", font_size=12, color=BLUEPRINT_BLUE)

            item = VGroup(
                VGroup(circle, num),
                label,
                sublabel,
            ).arrange(DOWN, buff=0.15)
            epp_grid.add(item)

        epp_grid.arrange_in_grid(rows=2, cols=3, buff=(0.8, 0.6))
        epp_grid.move_to(ORIGIN).shift(UP * 0.3)

        # Animate
        self.play(Write(header), run_time=0.6)

        for item in epp_grid:
            self.play(
                FadeIn(item, shift=UP * 0.3),
                run_time=0.4,
            )

        self.play(
            Create(warning_box),
            FadeIn(warning),
            run_time=1,
        )
        self.wait(3)
        self.play(FadeOut(VGroup(header, epp_grid, warning_group)))


class CompressorDiagramScene(Scene):
    """Animated compressor cross-section with labeled parts."""

    def construct(self):
        self.camera.background_color = CODELCO_DARK

        header = Text(
            "COMPRESOR C-701 — Componentes Principales",
            font="Arial",
            font_size=32,
            color=CODELCO_ORANGE,
            weight=BOLD,
        ).to_edge(UP, buff=0.5)

        # Draw simplified compressor cross-section
        # Cylinder body
        cylinder = Rectangle(
            width=2.5, height=4, color=BLUEPRINT_BLUE, stroke_width=3
        ).shift(LEFT * 2)
        cylinder_fill = cylinder.copy().set_fill(BLUEPRINT_BLUE, opacity=0.1).set_stroke(width=0)

        # Piston/Embolo
        piston = Rectangle(
            width=2.2, height=0.8, color=SAFETY_YELLOW, stroke_width=3,
            fill_color=SAFETY_YELLOW, fill_opacity=0.3,
        ).move_to(cylinder.get_center())

        # Vástago (rod)
        rod = Line(
            piston.get_bottom(),
            piston.get_bottom() + DOWN * 1.8,
            color=CHALK_WHITE,
            stroke_width=4,
        )

        # Culata (head)
        head = Rectangle(
            width=2.8, height=0.5, color=CODELCO_ORANGE, stroke_width=3,
            fill_color=CODELCO_ORANGE, fill_opacity=0.3,
        ).next_to(cylinder, UP, buff=0)

        # Seals (prensaestopas)
        seal1 = Rectangle(
            width=0.3, height=0.6, color=SAFETY_GREEN, stroke_width=2,
            fill_color=SAFETY_GREEN, fill_opacity=0.4,
        ).next_to(rod, LEFT, buff=0).shift(DOWN * 0.3)
        seal2 = seal1.copy().next_to(rod, RIGHT, buff=0).shift(DOWN * 0.3)

        # Valves
        valve_in = Polygon(
            [-0.3, 0.3, 0], [0.3, 0.3, 0], [0, -0.2, 0],
            color=SAFETY_GREEN, fill_opacity=0.5, stroke_width=2,
        ).next_to(head, LEFT, buff=0.3).shift(UP * 0.2)
        valve_out = Polygon(
            [-0.3, -0.2, 0], [0.3, -0.2, 0], [0, 0.3, 0],
            color=SAFETY_RED, fill_opacity=0.5, stroke_width=2,
        ).next_to(head, RIGHT, buff=0.3).shift(UP * 0.2)

        # Labels
        labels = [
            ("Culata", head, RIGHT),
            ("Cilindro", cylinder, LEFT),
            ("Émbolo", piston, RIGHT),
            ("Vástago", rod, LEFT),
            ("Sellos", seal1, LEFT),
            ("V. Aspiración", valve_in, LEFT),
            ("V. Descarga", valve_out, RIGHT),
        ]

        compressor = VGroup(cylinder_fill, cylinder, piston, rod, head, seal1, seal2, valve_in, valve_out)
        compressor.shift(LEFT * 1)

        self.play(Write(header), run_time=0.6)

        # Animate drawing the compressor
        self.play(
            Create(cylinder), FadeIn(cylinder_fill),
            run_time=1,
        )
        self.play(Create(head), run_time=0.5)
        self.play(
            FadeIn(piston, shift=DOWN * 0.3),
            run_time=0.5,
        )
        self.play(Create(rod), run_time=0.4)
        self.play(
            FadeIn(seal1), FadeIn(seal2),
            run_time=0.4,
        )
        self.play(
            FadeIn(valve_in), FadeIn(valve_out),
            run_time=0.4,
        )

        # Add labels with arrows
        label_group = VGroup()
        for text, target, direction in labels:
            label = Text(text, font="Arial", font_size=16, color=CHALK_WHITE)
            if direction == RIGHT:
                label.next_to(target, RIGHT, buff=0.8)
            else:
                label.next_to(target, LEFT, buff=0.8)

            arrow = Arrow(
                label.get_edge_center(-direction),
                target.get_edge_center(direction),
                color=BLUEPRINT_BLUE,
                stroke_width=2,
                buff=0.1,
                max_tip_length_to_length_ratio=0.15,
            )
            label_group.add(VGroup(label, arrow))

        for lbl in label_group:
            self.play(FadeIn(lbl), run_time=0.3)

        # Tolerance box on the right
        tol_header = Text("Tolerancias Críticas", font="Arial", font_size=20, color=SAFETY_YELLOW, weight=BOLD)
        tol_items = VGroup(
            Text("Huelgo diametral:", font="Arial", font_size=16, color=CHALK_WHITE),
            Text("0.06 — 0.10 mm", font="Arial", font_size=18, color=SAFETY_GREEN, weight=BOLD),
            Text("", font="Arial", font_size=8),
            Text("Huelgo axial:", font="Arial", font_size=16, color=CHALK_WHITE),
            Text("≈ 0.2 mm", font="Arial", font_size=18, color=SAFETY_GREEN, weight=BOLD),
        )
        tol_group = VGroup(tol_header, tol_items).arrange(DOWN, buff=0.2)
        tol_items.arrange(DOWN, buff=0.08, aligned_edge=LEFT)
        tol_box = SurroundingRectangle(tol_group, color=SAFETY_YELLOW, buff=0.3, corner_radius=0.1)
        tol_full = VGroup(tol_box, tol_group).to_edge(RIGHT, buff=0.5).shift(DOWN * 0.5)

        self.play(
            Create(tol_box),
            FadeIn(tol_group),
            run_time=1,
        )
        self.wait(4)
        self.play(FadeOut(VGroup(header, compressor, label_group, tol_full)))


class DisassemblyScene(Scene):
    """Step-by-step disassembly animation."""

    def construct(self):
        self.camera.background_color = CODELCO_DARK

        header = Text(
            "DESMONTAJE — Culata, Émbolo y Vástago",
            font="Arial",
            font_size=32,
            color=CODELCO_ORANGE,
            weight=BOLD,
        ).to_edge(UP, buff=0.5)

        # Pre-requisite warning
        prereq = VGroup(
            Text("PREREQUISITO", font="Arial", font_size=20, color=SAFETY_RED, weight=BOLD),
            Text(
                "Compresor FUERA de operación + BLOQUEO verificado",
                font="Arial",
                font_size=18,
                color=SAFETY_YELLOW,
            ),
        ).arrange(RIGHT, buff=0.5)
        prereq_box = SurroundingRectangle(prereq, color=SAFETY_RED, buff=0.2, corner_radius=0.1)
        prereq_group = VGroup(prereq_box, prereq).next_to(header, DOWN, buff=0.3)

        self.play(Write(header), run_time=0.6)
        self.play(Create(prereq_box), FadeIn(prereq), run_time=0.6)

        # Steps with visual progress
        steps = [
            ("1", "Desconectar cañerías de refrigeración", BLUEPRINT_BLUE),
            ("2", "Sacar tuercas de fijación culata→cilindro", CHALK_WHITE),
            ("3", "Retirar ajuste de goma y sacar culata", CODELCO_ORANGE),
            ("4", "Verificar holgura émbolo↔cilindro (tabla 6305346)", SAFETY_YELLOW),
            ("5", "Soltar tuerca chaveta y tornillo seguridad", CHALK_WHITE),
            ("6", "Sacar tuercas vástago pistón inf. y sup.", BLUEPRINT_BLUE),
            ("7", "Desmontar émbolo → lugar limpio y seguro", SAFETY_GREEN),
        ]

        step_group = VGroup()
        for num, desc, color in steps:
            # Step number circle
            circle = Circle(radius=0.25, color=color, fill_opacity=0.3, stroke_width=2)
            num_text = Text(num, font="Arial", font_size=20, color=CHALK_WHITE, weight=BOLD)
            # Description
            desc_text = Text(desc, font="Arial", font_size=17, color=CHALK_WHITE)

            row = VGroup(VGroup(circle, num_text), desc_text).arrange(RIGHT, buff=0.4)
            step_group.add(row)

        step_group.arrange(DOWN, buff=0.25, aligned_edge=LEFT)
        step_group.next_to(prereq_group, DOWN, buff=0.4)

        # Animate steps one by one with a progress bar
        progress_bar_bg = Rectangle(
            width=5, height=0.15, color=CODELCO_DARK,
            stroke_color=BLUEPRINT_BLUE, stroke_width=1,
        ).to_edge(DOWN, buff=0.5)
        progress_bar = Rectangle(
            width=0.01, height=0.15, color=SAFETY_GREEN,
            fill_opacity=0.8, stroke_width=0,
        ).align_to(progress_bar_bg, LEFT)

        self.play(Create(progress_bar_bg), run_time=0.3)

        for i, row in enumerate(step_group):
            self.play(
                FadeIn(row, shift=RIGHT * 0.3),
                progress_bar.animate.stretch_to_fit_width(5 * (i + 1) / len(steps)).align_to(progress_bar_bg, LEFT),
                run_time=0.5,
            )
            self.wait(0.3)

        self.wait(2)
        self.play(FadeOut(VGroup(header, prereq_group, step_group, progress_bar_bg, progress_bar)))


class RiskScene(Scene):
    """Critical risks with color-coded visualization."""

    def construct(self):
        self.camera.background_color = CODELCO_DARK

        header = Text(
            "RIESGOS CRÍTICOS",
            font="Arial",
            font_size=40,
            color=SAFETY_RED,
            weight=BOLD,
        ).to_edge(UP, buff=0.5)

        risks = [
            ("RC-1", "Energía Eléctrica", "Solo tableros autorizados", SAFETY_YELLOW),
            ("RC-2", "Trabajo en Altura", "Arnés + detención caídas", SAFETY_RED),
            ("RC-3", "Maniobras de Izaje", "Comunicación operador↔rigger", CODELCO_ORANGE),
            ("RC-4", "Presión Neumática", "Bloqueo + energía cero", SAFETY_RED),
            ("RC-6", "Variables de Fuego", "Protocolo trabajo caliente", SAFETY_YELLOW),
            ("RC-9", "Partes Móviles", "Guardas + bloqueo verificado", CODELCO_ORANGE),
        ]

        risk_group = VGroup()
        for code, name, control, color in risks:
            # Risk code badge
            badge = VGroup(
                RoundedRectangle(
                    width=1.2, height=0.5, corner_radius=0.1,
                    color=color, fill_opacity=0.3, stroke_width=2,
                ),
                Text(code, font="Arial", font_size=16, color=color, weight=BOLD),
            )
            # Name and control
            name_text = Text(name, font="Arial", font_size=18, color=CHALK_WHITE, weight=BOLD)
            ctrl_text = Text(control, font="Arial", font_size=15, color=BLUEPRINT_BLUE)
            desc = VGroup(name_text, ctrl_text).arrange(DOWN, buff=0.05, aligned_edge=LEFT)

            row = VGroup(badge, desc).arrange(RIGHT, buff=0.5)
            risk_group.add(row)

        risk_group.arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        risk_group.move_to(ORIGIN).shift(UP * 0.3)

        # Critical alert at bottom
        alert = VGroup(
            Text("🚨 ALERTA", font="Arial", font_size=22, color=SAFETY_RED, weight=BOLD),
            Text(
                "Si O₂ > 22% → DETENGA la tarea inmediatamente",
                font="Arial",
                font_size=20,
                color=SAFETY_YELLOW,
            ),
        ).arrange(RIGHT, buff=0.5)
        alert_box = SurroundingRectangle(
            alert, color=SAFETY_RED, buff=0.25, corner_radius=0.1, stroke_width=3,
        )
        alert_group = VGroup(alert_box, alert).to_edge(DOWN, buff=0.5)

        # Animate
        self.play(Write(header), run_time=0.6)

        for row in risk_group:
            self.play(FadeIn(row, shift=LEFT * 0.3), run_time=0.4)
            self.wait(0.2)

        # Pulse the alert
        self.play(
            Create(alert_box),
            FadeIn(alert),
            run_time=0.8,
        )
        self.play(
            alert_box.animate.set_stroke(width=5),
            rate_func=there_and_back,
            run_time=0.6,
        )
        self.play(
            alert_box.animate.set_stroke(width=5),
            rate_func=there_and_back,
            run_time=0.6,
        )
        self.wait(3)
        self.play(FadeOut(VGroup(header, risk_group, alert_group)))


class EmergencyScene(Scene):
    """Emergency procedures with phone number highlight."""

    def construct(self):
        self.camera.background_color = CODELCO_DARK

        header = Text(
            "EMERGENCIAS",
            font="Arial",
            font_size=40,
            color=SAFETY_RED,
            weight=BOLD,
        ).to_edge(UP, buff=0.5)

        # Phone number prominently
        phone = Text(
            "☎ 55-2-327-327",
            font="Arial",
            font_size=56,
            color=SAFETY_YELLOW,
            weight=BOLD,
        )
        phone_label = Text(
            "Fundición Chuquicamata",
            font="Arial",
            font_size=24,
            color=CHALK_WHITE,
        )
        phone_group = VGroup(phone, phone_label).arrange(DOWN, buff=0.2)
        phone_box = SurroundingRectangle(
            phone_group, color=SAFETY_YELLOW, buff=0.4, corner_radius=0.15, stroke_width=3,
        )
        phone_full = VGroup(phone_box, phone_group).shift(UP * 0.5)

        # Emergency types
        emergencies = [
            ("🔥 Incendio", "Extinguir solo si es incipiente y está capacitado"),
            ("🚑 Accidente", "Avise al fono → Ambulancia a zona evacuación"),
            ("🌋 Sismo", "Vías de evacuación → Zona de seguridad"),
        ]

        em_group = VGroup()
        for title, desc in emergencies:
            t = Text(title, font="Arial", font_size=20, color=CODELCO_ORANGE, weight=BOLD)
            d = Text(desc, font="Arial", font_size=16, color=CHALK_WHITE)
            em_group.add(VGroup(t, d).arrange(DOWN, buff=0.08, aligned_edge=LEFT))

        em_group.arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        em_group.next_to(phone_full, DOWN, buff=0.6)

        # Info to report
        report = Text(
            "Informe: naturaleza | nombre | lugar | equipo comprometido",
            font="Arial",
            font_size=16,
            color=BLUEPRINT_BLUE,
        ).to_edge(DOWN, buff=0.5)

        # Animate
        self.play(Write(header), run_time=0.6)
        self.play(
            Create(phone_box),
            Write(phone),
            FadeIn(phone_label),
            run_time=1.2,
        )

        # Pulse phone
        self.play(
            phone.animate.set_color(SAFETY_RED),
            rate_func=there_and_back,
            run_time=0.5,
        )

        for em in em_group:
            self.play(FadeIn(em, shift=UP * 0.2), run_time=0.4)

        self.play(FadeIn(report, shift=UP * 0.2), run_time=0.4)
        self.wait(3)
        self.play(FadeOut(VGroup(header, phone_full, em_group, report)))


class ClosingScene(Scene):
    """Closing message."""

    def construct(self):
        self.camera.background_color = CODELCO_DARK

        msg1 = Text(
            "Si las condiciones cambian,",
            font="Arial",
            font_size=36,
            color=CHALK_WHITE,
        )
        msg2 = Text(
            "DETÉN la tarea y reevalúa los riesgos.",
            font="Arial",
            font_size=36,
            color=SAFETY_YELLOW,
            weight=BOLD,
        )
        msg3 = Text(
            "Tu seguridad es lo primero.",
            font="Arial",
            font_size=42,
            color=CODELCO_ORANGE,
            weight=BOLD,
        )

        messages = VGroup(msg1, msg2, msg3).arrange(DOWN, buff=0.6)

        # Bottom branding
        brand = Text(
            "PRO.0908.MPEF1 — SRP Learn × CODELCO",
            font="Arial",
            font_size=20,
            color=BLUEPRINT_BLUE,
        ).to_edge(DOWN, buff=0.5)

        self.play(Write(msg1), run_time=1)
        self.play(Write(msg2), run_time=1.2)
        self.wait(0.5)
        self.play(
            FadeIn(msg3, scale=0.8),
            run_time=1,
        )
        self.play(FadeIn(brand), run_time=0.5)
        self.wait(3)
        self.play(FadeOut(VGroup(messages, brand)))


class CompresorC701Training(Scene):
    """
    Complete training video — all scenes combined.
    Render: manim -pqh compresor_c701.py CompresorC701Training
    """

    def construct(self):
        self.camera.background_color = CODELCO_DARK

        # ═══════════ SCENE 1: TITLE ═══════════
        self._title_scene()

        # ═══════════ SCENE 2: EPP ═══════════
        self._epp_scene()

        # ═══════════ SCENE 3: COMPRESSOR DIAGRAM ═══════════
        self._compressor_diagram()

        # ═══════════ SCENE 4: DISASSEMBLY STEPS ═══════════
        self._disassembly_scene()

        # ═══════════ SCENE 5: RISKS ═══════════
        self._risk_scene()

        # ═══════════ SCENE 6: EMERGENCY ═══════════
        self._emergency_scene()

        # ═══════════ SCENE 7: CLOSING ═══════════
        self._closing_scene()

    def _clear(self, *groups):
        self.play(*[FadeOut(g) for g in groups], run_time=0.5)

    def _title_scene(self):
        title = Text("MANTENCIÓN PREVENTIVA", font="Arial", font_size=52, color=CHALK_WHITE, weight=BOLD)
        subtitle = Text("Compresor de Oxígeno C-701", font="Arial", font_size=44, color=CODELCO_ORANGE, weight=BOLD)
        code = Text("PRO.0908.MPEF1 — CODELCO Chuquicamata", font="Arial", font_size=24, color=BLUEPRINT_BLUE)
        group = VGroup(title, subtitle, code).arrange(DOWN, buff=0.5)
        top_line = Line(LEFT * 6, RIGHT * 6, color=CODELCO_ORANGE, stroke_width=3).next_to(group, UP, buff=0.5)
        bot_line = Line(LEFT * 6, RIGHT * 6, color=CODELCO_ORANGE, stroke_width=3).next_to(group, DOWN, buff=0.5)

        self.play(GrowFromCenter(top_line), GrowFromCenter(bot_line), run_time=0.8)
        self.play(Write(title), run_time=1.2)
        self.play(FadeIn(subtitle, shift=UP * 0.3), run_time=0.8)
        self.play(FadeIn(code, shift=UP * 0.2), run_time=0.6)
        self.wait(2)
        self._clear(group, top_line, bot_line)

    def _epp_scene(self):
        header = Text("EPP ESPECÍFICO — Ambiente con Oxígeno", font="Arial", font_size=36, color=CODELCO_ORANGE, weight=BOLD).to_edge(UP, buff=0.5)

        epp_items = [
            ("1", "Buzo ignífugo", "Limpio, sin grasas"),
            ("2", "Full-Face", "Para soplado"),
            ("3", "Arnés seguridad", "Trabajo en altura"),
            ("4", "Guantes antigolpe", "Limpios (O₂)"),
            ("5", "Lentes claros", "Protección ocular"),
            ("6", "Zapato seguridad", "Limpio de aceite"),
        ]

        epp_grid = VGroup()
        for num, name, detail in epp_items:
            circle = Circle(radius=0.4, color=BLUEPRINT_BLUE, fill_opacity=0.2, stroke_width=2)
            n = Text(num, font="Arial", font_size=28, color=CHALK_WHITE, weight=BOLD)
            label = Text(name, font="Arial", font_size=16, color=CHALK_WHITE)
            sublabel = Text(detail, font="Arial", font_size=12, color=BLUEPRINT_BLUE)
            item = VGroup(VGroup(circle, n), label, sublabel).arrange(DOWN, buff=0.15)
            epp_grid.add(item)

        epp_grid.arrange_in_grid(rows=2, cols=3, buff=(0.8, 0.6)).move_to(ORIGIN).shift(UP * 0.3)

        warning = VGroup(
            Text("⚠ TODO libre de grasas y aceites — riesgo ignición con O₂", font="Arial", font_size=20, color=SAFETY_YELLOW),
        )
        warning_box = SurroundingRectangle(warning, color=SAFETY_RED, buff=0.25, corner_radius=0.1)
        warning_full = VGroup(warning_box, warning).to_edge(DOWN, buff=0.5)

        self.play(Write(header), run_time=0.6)
        for item in epp_grid:
            self.play(FadeIn(item, shift=UP * 0.3), run_time=0.35)
        self.play(Create(warning_box), FadeIn(warning), run_time=0.8)
        self.wait(3)
        self._clear(header, epp_grid, warning_full)

    def _compressor_diagram(self):
        header = Text("COMPRESOR C-701 — Componentes", font="Arial", font_size=32, color=CODELCO_ORANGE, weight=BOLD).to_edge(UP, buff=0.5)

        # Simplified technical diagram
        cylinder = Rectangle(width=2.5, height=4, color=BLUEPRINT_BLUE, stroke_width=3).shift(LEFT * 1.5)
        cyl_fill = cylinder.copy().set_fill(BLUEPRINT_BLUE, opacity=0.08).set_stroke(width=0)
        piston = Rectangle(width=2.2, height=0.8, color=SAFETY_YELLOW, stroke_width=3, fill_color=SAFETY_YELLOW, fill_opacity=0.3).move_to(cylinder)
        rod = Line(piston.get_bottom(), piston.get_bottom() + DOWN * 1.8, color=CHALK_WHITE, stroke_width=4)
        head = Rectangle(width=2.8, height=0.5, color=CODELCO_ORANGE, stroke_width=3, fill_color=CODELCO_ORANGE, fill_opacity=0.3).next_to(cylinder, UP, buff=0)

        seal_l = Rectangle(width=0.3, height=0.6, color=SAFETY_GREEN, stroke_width=2, fill_color=SAFETY_GREEN, fill_opacity=0.4).next_to(rod, LEFT, buff=0).shift(DOWN * 0.3)
        seal_r = seal_l.copy().next_to(rod, RIGHT, buff=0).shift(DOWN * 0.3)

        compressor = VGroup(cyl_fill, cylinder, piston, rod, head, seal_l, seal_r)

        labels_data = [
            ("Culata", head, RIGHT, 1.5),
            ("Cilindro", cylinder, RIGHT, 2.0),
            ("Émbolo", piston, RIGHT, 1.5),
            ("Vástago", rod.get_center(), LEFT, 1.5),
            ("Sellos", seal_l, LEFT, 1.5),
        ]

        self.play(Write(header), run_time=0.5)
        self.play(Create(cylinder), FadeIn(cyl_fill), run_time=0.8)
        self.play(Create(head), run_time=0.4)
        self.play(FadeIn(piston, shift=DOWN * 0.3), run_time=0.4)
        self.play(Create(rod), run_time=0.3)
        self.play(FadeIn(seal_l), FadeIn(seal_r), run_time=0.3)

        all_labels = VGroup()
        for text, target, direction, dist in labels_data:
            lbl = Text(text, font="Arial", font_size=16, color=CHALK_WHITE)
            target_point = target.get_center() if hasattr(target, 'get_center') else target
            lbl.next_to(target_point, direction, buff=dist)
            arr = Arrow(lbl.get_edge_center(-direction), target_point + direction * 0.3, color=BLUEPRINT_BLUE, stroke_width=2, buff=0.1, max_tip_length_to_length_ratio=0.15)
            pair = VGroup(lbl, arr)
            all_labels.add(pair)
            self.play(FadeIn(pair), run_time=0.25)

        # Tolerances
        tol = VGroup(
            Text("Tolerancias Críticas", font="Arial", font_size=20, color=SAFETY_YELLOW, weight=BOLD),
            Text("Huelgo diametral: 0.06–0.10 mm", font="Arial", font_size=16, color=SAFETY_GREEN),
            Text("Huelgo axial: ≈ 0.2 mm", font="Arial", font_size=16, color=SAFETY_GREEN),
        ).arrange(DOWN, buff=0.15, aligned_edge=LEFT)
        tol_box = SurroundingRectangle(tol, color=SAFETY_YELLOW, buff=0.25, corner_radius=0.1)
        tol_full = VGroup(tol_box, tol).to_edge(RIGHT, buff=0.4).shift(DOWN * 0.5)

        self.play(Create(tol_box), FadeIn(tol), run_time=0.8)
        self.wait(4)
        self._clear(header, compressor, all_labels, tol_full)

    def _disassembly_scene(self):
        header = Text("DESMONTAJE — 7 Pasos", font="Arial", font_size=32, color=CODELCO_ORANGE, weight=BOLD).to_edge(UP, buff=0.5)
        prereq = Text("⚠ Compresor FUERA de operación + BLOQUEO verificado", font="Arial", font_size=18, color=SAFETY_YELLOW)
        prereq_box = SurroundingRectangle(prereq, color=SAFETY_RED, buff=0.2, corner_radius=0.1)
        prereq_g = VGroup(prereq_box, prereq).next_to(header, DOWN, buff=0.3)

        steps = [
            "Desconectar cañerías de refrigeración",
            "Sacar tuercas fijación culata→cilindro",
            "Retirar ajuste de goma y culata",
            "Verificar holgura émbolo↔cilindro",
            "Soltar tuerca chaveta + tornillo seguridad",
            "Sacar tuercas vástago pistón",
            "Desmontar émbolo → lugar limpio",
        ]

        self.play(Write(header), run_time=0.5)
        self.play(Create(prereq_box), FadeIn(prereq), run_time=0.5)

        step_group = VGroup()
        colors = [BLUEPRINT_BLUE, CHALK_WHITE, CODELCO_ORANGE, SAFETY_YELLOW, CHALK_WHITE, BLUEPRINT_BLUE, SAFETY_GREEN]

        for i, (step, color) in enumerate(zip(steps, colors)):
            circle = Circle(radius=0.22, color=color, fill_opacity=0.3, stroke_width=2)
            num = Text(str(i + 1), font="Arial", font_size=18, color=CHALK_WHITE, weight=BOLD)
            desc = Text(step, font="Arial", font_size=16, color=CHALK_WHITE)
            row = VGroup(VGroup(circle, num), desc).arrange(RIGHT, buff=0.4)
            step_group.add(row)

        step_group.arrange(DOWN, buff=0.22, aligned_edge=LEFT).next_to(prereq_g, DOWN, buff=0.35)

        progress_bg = Rectangle(width=6, height=0.12, stroke_color=BLUEPRINT_BLUE, stroke_width=1, color=CODELCO_DARK).to_edge(DOWN, buff=0.4)
        progress = Rectangle(width=0.01, height=0.12, color=SAFETY_GREEN, fill_opacity=0.8, stroke_width=0).align_to(progress_bg, LEFT)

        self.play(Create(progress_bg), run_time=0.2)
        for i, row in enumerate(step_group):
            self.play(
                FadeIn(row, shift=RIGHT * 0.2),
                progress.animate.stretch_to_fit_width(6 * (i + 1) / len(steps)).align_to(progress_bg, LEFT),
                run_time=0.4,
            )

        self.wait(2)
        self._clear(header, prereq_g, step_group, progress_bg, progress)

    def _risk_scene(self):
        header = Text("RIESGOS CRÍTICOS", font="Arial", font_size=40, color=SAFETY_RED, weight=BOLD).to_edge(UP, buff=0.5)

        risks = [
            ("RC-1", "Energía Eléctrica", "Solo tableros autorizados", SAFETY_YELLOW),
            ("RC-2", "Trabajo en Altura", "Arnés + detención caídas", SAFETY_RED),
            ("RC-3", "Maniobras Izaje", "Comunicación operador↔rigger", CODELCO_ORANGE),
            ("RC-4", "Presión Neumática", "Bloqueo + energía cero", SAFETY_RED),
            ("RC-6", "Variables Fuego", "Protocolo trabajo caliente", SAFETY_YELLOW),
            ("RC-9", "Partes Móviles", "Guardas + bloqueo verificado", CODELCO_ORANGE),
        ]

        risk_group = VGroup()
        for code, name, control, color in risks:
            badge_bg = RoundedRectangle(width=1.1, height=0.45, corner_radius=0.1, color=color, fill_opacity=0.3, stroke_width=2)
            badge_text = Text(code, font="Arial", font_size=15, color=color, weight=BOLD)
            name_t = Text(name, font="Arial", font_size=17, color=CHALK_WHITE, weight=BOLD)
            ctrl_t = Text(control, font="Arial", font_size=14, color=BLUEPRINT_BLUE)
            row = VGroup(VGroup(badge_bg, badge_text), VGroup(name_t, ctrl_t).arrange(DOWN, buff=0.04, aligned_edge=LEFT)).arrange(RIGHT, buff=0.5)
            risk_group.add(row)

        risk_group.arrange(DOWN, buff=0.3, aligned_edge=LEFT).move_to(ORIGIN).shift(UP * 0.3)

        alert = Text("🚨 Si O₂ > 22% → DETENGA la tarea inmediatamente", font="Arial", font_size=20, color=SAFETY_YELLOW)
        alert_box = SurroundingRectangle(alert, color=SAFETY_RED, buff=0.25, corner_radius=0.1, stroke_width=3)
        alert_g = VGroup(alert_box, alert).to_edge(DOWN, buff=0.5)

        self.play(Write(header), run_time=0.5)
        for row in risk_group:
            self.play(FadeIn(row, shift=LEFT * 0.3), run_time=0.35)

        self.play(Create(alert_box), FadeIn(alert), run_time=0.7)
        self.play(alert_box.animate.set_stroke(width=5), rate_func=there_and_back, run_time=0.5)
        self.play(alert_box.animate.set_stroke(width=5), rate_func=there_and_back, run_time=0.5)
        self.wait(3)
        self._clear(header, risk_group, alert_g)

    def _emergency_scene(self):
        header = Text("EMERGENCIAS", font="Arial", font_size=40, color=SAFETY_RED, weight=BOLD).to_edge(UP, buff=0.5)

        phone = Text("☎ 55-2-327-327", font="Arial", font_size=56, color=SAFETY_YELLOW, weight=BOLD)
        phone_sub = Text("Fundición Chuquicamata", font="Arial", font_size=24, color=CHALK_WHITE)
        phone_g = VGroup(phone, phone_sub).arrange(DOWN, buff=0.2)
        phone_box = SurroundingRectangle(phone_g, color=SAFETY_YELLOW, buff=0.4, corner_radius=0.15, stroke_width=3)
        phone_full = VGroup(phone_box, phone_g).shift(UP * 0.5)

        emergencies = [
            ("🔥 Incendio", "Solo si es incipiente y capacitado"),
            ("🚑 Accidente", "Fono emergencias → ambulancia"),
            ("🌋 Sismo", "Evacuación → zona seguridad"),
        ]

        em_group = VGroup()
        for title, desc in emergencies:
            t = Text(title, font="Arial", font_size=20, color=CODELCO_ORANGE, weight=BOLD)
            d = Text(desc, font="Arial", font_size=16, color=CHALK_WHITE)
            em_group.add(VGroup(t, d).arrange(DOWN, buff=0.06, aligned_edge=LEFT))
        em_group.arrange(DOWN, buff=0.25, aligned_edge=LEFT).next_to(phone_full, DOWN, buff=0.5)

        self.play(Write(header), run_time=0.5)
        self.play(Create(phone_box), Write(phone), FadeIn(phone_sub), run_time=1)
        self.play(phone.animate.set_color(SAFETY_RED), rate_func=there_and_back, run_time=0.5)

        for em in em_group:
            self.play(FadeIn(em, shift=UP * 0.2), run_time=0.35)
        self.wait(3)
        self._clear(header, phone_full, em_group)

    def _closing_scene(self):
        msg1 = Text("Si las condiciones cambian,", font="Arial", font_size=36, color=CHALK_WHITE)
        msg2 = Text("DETÉN la tarea y reevalúa los riesgos.", font="Arial", font_size=36, color=SAFETY_YELLOW, weight=BOLD)
        msg3 = Text("Tu seguridad es lo primero.", font="Arial", font_size=42, color=CODELCO_ORANGE, weight=BOLD)
        msgs = VGroup(msg1, msg2, msg3).arrange(DOWN, buff=0.6)
        brand = Text("PRO.0908.MPEF1 — SRP Learn × CODELCO", font="Arial", font_size=20, color=BLUEPRINT_BLUE).to_edge(DOWN, buff=0.5)

        self.play(Write(msg1), run_time=1)
        self.play(Write(msg2), run_time=1.2)
        self.play(FadeIn(msg3, scale=0.8), run_time=1)
        self.play(FadeIn(brand), run_time=0.5)
        self.wait(3)
        self._clear(msgs, brand)
