"""A1 Categorizador — Classifies procurement requests into categories."""

import json
import logging

from agents.base import BaseAgent
from agents.categorias import CATEGORIAS_MCCO

logger = logging.getLogger(__name__)

CLASIFICACION_PROMPT = """Eres el categorizador del sistema SRP.
Clasifica el pedido de compra en una categoría y extrae keywords para búsqueda de precios.

Categorías válidas: {categorias}

Responde SOLO en JSON:
{{
  "categoria": "nombre_categoria",
  "categoria_secundaria": "otra_categoria" | null,
  "keywords": ["keyword1", "keyword2", ...],
  "confianza": 1-5,
  "razon": "explicación breve"
}}"""

SELF_CRITIQUE_PROMPT_A1 = """Eres el revisor interno de clasificaciones del sistema SRP.
Tu trabajo es revisar la clasificación antes de usarla para buscar precios.

Analiza:
1. ¿La categoría principal hace sentido para esta descripción?
2. ¿Los keywords son suficientemente específicos para buscar precios?
3. ¿Hay una categoría secundaria que debería ser la principal?

Categorías válidas: {categorias}

Responde SOLO en JSON:
{{
  "aprobado": true | false,
  "accion": "APROBAR" | "AJUSTAR",
  "razon": "explicación breve",
  "categoria_ajustada": null | "nueva_categoria",
  "keywords_ajustados": null | ["kw1", "kw2", ...]
}}"""


class A1Categorizador(BaseAgent):
    """Agent that classifies procurement requests."""

    def __init__(self, **kwargs):
        super().__init__(agent_id="A1", **kwargs)

    def run(self, message):
        ca = message.get("ca", {})
        contexto_adjuntos = message.get("contexto_adjuntos", "")

        clasificacion = self._clasificar(ca, contexto_adjuntos)

        # Self-critique: only if confidence < 5
        if clasificacion.get("confianza", 5) < 5:
            clasificacion = self._self_critique(clasificacion, ca, contexto_adjuntos)

        # Guardrail: category must be valid
        if clasificacion.get("categoria") not in CATEGORIAS_MCCO:
            logger.warning(
                "Categoría '%s' no válida, usando 'oficina' por defecto",
                clasificacion.get("categoria"),
            )
            clasificacion["categoria"] = "oficina"

        self.save_decision("CLASIFICAR", clasificacion)

        # Route to A3 (precios) and A4 (email) based on classification
        self.send_message("A3", {
            "tipo": "buscar_precios",
            "ca": ca,
            "clasificacion": clasificacion,
        })
        self.send_message("A4", {
            "tipo": "preparar_cotizacion",
            "ca": ca,
            "clasificacion": clasificacion,
        })

        return clasificacion

    def _clasificar(self, ca, contexto_adjuntos):
        """First LLM call: classify the procurement request."""
        system_prompt = CLASIFICACION_PROMPT.format(
            categorias=", ".join(CATEGORIAS_MCCO)
        )
        user_msg = json.dumps({
            "descripcion": ca.get("descripcion", ""),
            "organismo": ca.get("organismo", ""),
            "presupuesto": ca.get("presupuesto", 0),
            "contexto_adjuntos": contexto_adjuntos,
        })

        try:
            respuesta = self._llm_call(system_prompt, user_msg)
            clasificacion = json.loads(respuesta)
            return clasificacion
        except Exception as e:
            logger.error("Error en _clasificar: %s", e)
            return {
                "categoria": "oficina",
                "keywords": [],
                "confianza": 1,
                "razon": f"Error LLM: {e}",
            }

    def _self_critique(self, clasificacion, ca, contexto_adjuntos):
        """Second LLM call: review classification before using it."""
        system_prompt = SELF_CRITIQUE_PROMPT_A1.format(
            categorias=", ".join(CATEGORIAS_MCCO)
        )
        user_msg = json.dumps({
            "clasificacion_original": clasificacion,
            "descripcion": ca.get("descripcion", ""),
            "contexto_adjuntos": contexto_adjuntos,
        })

        try:
            respuesta = self._llm_call(system_prompt, user_msg)
            critica = json.loads(respuesta)
        except Exception as e:
            logger.warning("Self-critique A1 falló (%s), usando clasificación original", e)
            return clasificacion

        accion = critica.get("accion", "APROBAR")

        if accion == "APROBAR":
            return clasificacion

        if accion == "AJUSTAR":
            nueva_cat = critica.get("categoria_ajustada")
            nuevos_kw = critica.get("keywords_ajustados")

            # Guardrail: adjusted category must be valid
            if nueva_cat and nueva_cat not in CATEGORIAS_MCCO:
                logger.warning(
                    "Self-critique sugirió categoría inválida '%s', ignorando ajuste",
                    nueva_cat,
                )
                return clasificacion

            if nueva_cat:
                clasificacion["categoria"] = nueva_cat
                clasificacion["self_critique"] = critica.get("razon", "Categoría ajustada")

            if nuevos_kw:
                clasificacion["keywords"] = nuevos_kw
                clasificacion["self_critique"] = critica.get("razon", "Keywords ajustados")

            # Guardrail: confidence must be >= 1
            if clasificacion.get("confianza", 1) < 1:
                clasificacion["confianza"] = 1

            return clasificacion

        # Unknown action: return original
        return clasificacion
