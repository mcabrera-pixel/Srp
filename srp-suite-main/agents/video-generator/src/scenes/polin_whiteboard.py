"""
Cambio de Polín - Animación Whiteboard
Estilo: Ilustraciones simples, sin texto, conceptual
"""
from manim import *

# Colores minimalistas
PIZARRA = "#1a1a2e"
TIZA = "#f5f5f5"
VERDE = "#00a651"
ROJO = "#ed1c24"
NARANJA = "#f7931e"
AZUL = "#007aff"


class CambioPolinWhiteboard(Scene):
    def construct(self):
        self.camera.background_color = PIZARRA

        # ═══════════════════════════════════════════════════════════
        # ESCENA 1: La correa transportadora
        # ═══════════════════════════════════════════════════════════

        # Dibujar estructura de la correa (simple)
        soporte_izq = Line(DOWN * 2, UP * 0.5, color=TIZA, stroke_width=3)
        soporte_der = Line(DOWN * 2, UP * 0.5, color=TIZA, stroke_width=3)
        soporte_izq.shift(LEFT * 4)
        soporte_der.shift(RIGHT * 4)

        # La banda/correa
        correa = Line(LEFT * 4 + UP * 0.5, RIGHT * 4 + UP * 0.5, color=TIZA, stroke_width=6)

        # Polines (círculos simples debajo de la correa)
        polines = VGroup()
        posiciones_polin = [-3, -1, 1, 3]
        for x in posiciones_polin:
            polin = Circle(radius=0.25, color=TIZA, stroke_width=3)
            polin.move_to([x, 0, 0])
            polines.add(polin)

        # Dibujar todo secuencialmente
        self.play(Create(soporte_izq), Create(soporte_der), run_time=1)
        self.play(Create(correa), run_time=1.5)

        for polin in polines:
            self.play(GrowFromCenter(polin), run_time=0.4)

        self.wait(0.5)

        # ═══════════════════════════════════════════════════════════
        # ESCENA 2: Identificar polín dañado
        # ═══════════════════════════════════════════════════════════

        # Zoom hacia el polín dañado (el segundo)
        polin_danado = polines[1]

        # Círculo de atención
        atencion = Circle(radius=0.5, color=NARANJA, stroke_width=4)
        atencion.move_to(polin_danado.get_center())

        self.play(Create(atencion), run_time=0.5)
        self.play(
            atencion.animate.scale(1.3),
            rate_func=there_and_back,
            run_time=0.8
        )

        # Mostrar daño con líneas irregulares
        dano = VGroup(
            Line(ORIGIN, UR * 0.15, color=ROJO, stroke_width=3),
            Line(ORIGIN, UL * 0.12, color=ROJO, stroke_width=3),
            Line(ORIGIN, DR * 0.13, color=ROJO, stroke_width=3),
        ).move_to(polin_danado.get_center())

        self.play(Create(dano), run_time=0.5)
        self.wait(0.5)

        # ═══════════════════════════════════════════════════════════
        # ESCENA 3: LOTO - Bloqueo de energía
        # ═══════════════════════════════════════════════════════════

        # Mover todo a la izquierda
        grupo_correa = VGroup(soporte_izq, soporte_der, correa, polines, atencion, dano)

        self.play(grupo_correa.animate.scale(0.6).shift(LEFT * 3 + UP), run_time=0.8)

        # Dibujar símbolo de energía eléctrica
        rayo = VMobject(color=NARANJA, stroke_width=4)
        rayo.set_points_as_corners([
            UP * 0.8 + LEFT * 0.2,
            UP * 0.2 + RIGHT * 0.1,
            UP * 0.3 + RIGHT * 0.1,
            DOWN * 0.8 + LEFT * 0.1,
            DOWN * 0.2 + LEFT * 0.2,
            DOWN * 0.3 + LEFT * 0.2,
            UP * 0.8 + LEFT * 0.2,
        ])
        rayo.shift(RIGHT * 2 + DOWN * 0.5)

        self.play(Create(rayo), run_time=0.8)

        # Tachar con X (bloqueo)
        x_bloqueo = VGroup(
            Line(UL * 0.6, DR * 0.6, color=ROJO, stroke_width=5),
            Line(UR * 0.6, DL * 0.6, color=ROJO, stroke_width=5),
        ).move_to(rayo.get_center())

        self.play(Create(x_bloqueo), run_time=0.5)

        # Dibujar candado
        candado_cuerpo = RoundedRectangle(
            width=0.6, height=0.5, corner_radius=0.05,
            color=VERDE, fill_color=VERDE, fill_opacity=0.3,
            stroke_width=3
        )
        candado_arco = Arc(
            radius=0.2, start_angle=0, angle=PI,
            color=VERDE, stroke_width=4
        ).shift(UP * 0.25)
        candado = VGroup(candado_cuerpo, candado_arco)
        candado.shift(RIGHT * 2 + DOWN * 0.5 + RIGHT * 1.5)

        self.play(GrowFromCenter(candado), run_time=0.6)

        # Check de verificación
        check = VMobject(color=VERDE, stroke_width=5)
        check.set_points_as_corners([
            LEFT * 0.2 + DOWN * 0.1,
            ORIGIN + DOWN * 0.3,
            RIGHT * 0.4 + UP * 0.3,
        ])
        check.next_to(candado, RIGHT, buff=0.3)

        self.play(Create(check), run_time=0.4)
        self.wait(0.5)

        # ═══════════════════════════════════════════════════════════
        # ESCENA 4: Proceso de cambio
        # ═══════════════════════════════════════════════════════════

        # Limpiar área derecha
        self.play(
            FadeOut(rayo), FadeOut(x_bloqueo),
            FadeOut(candado), FadeOut(check),
            run_time=0.5
        )

        # Zoom al polín dañado
        self.play(
            grupo_correa.animate.scale(1.5).move_to(LEFT * 1),
            run_time=0.8
        )

        # Levantar la correa (línea que sube)
        correa_original = correa.copy()

        # Flechas hacia arriba
        flecha_arriba = Arrow(
            start=correa.get_center() + DOWN * 0.3,
            end=correa.get_center() + UP * 0.5,
            color=AZUL, stroke_width=3, buff=0
        )

        self.play(GrowArrow(flecha_arriba), run_time=0.4)
        self.play(
            correa.animate.shift(UP * 0.4),
            flecha_arriba.animate.shift(UP * 0.4),
            run_time=0.6
        )

        self.wait(0.3)

        # Remover polín dañado
        self.play(
            polin_danado.animate.shift(DOWN * 1.5).set_opacity(0.3),
            dano.animate.shift(DOWN * 1.5).set_opacity(0.3),
            atencion.animate.shift(DOWN * 1.5).set_opacity(0),
            run_time=0.8
        )

        # Nuevo polín aparece (verde)
        nuevo_polin = Circle(radius=0.25 * 1.5 * 0.6, color=VERDE, stroke_width=4)
        nuevo_polin.move_to(polin_danado.get_center() + UP * 1.5 + UP * 0.4)  # Ajuste por correa levantada

        self.play(GrowFromCenter(nuevo_polin), run_time=0.5)

        # Mover a posición
        posicion_final = [-1 * 0.6 - 3 * 0.6 - 1 + (1 * 0.6 * 1.5), 0 * 0.6 * 1.5, 0]

        self.play(
            nuevo_polin.animate.move_to(polin_danado.get_center() + UP * 0.4),
            run_time=0.6
        )

        # Bajar correa
        self.play(
            correa.animate.shift(DOWN * 0.4),
            flecha_arriba.animate.shift(DOWN * 0.8).set_opacity(0),
            run_time=0.6
        )

        self.wait(0.3)

        # ═══════════════════════════════════════════════════════════
        # ESCENA 5: Verificación final
        # ═══════════════════════════════════════════════════════════

        # Limpiar elementos viejos
        self.play(
            FadeOut(polin_danado), FadeOut(dano), FadeOut(flecha_arriba),
            run_time=0.3
        )

        # Mostrar funcionamiento (flechas de movimiento)
        flecha_mov = Arrow(
            start=LEFT * 1.5,
            end=RIGHT * 1.5,
            color=VERDE, stroke_width=4
        ).shift(UP * 1.2)

        self.play(GrowArrow(flecha_mov), run_time=0.5)

        # Indicador de éxito grande
        check_final = VMobject(color=VERDE, stroke_width=8)
        check_final.set_points_as_corners([
            LEFT * 0.5 + DOWN * 0.2,
            LEFT * 0.1 + DOWN * 0.5,
            RIGHT * 0.6 + UP * 0.5,
        ])
        check_final.shift(RIGHT * 3 + UP * 0.5)

        circulo_check = Circle(radius=0.9, color=VERDE, stroke_width=4)
        circulo_check.move_to(check_final.get_center())

        self.play(
            Create(circulo_check),
            Create(check_final),
            run_time=0.8
        )

        self.wait(1)

        # Fade out final
        self.play(*[FadeOut(mob) for mob in self.mobjects], run_time=1)


class PolinSimple(Scene):
    """Versión ultra simple - solo el concepto básico"""
    def construct(self):
        self.camera.background_color = PIZARRA

        # Solo 3 polines en línea
        polines = VGroup(*[
            Circle(radius=0.4, color=TIZA, stroke_width=4)
            for _ in range(3)
        ]).arrange(RIGHT, buff=1.5)

        correa = Line(
            polines[0].get_top() + LEFT * 0.5,
            polines[2].get_top() + RIGHT * 0.5,
            color=TIZA, stroke_width=6
        )

        # Dibujar
        self.play(Create(correa), run_time=1)
        for p in polines:
            self.play(GrowFromCenter(p), run_time=0.3)

        self.wait(0.5)

        # Marcar el del medio como dañado
        x_mark = Cross(polines[1], color=ROJO, stroke_width=5)
        self.play(Create(x_mark), run_time=0.5)

        self.wait(0.3)

        # Remover
        self.play(
            polines[1].animate.shift(DOWN * 2).set_opacity(0),
            x_mark.animate.shift(DOWN * 2).set_opacity(0),
            run_time=0.8
        )

        # Nuevo (verde)
        nuevo = Circle(radius=0.4, color=VERDE, stroke_width=4, fill_opacity=0.2, fill_color=VERDE)
        nuevo.move_to(UP * 2)

        self.play(GrowFromCenter(nuevo), run_time=0.4)
        self.play(nuevo.animate.move_to(polines[1].get_center()), run_time=0.6)

        # Check
        check = VMobject(color=VERDE, stroke_width=6)
        check.set_points_as_corners([
            LEFT * 0.3, DOWN * 0.2, RIGHT * 0.5 + UP * 0.4
        ])
        check.next_to(nuevo, RIGHT, buff=1)

        self.play(Create(check), run_time=0.5)
        self.wait(1)


# Para renderizar:
# manim -pql polin_whiteboard.py PolinSimple
# manim -pqh polin_whiteboard.py CambioPolinWhiteboard
