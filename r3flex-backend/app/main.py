"""
FastAPI application entry point.
- Configures middleware (CORS)
- Registers all routers
- Manages lifespan: starts Redis + APScheduler on startup, closes on shutdown
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.redis_client import init_redis, close_redis

# Import all routers
from app.routers import disruptions, scenarios, decisions, audit, ws

settings = get_settings()

# ── Logging setup ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ── Lifespan — startup + shutdown ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan context manager.
    Everything before 'yield' runs on startup.
    Everything after 'yield' runs on shutdown.
    """
    logger.info("R3flex API starting up...")

    # 1. Initialize Redis connection pool
    await init_redis()
    logger.info("Redis ready.")

    # 2. Start APScheduler (ingestion polling)
    # Imported here to avoid circular imports with scheduler → services → db
    try:
        from app.ingestion.scheduler import start_scheduler
        start_scheduler()
        logger.info("APScheduler started — polling every %ds.", settings.poll_interval_seconds)
    except Exception as exc:
        logger.warning("Scheduler failed to start: %s. Continuing without polling.", exc)

    # 3. Load supplier graph seed data
    try:
        from app.graph.seed_data import seed_supplier_graph
        seed_supplier_graph()
        logger.info("Supplier graph seeded with PharmaDistrib demo network.")
    except Exception as exc:
        logger.warning("Graph seeding failed: %s", exc)

    yield  # ← App runs here

    # ── Shutdown ──────────────────────────────────────────────────────────────
    logger.info("R3flex API shutting down...")

    try:
        from app.ingestion.scheduler import stop_scheduler
        stop_scheduler()
    except Exception as exc:
        logger.warning("Scheduler stop error: %s", exc)

    await close_redis()
    logger.info("Shutdown complete.")


# ── App instance ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="R3flex API",
    description=(
        "Agentic supply chain resilience platform. "
        "Detects disruptions, simulates rerouting, executes autonomously."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── Middleware ────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["system"])
async def health_check() -> dict:
    """
    Lightweight health probe.
    Returns 200 if API process is running.
    Does NOT check DB/Redis — use /ready for full dependency check.
    """
    return {"status": "ok", "version": "0.1.0"}


@app.get("/ready", tags=["system"])
async def readiness_check() -> dict:
    """
    Readiness probe — verifies DB and Redis are reachable.
    Used by Docker health checks and k8s readiness probes.
    """
    from app.redis_client import get_redis_client
    from app.database import engine
    import sqlalchemy

    status: dict = {"redis": "unknown", "db": "unknown"}

    # Check Redis
    try:
        redis = get_redis_client()
        await redis.ping()
        status["redis"] = "ok"
    except Exception as exc:
        status["redis"] = f"error: {exc}"

    # Check DB
    try:
        async with engine.connect() as conn:
            await conn.execute(sqlalchemy.text("SELECT 1"))
        status["db"] = "ok"
    except Exception as exc:
        status["db"] = f"error: {exc}"

    overall = "ok" if all(v == "ok" for v in status.values()) else "degraded"
    return {"status": overall, **status}


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(disruptions.router, prefix="/disruptions", tags=["disruptions"])
app.include_router(scenarios.router, prefix="", tags=["scenarios"])
app.include_router(decisions.router, prefix="/decisions", tags=["decisions"])
app.include_router(audit.router, prefix="/audit", tags=["audit"])
app.include_router(ws.router, tags=["websocket"])
