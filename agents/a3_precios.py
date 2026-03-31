"""A3 Precios — Searches and evaluates market prices for products."""

import json
import logging

from agents.base import BaseAgent

logger = logging.getLogger(__name__)

EVALUACION_PROMPT = """Eres el evaluador de precios del sistema SRP.
Evalúa los resultados de búsqueda de precios y consolida la mejor opción.

Responde SOLO en JSON:
{{
  "precio_unitario": number,
  "fuente": "nombre de la fuente",
  "match_score": 1-5,
  "confianza": 1-5,
  "razon": "explicación breve"
}}"""

SELF_CRITIQUE_PROMPT_A3 = """Eres el revisor interno de precios del sistema SRP.
Tu trabajo es revisar el precio seleccionado antes de enviarlo al decisor.

Analiza:
1. ¿El precio seleccionado es razonable para este tipo de producto?
2. ¿El match_score es suficiente? ¿No estamos comparando productos diferentes?
3. ¿La fuente es confiable?

Responde SOLO en JSON:
{{
  "aprobado": true | false,
  "accion": "APROBAR" | "BAJAR_CONFIANZA" | "DESCARTAR",
  "razon": "explicación breve",
  "confianza_ajustada": null | number
}}"""


class A3Precios(BaseAgent):
    """Agent that searches and evaluates market prices."""

    def __init__(self, **kwargs):
        super().__init__(agent_id="A3", **kwargs)

    def run(self, message):
        ca = message.get("ca", {})
        clasificacion = message.get("clasificacion", {})
        keywords = clasificacion.get("keywords", [])
        presupuesto = ca.get("presupuesto", 0)

        # Search for prices
        resultados = self._buscar_precios(keywords)

        if not resultados:
            resultado = {
                "precio_unitario": 0,
                "confianza": 1,
                "fuente": None,
                "match_score": 0,
                "razon": "Sin resultados de búsqueda",
            }
            self.save_decision("PRECIO_ENCONTRADO", resultado)
            self.send_message("A7", {
                "tipo": "precio_encontrado",
                "ca": ca,
                "precio_mercado": 0,
                "confianza_precio": 1,
            })
            return resultado

        # Evaluate and consolidate results
        consolidated = self._evaluar_resultados(resultados, keywords, presupuesto)

        # Self-critique: only if we have results
        consolidated = self._self_critique(consolidated, keywords, presupuesto)

        self.save_decision("PRECIO_ENCONTRADO", consolidated)

        self.send_message("A7", {
            "tipo": "precio_encontrado",
            "ca": ca,
            "precio_mercado": consolidated.get("precio_unitario", 0),
            "confianza_precio": consolidated.get("confianza", 1),
        })

        return consolidated

    def _buscar_precios(self, keywords):
        """Search for prices using keywords. Override or inject for testing."""
        # In production this would call external APIs
        return []

    def _evaluar_resultados(self, resultados, keywords, presupuesto):
        """LLM call to evaluate and consolidate search results."""
        user_msg = json.dumps({
            "resultados": resultados,
            "keywords": keywords,
            "presupuesto": presupuesto,
        })

        try:
            respuesta = self._llm_call(EVALUACION_PROMPT, user_msg)
            consolidated = json.loads(respuesta)
            return consolidated
        except Exception as e:
            logger.error("Error en _evaluar_resultados: %s", e)
            return {
                "precio_unitario": 0,
                "confianza": 1,
                "fuente": None,
                "match_score": 0,
                "razon": f"Error LLM: {e}",
            }

    def _self_critique(self, consolidated, keywords, presupuesto):
        """Second LLM call: review price evaluation before sending to decisor."""
        user_msg = json.dumps({
            "resultado_original": consolidated,
            "keywords": keywords,
            "presupuesto": presupuesto,
        })

        try:
            respuesta = self._llm_call(SELF_CRITIQUE_PROMPT_A3, user_msg)
            critica = json.loads(respuesta)
        except Exception as e:
            logger.warning("Self-critique A3 falló (%s), usando resultado original", e)
            return consolidated

        accion = critica.get("accion", "APROBAR")

        if accion == "APROBAR":
            return consolidated

        if accion == "BAJAR_CONFIANZA":
            nueva_confianza = critica.get("confianza_ajustada")
            if nueva_confianza is not None:
                # Guardrail: confidence between 1 and 5
                nueva_confianza = max(1, min(5, nueva_confianza))
                consolidated["confianza"] = nueva_confianza
            consolidated["self_critique"] = critica.get("razon", "Confianza reducida")
            return consolidated

        if accion == "DESCARTAR":
            consolidated["confianza"] = 1
            consolidated["self_critique"] = critica.get("razon", "Resultado descartado")
            # Guardrail: precio must be > 0 if there was a price
            # but confianza=1 signals unreliable
            return consolidated

        # Unknown action: return original
        return consolidated
