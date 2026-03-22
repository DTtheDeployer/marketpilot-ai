"""
MarketPilot AI — Marketing API Router
======================================
FastAPI endpoints for controlling the automated content generation
system, manual tweet generation, and posting via Typefully.
"""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/marketing", tags=["marketing"])

# ---------------------------------------------------------------------------
# Singletons
# ---------------------------------------------------------------------------

_scheduler = None
_content_agent = None


def _get_scheduler():
    """Lazily create the MarketingScheduler singleton."""
    global _scheduler
    if _scheduler is None:
        from app.marketing.scheduler import MarketingScheduler
        _scheduler = MarketingScheduler()
    return _scheduler


def _get_content_agent():
    """Lazily create the ContentAgent singleton."""
    global _content_agent
    if _content_agent is None:
        from app.marketing.content_agent import ContentAgent
        _content_agent = ContentAgent()
        # Register with the telegram approvals module
        from app.marketing.telegram_approvals import set_content_agent
        set_content_agent(_content_agent)
    return _content_agent


# ---------------------------------------------------------------------------
# Response models
# ---------------------------------------------------------------------------

class SchedulerStatusResponse(BaseModel):
    running: bool
    run_time_utc: str = ""
    last_run_at: Optional[str] = None
    next_run_at: Optional[str] = None
    last_error: Optional[str] = None
    consecutive_errors: int = 0


class StartStopResponse(BaseModel):
    status: str
    run_time_utc: Optional[str] = None
    next_run: Optional[str] = None
    last_run: Optional[str] = None


class TweetResponse(BaseModel):
    id: str
    content: str
    content_type: str
    generated_at: str
    status: str
    draft_id: Optional[str] = None
    char_count: int = 0


class GenerateResponse(BaseModel):
    count: int
    tweets: list[TweetResponse]


class PostRequest(BaseModel):
    tweet_id: str


class PostResponse(BaseModel):
    tweet_id: str
    status: str
    draft_id: Optional[str] = None


class QueueResponse(BaseModel):
    count: int
    tweets: list[TweetResponse]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/start", response_model=StartStopResponse)
def start_scheduler():
    """Start the daily marketing content scheduler."""
    scheduler = _get_scheduler()
    result = scheduler.start()
    return StartStopResponse(**result)


@router.post("/stop", response_model=StartStopResponse)
def stop_scheduler():
    """Stop the daily marketing content scheduler."""
    scheduler = _get_scheduler()
    result = scheduler.stop()
    return StartStopResponse(**result)


@router.get("/status", response_model=SchedulerStatusResponse)
def get_status():
    """Get the marketing scheduler status: running, last run, next run."""
    scheduler = _get_scheduler()
    return SchedulerStatusResponse(**scheduler.status())


@router.post("/generate", response_model=GenerateResponse)
async def generate_content():
    """
    Manually trigger content generation.
    Returns the generated tweet options (also sends to Telegram for approval).
    """
    agent = _get_content_agent()
    tweets = await agent.run_daily()

    tweet_responses = [
        TweetResponse(**t.to_dict())
        for t in tweets
    ]

    return GenerateResponse(count=len(tweet_responses), tweets=tweet_responses)


@router.post("/post", response_model=PostResponse)
async def post_tweet(request: PostRequest):
    """
    Manually post a specific tweet via Typefully.
    Requires the tweet_id from a previously generated tweet.
    """
    agent = _get_content_agent()
    tweet = agent.get_tweet_by_id(request.tweet_id)

    if not tweet:
        raise HTTPException(status_code=404, detail=f"Tweet {request.tweet_id} not found")

    from app.marketing.typefully_client import TypefullyClient
    typefully = TypefullyClient()

    try:
        draft_id = await typefully.create_draft(tweet.content)
        if not draft_id:
            return PostResponse(
                tweet_id=tweet.id,
                status="draft_creation_failed",
            )

        posted = await typefully.post_now(draft_id)
        if posted:
            tweet.status = "posted"
            tweet.draft_id = draft_id
            return PostResponse(
                tweet_id=tweet.id,
                status="posted",
                draft_id=draft_id,
            )
        else:
            tweet.status = "approved"
            tweet.draft_id = draft_id
            return PostResponse(
                tweet_id=tweet.id,
                status="draft_created_but_post_failed",
                draft_id=draft_id,
            )
    finally:
        await typefully.close()


@router.get("/queue", response_model=QueueResponse)
def get_queue():
    """List recent generated content with status."""
    agent = _get_content_agent()
    tweets = agent.recent_tweets

    tweet_responses = [
        TweetResponse(**t.to_dict())
        for t in reversed(tweets)  # Most recent first
    ]

    return QueueResponse(count=len(tweet_responses), tweets=tweet_responses)
