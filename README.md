# R3FLEX

<p align="center">
  <img src="./frontend/public/reflex_amb.png" alt="R3FLEX platform preview" width="78%" />
</p>

<p align="center">
  <strong>Every signal. Every border.</strong><br />
  Agentic supply-chain intelligence that detects disruption, simulates options, and drives execution.
</p>

## What R3FLEX Is

R3FLEX is an execution-first logistics intelligence platform. It combines live event ingestion, digital-twin simulation, and decision workflows so teams can react to disruption with speed and traceability.

Core platform goals:
- Detect risk in real time across routes, ports, and suppliers.
- Simulate scenario options before impact cascades.
- Route decisions through confidence-aware automation and approvals.
- Preserve an auditable trail of why each action was recommended or taken.

## Product Highlights

- Global event awareness across multi-region operations.
- Live operational visualization and route-level context.
- Human-in-the-loop control path for lower-confidence decisions.
- Dashboard experience designed for rapid triage and action.
- Supabase-ready authentication and data wiring.

## Architecture Overview

R3FLEX uses a web frontend with optional backend services:

- Frontend: Next.js App Router in [frontend/app](frontend/app).
- Shared UI: reusable components in [frontend/components](frontend/components).
- Hooks and shared logic: [frontend/hooks](frontend/hooks), [frontend/lib](frontend/lib).
- Optional backend stack: FastAPI + Postgres + Redis in [r3flex-backend](r3flex-backend).
- Optional Supabase schema and migrations: [supabase](supabase).

High-level runtime topology:

```text
Browser
  -> Next.js frontend (:3000)
      -> REST and WebSocket integration points
          -> FastAPI backend (:8000, optional local stack)
              -> Postgres + Redis
```

## Repository Layout

```text
R3FLEX/
|- frontend/            # Next.js app, configs, assets, and frontend env
|  |- app/              # Next.js pages, layouts, route groups
|  |- components/       # Landing, dashboard, and reusable UI components
|  |- hooks/            # Custom client hooks
|  |- lib/              # Shared utilities and API helpers
|  `- public/           # Static assets
|- r3flex-backend/      # FastAPI backend and tests
|- supabase/            # SQL schema and migrations
`- SETUP.md             # End-to-end local environment setup
```

## Quick Start (Frontend)

Requirements:
- Node.js 18+

Install and run:

```bash
cd frontend
pnpm install
pnpm dev
```

Then open `http://localhost:3000`.

If you prefer npm:

```bash
cd frontend
npm install
npm run dev
```

## Full Local Stack (Frontend + Backend)

For full local setup including Docker services, migrations, backend API, and demo flow, follow:

- [SETUP.md](SETUP.md)

## Environment Variables

Frontend variables are documented in [frontend/.env.example](frontend/.env.example):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_WS_URL` (optional override)

Create your local env file before running production-like flows:

```bash
cd frontend
cp .env.example .env
```

## Frontend Scripts

From [frontend/package.json](frontend/package.json):

- `pnpm dev` - run development server
- `pnpm build` - production build
- `pnpm start` - run production server
- `pnpm lint` - lint workspace

## Development Notes

- Landing page and core brand narrative are in [frontend/app/page.tsx](frontend/app/page.tsx).
- Global theme tokens and base styles are in [frontend/app/globals.css](frontend/app/globals.css).
- Root layout and metadata are in [frontend/app/layout.tsx](frontend/app/layout.tsx).

flowchart TD
  %% ========== CLIENT/UI ==========
  U[User / Ops Team] -->|Web UI| FE[Next.js Frontend :3000<br/>frontend/app]
  FE <-->|WebSocket| WS[FastAPI WS<br/>/ws/disruptions/{company_id}<br/>r3flex-backend/app/routers/ws.py]

  %% ========== TRIGGERS ==========
  FE -->|POST| API1[POST /disruptions/demo<br/>or /disruptions/trigger<br/>r3flex-backend/app/routers/disruptions.py]
  SCH[APScheduler Poller<br/>r3flex-backend/app/ingestion/scheduler.py] -->|periodic signals| API1

  %% ========== CORE ORCHESTRATION ==========
  API1 --> SVC[DisruptionService.process_signal()<br/>r3flex-backend/app/services/disruption_svc.py]
  SVC --> PIPE[LangGraph Pipeline (StateGraph)<br/>run_pipeline()<br/>r3flex-backend/app/agents/orchestrator.py]

  %% ========== LLM / AGENT STAGES ==========
  PIPE --> A1[1) ClassifierAgent<br/>Gemini structured output + fallback<br/>app/agents/classifier.py]
  A1 --> A2[2) SeverityAgent<br/>Gemini structured output + heuristic fallback<br/>app/agents/severity.py]
  A2 --> A3[3) GraphMapperAgent<br/>map disruption -> supply nodes/shipments<br/>app/agents/graph_mapper.py]
  A3 --> A4[4) CascadeAgent<br/>simulate second-order impacts<br/>app/agents/cascade.py]

  %% ========== SCENARIOS + SCORING ==========
  A4 --> SG[ScenarioGenerator<br/>3 options תמיד (exactly 3)<br/>hardcoded Suez demo else Gemini<br/>app/engine/scenario_gen.py]
  SG --> TS[TradeoffScorer<br/>ranks options by risk/cost/time<br/>app/engine/tradeoff.py]
  TS --> CE[ConfidenceEvaluator<br/>decide auto vs approval threshold<br/>app/engine/confidence.py]

  %% ========== EXECUTION / HUMAN IN LOOP ==========
  CE --> EX[Executor<br/>auto_execute OR escalate_to_human<br/>app/engine/executor.py]
  EX -->|if confidence >= threshold| AUTO[Auto-execute path<br/>mock ERP update + supplier email draft]
  EX -->|if confidence < threshold| HUMAN[Escalate path<br/>publish approval_required event]

  %% ========== REALTIME + APPROVAL LOOP ==========
  HUMAN -->|Redis pub/sub publish| RDS[(Redis :6379<br/>channel disruptions:{company_id})]
  RDS -->|pubsub listen| WS
  WS -->|push event| FE
  FE -->|Human clicks Approve/Reject| FE2[Frontend decision action<br/>frontend/lib/api.ts]

  %% ========== STORAGE / AUDIT ==========
  SVC --> PG[(Postgres :5432<br/>Disruptions/Scenarios/Decisions/Audit)]
  EX --> AUD[AuditService.log()<br/>app/services/audit_svc.py<br/>**MUST happen before execution**]
  AUD --> PG

  %% ========== OPTIONAL SUPABASE (frontend demo wiring) ==========
  FE2 --> SB[(Supabase Tables<br/>disruptions/scenarios/decisions/audit_logs<br/>supabase/schema.sql)]
