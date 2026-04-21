"""
Tests for agent keyword fallbacks (no LLM calls — deterministic).
Tests will use the fallback path since GOOGLE_API_KEY is not set in CI.
"""
import pytest
from app.agents.classifier import ClassifierAgent
from app.agents.severity import SeverityAgent
from app.agents.graph_mapper import GraphMapperAgent
from app.agents.cascade import CascadeAgent
from app.graph.seed_data import seed_supplier_graph


@pytest.fixture(autouse=True)
def setup_graph():
    seed_supplier_graph()


class TestClassifierAgent:

    @pytest.mark.asyncio
    async def test_suez_classification(self):
        """Suez signal must classify as trade_route_disruption."""
        agent = ClassifierAgent()
        # Force fallback by clearing API key reference
        agent._structured_llm = None

        result = await agent.classify(
            "Suez Canal vessel diversions reported due to Red Sea conflict."
        )
        assert result.event_type == "trade_route_disruption"
        assert "Suez" in result.geography or "Egypt" in result.geography

    @pytest.mark.asyncio
    async def test_storm_classification(self):
        """Storm text must classify as extreme_weather."""
        agent = ClassifierAgent()
        agent._structured_llm = None

        result = await agent.classify("Hurricane approaching Gulf coast — major storm warning.")
        assert result.event_type == "extreme_weather"

    @pytest.mark.asyncio
    async def test_factory_fire_classification(self):
        """Factory fire text must classify correctly."""
        agent = ClassifierAgent()
        agent._structured_llm = None

        result = await agent.classify("Factory fire at semiconductor plant — production halted.")
        assert result.event_type == "factory_fire"


class TestSeverityAgent:

    @pytest.mark.asyncio
    async def test_suez_severity_is_9_1(self):
        """Suez trade_route_disruption must score 9.1 (PRD demo requirement)."""
        agent = SeverityAgent()
        agent._structured_llm = None  # Force heuristic

        result = await agent.score(
            event_type="trade_route_disruption",
            geography="Suez Canal, Egypt",
            affected_nodes=["suez-hub", "rotterdam-dist"],
            raw_signal="Suez Canal blocked",
            affected_trade_routes=["Asia-Europe"],
        )
        assert result.severity_score == 9.1

    @pytest.mark.asyncio
    async def test_severity_in_range(self):
        """All event types must produce severity in [1, 10]."""
        agent = SeverityAgent()
        agent._structured_llm = None

        for event_type in ["factory_fire", "extreme_weather", "port_congestion", "unknown"]:
            result = await agent.score(event_type, "Unknown", [], "signal", [])
            assert 1.0 <= result.severity_score <= 10.0


class TestGraphMapperAgent:

    @pytest.mark.asyncio
    async def test_suez_maps_to_suez_hub(self):
        """'Suez Canal, Egypt' must map to 'suez-hub' node."""
        agent = GraphMapperAgent()
        result = await agent.map(
            geography="Suez Canal, Egypt",
            event_type="trade_route_disruption",
            affected_trade_routes=["Asia-Europe"],
        )
        assert result.primary_node == "suez-hub"
        assert result.mapping_method == "geo_match"
        assert result.mapping_confidence >= 0.9

    @pytest.mark.asyncio
    async def test_rotterdam_maps_correctly(self):
        """Rotterdam must map to rotterdam-dist."""
        agent = GraphMapperAgent()
        result = await agent.map("Rotterdam, Netherlands", "port_congestion", [])
        assert result.primary_node == "rotterdam-dist"

    @pytest.mark.asyncio
    async def test_suez_mapping_includes_affected_shipments(self):
        """Suez mapping must include the 4 Suez shipment IDs."""
        agent = GraphMapperAgent()
        result = await agent.map("Suez Canal, Egypt", "trade_route_disruption", [])
        assert len(result.affected_shipment_ids) == 4


class TestCascadeAgent:

    @pytest.mark.asyncio
    async def test_suez_cascade_has_downstream_nodes(self):
        """Suez cascade must include downstream nodes (rotterdam, frankfurt)."""
        agent = CascadeAgent()
        agent._llm = None  # Force template narrative

        result = await agent.simulate(
            primary_node="suez-hub",
            event_type="trade_route_disruption",
            severity_score=9.1,
            geography="Suez Canal, Egypt",
        )
        assert "rotterdam-dist" in result.cascade_nodes
        assert "frankfurt-warehouse" in result.cascade_nodes

    @pytest.mark.asyncio
    async def test_cascade_depth_minimum_2(self):
        """PRD rule: cascade depth must be at least 2."""
        agent = CascadeAgent()
        agent._llm = None

        result = await agent.simulate("suez-hub", "trade_route_disruption", 9.1, "Suez")
        assert result.cascade_depth >= 2

    @pytest.mark.asyncio
    async def test_suez_identifies_secondary_bottlenecks(self):
        """Suez disruption must identify rotterdam as secondary bottleneck."""
        agent = CascadeAgent()
        agent._llm = None

        result = await agent.simulate("suez-hub", "trade_route_disruption", 9.1, "Suez Canal")
        assert "rotterdam-dist" in result.secondary_bottlenecks

    @pytest.mark.asyncio
    async def test_unknown_node_returns_empty_cascade(self):
        """Unknown primary node must return empty cascade gracefully."""
        agent = CascadeAgent()
        agent._llm = None

        result = await agent.simulate("unknown", "trade_route_disruption", 5.0, "Unknown")
        assert result.cascade_nodes == []
