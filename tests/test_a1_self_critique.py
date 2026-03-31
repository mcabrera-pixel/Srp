"""Tests for A1 Categorizador self-critique functionality."""

import json
import pytest

from agents.a1_categorizador import A1Categorizador


class TestA1SelfCritique:
    """Tests for A1 self-critique second LLM pass."""

    def _make_agent(self, mock_worker, llm):
        return A1Categorizador(worker=mock_worker, llm_client=llm)

    def test_self_critique_approves_correct_classification(self, mock_worker, mock_llm, sample_ca):
        """Self-critique approves a correct classification → no changes."""
        clasificar_resp = json.dumps({
            "categoria": "tecnologia",
            "categoria_secundaria": None,
            "keywords": ["notebook", "dell", "latitude 5540"],
            "confianza": 4,
            "razon": "Notebooks Dell son tecnología",
        })
        critique_resp = json.dumps({
            "aprobado": True,
            "accion": "APROBAR",
            "razon": "Clasificación correcta",
        })
        llm = mock_llm([clasificar_resp, critique_resp])
        agent = self._make_agent(mock_worker, llm)

        result = agent.run({"ca": sample_ca})

        assert result["categoria"] == "tecnologia"
        assert result["keywords"] == ["notebook", "dell", "latitude 5540"]
        assert llm.call_count == 2  # clasificar + self-critique

    def test_self_critique_adjusts_wrong_category(self, mock_worker, mock_llm, sample_ca):
        """Self-critique detects wrong category → adjusts to correct one."""
        clasificar_resp = json.dumps({
            "categoria": "oficina",
            "keywords": ["notebook"],
            "confianza": 3,
            "razon": "Equipamiento de oficina",
        })
        critique_resp = json.dumps({
            "aprobado": False,
            "accion": "AJUSTAR",
            "razon": "Notebooks son tecnología, no oficina",
            "categoria_ajustada": "tecnologia",
            "keywords_ajustados": None,
        })
        llm = mock_llm([clasificar_resp, critique_resp])
        agent = self._make_agent(mock_worker, llm)

        result = agent.run({"ca": sample_ca})

        assert result["categoria"] == "tecnologia"
        assert "self_critique" in result

    def test_self_critique_improves_generic_keywords(self, mock_worker, mock_llm, sample_ca):
        """Self-critique detects generic keywords → provides specific ones."""
        clasificar_resp = json.dumps({
            "categoria": "tecnologia",
            "keywords": ["computadora"],
            "confianza": 3,
            "razon": "Equipamiento IT",
        })
        critique_resp = json.dumps({
            "aprobado": False,
            "accion": "AJUSTAR",
            "razon": "Keywords demasiado genéricos",
            "categoria_ajustada": None,
            "keywords_ajustados": ["notebook", "dell", "latitude 5540"],
        })
        llm = mock_llm([clasificar_resp, critique_resp])
        agent = self._make_agent(mock_worker, llm)

        result = agent.run({"ca": sample_ca})

        assert result["categoria"] == "tecnologia"
        assert "dell" in result["keywords"]
        assert "latitude 5540" in result["keywords"]

    def test_invalid_adjusted_category_ignored(self, mock_worker, mock_llm, sample_ca):
        """Self-critique suggests invalid category → adjustment ignored, original passes."""
        clasificar_resp = json.dumps({
            "categoria": "tecnologia",
            "keywords": ["notebook"],
            "confianza": 3,
            "razon": "IT",
        })
        critique_resp = json.dumps({
            "aprobado": False,
            "accion": "AJUSTAR",
            "razon": "Debería ser electrónica",
            "categoria_ajustada": "electronica",  # NOT in CATEGORIAS_MCCO
            "keywords_ajustados": None,
        })
        llm = mock_llm([clasificar_resp, critique_resp])
        agent = self._make_agent(mock_worker, llm)

        result = agent.run({"ca": sample_ca})

        # Invalid category rejected, original "tecnologia" kept
        assert result["categoria"] == "tecnologia"

    def test_graceful_degradation_on_llm_failure(self, mock_worker, mock_llm, sample_ca):
        """LLM fails on self-critique → original classification passes."""
        clasificar_resp = json.dumps({
            "categoria": "tecnologia",
            "keywords": ["notebook", "dell"],
            "confianza": 3,
            "razon": "IT",
        })
        llm = mock_llm([clasificar_resp, RuntimeError("LLM timeout")])
        agent = self._make_agent(mock_worker, llm)

        result = agent.run({"ca": sample_ca})

        assert result["categoria"] == "tecnologia"
        assert result["keywords"] == ["notebook", "dell"]

    def test_high_confidence_skips_self_critique(self, mock_worker, mock_llm, sample_ca):
        """Confidence = 5 → self-critique is NOT called (save tokens)."""
        clasificar_resp = json.dumps({
            "categoria": "tecnologia",
            "keywords": ["notebook", "dell", "latitude"],
            "confianza": 5,
            "razon": "Muy claro",
        })
        llm = mock_llm([clasificar_resp])
        agent = self._make_agent(mock_worker, llm)

        result = agent.run({"ca": sample_ca})

        assert result["categoria"] == "tecnologia"
        assert llm.call_count == 1  # Only classification, no self-critique
