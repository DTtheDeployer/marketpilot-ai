"""
MarketPilot AI — Telegram Approval Flow
========================================
Sends generated tweet previews to an admin Telegram chat with
inline keyboard buttons for [Post Now] [Schedule] [Skip].

Uses the existing TelegramNotifier for the HTTP transport layer
but adds inline keyboard support for interactive approvals.

Requires environment variables:
  TELEGRAM_BOT_TOKEN       — Bot token from @BotFather
  ADMIN_TELEGRAM_CHAT_ID   — Admin chat ID for content approvals
"""

from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timezone
from typing import Optional

import httpx

from app.marketing.prompts import CONTENT_TYPES

logger = logging.getLogger(__name__)


class TelegramApprovalBot:
    """
    Sends tweet previews with inline approval buttons to a Telegram admin chat.
    Handles callback queries when the admin presses a button.
    """

    BASE_URL = "https://api.telegram.org/bot{token}"

    def __init__(
        self,
        bot_token: Optional[str] = None,
        admin_chat_id: Optional[str] = None,
        timeout: float = 15.0,
    ):
        self._bot_token = bot_token or os.getenv("TELEGRAM_BOT_TOKEN", "")
        self._admin_chat_id = admin_chat_id or os.getenv("ADMIN_TELEGRAM_CHAT_ID", "")
        self._timeout = timeout
        self._client: Optional[httpx.AsyncClient] = None
        self._enabled = bool(self._bot_token and self._admin_chat_id)

        if not self._enabled:
            logger.warning(
                "Telegram approval bot disabled — TELEGRAM_BOT_TOKEN and/or "
                "ADMIN_TELEGRAM_CHAT_ID not set"
            )

    @property
    def enabled(self) -> bool:
        return self._enabled

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(self._timeout),
            )
        return self._client

    async def close(self) -> None:
        if self._client and not self._client.is_closed:
            await self._client.aclose()
            self._client = None

    def _api_url(self, method: str) -> str:
        return f"{self.BASE_URL.format(token=self._bot_token)}/{method}"

    # ------------------------------------------------------------------ #
    #  Send approval request                                              #
    # ------------------------------------------------------------------ #

    async def send_approval_request(
        self,
        tweet_id: str,
        content: str,
        content_type: str,
    ) -> bool:
        """
        Send a tweet preview to the admin chat with inline keyboard
        buttons: [Post Now] [Schedule] [Skip].

        Returns True if the message was sent successfully.
        """
        if not self._enabled:
            logger.debug(
                "Telegram approvals disabled — would send: [%s] %s",
                content_type, content[:80],
            )
            return False

        # Format the preview message
        type_label = CONTENT_TYPES.get(content_type, {}).get("label", content_type)
        char_count = len(content)

        text = (
            f"<b>NEW TWEET FOR REVIEW</b>\n"
            f"{'=' * 28}\n"
            f"<b>Type:</b> {type_label}\n"
            f"<b>Characters:</b> {char_count}/280\n\n"
            f"<pre>{self._escape_html(content)}</pre>\n\n"
            f"<i>ID: {tweet_id}</i>\n"
            f"<i>{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}</i>"
        )

        # Inline keyboard with approval actions
        inline_keyboard = {
            "inline_keyboard": [
                [
                    {
                        "text": "Post Now",
                        "callback_data": json.dumps({
                            "action": "post_now",
                            "tweet_id": tweet_id,
                        }),
                    },
                    {
                        "text": "Schedule",
                        "callback_data": json.dumps({
                            "action": "schedule",
                            "tweet_id": tweet_id,
                        }),
                    },
                    {
                        "text": "Skip",
                        "callback_data": json.dumps({
                            "action": "skip",
                            "tweet_id": tweet_id,
                        }),
                    },
                ],
            ],
        }

        payload = {
            "chat_id": self._admin_chat_id,
            "text": text,
            "parse_mode": "HTML",
            "disable_web_page_preview": True,
            "reply_markup": json.dumps(inline_keyboard),
        }

        try:
            client = await self._get_client()
            resp = await client.post(self._api_url("sendMessage"), json=payload)
            if resp.status_code == 200:
                logger.info("Sent approval request for tweet %s to Telegram", tweet_id)
                return True
            else:
                logger.warning(
                    "Telegram sendMessage returned %d: %s",
                    resp.status_code, resp.text[:200],
                )
                return False
        except Exception as exc:
            logger.error("Failed to send Telegram approval request: %s", exc)
            return False

    # ------------------------------------------------------------------ #
    #  Handle callback from inline keyboard                               #
    # ------------------------------------------------------------------ #

    async def handle_callback(self, callback_data: str) -> dict:
        """
        Process a callback from an inline keyboard button press.

        Returns a dict with:
          - action: "post_now" | "schedule" | "skip"
          - tweet_id: the tweet ID
          - success: bool
        """
        try:
            data = json.loads(callback_data)
        except (json.JSONDecodeError, TypeError):
            logger.warning("Invalid callback data: %s", callback_data)
            return {"action": "unknown", "tweet_id": "", "success": False}

        action = data.get("action", "unknown")
        tweet_id = data.get("tweet_id", "")

        logger.info("Received callback: action=%s, tweet_id=%s", action, tweet_id)

        if action == "post_now":
            return await self._handle_post_now(tweet_id)
        elif action == "schedule":
            return await self._handle_schedule(tweet_id)
        elif action == "skip":
            return await self._handle_skip(tweet_id)
        else:
            logger.warning("Unknown callback action: %s", action)
            return {"action": action, "tweet_id": tweet_id, "success": False}

    async def _handle_post_now(self, tweet_id: str) -> dict:
        """Post a tweet immediately via Typefully."""
        try:
            from app.marketing.typefully_client import TypefullyClient
            from app.marketing.content_agent import ContentAgent

            # Get the content agent singleton to find the tweet
            agent = _get_content_agent()
            tweet = agent.get_tweet_by_id(tweet_id)

            if not tweet:
                logger.warning("Tweet %s not found for posting", tweet_id)
                return {"action": "post_now", "tweet_id": tweet_id, "success": False}

            typefully = TypefullyClient()
            draft_id = await typefully.create_draft(tweet.content)

            if draft_id:
                posted = await typefully.post_now(draft_id)
                if posted:
                    tweet.status = "posted"
                    tweet.draft_id = draft_id
                    await self._send_confirmation(tweet_id, "Posted")
                    await typefully.close()
                    return {"action": "post_now", "tweet_id": tweet_id, "success": True}

            await typefully.close()
            return {"action": "post_now", "tweet_id": tweet_id, "success": False}

        except Exception as exc:
            logger.error("Failed to post tweet %s: %s", tweet_id, exc)
            return {"action": "post_now", "tweet_id": tweet_id, "success": False}

    async def _handle_schedule(self, tweet_id: str) -> dict:
        """Create a Typefully draft (will use Typefully's auto-schedule)."""
        try:
            from app.marketing.typefully_client import TypefullyClient
            from app.marketing.content_agent import ContentAgent

            agent = _get_content_agent()
            tweet = agent.get_tweet_by_id(tweet_id)

            if not tweet:
                logger.warning("Tweet %s not found for scheduling", tweet_id)
                return {"action": "schedule", "tweet_id": tweet_id, "success": False}

            typefully = TypefullyClient()
            draft_id = await typefully.create_draft(tweet.content)

            if draft_id:
                tweet.status = "approved"
                tweet.draft_id = draft_id
                await self._send_confirmation(tweet_id, "Scheduled (draft created)")
                await typefully.close()
                return {"action": "schedule", "tweet_id": tweet_id, "success": True}

            await typefully.close()
            return {"action": "schedule", "tweet_id": tweet_id, "success": False}

        except Exception as exc:
            logger.error("Failed to schedule tweet %s: %s", tweet_id, exc)
            return {"action": "schedule", "tweet_id": tweet_id, "success": False}

    async def _handle_skip(self, tweet_id: str) -> dict:
        """Mark a tweet as skipped."""
        try:
            from app.marketing.content_agent import ContentAgent

            agent = _get_content_agent()
            tweet = agent.get_tweet_by_id(tweet_id)

            if tweet:
                tweet.status = "skipped"
                await self._send_confirmation(tweet_id, "Skipped")
                return {"action": "skip", "tweet_id": tweet_id, "success": True}

            return {"action": "skip", "tweet_id": tweet_id, "success": False}

        except Exception as exc:
            logger.error("Failed to skip tweet %s: %s", tweet_id, exc)
            return {"action": "skip", "tweet_id": tweet_id, "success": False}

    async def _send_confirmation(self, tweet_id: str, status: str) -> None:
        """Send a short confirmation message to the admin chat."""
        if not self._enabled:
            return

        text = f"Tweet <code>{tweet_id}</code>: <b>{status}</b>"
        payload = {
            "chat_id": self._admin_chat_id,
            "text": text,
            "parse_mode": "HTML",
        }

        try:
            client = await self._get_client()
            await client.post(self._api_url("sendMessage"), json=payload)
        except Exception as exc:
            logger.warning("Failed to send confirmation: %s", exc)

    @staticmethod
    def _escape_html(text: str) -> str:
        """Escape HTML special characters for Telegram."""
        return (
            text
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
        )


# ---------------------------------------------------------------------------
# Module-level helper to access the content agent singleton
# ---------------------------------------------------------------------------

_content_agent = None


def _get_content_agent():
    """Get the content agent singleton (created by the API router)."""
    global _content_agent
    if _content_agent is None:
        from app.marketing.content_agent import ContentAgent
        _content_agent = ContentAgent()
    return _content_agent


def set_content_agent(agent) -> None:
    """Set the content agent singleton (called by the API router)."""
    global _content_agent
    _content_agent = agent
