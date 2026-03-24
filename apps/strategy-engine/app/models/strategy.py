from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class SignalDirection(str, Enum):
    BUY = "buy"
    SELL = "sell"
    HOLD = "hold"


class StrategyMeta(BaseModel):
    """Describes a strategy without exposing its internals."""

    slug: str
    name: str
    description: str
    thesis: str
    risk_level: RiskLevel
    config_defaults: dict[str, Any] = Field(default_factory=dict)
    tags: list[str] = Field(default_factory=list)


class StrategyConfig(BaseModel):
    """Runtime configuration supplied when running a strategy."""

    params: dict[str, Any] = Field(default_factory=dict)
    risk_preset: str = "balanced"
    capital: float = 1_000.0


class MarketData(BaseModel):
    """Snapshot of market data fed to a strategy."""

    market_id: str
    question: str = ""
    outcome_yes_price: float
    outcome_no_price: float
    volume_24h: float = 0.0
    liquidity: float = 0.0
    spread: float = 0.0
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    orderbook_bids: list[list[float]] = Field(default_factory=list)
    orderbook_asks: list[list[float]] = Field(default_factory=list)
    price_history: list[float] = Field(default_factory=list)
    related_markets: list[dict[str, Any]] = Field(default_factory=list)
    end_date: Optional[datetime] = None


class Signal(BaseModel):
    """Output of strategy analysis — a directional recommendation."""

    strategy_slug: str
    market_id: str
    direction: SignalDirection
    confidence: float = Field(ge=0.0, le=1.0)
    target_price: float = Field(ge=0.0, le=1.0)
    reasoning: str = ""
    metadata: dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class TradeIntent(BaseModel):
    """Actionable trade derived from a signal."""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    signal: Signal
    side: SignalDirection
    outcome: str = "yes"
    size: float
    limit_price: float
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    ttl_seconds: int = 300
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class BacktestResult(BaseModel):
    """Aggregate output of a backtest run."""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    strategy_slug: str
    start_date: datetime
    end_date: datetime
    config: StrategyConfig
    total_trades: int = 0
    winning_trades: int = 0
    losing_trades: int = 0
    total_pnl: float = 0.0
    max_drawdown: float = 0.0
    sharpe_ratio: float = 0.0
    win_rate: float = 0.0
    profit_factor: float = 0.0
    avg_trade_pnl: float = 0.0
    equity_curve: list[float] = Field(default_factory=list)
    trades: list[dict[str, Any]] = Field(default_factory=list)
    duration_seconds: float = 0.0
    execution_analysis: Optional[dict[str, Any]] = None


class RiskLimits(BaseModel):
    """Risk constraints applied to a trading session."""

    max_position_size: float = 1_000.0
    max_daily_loss: float = 500.0
    max_drawdown_pct: float = 0.10
    max_open_positions: int = 5
    max_single_trade_size: float = 500.0
    min_confidence: float = 0.55
    allowed_risk_levels: list[RiskLevel] = Field(
        default_factory=lambda: [RiskLevel.LOW, RiskLevel.MEDIUM]
    )


class RiskDecision(BaseModel):
    """Result of a risk check on a trade intent."""

    approved: bool
    trade_intent_id: str
    reasons: list[str] = Field(default_factory=list)
    adjusted_size: Optional[float] = None
