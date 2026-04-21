"""
NewsAPI integration — fetches supply chain disruption signals from news.
Falls back to mock data automatically if API key missing or call fails.
API docs: https://newsapi.org/docs/endpoints/everything
"""
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

NEWS_API_BASE = "https://newsapi.org/v2/everything"

# Keywords that indicate supply chain disruption events
SUPPLY_CHAIN_KEYWORDS = (
    "supply chain disruption OR port closure OR shipping delay "
    "OR suez canal OR factory fire OR logistics disruption "
    "OR trade route OR cargo disruption OR semiconductor shortage"
)


def _mock_news_data() -> list[dict]:
    """
    Mock news signals — returned when NewsAPI is unavailable.
    Simulates realistic supply chain news for demo purposes.
    """
    return [
        {
            "source": "news_mock",
            "title": "Geopolitical tensions escalating near Suez Canal — vessel diversions reported",
            "text": (
                "Multiple shipping companies have begun diverting vessels away from "
                "the Suez Canal due to escalating geopolitical tensions in the Red Sea region. "
                "An estimated 12 vessels have altered course to the Cape of Good Hope route, "
                "adding 8-14 days to transit times. Pharmaceutical and perishable cargo "
                "operators face significant disruption."
            ),
            "url": "https://mock-news.example.com/suez-disruption",
            "published_at": datetime.now(timezone.utc).isoformat(),
            "severity": 8.5,
            "geography": "Suez Canal, Egypt",
        },
        {
            "source": "news_mock",
            "title": "Port of Rotterdam reports 48-hour congestion window",
            "text": (
                "Rotterdam port authority has issued a congestion warning following "
                "an unexpected influx of diverted vessels. Berth waiting times have "
                "increased to 48 hours. Pharmaceutical cold chain operators advised "
                "to check temperature monitoring for affected consignments."
            ),
            "url": "https://mock-news.example.com/rotterdam-congestion",
            "published_at": datetime.now(timezone.utc).isoformat(),
            "severity": 5.0,
            "geography": "Rotterdam, Netherlands",
        },
    ]


async def fetch_news_signals() -> list[dict]:
    """
    Fetch supply chain news signals from NewsAPI.
    Returns normalized signal dicts compatible with agent pipeline.
    Falls back to mock data if API key missing or request fails.

    Returns:
        List of normalized signal dicts with keys:
            source, title, text, url, published_at, severity, geography
    """
    if not settings.news_api_key:
        logger.info("NEWS_API_KEY not set — using mock news data.")
        return _mock_news_data()

    # Only fetch news from last hour to avoid reprocessing
    from_date = (datetime.now(timezone.utc) - timedelta(hours=1)).strftime(
        "%Y-%m-%dT%H:%M:%SZ"
    )

    params = {
        "q": SUPPLY_CHAIN_KEYWORDS,
        "from": from_date,
        "sortBy": "publishedAt",
        "language": "en",
        "pageSize": 10,
        "apiKey": settings.news_api_key,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(NEWS_API_BASE, params=params)
            response.raise_for_status()
            data = response.json()

        articles = data.get("articles", [])
        logger.info("NewsAPI returned %d articles.", len(articles))

        return [_normalize_article(a) for a in articles if a.get("content")]

    except httpx.HTTPStatusError as exc:
        logger.warning(
            "NewsAPI HTTP error %d: %s. Falling back to mock data.",
            exc.response.status_code, exc
        )
        return _mock_news_data()
    except Exception as exc:
        logger.warning("NewsAPI error: %s. Falling back to mock data.", exc)
        return _mock_news_data()


def _normalize_article(article: dict) -> dict:
    """
    Convert NewsAPI article format to normalized signal dict.
    Severity is estimated from keyword presence — real scoring done by SeverityAgent.

    Args:
        article: Raw NewsAPI article dict

    Returns:
        Normalized signal dict
    """
    text = f"{article.get('title', '')} {article.get('description', '')} {article.get('content', '')}"
    severity = _estimate_severity(text)

    return {
        "source": "news",
        "title": article.get("title", ""),
        "text": text[:2000],  # Truncate to avoid LLM token overflow
        "url": article.get("url", ""),
        "published_at": article.get("publishedAt", ""),
        "severity": severity,
        "geography": _extract_geography(text),
    }


def _estimate_severity(text: str) -> float:
    """
    Rough severity estimate from keyword presence.
    SeverityAgent will do the real scoring — this is just for feed prioritization.
    Scale: 1.0 (minor) to 10.0 (catastrophic).
    """
    text_lower = text.lower()
    score = 3.0  # Baseline for news appearing at all

    high_impact = ["closure", "shutdown", "blockage", "military", "war", "explosion", "fire"]
    medium_impact = ["delay", "congestion", "disruption", "diversion", "shortage"]

    for word in high_impact:
        if word in text_lower:
            score += 1.5

    for word in medium_impact:
        if word in text_lower:
            score += 0.7

    return min(10.0, round(score, 1))


def _extract_geography(text: str) -> Optional[str]:
    """
    Simple geography extraction from text.
    Returns first recognized location or None.
    GraphMapperAgent does the real geo-to-node mapping.
    """
    locations = [
        "Suez Canal", "Red Sea", "Rotterdam", "Shanghai", "Singapore",
        "Chennai", "Frankfurt", "Hamburg", "Port Said", "Cape of Good Hope",
    ]
    for loc in locations:
        if loc.lower() in text.lower():
            return loc
    return None
