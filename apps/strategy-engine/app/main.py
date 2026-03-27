import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import backtests, paper, risk, strategies, live, market_maker, weather_arb, sports_arb, marketing
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: auto-start market maker if private key is set
    if os.getenv("POLYMARKET_PRIVATE_KEY"):
        try:
            from app.api.mm_scheduler import start_mm_scheduler
            start_mm_scheduler()
            logger.info("Market maker auto-started")
        except Exception as e:
            logger.error(f"Market maker auto-start failed: {e}")
    else:
        logger.info("POLYMARKET_PRIVATE_KEY not set — market maker not started")

    yield

    # Shutdown: stop market maker
    try:
        from app.api.mm_scheduler import stop_mm_scheduler
        stop_mm_scheduler()
    except Exception:
        pass


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Strategy execution, backtesting, and paper-trading engine for MarketPilot AI.",
    lifespan=lifespan,
)

# CORS — allow localhost (dev), Vercel (prod), and Railway (infra)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"^https?://(localhost(:\d+)?|.*\.vercel\.app|.*\.up\.railway\.app)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(strategies.router)
app.include_router(backtests.router)
app.include_router(paper.router)
app.include_router(risk.router)
app.include_router(live.router)
app.include_router(market_maker.router)
app.include_router(weather_arb.router)
app.include_router(sports_arb.router)
app.include_router(marketing.router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
    }
