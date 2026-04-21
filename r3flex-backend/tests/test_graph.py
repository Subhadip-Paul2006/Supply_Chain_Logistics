"""
Tests for NetworkX supplier graph.
Verifies cascade traversal meets PRD rule: minimum 2 hops.
"""
import pytest
from app.graph.supplier_graph import SupplierGraph
from app.graph.seed_data import seed_supplier_graph, get_suez_shipments, get_all_shipments


class TestSupplierGraph:
    """Unit tests for SupplierGraph traversal logic."""

    def test_seed_graph_node_count(self):
        """Seeded graph must have at least 7 nodes (PRD: 3 tiers minimum)."""
        graph = seed_supplier_graph()
        assert graph.node_count >= 7

    def test_seed_graph_edge_count(self):
        """Graph must have edges connecting the network."""
        graph = seed_supplier_graph()
        assert graph.edge_count >= 5

    def test_cascade_minimum_2_hops(self):
        """
        PRD rule: cascade simulation must traverse at least 2 hops.
        Starting from suez-hub, must reach nodes beyond 1-hop distance.
        """
        graph = seed_supplier_graph()
        cascade = graph.get_cascade_nodes("suez-hub", hops=2)
        assert len(cascade) >= 2, "Cascade must traverse at least 2 hops"

    def test_suez_cascade_reaches_frankfurt(self):
        """
        Suez disruption cascade must eventually reach Frankfurt warehouse.
        Path: suez-hub → rotterdam-dist → frankfurt-warehouse
        """
        graph = seed_supplier_graph()
        cascade = graph.get_cascade_nodes("suez-hub", hops=2)
        assert "frankfurt-warehouse" in cascade, \
            "Frankfurt warehouse must be in 2-hop cascade from Suez"

    def test_cascade_excludes_start_node(self):
        """Start node must not appear in its own cascade results."""
        graph = seed_supplier_graph()
        cascade = graph.get_cascade_nodes("suez-hub", hops=2)
        assert "suez-hub" not in cascade

    def test_unknown_node_cascade_returns_empty(self):
        """Unknown node ID must return empty list, not raise exception."""
        graph = seed_supplier_graph()
        cascade = graph.get_cascade_nodes("nonexistent-node", hops=2)
        assert cascade == []

    def test_berlin_is_backup_supplier(self):
        """Berlin Pharma must exist as a backup_supplier type node."""
        graph = seed_supplier_graph()
        node = graph.get_node("berlin-pharma")
        assert node is not None
        assert node.get("type") == "backup_supplier"

    def test_nodes_by_tier(self):
        """Must have nodes at tier 1 and tier 2."""
        graph = seed_supplier_graph()
        tier1 = graph.nodes_by_tier(1)
        tier2 = graph.nodes_by_tier(2)
        assert len(tier1) >= 1, "Must have at least 1 Tier 1 manufacturer"
        assert len(tier2) >= 3, "Must have at least 3 Tier 2 nodes"

    def test_shortest_path_chennai_to_frankfurt(self):
        """Must find a path from manufacturer to warehouse."""
        graph = seed_supplier_graph()
        path = graph.shortest_path("chennai-manufacturer", "frankfurt-warehouse")
        assert path is not None
        assert path[0] == "chennai-manufacturer"
        assert path[-1] == "frankfurt-warehouse"
        assert len(path) >= 3  # At least 3 nodes in path

    def test_suez_shipments_count(self):
        """PRD requires 4 shipments through Suez in demo."""
        suez_ships = get_suez_shipments()
        assert len(suez_ships) == 4, "Demo must have exactly 4 Suez shipments"

    def test_total_shipments_count(self):
        """PRD requires 7 total active shipments."""
        all_ships = get_all_shipments()
        assert len(all_ships) == 7, "Demo must have exactly 7 total shipments"
