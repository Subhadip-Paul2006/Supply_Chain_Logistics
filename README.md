# REFLEX 3.0

<p align="center">
    <img src="./public/trelfex.png" alt="REFLEX 3.0 - NexusGuard war room preview" width="74%" />
</p>

<p align="center">
    <strong>NexusGuard: the agentic execution layer for supply chain resilience.</strong><br />
    Detect threats in real time, simulate thousands of outcomes, and autonomously execute the safest response.
</p>

<p align="center">
    <em>This is not a dashboard. This is a system that acts.</em>
</p>

---

## Executive Summary

REFLEX 3.0 (NexusGuard) is an agentic AI platform for global supply chain operations.
It watches disruption signals across news, weather, ports, and geopolitical feeds,
runs a live digital twin to evaluate rerouting/sourcing tradeoffs, and executes the best option
when confidence is above policy thresholds.

The core innovation is execution. Existing tools mostly stop at alerts and recommendations.
NexusGuard closes the loop from signal to action.

## Why Now

- 70% of companies experienced major disruptions in the last 5 years.
- Global losses from supply chain failures exceed $1.6T annually.
- 78% of leaders expect disruption intensity to rise, but only 25% feel prepared.
- AI adoption is rising, but very few teams capture durable value because systems remain advisory.

This creates a clear opportunity for an execution-native platform designed for mid-market operators.

## Product Vision

### What REFLEX 3.0 does

- Ingests external and internal signals continuously.
- Classifies disruption type, severity, and impacted nodes.
- Simulates scenario options in a digital twin.
- Scores options on cost, ETA, risk, and compliance.
- Auto-executes above threshold; escalates below threshold.
- Logs a full decision trail for audit and learning.

### Execution logic

- Confidence >= 85%: autonomous action with audit log.
- Confidence < 85%: human approval modal with top options and tradeoffs.
- Novel high-uncertainty cases: always escalated.

## Competitive Positioning

| Capability | Resilinc | FourKites | o9 | Llamasoft | NexusGuard (REFLEX 3.0) |
| --- | --- | --- | --- | --- | --- |
| Real-time signal ingestion | Yes | Yes | No | No | Yes |
| Multi-tier supplier mapping | Yes | No | Yes | Yes | Yes |
| Digital twin simulation | No | No | Yes | Yes | Yes |
| Real-time scenario simulation | No | No | No | No | Yes |
| Autonomous execution | No | No | No | No | Yes |
| Cascade failure detection | No | No | No | No | Yes |
| Mid-market accessible | No | Yes | No | No | Yes |
| Human kill switch | Limited | N/A | Yes | Yes | Yes |

## The 7 Moats

1. Execution layer instead of recommendation-only workflows.
2. Cascade failure modeling, not just single-point detection.
3. Confidence-threshold human-in-the-loop control.
4. Mid-market-first deployment and pricing strategy.
5. Vertical beachhead in pharma cold chain.
6. Audit-native decision trail for compliance readiness.
7. Outcome flywheel that improves model quality over time.

## Technical Architecture

### Layer 1: Signal Ingestion

- News and event feeds
- Weather and climate streams
- Port and route congestion signals
- Geopolitical event data
- Optional social/labor sentiment
- ERP/TMS connectors (mock in demo, real in production)

### Layer 2: Risk Agent Cluster

- Disruption classifier
- Severity scorer
- Supplier graph impact mapper
- Cascade simulator

### Layer 3: Decision Engine

- Live digital twin of supply network
- Scenario generator (3-10 options)
- Tradeoff scorer (cost, ETA, risk, compliance)
- Confidence evaluator + routing policy

### Layer 4: Execution and Audit

- Action executor (carrier/supplier/ERP updates)
- Audit logger (reasoning, confidence, timestamps)
- Outcome tracker (predicted vs actual)
- Real-time command dashboard

## Hackathon Scope (48 Hours)

- 2-3 live data feeds (plus fallback mock data).
- One end-to-end demo customer (pharma cold chain).
- One high-confidence autonomous flow.
- One low-confidence approval flow (kill switch demo).
- Full audit log rendered in UI.

## 2-Minute Demo Arc

1. Disruption appears live (Suez-style route shock).
2. Agent classifies event and predicts cascade impact.
3. Digital twin generates and scores options.
4. High-confidence option executes in seconds.
5. Low-confidence variant triggers human approval modal.

## Business Model

| Stream | Model |
| --- | --- |
| Platform subscription | SaaS annual tiers for mid-market |
| Execution fee | Per autonomous action |
| Vertical modules | Pharma, food, semiconductors |
| Enterprise tier | Custom implementation and controls |

Target design: strong retention, high switching costs, and expanding ARPU through vertical modules.

## Market Opportunity

- Supply chain disruption early warning market is scaling rapidly.
- Agentic AI adoption is accelerating across enterprise operations.
- Mid-market operators remain under-served by incumbent enterprise-heavy platforms.

REFLEX 3.0 is positioned to capture this gap with speed-to-value and execution-first differentiation.

## Build and Run

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

## Repository Structure

```text
R3FLEX/
|- app/
|- components/
|- hooks/
|- lib/
|- public/
|- styles/
|- package.json
`- tsconfig.json
```

## License

MIT
