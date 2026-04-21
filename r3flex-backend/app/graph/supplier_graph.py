"""
Supplier graph — multi-tier supply network modeled as a directed graph.
Uses NetworkX DiGraph internally.

Node IDs are string slugs e.g. "chennai-manufacturer", "suez-hub".
Edges carry transit metadata: transit_days, cost_factor, risk_level.

The singleton instance is loaded once at startup via seed_supplier_graph().
All agents/services call get_supplier_graph() to access it.
"""
import logging
from typing import Any, Optional

import networkx as nx

logger = logging.getLogger(__name__)

# ── Singleton ─────────────────────────────────────────────────────────────────
_graph_instance: Optional["SupplierGraph"] = None


class SupplierGraph:
    """
    Wrapper around NetworkX DiGraph representing a multi-tier supplier network.

    Tiers:
        Tier 0: Raw material suppliers (upstream)
        Tier 1: Direct manufacturers
        Tier 2: Logistics hubs, distribution centers, warehouses
        Tier 3: End customers (not modeled in demo)

    Edge direction: upstream → downstream (flow of goods).
    """

    def __init__(self) -> None:
        """Initialize empty directed graph."""
        self._graph: nx.DiGraph = nx.DiGraph()
        logger.info("SupplierGraph initialized (empty).")

    # ── Node operations ───────────────────────────────────────────────────────

    def add_node(self, node_id: str, **attrs: Any) -> None:
        """
        Add supplier node to graph.

        Args:
            node_id : Unique string slug e.g. "chennai-manufacturer"
            **attrs : Metadata — name, location, tier, type, active, etc.
        """
        self._graph.add_node(node_id, **attrs)
        logger.debug("Node added: %s | attrs=%s", node_id, attrs)

    def add_edge(self, source: str, target: str, **attrs: Any) -> None:
        """
        Add directional edge: source supplies/routes to target.

        Args:
            source : Upstream node ID
            target : Downstream node ID
            **attrs: transit_days (int), cost_factor (float), risk_level (float 0-1)
        """
        self._graph.add_edge(source, target, **attrs)
        logger.debug("Edge added: %s → %s | attrs=%s", source, target, attrs)

    def get_node(self, node_id: str) -> Optional[dict]:
        """Return node attributes dict or None if node doesn't exist."""
        if node_id not in self._graph:
            return None
        return dict(self._graph.nodes[node_id])

    def all_nodes(self) -> list[dict]:
        """Return all nodes with their attributes as a list of dicts."""
        return [
            {"id": n, **dict(self._graph.nodes[n])}
            for n in self._graph.nodes
        ]

    # ── Traversal operations ──────────────────────────────────────────────────

    def get_cascade_nodes(self, start_node: str, hops: int = 2) -> list[str]:
        """
        BFS traversal — find all nodes reachable within N hops DOWNSTREAM.
        Used by CascadeAgent to simulate second-order impact.

        PRD rule: Must traverse at least 2 hops from disruption node.

        Args:
            start_node : Disrupted node ID
            hops       : Maximum hop distance (default 2, minimum 2 per PRD)

        Returns:
            List of node IDs reachable within 'hops' steps (excludes start_node)
        """
        if start_node not in self._graph:
            logger.warning(
                "Cascade requested from unknown node '%s'. Returning empty.", start_node
            )
            return []

        visited: set[str] = set()
        queue: list[tuple[str, int]] = [(start_node, 0)]

        while queue:
            current, depth = queue.pop(0)
            if depth >= hops:
                continue
            for neighbor in self._graph.successors(current):
                if neighbor not in visited and neighbor != start_node:
                    visited.add(neighbor)
                    queue.append((neighbor, depth + 1))

        cascade = list(visited)
        logger.info(
            "Cascade from '%s' (%d hops): %d nodes affected → %s",
            start_node, hops, len(cascade), cascade,
        )
        return cascade

    def get_upstream_nodes(self, node_id: str, hops: int = 2) -> list[str]:
        """
        BFS traversal upstream — find nodes that feed into node_id.
        Used to check if backup supplier has same upstream risk.

        Args:
            node_id : Target node
            hops    : Maximum hop distance upstream

        Returns:
            List of upstream node IDs
        """
        if node_id not in self._graph:
            return []

        visited: set[str] = set()
        queue: list[tuple[str, int]] = [(node_id, 0)]

        while queue:
            current, depth = queue.pop(0)
            if depth >= hops:
                continue
            for predecessor in self._graph.predecessors(current):
                if predecessor not in visited and predecessor != node_id:
                    visited.add(predecessor)
                    queue.append((predecessor, depth + 1))

        return list(visited)

    def shortest_path(self, source: str, target: str) -> Optional[list[str]]:
        """
        Find shortest path between two nodes.
        Returns None if no path exists.

        Args:
            source : Start node ID
            target : End node ID

        Returns:
            Ordered list of node IDs from source to target, or None
        """
        try:
            path = nx.shortest_path(self._graph, source=source, target=target)
            return path
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            logger.warning(
                "No path from '%s' to '%s'", source, target
            )
            return None

    def nodes_by_tier(self, tier: int) -> list[dict]:
        """Return all nodes at a specific supply chain tier."""
        return [
            {"id": n, **dict(self._graph.nodes[n])}
            for n in self._graph.nodes
            if self._graph.nodes[n].get("tier") == tier
        ]

    def get_edge_data(self, source: str, target: str) -> Optional[dict]:
        """Return edge attributes between source and target, or None."""
        if self._graph.has_edge(source, target):
            return dict(self._graph.edges[source, target])
        return None

    @property
    def node_count(self) -> int:
        """Total number of nodes in graph."""
        return self._graph.number_of_nodes()

    @property
    def edge_count(self) -> int:
        """Total number of edges in graph."""
        return self._graph.number_of_edges()

    def summary(self) -> dict:
        """Return graph stats for health check / debug."""
        return {
            "nodes": self.node_count,
            "edges": self.edge_count,
            "tier_counts": {
                tier: len(self.nodes_by_tier(tier)) for tier in [0, 1, 2, 3]
            },
        }


# ── Singleton accessors ───────────────────────────────────────────────────────

def get_supplier_graph() -> SupplierGraph:
    """
    Return the global SupplierGraph singleton.
    Raises RuntimeError if seed_supplier_graph() was not called first.
    """
    if _graph_instance is None:
        raise RuntimeError(
            "SupplierGraph not initialized. Call seed_supplier_graph() at startup."
        )
    return _graph_instance


def set_supplier_graph(graph: SupplierGraph) -> None:
    """
    Set the global singleton. Used by seed_data.py and tests.
    """
    global _graph_instance
    _graph_instance = graph
    logger.info(
        "SupplierGraph set: %d nodes, %d edges", graph.node_count, graph.edge_count
    )
