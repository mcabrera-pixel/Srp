"""Base agent class with common functionality."""

import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class BaseAgent:
    """Base class for all SRP agents."""

    def __init__(self, worker=None, llm_client=None, agent_id=None):
        self.worker = worker
        self.llm = llm_client
        self.agent_id = agent_id or self.__class__.__name__
        self.decisions = []

    def send_message(self, to, payload):
        """Send message to another agent via worker."""
        if self.worker:
            self.worker.send_message(to, payload)

    def save_decision(self, decision_type, data):
        """Save a decision record."""
        record = {
            "agent": self.agent_id,
            "type": decision_type,
            "timestamp": datetime.now().isoformat(),
            "data": data,
        }
        self.decisions.append(record)
        if self.worker and hasattr(self.worker, "save_decision"):
            self.worker.save_decision(record)
        return record

    def reflect_on_result(self, result):
        """Feedback loop: reflect on downstream result."""
        self._ratchet(result)

    def _ratchet(self, result):
        """Adjust internal state based on feedback."""
        pass

    def _llm_call(self, system_prompt, user_msg, temperature=0.2):
        """Make an LLM call and return the response text."""
        if not self.llm:
            raise RuntimeError("No LLM client configured")
        return self.llm.chat(system_prompt, user_msg, temperature=temperature)

    def run(self, message):
        """Process an incoming message. Override in subclasses."""
        raise NotImplementedError
