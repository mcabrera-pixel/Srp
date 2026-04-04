"""
Whiteboard Styles Package
"""
from .whiteboard import (
    # Colors
    BOARD_DARK,
    BOARD_GREEN,
    CHALK_WHITE,
    CHALK_BLUE,
    CHALK_YELLOW,
    CHALK_ORANGE,
    CHALK_RED,
    CHALK_GREEN,
    CODELCO_GREEN,
    CODELCO_ORANGE,
    CODELCO_BLUE,
    SAFETY_RED,
    SAFETY_YELLOW,
    WHITEBOARD_CONFIG,

    # Functions
    draw_then_fill,
    write_with_sound,
    indicate_element,
    morph_transform,

    # Mobjects
    ChalkText,
    ChalkTitle,
    ChalkBox,
    ChalkArrow,
    ChalkCurvedArrow,
    HighlightBox,
    WarningBox,
    StepIndicator,
    ProgressBar,

    # Diagrams
    FlowDiagram,
    ComponentDiagram,

    # Scene
    WhiteboardScene,
)

__all__ = [
    "BOARD_DARK", "BOARD_GREEN", "CHALK_WHITE", "CHALK_BLUE", "CHALK_YELLOW",
    "CHALK_ORANGE", "CHALK_RED", "CHALK_GREEN", "CODELCO_GREEN", "CODELCO_ORANGE",
    "CODELCO_BLUE", "SAFETY_RED", "SAFETY_YELLOW", "WHITEBOARD_CONFIG",
    "draw_then_fill", "write_with_sound", "indicate_element", "morph_transform",
    "ChalkText", "ChalkTitle", "ChalkBox", "ChalkArrow", "ChalkCurvedArrow",
    "HighlightBox", "WarningBox", "StepIndicator", "ProgressBar",
    "FlowDiagram", "ComponentDiagram", "WhiteboardScene",
]
