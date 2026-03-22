"""
MarketPilot AI — Telegram Notification Service
===============================================
Sends trade alerts, daily summaries, and error notifications
to a configured Telegram chat via the Bot API.

Requires environment variables:
  TELEGRAM_BOT_TOKEN  — Bot token from @BotFather
  TELEGRAM_CHAT_ID    — Chat/group ID to send messages to
"""

from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import Optional

import httpx

logger = logging.getLogger(__name__)


class TelegramNotifier:
    """Async Telegram Bot API client for trade notifications."""

    BASE_URL = "https://api.telegram.org/bot{token}"

    def __init__(
        self,
        bot_token: Optional[str] = None,
        chat_id: Optional[str] = None,
        timeout: float = 15.0,
    ):
        self.bot_token = bot_token or os.getenv("TELEGRAM_BOT_TOKEN", "")
        self.chat_id = chat_id or os.getenv("TELEGRAM_CHAT_ID", "")
        self._timeout = timeout
        self._client: Optional[httpx.AsyncClient] = None
        self._enabled = bool(self.bot_token and self.chat_id)

        if not self._enabled:
            logger.warning(
                "Telegram notifier disabled — TELEGRAM_BOT_TOKEN and/or "
                "TELEGRAM_CHAT_ID not set"
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

    async def _send_message(self, text: str, parse_mode: str = "HTML") -> bool:
        """Send a message to the configured chat. Returns True on success."""
        if not self._enabled:
            logger.debug("Telegram disabled — would have sent: %s", text[:100])
            return False

        url = f"{self.BASE_URL.format(token=self.bot_token)}/sendMessage"
        payload = {
            "chat_id": self.chat_id,
            "text": text,
            "parse_mode": parse_mode,
            "disable_web_page_preview": True,
        }

        try:
            client = await self._get_client()
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                return True
            logger.warning("Telegram API returned %d: %s", resp.status_code, resp.text[:200])
            return False
        except Exception as exc:
            logger.error("Failed to send Telegram message: %s", exc)
            return False

    # ------------------------------------------------------------------ #
    #  Trade alerts                                                       #
    # ------------------------------------------------------------------ #

    async def send_trade_alert(
        self,
        action: str,          # "BUY" or "SELL"
        city: str,
        market_question: str,
        outcome: str,         # "YES" / "NO"
        price: float,
        size_usd: float,
        noaa_confidence: float,
        forecast_temp: float,
        expected_value: float,
        signal_strength: str = "",
        order_id: str = "",
    ) -> bool:
        """Send a formatted trade alert."""
        emoji_action = "BUY" if action.upper() == "BUY" else "SELL"
        strength_tag = f" [{signal_strength.upper()}]" if signal_strength else ""

        text = (
            f"<b>{emoji_action}{strength_tag}</b>\n"
            f"<b>City:</b> {city.upper()}\n"
            f"<b>Market:</b> {market_question[:80]}\n"
            f"<b>Outcome:</b> {outcome} @ ${price:.4f}\n"
            f"<b>Size:</b> ${size_usd:.2f}\n"
            f"<b>NOAA Confidence:</b> {noaa_confidence:.1%}\n"
            f"<b>Forecast Temp:</b> {forecast_temp:.0f}°F\n"
            f"<b>Expected Value:</b> ${expected_value:.4f}\n"
        )
        if order_id:
            text += f"<b>Order ID:</b> <code>{order_id[:16]}</code>\n"
        text += f"<i>{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}</i>"

        return await self._send_message(text)

    async def send_exit_alert(
        self,
        city: str,
        market_question: str,
        outcome: str,
        entry_price: float,
        exit_price: float,
        pnl: float,
        reason: str,
    ) -> bool:
        """Send a position exit notification."""
        pnl_sign = "+" if pnl >= 0 else ""
        result_tag = "PROFIT" if pnl >= 0 else "LOSS"

        text = (
            f"<b>EXIT — {result_tag}</b>\n"
            f"<b>City:</b> {city.upper()}\n"
            f"<b>Market:</b> {market_question[:80]}\n"
            f"<b>Outcome:</b> {outcome}\n"
            f"<b>Entry:</b> ${entry_price:.4f} -> <b>Exit:</b> ${exit_price:.4f}\n"
            f"<b>P&L:</b> {pnl_sign}${pnl:.4f}\n"
            f"<b>Reason:</b> {reason}\n"
            f"<i>{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}</i>"
        )
        return await self._send_message(text)

    # ------------------------------------------------------------------ #
    #  Daily summary                                                      #
    # ------------------------------------------------------------------ #

    async def send_daily_summary(
        self,
        bankroll: float,
        daily_pnl: float,
        total_pnl: float,
        trades_opened: int,
        trades_closed: int,
        open_positions: int,
        total_deployed: float,
        win_rate: float = 0.0,
    ) -> bool:
        """Send end-of-day performance summary."""
        pnl_sign = "+" if daily_pnl >= 0 else ""
        total_sign = "+" if total_pnl >= 0 else ""

        text = (
            f"<b>DAILY SUMMARY — Weather Arb</b>\n"
            f"{'=' * 30}\n"
            f"<b>Bankroll:</b> ${bankroll:.2f}\n"
            f"<b>Daily P&L:</b> {pnl_sign}${daily_pnl:.4f}\n"
            f"<b>Total P&L:</b> {total_sign}${total_pnl:.4f}\n"
            f"<b>Trades Opened:</b> {trades_opened}\n"
            f"<b>Trades Closed:</b> {trades_closed}\n"
            f"<b>Open Positions:</b> {open_positions}\n"
            f"<b>Deployed:</b> ${total_deployed:.2f}\n"
            f"<b>Win Rate:</b> {win_rate:.1%}\n"
            f"<i>{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}</i>"
        )
        return await self._send_message(text)

    # ------------------------------------------------------------------ #
    #  Error notifications                                                #
    # ------------------------------------------------------------------ #

    async def send_error(self, error_type: str, message: str, details: str = "") -> bool:
        """Send an error/alert notification."""
        text = (
            f"<b>ERROR — {error_type}</b>\n"
            f"{message}\n"
        )
        if details:
            text += f"<pre>{details[:500]}</pre>\n"
        text += f"<i>{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}</i>"

        return await self._send_message(text)

    async def send_emergency_stop(self, reason: str, positions_closed: int) -> bool:
        """Send emergency stop notification."""
        text = (
            f"<b>EMERGENCY STOP ACTIVATED</b>\n"
            f"<b>Reason:</b> {reason}\n"
            f"<b>Positions closed:</b> {positions_closed}\n"
            f"<i>{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}</i>"
        )
        return await self._send_message(text)
