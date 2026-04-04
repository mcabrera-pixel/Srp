"""
Main Entry Point - NLM Agent daemon.

Orchestrates the full pipeline:
1. Connect to MCP server
2. Start auth manager
3. Process jobs from queue in a loop
4. Handle graceful shutdown
"""

import asyncio
import logging
import os
import signal
import sys
from pathlib import Path

from dotenv import load_dotenv

from .auth_manager import AuthManager
from .gemini_agent import GeminiAgent
from .job_queue import JobQueue
from .mcp_client import MCPClient

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO")),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("nlm-agent.log", encoding="utf-8"),
    ],
)
logger = logging.getLogger("nlm-agent")


class NLMAgentDaemon:
    """Main daemon that runs the NLM agent continuously."""

    def __init__(self):
        # Configuration
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
        self.mcp_command = os.getenv("NLM_MCP_COMMAND", "notebooklm-mcp")
        self.job_interval = int(os.getenv("JOB_INTERVAL", "60"))
        self.auth_interval = int(os.getenv("AUTH_REFRESH_INTERVAL", "900"))
        self.input_dir = Path(os.getenv("DOCS_INPUT_DIR", "./input"))
        self.output_dir = Path(os.getenv("OUTPUT_DIR", "./output"))

        # Components
        self.mcp = MCPClient(self.mcp_command)
        self.queue = JobQueue()
        self.agent: GeminiAgent | None = None
        self.auth_mgr: AuthManager | None = None

        # State
        self._running = False
        self._shutdown_event = asyncio.Event()

    async def start(self) -> None:
        """Initialize and start the agent daemon."""
        logger.info("=" * 60)
        logger.info("NLM Agent v0.1.0 starting...")
        logger.info("=" * 60)

        if not self.api_key:
            logger.error("GEMINI_API_KEY not set. Please configure .env")
            sys.exit(1)

        # Create directories
        self.input_dir.mkdir(parents=True, exist_ok=True)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Connect to MCP
        logger.info("Connecting to NotebookLM MCP server...")
        await self.mcp.connect()
        tools = self.mcp.get_tools()
        logger.info(f"Connected! {len(tools)} tools available")

        # Initialize Gemini agent
        self.agent = GeminiAgent(self.api_key, self.mcp, self.model)
        logger.info(f"Gemini agent ready (model: {self.model})")

        # Start auth manager
        self.auth_mgr = AuthManager(self.mcp, self.auth_interval)
        await self.auth_mgr.start()

        # Scan input directory for new documents
        self._scan_input_dir()

        # Start processing loop
        self._running = True
        logger.info(
            f"Agent daemon started. Polling every {self.job_interval}s"
        )
        logger.info(f"Input dir: {self.input_dir.resolve()}")
        logger.info(f"Output dir: {self.output_dir.resolve()}")
        logger.info(f"Queue stats: {self.queue.get_stats()}")

        await self._process_loop()

    async def _process_loop(self) -> None:
        """Main processing loop - pick up jobs and execute them."""
        while self._running:
            try:
                # Check auth health
                if not self.auth_mgr.is_healthy():
                    logger.error(
                        "Auth is unhealthy! Pausing processing. "
                        "Run 'nlm login' to re-authenticate."
                    )
                    await asyncio.sleep(60)
                    continue

                # Scan for new documents
                self._scan_input_dir()

                # Get next job
                job = self.queue.get_next_pending()
                if not job:
                    logger.debug("No pending jobs. Waiting...")
                    await asyncio.sleep(self.job_interval)
                    continue

                # Process the job
                await self._process_job(job)

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Process loop error: {e}", exc_info=True)
                await asyncio.sleep(30)

    async def _process_job(self, job: dict) -> None:
        """Process a single job from the queue."""
        job_id = job["id"]
        title = job["title"]
        doc_path = job["document_path"]
        content_type = job["content_type"]

        logger.info(f"Processing job #{job_id}: {title} ({content_type})")
        self.queue.mark_processing(job_id)

        try:
            # Read the document
            doc_content = Path(doc_path).read_text(encoding="utf-8")

            # Build the task prompt for Gemini
            task_prompt = self._build_task_prompt(
                title, doc_content, content_type, job
            )

            # Execute via Gemini agent
            result = await self.agent.execute_task(
                task_prompt,
                max_turns=25,
                on_step=lambda step: logger.info(
                    f"  Job #{job_id} step: {step['tool']} "
                    f"{'✓' if step.get('success') else '✗'}"
                ),
            )

            if result["status"] == "completed":
                self.queue.mark_completed(job_id, result)
                logger.info(
                    f"Job #{job_id} completed in {result['turns']} turns"
                )
            else:
                self.queue.mark_failed(
                    job_id, f"Agent returned: {result['status']}"
                )

        except Exception as e:
            logger.error(f"Job #{job_id} failed: {e}", exc_info=True)
            self.queue.mark_failed(job_id, str(e))

    def _build_task_prompt(
        self,
        title: str,
        doc_content: str,
        content_type: str,
        job: dict,
    ) -> str:
        """Build the task prompt for Gemini based on job type."""
        options = job.get("options", "{}")
        if isinstance(options, str):
            import json
            options = json.loads(options)

        visual_style = options.get("visual_style", "whiteboard")
        language = options.get("language", "es")

        base = f"""Process the following document and generate a {content_type} in NotebookLM.

**Title:** {title}
**Content type to generate:** {content_type}
**Language:** {language}

**Steps:**
1. Create a new notebook titled "{title}"
2. Add the document below as a TEXT source (use source_type="text")
3. Generate a {content_type} with confirm=True"""

        if content_type == "video":
            base += f"""
   - Use artifact_type="video"
   - Use visual_style="{visual_style}"
   - Use language="{language}"
   - Use video_format="explainer"
   - Use a focus_prompt summarizing what the document is about"""
        elif content_type == "audio":
            base += f"""
   - Use artifact_type="audio"
   - Use audio_format="deep_dive"
   - Use language="{language}" """
        elif content_type == "report":
            base += """
   - Use artifact_type="report"
   - Use report_format="Briefing Doc" """

        base += """
4. Check studio_status to confirm generation started
5. Report back with the notebook_id and artifact status

**DOCUMENT CONTENT:**

"""
        base += doc_content[:50000]  # Limit document size for context window
        return base

    def _scan_input_dir(self) -> None:
        """Scan input directory for new .md files and add them as jobs."""
        if not self.input_dir.exists():
            return

        existing_paths = {
            job["document_path"]
            for job in self.queue.list_jobs(limit=1000)
        }

        for md_file in self.input_dir.glob("*.md"):
            str_path = str(md_file.resolve())
            if str_path not in existing_paths:
                title = md_file.stem.replace("_", " ").title()
                self.queue.add_job(
                    title=title,
                    document_path=str_path,
                    content_type="video",
                    options={"visual_style": "whiteboard", "language": "es"},
                )
                logger.info(f"New document queued: {md_file.name}")

    async def shutdown(self) -> None:
        """Graceful shutdown."""
        logger.info("Shutting down NLM Agent...")
        self._running = False

        if self.auth_mgr:
            await self.auth_mgr.stop()

        await self.mcp.disconnect()
        logger.info("NLM Agent stopped")


def main():
    """Entry point for the nlm-agent command."""
    daemon = NLMAgentDaemon()

    loop = asyncio.new_event_loop()

    # Handle shutdown signals
    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(
                sig, lambda: asyncio.ensure_future(daemon.shutdown())
            )
        except NotImplementedError:
            # Windows doesn't support add_signal_handler
            pass

    try:
        loop.run_until_complete(daemon.start())
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received")
        loop.run_until_complete(daemon.shutdown())
    finally:
        loop.close()


if __name__ == "__main__":
    main()
