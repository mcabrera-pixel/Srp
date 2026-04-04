# Prompt Stitch 2.0 — SRP Suite: Web Comercial Minería

## Contexto del Producto

**SRP Suite** (Safety & Risk Procedures) es una plataforma de inteligencia artificial desarrollada por **MCCO Group** que genera automáticamente **procedimientos de trabajo seguro** para la industria minera. El sistema recibe una descripción de tarea (por voz o texto vía WhatsApp), analiza riesgos fatales, consulta normativa chilena (DS132) y entrega un documento DOCX profesional listo para revisión y aprobación.

**Estado actual:** Piloto activo con **División Chuquicamata** (Codelco). Estamos entrenando y ajustando modelos de IA especializados en seguridad minera para responder con precisión a los requerimientos operacionales del sector.

**Mercado objetivo:** Grandes y medianas empresas mineras en Chile y Latinoamérica. Foco inicial en minería del cobre.

---

## Qué construir

Una **landing page / sitio web profesional de 1 página (one-page scrolleable)** con secciones bien definidas, diseñada para:
1. Posicionar a SRP Suite como solución enterprise de IA para seguridad minera
2. Transmitir confianza, seriedad técnica y respaldo de un piloto real en Chuquicamata
3. Capturar leads de empresas mineras interesadas (formulario de contacto / demo)

**NO es un dashboard ni un panel de administración.** Es una web comercial/marketing.

---

## Stack Tecnológico

- **Framework**: React + TypeScript (Vite)
- **Styling**: Tailwind CSS
- **Animaciones**: Framer Motion (scroll-triggered, sutiles, profesionales)
- **Icons**: Lucide React
- **Fuentes**: Inter (cuerpo) + Space Grotesk o Outfit (títulos)
- **Responsive**: Mobile-first, optimizado para desktop y tablet

---

## Diseño Visual — Identidad "Mining Tech Enterprise"

### Paleta de Colores

```
Primarios:
  --brand-gold:      #D4A012    (oro/ámbar oscuro — identidad minera, premium)
  --brand-gold-light:#F5C842    (hover / acentos)
  --brand-dark:      #0A0E1A    (fondo principal — casi negro azulado)
  --brand-navy:      #111827    (fondo secciones alternas)
  --brand-slate:     #1E293B    (cards, superficies elevadas)

Acentos:
  --accent-blue:     #2563EB    (CTAs secundarios, enlaces)
  --accent-emerald:  #059669    (indicadores de éxito, métricas positivas)
  --accent-red:      #DC2626    (riesgo fatal — badges de seguridad)
  --accent-amber:    #F59E0B    (advertencias, riesgo medio)

Texto:
  --text-primary:    #F1F5F9    (blanco cálido)
  --text-secondary:  #94A3B8    (gris claro)
  --text-muted:      #64748B    (texto terciario)

Gradientes hero:
  --gradient-hero:   radial-gradient(ellipse at 30% 0%, rgba(212,160,18,0.15) 0%, transparent 60%)
  --gradient-glow:   radial-gradient(circle at center, rgba(37,99,235,0.08) 0%, transparent 50%)
```

### Reglas de Diseño

- **Dark mode exclusivo** — la minería es industria pesada, el dark transmite seriedad técnica
- Tipografía grande para títulos (clamp responsive: 2.5rem → 4.5rem)
- Cards con `backdrop-blur` y bordes sutiles `border: 1px solid rgba(255,255,255,0.06)`
- Hover states con `glow` dorado sutil en cards importantes
- Íconos con trazo fino (Lucide), color gold en íconos principales
- Espaciado generoso (padding sections: 6rem → 8rem vertical)
- Grid lines decorativas sutiles de fondo (patrón ingeniería/técnico)
- **Sin emojis** en la UI — usar íconos Lucide exclusivamente
- Imágenes: usar gradientes y formas geométricas abstractas si no hay fotos reales (no usar placeholder stock photos genéricas)

---

## Estructura de la Página (Secciones en orden de scroll)

---

### 1. HERO SECTION

**Layout:** Full viewport height. Texto izquierda (60%) + visual abstracto derecha (40%)

**Contenido:**

```
Badge superior:    "Piloto activo en División Chuquicamata — Codelco"
                   (badge con borde dorado, icono Shield o CheckCircle)

Título H1:         "Procedimientos de Seguridad
                    Generados con IA en Minutos"

Subtítulo:         "SRP Suite transforma la descripción verbal de una tarea
                    en un procedimiento de trabajo seguro completo,
                    con análisis de riesgos fatales y cumplimiento normativo DS132."

CTA primario:      [Solicitar Demo]  → scroll a formulario de contacto
                   Botón grande, fondo dorado, texto negro, hover glow

CTA secundario:    [Ver cómo funciona]  → scroll a sección "Cómo Funciona"
                   Botón outline blanco, hover fill sutil

Indicador:         "Desarrollado en Chile para la minería chilena"
                   con icono de bandera o pin de ubicación

Stats rápidos (fila horizontal debajo de CTAs):
  "< 5 min"    — Tiempo de generación
  "12+"        — Riesgos fatales mapeados
  "DS132"      — Cumplimiento normativo
  "24/7"       — Disponible vía WhatsApp
```

**Visual derecho:** Composición abstracta/geométrica que sugiera:
- Un documento que se genera (líneas animadas que se llenan)
- O un diagrama de flujo simplificado del proceso
- Usar formas con gradiente dorado/azul sobre fondo oscuro
- Animación sutil: fade-in con slight float, partículas de luz dorada

---

### 2. LOGO BAR / TRUST INDICATORS

**Layout:** Barra horizontal angosta, fondo ligeramente diferente (`--brand-navy`)

```
Texto:     "Tecnología validada en operaciones de clase mundial"

Logos/badges (en gris, con hover a color):
  - "Codelco — División Chuquicamata" (texto estilizado como logo)
  - "DS132 Compliant" (badge con ícono de certificación)
  - "Powered by AI" (badge con ícono de cerebro/chip)
  - "ISO 45001 Aligned" (badge)
```

*Nota: si no hay logos reales autorizados, usar texto estilizado con íconos, no logos falsos.*

---

### 3. PROBLEMA / PAIN POINTS

**Layout:** Título centrado + grid de 3 cards

**Título sección:** "La gestión de procedimientos en minería está rota"
**Subtítulo:** "Las operaciones mineras enfrentan desafíos críticos que ponen en riesgo vidas y productividad"

**Cards (3 columnas):**

```
Card 1 — Ícono: Clock
  Título: "Semanas en crear un procedimiento"
  Texto:  "Redactar, revisar y aprobar un PTS puede tomar 2 a 4 semanas,
           retrasando operaciones críticas y generando trabajo informal."

Card 2 — Ícono: AlertTriangle
  Título: "Riesgos fatales no detectados"
  Texto:  "La evaluación manual de riesgos depende de la experiencia individual.
           Controles críticos se omiten por desconocimiento o apuro operacional."

Card 3 — Ícono: FileX
  Título: "Documentación desactualizada"
  Texto:  "Procedimientos que no reflejan la realidad operativa actual.
           Versiones obsoletas que circulan sin control entre las cuadrillas."
```

**Diseño cards:** Fondo `--brand-slate`, borde sutil, ícono grande en color rojo/amber arriba, texto blanco.

---

### 4. SOLUCIÓN — "Cómo Funciona" (id: como-funciona)

**Layout:** Título centrado + flujo vertical/horizontal de 4 pasos con línea conectora

**Título:** "De la descripción verbal al procedimiento aprobado"
**Subtítulo:** "Un flujo inteligente que combina IA, normativa y conocimiento operacional"

**Pasos (con animación secuencial al scroll):**

```
Paso 1 — Ícono: MessageSquare (dorado)
  Título: "Describe la tarea"
  Texto:  "El trabajador envía un audio o texto por WhatsApp describiendo
           la tarea que necesita procedimentar. Sin formularios, sin burocracia."

     ↓ (línea conectora animada)

Paso 2 — Ícono: Brain (azul)
  Título: "IA analiza y evalúa"
  Texto:  "El sistema transcribe el audio, extrae los pasos operacionales,
           evalúa la calidad de cada paso y solicita detalles faltantes al trabajador."

     ↓

Paso 3 — Ícono: Shield (rojo/amber)
  Título: "Mapeo de riesgos fatales"
  Texto:  "SRP Suite cruza cada paso contra la base de datos de 12 riesgos fatales
           de Codelco, identificando controles preventivos y mitigadores aplicables."

     ↓

Paso 4 — Ícono: FileCheck (verde)
  Título: "Documento DOCX generado"
  Texto:  "Se genera un procedimiento completo en formato DOCX con todas las
           secciones normativas: objetivo, alcance, responsabilidades,
           pasos operacionales, análisis de riesgos, EPP y referencias."
```

---

### 5. FEATURES / CAPACIDADES TÉCNICAS

**Layout:** Grid 2x3 de feature cards con ícono + título + descripción

**Título sección:** "Capacidades que marcan la diferencia"

```
Feature 1 — Ícono: Mic
  "Entrada por voz"
  "Transcripción automática de audios de WhatsApp usando Whisper AI.
   El trabajador describe la tarea en sus propias palabras."

Feature 2 — Ícono: Database
  "RAG con documentos reales"
  "El sistema consulta procedimientos aprobados, prototipos y normativas
   ingestadas para generar contenido basado en referencias reales."

Feature 3 — Ícono: ShieldAlert
  "12 Riesgos Fatales Codelco"
  "Base de datos completa de riesgos de fatalidad con controles
   preventivos y mitigadores. Mapeo automático por tarea y zona."

Feature 4 — Ícono: UserCheck
  "Perfiles de trabajadores"
  "El sistema aprende el estilo de comunicación, área y cargo de cada
   trabajador para personalizar la interacción y los procedimientos."

Feature 5 — Ícono: GitBranch
  "Evaluación paso a paso"
  "Cada paso operacional recibe un score de calidad (1-10).
   Si es insuficiente, el sistema pide refinamiento al trabajador."

Feature 6 — Ícono: Layers
  "Multi-modelo adaptativo"
  "Catálogo de modelos LLM configurables en runtime: MiniMax, Gemini,
   Claude, GPT-4o, Deepseek. Se elige el mejor modelo para cada caso."
```

**Diseño cards:** Hover con borde dorado sutil + elevación. Ícono en un círculo con fondo rgba dorado.

---

### 6. PILOTO CHUQUICAMATA — SOCIAL PROOF

**Layout:** Sección con fondo diferenciado (gradient sutil dorado), layout asimétrico

**Badge:** "Caso de Estudio Activo"

**Título:** "Validando SRP Suite en la mina de cobre más grande del mundo"

**Contenido (lado izquierdo, 55%):**
```
"División Chuquicamata de Codelco es nuestro primer socio piloto.
 Estamos trabajando directamente con equipos operacionales para:

  ✓  Entrenar modelos con procedimientos reales de la división
  ✓  Mapear los 12 riesgos fatales con controles específicos de la operación
  ✓  Validar la calidad de los procedimientos generados con supervisores
  ✓  Ajustar el sistema al lenguaje y cultura operacional minera chilena

 El piloto nos permite iterar rápidamente sobre datos reales
 y construir una IA que entiende la minería desde adentro."
```

**Lado derecho (45%):**
Card con métricas del piloto (datos ilustrativos):
```
┌──────────────────────────────────┐
│  Piloto Chuquicamata             │
│  ─────────────────────────       │
│  Riesgos fatales mapeados: 12   │
│  Controles en base de datos: 80+│
│  Tiempo promedio generación: ~4m│
│  Modelos en entrenamiento: 3    │
│  Estado: En curso               │
│  Inicio: Marzo 2026             │
└──────────────────────────────────┘
```

---

### 7. TECNOLOGÍA — Para el tomador de decisión técnico

**Layout:** Título + grid 2 columnas (texto izq + diagrama derecha)

**Título:** "Arquitectura enterprise-ready"
**Subtítulo:** "Diseñada para desplegarse on-premise o en nube privada, con los más altos estándares de seguridad"

**Columna izquierda — bullets técnicos:**
```
Infraestructura:
  • Despliegue Docker containerizado (on-premise o cloud)
  • Almacenamiento S3-compatible (MinIO) — datos no salen de tu red
  • Base de datos SQLite embebida — sin dependencias externas
  • CI/CD con GitLab + SAST + Secret Detection

Inteligencia Artificial:
  • RAG (Retrieval-Augmented Generation) con embeddings multilingües
  • Catálogo multi-modelo: MiniMax, OpenAI, Gemini, Deepseek, Ollama
  • Modelos ejecutables 100% on-premise con Ollama (sin enviar datos a cloud)
  • Transcripción de voz con Whisper AI

Integración:
  • API REST completa (15+ endpoints)
  • WebSocket para tiempo real
  • WhatsApp Business vía Wasender API
  • Generación DOCX desde templates personalizables
```

**Columna derecha:** Diagrama simplificado de arquitectura (recrear con divs/SVG estilizados):
```
  ┌─────────────┐
  │  WhatsApp   │──┐
  └─────────────┘  │   ┌────────────────────┐
                   ├──▶│   SRP Suite Core    │
  ┌─────────────┐  │   │  ┌──────────────┐  │
  │  Web Chat   │──┘   │  │ Motor IA     │  │
  └─────────────┘      │  │ RAG + LLM    │  │
                       │  ├──────────────┤  │
                       │  │ Base Riesgos │  │
                       │  ├──────────────┤  │    ┌──────────┐
                       │  │ Gen. DOCX    │──┼───▶│  DOCX    │
                       │  └──────────────┘  │    └──────────┘
                       │  ┌──────────────┐  │
                       │  │ SQLite+MinIO │  │
                       │  └──────────────┘  │
                       └────────────────────┘
```
(Renderizar como componente visual con boxes estilizados, no ASCII art real)

---

### 8. BENEFICIOS POR ROL

**Layout:** 3 cards horizontales con ícono de persona/rol

```
Card 1 — Ícono: HardHat
  Rol: "Para el Trabajador"
  • "Describe la tarea en tus palabras, por WhatsApp"
  • "Sin formularios complicados ni jerga normativa"
  • "Recibe el procedimiento en minutos, no semanas"

Card 2 — Ícono: ClipboardCheck
  Rol: "Para el Supervisor / Prevencionista"
  • "Procedimientos pre-evaluados con análisis de riesgos"
  • "Controles críticos ya mapeados — solo revisar y aprobar"
  • "Trazabilidad completa: quién solicitó, cuándo, qué versión"

Card 3 — Ícono: Building2
  Rol: "Para la Gerencia"
  • "Reducción drástica en tiempos de procedimentación"
  • "Cumplimiento normativo DS132 por diseño"
  • "Estandarización de procedimientos en toda la operación"
```

---

### 9. CTA / FORMULARIO DE CONTACTO (id: contacto)

**Layout:** Split — texto motivacional izquierda + formulario derecha

**Título:** "Lleva la seguridad de tu operación al siguiente nivel"
**Subtítulo:** "Agenda una demo personalizada para tu faena minera"

**Formulario (lado derecho):**
```
Campos:
  - Nombre completo *
  - Cargo *
  - Empresa / Faena *
  - Email corporativo *
  - Teléfono (opcional)
  - Mensaje (textarea, opcional)
    Placeholder: "Cuéntanos sobre tu operación y qué desafíos enfrentan
                  en gestión de procedimientos..."

Botón: [Solicitar Demo]  (dorado, grande, full-width)

Texto legal: "Al enviar este formulario, aceptas que MCCO Group
             te contacte para agendar una demostración."
```

**Lado izquierdo — puntos de valor:**
```
  ✓ Demo personalizada con datos de tu operación
  ✓ Sin compromiso — evaluación gratuita
  ✓ Implementación en menos de 1 semana
  ✓ Soporte técnico directo del equipo de desarrollo
```

**Nota técnica:** El formulario puede simplemente enviar un POST a un endpoint placeholder (`/api/contact`) o usar `mailto:` como fallback. No necesita backend real por ahora.

---

### 10. FOOTER

**Layout:** 3 columnas + línea divisoria + copyright

```
Columna 1 — Logo + descripción:
  Logo "SRP Suite" con subtítulo "by MCCO Group"
  "Inteligencia artificial especializada en seguridad
   para la industria minera."

Columna 2 — Navegación:
  Producto
    • Cómo funciona
    • Capacidades
    • Tecnología
  Empresa
    • Piloto Chuquicamata
    • Contacto

Columna 3 — Contacto:
  contacto@mccogroup.cl
  Santiago, Chile
  LinkedIn (ícono)

─────────────────────────────────
© 2026 MCCO Group SpA. Todos los derechos reservados.
```

---

## Animaciones (Framer Motion)

1. **Hero:** Fade-in escalonado (badge → título → subtítulo → CTAs → stats) con 150ms delay entre elementos
2. **Scroll reveal:** Cada sección aparece con `opacity: 0 → 1` + `translateY: 30px → 0` al entrar al viewport
3. **Cards:** Stagger animation al entrar (0.1s delay entre cards)
4. **Flujo "Cómo funciona":** Las líneas conectoras se "dibujan" con stroke-dashoffset animation al scroll
5. **Stats counter:** Los números del hero y del piloto hacen count-up animation
6. **Hover cards:** Scale sutil (1.02) + border-glow dorado
7. **Parallax sutil:** El visual del hero se mueve ligeramente con scroll (parallax factor 0.3)
8. **NO usar:** animaciones bouncy, rotaciones, colores intermitentes, nada que distraiga

---

## Navegación

**Header fijo (sticky):**
```
[Logo SRP Suite]    Producto  |  Cómo funciona  |  Tecnología  |  Piloto    [Solicitar Demo →]
```

- Fondo transparente en el hero, cambia a `--brand-dark` con blur al hacer scroll
- Links hacen smooth scroll a las secciones correspondientes
- Botón "Solicitar Demo" siempre visible, scroll a formulario
- Mobile: hamburger menu con drawer lateral

---

## Responsive Breakpoints

```
Mobile  (< 768px):
  - Stack vertical en todas las grids
  - Hero: texto centrado, sin visual lateral
  - Navegación: hamburger menu
  - Font sizes reducidos proporcionalmente
  - CTAs full-width

Tablet (768px - 1024px):
  - Grid 2 columnas donde aplique
  - Hero con visual reducido

Desktop (> 1024px):
  - Layout completo como se describe arriba
  - Max-width container: 1280px centrado
```

---

## SEO y Meta Tags

```html
<title>SRP Suite — Procedimientos de Seguridad Minera con IA | MCCO Group</title>
<meta name="description" content="Genera procedimientos de trabajo seguro para minería en minutos usando inteligencia artificial. Análisis de riesgos fatales, cumplimiento DS132. Piloto activo en Chuquicamata.">
<meta name="keywords" content="seguridad minera, procedimientos de trabajo seguro, PTS, IA minería, riesgos fatales, DS132, Codelco, Chuquicamata, MCCO Group, SRP Suite">
<meta property="og:title" content="SRP Suite — IA para Seguridad Minera">
<meta property="og:description" content="Transforma la descripción de una tarea en un procedimiento de seguridad completo. Piloto activo en División Chuquicamata.">
<meta property="og:type" content="website">
```

---

## Idioma

Toda la web en **español de Chile**. Usar terminología minera chilena:
- "Faena" (no "mina" genérico)
- "Procedimiento de trabajo seguro" / "PTS"
- "Cuadrilla" (equipo de trabajo)
- "Prevencionista de riesgos"
- "EPP" (elementos de protección personal)
- "DS132" (Decreto Supremo 132, reglamento de seguridad minera)
- "Riesgos fatales" (no "riesgos críticos")

---

## Notas Técnicas para el Builder

1. **Es una landing page comercial**, NO un dashboard. No debe tener login, sidebar ni funcionalidades interactivas más allá del formulario de contacto
2. **No uses imágenes stock** de minería — preferir formas geométricas, gradientes y composiciones abstractas que sugieran tecnología + industria pesada
3. **El formulario es presentacional** — puede hacer console.log o enviar a un endpoint placeholder
4. **Performance**: lazy-load las animaciones, usar `will-change` con moderación, Lighthouse score > 90
5. **Accesibilidad**: contraste WCAG AA en todos los textos, alt text en elementos visuales, navegación por teclado
6. **No inventar métricas falsas** — las métricas del piloto deben ser presentadas como "en desarrollo" o usar los datos reales que proporcioné (12 riesgos fatales, 80+ controles)
