"""
MarketPilot AI — Unified Execution Engine
==========================================
Routes trade intents to either paper or live execution based on mode.
Enforces risk checks before every execution attempt.
"""

from __future__ import annotations

import logging
from enum import Enum
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime

from app.models.strategy import TradeIntent, RiskLimits
from app.risk.engine import RiskEngine
from app.paper_execution.simulator import PaperTradingSimulator
from app.live_execution.polymarket_client import PolymarketExecutor, ExecutionResult

logger = logging.getLogger(__name__)


class ExecutionMode(str, Enum):
    PAPER = "PAPER"
    LIVE = "LIVE"


@dataclass
class ExecutionRecord:
    """Audit record for every execution attempt."""
    timestamp: str
    mode: ExecutionMode
    intent: TradeIntent
    risk_approved: bool
    risk_reason: Optional[str]
    result: Optional[ExecutionResult]
    token_id: Optional[str] = None


class UnifiedExecutor:
    """
    Routes trade intents through risk validation and then to the
    appropriate execution backend (paper or live).

    Usage:
        executor = UnifiedExecutor(mode=ExecutionMode.PAPER)
        record = executor.execute(intent, market_data)
    """

    def __init__(
        self,
        mode: ExecutionMode = ExecutionMode.PAPER,
        risk_limits: Optional[RiskLimits] = None,
        paper_simulator: Optional[PaperTradingSimulator] = None,
        live_executor: Optional[PolymarketExecutor] = None,
    ):
        self.mode = mode
        self.risk_engine = RiskEngine(risk_limits or RiskLimits())
        self.paper = paper_simulator or PaperTradingSimulator()
        self.live = live_executor
        self._execution_log: list[ExecutionRecord] = []
        self._emergency_stopped = False

    def execute(
        self,
        intent: TradeIntent,
        token_id: Optional[str] = None,
        current_price: Optional[float] = None,
        neg_risk: bool = False,
    ) -> ExecutionRecord:
        """
        Execute a trade intent through the full pipeline:
        1. Check emergency stop
        2. Validate against risk engine
        3. Route to paper or live execution
        4. Log the result
        """
        timestamp = datetime.utcnow().isoformat()

        # Emergency stop check
        if self._emergency_stopped:
            record = ExecutionRecord(
                timestamp=timestamp,
                mode=self.mode,
                intent=intent,
                risk_approved=False,
                risk_reason="EMERGENCY_STOP: All execution halted",
                result=None,
                token_id=token_id,
            )
            self._execution_log.append(record)
            return record

        # Skip execution for HOLD signals
        if intent.action == "HOLD":
            record = ExecutionRecord(
                timestamp=timestamp,
                mode=self.mode,
                intent=intent,
                risk_approved=True,
                risk_reason=None,
                result=ExecutionResult(success=True, error="HOLD — no action"),
                token_id=token_id,
            )
            self._execution_log.append(record)
            return record

        # Risk validation
        risk_decision = self.risk_engine.validate_trade(intent)

        if not risk_decision.approved:
            logger.warning(
                f"Risk rejected: {risk_decision.reason} "
                f"(action={intent.action}, size={intent.size})"
            )
            record = ExecutionRecord(
                timestamp=timestamp,
                mode=self.mode,
                intent=intent,
                risk_approved=False,
                risk_reason=risk_decision.reason,
                result=None,
                token_id=token_id,
            )
            self._execution_log.append(record)
            return record

        # Execute
        result: ExecutionResult

        if self.mode == ExecutionMode.PAPER:
            result = self._execute_paper(intent, current_price)
        elif self.mode == ExecutionMode.LIVE:
            if not self.live:
                result = ExecutionResult(
                    success=False,
                    error="Live executor not configured",
                )
            elif not token_id:
                result = ExecutionResult(
                    success=False,
                    error="token_id required for live execution",
                )
            else:
                result = self.live.execute_trade_intent(
                    intent, token_id, neg_risk=neg_risk
                )
        else:
            result = ExecutionResult(
                success=False,
                error=f"Unknown execution mode: {self.mode}",
            )

        # Update risk engine with result
        if result.success and result.filled_size > 0:
            pnl = 0.0  # P&L is tracked separately by position management
            self.risk_engine.record_trade(pnl)

        record = ExecutionRecord(
            timestamp=timestamp,
            mode=self.mode,
            intent=intent,
            risk_approved=True,
            risk_reason=None,
            result=result,
            token_id=token_id,
        )
        self._execution_log.append(record)
        return record

    def _execute_paper(
        self, intent: TradeIntent, current_price: Optional[float]
    ) -> ExecutionResult:
        """Execute via paper trading simulator."""
        try:
            price = current_price or intent.price
            side = intent.action.lower()

            fill = self.paper.execute_trade(
                side=side,
                price=price,
                size=intent.size,
            )

            return ExecutionResult(
                success=True,
                filled_size=fill.get("filled_size", intent.size),
                filled_price=fill.get("filled_price", price),
            )
        except Exception as e:
            return ExecutionResult(success=False, error=str(e))

    # ── Emergency Stop ──────────────────────────────────────────────────────

    def emergency_stop(self) -> dict:
        """
        Halt all execution immediately.
        If in live mode, also cancel all open orders.
        """
        self._emergency_stopped = True
        logger.critical("EMERGENCY STOP activated")

        cancelled = 0
        if self.mode == ExecutionMode.LIVE and self.live:
            cancelled = self.live.cancel_all_orders()

        return {
            "stopped": True,
            "mode": self.mode.value,
            "open_orders_cancelled": cancelled,
        }

    def resume(self) -> None:
        """Resume execution after emergency stop."""
        self._emergency_stopped = False
        logger.info("Execution resumed after emergency stop")

    @property
    def is_stopped(self) -> bool:
        return self._emergency_stopped

    # ── Execution Log ───────────────────────────────────────────────────────

    @property
    def execution_log(self) -> list[ExecutionRecord]:
        return list(self._execution_log)

    @property
    def execution_count(self) -> int:
        return len(self._execution_log)

    def clear_log(self) -> None:
        self._execution_log.clear()
