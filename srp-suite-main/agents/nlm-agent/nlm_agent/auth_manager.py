"""
Auth Manager - Handles NotebookLM authentication refresh.

Periodically refreshes auth tokens to keep the MCP session alive.
Uses the 3-layer recovery system built into notebooklm-mcp:
  1. CSRF token refresh
  2. Cookie disk reload
  3. Headless Chrome re-authentication
"""

import asyncio
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


class AuthManager:
    """Manages authentication lifecycle for the MCP server."""

    def __init__(self, mcp_client, refresh_interval: int = 900):
        """
        Args:
            mcp_client: MCPClient instance
            refresh_interval: Seconds between auth refreshes (default: 15 min)
        """
        self.mcp = mcp_client
        self.refresh_interval = refresh_interval
        self._task: asyncio.Task | None = None
        self.last_refresh: datetime | None = None
        self.consecutive_failures = 0
        self.max_failures = 5

    async def start(self) -> None:
        """Start the periodic auth refresh loop."""
        self._task = asyncio.create_task(self._refresh_loop())
        logger.info(
            f"Auth manager started (refresh every {self.refresh_interval}s)"
        )

    async def stop(self) -> None:
        """Stop the auth refresh loop."""
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("Auth manager stopped")

    async def _refresh_loop(self) -> None:
        """Periodic refresh loop."""
        while True:
            try:
                await asyncio.sleep(self.refresh_interval)
                await self.refresh()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Auth refresh loop error: {e}")
                await asyncio.sleep(30)  # Wait before retrying

    async def refresh(self) -> bool:
        """Execute a single auth refresh.

        Returns:
            True if refresh succeeded, False otherwise
        """
        try:
            result = await self.mcp.refresh_auth()
            success = result.get("status") == "success"

            if success:
                self.last_refresh = datetime.now(timezone.utc)
                self.consecutive_failures = 0
                logger.info(f"Auth refreshed successfully at {self.last_refresh}")
            else:
                self.consecutive_failures += 1
                logger.warning(
                    f"Auth refresh returned non-success: {result} "
                    f"(failure {self.consecutive_failures}/{self.max_failures})"
                )

            return success

        except Exception as e:
            self.consecutive_failures += 1
            logger.error(
                f"Auth refresh failed: {e} "
                f"(failure {self.consecutive_failures}/{self.max_failures})"
            )
            return False

    def is_healthy(self) -> bool:
        """Check if auth is considered healthy."""
        return self.consecutive_failures < self.max_failures

    def get_status(self) -> dict:
        """Get current auth status."""
        return {
            "healthy": self.is_healthy(),
            "last_refresh": (
                self.last_refresh.isoformat() if self.last_refresh else None
            ),
            "consecutive_failures": self.consecutive_failures,
            "refresh_interval": self.refresh_interval,
        }
