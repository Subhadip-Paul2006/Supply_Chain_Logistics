"""
Cascade Agent — simulates second-order downstream impact.
Traverses minimum 2 hops from disruption node in supplier graph.
Uses LLM to generate human-readable risk summary of cascade effects.
"""
import logging
from typing import Optional

from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field

from app.config import get_settings
from app.graph.supplier_graph import get_supplier_graph

logger = logging.getLogger(__name__)
settings = get_settings()


# ── Output schema ─────────────────────────────────────────────────────────────
class CascadeOutput(BaseModel):
    """Structured output from cascade simulation."""

    cascade_nodes: list[str] = Field(
        description="Node IDs of second-order affected suppliers (2+ hops from disruption)"
    )
    cascade_depth: int = Field(
        ge=2, description="Number of hops traversed (always >= 2 per PRD rule)"
    )
    risk_summary: str = Field(
        description=(
            "Human-readable summary of cascade risks. "
            "Include specific node names and downstream consequences."
        )
    )
    secondary_bottlenecks: list[str] = Field(
        default_factory=list,
        description="Nodes that become new bottlenecks due to increased load from rerouting",
    )
    stock_out_risk_nodes: list[str] = Field(
        default_factory=list,
        description="Nodes at risk of stock-out if disruption continues beyond 2 weeks",
    )


class CascadeAgent:
    """
    Simulates second-order cascade effects in the supplier network.

    Graph traversal (via NetworkX BFS) happens deterministically.
    LLM generates the risk narrative based on traversal results.
    PRD rule: must traverse at least 2 hops from disruption node.
    """

    def __init__(self) -> None:
        """Initialize LLM."""
        self._llm = None
        self._init_llm()

    def _init_llm(self) -> None:
        """Initialize Gemini LLM for risk narrative generation."""
        if not settings.google_api_key:
            logger.warning("GOOGLE_API_KEY not set. CascadeAgent will use template summary.")
            return
        try:
            self._llm = ChatGoogleGenerativeAI(
                model=settings.gemini_model,
                google_api_key=settings.google_api_key,
                max_output_tokens=settings.llm_max_tokens,
                temperature=0.3,
            )
            logger.info("CascadeAgent initialized with %s.", settings.gemini_model)
        except Exception as exc:
            logger.warning("CascadeAgent LLM init failed: %s", exc)

    async def simulate(
        self,
        primary_node: str,
        event_type: str,
        severity_score: float,
        geography: str,
    ) -> CascadeOutput:
        """
        Simulate cascade from primary disrupted node.
        BFS traversal always runs (deterministic via NetworkX).
        LLM generates narrative from traversal results.

        Args:
            primary_node  : Disrupted node ID from GraphMapperAgent
            event_type    : From ClassifierAgent
            severity_score: From SeverityAgent (1.0–10.0)
            geography     : From ClassifierAgent

        Returns:
            CascadeOutput with cascade_nodes and risk_summary
        """
        graph = get_supplier_graph()

        if primary_node == "unknown" or not primary_node:
            logger.warning("Cascade simulation skipped — unknown primary node.")
            return CascadeOutput(
                cascade_nodes=[],
                cascade_depth=2,
                risk_summary="Unable to simulate cascade — disruption node not identified.",
                secondary_bottlenecks=[],
                stock_out_risk_nodes=[],
            )

        # ── BFS traversal — always 2+ hops per PRD rule ───────────────────────
        # Hop 2 downstream
        cascade_2 = graph.get_cascade_nodes(primary_node, hops=2)
        # Include 1-hop for completeness
        cascade_1 = graph.get_cascade_nodes(primary_node, hops=1)

        all_cascade = list(set(cascade_1 + cascade_2))
        logger.info(
            "Cascade from '%s': %d nodes (1-hop: %d, 2-hop: %d)",
            primary_node, len(all_cascade), len(cascade_1), len(cascade_2)
        )

        # ── Identify secondary bottlenecks ────────────────────────────────────
        # If Suez is blocked and traffic redirects via cape-route-hub,
        # rotterdam-dist absorbs all traffic → becomes bottleneck
        secondary_bottlenecks = []
        if primary_node == "suez-hub":
            secondary_bottlenecks = ["cape-route-hub", "rotterdam-dist"]

        # ── Stock-out risk assessment ─────────────────────────────────────────
        stock_out_risk = []
        if severity_score >= 7.0:
            # High severity → check warehouse buffer
            fw_node = graph.get_node("frankfurt-warehouse")
            if fw_node:
                buffer_days = fw_node.get("current_stock_days", 0)
                if buffer_days < 20:  # Less than 3 weeks buffer
                    stock_out_risk.append("frankfurt-warehouse")

        # ── LLM narrative ─────────────────────────────────────────────────────
        risk_summary = await self._generate_narrative(
            primary_node=primary_node,
            cascade_nodes=all_cascade,
            secondary_bottlenecks=secondary_bottlenecks,
            stock_out_risk=stock_out_risk,
            event_type=event_type,
            severity_score=severity_score,
            geography=geography,
            graph=graph,
        )

        return CascadeOutput(
            cascade_nodes=all_cascade,
            cascade_depth=2,
            risk_summary=risk_summary,
            secondary_bottlenecks=secondary_bottlenecks,
            stock_out_risk_nodes=stock_out_risk,
        )

    async def _generate_narrative(
        self,
        primary_node: str,
        cascade_nodes: list[str],
        secondary_bottlenecks: list[str],
        stock_out_risk: list[str],
        event_type: str,
        severity_score: float,
        geography: str,
        graph,
    ) -> str:
        """Generate LLM risk narrative from traversal results."""
        # Build context with node names (not just IDs)
        def node_name(nid: str) -> str:
            n = graph.get_node(nid)
            return n.get("name", nid) if n else nid

        cascade_named = [node_name(n) for n in cascade_nodes]
        bottleneck_named = [node_name(n) for n in secondary_bottlenecks]
        stock_named = [node_name(n) for n in stock_out_risk]
        primary_named = node_name(primary_node)

        if self._llm is None:
            return self._template_narrative(
                primary_named, cascade_named, bottleneck_named, stock_named, severity_score
            )

        prompt = (
            f"You are analyzing cascade effects in a pharmaceutical supply chain.\n"
            f"Primary disruption: {event_type} at {geography} (severity {severity_score}/10)\n"
            f"Disrupted node: {primary_named}\n"
            f"2nd-order affected nodes: {', '.join(cascade_named)}\n"
            f"Secondary bottlenecks created: {', '.join(bottleneck_named) or 'none'}\n"
            f"Stock-out risk nodes: {', '.join(stock_named) or 'none'}\n\n"
            "Write a 3-sentence risk summary covering: "
            "(1) what was disrupted, "
            "(2) second-order cascade effects on downstream nodes, "
            "(3) most urgent action needed."
        )

        try:
            response = await self._llm.ainvoke(prompt)
            return response.content.strip()
        except Exception as exc:
            logger.warning("LLM narrative generation failed: %s", exc)
            return self._template_narrative(
                primary_named, cascade_named, bottleneck_named, stock_named, severity_score
            )

    def _template_narrative(
        self,
        primary: str,
        cascade: list[str],
        bottlenecks: list[str],
        stock_out: list[str],
        severity: float,
    ) -> str:
        """Template-based narrative fallback."""
        cascade_str = ", ".join(cascade[:3]) if cascade else "no downstream nodes"
        bottleneck_str = ", ".join(bottlenecks) if bottlenecks else "none identified"
        stock_str = ", ".join(stock_out) if stock_out else "no immediate stock-out risk"

        return (
            f"{primary} is disrupted (severity {severity:.1f}/10), directly impacting: {cascade_str}. "
            f"Secondary bottlenecks emerging: {bottleneck_str}. "
            f"Stock-out risk: {stock_str} — immediate rerouting assessment required."
        )


# ── Module-level singleton ────────────────────────────────────────────────────
_cascade_instance: Optional[CascadeAgent] = None


def get_cascade_agent() -> CascadeAgent:
    """Return singleton CascadeAgent."""
    global _cascade_instance
    if _cascade_instance is None:
        _cascade_instance = CascadeAgent()
    return _cascade_instance
