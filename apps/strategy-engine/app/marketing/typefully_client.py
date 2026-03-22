"""
MarketPilot AI — Typefully API Client
======================================
Wrapper for the Typefully API to create drafts, schedule tweets,
and publish immediately.

Requires environment variable:
  TYPEFULLY_API_KEY — API key from Typefully dashboard
"""

from __future__ import annotations

import logging
import os
from datetime import datetime
from typing import Optional

import httpx

logger = logging.getLogger(__name__)


class TypefullyClient:
    """Async client for the Typefully API."""

    BASE_URL = "https://api.typefully.com/v1"

    def __init__(self, api_key: Optional[str] = None, timeout: float = 15.0):
        self._api_key = api_key or os.getenv("TYPEFULLY_API_KEY", "")
        self._timeout = timeout
        self._client: Optional[httpx.AsyncClient] = None
        self._enabled = bool(self._api_key)

        if not self._enabled:
            logger.warning(
                "Typefully client disabled — TYPEFULLY_API_KEY not set. "
                "Tweets will be generated but not posted."
            )

    @property
    def enabled(self) -> bool:
        return self._enabled

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                base_url=self.BASE_URL,
                headers={
                    "X-API-KEY": self._api_key,
                    "Content-Type": "application/json",
                },
                timeout=httpx.Timeout(self._timeout),
            )
        return self._client

    async def close(self) -> None:
        if self._client and not self._client.is_closed:
            await self._client.aclose()
            self._client = None

    # ------------------------------------------------------------------ #
    #  API methods                                                        #
    # ------------------------------------------------------------------ #

    async def create_draft(
        self,
        content: str,
        thread: bool = False,
    ) -> Optional[str]:
        """
        Create a draft tweet (or thread) in Typefully.
        Returns the draft ID on success, None on failure.

        For threads, separate tweets with the Typefully thread separator (4 newlines).
        """
        if not self._enabled:
            logger.info("Typefully disabled — would create draft: %s", content[:80])
            return None

        client = await self._get_client()

        # Typefully expects thread tweets separated by "\n\n\n\n"
        payload = {
            "content": content,
            "threadify": thread,
        }

        try:
            resp = await client.post("/drafts/", json=payload)
            if resp.status_code in (200, 201):
                data = resp.json()
                draft_id = str(data.get("id", ""))
                logger.info("Created Typefully draft: %s", draft_id)
                return draft_id
            else:
                logger.warning(
                    "Typefully create_draft returned %d: %s",
                    resp.status_code, resp.text[:200],
                )
                return None
        except Exception as exc:
            logger.error("Typefully create_draft failed: %s", exc)
            return None

    async def schedule(
        self,
        draft_id: str,
        scheduled_time: datetime,
    ) -> bool:
        """
        Schedule a draft for posting at a specific time.
        Returns True on success.
        """
        if not self._enabled:
            logger.info(
                "Typefully disabled — would schedule draft %s for %s",
                draft_id, scheduled_time.isoformat(),
            )
            return False

        client = await self._get_client()

        payload = {
            "schedule-date": scheduled_time.isoformat(),
        }

        try:
            resp = await client.put(f"/drafts/{draft_id}/", json=payload)
            if resp.status_code in (200, 204):
                logger.info(
                    "Scheduled Typefully draft %s for %s",
                    draft_id, scheduled_time.isoformat(),
                )
                return True
            else:
                logger.warning(
                    "Typefully schedule returned %d: %s",
                    resp.status_code, resp.text[:200],
                )
                return False
        except Exception as exc:
            logger.error("Typefully schedule failed: %s", exc)
            return False

    async def post_now(self, draft_id: str) -> bool:
        """
        Publish a draft immediately.
        Returns True on success.
        """
        if not self._enabled:
            logger.info("Typefully disabled — would post draft %s now", draft_id)
            return False

        client = await self._get_client()

        payload = {
            "schedule-date": "next-free-slot",
        }

        try:
            resp = await client.put(f"/drafts/{draft_id}/", json=payload)
            if resp.status_code in (200, 204):
                logger.info("Published Typefully draft %s", draft_id)
                return True
            else:
                logger.warning(
                    "Typefully post_now returned %d: %s",
                    resp.status_code, resp.text[:200],
                )
                return False
        except Exception as exc:
            logger.error("Typefully post_now failed: %s", exc)
            return False
