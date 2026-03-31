"""Tests for A4 Email self-critique functionality."""

import json
import pytest

from agents.a4_email import A4Email


class TestA4SelfCritique:
    """Tests for A4 self-critique second LLM pass."""

    def _make_agent(self, mock_worker, llm):
        return A4Email(worker=mock_worker, llm_client=llm)

    def _seleccion_response(self, productos=None, proveedores=None):
        """Helper to build a _seleccionar_proveedores response."""
        return json.dumps({
            "proveedores": proveedores or [
                {"nombre": "TecnoShop", "email": "ventas@tecnoshop.com", "razon": "Especialista IT"},
            ],
            "productos_a_cotizar": productos or [
                {"descripcion": "Notebook Dell Latitude 5540", "cantidad": 10, "unidad": "unidad"},
            ],
        })

    def test_self_critique_approves_specific_products(self, mock_worker, mock_llm, sample_ca):
        """Self-critique approves specific products → emails sent normally."""
        seleccion_resp = self._seleccion_response()
        critique_resp = json.dumps({
            "aprobado": True,
            "accion": "APROBAR",
            "razon": "Productos específicos con marca y modelo",
        })
        llm = mock_llm([seleccion_resp, critique_resp])
        agent = self._make_agent(mock_worker, llm)

        result = agent.run({
            "ca": sample_ca,
            "clasificacion": {"categoria": "tecnologia", "keywords": ["notebook", "dell"]},
        })

        assert result["emails_enviados"] == 1
        assert llm.call_count == 2

    def test_self_critique_refines_generic_products(self, mock_worker, mock_llm, sample_ca):
        """Self-critique detects generic products → REFINAR_PRODUCTOS."""
        seleccion_resp = self._seleccion_response(
            productos=[{"descripcion": "Computadora", "cantidad": 10, "unidad": "unidad"}]
        )
        critique_resp = json.dumps({
            "aprobado": False,
            "accion": "REFINAR_PRODUCTOS",
            "razon": "Producto demasiado genérico, falta marca/modelo",
            "productos_refinados": [
                {"descripcion": "Notebook Dell Latitude 5540 i5 16GB", "cantidad": 10, "unidad": "unidad"},
            ],
        })
        llm = mock_llm([seleccion_resp, critique_resp])
        agent = self._make_agent(mock_worker, llm)

        result = agent.run({
            "ca": sample_ca,
            "clasificacion": {"categoria": "tecnologia", "keywords": ["notebook"]},
        })

        assert result["emails_enviados"] == 1
        # The email should contain the refined product
        email_body = result["emails"][0]["body"]
        assert "Dell Latitude 5540" in email_body

    def test_self_critique_skips_services(self, mock_worker, mock_llm, sample_ca_servicios):
        """Self-critique detects services → SKIP, no emails sent."""
        seleccion_resp = self._seleccion_response(
            productos=[{"descripcion": "Servicio de limpieza", "cantidad": 1, "unidad": "servicio"}]
        )
        critique_resp = json.dumps({
            "aprobado": False,
            "accion": "SKIP",
            "razon": "Servicios no se cotizan por email a proveedores de productos",
        })
        llm = mock_llm([seleccion_resp, critique_resp])
        agent = self._make_agent(mock_worker, llm)

        result = agent.run({
            "ca": sample_ca_servicios,
            "clasificacion": {"categoria": "servicios", "keywords": ["limpieza"]},
        })

        assert result["emails_enviados"] == 0
        assert "self_critique" in result

    def test_graceful_degradation_on_llm_failure(self, mock_worker, mock_llm, sample_ca):
        """LLM fails on self-critique → emails sent with original products."""
        seleccion_resp = self._seleccion_response()
        llm = mock_llm([seleccion_resp, RuntimeError("LLM timeout")])
        agent = self._make_agent(mock_worker, llm)

        result = agent.run({
            "ca": sample_ca,
            "clasificacion": {"categoria": "tecnologia", "keywords": ["notebook"]},
        })

        assert result["emails_enviados"] == 1  # Emails sent normally

    def test_no_selections_skips_self_critique(self, mock_worker, mock_llm, sample_ca):
        """No providers/products selected → self-critique NOT called."""
        seleccion_resp = json.dumps({
            "proveedores": [],
            "productos_a_cotizar": [],
        })
        llm = mock_llm([seleccion_resp])
        agent = self._make_agent(mock_worker, llm)

        result = agent.run({
            "ca": sample_ca,
            "clasificacion": {"categoria": "tecnologia", "keywords": ["notebook"]},
        })

        assert result["emails_enviados"] == 0
        assert llm.call_count == 1  # Only selection, no self-critique
