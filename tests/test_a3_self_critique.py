"""Tests for A3 Precios self-critique functionality."""

import json
import pytest

from agents.a3_precios import A3Precios


class TestA3SelfCritique:
    """Tests for A3 self-critique second LLM pass."""

    def _make_agent(self, mock_worker, llm, resultados_busqueda=None):
        agent = A3Precios(worker=mock_worker, llm_client=llm)
        # Inject search results
        if resultados_busqueda is not None:
            agent._buscar_precios = lambda kw: resultados_busqueda
        return agent

    def test_self_critique_approves_reliable_price(self, mock_worker, mock_llm, sample_ca):
        """Self-critique approves a reliable price → no changes."""
        evaluar_resp = json.dumps({
            "precio_unitario": 85000,
            "fuente": "MercadoLibre",
            "match_score": 4,
            "confianza": 4,
            "razon": "Precio consistente en múltiples fuentes",
        })
        critique_resp = json.dumps({
            "aprobado": True,
            "accion": "APROBAR",
            "razon": "Precio razonable",
        })
        llm = mock_llm([evaluar_resp, critique_resp])
        resultados = [{"precio": 85000, "fuente": "MercadoLibre"}]
        agent = self._make_agent(mock_worker, llm, resultados)

        result = agent.run({
            "ca": sample_ca,
            "clasificacion": {"keywords": ["notebook", "dell"]},
        })

        assert result["confianza"] == 4
        assert result["precio_unitario"] == 85000
        assert llm.call_count == 2

    def test_self_critique_lowers_confidence(self, mock_worker, mock_llm, sample_ca):
        """Self-critique lowers confidence for low match_score → confidence reduced."""
        evaluar_resp = json.dumps({
            "precio_unitario": 50000,
            "fuente": "CompraNet",
            "match_score": 2,
            "confianza": 4,
            "razon": "Precio encontrado",
        })
        critique_resp = json.dumps({
            "aprobado": False,
            "accion": "BAJAR_CONFIANZA",
            "razon": "Match score bajo, posible producto diferente",
            "confianza_ajustada": 2,
        })
        llm = mock_llm([evaluar_resp, critique_resp])
        resultados = [{"precio": 50000, "fuente": "CompraNet"}]
        agent = self._make_agent(mock_worker, llm, resultados)

        result = agent.run({
            "ca": sample_ca,
            "clasificacion": {"keywords": ["notebook", "dell"]},
        })

        assert result["confianza"] == 2
        assert "self_critique" in result

    def test_self_critique_discards_unreliable(self, mock_worker, mock_llm, sample_ca):
        """Self-critique discards unreliable result → confidence=1."""
        evaluar_resp = json.dumps({
            "precio_unitario": 200000,
            "fuente": "sitio_dudoso",
            "match_score": 1,
            "confianza": 3,
            "razon": "Único resultado",
        })
        critique_resp = json.dumps({
            "aprobado": False,
            "accion": "DESCARTAR",
            "razon": "Fuente no confiable y match_score muy bajo",
        })
        llm = mock_llm([evaluar_resp, critique_resp])
        resultados = [{"precio": 200000, "fuente": "sitio_dudoso"}]
        agent = self._make_agent(mock_worker, llm, resultados)

        result = agent.run({
            "ca": sample_ca,
            "clasificacion": {"keywords": ["notebook", "dell"]},
        })

        assert result["confianza"] == 1
        assert "self_critique" in result

    def test_graceful_degradation_on_llm_failure(self, mock_worker, mock_llm, sample_ca):
        """LLM fails on self-critique → original result passes."""
        evaluar_resp = json.dumps({
            "precio_unitario": 85000,
            "fuente": "MercadoLibre",
            "match_score": 4,
            "confianza": 4,
            "razon": "Precio consistente",
        })
        llm = mock_llm([evaluar_resp, RuntimeError("LLM timeout")])
        resultados = [{"precio": 85000, "fuente": "MercadoLibre"}]
        agent = self._make_agent(mock_worker, llm, resultados)

        result = agent.run({
            "ca": sample_ca,
            "clasificacion": {"keywords": ["notebook", "dell"]},
        })

        assert result["confianza"] == 4
        assert result["precio_unitario"] == 85000

    def test_no_results_skips_self_critique(self, mock_worker, mock_llm, sample_ca):
        """No search results → self-critique is NOT called."""
        llm = mock_llm([])  # No LLM calls needed
        agent = self._make_agent(mock_worker, llm, resultados_busqueda=[])

        result = agent.run({
            "ca": sample_ca,
            "clasificacion": {"keywords": ["notebook", "dell"]},
        })

        assert result["confianza"] == 1
        assert result["precio_unitario"] == 0
        assert llm.call_count == 0  # No LLM calls at all
