"""A7 Decisor — Decides whether to OFERTAR or COTIZAR based on pricing data."""

import json
import logging

from agents.base import BaseAgent

logger = logging.getLogger(__name__)

SELF_CRITIQUE_PROMPT = """Eres el revisor interno de ofertas del sistema SRP.
Tu trabajo es revisar la decisión de OFERTAR antes de ejecutarla.

Analiza:
1. ¿El margen es suficiente (≥15%)?
2. ¿El precio de mercado es confiable (confianza ≥ 3)?
3. ¿Hay competidores que podrían ganar con mejor precio?
4. ¿La oferta respeta el presupuesto del organismo?

Responde SOLO en JSON:
{
  "aprobado": true | false,
  "accion": "APROBAR" | "AJUSTAR_PRECIO" | "CAMBIAR_A_COTIZAR",
  "razon": "explicación breve",
  "precio_ajustado": null | number,
  "margen_ajustado": null | number
}"""


class A7Decisor(BaseAgent):
    """Agent that decides whether to submit an offer or request quotes."""

    def __init__(self, **kwargs):
        super().__init__(agent_id="A7", **kwargs)

    def run(self, message):
        ca = message.get("ca", {})
        precio_mercado = message.get("precio_mercado")
        confianza_precio = message.get("confianza_precio", 1)
        competidores = message.get("competidores", [])
        presupuesto = ca.get("presupuesto", 0)
        knowledge = message.get("knowledge", "")

        decision = self._decidir_oferta(
            ca, precio_mercado, confianza_precio, competidores, presupuesto, knowledge
        )

        # Self-critique: only for OFERTAR decisions
        if decision.get("decision") == "OFERTAR":
            decision = self._self_critique(
                decision, ca, precio_mercado, confianza_precio,
                competidores, presupuesto, knowledge
            )

        # Firewall: margen >= 15%
        if decision.get("decision") == "OFERTAR":
            margen = decision.get("margen", 0)
            if margen < 15:
                logger.warning("Firewall: margen %.1f%% < 15%%, cambiando a COTIZAR", margen)
                decision["decision"] = "COTIZAR"
                decision["razon"] = f"Margen {margen}% insuficiente (mín 15%)"

        # Firewall: oferta <= presupuesto
        if decision.get("decision") == "OFERTAR" and presupuesto > 0:
            if decision.get("precio_oferta", 0) > presupuesto:
                logger.warning("Firewall: oferta > presupuesto, cambiando a COTIZAR")
                decision["decision"] = "COTIZAR"
                decision["razon"] = "Oferta excede presupuesto"

        self.save_decision("OFERTAR" if decision["decision"] == "OFERTAR" else "COTIZAR", decision)
        self.send_message("A1", {"tipo": "resultado_decision", "decision": decision})
        return decision

    def _decidir_oferta(self, ca, precio_mercado, confianza_precio, competidores, presupuesto, knowledge):
        """First LLM call: decide whether to OFERTAR or COTIZAR."""
        system_prompt = (
            "Eres el decisor de ofertas del sistema SRP. "
            "Decide si OFERTAR (tenemos precio confiable) o COTIZAR (necesitamos más info)."
        )
        user_msg = json.dumps({
            "descripcion": ca.get("descripcion", ""),
            "precio_mercado": precio_mercado,
            "confianza_precio": confianza_precio,
            "competidores": competidores,
            "presupuesto": presupuesto,
            "knowledge": knowledge,
        })

        try:
            respuesta = self._llm_call(system_prompt, user_msg)
            result = json.loads(respuesta)
            return result
        except Exception as e:
            logger.error("Error en _decidir_oferta: %s", e)
            return {"decision": "COTIZAR", "razon": f"Error LLM: {e}"}

    def _self_critique(self, decision, ca, precio_mercado, confianza_precio, competidores, presupuesto, knowledge):
        """Second LLM call: review OFERTAR decision before executing."""
        user_msg = json.dumps({
            "decision_original": decision,
            "descripcion": ca.get("descripcion", ""),
            "precio_mercado": precio_mercado,
            "confianza_precio": confianza_precio,
            "competidores": competidores,
            "presupuesto": presupuesto,
            "knowledge": knowledge,
        })

        try:
            respuesta = self._llm_call(SELF_CRITIQUE_PROMPT, user_msg)
            critica = json.loads(respuesta)
        except Exception as e:
            logger.warning("Self-critique A7 falló (%s), usando decisión original", e)
            return decision

        accion = critica.get("accion", "APROBAR")

        if accion == "APROBAR":
            return decision

        if accion == "AJUSTAR_PRECIO":
            nuevo_precio = critica.get("precio_ajustado")
            nuevo_margen = critica.get("margen_ajustado")
            if nuevo_precio and nuevo_precio > 0:
                decision["precio_oferta"] = nuevo_precio
            if nuevo_margen is not None:
                decision["margen"] = nuevo_margen
            decision["self_critique"] = critica.get("razon", "Precio ajustado")
            # Guardrail: margen >= 15%
            if decision.get("margen", 0) < 15:
                decision["margen"] = 15
            # Guardrail: oferta <= presupuesto
            if presupuesto > 0 and decision.get("precio_oferta", 0) > presupuesto:
                decision["decision"] = "COTIZAR"
                decision["razon"] = "Oferta ajustada excede presupuesto"
            return decision

        if accion == "CAMBIAR_A_COTIZAR":
            decision["decision"] = "COTIZAR"
            decision["razon"] = critica.get("razon", "Self-critique recomienda cotizar")
            decision["self_critique"] = critica.get("razon", "Cambiado a cotizar")
            return decision

        return decision
