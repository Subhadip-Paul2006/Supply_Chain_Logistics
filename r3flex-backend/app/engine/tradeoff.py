"""
Tradeoff Scorer — ranks 3 scenarios on weighted cost/time/risk matrix.
Weights: time 40%, cost 35%, risk 25% (configurable).
Lower composite score = better option.
"""
import logging
from dataclasses import dataclass

from app.engine.scenario_gen import ScenarioOption

logger = logging.getLogger(__name__)


@dataclass
class ScoredScenario:
    """A scenario with composite tradeoff score added."""

    option: ScenarioOption
    composite_score: float      # Lower = better
    cost_score: float           # Normalized 0-1 (0=cheapest)
    time_score: float           # Normalized 0-1 (0=fastest)
    risk_score_normalized: float  # Normalized 0-1 (0=safest)
    recommended: bool           # True only for lowest composite_score


class TradeoffScorer:
    """
    Scores 3 scenarios using a weighted normalized matrix.

    Scoring method:
        1. Normalize each dimension (cost, time, risk) to 0-1 range
           across the 3 options (min=0, max=1)
        2. Apply weights to get composite score
        3. Rank by composite — lowest = recommended

    Weights (can be configured per company in future):
        time:  0.40 (pharmaceutical cold chain is time-critical)
        cost:  0.35
        risk:  0.25
    """

    DEFAULT_WEIGHTS = {
        "time": 0.40,
        "cost": 0.35,
        "risk": 0.25,
    }

    def score(
        self,
        scenarios: list[ScenarioOption],
        weights: dict[str, float] | None = None,
    ) -> list[ScoredScenario]:
        """
        Score and rank scenarios by weighted tradeoff.

        Args:
            scenarios : List of exactly 3 ScenarioOption objects
            weights   : Optional custom weight dict (must sum to 1.0)

        Returns:
            List of ScoredScenario objects, sorted by composite_score ascending.
            First item has recommended=True.
        """
        if not scenarios:
            logger.warning("TradeoffScorer received empty scenarios list.")
            return []

        w = weights or self.DEFAULT_WEIGHTS

        # Verify weights sum to ~1.0
        total = sum(w.values())
        if abs(total - 1.0) > 0.01:
            logger.warning(
                "Weights sum to %.2f, not 1.0. Normalizing.", total
            )
            w = {k: v / total for k, v in w.items()}

        # ── Extract raw values ────────────────────────────────────────────────
        costs = [s.cost_delta_usd for s in scenarios]
        times = [s.time_delta_days for s in scenarios]
        risks = [s.risk_score for s in scenarios]

        # ── Min-max normalize each dimension ──────────────────────────────────
        def normalize(values: list[float]) -> list[float]:
            """Normalize list to [0, 1] range. All same → all 0.5."""
            min_v, max_v = min(values), max(values)
            if max_v == min_v:
                return [0.5] * len(values)
            return [(v - min_v) / (max_v - min_v) for v in values]

        cost_norm = normalize(costs)
        time_norm = normalize(times)
        risk_norm = normalize(risks)

        # ── Compute composite score ───────────────────────────────────────────
        scored = []
        for i, scenario in enumerate(scenarios):
            composite = (
                w["cost"] * cost_norm[i]
                + w["time"] * time_norm[i]
                + w["risk"] * risk_norm[i]
            )
            scored.append(ScoredScenario(
                option=scenario,
                composite_score=round(composite, 4),
                cost_score=round(cost_norm[i], 4),
                time_score=round(time_norm[i], 4),
                risk_score_normalized=round(risk_norm[i], 4),
                recommended=False,
            ))

        # ── Rank — lowest composite score = best ─────────────────────────────
        scored.sort(key=lambda s: s.composite_score)
        scored[0].recommended = True

        logger.info(
            "Tradeoff scoring complete. Recommended: option_index=%d composite=%.4f",
            scored[0].option.option_index,
            scored[0].composite_score,
        )

        for s in scored:
            logger.debug(
                "  Option %d '%s': cost=%.0f time=%.0f risk=%.1f → composite=%.4f%s",
                s.option.option_index,
                s.option.label,
                s.option.cost_delta_usd,
                s.option.time_delta_days,
                s.option.risk_score,
                s.composite_score,
                " ← RECOMMENDED" if s.recommended else "",
            )

        return scored
