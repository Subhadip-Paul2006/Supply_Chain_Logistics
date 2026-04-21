"""
Seed data — PharmaDistrib India demo supply network.
Hardcoded for hackathon demo. Loaded once at startup.

Network topology (per PRD demo scenario):
  Tier 1 (manufacturers):
    chennai-manufacturer  → Manufactures pharma products in Chennai, India

  Logistics route (critical path through Suez):
    chennai-manufacturer → suez-hub → rotterdam-dist → frankfurt-warehouse

  Backup route (bypasses Suez):
    chennai-manufacturer → cape-route-hub → rotterdam-dist

  Tier 2 (distribution):
    rotterdam-dist        → Frankfurt warehouse (primary EU hub)
    berlin-pharma         → Backup EU supplier, activates when Suez blocked

  Active shipments: 7 total, 4 passing through suez-hub

Demo trigger: suez-hub disruption → severity 9.1
Expected confidence: 91% → auto-execute → activate berlin-pharma
"""
import logging

from app.graph.supplier_graph import SupplierGraph, set_supplier_graph

logger = logging.getLogger(__name__)

# ── Shipments metadata (not part of graph, used by agents) ───────────────────
ACTIVE_SHIPMENTS = [
    {
        "id": "ship-001",
        "cargo": "Insulin API batch #4421",
        "origin": "chennai-manufacturer",
        "destination": "frankfurt-warehouse",
        "route": ["chennai-manufacturer", "suez-hub", "rotterdam-dist", "frankfurt-warehouse"],
        "passes_suez": True,
        "eta_days": 14,
        "value_usd": 420000,
    },
    {
        "id": "ship-002",
        "cargo": "Vaccine cold chain lot #88B",
        "origin": "chennai-manufacturer",
        "destination": "rotterdam-dist",
        "route": ["chennai-manufacturer", "suez-hub", "rotterdam-dist"],
        "passes_suez": True,
        "eta_days": 11,
        "value_usd": 310000,
    },
    {
        "id": "ship-003",
        "cargo": "Oncology drug batch #2201",
        "origin": "chennai-manufacturer",
        "destination": "frankfurt-warehouse",
        "route": ["chennai-manufacturer", "suez-hub", "rotterdam-dist", "frankfurt-warehouse"],
        "passes_suez": True,
        "eta_days": 16,
        "value_usd": 890000,
    },
    {
        "id": "ship-004",
        "cargo": "Antibiotic bulk powder",
        "origin": "chennai-manufacturer",
        "destination": "rotterdam-dist",
        "route": ["chennai-manufacturer", "suez-hub", "rotterdam-dist"],
        "passes_suez": True,
        "eta_days": 10,
        "value_usd": 185000,
    },
    {
        "id": "ship-005",
        "cargo": "Medical device components",
        "origin": "chennai-manufacturer",
        "destination": "berlin-pharma",
        "route": ["chennai-manufacturer", "cape-route-hub", "rotterdam-dist", "berlin-pharma"],
        "passes_suez": False,
        "eta_days": 23,
        "value_usd": 95000,
    },
    {
        "id": "ship-006",
        "cargo": "Lab reagents batch",
        "origin": "chennai-manufacturer",
        "destination": "frankfurt-warehouse",
        "route": ["chennai-manufacturer", "cape-route-hub", "rotterdam-dist", "frankfurt-warehouse"],
        "passes_suez": False,
        "eta_days": 25,
        "value_usd": 62000,
    },
    {
        "id": "ship-007",
        "cargo": "Excipient raw materials",
        "origin": "india-raw-supplier",
        "destination": "chennai-manufacturer",
        "route": ["india-raw-supplier", "chennai-manufacturer"],
        "passes_suez": False,
        "eta_days": 3,
        "value_usd": 45000,
    },
]

# Shipments through Suez (used by cascade and scenario agents)
SUEZ_SHIPMENTS = [s for s in ACTIVE_SHIPMENTS if s["passes_suez"]]


def seed_supplier_graph() -> SupplierGraph:
    """
    Build and register the PharmaDistrib India supplier graph.
    Called once from app lifespan on startup.

    Returns:
        Seeded SupplierGraph singleton.
    """
    graph = SupplierGraph()

    # ── Nodes ─────────────────────────────────────────────────────────────────

    # Tier 0 — Raw material suppliers
    graph.add_node(
        "india-raw-supplier",
        name="India Raw Materials Co.",
        location="Gujarat, India",
        tier=0,
        type="raw_supplier",
        active=True,
        risk_level=0.3,
    )
    graph.add_node(
        "europe-excipient-supplier",
        name="EuroExcipient GmbH",
        location="Hamburg, Germany",
        tier=0,
        type="raw_supplier",
        active=True,
        risk_level=0.2,
    )

    # Tier 1 — Direct manufacturers
    graph.add_node(
        "chennai-manufacturer",
        name="Chennai Pharma Manufacturing Ltd.",
        location="Chennai, Tamil Nadu, India",
        tier=1,
        type="manufacturer",
        active=True,
        risk_level=0.25,
        production_capacity_units_per_day=50000,
    )

    # Tier 2 — Logistics hubs and distribution centers
    graph.add_node(
        "suez-hub",
        name="Port of Suez / Suez Canal Route",
        location="Suez Canal, Egypt",
        tier=2,
        type="logistics_hub",
        active=True,
        risk_level=0.7,   # High risk — geopolitical chokepoint
        is_chokepoint=True,
        alternative="cape-route-hub",
    )
    graph.add_node(
        "cape-route-hub",
        name="Cape of Good Hope Route",
        location="Cape Town, South Africa",
        tier=2,
        type="logistics_hub",
        active=True,
        risk_level=0.2,
    )
    graph.add_node(
        "rotterdam-dist",
        name="Rotterdam Distribution Hub",
        location="Rotterdam, Netherlands",
        tier=2,
        type="distribution_center",
        active=True,
        risk_level=0.15,
        storage_capacity_m3=150000,
    )
    graph.add_node(
        "frankfurt-warehouse",
        name="Frankfurt Central Warehouse",
        location="Frankfurt, Germany",
        tier=2,
        type="warehouse",
        active=True,
        risk_level=0.1,
        current_stock_days=12,   # Days of inventory buffer
    )
    graph.add_node(
        "berlin-pharma",
        name="Berlin Pharma GmbH",
        location="Berlin, Germany",
        tier=2,
        type="backup_supplier",
        active=True,
        risk_level=0.15,
        backup_activation_cost_usd=12000,  # Cost to activate backup
        backup_lead_time_days=3,
    )

    # ── Edges (directed: upstream → downstream) ───────────────────────────────

    # Raw materials → Manufacturer
    graph.add_edge(
        "india-raw-supplier", "chennai-manufacturer",
        transit_days=3, cost_factor=1.0, risk_level=0.2, mode="road"
    )
    graph.add_edge(
        "europe-excipient-supplier", "chennai-manufacturer",
        transit_days=18, cost_factor=1.5, risk_level=0.3, mode="sea"
    )

    # Manufacturer → Logistics hubs (primary via Suez, backup via Cape)
    graph.add_edge(
        "chennai-manufacturer", "suez-hub",
        transit_days=7, cost_factor=1.0, risk_level=0.7,
        mode="sea", is_primary=True,
    )
    graph.add_edge(
        "chennai-manufacturer", "cape-route-hub",
        transit_days=21, cost_factor=1.8, risk_level=0.2,
        mode="sea", is_primary=False,
    )

    # Logistics hubs → Rotterdam distribution
    graph.add_edge(
        "suez-hub", "rotterdam-dist",
        transit_days=4, cost_factor=1.0, risk_level=0.15, mode="sea"
    )
    graph.add_edge(
        "cape-route-hub", "rotterdam-dist",
        transit_days=7, cost_factor=1.8, risk_level=0.1, mode="sea"
    )

    # Rotterdam → Final destinations
    graph.add_edge(
        "rotterdam-dist", "frankfurt-warehouse",
        transit_days=1, cost_factor=1.0, risk_level=0.05, mode="road"
    )
    graph.add_edge(
        "rotterdam-dist", "berlin-pharma",
        transit_days=2, cost_factor=1.1, risk_level=0.08, mode="road"
    )

    # Berlin backup supplier can supply Frankfurt directly
    graph.add_edge(
        "berlin-pharma", "frankfurt-warehouse",
        transit_days=1, cost_factor=1.2, risk_level=0.05, mode="road"
    )

    # Register as singleton
    set_supplier_graph(graph)

    logger.info(
        "Demo network seeded: %d nodes, %d edges | %d shipments (%d through Suez)",
        graph.node_count,
        graph.edge_count,
        len(ACTIVE_SHIPMENTS),
        len(SUEZ_SHIPMENTS),
    )

    return graph


def get_suez_shipments() -> list[dict]:
    """Return shipments currently passing through Suez Canal."""
    return SUEZ_SHIPMENTS


def get_all_shipments() -> list[dict]:
    """Return all active shipments in demo network."""
    return ACTIVE_SHIPMENTS
