"""
Mock port congestion data — always-available fallback for port status signals.
Based on realistic Suez Canal disruption scenario (matches demo script).
This module NEVER makes external API calls — purely static/deterministic data.
"""
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

# ── Static mock port data ─────────────────────────────────────────────────────
# Represents the Suez Canal disruption scenario from the PRD demo script.
# severity=9.1 matches the expected demo output.

_MOCK_PORT_SIGNALS = [
    {
        "source": "port_mock",
        "port_id": "suez-canal",
        "port_name": "Suez Canal",
        "title": "CRITICAL: Suez Canal — full blockage, all vessel transit suspended",
        "text": (
            "Suez Canal Authority has issued a CRITICAL disruption alert. "
            "All vessel transit through the Suez Canal has been suspended indefinitely "
            "due to geopolitical conflict escalation in the Red Sea region. "
            "Military activity reported within 12 nautical miles of the canal entrance. "
            "Approximately 47 vessels currently in holding pattern. "
            "4 vessels belonging to PharmaDistrib India supply network affected. "
            "Expected disruption duration: 7-21 days minimum. "
            "All operators must reroute via Cape of Good Hope or arrange air freight "
            "for time-critical cargo. Temperature-controlled pharmaceutical shipments "
            "require immediate rerouting assessment."
        ),
        "severity": 9.1,  # Matches PRD demo script exactly
        "geography": "Suez Canal, Egypt",
        "event_type": "trade_route_disruption",
        "affected_vessels": 47,
        "pharma_network_affected": True,
        "suez_shipments_blocked": 4,
        "estimated_duration_days": 14,
        "published_at": datetime.now(timezone.utc).isoformat(),
        "is_active": True,
    },
    {
        "source": "port_mock",
        "port_id": "rotterdam",
        "port_name": "Port of Rotterdam",
        "title": "Rotterdam: elevated congestion — 36h berth waiting times",
        "text": (
            "Rotterdam port authority reports above-average congestion following "
            "vessel diversions from Suez Canal disruption. Current berth waiting time: "
            "36 hours for bulk carriers, 18 hours for containers. "
            "Cold chain storage capacity at 78%. Operators advised to pre-book "
            "temperature-controlled warehouse space."
        ),
        "severity": 4.5,
        "geography": "Rotterdam, Netherlands",
        "event_type": "port_congestion",
        "affected_vessels": 12,
        "pharma_network_affected": True,
        "estimated_duration_days": 3,
        "published_at": datetime.now(timezone.utc).isoformat(),
        "is_active": True,
    },
    {
        "source": "port_mock",
        "port_id": "shanghai",
        "port_name": "Port of Shanghai",
        "title": "Shanghai: normal operations",
        "text": "Port of Shanghai operating within normal parameters. No disruptions.",
        "severity": 0.5,
        "geography": "Shanghai, China",
        "event_type": "normal",
        "affected_vessels": 0,
        "pharma_network_affected": False,
        "estimated_duration_days": 0,
        "published_at": datetime.now(timezone.utc).isoformat(),
        "is_active": False,
    },
]


def get_mock_port_data() -> list[dict]:
    """
    Return all mock port signals.
    Caller (scheduler) filters to severity >= 5 for active disruptions.

    Returns:
        List of normalized port signal dicts.
    """
    logger.debug("Mock port data accessed: %d signals.", len(_MOCK_PORT_SIGNALS))
    return _MOCK_PORT_SIGNALS


def get_demo_suez_signal() -> dict:
    """
    Return the Suez Canal disruption signal specifically.
    Used by POST /disruptions/demo endpoint to trigger the demo scenario.
    Matches PRD demo: severity=9.1, auto-execute expected at 91% confidence.

    Returns:
        Suez Canal disruption signal dict.
    """
    suez = next(
        (s for s in _MOCK_PORT_SIGNALS if s["port_id"] == "suez-canal"),
        _MOCK_PORT_SIGNALS[0],
    )
    logger.info(
        "Demo Suez signal retrieved: severity=%.1f event_type=%s",
        suez["severity"],
        suez["event_type"],
    )
    return suez
