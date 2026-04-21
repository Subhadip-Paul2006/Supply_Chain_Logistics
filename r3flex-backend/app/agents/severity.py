"""
Severity Agent — scores disruption impact on scale 1.0–10.0.
Considers: trade volume at risk, supplier proximity, historical frequency,
cascade potential, and time-criticality of affected cargo.
"""
import logging
from typing import Optional

from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


# ── Output schema ─────────────────────────────────────────────────────────────
class SeverityOutput(BaseModel):
    """Structured output from severity scoring LLM call."""

    severity_score: float = Field(
        ge=1.0, le=10.0,
        description=(
            "Impact score 1.0–10.0. "
            "1-3: Minor disruption, localized effect. "
            "4-6: Moderate, multi-node impact. "
            "7-8: Severe, major route/supplier loss. "
            "9-10: Critical, systemic supply chain failure."
        ),
    )
    reasoning: str = Field(
        description="Chain-of-thought explaining score factors and key risks"
    )
    affected_shipment_count: int = Field(
        ge=0, description="Estimated number of in-transit shipments impacted"
    )
    estimated_delay_days: float = Field(
        ge=0.0, description="Expected delay in days for affected shipments"
    )
    estimated_cost_impact_usd: float = Field(
        ge=0.0, description="Rough cost impact in USD across all affected shipments"
    )


# ── Severity Agent ────────────────────────────────────────────────────────────
class SeverityAgent:
    """
    Scores the impact severity of a classified disruption event.
    Uses the supplier graph context and shipments data to produce grounded scores.
    """

    def __init__(self) -> None:
        """Initialize LLM with structured output binding."""
        self._structured_llm = None
        self._init_llm()

    def _init_llm(self) -> None:
        """Initialize Gemini LLM."""
        if not settings.google_api_key:
            logger.warning("GOOGLE_API_KEY not set. SeverityAgent will use heuristic fallback.")
            return
        try:
            llm = ChatGoogleGenerativeAI(
                model=settings.gemini_model,
                google_api_key=settings.google_api_key,
                max_output_tokens=settings.llm_max_tokens,
                temperature=0.2,
            )
            self._structured_llm = llm.with_structured_output(SeverityOutput)
            logger.info("SeverityAgent initialized with %s.", settings.gemini_model)
        except Exception as exc:
            logger.warning("SeverityAgent LLM init failed: %s. Using fallback.", exc)

    async def score(
        self,
        event_type: str,
        geography: str,
        affected_nodes: list[str],
        raw_signal: str,
        affected_trade_routes: list[str],
    ) -> SeverityOutput:
        """
        Score the severity of a disruption event.

        Args:
            event_type       : Classified event type from ClassifierAgent
            geography        : Affected geography
            affected_nodes   : Supplier graph node IDs already mapped
            raw_signal       : Original signal text
            affected_trade_routes: Trade routes from ClassifierAgent

        Returns:
            SeverityOutput with severity_score 1.0–10.0 and full reasoning
        """
        # Build network context for LLM
        from app.graph.seed_data import get_suez_shipments, get_all_shipments
        all_shipments = get_all_shipments()
        suez_shipments = get_suez_shipments()

        context = (
            f"Supply network: PharmaDistrib India — pharmaceutical cold chain.\n"
            f"Total active shipments: {len(all_shipments)}\n"
            f"Shipments through Suez Canal: {len(suez_shipments)}\n"
            f"Affected network nodes: {', '.join(affected_nodes) if affected_nodes else 'unknown'}\n"
            f"Event type: {event_type}\n"
            f"Affected geography: {geography}\n"
            f"Trade routes at risk: {', '.join(affected_trade_routes) if affected_trade_routes else 'unknown'}\n"
        )

        if self._structured_llm is None:
            return self._heuristic_fallback(event_type, geography, len(affected_nodes))

        prompt = (
            "You are a supply chain risk expert scoring disruption severity. "
            "Score on scale 1.0 (minor) to 10.0 (catastrophic). "
            "Pharmaceutical cargo is time-critical and temperature-sensitive — "
            "factor this into delay and cost impact.\n\n"
            f"Network context:\n{context}\n\n"
            f"Raw signal:\n{raw_signal[:1000]}"
        )

        try:
            result: SeverityOutput = await self._structured_llm.ainvoke(prompt)
            logger.info(
                "Severity scored: %.1f/10 — affected_shipments=%d delay=%.1fd cost=$%.0f",
                result.severity_score,
                result.affected_shipment_count,
                result.estimated_delay_days,
                result.estimated_cost_impact_usd,
            )
            return result
        except Exception as exc:
            logger.warning("LLM severity scoring failed: %s. Using heuristic.", exc)
            return self._heuristic_fallback(event_type, geography, len(affected_nodes))

    def _heuristic_fallback(
        self, event_type: str, geography: str, node_count: int
    ) -> SeverityOutput:
        """
        Heuristic severity fallback.
        Suez Canal disruptions get 9.1 per PRD demo requirements.
        """
        score_map = {
            "trade_route_disruption": 9.1,  # Matches demo
            "factory_fire": 7.5,
            "extreme_weather": 6.5,
            "port_congestion": 5.0,
            "geopolitical_event": 8.0,
            "cyber_attack": 7.0,
            "labor_strike": 5.5,
            "regulatory_action": 4.0,
            "unknown": 3.0,
        }
        base_score = score_map.get(event_type, 3.0)

        # Suez-specific override for demo
        if "suez" in geography.lower() and event_type == "trade_route_disruption":
            base_score = 9.1

        return SeverityOutput(
            severity_score=base_score,
            reasoning=(
                f"Heuristic scoring: {event_type} at {geography}. "
                f"Base score {base_score}/10 for this event type. "
                f"{node_count} supplier nodes affected."
            ),
            affected_shipment_count=4 if "suez" in geography.lower() else node_count,
            estimated_delay_days=14.0 if "suez" in geography.lower() else 5.0,
            estimated_cost_impact_usd=1807000.0 if "suez" in geography.lower() else 50000.0,
        )


# ── Module-level singleton ────────────────────────────────────────────────────
_severity_instance: Optional[SeverityAgent] = None


def get_severity_agent() -> SeverityAgent:
    """Return singleton SeverityAgent."""
    global _severity_instance
    if _severity_instance is None:
        _severity_instance = SeverityAgent()
    return _severity_instance
