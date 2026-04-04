# Prompt para Stitch — SRP Suite Web Frontend

## Resumen del Proyecto

Construye un **panel web moderno** para **SRP Suite** (Safety Procedure Suite), un sistema de generación de procedimientos de seguridad minera con IA. El backend ya existe como API REST + WebSocket en Express/Node.js (puerto 3000). Necesito **solo el frontend** que consuma esa API.

El sistema permite a trabajadores mineros describir una tarea por chat y la IA genera automáticamente un procedimiento completo en DOCX cumpliendo normativa chilena DS132.

---

## Stack Tecnológico

- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Estado**: Zustand o Context API
- **WebSocket**: nativo (ws://localhost:3000/ws)
- **HTTP Client**: fetch nativo
- **Icons**: Lucide React
- **Componentes**: shadcn/ui

---

## Diseño Visual

- **Tema**: Dark mode por defecto, paleta industrial/minera
  - Background principal: `#0f1117` (casi negro)
  - Sidebar: `#161923`
  - Cards: `#1c1f2e`
  - Accent primario: `#f59e0b` (amber/oro — identidad minera)
  - Accent secundario: `#3b82f6` (azul)
  - Success: `#22c55e`
  - Danger: `#ef4444`
  - Texto principal: `#e2e8f0`
  - Texto secundario: `#94a3b8`
- **Tipografía**: Inter o sistema sans-serif
- **Border radius**: 12px en cards, 8px en botones
- **Layout**: Sidebar fijo izquierdo + contenido principal

---

## Estructura de Navegación (Sidebar izquierdo)

```
Logo "SRP Suite" + icono casco minero
─────────────────────
PRINCIPAL
  💬 Chat IA            ← vista principal
  📄 Procedimientos     ← lista de procedimientos generados
  📋 Solicitudes        ← kanban de procedure_requests

ADMINISTRACIÓN
  📚 Documentos RAG     ← gestión de documentos base
  📐 Templates DOCX     ← gestión de templates
  🤖 Modelos IA         ← selector de modelo LLM
  🎭 Personalidades     ← gestión de personalidades del bot
  🔧 Prompts            ← editor de prompts del sistema
  👤 Perfiles           ← perfiles de trabajadores
  📊 Feedback           ← feedback recibido
─────────────────────
⚙️ Configuración
```

---

## Páginas y Funcionalidades Detalladas

### 1. 💬 Chat IA (Página Principal)

**Layout**: 3 columnas
- **Izquierda (240px)**: Lista de sesiones de chat
- **Centro**: Área de chat
- **Derecha (280px, colapsable)**: Panel de configuración

**Sidebar de Sesiones (izquierda)**:
- Botón "+ Nueva conversación" prominente (amber)
- Lista de sesiones ordenadas por fecha, cada una muestra:
  - Título (primeras palabras del primer mensaje)
  - Personalidad activa (icono)
  - Fecha/hora
  - Cantidad de mensajes
- Al hacer hover: botón para eliminar sesión
- Sección "Papelera" colapsable al fondo (sesiones eliminadas, con opción de restaurar o eliminar permanente)

**Área de Chat (centro)**:
- Header: muestra personalidad activa + modelo LLM actual
- Mensajes estilo WhatsApp:
  - Mensajes del usuario: burbuja alineada derecha, color azul oscuro
  - Mensajes del asistente: burbuja alineada izquierda, color gris oscuro
  - Soporte para **markdown** en mensajes (negritas, listas, enlaces)
  - Timestamp debajo de cada mensaje
- Input inferior:
  - Campo de texto expandible (textarea)
  - Botón enviar (amber)
  - Indicador "IA escribiendo..." cuando hay respuesta en progreso

**Panel de Configuración (derecha)**:
- **Teléfono simulado**: input editable (default: `web-56900000001`)
- **Nombre**: input editable (default: `Usuario`)
- **Personalidad**: selector dropdown con todas las personalidades disponibles (cada una muestra icono + nombre + modo)
- **Modo**: badge que muestra strict/permissive/debug según personalidad

**API endpoints usados**:
```
GET    /api/sessions/:phone           → listar sesiones
GET    /api/sessions/:phone/:id/messages → mensajes de una sesión
POST   /api/sessions/:phone/new       → nueva sesión { personalityId }
DELETE /api/sessions/:phone/:id       → mover a papelera
DELETE /api/sessions/:phone/:id/permanent → eliminar definitivo
POST   /api/sessions/:phone/:id/restore  → restaurar
GET    /api/sessions/:phone/trash     → sesiones eliminadas
POST   /api/chat                      → enviar mensaje { phone, name, message, personalityId }
POST   /api/chat/reset                → resetear sesión { phone }
GET    /api/personalities             → lista personalidades
WS     /ws                           → recibir respuestas en tiempo real
```

**WebSocket**: Conectar a `ws://localhost:3000/ws`. Los mensajes llegan como:
```json
{ "type": "message", "phone": "web-56900000001", "text": "respuesta del bot..." }
```
Filtrar por el teléfono actual y agregar como mensaje del asistente.

---

### 2. 📄 Procedimientos Generados

**Layout**: Lista/tabla con cards

Cada procedimiento muestra:
- Título
- Estado (badge: draft/review/approved/published/expired)
- Fecha de creación
- Versión
- Nombre del solicitante (si disponible)
- Botones: "Ver JSON" (modal con JSON formateado) y "Descargar DOCX"

**API endpoints**:
```
GET /api/procedures          → lista con datos del creador
GET /procedures/:id/json     → JSON completo
GET /procedures/:id/docx     → descarga DOCX
```

---

### 3. 📋 Solicitudes (Vista Kanban)

**Layout**: Tablero Kanban horizontal con columnas por estado:

Columnas:
- `awaiting_audio` — "Esperando descripción"
- `transcribing` — "Transcribiendo"
- `profiling` — "Perfilando"
- `reviewing` — "Revisando pasos"
- `confirming` — "Confirmando"
- `generating` — "Generando"
- `completed` — "Completado"
- `error` — "Error"

Cada tarjeta muestra:
- Teléfono/nombre del solicitante
- Área
- Fecha de actualización
- Si tiene procedimiento generado: enlace al DOCX

**API endpoint**:
```
GET /api/requests → lista de procedure_requests con JOIN a procedures
```

---

### 4. 📚 Documentos RAG

**Layout**: Tabla + botón de carga

- **Tabla** con columnas: Nombre, Tipo (badge), Versión, Indexado (check/x), Fecha
- **Tipos posibles**: `prototype`, `risk_critical`, `risk_general`, `regulation`, `approved_procedure`
- **Botón "Subir Documento"**: abre modal con:
  - Drag & drop o file picker (acepta .pdf, .docx, .txt)
  - Selector de tipo de documento
  - Campo nombre (auto-llena con nombre del archivo)
  - Campo versión (default "1.0")
- **Botón "Ver contenido"**: abre modal con el texto extraído
- **Botón "Eliminar"**: con confirmación

**API endpoints**:
```
GET    /api/docs              → lista documentos
GET    /api/docs/:id/content  → contenido completo
DELETE /api/docs/:id          → eliminar documento
POST   /ingest/file           → subir archivo (multipart: file + type + name + version)
POST   /ingest                → ingestar texto directo { type, name, content, version }
```

---

### 5. 📐 Templates DOCX

**Layout**: Grid de cards

Cada template muestra:
- Nombre del archivo
- Tamaño (formateado: KB/MB)
- Fecha de modificación
- Badge "ACTIVO" si es el template actual
- Botones: "Activar" / "Eliminar"

Acciones:
- **Subir template**: botón que abre file picker (.docx)
- **Activar**: marca un template como activo
- **Eliminar**: solo si no es el activo

**API endpoints**:
```
GET    /api/templates          → lista de templates
GET    /api/templates/active   → template activo actual
PUT    /api/templates/active   → activar template { name }
POST   /api/templates/upload   → subir .docx (multipart: file)
DELETE /api/templates/:name    → eliminar template
```

---

### 6. 🤖 Modelos IA

**Layout**: Grid de cards agrupadas por proveedor

Cada modelo muestra:
- Nombre
- Proveedor (badge con color por proveedor)
- Descripción
- Estado: "Disponible" (verde) o "Sin API Key" (gris)
- Badge "ACTIVO" si es el modelo seleccionado
- Botón "Activar" (solo para modelos disponibles)

Proveedores con colores:
- MiniMax → morado
- OpenRouter → verde
- OpenAI → verde esmeralda
- Ollama → naranja

**API endpoints**:
```
GET  /api/models         → catálogo con disponibilidad { active, models[] }
GET  /api/models/active  → modelo activo
POST /api/models/active  → cambiar modelo { id }
```

---

### 7. 🎭 Personalidades

**Layout**: Grid de cards + botón crear

Cada personalidad muestra:
- Icono (emoji grande)
- Nombre
- Descripción
- Modo (badge: strict=azul, permissive=amber, debug=rojo)
- Si es built-in: badge "Sistema"
- Botones: "Editar" / "Eliminar" (solo custom)

**Crear/Editar**: Modal con campos:
- Nombre
- Descripción
- Icono (emoji picker simple o input)
- Modo: selector strict/permissive/debug

**API endpoints**:
```
GET    /api/personalities       → lista
POST   /api/personalities       → crear { name, description, icon, mode }
PUT    /api/personalities/:id   → actualizar { name, description, icon }
DELETE /api/personalities/:id   → eliminar
```

---

### 8. 🔧 Editor de Prompts

**Layout**: Lista colapsable agrupada por categoría

Categorías:
- "Extractor de Pasos"
- "Generador de Contenido"
- "Evaluador de Pasos"
- "Riesgos de Fatalidad"
- "Conversación WhatsApp"

Cada prompt muestra:
- Label (título)
- Descripción
- Badge "Modificado" si fue editado (isModified = true)
- Área de texto con el contenido actual (editable, monospace, height auto)
- Placeholders disponibles mostrados como chips `{{variable}}`
- Botones: "Guardar" (solo si cambió) / "Restaurar default" (solo si modificado)

**API endpoints**:
```
GET  /api/prompts          → todos los prompts
GET  /api/prompts/:id      → un prompt
PUT  /api/prompts/:id      → actualizar { content }
POST /api/prompts/:id/reset → restaurar default
```

---

### 9. 👤 Perfiles de Trabajadores

**Layout**: Tabla interactiva

Columnas:
- Teléfono
- Nombre completo
- Área
- Cargo
- Estilo de comunicación (badge)
- Procedimientos generados
- Última vez visto (fecha relativa)

Al hacer click en un perfil → panel lateral con:
- Datos completos del perfil
- Preferencias (JSON parseado como lista)
- Feedback histórico (timeline)

**API endpoints**:
```
GET /api/profiles                  → lista de perfiles
GET /api/profiles/:phone/feedback  → feedback de un trabajador
```

---

### 10. 📊 Feedback

**Layout**: Tabla con filtros

Columnas:
- Teléfono
- Tipo (badge por color: positive=verde, negative=rojo, correction=amber, preference=azul, rating=morado)
- Contenido
- Rating (estrellas si aplica)
- Procedimiento asociado (link si hay)
- Fecha

Filtros: por tipo, por teléfono

**API endpoint**:
```
GET /api/feedback → todo el feedback
```

---

## Comportamientos Globales

### Conexión API
- Base URL configurable (default: `http://localhost:3000`)
- Manejar errores de red con toast notifications
- Loading states en todas las llamadas

### WebSocket
- Conexión automática al cargar la app
- Reconexión automática con backoff exponencial
- Indicador de conexión en el header (punto verde/rojo)

### Responsividad
- Desktop-first pero usable en tablet
- Sidebar colapsable en pantallas < 1024px

### Toast / Notificaciones
- Éxito: borde izquierdo verde
- Error: borde izquierdo rojo
- Info: borde izquierdo azul

### Idioma
- Toda la UI en **español** (Chile)

---

## Estructura de Archivos Sugerida

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Layout.tsx
│   ├── chat/
│   │   ├── ChatArea.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── SessionList.tsx
│   │   ├── ChatInput.tsx
│   │   └── ConfigPanel.tsx
│   ├── procedures/
│   │   ├── ProcedureList.tsx
│   │   └── ProcedureDetail.tsx
│   ├── kanban/
│   │   ├── KanbanBoard.tsx
│   │   └── RequestCard.tsx
│   ├── documents/
│   │   ├── DocumentTable.tsx
│   │   └── UploadModal.tsx
│   ├── templates/
│   │   ├── TemplateGrid.tsx
│   │   └── TemplateCard.tsx
│   ├── models/
│   │   └── ModelGrid.tsx
│   ├── personalities/
│   │   ├── PersonalityGrid.tsx
│   │   └── PersonalityForm.tsx
│   ├── prompts/
│   │   └── PromptEditor.tsx
│   ├── profiles/
│   │   ├── ProfileTable.tsx
│   │   └── ProfileDetail.tsx
│   └── feedback/
│       └── FeedbackTable.tsx
├── hooks/
│   ├── useWebSocket.ts
│   ├── useApi.ts
│   └── useChatSessions.ts
├── services/
│   └── api.ts            ← wrapper fetch con base URL
├── types/
│   └── index.ts          ← tipos TypeScript (copiar del backend)
├── stores/
│   └── appStore.ts       ← estado global (Zustand)
├── pages/
│   ├── ChatPage.tsx
│   ├── ProceduresPage.tsx
│   ├── RequestsPage.tsx
│   ├── DocumentsPage.tsx
│   ├── TemplatesPage.tsx
│   ├── ModelsPage.tsx
│   ├── PersonalitiesPage.tsx
│   ├── PromptsPage.tsx
│   ├── ProfilesPage.tsx
│   └── FeedbackPage.tsx
└── App.tsx
```

---

## Tipos TypeScript Principales (copiar del backend)

```typescript
// Sesiones de chat
interface ChatSession {
  id: string;
  phone: string;
  personality_id: string;
  title: string | null;
  status: 'active' | 'archived';
  message_count: number;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  id: string;
  session_id: string;
  phone: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// Procedimientos
type ProcedureStatus = 'draft' | 'review' | 'approved' | 'published' | 'expired';
type RequestState = 'awaiting_audio' | 'transcribing' | 'profiling' | 'reviewing' | 'confirming' | 'generating' | 'completed' | 'error';

interface GeneratedProcedure {
  id: string;
  request_id: string;
  title: string;
  content: string;
  version: string;
  status: ProcedureStatus;
  created_at: string;
  docx_url: string | null;
}

// Modelos LLM
interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  description: string;
  available: boolean;
}

// Personalidades
interface Personality {
  id: string;
  name: string;
  description: string;
  icon: string;
  mode: 'strict' | 'permissive' | 'debug';
  builtIn: boolean;
}

// Prompts
interface PromptEntry {
  id: string;
  label: string;
  description: string;
  category: string;
  placeholders: string[];
  default: string;
  current: string;
  isModified: boolean;
}

// Perfil trabajador
type CommunicationStyle = 'formal' | 'informal' | 'technical';

interface WorkerProfile {
  phone: string;
  first_name: string | null;
  last_name: string | null;
  area: string | null;
  role: string | null;
  communication_style: CommunicationStyle | null;
  preferences: string | null;
  procedures_generated: number;
  last_seen: string;
}

// Feedback
type FeedbackType = 'positive' | 'negative' | 'correction' | 'preference' | 'rating';

interface FeedbackEntry {
  id: string;
  phone: string;
  procedure_id: string | null;
  type: FeedbackType;
  content: string;
  rating: number | null;
  created_at: string;
}

// Documentos RAG
interface BaseDocument {
  id: string;
  type: 'prototype' | 'risk_critical' | 'risk_general' | 'regulation' | 'approved_procedure';
  name: string;
  version: string;
  vectorize_indexed: boolean;
  created_at: string;
}

// Solicitudes (Kanban)
interface ProcedureRequest {
  id: string;
  phone: string;
  specialist_name: string | null;
  area: string | null;
  state: RequestState;
  transcription: string | null;
  created_at: string;
  updated_at: string;
  procedure_id?: string;
  procedure_title?: string;
  procedure_docx_url?: string;
  procedure_status?: string;
}
```

---

## Notas Importantes

1. **El backend ya existe** — no generes código backend, solo frontend
2. **CORS**: el backend corre en localhost:3000, configura proxy o CORS según sea necesario
3. **WebSocket es clave**: las respuestas del chat llegan vía WS, no como respuesta HTTP
4. **Idioma**: toda la interfaz debe estar en **español chileno**
5. **No uses autenticación** por ahora — es un sistema interno
6. **El chat simula WhatsApp**: usa un número de teléfono como identificador de usuario
