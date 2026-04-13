# Developer Workflow — Estándares MCCO

Fuente: superpowers/obra (124k), best-practice (30.4k).

Flujo obligatorio para desarrollo con agentes de código en proyectos MCCO.

---

## Las 4 Fases del Desarrollo

Ninguna fase se salta. El código NO se escribe sin plan.

### Fase 1: Research
- Explorar contexto: leer código existente, entender el problema
- Proponer 2-3 enfoques con trade-offs
- Preguntas > suposiciones
- Obtener aprobación del diseño ANTES de escribir código

### Fase 2: Plan
- Crear branch aislado si corresponde: `feature/nombre-descriptivo`
- Descomponer en tareas de 2-5 minutos cada una
- Cada tarea con: archivo(s) a tocar, cambio exacto, criterio de verificación
- Cero placeholders — el plan tiene código completo o pseudo-código específico

### Fase 3: Execute
- Una tarea a la vez, en orden del plan
- TDD obligatorio:
  - **RED**: Escribir test que FALLA primero
  - **GREEN**: Escribir código MINIMO que hace pasar el test
  - **REFACTOR**: Limpiar sin cambiar comportamiento
- Commit por tarea completada

### Fase 4: Verify
- Todos los tests pasan (ejecutar, leer output, citar evidencia)
- Self-review del diff completo antes de declarar listo
- Decisión: merge directo / crear PR / mantener branch
- NUNCA declarar "listo" sin evidencia verificable

---

## Debugging Sistemático (4 Fases)

Cuando un bug aparece, NO intentar fixes al azar. Seguir el método científico:

### Fase 1: Root Cause Investigation
```
Leer el error COMPLETO (no saltear warnings)
Reproducir el error consistentemente
Revisar cambios recientes (git diff)
Instrumentar boundaries entre componentes
Trazar datos HACIA ATRAS en el call stack
```

### Fase 2: Pattern Analysis
```
Encontrar código similar que SI funciona
Listar CADA diferencia entre working/broken
Buscar el patrón, no el síntoma
```

### Fase 3: Hypothesis & Testing
```
Formular UNA hipótesis específica: "X causa Y porque Z"
Diseñar cambio MINIMO para testear la hipótesis
Si falla: nueva hipótesis (NO acumular fixes)
Si 3+ hipótesis fallan: ESCALAR — es problema arquitectural
```

### Fase 4: Implementation
```
Escribir test que reproduce el bug (RED)
Implementar el fix (GREEN)
Verificar que el test pasa
Verificar que no se rompió nada más
```

---

## Meta-Skill: Crear Nuevos Skills

Cuando se descubre un proceso repetitivo, crear un skill reutilizable usando TDD de procesos:

1. **RED**: Ejecutar el escenario SIN el skill. Documentar errores que ocurren.
2. **GREEN**: Escribir skill MINIMO que aborde esas violaciones.
3. **REFACTOR**: Cerrar loopholes encontrados en uso real.

Formato: archivo Markdown con frontmatter YAML (`name`, `description`) +
secciones: Instrucciones, Pasos, Pitfalls, Verificación.

---

## Convenciones de Commits

```
feat: nueva funcionalidad
fix: corrección de bug
chore: mantenimiento, dependencias
refactor: reestructuración sin cambiar comportamiento
test: agregar o modificar tests
docs: documentación
```

Branch naming: `feature/`, `fix/`, `chore/`
Nunca force push a main.
