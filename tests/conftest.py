"""Shared fixtures for SRP agent tests."""

import pytest


class MockWorker:
    """Mock worker that records messages and decisions."""

    def __init__(self):
        self.messages = []
        self.decisions_saved = []

    def send_message(self, to, payload):
        self.messages.append({"to": to, "payload": payload})

    def save_decision(self, record):
        self.decisions_saved.append(record)


class MockLLM:
    """Mock LLM client that returns pre-configured responses."""

    def __init__(self, responses=None):
        self.responses = responses or []
        self.call_count = 0
        self.calls = []

    def chat(self, system_prompt, user_msg, temperature=0.2):
        self.calls.append({
            "system_prompt": system_prompt,
            "user_msg": user_msg,
            "temperature": temperature,
        })
        if self.call_count < len(self.responses):
            resp = self.responses[self.call_count]
            self.call_count += 1
            if isinstance(resp, Exception):
                raise resp
            return resp
        raise RuntimeError("No more mock responses configured")


@pytest.fixture
def mock_worker():
    return MockWorker()


@pytest.fixture
def mock_llm():
    """Factory fixture: call with list of responses."""
    def _factory(responses):
        return MockLLM(responses)
    return _factory


@pytest.fixture
def sample_ca():
    return {
        "id": "CA-2024-001",
        "descripcion": "Adquisición de 10 notebooks Dell Latitude 5540 para el área de sistemas",
        "organismo": "Ministerio de Educación",
        "presupuesto": 5000000,
    }


@pytest.fixture
def sample_ca_servicios():
    return {
        "id": "CA-2024-002",
        "descripcion": "Contratación de servicio de limpieza integral para edificio central",
        "organismo": "Secretaría de Salud",
        "presupuesto": 1200000,
    }
