from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    app_name: str = "MarketPilot Strategy Engine"
    app_version: str = "0.2.0"
    debug: bool = False

    database_url: str = "postgresql://localhost:5432/marketpilot"
    redis_url: str = "redis://localhost:6379/0"

    polymarket_api_url: str = "https://clob.polymarket.com"
    polymarket_api_key: Optional[str] = None
    polymarket_private_key: Optional[str] = None

    default_paper_balance: float = 10_000.0
    max_position_size: float = 1_000.0
    max_daily_loss: float = 500.0
    max_drawdown_pct: float = 0.10

    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    model_config = {"env_prefix": "", "env_file": ".env", "extra": "ignore"}


settings = Settings()
