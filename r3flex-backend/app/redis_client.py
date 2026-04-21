"""
Redis async client — connection pool, pub/sub helpers, cache helpers.
All Redis interactions go through functions here — never import redis directly.
"""
import json
import logging
from typing import Any, AsyncGenerator, Optional

import redis.asyncio as aioredis
from redis.asyncio import Redis

from app.config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()

# ── Connection pool ───────────────────────────────────────────────────────────
# Single pool shared across all requests — created at startup, closed at shutdown
_redis_pool: Optional[Redis] = None


async def init_redis() -> None:
    """
    Initialize Redis connection pool.
    Called once from app lifespan on startup.
    """
    global _redis_pool
    _redis_pool = aioredis.from_url(
        settings.redis_url,
        encoding="utf-8",
        decode_responses=True,
        max_connections=20,
    )
    # Verify connection is alive
    await _redis_pool.ping()
    logger.info("Redis connection pool initialized: %s", settings.redis_url)


async def close_redis() -> None:
    """
    Close Redis connection pool.
    Called once from app lifespan on shutdown.
    """
    global _redis_pool
    if _redis_pool:
        await _redis_pool.aclose()
        logger.info("Redis connection pool closed.")


def get_redis_client() -> Redis:
    """
    Return shared Redis client.
    Raises RuntimeError if init_redis() was not called first.
    """
    if _redis_pool is None:
        raise RuntimeError("Redis not initialized. Call init_redis() first.")
    return _redis_pool


# ── FastAPI dependency ────────────────────────────────────────────────────────
async def get_redis() -> AsyncGenerator[Redis, None]:
    """
    Yield Redis client for FastAPI route dependency injection.
    Usage: redis: Redis = Depends(get_redis)
    """
    yield get_redis_client()


# ── Pub/Sub helpers ───────────────────────────────────────────────────────────
async def publish(channel: str, payload: dict[str, Any]) -> None:
    """
    Publish JSON payload to Redis pub/sub channel.
    Used by executor to push below-threshold decisions to WebSocket clients.

    Args:
        channel: Redis channel name, e.g. "disruptions:pharma-distrib-india"
        payload: Dict — will be JSON-serialized before publish
    """
    client = get_redis_client()
    message = json.dumps(payload)
    subscribers = await client.publish(channel, message)
    logger.info(
        "Published to channel '%s'. Subscribers received: %d", channel, subscribers
    )


# ── Cache helpers ─────────────────────────────────────────────────────────────
async def cache_set(key: str, value: Any, ttl_seconds: int = 300) -> None:
    """
    Store JSON-serializable value in Redis with TTL.

    Args:
        key: Cache key string
        value: Any JSON-serializable Python object
        ttl_seconds: Expiry time in seconds (default 5 minutes)
    """
    client = get_redis_client()
    await client.setex(key, ttl_seconds, json.dumps(value))


async def cache_get(key: str) -> Optional[Any]:
    """
    Retrieve cached value by key. Returns None if not found or expired.

    Args:
        key: Cache key string

    Returns:
        Deserialized Python object or None
    """
    client = get_redis_client()
    raw = await client.get(key)
    if raw is None:
        return None
    return json.loads(raw)
