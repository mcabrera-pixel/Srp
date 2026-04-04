# Índice de Documentos para RAG - Loro IA
## Data Procedimientos CODELCO División Salvador

**Fecha de indexación**: 2026-02-14
**Total de documentos**: 73 archivos en 11 carpetas
**Área principal**: Planta de Oxígeno (POX) - Gerencia Fundición

---

## Resumen Ejecutivo

| Categoría | Carpeta | Archivos | Propósito |
|-----------|---------|----------|-----------|
| Riesgos y Controles | SIGO y otros | 28 | Estándares corporativos de Riesgos de Fatalidad |
| Riesgos y Controles | Miper POX | 18 | Matrices de riesgo por subsistema |
| Riesgos y Controles | Bow-Tie RC | 2 | Riesgos Críticos con CCP/CCM |
| Contexto Operativo | Mapa de Proceso POX | 18 | Flujos de proceso por área |
| Procedimientos Base | Peligros inherentes POX | 4 | Peligros, emergencias, equipos |
| Procedimientos Base | Aislación y Bloqueo | 2 | LOTO (Lock Out Tag Out) |
| Plantillas | Prototipo Procedimientos | 1 | Template maestro de procedimientos |
| Plantillas | Tipo de Formato 2 | 1 | Template alternativo (instructivo) |
| Ejemplos | Procedimientos Generados | 2 | Outputs validados del agente |
| Difusión | Posible Hacer Video | 2 | Candidatos para videos masivos |

---

## 1. SIGO y Estándares de Controles Críticos (ECC)

**Ruta**: `Data Procedimientos/SIGO y otros/`
**Tipo**: PDFs y Excel
**Fuente**: Gerencia Corporativa de Seguridad y Salud Ocupacional CODELCO

### Qué es SIGO
Sistema Integrado de Gestión Operacional de CODELCO. Marco corporativo de seguridad que establece estándares, procedimientos y controles críticos para todas las divisiones.

### Documentos ECC-003 (Estándares de Controles Críticos)

Cada documento cubre un **Riesgo de Fatalidad (RF)** con estructura Bow-Tie:

| Código | Archivo | Riesgo de Fatalidad |
|--------|---------|---------------------|
| RF01 | SIGO-ECC-003-01_REV02.pdf | Energía Eléctrica |
| RF02 | SIGO-ECC-003-02_REV02.pdf | Trabajo en Altura |
| RF03 | SIGO-ECC-003-03_REV02.pdf | Maniobras de Izaje |
| RF04 | SIGO-ECC-003-05_REV02.pdf | Liberación Descontrolada de Energías |
| RF05 | SIGO-ECC-003-06_REV02.pdf | Caída de Rocas en Mina Rajo |
| RF06 | SIGO-ECC-003-07_REV02.pdf | Incendio |
| RF07 | SIGO-ECC-003-09_REV01.pdf | Sustancias Peligrosas |
| RF09 | SIGO-ECC-003-10_REV01.pdf | Partes Móviles |
| RF10 | SIGO-ECC-003-11_REV01.pdf | Vehículos |
| RF11 | SIGO-ECC-003-12_REV01.pdf | Espacios Confinados |
| RF12 | SIGO-ECC-003-13_REV01.pdf | Metales Fundidos |
| RF13 | SIGO-ECC-003-14_REV00.pdf | Caída de Objetos |
| RF16 | SIGO-ECC-003-16_REV01.pdf | Vaciados, Chimeneas y Piques |
| RF18 | SIGO-ECC-003-18_REV01.pdf | Planchoneo |
| RF20 | SIGO-ECC-003-20_REV01.pdf | Sílice |
| RF21 | SIGO-ECC-003-21_REV00.pdf | Arsénico |
| RF23 | SIGO-ECC-003-23_REV01.pdf | Colapso Estructural del Macizo Rocoso |
| RF24 | SIGO-ECC-003-24_REV01.pdf | Taludes |
| RF25 | SIGO-ECC-003-25_REV01.pdf | Equipos Mineros e Industriales |
| RF26 | SIGO-ECC-003-26_REV01.pdf | Equipos Autónomos |
| RF27 | SIGO-ECC-003-27_REV01.pdf | Atropello |
| RF28 | SIGO-ECC-003-28_REV01.pdf | Caving |
| RF29 | SIGO-ECC-003-29_REV00.pdf | Caída a Cuerpos Líquidos |
| RF30 | SIGO-ECC-003-30_REV00.pdf | Tiro y Arrastre |

### Estructura de cada ECC
```
1. Alcance y Exclusiones
2. Diagrama Bow-Tie (Causas → CCP → Peligro → CCM → Consecuencias)
3. Controles Críticos Preventivos (CCP) con:
   - Objetivo
   - Preguntas (Trabajador, Supervisor, Ejecutivo)
   - Desviaciones típicas
   - Estándar de desempeño
4. Controles Críticos Mitigadores (CCM)
5. Otros Controles (CP/CM)
```

### Otros documentos SIGO
| Archivo | Propósito |
|---------|-----------|
| GS&SO N°277-2025 Riesgos de Fatalidad 01 al 14.pdf | Comunicado oficial RF 1-14 |
| GS&SO N°001-2025 Riesgos de Fatalidad 15 al 30.pdf | Comunicado oficial RF 15-30 |
| RF Listado de autodiagnóstico FINAL.xlsx | Checklist de cumplimiento |
| PRO.0908.MPER1 (1).pdf | Procedimiento complementario |

### Uso en RAG
- **Consulta**: "¿Qué controles aplican para trabajos con partes móviles?"
- **Respuesta**: Referenciar SIGO-ECC-003-10 (RF09)
- **Aplicación**: Incorporar CCP y CCM en procedimientos RAFT

---

## 2. MIPER POX - Matrices de Identificación de Peligros

**Ruta**: `Data Procedimientos/Miper POX/`
**Tipo**: 18 PDFs (matrices tabulares)
**Formato**: SIGO-F-011 (Abril 2025)

### Qué es un MIPER
**Matriz de Identificación de Peligros y Evaluación de Riesgos**. Herramienta que mapea peligros, evalúa riesgos (P×C) y define controles para cada proceso.

### Archivos por Subsistema

| # | Archivo | Sistema POX |
|---|---------|-------------|
| 1 | MIPER Almacenamiento de estanques de oxigeno liquido POX.pdf | Tanques LOX |
| 2 | MIPER Almacenamiento de oxigeno de alta presion POX.pdf | GOX alta presión |
| 3 | Miper compresion de aire POX.pdf | Compresores 8.5 MW |
| 4 | Miper deteccion contra incendios.pdf | Sistema detección |
| 5 | Miper estructuras y obras civiles.pdf | Infraestructura |
| 6 | Miper Expansion de aire POX.pdf | Turbinas expansión |
| 7 | Miper instalaciones.pdf | Edificios, salas |
| 8 | Miper nitrogeno de instrumentacion.pdf | N2 instrumentación |
| 9 | Miper planta de enfriamiento de agua POX.pdf | Torres enfriamiento |
| 10 | Miper Plataformas y pasillos.pdf | Tránsito peatonal |
| 11 | MIPER Preenfriamiento de agua POX.pdf | Pre-enfriamiento |
| 12 | Miper Purificacion de aire POX.pdf | Zeolitas, filtros |
| 13 | Miper recirculacion de LOX.pdf | Bombas LOX |
| 14 | Miper red contra incendios.pdf | Red hidrantes |
| 15 | Miper separacion de aire Cold Box POX.pdf | Destilación criogénica |
| 16 | MIPER Sistema de Aire de Control.pdf | Aire instrumentos |
| 17 | MIPER Sub estacion electrica POX.pdf | Subestación |
| 18 | Miper unidad electrica POX.pdf | Distribución eléctrica |

### Estructura de cada MIPER
```
Proceso → Actividad → Tarea → Peligro → Evento TOP → Evento de Riesgo

Evaluación:
- P: Probabilidad (1-4)
- C: Consecuencia (4-8)
- MR: Magnitud = P × C
- Clasificación: Bajo (1-8), Medio (9-16), Alto (17-32)

Controles:
- CCP: Controles Críticos Preventivos
- CCM: Controles Críticos Mitigadores
- Responsable implementación
- Responsable verificación
```

### Uso en RAG
- **Consulta**: "¿Qué riesgos hay en el Cold Box?"
- **Respuesta**: Referenciar MIPER separación de aire
- **Aplicación**: Extraer peligros específicos para procedimientos del área

---

## 3. Mapas de Proceso POX

**Ruta**: `Data Procedimientos/Mapa de Proceso POX/`
**Tipo**: 18 PDFs (diagramas de flujo)
**Formato**: SIGO-F-011

### Qué son
Documentos que describen la arquitectura operativa de la Planta de Oxígeno, listando actividades, tareas, puestos de trabajo y responsables.

### Los 18 Procesos de POX

| ID | Proceso | Descripción |
|----|---------|-------------|
| A | Sistema de Aire de Control | Aire para instrumentación |
| B | Subestación Eléctrica | Alimentación 23 kV |
| C | Compresión de Aire | Motor 8.5 MW, compresor principal |
| D | Preenfriamiento de Aire | Torres de enfriamiento |
| E | Almacenamiento O2 Alta Presión | Tanques GOX |
| F | Almacenamiento O2 Líquido | Tanques LOX criogénicos |
| G | Planta Enfriamiento Agua | Circuito de refrigeración |
| H | Cold Box | Separación criogénica del aire |
| I | Purificación de Aire | Filtros de zeolita |
| J | Recirculación LOX | Bombas criogénicas |
| K | Unidad Eléctrica General | Distribución interna |
| L | Estructuras y Obras Civiles | Infraestructura física |
| M | Detección de Incendios | Sensores y alarmas |
| N | Red Contra Incendios | Hidrantes y extintores |
| O | Plataformas y Pasillos | Tránsito seguro |
| P | Expansión de Aire | Turbinas de expansión |
| Q | Nitrógeno de Instrumentación | N2 para válvulas |
| R | Instalaciones | Sala control, baños, comedor |

### Estructura de cada Mapa
```
A. Antecedentes Generales (Centro, Gerencia, Área)
B. Reseña del Proceso
C. Identificación de los 18 Procesos
D. Proceso en Estudio (cuál documenta este mapa)
E. Actividades y Tareas:
   - Actividad
   - Tareas (R=Rutinaria, NR=No Rutinaria)
   - Puestos de Trabajo (OME, OMC)
   - Número de trabajadores
```

### Puestos de Trabajo
- **OME**: Operador Mecánico Eléctrico
- **OMC**: Operador Mecánico de Campo

### Uso en RAG
- **Consulta**: "¿Quién opera las válvulas de drenaje criogénico?"
- **Respuesta**: OME + OMC (2 trabajadores)
- **Aplicación**: Definir responsables en procedimientos

---

## 4. Peligros Inherentes POX

**Ruta**: `Data Procedimientos/Peligros inherentes POX/`
**Tipo**: 3 PDFs + 1 DOCX
**Normativa**: DS N° 44/2025

### Documentos

| Código | Archivo | Páginas | Contenido |
|--------|---------|---------|-----------|
| P-GFR-POX-001 | PELIGROS INHERENTES POX.pdf | 41 | Documento maestro de riesgos |
| P-GFR-POX-002 | Respuesta Emergencia POX.pdf | 39 | Protocolos de emergencia |
| P-GFR-POX-003 | Manual De Uso Analizador Portatil.docx | ~20 | Uso del detector ALTAIR PRO |
| P-GFR-POX-005 | Atmosfera enrequecida.pdf | 27 | Riesgos de O2 > 23% |

### Riesgos Críticos de POX

| RC | Peligro | Descripción |
|----|---------|-------------|
| RC1 | Energía eléctrica | Motor 8.5 MW, alta tensión |
| RC2 | Altura física | Estructuras elevadas, columnas |
| RC3 | Izaje | Manipulación equipos pesados |
| RC4 | Alta presión | Sistemas hasta 2100 kPa |
| RC6 | Fuego | Atmósfera enriquecida facilita combustión |
| RC7 | Sustancias peligrosas | LOX, LN2, hidrocarburos |
| RC9 | Partes móviles | Turbinas 24,000 rpm |
| RC13 | Objetos en altura | Trabajos en estructuras |
| RC22 | Tránsito | Plataformas, escaleras |
| RC27 | Vehículos | Tránsito restringido |

### Peligros Específicos del Proceso

| Peligro | Especificación |
|---------|----------------|
| Temperaturas criogénicas | -180°C, quemaduras por frío |
| Atmósfera enriquecida | O2 > 23%, combustión explosiva |
| Atmósfera deficiente | O2 < 18%, asfixia |
| Alta presión | Hasta 2100 kPa (21 bar) |
| Hidrocarburos en LOX | Reacciones exotérmicas |

### EPP Obligatorio en POX

| Elemento | Especificación |
|----------|----------------|
| Casco | Fibra, libre de grasa |
| Lentes | Claros/oscuros según área |
| Respirador | Medio rostro, filtros mixtos |
| Guantes | Cuero, libres de grasa |
| Ropa | **IGNÍFUGA** (obligatorio) |
| Detector | Analizador O2 portátil |

### Detector ALTAIR PRO
- **Alarma mínima**: 18% O2 (deficiencia)
- **Alarma máxima**: 23% O2 (enriquecimiento)
- **USO OBLIGATORIO** en todo el recinto POX

### Emergencias
- **Teléfono**: 3911 (Potrerillos)
- **Radio**: Canal Fundición
- **Acciones**: Detener proceso → Aislar energías → Evacuar

### Uso en RAG
- **Consulta**: "¿Qué EPP necesito para entrar a POX?"
- **Respuesta**: Lista completa con ropa ignífuga y detector O2
- **Aplicación**: Sección EPP de todos los procedimientos POX

---

## 5. Bow-Tie RC y Peligros Generales

**Ruta**: `Data Procedimientos/Bow-Tie RC y Peligros Generales Asociados/`
**Tipo**: 2 DOCX

### Documentos

| Archivo | Contenido |
|---------|-----------|
| Riesgos Criticos POX.docx | Matriz de 10 RC con CCP/CCM |
| Peligros Generales y Medidas de control Area Suministros.docx | Tabla peligros por tarea |

### Estructura Bow-Tie
```
CAUSAS → CCP (Preventivos) → PELIGRO → CCM (Mitigadores) → CONSECUENCIAS
```

### Riesgos Críticos con Controles

| RC | Peligro | Controles Preventivos | Controles Mitigadores |
|----|---------|----------------------|----------------------|
| RC1 | Energía eléctrica | CCP4, CCP6 | CCM3, CCM4 |
| RC2 | Trabajo en altura | CCP1, CCP5 | CCM1, CCM3 |
| RC3 | Maniobras de izaje | CCP2, CCP7 | CCM2 |
| RC4 | Alta presión | CCP3 | CCM4 |
| RC6 | Variables del fuego | CCP8 | CCM5, CCM6 |
| RC7 | Sustancias peligrosas | CCP4, CCP9 | CCM7 |
| RC9 | Partes móviles | CCP1, CCP10 | CCM8 |

### Uso en RAG
- **Consulta**: "¿Qué controles preventivos para izaje?"
- **Respuesta**: CCP2 (Plan de izaje), CCP7 (Certificación equipos)

---

## 6. Procedimiento Aislación y Bloqueo (LOTO)

**Ruta**: `Data Procedimientos/Procedimiento Aislación y Bloqueo V1.1 - Gerencia Fundición/`
**Tipo**: 1 DOCX + 1 XLSX
**Aplicación**: Gerencia Fundición CODELCO Chuquicamata

### Documentos

| Archivo | Contenido |
|---------|-----------|
| PRO-101-TRA-SEM. Aislación y Bloqueo...Rev1.1.docx | Procedimiento completo LOTO |
| PROTOCOLO SOLICITUD Y REGISTRO...Rev3.xlsx | Formularios de registro |

### Sistema de 3 Niveles de Bloqueo

| Nivel | Tipo | Responsable | Ubicación |
|-------|------|-------------|-----------|
| 1 | **Primario** | Especialista de Bloqueo | En la fuente de energía |
| 2 | **Secundario** | Responsable del Activo + Encargado | Sobre caja del primario |
| 3 | **Terciario** | Cada trabajador individual | Personal, sobre caja secundario |

### Las 11 Etapas del LOTO

1. Preparación y Solicitud del Equipo
2. Aislación (corte de energía)
3. Verificación de Energía Cero
4. Bloqueo Primario
5. Bloqueo Secundario
6. Bloqueo Terciario (todos los trabajadores)
7. Segregación del área
8. Entrega de Equipos (desbloqueo terciario)
9. Retiro de Bloqueo Secundario
10. Energización
11. Puesta en Servicio

### Especialistas por Tipo de Energía

| Energía | Especialidad |
|---------|--------------|
| Eléctrica | Electricista |
| Hidráulica de accionamientos | Mecánico |
| Hidráulica contenida (agua, vapor) | Operaciones |
| Neumática/gases | Operaciones |
| Cinética/Potencial/Térmica | Mecánico |

### Uso en RAG
- **Consulta**: "¿Cómo bloquear un compresor para mantenimiento?"
- **Respuesta**: Procedimiento LOTO completo con 3 niveles
- **Aplicación**: Sección LOTO en todos los procedimientos de intervención

---

## 7. Plantillas de Procedimientos

### 7.1 Prototipo Estándar

**Ruta**: `Data Procedimientos/Prototipo Procedimientos/`
**Archivo**: `P-GFR-XX-MMS-XX Prototipo de procedimiento estandar suministros mecanicos.docx`

### Estructura del Template Maestro

```
1. OBJETIVO
2. ALCANCE
3. RESPONSABILIDADES (Matriz RACI)
   - Trabajador
   - Encargado de Actividad
   - Coordinador de Seguridad
   - Ingeniero Jefe
   - Superintendente
4. DEFINICIONES (Glosario)
5. EPP, EQUIPOS Y MATERIALES
6. DESCRIPCIÓN DE TAREAS
   - Qué haré
   - Cómo lo haré
   - Cómo se controlará
7. COMPETENCIAS REQUERIDAS
```

### 7.2 Formato Alternativo (Instructivo)

**Ruta**: `Data Procedimientos/Tipo de Formato 2/`
**Archivo**: `INS.09008MPEF3 Filtro de Aire F-10 (002).doc`

### Estructura del Instructivo

```
1. PROPÓSITO
2. RESPONSABILIDADES
3. EQUIPOS/HERRAMIENTAS
4. DESCRIPCIÓN DE ACTIVIDAD (tabla)
   - Paso
   - Peligro
   - Riesgo
   - Consecuencia
   - Medida de Control
5. NOTAS OPERACIONALES
```

**Diferencia**: Más compacto, enfocado en tarea puntual, menos gobernanza documental.

---

## 8. Procedimientos Generados por IA (Ejemplos)

**Ruta**: `Data Procedimientos/Procedimientos Generados por el Agente/`
**Tipo**: 2 PDFs (~37 páginas cada uno)

### Archivos

| Archivo | Contenido |
|---------|-----------|
| Procedimiento_Fabricacion_Escotilla_Grating_.pdf | Fabricación de escotillas |
| Procedimiento_Fabricacion_Instalacion_Escotilla_Grating.pdf | Fabricación e instalación |

### Validaciones Aplicadas
- Uso correcto del template maestro
- Integración de Riesgos Críticos (RC-09, RC-13)
- Sección EPP para soldadura completa
- Descripción de tareas con verificaciones
- Competencias requeridas definidas
- 14 secciones completas

### Uso en RAG
- **Referencia de calidad** para validar outputs del agente
- **Benchmark** para nuevos procedimientos generados

---

## 9. Candidatos para Videos de Difusión

**Ruta**: `Data Procedimientos/Posible Hacer Video de difusión de este documento/`
**Tipo**: 1 PDF + 1 DOCX

### Documentos

| Archivo | Páginas | Contenido |
|---------|---------|-----------|
| PLE-POX-001 Plan Local Emergencia POX.pdf | 113 | Plan completo de emergencias |
| R-026 Medidas de Seguridad Plantas de Oxígeno (REV 2).docx | ~30 | Reglamento interno |

### Contenido para Videos

**Plan de Emergencias (ideal para NotebookLM):**
- Niveles de emergencia (1, 2, 3)
- Protocolos de evacuación
- Tipos de emergencia (industriales, naturales)
- Roles en emergencia
- Puntos de reunión

**Reglamento de Seguridad:**
- Clasificación de fuegos (A, B, C, D)
- Agentes extintores por tipo de fuego
- Valores corporativos CODELCO
- Políticas de seguridad

### Uso en RAG
- **Generación de scripts** para videos de difusión masiva
- **Contenido de inducción** para nuevos trabajadores

---

## Estructura Recomendada para RAG

```
📁 Data Procedimientos/
│
├── 📋 PLANTILLAS/
│   ├── Prototipo Procedimientos/      → Template maestro
│   └── Tipo de Formato 2/             → Template instructivo
│
├── 🎯 RIESGOS Y CONTROLES/
│   ├── SIGO y otros/                  → ECC corporativos (FUENTE AUTORITATIVA)
│   ├── Miper POX/                     → Matrices de riesgo por área
│   └── Bow-Tie RC y Peligros/         → RC con CCP/CCM
│
├── ⚠️ PROCEDIMIENTOS BASE/
│   ├── Peligros inherentes POX/       → Peligros, emergencias, EPP
│   └── Procedimiento Aislación/       → LOTO (3 niveles)
│
├── 🗺️ CONTEXTO OPERATIVO/
│   └── Mapa de Proceso POX/           → 18 procesos, roles, tareas
│
├── 🎬 CANDIDATOS VIDEO/
│   └── Posible Hacer Video/           → Emergencias, reglamentos
│
└── ✅ EJEMPLOS VALIDADOS/
    └── Procedimientos Generados/      → Outputs del agente (benchmark)
```

---

## Consultas Típicas para RAG

| Tipo de Consulta | Fuente a Usar |
|------------------|---------------|
| "¿Qué EPP necesito para X?" | Peligros inherentes POX |
| "¿Qué controles aplican para Y?" | SIGO ECC-003-XX |
| "¿Cómo bloquear equipo Z?" | Procedimiento LOTO |
| "¿Qué riesgos hay en área W?" | MIPER correspondiente |
| "¿Quién es responsable de V?" | Mapa de Proceso |
| "Genera procedimiento para U" | Template + MIPER + ECC |

---

## Metadatos para Ingesta

```typescript
interface DocumentoRAG {
  id: string;                    // "SIGO-ECC-003-01"
  tipo: TipoDocumento;           // "ECC" | "MIPER" | "MAPA" | "PROCEDIMIENTO"
  area: string;                  // "POX" | "Fundición"
  subsistema?: string;           // "Cold Box" | "Compresión"
  riesgosCriticos: string[];     // ["RC01", "RC04"]
  fechaRevision: string;         // "2025-04"
  version: string;               // "REV02"
  rutaArchivo: string;
  contenido: {
    controles?: Control[];
    peligros?: Peligro[];
    tareas?: Tarea[];
    epp?: string[];
  }
}
```

---

**Generado por**: Loro IA - MCCO Suite
**Versión del índice**: 1.0
