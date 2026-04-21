"""
Orchestrator — LangGraph StateGraph wiring all 4 agents in sequence.
State flows: classify → score_severity → map_graph → simulate_cascade

Inputs a raw signal string.
Outputs AgentState with all agent results populated.
"""
import logging
from typing import Any, Optional, TypedDict

from langgraph.graph import END, StateGraph

from app.agents.cascade import get_cascade_agent
from app.agents.classifier import get_classifier
from app.agents.graph_mapper import get_graph_mapper
from app.agents.severity import get_severity_agent

logger = logging.getLogger(__name__)


# ── Shared state schema ───────────────────────────────────────────────────────
class AgentState(TypedDict, total=False):
    """
    Shared state passed between all agents in the LangGraph pipeline.
    Each agent reads from prior fields and writes its own output fields.
    'total=False' means all keys are optional — graph builds it incrementally.
    """

    # Input
    raw_signal: str
    source: str
    company_id: str

    # ClassifierAgent output
    event_type: str
    geography: str
    affected_trade_routes: list[str]
    classification_confidence: float
    classification_summary: str

    # SeverityAgent output
    severity_score: float
    severity_reasoning: str
    affected_shipment_count: int
    estimated_delay_days: float
    estimated_cost_impact_usd: float

    # GraphMapperAgent output
    primary_node: str
    affected_nodes: list[str]
    affected_shipment_ids: list[str]
    mapping_confidence: float
    mapping_method: str

    # CascadeAgent output
    cascade_nodes: list[str]
    cascade_depth: int
    risk_summary: str
    secondary_bottlenecks: list[str]
    stock_out_risk_nodes: list[str]

    # Pipeline metadata
    pipeline_error: Optional[str]
    pipeline_complete: bool


# ── Agent node functions ──────────────────────────────────────────────────────

async def classify_node(state: AgentState) -> AgentState:
    """
    LangGraph node: run ClassifierAgent.
    Reads: raw_signal
    Writes: event_type, geography, affected_trade_routes, classification_confidence
    """
    logger.info("[Pipeline] classify_node — signal length=%d", len(state.get("raw_signal", "")))
    try:
        agent = get_classifier()
        result = await agent.classify(state["raw_signal"])
        return {
            **state,
            "event_type": result.event_type,
            "geography": result.geography,
            "affected_trade_routes": result.affected_trade_routes,
            "classification_confidence": result.confidence,
            "classification_summary": result.summary,
        }
    except Exception as exc:
        logger.error("classify_node error: %s", exc, exc_info=True)
        return {**state, "pipeline_error": f"classifier: {exc}"}


async def severity_node(state: AgentState) -> AgentState:
    """
    LangGraph node: run SeverityAgent.
    Reads: event_type, geography, affected_nodes (if available), raw_signal
    Writes: severity_score, severity_reasoning, affected_shipment_count, etc.
    """
    if state.get("pipeline_error"):
        return state  # Skip remaining nodes if pipeline already errored

    logger.info(
        "[Pipeline] severity_node — event=%s geo=%s",
        state.get("event_type"), state.get("geography")
    )
    try:
        agent = get_severity_agent()
        result = await agent.score(
            event_type=state.get("event_type", "unknown"),
            geography=state.get("geography", "Unknown"),
            affected_nodes=state.get("affected_nodes", []),
            raw_signal=state.get("raw_signal", ""),
            affected_trade_routes=state.get("affected_trade_routes", []),
        )
        return {
            **state,
            "severity_score": result.severity_score,
            "severity_reasoning": result.reasoning,
            "affected_shipment_count": result.affected_shipment_count,
            "estimated_delay_days": result.estimated_delay_days,
            "estimated_cost_impact_usd": result.estimated_cost_impact_usd,
        }
    except Exception as exc:
        logger.error("severity_node error: %s", exc, exc_info=True)
        return {**state, "pipeline_error": f"severity: {exc}"}


async def graph_map_node(state: AgentState) -> AgentState:
    """
    LangGraph node: run GraphMapperAgent.
    Reads: geography, event_type, affected_trade_routes
    Writes: primary_node, affected_nodes, affected_shipment_ids, mapping_confidence
    """
    if state.get("pipeline_error"):
        return state

    logger.info(
        "[Pipeline] graph_map_node — geography=%s", state.get("geography")
    )
    try:
        agent = get_graph_mapper()
        result = await agent.map(
            geography=state.get("geography", "Unknown"),
            event_type=state.get("event_type", "unknown"),
            affected_trade_routes=state.get("affected_trade_routes", []),
        )
        return {
            **state,
            "primary_node": result.primary_node,
            "affected_nodes": result.affected_nodes,
            "affected_shipment_ids": result.affected_shipment_ids,
            "mapping_confidence": result.mapping_confidence,
            "mapping_method": result.mapping_method,
        }
    except Exception as exc:
        logger.error("graph_map_node error: %s", exc, exc_info=True)
        return {**state, "pipeline_error": f"graph_mapper: {exc}"}


async def cascade_node(state: AgentState) -> AgentState:
    """
    LangGraph node: run CascadeAgent.
    Reads: primary_node, event_type, severity_score, geography
    Writes: cascade_nodes, cascade_depth, risk_summary, secondary_bottlenecks
    """
    if state.get("pipeline_error"):
        return state

    logger.info(
        "[Pipeline] cascade_node — primary_node=%s severity=%.1f",
        state.get("primary_node"), state.get("severity_score", 0)
    )
    try:
        agent = get_cascade_agent()
        result = await agent.simulate(
            primary_node=state.get("primary_node", "unknown"),
            event_type=state.get("event_type", "unknown"),
            severity_score=state.get("severity_score", 5.0),
            geography=state.get("geography", "Unknown"),
        )
        return {
            **state,
            "cascade_nodes": result.cascade_nodes,
            "cascade_depth": result.cascade_depth,
            "risk_summary": result.risk_summary,
            "secondary_bottlenecks": result.secondary_bottlenecks,
            "stock_out_risk_nodes": result.stock_out_risk_nodes,
            "pipeline_complete": True,
        }
    except Exception as exc:
        logger.error("cascade_node error: %s", exc, exc_info=True)
        return {**state, "pipeline_error": f"cascade: {exc}"}


# ── Build LangGraph pipeline ──────────────────────────────────────────────────

def _build_pipeline() -> Any:
    """
    Build the LangGraph StateGraph pipeline.
    Sequential: classify → severity → graph_map → cascade → END
    """
    builder = StateGraph(AgentState)

    builder.add_node("classify", classify_node)
    builder.add_node("score_severity", severity_node)
    builder.add_node("map_graph", graph_map_node)
    builder.add_node("simulate_cascade", cascade_node)

    builder.set_entry_point("classify")
    builder.add_edge("classify", "score_severity")
    builder.add_edge("score_severity", "map_graph")
    builder.add_edge("map_graph", "simulate_cascade")
    builder.add_edge("simulate_cascade", END)

    return builder.compile()


# Compile once at module load — not per-request
_pipeline = _build_pipeline()


# ── Public entry point ────────────────────────────────────────────────────────

async def run_pipeline(
    raw_signal: str,
    source: str = "unknown",
    company_id: str = "pharma-distrib-india",
) -> AgentState:
    """
    Run the full 4-agent pipeline on a raw signal.

    Args:
        raw_signal : Text from news/weather/port feed
        source     : Signal source identifier
        company_id : Company context for graph/shipment lookup

    Returns:
        AgentState with all agent outputs populated.
        Check state['pipeline_error'] — None means success.
    """
    logger.info(
        "Running agent pipeline: source=%s signal_preview='%s...'",
        source, raw_signal[:60]
    )

    initial_state: AgentState = {
        "raw_signal": raw_signal,
        "source": source,
        "company_id": company_id,
        "pipeline_error": None,
        "pipeline_complete": False,
    }

    final_state: AgentState = await _pipeline.ainvoke(initial_state)

    if final_state.get("pipeline_error"):
        logger.error(
            "Pipeline completed with error: %s", final_state["pipeline_error"]
        )
    else:
        logger.info(
            "Pipeline complete: event=%s severity=%.1f primary_node=%s cascade=%d nodes",
            final_state.get("event_type"),
            final_state.get("severity_score", 0),
            final_state.get("primary_node"),
            len(final_state.get("cascade_nodes", [])),
        )

    return final_state
