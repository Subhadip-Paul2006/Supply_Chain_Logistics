"""
Graph Mapper Agent — maps disruption geography to supplier graph node IDs.
Uses geography string from ClassifierAgent to find matching nodes.
Also identifies which active shipments are impacted.
"""
import logging
from typing import Optional

from pydantic import BaseModel, Field

from app.config import get_settings
from app.graph.supplier_graph import get_supplier_graph

logger = logging.getLogger(__name__)
settings = get_settings()


# ── Output schema ─────────────────────────────────────────────────────────────
class GraphMapperOutput(BaseModel):
    """Structured output from graph mapping."""

    primary_node: str = Field(
        description="The main disrupted supplier graph node ID"
    )
    affected_nodes: list[str] = Field(
        default_factory=list,
        description="All directly affected node IDs (including primary)",
    )
    affected_shipment_ids: list[str] = Field(
        default_factory=list,
        description="IDs of in-transit shipments impacted by disruption",
    )
    mapping_confidence: float = Field(
        ge=0.0, le=1.0,
        description="Confidence in the geography-to-node mapping",
    )
    mapping_method: str = Field(
        description="'geo_match', 'keyword_match', or 'llm'"
    )


# ── Geography → Node mapping table ───────────────────────────────────────────
_GEO_TO_NODE: dict[str, str] = {
    # Suez Canal and Red Sea routes
    "suez canal": "suez-hub",
    "suez": "suez-hub",
    "red sea": "suez-hub",
    "port said": "suez-hub",
    "egypt": "suez-hub",
    # Cape of Good Hope
    "cape of good hope": "cape-route-hub",
    "cape town": "cape-route-hub",
    "south africa": "cape-route-hub",
    # Rotterdam
    "rotterdam": "rotterdam-dist",
    "netherlands": "rotterdam-dist",
    # Frankfurt / Germany (non-Berlin)
    "frankfurt": "frankfurt-warehouse",
    "frankfurt am main": "frankfurt-warehouse",
    # Berlin backup supplier
    "berlin": "berlin-pharma",
    "berlin pharma": "berlin-pharma",
    # Chennai manufacturer
    "chennai": "chennai-manufacturer",
    "india": "chennai-manufacturer",
    "tamil nadu": "chennai-manufacturer",
    # Raw supplier
    "gujarat": "india-raw-supplier",
    "hamburg": "europe-excipient-supplier",
}


class GraphMapperAgent:
    """
    Maps disruption geography to supplier graph nodes.
    Does NOT use LLM — deterministic geo matching is faster and more reliable
    for known geographies. LLM fallback only for unrecognized locations.
    """

    async def map(
        self,
        geography: str,
        event_type: str,
        affected_trade_routes: list[str],
    ) -> GraphMapperOutput:
        """
        Map geography string to supplier graph node IDs.

        Args:
            geography           : From ClassifierAgent e.g. "Suez Canal, Egypt"
            event_type          : From ClassifierAgent
            affected_trade_routes: From ClassifierAgent

        Returns:
            GraphMapperOutput with primary_node and affected_nodes
        """
        graph = get_supplier_graph()

        # ── Step 1: geo matching ───────────────────────────────────────────────
        primary_node = self._geo_match(geography)

        if primary_node and primary_node in [n["id"] for n in graph.all_nodes()]:
            logger.info(
                "Geography '%s' → node '%s' (geo_match)", geography, primary_node
            )
            # Find directly connected nodes (1 hop)
            affected = [primary_node]

            # Also include nodes that depend on disrupted node (its downstream successors)
            cascade_1 = graph.get_cascade_nodes(primary_node, hops=1)
            affected.extend([n for n in cascade_1 if n not in affected])

            # Get affected shipments
            shipment_ids = self._get_affected_shipments(primary_node)

            return GraphMapperOutput(
                primary_node=primary_node,
                affected_nodes=affected,
                affected_shipment_ids=shipment_ids,
                mapping_confidence=0.92,
                mapping_method="geo_match",
            )

        # ── Step 2: LLM fallback for unknown geographies ──────────────────────
        logger.info(
            "No geo match for '%s' — trying LLM mapping.", geography
        )
        return await self._llm_map(geography, event_type, graph)

    def _geo_match(self, geography: str) -> Optional[str]:
        """Try to match geography string to a known node ID."""
        geo_lower = geography.lower()
        for pattern, node_id in _GEO_TO_NODE.items():
            if pattern in geo_lower:
                return node_id
        return None

    def _get_affected_shipments(self, node_id: str) -> list[str]:
        """Return IDs of active shipments that pass through the disrupted node."""
        from app.graph.seed_data import get_all_shipments
        all_shipments = get_all_shipments()
        return [
            s["id"]
            for s in all_shipments
            if node_id in s.get("route", [])
        ]

    async def _llm_map(
        self, geography: str, event_type: str, graph
    ) -> GraphMapperOutput:
        """
        LLM-based fallback mapping for unknown geographies.
        Less reliable — confidence marked lower.
        """
        if not settings.google_api_key:
            return self._unknown_fallback(geography)

        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            from pydantic import BaseModel

            class NodeMapping(BaseModel):
                best_node_id: str
                reasoning: str

            llm = ChatGoogleGenerativeAI(
                model=settings.gemini_model,
                google_api_key=settings.google_api_key,
                max_output_tokens=200,
                temperature=0.1,
            )
            structured = llm.with_structured_output(NodeMapping)

            node_list = [n["id"] for n in graph.all_nodes()]
            prompt = (
                f"Supply chain node IDs: {node_list}\n"
                f"Disruption geography: '{geography}'\n"
                f"Event type: {event_type}\n"
                "Which node ID is most directly affected? Pick exactly one from the list."
            )

            result: NodeMapping = await structured.ainvoke(prompt)
            node = result.best_node_id

            if node not in node_list:
                logger.warning("LLM returned invalid node '%s'. Using unknown fallback.", node)
                return self._unknown_fallback(geography)

            shipments = self._get_affected_shipments(node)
            return GraphMapperOutput(
                primary_node=node,
                affected_nodes=[node],
                affected_shipment_ids=shipments,
                mapping_confidence=0.7,
                mapping_method="llm",
            )

        except Exception as exc:
            logger.warning("LLM graph mapping failed: %s", exc)
            return self._unknown_fallback(geography)

    def _unknown_fallback(self, geography: str) -> GraphMapperOutput:
        """Fallback when geography cannot be mapped to any node."""
        logger.warning(
            "Could not map geography '%s' to any supplier node.", geography
        )
        return GraphMapperOutput(
            primary_node="unknown",
            affected_nodes=[],
            affected_shipment_ids=[],
            mapping_confidence=0.1,
            mapping_method="geo_match",
        )


# ── Module-level singleton ────────────────────────────────────────────────────
_mapper_instance: Optional[GraphMapperAgent] = None


def get_graph_mapper() -> GraphMapperAgent:
    """Return singleton GraphMapperAgent."""
    global _mapper_instance
    if _mapper_instance is None:
        _mapper_instance = GraphMapperAgent()
    return _mapper_instance
