# Strategy Framework

## Overview

The strategy engine is a Python FastAPI service that provides:
- Modular strategy definitions
- Signal generation from market data
- Backtesting against historical data
- Paper trading simulation
- Risk validation on every trade intent

## Strategy Interface

Every strategy implements `BaseStrategy` with:

```python
class BaseStrategy(ABC):
    def metadata(self) -> StrategyMeta        # Name, description, thesis, risk level
    def configure(self, config: dict)          # Apply user configuration
    def generate_signal(self, data) -> Signal  # Analyze market → signal
    def generate_trade_intent(self, signal) -> TradeIntent  # Signal → order intent
    def compute_metrics(self, trades) -> dict  # Performance analytics
```

## Included Strategies

### 1. Spread Capture (Risk: 2/5)
**Thesis**: Prediction markets have wider spreads due to lower liquidity. Provide liquidity on both sides to capture the spread while managing inventory.

**Signals**: Places passive limit orders at bid and ask. Adjusts spread width based on volatility and inventory.

### 2. Mean Reversion (Risk: 3/5)
**Thesis**: Short-term overreactions in prediction markets tend to revert. Trade deviations from the moving average.

**Signals**: Measures Z-score of current price vs. moving average. Enters when deviation exceeds threshold, exits at mean.

### 3. Orderbook Imbalance (Risk: 3/5)
**Thesis**: Significant bid/ask depth asymmetry predicts short-term direction.

**Signals**: Calculates imbalance ratio from orderbook depth. Trades in the direction of the heavier side when ratio exceeds threshold.

### 4. Momentum Surge (Risk: 4/5)
**Thesis**: Sudden volume spikes precede significant price moves as new information is priced in.

**Signals**: Monitors volume relative to recent average. Enters trend-following positions when volume surge detected.

### 5. Time Decay Repricing (Risk: 3/5)
**Thesis**: As events approach resolution, prices converge. Mispriced markets near expiry present asymmetric opportunities.

**Signals**: Measures price distance from expected resolution value weighted by time remaining. Enters when the gap is statistically significant.

### 6. Cross-Market Divergence (Risk: 4/5)
**Thesis**: Correlated prediction markets sometimes diverge. Trade the expected reconvergence.

**Signals**: Monitors price correlation between related markets. Enters pairs trade when spread exceeds historical norms.

## Risk Validation

Every trade intent passes through the risk engine before execution:

1. **Daily loss check** — Reject if cumulative daily loss exceeds limit
2. **Drawdown check** — Reject if drawdown from peak exceeds limit
3. **Position size check** — Reject if order would exceed max position
4. **Exposure check** — Reject if category exposure would exceed limit
5. **Rate check** — Reject if orders per minute exceeds limit
6. **Liquidity check** — Reject if market liquidity below threshold
7. **Spread check** — Reject if spread exceeds threshold
8. **Cooldown check** — Reject if in loss streak cooldown period

## Adding New Strategies

1. Create a new class extending `BaseStrategy` in `app/strategies/`
2. Implement all required methods
3. Register in `app/strategies/registry.py`
4. Add tests in `app/tests/`
5. Add strategy record to database seed
6. Configure frontend display in strategy catalog

## Backtesting

The backtest engine:
1. Generates simulated market data for the requested date range
2. Steps through each time period
3. Calls the strategy's `generate_signal()` at each step
4. Validates through the risk engine
5. Simulates fills with slippage modeling
6. Tracks P&L, positions, and performance metrics
7. Returns comprehensive results with Sharpe ratio, max drawdown, win rate, and profit factor
