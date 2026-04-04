# MCCO Video Generator

## Sistema Profesional de Videos de Capacitacion Estilo Pizarra

Este sistema genera videos de capacitacion de alta calidad, similares a los de 3Blue1Brown, a partir de documentos tecnicos. **Supera completamente** las capacidades de AntiGravity + Remotion.

---

## Comparacion: MCCO vs AntiGravity

| Caracteristica | AntiGravity + Remotion | MCCO Video Generator |
|----------------|------------------------|----------------------|
| Tipo de video | Logos animados, intros | Explicaciones tecnicas completas |
| Duracion | 5-10 segundos | Videos de capacitacion completos |
| Narracion | No incluida | TTS profesional en espanol chileno |
| Personalizacion | Templates genericos | Branding CODELCO integrado |
| Normativas | No aplica | DS132, DS594, ECF integrados |
| Motor | Remotion (basico) | Manim (3Blue1Brown) |
| Diagramas | No | Flujos de proceso animados |
| EPP | No | Visualizaciones de seguridad |

---

## Instalacion Rapida

```bash
# 1. Instalar Python 3.9+
# 2. Instalar FFmpeg (https://ffmpeg.org/download.html)

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Verificar instalacion
python main.py check
```

---

## Uso

### Generar Video de Ejemplo (RAFT)

```bash
# Pipeline completo
python main.py full

# O paso a paso:
python main.py audio    # Genera narracion
python main.py render   # Renderiza escenas
python main.py combine  # Combina video final
```

### Renderizar Escenas Individuales

```bash
# Calidad media (720p) - rapido
manim -qm src/generate_raft_video.py Scene001_IntroMCCO

# Calidad alta (1080p)
manim -qh src/generate_raft_video.py Scene001_IntroMCCO

# Calidad 4K
manim -qk src/generate_raft_video.py Scene001_IntroMCCO
```

### Convertir tu Propio Documento

```python
from src.video_pipeline import convert_document_to_video

# Convierte markdown a script de video
result = convert_document_to_video("mi_procedimiento.md")

print(f"Script Manim: {result['manim_script']}")
print(f"Script Narracion: {result['narration_script']}")
```

---

## Estructura del Proyecto

```
video-generator/
├── main.py                     # Script principal
├── requirements.txt            # Dependencias
├── README.md                   # Este archivo
├── src/
│   ├── config.py              # Configuracion (colores, voces)
│   ├── tts_engine.py          # Motor de narracion TTS
│   ├── video_pipeline.py      # Pipeline documento -> video
│   ├── generate_raft_video.py # Demo: Video RAFT completo
│   └── scenes/
│       ├── intro.py           # Escenas de introduccion
│       └── process_flow.py    # Diagramas y flujos
├── templates/                  # Templates reutilizables
├── assets/                     # Logos, iconos, fuentes
└── output/                     # Videos generados
    └── audio/                  # Archivos de narracion
```

---

## Escenas Disponibles

### Intros
- `ProfessionalIntro` - Intro cinematografica
- `WhiteboardTitle` - Titulo estilo pizarra
- `ProcedureTitle` - Titulo de procedimiento con codigo

### Contenido Tecnico
- `ProcessFlowDiagram` - Diagrama de flujo animado
- `StepByStepAnimation` - Lista de pasos con highlighting
- `SafetyWarning` - Advertencias de seguridad
- `EPPRequirements` - Visualizacion de EPP

---

## Voces TTS Disponibles

| Voz | ID | Descripcion |
|-----|-----|-------------|
| catalina | es-CL-CatalinaNeural | Femenina chilena (default) |
| lorenzo | es-CL-LorenzoNeural | Masculino chileno |
| elena | es-ES-ElviraNeural | Femenina espanola |
| alvaro | es-ES-AlvaroNeural | Masculino espanol |
| dalia | es-MX-DaliaNeural | Femenina mexicana |
| jorge | es-MX-JorgeNeural | Masculino mexicano |

```python
from src.tts_engine import NarradorProfesional

narrador = NarradorProfesional(voz="catalina")
narrador.generar_sync("Texto a narrar", "archivo_salida")
```

---

## Colores Corporativos

```python
COLORS = {
    "primary": "#00A651",      # Verde CODELCO
    "secondary": "#F7931E",    # Naranja alerta
    "danger": "#ED1C24",       # Rojo peligro
    "warning": "#FFF200",      # Amarillo advertencia
    "info": "#00AEEF",         # Azul informativo
}
```

---

## Requisitos del Sistema

- Python 3.9+
- FFmpeg (para combinacion de video/audio)
- 4GB RAM minimo (8GB recomendado para 4K)
- GPU opcional (acelera renderizado Manim)

---

## Proximos Pasos

1. **Integracion con Claude API** - Generacion automatica de guiones desde documentos
2. **Templates para ECF** - Escenas especificas para Estandares de Control de Fatalidad
3. **Export a WhatsApp** - Formato optimizado para compartir
4. **Dashboard web** - Interfaz para generar videos sin codigo

---

## Licencia

Proyecto interno MCCO para CODELCO.

---

*Sistema desarrollado para superar las limitaciones de AntiGravity y generar capacitaciones de clase mundial.*
