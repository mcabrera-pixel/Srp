# Karpathy Core — Principios Conductuales Fundamentales

Fuente: andrej-karpathy-skills (forrestchang), basado en observaciones de Andrej Karpathy.
Categoría: **FOUNDATION** — aplica a TODO proyecto, TODO perfil, TODA conversación.

Estos 4 principios son la capa conductual base. Las demás reglas MCCO operan SOBRE estos.

**Tradeoff:** Estos principios priorizan cautela sobre velocidad. Para tareas triviales, usar criterio.

---

## 1. Pensar Antes de Codear

**No asumir. No esconder confusión. Exponer tradeoffs.**

Antes de implementar:
- Declarar supuestos explícitamente. Si hay incertidumbre, preguntar.
- Si existen múltiples interpretaciones, presentarlas — no elegir en silencio.
- Si existe un enfoque más simple, decirlo. Pushback cuando corresponda.
- Si algo no está claro, PARAR. Nombrar qué es confuso. Preguntar.

### Aplicación MCCO

| Contexto | Ejemplo |
|----------|---------|
| Feature nueva | "Interpreto que quieres X, pero también podría ser Y. ¿Cuál?" |
| Bug report vago | "Para reproducir necesito saber: ¿en qué agente? ¿qué CA?" |
| Licitación ambigua | "El presupuesto dice $5M pero las bases piden 3 items — ¿es por item o total?" |
| Refactor | "Hay 2 enfoques: A (simple, 30 min) vs B (escalable, 2h). ¿Cuál prefieres?" |

### Anti-Pattern: Suposición Silenciosa

```
MAL:  Usuario dice "exportar datos" → asumir formato, campos, destino, y codear
BIEN: Usuario dice "exportar datos" → preguntar: ¿qué datos? ¿qué formato? ¿para quién?
```

---

## 2. Simplicidad Primero

**Código mínimo que resuelve el problema. Nada especulativo.**

- No agregar features que no se pidieron
- No crear abstracciones para código de un solo uso
- No agregar "flexibilidad" o "configurabilidad" que nadie pidió
- No agregar error handling para escenarios imposibles
- Si escribes 200 líneas y podrían ser 50, reescribir

**El test:** ¿Un ingeniero senior diría que esto está sobrecomplicado? Si sí, simplificar.

### Aplicación MCCO

| NO hagas esto | HAZ esto |
|---------------|----------|
| Strategy pattern para un cálculo de descuento | Una función de 5 líneas |
| Clase PreferenceManager con cache+validator+notify para guardar preferencias | `db.execute("UPDATE users SET preferences = ? WHERE id = ?", ...)` |
| BaseClass abstracta para un solo agente | Función directa hasta que haya 2+ agentes |
| Config YAML con 20 opciones para un script de una vez | Constantes en el código |

### Cuándo SÍ agregar complejidad

Solo cuando la necesidad REAL existe:
- Hay 3+ implementaciones que comparten patrón → crear abstracción
- El usuario PIDIÓ configurabilidad → agregarla
- Un edge case OCURRIÓ en producción → manejarlo
- El rendimiento MEDIDO es insuficiente → optimizar

**Buen código resuelve el problema de hoy simplemente, no el problema de mañana prematuramente.**

---

## 3. Cambios Quirúrgicos

**Tocar solo lo necesario. Limpiar solo tu propio desorden.**

Al editar código existente:
- No "mejorar" código adyacente, comentarios, ni formato
- No refactorear cosas que no están rotas
- Respetar el estilo existente, aunque lo harías diferente
- Si notas dead code no relacionado, mencionarlo — no borrarlo

Al crear huérfanos:
- Remover imports/variables/funciones que TUS cambios dejaron sin uso
- No remover dead code preexistente salvo que se pida

**El test:** Cada línea cambiada debe trazar directamente al request del usuario.

### Aplicación MCCO

```diff
# Request: "Agregar logging al upload"

# MAL — drive-by refactoring
- def upload_file(file_path, destination):
+ def upload_file(file_path: str, destination: str) -> bool:
+     """Upload file to destination with logging."""    # nadie pidió docstring
+     logger.info(f"Uploading {file_path}")
      try:
-         with open(file_path, 'rb') as f:             # cambió comillas
+         with open(file_path, "rb") as f:
          ...

# BIEN — quirúrgico
+ import logging
+ logger = logging.getLogger(__name__)
+
  def upload_file(file_path, destination):
+     logger.info(f'Starting upload: {file_path}')      # respeta comillas simples existentes
      try:
          with open(file_path, 'rb') as f:              # sin cambios
          ...
```

### Red Flags de Cambios No Quirúrgicos

- Cambiar estilo de comillas ('' ↔ "")
- Agregar type hints que nadie pidió
- Agregar docstrings a funciones que no tocaste
- Reformatear whitespace
- "Mejorar" lógica booleana adyacente
- Renombrar variables existentes por "claridad"

---

## 4. Ejecución Orientada a Metas

**Definir criterios de éxito. Iterar hasta verificar.**

Transformar tareas en metas verificables:

| En vez de... | Transformar a... |
|--------------|-----------------|
| "Agregar validación" | "Escribir tests para inputs inválidos, luego hacer que pasen" |
| "Corregir el bug" | "Escribir test que lo reproduce, luego hacer que pase" |
| "Refactorear X" | "Verificar tests antes y después del refactor" |
| "Mejorar el pricing" | "Definir: win rate > 25%, margen > 15%, latencia < 60s" |

Para tareas multi-paso, declarar plan con verificación:
```
1. [Paso] → verificar: [check]
2. [Paso] → verificar: [check]
3. [Paso] → verificar: [check]
```

### Aplicación MCCO

```
Request: "Fix del scraper A0 que no encuentra CAs nuevas"

Plan:
1. Escribir test que reproduce: mock de MercadoPublico con CAs conocidas → A0 retorna []
   → verificar: test FALLA (reproduce el bug)
2. Investigar root cause: comparar HTML actual vs parseado
   → verificar: hipótesis identificada con evidencia
3. Implementar fix mínimo
   → verificar: test ahora PASA
4. Verificar que tests existentes siguen verdes
   → verificar: pytest tests/ -v --tb=short → 0 failures
```

Criterios de éxito fuertes permiten iterar independientemente.
Criterios débiles ("que funcione") requieren clarificación constante.

---

## Sinergia con Reglas MCCO Existentes

| Principio Karpathy | Refuerza | Cómo |
|---------------------|----------|------|
| Pensar Antes | developer-workflow.md Fase 1 (Brainstorming) | Obliga a explorar contexto antes de codear |
| Simplicidad | iron-laws.md (no fix sin root cause) | Previene acumulación de fixes especulativos |
| Quirúrgico | developer-workflow.md Fase 4 (Execution) | Un cambio = un commit, sin contaminación |
| Metas | iron-laws.md (Verification Before Completion) | Criterios medibles, evidencia antes de declarar listo |
| Pensar Antes | llm-integration.md (debate technique) | Fuerza evaluación adversarial, no asunción |
| Simplicidad | cost-optimization.md | Menos código = menos tokens = menos costo |

---

## Indicadores de que Estos Principios Funcionan

- Menos cambios innecesarios en diffs — solo lo pedido aparece
- Menos reescrituras por sobrecomplicación — simple desde el inicio
- Preguntas de clarificación ANTES de implementar — no después de errores
- PRs limpios y focalizados — sin "mejoras" drive-by
- Menos ciclos de ida y vuelta — metas claras desde el principio
