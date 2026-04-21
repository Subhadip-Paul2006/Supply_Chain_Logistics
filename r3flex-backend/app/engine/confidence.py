"""
Confidence Evaluator — computes confidence score for the recommended scenario.
Composite of 4 sub-factors, compared against configurable threshold (default 85%).
"""
import logging
from dataclasses import dataclass

from app.agents.orchestrator import AgentState
from app.config import get_settings
from app.engine.tradeoff import ScoredScenario

logger = logging.getLogger(__name__)
settings = get_settings()


@dataclass
class ConfidenceResult:
    """
    Confidence evaluation output.
    above_threshold = True → auto-execute.
    above_threshold = False → escalate to human.
    """

    confidence: float           # 0.0–1.0 composite confidence score
    above_threshold: bool       # True if confidence >= settings.confidence_threshold
    threshold_used: float       # The threshold value at evaluation time
    breakdown: dict             # Sub-factor scores for transparency

    # Pre-formatted for audit log reasoning
    reasoning: str


class ConfidenceEvaluator:
    """
    Evaluates confidence in the top recommended scenario.

    4 sub-factors (equally weighted at 0.25 each):
        1. data_quality     — how complete/fresh the input signal is
        2. classification   — classifier agent's own confidence score
        3. scenario_gap     — how much better the top option is vs #2 (differentiation)
        4. severity_fit     — whether severity score supports decisive action

    PRD rule: default threshold = 85% (0.85). Configurable per company.
    """

    def evaluate(
        self,
        recommended: ScoredScenario,
        all_scenarios: list[ScoredScenario],
        agent_state: AgentState,
    ) -> ConfidenceResult:
        """
        Compute confidence score for the recommended scenario.

        Args:
            recommended  : Top-ranked ScoredScenario from TradeoffScorer
            all_scenarios: All 3 scored scenarios (for gap analysis)
            agent_state  : Full AgentState from orchestrator pipeline

        Returns:
            ConfidenceResult with confidence score and threshold comparison.
        """
        threshold = settings.confidence_threshold

        # ── Sub-factor 1: Data quality ────────────────────────────────────────
        # High if: signal has text > 100 chars, source identified, geography mapped
        signal_len = len(agent_state.get("raw_signal", ""))
        mapping_conf = agent_state.get("mapping_confidence", 0.5)
        primary_node = agent_state.get("primary_node", "")

        data_quality = 0.0
        if signal_len > 500:
            data_quality += 0.4
        elif signal_len > 100:
            data_quality += 0.2
        data_quality += mapping_conf * 0.4
        if primary_node and primary_node != "unknown":
            data_quality += 0.2
        data_quality = min(1.0, data_quality)

        # ── Sub-factor 2: Classification confidence ───────────────────────────
        classification_conf = agent_state.get("classification_confidence", 0.6)

        # ── Sub-factor 3: Scenario differentiation (gap between #1 and #2) ───
        # Wide gap = confident the best option is clearly better
        scenario_gap = 0.5  # Default: moderate gap
        if len(all_scenarios) >= 2:
            best = all_scenarios[0].composite_score
            second = all_scenarios[1].composite_score
            gap = second - best  # Higher gap = more differentiation
            # Map gap [0, 0.33] → [0, 1.0]
            scenario_gap = min(1.0, gap * 3.0)

        # ── Sub-factor 4: Severity appropriateness ────────────────────────────
        # High severity (>= 7) + decisive recommended action = high confidence
        # Very high severity (>= 9) = very clear action needed = higher confidence
        severity = agent_state.get("severity_score", 5.0)
        if severity >= 9.0:
            severity_fit = 0.95
        elif severity >= 7.0:
            severity_fit = 0.80
        elif severity >= 5.0:
            severity_fit = 0.65
        else:
            severity_fit = 0.40

        # ── Composite (equal weights) ─────────────────────────────────────────
        confidence = (
            data_quality * 0.25
            + classification_conf * 0.25
            + scenario_gap * 0.25
            + severity_fit * 0.25
        )
        confidence = round(min(1.0, confidence), 4)
        above = confidence >= threshold

        breakdown = {
            "data_quality": round(data_quality, 4),
            "classification_confidence": round(classification_conf, 4),
            "scenario_gap": round(scenario_gap, 4),
            "severity_fit": round(severity_fit, 4),
        }

        reasoning = (
            f"Confidence {confidence:.0%} (threshold {threshold:.0%}). "
            f"Data quality: {data_quality:.0%}. "
            f"Classifier confidence: {classification_conf:.0%}. "
            f"Scenario differentiation: {scenario_gap:.0%}. "
            f"Severity appropriateness: {severity_fit:.0%} (severity={severity:.1f}/10). "
            f"Decision: {'AUTO-EXECUTE' if above else 'ESCALATE TO HUMAN'}."
        )

        logger.info(
            "Confidence: %.2f (threshold=%.2f) → %s",
            confidence, threshold, "AUTO-EXECUTE" if above else "ESCALATE"
        )
        logger.debug("Confidence breakdown: %s", breakdown)

        return ConfidenceResult(
            confidence=confidence,
            above_threshold=above,
            threshold_used=threshold,
            breakdown=breakdown,
            reasoning=reasoning,
        )
