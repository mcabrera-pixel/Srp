"""Tests for A7 Decisor self-critique functionality."""

import json
import pytest

from agents.a7_decisor import A7Decisor


class TestA7SelfCritique:
    """Tests for A7 self-critique second LLM pass."""

    def _make_agent(self, mock_worker, llm):
        agent = A7Decisor(worker=mock_worker, llm_client=llm)
        return agent

    def test_self_critique_approves_good_decision(self, mock_worker, mock_llm):
        """Self-critique approves a solid OFERTAR decision → no changes."""
        decidir_resp = json.dumps({
            "decision": "OFERTAR",
            "precio_oferta": 100000,
            "margen": 25,
        })
        critique_resp = json.dumps({
            "aprobado": True,
            "accion": "APROBAR",
            "razon": "Decisión correcta",
        })
        llm = mock_llm([decidir_resp, critique_resp])
        agent = self._make_agent(mock_worker, llm)

        result = agent.run({
            "ca": {"descripcion": "Notebooks", "presupuesto": 200000},
            "precio_mercado": 80000,
            "confianza_precio": 4,
        })

        assert result["decision"] == "OFERTAR"
        assert result["precio_oferta"] == 100000
        assert llm.call_count == 2

    def test_self_critique_adjusts_price(self, mock_worker, mock_llm):
        """Self-critique adjusts price/margin."""
        decidir_resp = json.dumps({
            "decision": "OFERTAR",
            "precio_oferta": 100000,
            "margen": 30,
        })
        critique_resp = json.dumps({
            "aprobado": False,
            "accion": "AJUSTAR_PRECIO",
            "razon": "Precio alto para el mercado",
            "precio_ajustado": 90000,
            "margen_ajustado": 20,
        })
        llm = mock_llm([decidir_resp, critique_resp])
        agent = self._make_agent(mock_worker, llm)

        result = agent.run({
            "ca": {"descripcion": "Notebooks", "presupuesto": 200000},
            "precio_mercado": 75000,
            "confianza_precio": 4,
        })

        assert result["decision"] == "OFERTAR"
        assert result["precio_oferta"] == 90000
        assert result["margen"] == 20

    def test_self_critique_changes_to_cotizar(self, mock_worker, mock_llm):
        """Self-critique changes decision to COTIZAR."""
        decidir_resp = json.dumps({
            "decision": "OFERTAR",
            "precio_oferta": 100000,
            "margen": 20,
        })
        critique_resp = json.dumps({
            "aprobado": False,
            "accion": "CAMBIAR_A_COTIZAR",
            "razon": "Precio de mercado no confiable",
        })
        llm = mock_llm([decidir_resp, critique_resp])
        agent = self._make_agent(mock_worker, llm)

        result = agent.run({
            "ca": {"descripcion": "Notebooks", "presupuesto": 200000},
            "precio_mercado": 80000,
            "confianza_precio": 2,
        })

        assert result["decision"] == "COTIZAR"

    def test_self_critique_guardrail_min_margin(self, mock_worker, mock_llm):
        """Guardrail: adjusted margin < 15% gets clamped to 15%."""
        decidir_resp = json.dumps({
            "decision": "OFERTAR",
            "precio_oferta": 100000,
            "margen": 20,
        })
        critique_resp = json.dumps({
            "aprobado": False,
            "accion": "AJUSTAR_PRECIO",
            "razon": "Bajar margen",
            "precio_ajustado": 85000,
            "margen_ajustado": 10,
        })
        llm = mock_llm([decidir_resp, critique_resp])
        agent = self._make_agent(mock_worker, llm)

        result = agent.run({
            "ca": {"descripcion": "Toner", "presupuesto": 200000},
            "precio_mercado": 70000,
            "confianza_precio": 4,
        })

        # Self-critique clamps to 15%, then firewall also checks
        assert result["margen"] >= 15

    def test_self_critique_guardrail_budget(self, mock_worker, mock_llm):
        """Guardrail: adjusted price > budget → COTIZAR."""
        decidir_resp = json.dumps({
            "decision": "OFERTAR",
            "precio_oferta": 80000,
            "margen": 20,
        })
        critique_resp = json.dumps({
            "aprobado": False,
            "accion": "AJUSTAR_PRECIO",
            "razon": "Subir precio",
            "precio_ajustado": 150000,
            "margen_ajustado": 25,
        })
        llm = mock_llm([decidir_resp, critique_resp])
        agent = self._make_agent(mock_worker, llm)

        result = agent.run({
            "ca": {"descripcion": "Toner", "presupuesto": 100000},
            "precio_mercado": 70000,
            "confianza_precio": 4,
        })

        assert result["decision"] == "COTIZAR"

    def test_self_critique_graceful_degradation(self, mock_worker, mock_llm):
        """LLM fails on self-critique → original decision passes."""
        decidir_resp = json.dumps({
            "decision": "OFERTAR",
            "precio_oferta": 100000,
            "margen": 25,
        })
        llm = mock_llm([decidir_resp, RuntimeError("LLM timeout")])
        agent = self._make_agent(mock_worker, llm)

        result = agent.run({
            "ca": {"descripcion": "Notebooks", "presupuesto": 200000},
            "precio_mercado": 80000,
            "confianza_precio": 4,
        })

        assert result["decision"] == "OFERTAR"
        assert result["precio_oferta"] == 100000

    def test_cotizar_skips_self_critique(self, mock_worker, mock_llm):
        """COTIZAR decision skips self-critique entirely."""
        decidir_resp = json.dumps({
            "decision": "COTIZAR",
            "razon": "Sin precio confiable",
        })
        llm = mock_llm([decidir_resp])
        agent = self._make_agent(mock_worker, llm)

        result = agent.run({
            "ca": {"descripcion": "Notebooks", "presupuesto": 200000},
            "precio_mercado": 0,
            "confianza_precio": 1,
        })

        assert result["decision"] == "COTIZAR"
        assert llm.call_count == 1  # Only one LLM call

    def test_self_critique_with_knowledge(self, mock_worker, mock_llm):
        """Self-critique receives knowledge context."""
        decidir_resp = json.dumps({
            "decision": "OFERTAR",
            "precio_oferta": 100000,
            "margen": 25,
        })
        critique_resp = json.dumps({
            "aprobado": True,
            "accion": "APROBAR",
            "razon": "OK con knowledge",
        })
        llm = mock_llm([decidir_resp, critique_resp])
        agent = self._make_agent(mock_worker, llm)

        agent.run({
            "ca": {"descripcion": "Notebooks", "presupuesto": 200000},
            "precio_mercado": 80000,
            "confianza_precio": 4,
            "knowledge": "Dell Latitude suele costar 80-100k",
        })

        # Verify knowledge was passed to self-critique
        critique_call = llm.calls[1]
        assert "knowledge" in critique_call["user_msg"]

    def test_firewall_after_self_critique(self, mock_worker, mock_llm):
        """Firewall of 15% still applies after self-critique approves."""
        decidir_resp = json.dumps({
            "decision": "OFERTAR",
            "precio_oferta": 100000,
            "margen": 10,  # Below 15%
        })
        critique_resp = json.dumps({
            "aprobado": True,
            "accion": "APROBAR",
            "razon": "Todo bien",
        })
        llm = mock_llm([decidir_resp, critique_resp])
        agent = self._make_agent(mock_worker, llm)

        result = agent.run({
            "ca": {"descripcion": "Toner", "presupuesto": 200000},
            "precio_mercado": 90000,
            "confianza_precio": 4,
        })

        # Firewall catches the low margin even though self-critique approved
        assert result["decision"] == "COTIZAR"

    def test_saves_decision(self, mock_worker, mock_llm):
        """Decision is saved after self-critique."""
        decidir_resp = json.dumps({
            "decision": "OFERTAR",
            "precio_oferta": 100000,
            "margen": 25,
        })
        critique_resp = json.dumps({
            "aprobado": True,
            "accion": "APROBAR",
            "razon": "OK",
        })
        llm = mock_llm([decidir_resp, critique_resp])
        agent = self._make_agent(mock_worker, llm)

        agent.run({
            "ca": {"descripcion": "Notebooks", "presupuesto": 200000},
            "precio_mercado": 80000,
            "confianza_precio": 4,
        })

        assert len(mock_worker.decisions_saved) == 1
        assert mock_worker.decisions_saved[0]["type"] == "OFERTAR"
