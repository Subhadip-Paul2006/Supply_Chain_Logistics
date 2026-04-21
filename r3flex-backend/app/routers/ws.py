"""
WebSocket router — real-time event stream for frontend dashboard.
WS /ws/disruptions/{company_id}

Subscribes to Redis pub/sub channel "disruptions:{company_id}".
Pushes events to connected clients:
    - New disruptions detected
    - Auto-execution notifications
    - Below-threshold escalations (triggers approval modal in frontend)
    - Heartbeat pings every 30s to keep connection alive

PRD rule: WebSocket channel name must be "disruptions:{company_id}"
"""
import asyncio
import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter()

HEARTBEAT_INTERVAL = 30  # seconds


@router.websocket("/ws/disruptions/{company_id}")
async def disruption_websocket(
    websocket: WebSocket,
    company_id: str,
) -> None:
    """
    WebSocket endpoint for real-time disruption events.

    Connect with: ws://localhost:8000/ws/disruptions/pharma-distrib-india

    Messages sent to client:
        {"type": "connected", "channel": "disruptions:pharma-distrib-india"}
        {"type": "heartbeat", "timestamp": "..."}
        {"type": "disruption_event", "event": "approval_required", ...}

    The "approval_required" event triggers the human approval modal in the frontend.
    Payload includes confidence breakdown and 3 scenario options.

    Client can send:
        {"type": "ping"} → server responds with {"type": "pong"}
    """
    await websocket.accept()
    channel = f"disruptions:{company_id}"
    logger.info("WebSocket connected: channel=%s", channel)

    # Send connection confirmation
    await websocket.send_json({
        "type": "connected",
        "channel": channel,
        "message": f"Subscribed to {channel}. Listening for disruption events.",
    })

    # ── Subscribe to Redis pub/sub ────────────────────────────────────────────
    try:
        from app.redis_client import get_redis_client
        redis = get_redis_client()
        pubsub = redis.pubsub()
        await pubsub.subscribe(channel)
        logger.info("Redis pubsub subscribed to channel '%s'.", channel)
    except Exception as exc:
        logger.error("Redis pubsub init failed: %s", exc)
        await websocket.send_json({
            "type": "error",
            "message": "Real-time stream unavailable. Redis connection failed.",
        })
        await websocket.close()
        return

    # ── Main event loop ───────────────────────────────────────────────────────
    try:
        heartbeat_task = asyncio.create_task(_heartbeat_loop(websocket))

        async for message in pubsub.listen():
            if message["type"] == "message":
                try:
                    data = json.loads(message["data"])
                    logger.info(
                        "Broadcasting to WebSocket: event=%s channel=%s",
                        data.get("event"), channel
                    )
                    await websocket.send_json({
                        "type": "disruption_event",
                        **data,
                    })
                except json.JSONDecodeError:
                    logger.warning("Malformed Redis message: %s", message["data"])
                except Exception as exc:
                    logger.error("WebSocket send error: %s", exc)
                    break

    except WebSocketDisconnect:
        logger.info("WebSocket disconnected: channel=%s", channel)
    except asyncio.CancelledError:
        logger.info("WebSocket task cancelled: channel=%s", channel)
    except Exception as exc:
        logger.error("WebSocket error: %s", exc, exc_info=True)
    finally:
        heartbeat_task.cancel()
        try:
            await pubsub.unsubscribe(channel)
            await pubsub.aclose()
        except Exception:
            pass
        logger.info("WebSocket cleanup complete: channel=%s", channel)


async def _heartbeat_loop(websocket: WebSocket) -> None:
    """
    Send heartbeat ping every HEARTBEAT_INTERVAL seconds.
    Keeps the connection alive through load balancers and proxies.
    Cancelled when the main WebSocket loop exits.
    """
    import datetime
    while True:
        await asyncio.sleep(HEARTBEAT_INTERVAL)
        try:
            await websocket.send_json({
                "type": "heartbeat",
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            })
        except Exception:
            break  # Connection closed — stop heartbeat
