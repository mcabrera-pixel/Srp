"""
MCCO Video Generator
Sistema profesional de generacion de videos de capacitacion
"""

from .config import COLORS, VIDEO_CONFIG, TTS_CONFIG
from .tts_engine import NarradorProfesional, GuionCapacitacion
from .video_pipeline import DocumentToVideoConverter, convert_document_to_video

__version__ = "1.0.0"
__author__ = "MCCO"

__all__ = [
    "COLORS",
    "VIDEO_CONFIG",
    "TTS_CONFIG",
    "NarradorProfesional",
    "GuionCapacitacion",
    "DocumentToVideoConverter",
    "convert_document_to_video",
]
