"""
Scenario Generator — produces exactly 3 rerouting options per disruption.
Uses hardcoded templates for the Suez Canal demo scenario (per PRD).
Uses LLM for other event types.
PRD rule: always generate EXACTLY 3 options.
"""
import logging
from dataclasses import dataclass
from typing import Optional

from app.agents.orchestrator import AgentState
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


@dataclass
class ScenarioOption:
    """
    A single rerouting option.
    option_index must be 1, 2, or 3.
    """

    option_index: int
    label: str
    description: str
    cost_delta_usd: float       # Additional cost in USD (positive = more expensive)
    time_delta_days: float      # Additional days (positive = slower)
    risk_score: float           # 1.0 (safe) to 10.0 (risky)


# ── Hardcoded Suez Canal scenarios (matches PRD demo script exactly) ──────────
_SUEZ_SCENARIOS: list[ScenarioOption] = [
    ScenarioOption(
        option_index=1,
        label="Cape of Good Hope Reroute",
        description=(
            "Divert all 4 affected Suez shipments via Cape of Good Hope. "
            "Additional 14 days transit time. Significant cost increase due to "
            "extra fuel, extended charter hire, and refrigeration running costs. "
            "Lower risk as route is stable. Cold chain integrity can be maintained "
            "with extended temperature monitoring."
        ),
        cost_delta_usd=28000.0,
        time_delta_days=14.0,
        risk_score=3.2,
    ),
    ScenarioOption(
        option_index=2,
        label="Emergency Air Freight (Critical SKUs) + Sea (Non-Critical)",
        description=(
            "Air freight the 2 most time-critical pharmaceutical SKUs "
            "(insulin API and oncology drug batch) from Chennai to Frankfurt. "
            "Remaining 2 shipments continue via Cape of Good Hope sea route. "
            "Dramatically reduces risk for highest-value cargo. Very high cost premium."
        ),
        cost_delta_usd=85000.0,
        time_delta_days=2.0,
        risk_score=1.8,
    ),
    ScenarioOption(
        option_index=3,
        label="Activate Berlin Backup Supplier",
        description=(
            "Activate Berlin Pharma GmbH (pre-qualified Tier 2 backup supplier) "
            "to supply Frankfurt warehouse directly. Berlin supplier can fulfil "
            "the critical SKU demand within 3 days. Suez-blocked shipments continue "
            "via Cape route for non-urgent inventory replenishment. "
            "Activation cost includes expedited onboarding and price differential."
        ),
        cost_delta_usd=12000.0,
        time_delta_days=3.0,
        risk_score=2.1,
    ),
]


class ScenarioGenerator:
    """
    Generates exactly 3 rerouting scenarios per disruption.
    Uses hardcoded templates for Suez events (fast, deterministic for demo).
    Uses LLM for other event types.
    """

    async def generate(self, agent_state: AgentState) -> list[ScenarioOption]:
        """
        Generate 3 scenarios from agent pipeline output.

        Args:
            agent_state: Completed AgentState from orchestrator.run_pipeline()

        Returns:
            List of exactly 3 ScenarioOption objects.
        """
        primary_node = agent_state.get("primary_node", "")
        event_type = agent_state.get("event_type", "unknown")

        # Use hardcoded Suez templates for the demo scenario
        if primary_node == "suez-hub" and event_type == "trade_route_disruption":
            logger.info("Using hardcoded Suez Canal scenarios (demo path).")
            return _SUEZ_SCENARIOS

        # LLM-generated scenarios for other event types
        logger.info(
            "Generating LLM scenarios for event=%s node=%s", event_type, primary_node
        )
        return await self._llm_generate(agent_state)

    async def _llm_generate(
        self, state: AgentState
    ) -> list[ScenarioOption]:
        """
        LLM-generated scenarios for non-Suez disruptions.
        Falls back to generic templates if LLM unavailable.
        """
        if not settings.google_api_key:
            return self._generic_fallback(state)

        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            from pydantic import BaseModel, Field

            class ScenarioList(BaseModel):
                scenarios: list[dict] = Field(
                    description="Exactly 3 scenarios with keys: label, description, cost_delta_usd, time_delta_days, risk_score"
                )

            llm = ChatGoogleGenerativeAI(
                model=settings.gemini_model,
                google_api_key=settings.google_api_key,
                max_output_tokens=settings.llm_max_tokens,
                temperature=0.4,
            )
            structured = llm.with_structured_output(ScenarioList)

            prompt = (
                f"Supply chain disruption: {state.get('event_type')} at {state.get('geography')}\n"
                f"Severity: {state.get('severity_score')}/10\n"
                f"Primary disrupted node: {state.get('primary_node')}\n"
                f"Cascade risk: {state.get('risk_summary', 'unknown')}\n\n"
                "Generate EXACTLY 3 rerouting/resilience options for a pharmaceutical "
                "supply chain company. For each scenario provide: label (short name), "
                "description (2-3 sentences), cost_delta_usd (extra cost in USD), "
                "time_delta_days (extra transit days), risk_score (1.0-10.0, lower=safer)."
            )

            result: ScenarioList = await structured.ainvoke(prompt)
            scenarios_raw = result.scenarios[:3]  # Enforce exactly 3

            options = []
            for i, s in enumerate(scenarios_raw, start=1):
                options.append(ScenarioOption(
                    option_index=i,
                    label=str(s.get("label", f"Option {i}")),
                    description=str(s.get("description", "")),
                    cost_delta_usd=float(s.get("cost_delta_usd", 0)),
                    time_delta_days=float(s.get("time_delta_days", 0)),
                    risk_score=float(s.get("risk_score", 5.0)),
                ))

            # Pad to 3 if LLM returned fewer
            while len(options) < 3:
                options.extend(self._generic_fallback(state)[:3 - len(options)])

            logger.info("LLM generated %d scenarios.", len(options))
            return options[:3]

        except Exception as exc:
            logger.warning("LLM scenario generation failed: %s. Using fallback.", exc)
            return self._generic_fallback(state)

    def _generic_fallback(self, state: AgentState) -> list[ScenarioOption]:
        """Generic fallback scenarios for any disruption type."""
        event = state.get("event_type", "disruption")
        geo = state.get("geography", "affected area")

        return [
            ScenarioOption(
                option_index=1,
                label=f"Wait and Monitor — {geo}",
                description=f"Hold current shipments and monitor {event} resolution. Minimal cost but high time risk.",
                cost_delta_usd=5000.0,
                time_delta_days=7.0,
                risk_score=6.0,
            ),
            ScenarioOption(
                option_index=2,
                label="Activate Backup Supplier",
                description="Switch fulfilment to nearest qualified backup supplier. Higher cost, faster resolution.",
                cost_delta_usd=25000.0,
                time_delta_days=4.0,
                risk_score=3.0,
            ),
            ScenarioOption(
                option_index=3,
                label="Partial Air Freight + Reroute",
                description="Air freight critical inventory, reroute remainder via alternative logistics provider.",
                cost_delta_usd=60000.0,
                time_delta_days=2.0,
                risk_score=2.0,
            ),
        ]
