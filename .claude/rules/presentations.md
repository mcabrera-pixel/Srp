# Presentations — Estándares MCCO

Fuente: Mck-ppt-design-skill (78 stars), presenton (4.6k), Office-PowerPoint-MCP (1.6k).
Herramientas: tools/mcco_presentations/ (mcco_pptx.py, brand_config.py, image_prompts.py).

Estándares para presentaciones de calidad consulting en proyectos MCCO.
Aplica a: propuestas comerciales, reportes técnicos, demos a clientes mineros.

---

## 1. Principio de la Pirámide (Barbara Minto)

**Conclusión primero, soporte después.** Cada slide comunica UN mensaje principal.

### Título del Slide = Takeaway, NO Tópico

```
MAL:  "Análisis de mercado de cobre"
BIEN: "El mercado de cobre creció 23% impulsado por demanda eléctrica"

MAL:  "Resultados de inspección"
BIEN: "Se detectaron 3 puntos críticos que requieren intervención inmediata"

MAL:  "Propuesta técnica"
BIEN: "Nuestra solución reduce el tiempo de inspección de 5 días a 4 horas"
```

El cuerpo del slide SOPORTA el título con evidencia (datos, gráficos, bullets).
Si el cliente solo lee los títulos, entiende toda la historia.

---

## 2. MECE — Mutuamente Excluyente, Colectivamente Exhaustivo

Toda estructura de contenido debe ser MECE:
- Las categorías no se solapan (Mutuamente Excluyente)
- Las categorías cubren todo el espectro (Colectivamente Exhaustivo)

```
MAL (no MECE):
  - Servicios de inspección
  - Servicios con drones          ← se solapa con inspección
  - Otros servicios               ← cajón de sastre

BIEN (MECE):
  - Inspección aérea (drones)
  - Inspección terrestre (GPR, escáner)
  - Monitoreo continuo (IoT, sensores)
```

---

## 3. Narrativa SCR (Situation-Complication-Resolution)

Toda presentación MCCO sigue esta estructura narrativa:

```
Sección 1 — SITUACIÓN (dónde estamos)
  "Codelco opera 12 palas hidráulicas en División Norte"

Sección 2 — COMPLICACIÓN (qué problema hay)
  "Cada falla no detectada cuesta USD 600K+ y 72h de parada"

Sección 3 — RESOLUCIÓN (qué proponemos)
  "Inspección térmica con drones detecta fallas 30 días antes"

Sección 4 — EVIDENCIA (por qué creernos)
  "Caso Minera X: 4 fallas detectadas, USD 2.4M ahorrados"

Sección 5 — SIGUIENTE PASO (call to action)
  "Piloto de 3 meses con 2 palas: inversión $16K, ROI 15x"
```

---

## 4. Estructura de Deck Estándar MCCO

### Propuesta Comercial (12-15 slides)

| # | Slide | Tipo | Ejemplo de título-takeaway |
|---|-------|------|----------------------------|
| 1 | Cover | Title | "Inspección Térmica Predictiva para Chancador FLSmidth" |
| 2 | Resumen Ejecutivo | Content | "3 razones para actuar ahora: costo de falla, ventana de mantenimiento, ROI demostrado" |
| 3 | El Problema | Content | "Cada falla no detectada cuesta USD 600K y 72h de producción perdida" |
| 4 | Datos del Problema | KPI | 600K USD/falla, 72h downtime, 3 fallas/año promedio |
| 5 | Nuestra Solución | Content | "Detección térmica aérea identifica fallas 30 días antes del colapso" |
| 6 | Cómo Funciona | Timeline | Planificación → Vuelo → Análisis → Reporte → Acción |
| 7 | Caso de Éxito | Image | Foto: overlay térmico real sobre cilindro con hotspot |
| 8 | Resultados | KPI | 4 fallas detectadas, USD 2.4M ahorrados, 100% uptime |
| 9 | Comparación | Comparison | Sin inspección vs. Con inspección |
| 10 | Equipo | Content | Experiencia del equipo, certificaciones |
| 11 | Alcance y Cronograma | Timeline | Fases del proyecto con entregables |
| 12 | Inversión | KPI | Costo, ROI, payback |
| 13 | Próximos Pasos | Content | 3 acciones concretas con fechas |
| 14 | Cierre | Closing | Contacto + call to action |

### Reporte Técnico (8-12 slides)

| # | Slide | Tipo |
|---|-------|------|
| 1 | Cover | Title |
| 2 | Resumen Ejecutivo | Content (3-5 hallazgos clave) |
| 3-8 | Hallazgos | Image + Content (uno por hallazgo) |
| 9 | Recomendaciones | Content (priorizadas por urgencia) |
| 10 | Plan de Acción | Timeline |
| 11 | Anexos | Content |

---

## 5. Reglas de Diseño Visual

### Jerarquía Tipográfica

| Elemento | Tamaño | Peso | Fuente |
|----------|--------|------|--------|
| Cover title | 44pt | Bold | Calibri / Georgia |
| Section divider | 36pt | Bold | Calibri / Georgia |
| Slide title (takeaway) | 28pt | Bold | Calibri |
| Subtitle | 22pt | Regular | Calibri |
| Body / bullets | 16-18pt | Regular | Calibri |
| Caption / fuente | 9-11pt | Regular | Calibri |
| KPI number | 36pt | Bold | Calibri |
| KPI label | 14pt | Regular | Calibri |

### Reglas de Color

- **Máximo 4-5 colores por deck** — usar paleta de brand_config.py
- **Primary (navy)** para títulos y elementos principales
- **Secondary (copper/accent)** para highlights y datos clave
- **Grises** para texto secundario y separadores
- **Rojo** SOLO para alertas/negativo — NUNCA decorativo
- **Verde** SOLO para positivo/éxito

### Paleta MCCO (brand_config.py)

| Color | Hex | Uso |
|-------|-----|-----|
| Navy (primary) | #0A1F3F | Fondo dark, títulos light |
| Copper (secondary) | #C86E2D | Acentos, highlights, datos clave |
| Blue accent | #2980B9 | Links, elementos interactivos |
| Dark gray | #333333 | Texto principal en fondo claro |
| Med gray | #999999 | Texto secundario, footers |
| Light gray | #F2F2F2 | Fondos de cards, separadores |

### Reglas de Layout

- **Máximo 5 bullets por slide** — si necesitas más, divide en 2 slides
- **Un gráfico/tabla por slide** — nunca competir por atención
- **Whitespace es tu amigo** — no llenar todo el espacio disponible
- **Alineación consistente** — todo el texto arranca en la misma X (0.8 inches)
- **Sin sombras, sin 3D, sin gradientes en elementos** — flat design McKinsey
- **Footer en toda slide** — "{Brand} | Confidencial" + número de página

---

## 6. Reglas de Datos y Gráficos

### Título del gráfico = el insight

```
MAL:  "Ventas Q1-Q4 2025"
BIEN: "Las ventas Q4 superaron la meta en 18%, lideradas por minería"
```

### Simplificar al máximo

- Remover gridlines innecesarias
- Remover bordes de gráficos
- Highlight el dato que importa (color acento, bold)
- Usar labels directos en vez de leyenda cuando sea posible
- Redondear números: "$4.8M" no "$4,823,456"

### Formato de números (Chile)

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| CLP | Punto como separador de miles | $3.500.000 |
| USD | Con prefijo | USD 600K |
| UF | Con 2 decimales | UF 2.869,00 |
| Porcentaje | Sin decimal si >1% | 23%, 0.5% |

---

## 7. Generación de Imágenes (MiniMax API)

### Fórmula de 5 capas (image_prompts.py)

```
[SUJETO + desgaste] + [ENTORNO] + [CÁMARA + LENTE] + [ILUMINACIÓN] + [FILM STOCK]
```

### 7 palabras anti-IA (incluir al menos 3)

1. "natural imperfections"
2. "candid moment"
3. "detailed skin pores / scratched metal / dusty equipment"
4. "slight motion blur"
5. "environmental dust particles"
6. "fabric weave visible / weathered surface"
7. Film stock específico (Kodak Portra 400, Fujifilm Velvia 50)

### Palabras PROHIBIDAS

"magical", "ethereal", "dreamlike", "stunning", "beautiful", "perfect",
"flawless", "ultra-smooth", "masterpiece", "best quality", "unreal engine",
"octane render", "hyperrealistic"

### Dos categorías de imagen

| Tipo | Uso | Base prompt |
|------|-----|-------------|
| Fotorealista | Fotos de campo, equipos, personas | PHOTO_REALISTIC_BASE |
| Explicativa | Diagramas, workflows, infografías | EXPLANATORY_BASE |

Limitación: MiniMax no genera texto legible. Para labels, generar imagen
sin texto y agregar overlays con python-pptx.

---

## 8. Herramientas Disponibles

### mcco_pptx.py (ya implementado)

```python
from mcco_presentations.mcco_pptx import MCCOPresentation

pres = MCCOPresentation(brand="mcco_copper", style="dark_modern")
pres.add_title_slide("Título", "Subtítulo")
pres.add_section_slide("Sección 1", section_number=1)
pres.add_content_slide("El takeaway va aquí", bullets=["Dato 1", "Dato 2"])
pres.add_kpi_slide([("USD 600K", "Costo falla"), ("15x", "ROI")])
pres.add_comparison_slide("Antes vs Después", "Sin MCCO", [...], "Con MCCO", [...])
pres.add_timeline_slide("Cronograma", [("Fase 1", "Desc"), ("Fase 2", "Desc")])
pres.add_image_slide("Inspección térmica", "thermal.jpg")
pres.add_closing_slide("Gracias", contact_info="mario@mccogroup.cl")
pres.save("propuesta.pptx")
```

Marcas: `mcco_copper`, `condrone`, `nflux`, `web24pro`, `leica_mining`, `paola_agent`
Estilos: `dark_modern`, `light_clean`, `gradient_premium`

### Repos de referencia

| Repo | Stars | Qué aporta |
|------|-------|------------|
| [Mck-ppt-design-skill](https://github.com/likaku/Mck-ppt-design-skill) | 78 | 70 layouts McKinsey, QA pipeline, guard rails |
| [presenton](https://github.com/presenton/presenton) | 4.6k | Generador IA open-source (alternativa a Gamma) |
| [Office-PowerPoint-MCP](https://github.com/GongRzhe/Office-PowerPoint-MCP-Server) | 1.6k | MCP server con 32 tools PPTX |
| [python-pptx](https://github.com/scanny/python-pptx) | 3.3k | Librería base para PPTX |
| [mingrammer/diagrams](https://github.com/mingrammer/diagrams) | 42k | Diagram-as-Code para arquitectura |

---

## 9. Storylines Reutilizables MCCO

### Propuesta de Inspección (ConDrone)

```python
storyline_inspeccion = [
    {"type": "title", "title": "...", "subtitle": "..."},
    {"type": "content", "title": "El costo de no inspeccionar", "bullets": [...]},
    {"type": "kpi", "kpis": [("USD 600K", "Por falla"), ...]},
    {"type": "content", "title": "Nuestra solución detecta fallas 30 días antes"},
    {"type": "timeline", "title": "Cómo funciona", "phases": [...]},
    {"type": "image", "title": "Caso real: hotspot en cilindro", "path": "..."},
    {"type": "comparison", "title": "Sin vs. Con inspección"},
    {"type": "kpi", "title": "Inversión y ROI"},
    {"type": "closing", "title": "Siguiente paso: piloto de 3 meses"},
]
```

### Propuesta de Ingeniería (MCCO Copper)

```python
storyline_ingenieria = [
    {"type": "title"},
    {"type": "content", "title": "Resumen ejecutivo (3 puntos clave)"},
    {"type": "content", "title": "Alcance técnico del proyecto"},
    {"type": "timeline", "title": "Metodología en 4 fases"},
    {"type": "content", "title": "Equipo asignado y experiencia"},
    {"type": "kpi", "title": "Inversión: UF X.XXX"},
    {"type": "timeline", "title": "Cronograma de ejecución"},
    {"type": "content", "title": "Términos comerciales"},
    {"type": "closing"},
]
```

---

## 10. Checklist Pre-Envío

Antes de enviar cualquier presentación a un cliente:

```
□ Todos los títulos son takeaways (no tópicos)
□ La narrativa sigue SCR (Situación → Complicación → Resolución)
□ Máximo 5 bullets por slide
□ Números formateados según estándar chileno
□ Sin typos ni errores de formato
□ Fuentes citadas donde corresponde (pie de slide)
□ Logo y colores de marca correctos
□ Footer "Confidencial" en todas las slides
□ Nombre del cliente correcto en toda la presentación
□ PDF exportado además de PPTX (para compatibilidad)
□ Imágenes en alta resolución (no pixeladas)
□ Montos en UF con referencia MCCO-YYYY-CLI-NNN
```
