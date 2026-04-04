"""
Gemini Agent - LLM integration with function calling for MCP tools.

Uses the google-genai SDK to send prompts to Gemini and execute
MCP tool calls in a loop until the task is complete.
"""

import asyncio
import json
import logging
from typing import Any

from google import genai
from google.genai import types

from .mcp_client import MCPClient

logger = logging.getLogger(__name__)

# System prompt that defines the agent's behavior
SYSTEM_PROMPT = """You are an autonomous NotebookLM content generation agent.
Your job is to process documents and generate training content using NotebookLM.

You have access to NotebookLM tools via MCP. Follow this workflow:

1. Create a notebook with a descriptive title
2. Add the provided document as a text source
3. Generate the requested content (video, audio, report, etc.)
4. Check generation status until complete
5. Download the generated content
6. Report the result

Important rules:
- Always use confirm=True for generation/delete operations
- Wait between operations (the system handles rate limiting)
- For videos, use visual_style="whiteboard" and language="es" by default
- For audio, use language="es" by default
- Report errors clearly if something fails
- Keep responses concise and action-oriented
"""


class GeminiAgent:
    """Agent that uses Gemini API with MCP tools for NotebookLM automation."""

    def __init__(
        self,
        api_key: str,
        mcp_client: MCPClient,
        model: str = "gemini-2.0-flash",
    ):
        self.client = genai.Client(api_key=api_key)
        self.model = model
        self.mcp = mcp_client
        self._tools_config = None

    def _build_tools_config(self) -> list[types.Tool]:
        """Build Gemini tools configuration from MCP tools."""
        mcp_functions = self.mcp.get_tools_for_gemini()

        function_declarations = []
        for func in mcp_functions:
            fd = types.FunctionDeclaration(
                name=func["name"],
                description=func["description"],
                parameters=func.get("parameters"),
            )
            function_declarations.append(fd)

        return [types.Tool(function_declarations=function_declarations)]

    async def execute_task(
        self,
        task_prompt: str,
        max_turns: int = 20,
        on_step: callable | None = None,
    ) -> dict:
        """Execute a task using Gemini with MCP tool calling.

        Args:
            task_prompt: The task description for Gemini
            max_turns: Maximum number of tool-calling turns
            on_step: Optional callback for each step (for logging/monitoring)

        Returns:
            Dict with task result, steps taken, and final response
        """
        tools = self._build_tools_config()
        steps: list[dict] = []

        logger.info(f"Starting task execution (max {max_turns} turns)")
        logger.debug(f"Task: {task_prompt}")

        # Build initial messages
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=task_prompt)],
            )
        ]

        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            tools=tools,
            temperature=0.1,  # Low temperature for consistent tool use
        )

        for turn in range(max_turns):
            logger.info(f"Turn {turn + 1}/{max_turns}")

            # Call Gemini
            response = self.client.models.generate_content(
                model=self.model,
                contents=contents,
                config=config,
            )

            # Check if Gemini wants to call functions
            candidate = response.candidates[0]
            parts = candidate.content.parts

            has_function_calls = any(
                hasattr(p, "function_call") and p.function_call
                for p in parts
            )

            if not has_function_calls:
                # Gemini is done - extract final text response
                final_text = ""
                for part in parts:
                    if hasattr(part, "text") and part.text:
                        final_text += part.text

                logger.info(f"Task complete after {turn + 1} turns")
                return {
                    "status": "completed",
                    "turns": turn + 1,
                    "steps": steps,
                    "final_response": final_text,
                }

            # Process function calls
            contents.append(candidate.content)

            function_response_parts = []
            for part in parts:
                if not (hasattr(part, "function_call") and part.function_call):
                    continue

                fc = part.function_call
                tool_name = fc.name
                tool_args = dict(fc.args) if fc.args else {}

                step = {
                    "turn": turn + 1,
                    "tool": tool_name,
                    "args": tool_args,
                }

                logger.info(f"  → Calling tool: {tool_name}")

                # Execute MCP tool call
                try:
                    result = await self.mcp.call_tool(tool_name, tool_args)
                    step["result"] = result
                    step["success"] = True
                except Exception as e:
                    result = {"error": str(e)}
                    step["result"] = result
                    step["success"] = False
                    logger.error(f"  ✗ Tool error: {e}")

                steps.append(step)

                if on_step:
                    on_step(step)

                # Build function response part
                function_response_parts.append(
                    types.Part.from_function_response(
                        name=tool_name,
                        response=result,
                    )
                )

                # Rate limiting: wait between tool calls
                await asyncio.sleep(2)

            # Add all function responses to conversation
            contents.append(
                types.Content(
                    role="user",
                    parts=function_response_parts,
                )
            )

        logger.warning(f"Task hit max turns ({max_turns})")
        return {
            "status": "max_turns_reached",
            "turns": max_turns,
            "steps": steps,
            "final_response": "Maximum turns reached without completion.",
        }
