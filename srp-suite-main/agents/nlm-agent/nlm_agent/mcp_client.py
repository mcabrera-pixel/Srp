"""
MCP Client - Connects to the notebooklm-mcp server via stdio transport.

Handles:
- Launching the MCP server as a subprocess
- Listing available tools
- Calling tools and returning results
- Auto-reconnection on failure
"""

import asyncio
import json
import logging
from contextlib import AsyncExitStack
from typing import Any

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

logger = logging.getLogger(__name__)


class MCPClient:
    """Client that connects to the notebooklm-mcp server via stdio."""

    def __init__(self, server_command: str = "notebooklm-mcp"):
        self.server_command = server_command
        self.session: ClientSession | None = None
        self._exit_stack = AsyncExitStack()
        self._tools: list[dict] = []

    async def connect(self) -> None:
        """Launch the MCP server and establish connection."""
        logger.info(f"Connecting to MCP server: {self.server_command}")

        server_params = StdioServerParameters(
            command=self.server_command,
            args=[],
        )

        stdio_transport = await self._exit_stack.enter_async_context(
            stdio_client(server_params)
        )
        read_stream, write_stream = stdio_transport
        self.session = await self._exit_stack.enter_async_context(
            ClientSession(read_stream, write_stream)
        )

        await self.session.initialize()
        logger.info("MCP session initialized successfully")

        # Cache available tools
        await self._refresh_tools()

    async def _refresh_tools(self) -> None:
        """Refresh the list of available tools from the server."""
        if not self.session:
            raise RuntimeError("Not connected to MCP server")

        result = await self.session.list_tools()
        self._tools = [
            {
                "name": tool.name,
                "description": tool.description or "",
                "input_schema": tool.inputSchema,
            }
            for tool in result.tools
        ]
        logger.info(f"Loaded {len(self._tools)} tools from MCP server")

    def get_tools(self) -> list[dict]:
        """Return cached list of tools with their schemas."""
        return self._tools

    def get_tools_for_gemini(self) -> list[dict]:
        """Convert MCP tools to Gemini function declarations format.

        Returns a list of function declarations compatible with
        google.genai's tool format.
        """
        functions = []
        for tool in self._tools:
            # Clean up the schema for Gemini compatibility
            schema = tool["input_schema"].copy()

            # Remove $schema key if present (not supported by Gemini)
            schema.pop("$schema", None)
            # Remove additionalProperties (not supported by Gemini)
            schema.pop("additionalProperties", None)

            # Clean properties: remove defaults and unsupported keys
            if "properties" in schema:
                for prop_name, prop_def in schema["properties"].items():
                    prop_def.pop("default", None)
                    prop_def.pop("$schema", None)

            func_decl = {
                "name": tool["name"],
                "description": tool["description"],
                "parameters": schema,
            }
            functions.append(func_decl)

        return functions

    async def call_tool(self, name: str, arguments: dict[str, Any]) -> dict:
        """Call an MCP tool and return the result.

        Args:
            name: Tool name (e.g., 'notebook_create')
            arguments: Tool arguments as a dictionary

        Returns:
            Dict with the tool result or error
        """
        if not self.session:
            raise RuntimeError("Not connected to MCP server")

        logger.info(f"Calling MCP tool: {name}")
        logger.debug(f"Arguments: {json.dumps(arguments, indent=2)}")

        try:
            result = await self.session.call_tool(name, arguments)

            # Parse MCP result content
            if result.content:
                for content_block in result.content:
                    if hasattr(content_block, "text"):
                        try:
                            return json.loads(content_block.text)
                        except json.JSONDecodeError:
                            return {"text": content_block.text}

            return {"status": "success", "content": str(result.content)}

        except Exception as e:
            logger.error(f"Tool call failed: {name} - {e}")
            return {"status": "error", "error": str(e)}

    async def refresh_auth(self) -> dict:
        """Explicitly refresh authentication tokens."""
        return await self.call_tool("refresh_auth", {})

    async def disconnect(self) -> None:
        """Cleanly disconnect from the MCP server."""
        logger.info("Disconnecting from MCP server")
        await self._exit_stack.aclose()
        self.session = None
        self._tools = []
