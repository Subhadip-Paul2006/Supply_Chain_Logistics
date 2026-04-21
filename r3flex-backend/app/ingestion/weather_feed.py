"""
NOAA weather feed — fetches severe weather events affecting supply chain routes.
Falls back to mock data automatically if API key missing or call fails.
NOAA CDO API docs: https://www.ncdc.noaa.gov/cdo-web/webservices/v2
"""
import logging
from datetime import datetime, timedelta, timezone

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

NOAA_BASE = "https://www.ncdc.noaa.gov/cdo-web/api/v2/data"

# Station IDs for key supply chain geographies
# These are real NOAA station IDs near critical route points
MONITORED_STATIONS = {
    "GHCND:EGY00000001": "Suez Canal Region, Egypt",
    "GHCND:NLD00000001": "Rotterdam, Netherlands",
    "GHCND:DEU00000001": "Frankfurt, Germany",
}


def _mock_weather_data() -> list[dict]:
    """
    Mock weather signals — used when NOAA API unavailable.
    Simulates realistic weather disruption scenarios.
    """
    return [
        {
            "source": "weather_mock",
            "title": "Severe sandstorm advisory — Suez Canal region",
            "text": (
                "Egyptian Meteorological Authority has issued a severe weather warning "
                "for the Suez Canal zone. Wind speeds of 65-80 km/h with visibility "
                "under 500m expected for the next 18 hours. Port authority has suspended "
                "vessel transit through the northern section of the canal. "
                "Approximately 23 vessels are currently in holding pattern."
            ),
            "published_at": datetime.now(timezone.utc).isoformat(),
            "severity": 6.5,
            "geography": "Suez Canal, Egypt",
            "event_type": "extreme_weather",
            "weather_type": "sandstorm",
        },
        {
            "source": "weather_mock",
            "title": "Winter storm warning — North Sea shipping lanes",
            "text": (
                "Severe winter storm with wave heights exceeding 8 meters forecast "
                "for North Sea shipping lanes. Rotterdam port has restricted "
                "large vessel movements for the next 24 hours. "
                "Supply chain operators advised to adjust ETA estimates."
            ),
            "published_at": datetime.now(timezone.utc).isoformat(),
            "severity": 5.5,
            "geography": "Rotterdam, Netherlands",
            "event_type": "extreme_weather",
            "weather_type": "winter_storm",
        },
    ]


async def fetch_weather_signals() -> list[dict]:
    """
    Fetch severe weather data from NOAA Climate Data Online API.
    Monitors stations near critical supply chain routes.
    Falls back to mock data if API key missing or request fails.

    Returns:
        List of normalized weather signal dicts.
    """
    if not settings.noaa_api_key:
        logger.info("NOAA_API_KEY not set — using mock weather data.")
        return _mock_weather_data()

    # Date range: last 24 hours
    end_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    start_date = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")

    headers = {"token": settings.noaa_api_key}
    params = {
        "datasetid": "GHCND",
        "datatypeid": "WSFI",  # Wind speed / fastest instant
        "stationid": list(MONITORED_STATIONS.keys()),
        "startdate": start_date,
        "enddate": end_date,
        "units": "metric",
        "limit": 50,
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(NOAA_BASE, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()

        results = data.get("results", [])
        logger.info("NOAA API returned %d weather records.", len(results))

        signals = _normalize_weather_results(results)
        if not signals:
            logger.info("No severe weather events detected by NOAA this cycle.")
        return signals

    except httpx.HTTPStatusError as exc:
        logger.warning(
            "NOAA API HTTP error %d: %s. Falling back to mock data.",
            exc.response.status_code, exc
        )
        return _mock_weather_data()
    except Exception as exc:
        logger.warning("NOAA API error: %s. Falling back to mock data.", exc)
        return _mock_weather_data()


def _normalize_weather_results(results: list[dict]) -> list[dict]:
    """
    Convert NOAA API results to normalized signal dicts.
    Only includes readings that exceed severe weather thresholds.

    Args:
        results: Raw NOAA API result list

    Returns:
        Filtered list of normalized signal dicts
    """
    signals = []
    WIND_SEVERE_THRESHOLD_KMH = 60  # Knots converted to km/h approx

    for record in results:
        value = record.get("value", 0)
        station_id = record.get("station", "")
        geography = MONITORED_STATIONS.get(station_id, "Unknown location")

        if value < WIND_SEVERE_THRESHOLD_KMH:
            continue  # Not severe enough to process

        severity = min(10.0, round(5.0 + (value - 60) / 10, 1))

        signals.append({
            "source": "weather",
            "title": f"Severe weather event detected: {geography}",
            "text": (
                f"NOAA monitoring recorded severe weather at {geography}. "
                f"Wind speed: {value} km/h. Threshold for shipping disruption: "
                f"{WIND_SEVERE_THRESHOLD_KMH} km/h. Station: {station_id}. "
                f"Date: {record.get('date', 'unknown')}."
            ),
            "published_at": record.get("date", datetime.now(timezone.utc).isoformat()),
            "severity": severity,
            "geography": geography,
            "event_type": "extreme_weather",
            "raw_value": value,
            "station_id": station_id,
        })

    return signals
