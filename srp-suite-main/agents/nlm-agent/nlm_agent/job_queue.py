"""
Job Queue - SQLite-based job queue for processing documents.

Jobs flow through states: pending → processing → completed/failed

Each job represents a document that needs to be turned into
NotebookLM content (video, audio, report, etc.).
"""

import json
import logging
import sqlite3
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class JobQueue:
    """SQLite-backed job queue for document processing tasks."""

    def __init__(self, db_path: str = "jobs.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self) -> None:
        """Initialize the database schema."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS jobs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    document_path TEXT NOT NULL,
                    content_type TEXT NOT NULL DEFAULT 'video',
                    options TEXT DEFAULT '{}',
                    status TEXT NOT NULL DEFAULT 'pending',
                    result TEXT,
                    error TEXT,
                    notebook_id TEXT,
                    artifact_id TEXT,
                    created_at TEXT NOT NULL,
                    started_at TEXT,
                    completed_at TEXT,
                    retries INTEGER DEFAULT 0,
                    max_retries INTEGER DEFAULT 3
                )
            """)
            conn.commit()
        logger.info(f"Job queue initialized: {self.db_path}")

    def add_job(
        self,
        title: str,
        document_path: str,
        content_type: str = "video",
        options: dict | None = None,
    ) -> int:
        """Add a new job to the queue.

        Args:
            title: Job title / notebook name
            document_path: Path to the .md document
            content_type: Type of content to generate (video, audio, report, etc.)
            options: Additional options (visual_style, language, etc.)

        Returns:
            Job ID
        """
        now = datetime.now(timezone.utc).isoformat()
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                """INSERT INTO jobs (title, document_path, content_type, options, status, created_at)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (
                    title,
                    document_path,
                    content_type,
                    json.dumps(options or {}),
                    JobStatus.PENDING,
                    now,
                ),
            )
            conn.commit()
            job_id = cursor.lastrowid

        logger.info(f"Added job #{job_id}: {title} ({content_type})")
        return job_id

    def get_next_pending(self) -> dict | None:
        """Get the next pending job, ordered by creation time.

        Returns:
            Job dict or None if no pending jobs
        """
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute(
                """SELECT * FROM jobs
                   WHERE status = ?
                   ORDER BY created_at ASC
                   LIMIT 1""",
                (JobStatus.PENDING,),
            ).fetchone()

        if row:
            return dict(row)
        return None

    def mark_processing(self, job_id: int) -> None:
        """Mark a job as currently being processed."""
        now = datetime.now(timezone.utc).isoformat()
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                """UPDATE jobs SET status = ?, started_at = ?
                   WHERE id = ?""",
                (JobStatus.PROCESSING, now, job_id),
            )
            conn.commit()

    def mark_completed(
        self,
        job_id: int,
        result: dict | None = None,
        notebook_id: str | None = None,
        artifact_id: str | None = None,
    ) -> None:
        """Mark a job as completed successfully."""
        now = datetime.now(timezone.utc).isoformat()
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                """UPDATE jobs
                   SET status = ?, completed_at = ?, result = ?,
                       notebook_id = ?, artifact_id = ?
                   WHERE id = ?""",
                (
                    JobStatus.COMPLETED,
                    now,
                    json.dumps(result or {}),
                    notebook_id,
                    artifact_id,
                    job_id,
                ),
            )
            conn.commit()
        logger.info(f"Job #{job_id} completed")

    def mark_failed(self, job_id: int, error: str) -> None:
        """Mark a job as failed. If retries remain, set back to pending."""
        now = datetime.now(timezone.utc).isoformat()
        with sqlite3.connect(self.db_path) as conn:
            job = conn.execute(
                "SELECT retries, max_retries FROM jobs WHERE id = ?",
                (job_id,),
            ).fetchone()

            if job and job[0] < job[1]:
                # Retry available
                conn.execute(
                    """UPDATE jobs
                       SET status = ?, retries = retries + 1, error = ?
                       WHERE id = ?""",
                    (JobStatus.PENDING, error, job_id),
                )
                logger.warning(
                    f"Job #{job_id} failed, retry {job[0] + 1}/{job[1]}: {error}"
                )
            else:
                # Max retries reached
                conn.execute(
                    """UPDATE jobs
                       SET status = ?, completed_at = ?, error = ?
                       WHERE id = ?""",
                    (JobStatus.FAILED, now, error, job_id),
                )
                logger.error(f"Job #{job_id} permanently failed: {error}")

            conn.commit()

    def get_stats(self) -> dict:
        """Get queue statistics."""
        with sqlite3.connect(self.db_path) as conn:
            stats = {}
            for status in JobStatus:
                count = conn.execute(
                    "SELECT COUNT(*) FROM jobs WHERE status = ?",
                    (status,),
                ).fetchone()[0]
                stats[status.value] = count
            stats["total"] = sum(stats.values())
        return stats

    def list_jobs(
        self, status: JobStatus | None = None, limit: int = 50
    ) -> list[dict]:
        """List jobs, optionally filtered by status."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            if status:
                rows = conn.execute(
                    """SELECT * FROM jobs WHERE status = ?
                       ORDER BY created_at DESC LIMIT ?""",
                    (status, limit),
                ).fetchall()
            else:
                rows = conn.execute(
                    "SELECT * FROM jobs ORDER BY created_at DESC LIMIT ?",
                    (limit,),
                ).fetchall()
        return [dict(r) for r in rows]
