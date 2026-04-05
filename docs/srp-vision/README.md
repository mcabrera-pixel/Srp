# SRP Vision — Sistema de Asistencia IA para Mantenimiento Minero

> Proyecto paralelo a SRP Suite. Mientras SRP Suite genera y gestiona procedimientos,
> SRP Vision los ejecuta en tiempo real con asistencia visual de IA.

## Concepto Central

Colocar una camara compacta (tipo Insta360 / DJI) en el casco del tecnico que transmite
video en tiempo real a un punto de control donde:

1. **IA analiza la imagen** — un modelo de vision multimodal (Gemini, Claude Vision, GPT-4o)
   interpreta lo que el tecnico esta viendo
2. **Equipo humano supervisa** — un tecnico senior + equipo de confiabilidad monitorean
   multiples pantallas en paralelo
3. **Cruce con datos historicos** — la IA compara en tiempo real contra el historial de
   mantenciones, fallas previas, y SOPs de la empresa
4. **Retorno de audio** — la instruccion o recomendacion llega al tecnico por audio
   (conduccion osea), manos libres
5. **Dialogo bidireccional** — el tecnico puede preguntar, la IA o el equipo responde
6. **Aprendizaje continuo** — cada sesion de video alimenta el modelo, mejorando las
   decisiones con el tiempo

```
┌─────────────┐     video stream     ┌──────────────────────────────┐
│  Tecnico    │ ──────────────────── │  Punto de Control            │
│  en terreno │                      │                              │
│  ┌───────┐  │                      │  ┌─────────┐  ┌───────────┐ │
│  │Camara │  │                      │  │ IA Vision│  │ Historico │ │
│  │(casco)│  │                      │  │ (Gemini) │──│ de fallas │ │
│  └───────┘  │                      │  └────┬────┘  └───────────┘ │
│  ┌───────┐  │     audio retorno    │       │                     │
│  │Audio  │ ◄────────────────────── │  ┌────▼────┐  ┌───────────┐ │
│  │(oseo) │  │                      │  │Instruc- │  │ Senior +  │ │
│  └───────┘  │                      │  │cion     │  │Confiabil. │ │
│             │    pregunta (voz)    │  └─────────┘  └───────────┘ │
│  ┌───────┐  │ ──────────────────── │                             │
│  │Mic    │  │                      │  ┌─────────────────────┐    │
│  └───────┘  │                      │  │ Multi-pantalla:     │    │
└─────────────┘                      │  │ N mantenciones      │    │
                                     │  │ simultaneas         │    │
                                     └──┴─────────────────────┴────┘
```

## Resultado Esperado

Un mantenimiento de primer nivel que:
- Corrige errores humanos antes de que ocurran
- Detecta oportunidades que el ojo no entrenado pierde
- Transfiere conocimiento senior → junior en tiempo real
- Genera data de entrenamiento con cada sesion

---

## Contraste: Idea Operativa vs. Propuesta Formal PUCV

La propuesta de colaboracion MCCO-PUCV (adjunta) formaliza y expande este concepto.
A continuacion, como se relacionan:

| Aspecto | Idea Operativa (Mario) | Propuesta Formal PUCV |
|---------|----------------------|----------------------|
| **Camara** | Insta360 / DJI compacta, streaming directo | Camara en casco (~80-120g), ESP32-S3 + 4G LTE, costo <USD $100 |
| **Procesamiento** | IA en punto de control central | 3 opciones: 100% cloud (1.5-2.8s), edge con Jetson (4-10s), hibrido smartphone |
| **Modelo IA** | Gemini 4 u otro VLM | Gemini 2.5 Flash, GPT-4o, Claude Vision + YOLO custom |
| **Supervision humana** | Senior + equipo confiabilidad en multi-pantalla | Los seniors entrenan la IA antes de jubilar; genera "imagenes buenas" anotadas |
| **Datos historicos** | Cruce en tiempo real con historial empresa | Linea 4 PUCV: analisis predictivo de confiabilidad por vision, correlacion visual-vida util |
| **Audio bidireccional** | Instruccion por audio, tecnico pregunta | TTS espanol tecnico + STT robusto ante ruido industrial 85-100 dB(A) |
| **Aprendizaje** | Cada video mejora la IA | Dataset generado por seniors = entrenamiento de costo marginal ~cero |
| **Equipos target** | No especificado | CAEX Komatsu 930E/980E, Palas P&H 4100XPC (USD $50K-150K/dia downtime) |
| **Alcance academico** | — | 4 lineas de investigacion, tesis magister/doctorado, co-publicaciones |
| **Financiamiento** | — | CORFO Innova (~USD $1.1M), ANID Fondecyt, FONDEF |
| **Piloto** | — | 5-10 tecnicos en taller CODELCO, Q1 2027 |

### Sintesis

La vision de Mario es el **caso de uso operativo real** — como se ve SRP Vision en la
practica diaria de un taller de mantenimiento. La propuesta PUCV es el **vehiculo de
I+D** para construirlo con rigor cientifico, financiamiento publico, y respaldo academico.

Ambas se complementan:
- La idea operativa define el **que** y el **para que**
- La propuesta PUCV define el **como**, el **con quien**, y el **con que recursos**

---

## Relacion con SRP Suite

SRP Vision no reemplaza a SRP Suite — la extiende al mundo fisico:

```
SRP Suite (existente)              SRP Vision (nuevo)
─────────────────────              ──────────────────
Genera SOPs digitales    ────►     Los ejecuta en terreno con IA
Estructura procedimientos ────►    Los compara vs. lo que ve la camara
Almacena en Vault        ────►     Alimenta el modelo con data real
Videos de capacitacion   ────►     Asistencia en vivo durante el trabajo
Analisis de riesgos      ────►     Deteccion visual de riesgos en tiempo real
```

SRP Suite es el **cerebro documental**. SRP Vision es los **ojos y oidos en terreno**.

---

## Documentos

- [Propuesta de Colaboracion MCCO-PUCV](SRP-Vision-Propuesta-Colaboracion-MCCO-PUCV.pdf) — Documento formal (16 pags, confidencial)

---

## Proximos Hitos (segun propuesta PUCV)

| Fecha | Hito |
|-------|------|
| Abril 2026 | Reunion presencial MCCO-PUCV |
| Mayo 2026 | Definicion alcance tecnico + seleccion lineas de investigacion |
| Mayo-Junio 2026 | Firma convenio I+D + NDA |
| Junio-Julio 2026 | Postulacion CORFO / FONDEF |
| Julio 2026 | Entrega primer dataset imagenes + SOPs a PUCV |
| Oct-Nov 2026 | Primer prototipo (camara + IA + audio) en laboratorio |
| Q1 2027 | Piloto con 5-10 tecnicos en taller CODELCO |

---

MCCO Group SpA — Abril 2026
