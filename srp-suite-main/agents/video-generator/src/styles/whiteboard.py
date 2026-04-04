"""
Whiteboard Styles for 3Blue1Brown-style Animations
===================================================
Professional whiteboard/chalkboard effects for Manim.

Usage:
    from styles.whiteboard import WhiteboardScene, ChalkText, draw_then_fill
"""
from manim import *
import numpy as np

# ══════════════════════════════════════════════════════════════════════════════
# COLOR PALETTE - Dark Board Theme
# ══════════════════════════════════════════════════════════════════════════════

BOARD_DARK = "#1a1a2e"       # Dark blue-black board
BOARD_GREEN = "#1e3d2f"      # Classic green chalkboard
CHALK_WHITE = "#f5f5f0"      # Off-white chalk
CHALK_BLUE = "#7ec8e3"       # Light blue chalk
CHALK_YELLOW = "#ffe66d"     # Yellow chalk
CHALK_ORANGE = "#ffa94d"     # Orange chalk
CHALK_RED = "#ff6b6b"        # Red chalk
CHALK_GREEN = "#51cf66"      # Green chalk

# CODELCO Corporate
CODELCO_GREEN = "#00A651"
CODELCO_ORANGE = "#E87722"
CODELCO_BLUE = "#4FC3F7"
SAFETY_RED = "#FF3B3B"
SAFETY_YELLOW = "#FFD93D"


# ══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ══════════════════════════════════════════════════════════════════════════════

WHITEBOARD_CONFIG = {
    "background_color": BOARD_DARK,
    "default_stroke_width": 4,
    "default_stroke_color": CHALK_WHITE,
    "text_font": "Arial",  # Cambiar a "TeX Gyre Termes" si está instalado
    "draw_run_time": 1.5,
    "fill_run_time": 0.8,
}


# ══════════════════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ══════════════════════════════════════════════════════════════════════════════

def draw_then_fill(scene: Scene, mobject: VMobject,
                   draw_time: float = 1.5,
                   fill_time: float = 0.8,
                   fill_color: str = None,
                   fill_opacity: float = 0.3) -> None:
    """
    Animate drawing the border first, then filling.
    This is the signature 3Blue1Brown effect.

    Args:
        scene: The Manim scene
        mobject: The VMobject to animate
        draw_time: Duration of the draw animation
        fill_time: Duration of the fill animation
        fill_color: Color to fill with (defaults to stroke color)
        fill_opacity: Opacity of the fill
    """
    # Store original fill
    original_fill = mobject.get_fill_color()
    original_opacity = mobject.get_fill_opacity()

    # Remove fill temporarily
    mobject.set_fill(opacity=0)

    # Draw the border
    scene.play(Create(mobject, run_time=draw_time, rate_func=linear))

    # Now fill
    target_color = fill_color if fill_color else mobject.get_stroke_color()
    scene.play(
        mobject.animate.set_fill(target_color, opacity=fill_opacity),
        run_time=fill_time,
        rate_func=smooth
    )


def write_with_sound(scene: Scene, text_mobject: VMobject,
                     run_time: float = 2.0) -> None:
    """
    Write text with chalk-like effect (slightly slower, more organic).
    """
    scene.play(
        Write(text_mobject, run_time=run_time, rate_func=linear),
    )


def indicate_element(scene: Scene, mobject: VMobject,
                     color: str = CHALK_YELLOW,
                     scale: float = 1.2) -> None:
    """
    Briefly highlight an element to draw attention.
    """
    scene.play(
        Indicate(mobject, color=color, scale_factor=scale),
        run_time=0.5
    )


def morph_transform(scene: Scene, source: VMobject, target: VMobject,
                    run_time: float = 1.5) -> None:
    """
    Smooth transformation from one shape to another.
    More fluid than FadeIn/FadeOut.
    """
    scene.play(
        ReplacementTransform(source, target),
        run_time=run_time,
        rate_func=smooth
    )


# ══════════════════════════════════════════════════════════════════════════════
# CUSTOM MOBJECTS
# ══════════════════════════════════════════════════════════════════════════════

class ChalkText(Text):
    """
    Text with chalk-like appearance.
    Slightly larger stroke, off-white color.
    """
    def __init__(self, text: str, **kwargs):
        default_kwargs = {
            "font": WHITEBOARD_CONFIG["text_font"],
            "color": CHALK_WHITE,
            "font_size": 42,
            "weight": NORMAL,
        }
        default_kwargs.update(kwargs)
        super().__init__(text, **default_kwargs)


class ChalkTitle(Text):
    """
    Large title text for section headers.
    """
    def __init__(self, text: str, **kwargs):
        default_kwargs = {
            "font": WHITEBOARD_CONFIG["text_font"],
            "color": CHALK_WHITE,
            "font_size": 64,
            "weight": BOLD,
        }
        default_kwargs.update(kwargs)
        super().__init__(text, **default_kwargs)


class ChalkBox(RoundedRectangle):
    """
    Rounded rectangle with chalk-style stroke.
    Perfect for containing content.
    """
    def __init__(self, width: float = 4, height: float = 2,
                 stroke_color: str = CHALK_WHITE,
                 fill_opacity: float = 0, **kwargs):
        default_kwargs = {
            "width": width,
            "height": height,
            "corner_radius": 0.2,
            "stroke_color": stroke_color,
            "stroke_width": WHITEBOARD_CONFIG["default_stroke_width"],
            "fill_opacity": fill_opacity,
        }
        default_kwargs.update(kwargs)
        super().__init__(**default_kwargs)


class ChalkArrow(Arrow):
    """
    Arrow with chalk-like appearance.
    """
    def __init__(self, start, end, **kwargs):
        default_kwargs = {
            "color": CHALK_WHITE,
            "stroke_width": WHITEBOARD_CONFIG["default_stroke_width"],
            "max_tip_length_to_length_ratio": 0.2,
            "buff": 0.1,
        }
        default_kwargs.update(kwargs)
        super().__init__(start, end, **default_kwargs)


class ChalkCurvedArrow(CurvedArrow):
    """
    Curved arrow for more organic connections.
    """
    def __init__(self, start, end, **kwargs):
        default_kwargs = {
            "color": CHALK_WHITE,
            "stroke_width": WHITEBOARD_CONFIG["default_stroke_width"],
        }
        default_kwargs.update(kwargs)
        super().__init__(start, end, **default_kwargs)


class HighlightBox(SurroundingRectangle):
    """
    Box that highlights/surrounds content.
    """
    def __init__(self, mobject: VMobject, color: str = CODELCO_GREEN, **kwargs):
        default_kwargs = {
            "color": color,
            "buff": 0.2,
            "corner_radius": 0.1,
            "stroke_width": 3,
        }
        default_kwargs.update(kwargs)
        super().__init__(mobject, **default_kwargs)


class WarningBox(VGroup):
    """
    Warning/alert box with icon and text.
    """
    def __init__(self, text: str, level: str = "warning", **kwargs):
        super().__init__(**kwargs)

        colors = {
            "info": CHALK_BLUE,
            "warning": SAFETY_YELLOW,
            "danger": SAFETY_RED,
            "success": CHALK_GREEN,
        }
        color = colors.get(level, SAFETY_YELLOW)

        # Icon
        icon = Text("!", font_size=48, color=color, weight=BOLD)
        icon_circle = Circle(radius=0.4, color=color, stroke_width=3)
        icon.move_to(icon_circle)
        icon_group = VGroup(icon_circle, icon)

        # Text
        msg = ChalkText(text, font_size=28, color=color)
        msg.next_to(icon_group, RIGHT, buff=0.5)

        # Background
        content = VGroup(icon_group, msg)
        bg = ChalkBox(
            width=content.width + 0.8,
            height=content.height + 0.4,
            stroke_color=color,
            fill_color=BOARD_DARK,
            fill_opacity=0.8,
        )
        bg.move_to(content)

        self.add(bg, icon_group, msg)


class StepIndicator(VGroup):
    """
    Numbered step indicator (1, 2, 3...).
    """
    def __init__(self, number: int, color: str = CODELCO_GREEN, **kwargs):
        super().__init__(**kwargs)

        circle = Circle(
            radius=0.4,
            color=color,
            fill_color=color,
            fill_opacity=0.3,
            stroke_width=3,
        )
        num_text = Text(
            str(number),
            font_size=32,
            color=CHALK_WHITE,
            weight=BOLD,
        )
        num_text.move_to(circle)

        self.add(circle, num_text)
        self.circle = circle
        self.num_text = num_text


class ProgressBar(VGroup):
    """
    Animated progress bar for step sequences.
    """
    def __init__(self, total_steps: int, current_step: int = 0,
                 width: float = 6, height: float = 0.15, **kwargs):
        super().__init__(**kwargs)

        self.total_steps = total_steps
        self.width = width
        self.height = height

        # Background
        self.bg = Rectangle(
            width=width,
            height=height,
            stroke_color=CHALK_WHITE,
            stroke_width=1,
            fill_color=BOARD_DARK,
            fill_opacity=0.5,
        )

        # Progress fill
        progress_width = (current_step / total_steps) * width if total_steps > 0 else 0
        self.fill = Rectangle(
            width=max(0.01, progress_width),
            height=height,
            fill_color=CODELCO_GREEN,
            fill_opacity=0.8,
            stroke_width=0,
        )
        self.fill.align_to(self.bg, LEFT)

        self.add(self.bg, self.fill)

    def set_progress(self, step: int) -> Animation:
        """
        Returns animation to update progress.
        """
        new_width = (step / self.total_steps) * self.width
        return self.fill.animate.stretch_to_fit_width(
            max(0.01, new_width)
        ).align_to(self.bg, LEFT)


# ══════════════════════════════════════════════════════════════════════════════
# WHITEBOARD SCENE BASE CLASS
# ══════════════════════════════════════════════════════════════════════════════

class WhiteboardScene(MovingCameraScene):
    """
    Base scene with whiteboard defaults and camera support.

    Features:
    - Dark board background
    - Camera movements (zoom, pan)
    - Helper methods for common animations

    Usage:
        class MyScene(WhiteboardScene):
            def construct(self):
                self.setup_board()
                title = self.write_title("My Title")
                self.camera_zoom(0.5)
                ...
    """

    def setup_board(self, color: str = BOARD_DARK):
        """Initialize the board background."""
        self.camera.background_color = color

    def write_title(self, text: str, position=UP * 3, **kwargs) -> ChalkTitle:
        """Write a title at the top of the screen."""
        title = ChalkTitle(text, **kwargs)
        title.move_to(position)
        self.play(Write(title, run_time=1.5))
        return title

    def write_text(self, text: str, position=ORIGIN, **kwargs) -> ChalkText:
        """Write chalk text."""
        chalk = ChalkText(text, **kwargs)
        chalk.move_to(position)
        self.play(Write(chalk, run_time=1.2))
        return chalk

    def draw_box(self, mobject: VMobject, **kwargs) -> ChalkBox:
        """Draw a box and then fill it."""
        box = ChalkBox(**kwargs)
        box.move_to(mobject)
        draw_then_fill(self, box, fill_opacity=0.15)
        return box

    def camera_zoom(self, scale: float, target: VMobject = None,
                    run_time: float = 1.5):
        """Zoom camera in/out, optionally focusing on a target."""
        if target:
            self.play(
                self.camera.frame.animate.scale(scale).move_to(target),
                run_time=run_time,
                rate_func=smooth
            )
        else:
            self.play(
                self.camera.frame.animate.scale(scale),
                run_time=run_time,
                rate_func=smooth
            )

    def camera_pan(self, direction, amount: float = 3, run_time: float = 1.0):
        """Pan camera in a direction."""
        self.play(
            self.camera.frame.animate.shift(direction * amount),
            run_time=run_time,
            rate_func=smooth
        )

    def camera_reset(self, run_time: float = 1.0):
        """Reset camera to default position and scale."""
        self.play(
            self.camera.frame.animate.scale(1).move_to(ORIGIN),
            run_time=run_time
        )

    def fade_all(self, run_time: float = 0.8):
        """Fade out all mobjects on screen."""
        self.play(
            *[FadeOut(mob) for mob in self.mobjects],
            run_time=run_time
        )


# ══════════════════════════════════════════════════════════════════════════════
# DIAGRAM COMPONENTS
# ══════════════════════════════════════════════════════════════════════════════

class FlowDiagram(VGroup):
    """
    Horizontal or vertical flow diagram with connected boxes.
    """
    def __init__(self, items: list, direction: str = "horizontal",
                 box_width: float = 3, box_height: float = 1.5,
                 spacing: float = 1.0, colors: list = None, **kwargs):
        super().__init__(**kwargs)

        self.boxes = []
        self.labels = []
        self.arrows = []

        default_colors = [CODELCO_GREEN, CODELCO_ORANGE, CHALK_BLUE, SAFETY_YELLOW]
        colors = colors or default_colors

        dir_vector = RIGHT if direction == "horizontal" else DOWN

        for i, item in enumerate(items):
            color = colors[i % len(colors)]

            # Create box
            box = ChalkBox(
                width=box_width,
                height=box_height,
                stroke_color=color,
            )

            # Create label
            label = ChalkText(item, font_size=24)
            label.move_to(box)

            if i > 0:
                box.next_to(self.boxes[-1], dir_vector, buff=spacing)
                label.move_to(box)

                # Create arrow
                arrow = ChalkArrow(
                    self.boxes[-1].get_edge_center(dir_vector),
                    box.get_edge_center(-dir_vector),
                    color=CHALK_WHITE,
                )
                self.arrows.append(arrow)
                self.add(arrow)

            self.boxes.append(box)
            self.labels.append(label)
            self.add(box, label)

    def animate_build(self, scene: Scene):
        """Animate building the diagram step by step."""
        for i, (box, label) in enumerate(zip(self.boxes, self.labels)):
            draw_then_fill(scene, box, fill_color=box.get_stroke_color())
            scene.play(Write(label, run_time=0.8))

            if i < len(self.arrows):
                scene.play(GrowArrow(self.arrows[i], run_time=0.5))


class ComponentDiagram(VGroup):
    """
    Technical component diagram with labels and arrows.
    Useful for equipment cross-sections.
    """
    def __init__(self, main_shape: VMobject, **kwargs):
        super().__init__(**kwargs)
        self.main_shape = main_shape
        self.labels = []
        self.arrows = []
        self.add(main_shape)

    def add_label(self, text: str, target_point, direction=RIGHT,
                  distance: float = 2.0, color: str = CHALK_WHITE):
        """Add a labeled arrow pointing to a component."""
        label = ChalkText(text, font_size=18, color=color)
        label.next_to(target_point, direction, buff=distance)

        arrow = ChalkArrow(
            label.get_edge_center(-direction),
            target_point,
            color=CHALK_BLUE,
        )

        self.labels.append(label)
        self.arrows.append(arrow)
        self.add(label, arrow)

        return label, arrow


# ══════════════════════════════════════════════════════════════════════════════
# DEMO SCENE
# ══════════════════════════════════════════════════════════════════════════════

class WhiteboardDemo(WhiteboardScene):
    """
    Demonstration of whiteboard styles.
    Run: manim -pql whiteboard.py WhiteboardDemo
    """

    def construct(self):
        self.setup_board()

        # Title
        title = self.write_title("Whiteboard Demo")
        self.wait(1)

        # Draw a box with fill animation
        box = ChalkBox(width=4, height=2, stroke_color=CODELCO_GREEN)
        draw_then_fill(self, box, fill_color=CODELCO_GREEN)

        label = ChalkText("Draw then Fill", font_size=28)
        label.move_to(box)
        self.play(Write(label))

        self.wait(1)

        # Camera zoom
        self.camera_zoom(0.6, target=box)
        self.wait(0.5)
        self.camera_reset()

        # Flow diagram
        self.fade_all()

        flow = FlowDiagram(["Input", "Process", "Output"])
        flow.move_to(ORIGIN)
        flow.animate_build(self)

        self.wait(2)

        # Warning box
        self.fade_all()

        warning = WarningBox("Critical Safety Alert!", level="danger")
        self.play(FadeIn(warning, scale=0.8))

        self.wait(2)
        self.fade_all()


if __name__ == "__main__":
    print("""
    Whiteboard Styles Library
    =========================

    Available classes:
    - WhiteboardScene: Base scene with camera support
    - ChalkText, ChalkTitle: Text with chalk appearance
    - ChalkBox, ChalkArrow: Shapes with chalk style
    - WarningBox: Alert/warning component
    - StepIndicator: Numbered step circles
    - ProgressBar: Animated progress bar
    - FlowDiagram: Connected flow diagram
    - ComponentDiagram: Technical diagrams with labels

    Helper functions:
    - draw_then_fill(): Signature 3Blue1Brown effect
    - indicate_element(): Highlight attention
    - morph_transform(): Smooth shape transformation

    Demo:
    manim -pql whiteboard.py WhiteboardDemo
    """)
