"""
App configuration — reads all settings from .env via pydantic-settings.
Single source of truth for every secret and tuneable parameter.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Pydantic BaseSettings auto-reads from .env file.
    All secrets come from here — never hardcode in other files.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Database ──────────────────────────────────────────────────────────────
    database_url: str = (
        "postgresql+asyncpg://r3flex:r3flex_secret@localhost:5432/r3flex"
    )

    # ── Redis ─────────────────────────────────────────────────────────────────
    redis_url: str = "redis://localhost:6379"

    # ── LLM — Google Gemini ───────────────────────────────────────────────────
    google_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"
    llm_max_tokens: int = 1000

    # ── External signal feeds (optional — mock fallback if missing) ───────────
    news_api_key: str = ""
    noaa_api_key: str = ""

    # ── Business rules ────────────────────────────────────────────────────────
    # Confidence above this → auto-execute. Below → human approval.
    confidence_threshold: float = 0.85

    # Demo company ID — also used as WebSocket channel suffix
    company_id: str = "pharma-distrib-india"

    # APScheduler: how often to poll feeds (seconds)
    poll_interval_seconds: int = 60

    # ── App ───────────────────────────────────────────────────────────────────
    app_env: str = "development"
    log_level: str = "INFO"


@lru_cache
def get_settings() -> Settings:
    """
    Return singleton Settings instance.
    lru_cache ensures .env is read once — not on every request.
    """
    return Settings()
