"""
Classifier Agent — reads raw signal text and classifies disruption type + geography.
Uses Gemini 2.0 Flash via LangChain with structured output (Pydantic schema).
Falls back to keyword-based classification if LLM unavailable.
"""
import logging
from typing import Optional

from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


# ── Output schema ─────────────────────────────────────────────────────────────
class ClassificationOutput(BaseModel):
    """Structured output from classifier LLM call."""

    event_type: str = Field(
        description=(
            "Type of supply chain disruption. One of: "
            "'trade_route_disruption', 'extreme_weather', 'factory_fire', "
            "'port_congestion', 'geopolitical_event', 'cyber_attack', "
            "'labor_strike', 'regulatory_action', 'unknown'"
        )
    )
    geography: str = Field(
        description="Primary geographic location affected. E.g. 'Suez Canal, Egypt'"
    )
    affected_trade_routes: list[str] = Field(
        default_factory=list,
        description="List of trade routes impacted. E.g. ['Asia-Europe sea route']",
    )
    confidence: float = Field(
        ge=0.0, le=1.0,
        description="LLM confidence in this classification (0.0-1.0)",
    )
    summary: str = Field(
        description="One-sentence summary of the disruption event"
    )


# ── Classifier Agent ──────────────────────────────────────────────────────────
class ClassifierAgent:
    """
    Classifies a raw signal into a structured disruption event.
    Uses Gemini with_structured_output() for reliable Pydantic output.
    """

    def __init__(self) -> None:
        """Initialize LLM with structured output binding."""
        self._llm: Optional[ChatGoogleGenerativeAI] = None
        self._structured_llm = None
        self._init_llm()

    def _init_llm(self) -> None:
        """Initialize Gemini LLM. Logs warning (not error) if API key missing."""
        if not settings.google_api_key:
            logger.warning(
                "GOOGLE_API_KEY not set. ClassifierAgent will use keyword fallback."
            )
            return
        try:
            self._llm = ChatGoogleGenerativeAI(
                model=settings.gemini_model,
                google_api_key=settings.google_api_key,
                max_output_tokens=settings.llm_max_tokens,
                temperature=0.1,  # Low temperature for consistent classification
            )
            self._structured_llm = self._llm.with_structured_output(ClassificationOutput)
            logger.info("ClassifierAgent initialized with %s.", settings.gemini_model)
        except Exception as exc:
            logger.warning("ClassifierAgent LLM init failed: %s. Using fallback.", exc)

    async def classify(self, raw_signal: str) -> ClassificationOutput:
        """
        Classify raw signal text into structured disruption event.

        Args:
            raw_signal: Raw text from news/weather/port feed

        Returns:
            ClassificationOutput with event_type, geography, trade_routes, confidence
        """
        if self._structured_llm is None:
            logger.info("Using keyword-based fallback classification.")
            return self._keyword_fallback(raw_signal)

        prompt = (
            "You are a supply chain risk analyst. Classify the following signal into "
            "a structured disruption event. Be precise about geography.\n\n"
            f"Signal:\n{raw_signal[:1500]}"
        )

        try:
            result: ClassificationOutput = await self._structured_llm.ainvoke(prompt)
            logger.info(
                "Classified: event_type=%s geography=%s confidence=%.2f",
                result.event_type, result.geography, result.confidence,
            )
            return result
        except Exception as exc:
            logger.warning("LLM classification failed: %s. Using keyword fallback.", exc)
            return self._keyword_fallback(raw_signal)

    def _keyword_fallback(self, text: str) -> ClassificationOutput:
        """
        Keyword-based classification used when LLM unavailable.
        Deterministic — same input always produces same output.
        """
        text_lower = text.lower()

        # Determine event type
        if any(kw in text_lower for kw in ["suez", "canal", "vessel", "shipping lane"]):
            event_type = "trade_route_disruption"
            geography = "Suez Canal, Egypt"
            routes = ["Asia-Europe sea route", "Red Sea corridor"]
        elif any(kw in text_lower for kw in ["storm", "hurricane", "cyclone", "flood", "snow"]):
            event_type = "extreme_weather"
            geography = "Unknown"
            routes = []
        elif any(kw in text_lower for kw in ["fire", "explosion", "factory"]):
            event_type = "factory_fire"
            geography = "Unknown"
            routes = []
        elif any(kw in text_lower for kw in ["port", "congestion", "berth", "terminal"]):
            event_type = "port_congestion"
            geography = self._extract_port_geo(text_lower)
            routes = []
        elif any(kw in text_lower for kw in ["military", "war", "conflict", "sanction"]):
            event_type = "geopolitical_event"
            geography = "Unknown"
            routes = []
        else:
            event_type = "unknown"
            geography = "Unknown"
            routes = []

        return ClassificationOutput(
            event_type=event_type,
            geography=geography,
            affected_trade_routes=routes,
            confidence=0.6,  # Lower confidence for fallback
            summary=f"Keyword-classified event: {event_type} at {geography}",
        )

    def _extract_port_geo(self, text: str) -> str:
        """Extract port geography from text using keyword matching."""
        ports = {
            "rotterdam": "Rotterdam, Netherlands",
            "shanghai": "Shanghai, China",
            "singapore": "Singapore",
            "hamburg": "Hamburg, Germany",
            "antwerp": "Antwerp, Belgium",
        }
        for key, geo in ports.items():
            if key in text:
                return geo
        return "Unknown port"


# ── Module-level singleton ────────────────────────────────────────────────────
_classifier_instance: Optional[ClassifierAgent] = None


def get_classifier() -> ClassifierAgent:
    """Return singleton ClassifierAgent (initialized once)."""
    global _classifier_instance
    if _classifier_instance is None:
        _classifier_instance = ClassifierAgent()
    return _classifier_instance
