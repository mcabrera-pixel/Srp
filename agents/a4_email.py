"""A4 Email — Generates and sends quotation request emails to suppliers."""

import json
import logging
import re

from agents.base import BaseAgent

logger = logging.getLogger(__name__)

SELECCION_PROVEEDORES_PROMPT = """Eres el selector de proveedores del sistema SRP.
Selecciona los proveedores más relevantes para cotizar estos productos.

Responde SOLO en JSON:
{{
  "proveedores": [
    {{"nombre": "...", "email": "...", "razon": "..."}}
  ],
  "productos_a_cotizar": [
    {{"descripcion": "...", "cantidad": number, "unidad": "..."}}
  ]
}}"""

SELF_CRITIQUE_PROMPT_A4 = """Eres el revisor interno de cotizaciones del sistema SRP.
Tu trabajo es revisar la selección de productos y proveedores antes de enviar emails.

Analiza:
1. ¿Los productos tienen marca/modelo específico? (no genéricos como "notebook" sin especificar)
2. ¿Los proveedores seleccionados son relevantes para estos productos?
3. ¿El email NO debe revelar organismo ni presupuesto?
4. ¿Tiene sentido cotizar estos productos? (ej: servicios no se cotizan por email)

Responde SOLO en JSON:
{{
  "aprobado": true | false,
  "accion": "APROBAR" | "REFINAR_PRODUCTOS" | "SKIP",
  "razon": "explicación breve",
  "productos_refinados": null | [
    {{"descripcion": "...", "cantidad": number, "unidad": "..."}}
  ]
}}"""

EMAIL_TEMPLATE = """Estimado/a {proveedor},

Solicitamos cotización para los siguientes productos:

{productos_lista}

Agradeceríamos su respuesta a la brevedad.

Saludos cordiales,
Sistema SRP"""


class A4Email(BaseAgent):
    """Agent that generates quotation request emails."""

    MAX_PROVEEDORES = 3
    MAX_PRODUCTOS = 8

    def __init__(self, **kwargs):
        super().__init__(agent_id="A4", **kwargs)

    def run(self, message):
        ca = message.get("ca", {})
        clasificacion = message.get("clasificacion", {})
        proveedores_db = message.get("proveedores_db", [])

        # Select suppliers
        seleccion = self._seleccionar_proveedores(
            clasificacion, ca, proveedores_db
        )

        proveedores = seleccion.get("proveedores", [])
        productos = seleccion.get("productos_a_cotizar", [])

        if not proveedores or not productos:
            return {"emails_enviados": 0, "razon": "Sin proveedores o productos"}

        # Guardrails: max providers and products
        proveedores = proveedores[: self.MAX_PROVEEDORES]
        productos = productos[: self.MAX_PRODUCTOS]

        # Self-critique: only if we have selections
        critique_result = self._self_critique(productos, proveedores, ca)

        accion = critique_result.get("accion", "APROBAR")

        if accion == "SKIP":
            self.save_decision("EMAIL_SKIP", {
                "razon": critique_result.get("razon", "Self-critique recomienda skip"),
            })
            return {
                "emails_enviados": 0,
                "razon": critique_result.get("razon", "Skip por self-critique"),
                "self_critique": critique_result.get("razon"),
            }

        if accion == "REFINAR_PRODUCTOS":
            productos_refinados = critique_result.get("productos_refinados")
            if productos_refinados:
                productos = productos_refinados[: self.MAX_PRODUCTOS]

        # Generate and "send" emails
        emails = []
        for prov in proveedores:
            email_body = self._generar_email(prov, productos)
            email_body = self._sanitizar_email_body(email_body, ca)
            emails.append({
                "to": prov.get("email", ""),
                "proveedor": prov.get("nombre", ""),
                "body": email_body,
            })

        self.save_decision("EMAILS_ENVIADOS", {
            "cantidad": len(emails),
            "proveedores": [e["proveedor"] for e in emails],
        })

        return {"emails_enviados": len(emails), "emails": emails}

    def _seleccionar_proveedores(self, clasificacion, ca, proveedores_db):
        """LLM call to select suppliers for quotation."""
        user_msg = json.dumps({
            "categoria": clasificacion.get("categoria", ""),
            "keywords": clasificacion.get("keywords", []),
            "descripcion": ca.get("descripcion", ""),
            "proveedores_disponibles": proveedores_db,
        })

        try:
            respuesta = self._llm_call(SELECCION_PROVEEDORES_PROMPT, user_msg)
            return json.loads(respuesta)
        except Exception as e:
            logger.error("Error en _seleccionar_proveedores: %s", e)
            return {"proveedores": [], "productos_a_cotizar": []}

    def _self_critique(self, productos, proveedores, ca):
        """Second LLM call: review selection before sending emails."""
        user_msg = json.dumps({
            "productos": productos,
            "proveedores": [p.get("nombre", "") for p in proveedores],
            "descripcion": ca.get("descripcion", ""),
        })

        try:
            respuesta = self._llm_call(SELF_CRITIQUE_PROMPT_A4, user_msg)
            critica = json.loads(respuesta)
        except Exception as e:
            logger.warning("Self-critique A4 falló (%s), aprobando por defecto", e)
            return {"accion": "APROBAR"}

        accion = critica.get("accion", "APROBAR")

        # Guardrails on refined products
        if accion == "REFINAR_PRODUCTOS":
            productos_refinados = critica.get("productos_refinados", [])
            if productos_refinados:
                productos_refinados = productos_refinados[: self.MAX_PRODUCTOS]
                critica["productos_refinados"] = productos_refinados

        return critica

    def _generar_email(self, proveedor, productos):
        """Generate email body from template."""
        productos_lista = "\n".join(
            f"- {p.get('descripcion', '')} x {p.get('cantidad', 1)} {p.get('unidad', 'unidad')}"
            for p in productos
        )
        return EMAIL_TEMPLATE.format(
            proveedor=proveedor.get("nombre", "Proveedor"),
            productos_lista=productos_lista,
        )

    def _sanitizar_email_body(self, body, ca):
        """Remove any mention of organismo or presupuesto from email body."""
        organismo = ca.get("organismo", "")
        presupuesto = str(ca.get("presupuesto", ""))

        if organismo:
            body = body.replace(organismo, "[ORGANISMO]")

        if presupuesto and presupuesto != "0":
            body = body.replace(presupuesto, "[PRESUPUESTO]")

        # Extra safety: remove common budget patterns
        body = re.sub(r'\$[\d.,]+', '[MONTO]', body)

        return body
