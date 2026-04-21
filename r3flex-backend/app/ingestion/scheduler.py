"""
APScheduler setup — polls all external signal feeds on a fixed interval.
Scheduler is async-compatible (AsyncIOScheduler) so it runs inside FastAPI's event loop.
"""
import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# ── Singleton scheduler ───────────────────────────────────────────────────────
_scheduler: AsyncIOScheduler = AsyncIOScheduler(timezone="UTC")


async def poll_all_feeds() -> None:
    """
    Master polling function — called every POLL_INTERVAL_SECONDS.
    Fetches news + weather + port signals.
    Each feed has its own try/except so one failure doesn't block others.
    Signals are handled by DisruptionService for agent processing.
    """
    logger.info("Polling all signal feeds...")

    from app.ingestion.news_feed import fetch_news_signals
    from app.ingestion.weather_feed import fetch_weather_signals
    from app.ingestion.mock_port_data import get_mock_port_data

    all_signals: list[dict] = []

    # ── News feed ─────────────────────────────────────────────────────────────
    try:
        news = await fetch_news_signals()
        all_signals.extend(news)
        logger.info("News feed: %d signals fetched.", len(news))
    except Exception as exc:
        logger.warning("News feed error: %s. Skipping.", exc)

    # ── Weather feed ──────────────────────────────────────────────────────────
    try:
        weather = await fetch_weather_signals()
        all_signals.extend(weather)
        logger.info("Weather feed: %d signals fetched.", len(weather))
    except Exception as exc:
        logger.warning("Weather feed error: %s. Skipping.", exc)

    # ── Port data (always available — mock always works) ──────────────────────
    try:
        port_signals = get_mock_port_data()
        # Only include port signals with severity >= 5 to reduce noise
        active_port = [s for s in port_signals if s.get("severity", 0) >= 5]
        all_signals.extend(active_port)
        logger.info("Port feed: %d active signals.", len(active_port))
    except Exception as exc:
        logger.warning("Port data error: %s. Skipping.", exc)

    if not all_signals:
        logger.info("No signals from any feed this cycle.")
        return

    logger.info("Total signals this cycle: %d", len(all_signals))

    # Process signals through agent pipeline
    # Note: We limit to highest-severity signal per cycle to avoid overwhelming DB
    top_signal = max(all_signals, key=lambda s: s.get("severity", 0))
    logger.info(
        "Top signal this cycle: source=%s severity=%.1f text='%s...'",
        top_signal.get("source", "unknown"),
        top_signal.get("severity", 0),
        top_signal.get("text", "")[:80],
    )

    # Lazy import to avoid circular imports (services import agents import graph)
    try:
        from app.services.disruption_svc import DisruptionService
        from app.database import AsyncSessionLocal
        async with AsyncSessionLocal() as db:
            await DisruptionService.process_signal(
                signal=top_signal, db=db
            )
    except Exception as exc:
        logger.error("Signal processing error: %s", exc, exc_info=True)


def start_scheduler() -> None:
    """
    Start the APScheduler.
    Adds the poll_all_feeds job on an interval trigger.
    Safe to call multiple times — will not add duplicate jobs.
    """
    if _scheduler.running:
        logger.info("Scheduler already running.")
        return

    _scheduler.add_job(
        poll_all_feeds,
        trigger=IntervalTrigger(seconds=settings.poll_interval_seconds),
        id="poll_feeds",
        replace_existing=True,
        misfire_grace_time=30,  # If job is 30s late, still run it
    )
    _scheduler.start()
    logger.info(
        "Scheduler started. Polling every %ds.", settings.poll_interval_seconds
    )


def stop_scheduler() -> None:
    """
    Stop the APScheduler gracefully.
    Called from app lifespan on shutdown.
    """
    if _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("Scheduler stopped.")
