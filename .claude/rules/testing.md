# Testing — Estandares MCCO

## Estructura de Tests

- Tests en directorio `/tests/`
- Nombres: `test_<modulo>.py` (Python), `<modulo>.test.ts` (TypeScript)
- Framework: pytest (Python), vitest (TypeScript)
- Fixtures compartidas en `conftest.py`

## Que DEBE Testearse

- Todos los metodos `run()` de agentes
- Todas las funciones de busqueda de precios (engines)
- Todos los endpoints del Worker (happy path + error case minimo)
- Reglas de negocio: margen minimo, filtro region, presupuesto minimo
- Parsing JSON de respuestas LLM (valido + malformado)
- Formatos chilenos: RUT, CLP, telefono

## Estrategia de Mocking

- Mockear servicios EXTERNOS: APIs LLM, MercadoLibre, Google Sheets, SMTP
- NO mockear logica interna — testearla de verdad
- Usar `httpx_mock` o `responses` para HTTP mocking
- Usar `monkeypatch` para variables de entorno

```python
# Ejemplo: mock de LLM
@pytest.fixture
def mock_llm(monkeypatch):
    def fake_llm_call(self, system, user, **kw):
        return '{"precio": 5000, "confianza": 3}'
    monkeypatch.setattr(BaseAgent, "llm_call", fake_llm_call)
```

## Tests de Integracion

- Minimo un test end-to-end por path del pipeline
- Verificar que output de agente A es consumible por agente B
- Testear Worker con D1 real local (miniflare)
- Test de feedback loop completo: decision → resultado → reflect → knowledge update

## CI Requirements

- GitHub Actions corre pytest en cada PR
- Tests deben pasar antes de merge
- Comando minimo: `pytest tests/ -v --tb=short`
- Objetivo: coverage >= 70%

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: pytest tests/ -v --tb=short
```

## Datos de Test

- Usar fixtures para CAs, productos, precios de ejemplo
- NUNCA usar datos de produccion en tests
- Incluir edge cases chilenos (RUT con K, precios con puntos, telefonos +56)

## Prompt Testing (promptfoo)

Todo agente que toma decisiones de negocio DEBE tener suite de evaluación de prompts.
Ver regla completa en `prompt-testing.md`.

- Framework: promptfoo (YAML declarativo, ejecuta local)
- Tests mínimos por prompt: 5 happy path + 3 edge cases + 2 injection
- Red teaming: ejecutar antes de cada deploy a producción
- CI/CD: integrar `promptfoo eval` en GitHub Actions
- Evaluadores custom Python para reglas de negocio (margen, región, presupuesto)

```yaml
# promptfooconfig.yaml mínimo
prompts:
  - file://prompts/a7_pricing.txt
providers:
  - openai-compatible:minimax-m2.7
tests:
  - vars: { producto: "válvulas", presupuesto: "5000000" }
    assert:
      - type: is-json
      - type: python
        value: file://evaluators/pricing_compliance.py
```

## Vertical Slices (mattpocock/skills)

Preferir vertical slicing sobre horizontal slicing:

```
❌ Horizontal: Escribir TODOS los tests → Luego TODO el código
✅ Vertical:   1 test → 1 implementación → refactor → repetir
```

Cada slice atraviesa todas las capas (DB → lógica → API → verificación).
Cada test responde al aprendizaje del test anterior.
