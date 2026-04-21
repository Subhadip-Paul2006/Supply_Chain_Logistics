"""
Tests for decision engine components.
All tests use mock/hardcoded data — no LLM or DB calls.
"""
import pytest
from app.engine.scenario_gen import ScenarioGenerator, ScenarioOption, _SUEZ_SCENARIOS
from app.engine.tradeoff import TradeoffScorer
from app.engine.confidence import ConfidenceEvaluator
from app.agents.orchestrator import AgentState


# ── Scenario Generator tests ──────────────────────────────────────────────────

class TestScenarioGenerator:

    @pytest.mark.asyncio
    async def test_suez_returns_exactly_3_scenarios(self):
        """PRD rule: always generate exactly 3 options."""
        gen = ScenarioGenerator()
        state: AgentState = {
            "primary_node": "suez-hub",
            "event_type": "trade_route_disruption",
            "geography": "Suez Canal, Egypt",
        }
        scenarios = await gen.generate(state)
        assert len(scenarios) == 3

    @pytest.mark.asyncio
    async def test_suez_scenario_option_indices(self):
        """Scenarios must have option_index 1, 2, 3."""
        gen = ScenarioGenerator()
        state: AgentState = {
            "primary_node": "suez-hub",
            "event_type": "trade_route_disruption",
        }
        scenarios = await gen.generate(state)
        indices = [s.option_index for s in scenarios]
        assert sorted(indices) == [1, 2, 3]

    @pytest.mark.asyncio
    async def test_suez_scenario_costs_match_prd(self):
        """PRD demo script specifies exact costs: $28K, $85K, $12K."""
        gen = ScenarioGenerator()
        state: AgentState = {
            "primary_node": "suez-hub",
            "event_type": "trade_route_disruption",
        }
        scenarios = await gen.generate(state)
        costs = {s.option_index: s.cost_delta_usd for s in scenarios}
        assert costs[1] == 28000.0
        assert costs[2] == 85000.0
        assert costs[3] == 12000.0

    @pytest.mark.asyncio
    async def test_berlin_backup_is_cheapest_suez_option(self):
        """Option 3 (Berlin backup) must be the lowest cost Suez scenario."""
        gen = ScenarioGenerator()
        state: AgentState = {
            "primary_node": "suez-hub",
            "event_type": "trade_route_disruption",
        }
        scenarios = await gen.generate(state)
        option_3 = next(s for s in scenarios if s.option_index == 3)
        other_costs = [s.cost_delta_usd for s in scenarios if s.option_index != 3]
        assert option_3.cost_delta_usd < min(other_costs)


# ── Tradeoff Scorer tests ─────────────────────────────────────────────────────

class TestTradeoffScorer:

    def _make_scenarios(self):
        return [
            ScenarioOption(1, "Cape Route", "", 28000, 14, 3.2),
            ScenarioOption(2, "Air Freight", "", 85000, 2, 1.8),
            ScenarioOption(3, "Berlin Backup", "", 12000, 3, 2.1),
        ]

    def test_returns_3_scored_scenarios(self):
        scorer = TradeoffScorer()
        scored = scorer.score(self._make_scenarios())
        assert len(scored) == 3

    def test_exactly_one_recommended(self):
        scorer = TradeoffScorer()
        scored = scorer.score(self._make_scenarios())
        recommended = [s for s in scored if s.recommended]
        assert len(recommended) == 1

    def test_sorted_by_composite_ascending(self):
        scorer = TradeoffScorer()
        scored = scorer.score(self._make_scenarios())
        composites = [s.composite_score for s in scored]
        assert composites == sorted(composites)

    def test_berlin_backup_recommended(self):
        """
        With default weights (time 40%, cost 35%, risk 25%),
        Berlin backup ($12K, +3d, risk=2.1) should be recommended.
        It wins on cost and is nearly as fast as air freight.
        """
        scorer = TradeoffScorer()
        scored = scorer.score(self._make_scenarios())
        recommended = next(s for s in scored if s.recommended)
        assert recommended.option.option_index == 3, \
            "Berlin Backup should be recommended (lowest composite score)"

    def test_composite_scores_in_0_1_range(self):
        """Normalized composite scores must be in [0, 1]."""
        scorer = TradeoffScorer()
        scored = scorer.score(self._make_scenarios())
        for s in scored:
            assert 0.0 <= s.composite_score <= 1.0

    def test_empty_scenarios_returns_empty(self):
        scorer = TradeoffScorer()
        result = scorer.score([])
        assert result == []


# ── Confidence Evaluator tests ────────────────────────────────────────────────

class TestConfidenceEvaluator:

    def _make_agent_state(self, severity=9.1, classification_conf=0.92) -> AgentState:
        return {
            "raw_signal": "Suez Canal disruption — vessel diversions reported. " * 20,
            "severity_score": severity,
            "classification_confidence": classification_conf,
            "mapping_confidence": 0.92,
            "primary_node": "suez-hub",
            "source": "port_mock",
        }

    def _make_scored_scenarios(self):
        from app.engine.tradeoff import ScoredScenario
        options = [
            ScenarioOption(1, "Cape", "", 28000, 14, 3.2),
            ScenarioOption(2, "Air", "", 85000, 2, 1.8),
            ScenarioOption(3, "Berlin", "", 12000, 3, 2.1),
        ]
        scorer = TradeoffScorer()
        return scorer.score(options)

    def test_suez_demo_above_threshold(self):
        """
        PRD demo: Suez scenario must score >= 85% confidence.
        Expected: 91% per PRD demo script.
        """
        evaluator = ConfidenceEvaluator()
        scored = self._make_scored_scenarios()
        recommended = next(s for s in scored if s.recommended)
        state = self._make_agent_state(severity=9.1, classification_conf=0.92)

        result = evaluator.evaluate(recommended, scored, state)

        assert result.above_threshold, \
            f"Suez demo must exceed threshold. Got {result.confidence:.2%}"
        assert result.confidence >= 0.85

    def test_low_confidence_below_threshold(self):
        """Low severity + low classification confidence → below threshold."""
        evaluator = ConfidenceEvaluator()
        scored = self._make_scored_scenarios()
        recommended = next(s for s in scored if s.recommended)
        state = self._make_agent_state(severity=2.0, classification_conf=0.3)
        state["raw_signal"] = "minor"  # Short signal
        state["mapping_confidence"] = 0.1
        state["primary_node"] = "unknown"

        result = evaluator.evaluate(recommended, scored, state)

        assert not result.above_threshold, \
            f"Low confidence scenario must be below threshold. Got {result.confidence:.2%}"

    def test_confidence_in_0_1_range(self):
        """Confidence must always be in [0.0, 1.0]."""
        evaluator = ConfidenceEvaluator()
        scored = self._make_scored_scenarios()
        recommended = next(s for s in scored if s.recommended)

        for severity in [1.0, 5.0, 9.1, 10.0]:
            state = self._make_agent_state(severity=severity)
            result = evaluator.evaluate(recommended, scored, state)
            assert 0.0 <= result.confidence <= 1.0

    def test_reasoning_contains_threshold(self):
        """Reasoning text must reference the threshold for audit clarity."""
        evaluator = ConfidenceEvaluator()
        scored = self._make_scored_scenarios()
        recommended = next(s for s in scored if s.recommended)
        state = self._make_agent_state()

        result = evaluator.evaluate(recommended, scored, state)
        assert "threshold" in result.reasoning.lower()
