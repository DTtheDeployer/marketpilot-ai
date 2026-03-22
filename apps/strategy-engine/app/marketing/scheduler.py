"""
MarketPilot AI — Marketing Content Scheduler
=============================================
Background task that runs daily content generation at a configurable
time (default 10:00 UTC / 6am EST), similar to the weather arb scanner.
"""

from __future__ import annotations

import asyncio
import logging
import os
from datetime import datetime, timezone, timedelta
from typing import Optional

logger = logging.getLogger(__name__)


class MarketingScheduler:
    """
    Runs ContentAgent.run_daily() on a daily schedule as an asyncio
    background task. Tracks last run time to prevent double-runs.
    """

    def __init__(
        self,
        run_hour_utc: int = 10,
        run_minute_utc: int = 0,
    ):
        # Configurable from env
        self._run_hour = int(os.getenv("MARKETING_RUN_HOUR_UTC", str(run_hour_utc)))
        self._run_minute = int(os.getenv("MARKETING_RUN_MINUTE_UTC", str(run_minute_utc)))

        self._running = False
        self._task: Optional[asyncio.Task] = None
        self._last_run_at: Optional[datetime] = None
        self._last_error: Optional[str] = None
        self._consecutive_errors = 0
        self._content_agent = None

    def _get_content_agent(self):
        """Lazily create the ContentAgent."""
        if self._content_agent is None:
            from app.marketing.content_agent import ContentAgent
            self._content_agent = ContentAgent()
        return self._content_agent

    # ------------------------------------------------------------------ #
    #  Scheduling logic                                                   #
    # ------------------------------------------------------------------ #

    def _seconds_until_next_run(self) -> float:
        """Calculate seconds until the next scheduled run time."""
        now = datetime.now(timezone.utc)
        target = now.replace(
            hour=self._run_hour,
            minute=self._run_minute,
            second=0,
            microsecond=0,
        )

        # If we've already passed today's run time, schedule for tomorrow
        if now >= target:
            target += timedelta(days=1)

        delta = (target - now).total_seconds()
        return max(delta, 0)

    def _already_ran_today(self) -> bool:
        """Check if we already ran today to prevent double-runs."""
        if self._last_run_at is None:
            return False
        now = datetime.now(timezone.utc)
        return self._last_run_at.date() == now.date()

    @property
    def next_run_at(self) -> Optional[datetime]:
        """Calculate the next scheduled run time."""
        if not self._running:
            return None
        now = datetime.now(timezone.utc)
        target = now.replace(
            hour=self._run_hour,
            minute=self._run_minute,
            second=0,
            microsecond=0,
        )
        if now >= target:
            target += timedelta(days=1)
        return target

    # ------------------------------------------------------------------ #
    #  Background loop                                                    #
    # ------------------------------------------------------------------ #

    async def _run_loop(self) -> None:
        """Background loop that wakes at the scheduled time each day."""
        logger.info(
            "Marketing scheduler started — daily run at %02d:%02d UTC",
            self._run_hour, self._run_minute,
        )

        while self._running:
            try:
                # Sleep until next run time
                wait_seconds = self._seconds_until_next_run()
                logger.info(
                    "Marketing scheduler sleeping %.0f seconds until next run at %s",
                    wait_seconds,
                    self.next_run_at.isoformat() if self.next_run_at else "unknown",
                )
                await asyncio.sleep(wait_seconds)

                if not self._running:
                    break

                # Double-run guard
                if self._already_ran_today():
                    logger.info("Marketing scheduler: already ran today, skipping")
                    await asyncio.sleep(60)  # Brief sleep before rechecking
                    continue

                # Run daily content generation
                logger.info("Marketing scheduler: triggering daily content generation")
                agent = self._get_content_agent()
                tweets = await agent.run_daily()

                self._last_run_at = datetime.now(timezone.utc)
                self._consecutive_errors = 0
                logger.info(
                    "Marketing scheduler: daily run complete, generated %d tweets",
                    len(tweets),
                )

            except asyncio.CancelledError:
                logger.info("Marketing scheduler task cancelled")
                break
            except Exception as exc:
                self._consecutive_errors += 1
                self._last_error = str(exc)
                logger.error(
                    "Marketing scheduler error (consecutive: %d): %s",
                    self._consecutive_errors, exc,
                )

                # Exponential backoff on errors, max 1 hour
                backoff = min(3600, 60 * (2 ** min(self._consecutive_errors, 6)))
                logger.warning(
                    "Marketing scheduler backing off %d seconds", backoff
                )
                await asyncio.sleep(backoff)

        logger.info("Marketing scheduler loop stopped")

    # ------------------------------------------------------------------ #
    #  Start / stop                                                       #
    # ------------------------------------------------------------------ #

    def start(self) -> dict:
        """Start the background marketing scheduler."""
        if self._running:
            return {
                "status": "already_running",
                "next_run": self.next_run_at.isoformat() if self.next_run_at else None,
            }

        self._running = True
        self._task = asyncio.create_task(self._run_loop())
        logger.info("Marketing scheduler started")
        return {
            "status": "started",
            "run_time_utc": f"{self._run_hour:02d}:{self._run_minute:02d}",
            "next_run": self.next_run_at.isoformat() if self.next_run_at else None,
        }

    def stop(self) -> dict:
        """Stop the background marketing scheduler."""
        self._running = False
        if self._task:
            self._task.cancel()
            self._task = None
        logger.info("Marketing scheduler stopped")
        return {
            "status": "stopped",
            "last_run": self._last_run_at.isoformat() if self._last_run_at else None,
        }

    @property
    def is_running(self) -> bool:
        return self._running

    def status(self) -> dict:
        """Return current scheduler status."""
        return {
            "running": self._running,
            "run_time_utc": f"{self._run_hour:02d}:{self._run_minute:02d}",
            "last_run_at": self._last_run_at.isoformat() if self._last_run_at else None,
            "next_run_at": self.next_run_at.isoformat() if self.next_run_at else None,
            "last_error": self._last_error,
            "consecutive_errors": self._consecutive_errors,
        }
