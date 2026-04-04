"""
Test basico de Manim - escena simple
"""
from manim import *

class TestScene(Scene):
    """Escena de prueba simple"""

    def construct(self):
        # Fondo oscuro
        self.camera.background_color = "#1a1a2e"

        # Texto de prueba
        title = Text("MCCO Video Generator", font_size=64, color=WHITE)
        subtitle = Text("Test de Manim", font_size=36, color="#00A651")
        subtitle.next_to(title, DOWN, buff=0.5)

        # Circulo animado
        circle = Circle(radius=1, color="#00A651", fill_opacity=0.5)
        circle.next_to(subtitle, DOWN, buff=1)

        # Animaciones
        self.play(Write(title, run_time=1.5))
        self.play(FadeIn(subtitle, shift=UP * 0.3))
        self.play(GrowFromCenter(circle))
        self.play(circle.animate.scale(1.5), run_time=0.5)
        self.play(circle.animate.scale(0.67), run_time=0.5)
        self.wait(1)

        # Final
        self.play(
            FadeOut(title),
            FadeOut(subtitle),
            FadeOut(circle)
        )


if __name__ == "__main__":
    print("Para renderizar, ejecuta:")
    print("manim -ql test_manim.py TestScene")
    print("")
    print("Opciones de calidad:")
    print("  -ql : Baja (480p, rapido)")
    print("  -qm : Media (720p)")
    print("  -qh : Alta (1080p)")
