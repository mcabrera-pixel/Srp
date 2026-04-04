"""
Configuracion central del generador de videos MCCO
"""
from pathlib import Path

# Directorios
BASE_DIR = Path(__file__).parent.parent
OUTPUT_DIR = BASE_DIR / "output"
ASSETS_DIR = BASE_DIR / "assets"
TEMPLATES_DIR = BASE_DIR / "templates"

# Configuracion de video
VIDEO_CONFIG = {
    "pixel_width": 1920,
    "pixel_height": 1080,
    "frame_rate": 60,
    "background_color": "#1a1a2e",  # Azul oscuro profesional
}

# Colores corporativos MCCO/CODELCO
COLORS = {
    "primary": "#00A651",      # Verde CODELCO
    "secondary": "#F7931E",    # Naranja alerta
    "danger": "#ED1C24",       # Rojo peligro
    "warning": "#FFF200",      # Amarillo advertencia
    "info": "#00AEEF",         # Azul informativo
    "text": "#FFFFFF",         # Blanco texto
    "background": "#1a1a2e",   # Fondo oscuro
    "accent": "#16213E",       # Acento azul
}

# Configuracion de voz TTS
TTS_CONFIG = {
    "voice": "es-CL-CatalinaNeural",  # Voz chilena femenina
    "voice_male": "es-CL-LorenzoNeural",  # Voz chilena masculina
    "rate": "+0%",
    "pitch": "+0Hz",
}

# Estilo de texto
TEXT_STYLE = {
    "font": "Arial",
    "title_size": 72,
    "subtitle_size": 48,
    "body_size": 36,
}
