# R3FLEX

<p align="center">
  <img src="./frontend/public/reflex_amb.png" alt="R3FLEX platform preview" width="78%" />
</p>

<p align="center">
  <strong>Every signal. Every border.</strong><br />
  Agentic supply-chain intelligence that detects disruption, simulates options, and drives execution.
</p>

---

## What is R3FLEX?

Think of R3FLEX as a **smart assistant for global shipping**. When something bad happens in the world — a storm in the Suez Canal, a fire in a factory, a strike at a port — R3FLEX notices, thinks about what to do, and either fixes the problem itself or asks a human for permission.

It has three main parts:
- **Frontend** — the website you see in your browser
- **Backend** — the "brain" running on a server that does the thinking
- **Database (Supabase)** — the "filing cabinet" where everything is stored

Let's look at how each part works, step by step.

---

## 1. The Big Picture (How Everything Talks to Each Other)

Imagine you order something online. There is a **website** (frontend) where you click "track my order". The website sends a message to a **server** (backend) that does the hard work. The server checks a **database** for your order info, then sends the answer back to the website to show you.

R3FLEX works the same way, but for global supply chains.

```
┌─────────────────────────────────────────────────────────────────────┐
│                          YOUR BROWSER                               │
│                                                                     │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐   │
│  │ Landing Page │ → │  Login Page  │ → │  Dashboard (War Room)│   │
│  │  (/)         │   │  (/login)    │   │  (/dashboard)        │   │
│  └──────────────┘   └──────────────┘   └──────────────────────┘   │
│                                                                     │
│  Built with: Next.js 16 (App Router) + React 19 + Tailwind CSS     │
└─────────────────────────────────────────────────────────────────────┘
                                ↕ HTTPS (REST)        ↕ WSS (WebSocket)
┌─────────────────────────────────────────────────────────────────────┐
│                       BACKEND SERVER (Python)                       │
│                                                                     │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌───────────┐  │
│  │  Ingestion │ → │ AI Agents  │ → │  Decision  │ → │  Executor │  │
│  │  (signals) │   │ (LangGraph)│   │  Engine    │   │ (act/HITL)│  │
│  └────────────┘   └────────────┘   └────────────┘   └───────────┘  │
│                                                                     │
│  Built with: FastAPI + LangChain + LangGraph + Google Gemini        │
└─────────────────────────────────────────────────────────────────────┘
                ↕ async SQL (asyncpg)            ↕ pub/sub
┌──────────────────────────┐         ┌──────────────────────────────┐
│      SUPABASE / DB       │         │           REDIS              │
│  (Postgres + Auth + RLS) │         │  (real-time pub/sub + cache)  │
│                          │         │                              │
│  tables: profiles,       │         │  channel:                    │
│  disruptions, scenarios, │         │  disruptions:{company_id}    │
│  decisions, audit_logs   │         │                              │
└──────────────────────────┘         └──────────────────────────────┘
```

**Reading the diagram:** arrows show the *direction data flows*. The browser talks to the backend, the backend talks to the database and Redis. Each box is one "team member" doing a specific job.

---

## 2. Frontend Workflow (What Happens in Your Browser)

The frontend is built with **Next.js 16** — a tool that lets us write the website in the React framework but with extra powers (file-based routing, server components, etc.).

### 2.1 The Page Tree

```
app/
├── layout.tsx           ← Root layout: fonts, metadata, analytics
├── page.tsx             ← Landing page (/)
├── globals.css          ← Global theme tokens
├── about/               ← /about
├── career/              ← /career
├── contact/             ← /contact
├── customers/           ← /customers
├── pricing/             ← /pricing
├── docs/                ← /docs
├── status/              ← /status
├── login/               ← /login (auth)
├── signup/              ← /signup (auth)
└── dashboard/           ← /dashboard  (PROTECTED — requires login)
    ├── layout.tsx       ←   Sidebar + topbar shell
    └── page.tsx         ←   War-room map + activity stream
```

### 2.2 Login & Access Flow (simple, step-by-step)

```
   USER opens browser
          │
          ▼
   Goes to /dashboard
          │
          ▼
   middleware.ts runs
   (server-side auth gate)
          │
    ┌─────┴──────┐
    │ Has login? │
    └─────┬──────┘
      yes │              no
          ▼                ▼
   Cookie checked     Redirect to /login
   with Supabase      (saves "next" URL)
          │
          ▼
   Dashboard page loads
          │
          ▼
   useEffect runs
   (browser checks session)
          │
    ┌─────┴──────┐
    │ Session OK?│
    └─────┬──────┘
      yes │              no
          ▼                ▼
   Show War Room       Redirect to /login
```

**Why two checks?** The middleware stops a logged-out user *before* the page HTML is even sent. The `useEffect` is a backup in case the session expires *while* the user is on the page.

### 2.3 Dashboard Workflow (the War Room)

```
User clicks "Trigger Scenario"
            │
            ▼
triggerDemoDisruption()  ── POST /api/demo/trigger
            │
            ▼
    Backend runs AI pipeline (4–15s)
            │
            ▼
loadData() refreshes the page
            │
            ▼
fetchDisruptions()         fetchPendingDecisions()
  reads /disruptions         reads /decisions WHERE status='pending'
  ORDER BY created_at        + joins /scenarios
            │                          │
            ▼                          ▼
   "Live Log" cards         "Requires Approval" cards
   (newest first)           (amber, with "Review Options" button)
                                       │
                                       ▼
                              User clicks "Review Options"
                                       │
                                       ▼
                              ApprovalModal opens
                              (shows 3 scenarios, confidence
                               breakdown, Approve / Reject)
                                       │
                          ┌────────────┴────────────┐
                          ▼                         ▼
                POST /api/decisions/.../approve   POST /api/decisions/.../reject
                          │                         │
                          └────────────┬────────────┘
                                       ▼
                              loadData() refreshes
                              modal closes
```

### 2.4 WebSocket Workflow (real-time push, when wired)

```
useDisruptionsWS(companyId)  runs on dashboard mount
            │
            ▼
   build URL: wss://.../ws/disruptions/{companyId}?token={jwt}
            │
            ▼
   new WebSocket(url)
            │
   ┌────────┴────────┐
   │   onopen        │ → setConnected(true)
   │   onmessage     │ → JSON.parse → Zod validate → setEvents(prev => [data, ...prev].slice(0, 200))
   │   onclose       │ → setConnected(false)
   │   onerror       │ → log only (no raw payload leak in prod)
   └─────────────────┘
            │
            ▼
   on unmount: ws.close() + cancelled=true
```

Every incoming message is checked against a Zod schema. Garbage in = silently dropped. This is defense against malformed/malicious pushes.

### 2.5 Frontend File Map (what each file does)

```
frontend/
├── app/                    ← All pages (App Router)
│   ├── page.tsx            ← Landing — scroll-globe, marquee, activity ticker
│   ├── layout.tsx          ← Root HTML, fonts, Vercel analytics
│   ├── dashboard/
│   │   ├── layout.tsx      ← Sidebar + topbar (server component)
│   │   └── page.tsx        ← 'use client' — war room, state, fetches
│   ├── login/, signup/     ← Auth views
│   ├── about/, career/,    ← Marketing pages
│   ├── contact/, customers/, pricing/, docs/, status/
│   └── api/                ← Next.js server routes (mutations only)
│
├── components/
│   ├── landing/            ← ScrollGlobe, ActivityTicker, DualMarquee, SiteHeader, SiteFooter
│   ├── dashboard/          ← ApprovalModal, Map, EventStream cards
│   ├── docs/               ← ExecutionFlow, WireframeGlobe, etc.
│   └── ui/                 ← shadcn-style primitives (button, card, dialog, …)
│
├── hooks/
│   ├── use-disruptions-ws.ts   ← WebSocket client w/ Zod validation
│   ├── use-toast.ts            ← Toast queue
│   └── use-mobile.ts           ← Responsive breakpoint helper
│
├── lib/
│   ├── api.ts              ← Browser-side reads (anon key) + POST helpers
│   ├── api-server.ts       ← Server-side helpers (service-role key)
│   ├── supabase.ts         ← Browser Supabase client factory
│   ├── errors.ts           ← sanitizeError() — never leak PostgREST errors
│   ├── auth-field-classes.ts
│   └── utils.ts            ← cn() — className composer
│
├── middleware.ts           ← /dashboard auth gate
├── next.config.mjs         ← CSP, security headers, image config
└── package.json
```

---

## 3. Backend Architecture (the Python Brain)

The backend is built with **FastAPI** (a fast web framework for Python) and runs an **AI agent pipeline** to detect, analyze, and respond to supply-chain disruptions.

### 3.1 The Startup Sequence

```
uvicorn starts
      │
      ▼
lifespan(app) begins
      │
      ├── init_redis()             ← open Redis connection pool
      ├── start_scheduler()        ← start APScheduler (polling)
      ├── seed_supplier_graph()    ← load demo supplier network
      │
      ▼
app is ready to accept requests
      │
      ▼
on shutdown: stop scheduler → close redis
```

### 3.2 The Request Flow (high level)

```
Browser / Scheduler
        │
        ▼
   POST /disruptions/demo  (or /trigger)
        │
        ▼
   DisruptionService.process_signal()
        │
        ▼
   1. Create Disruption row (status="processing")
        │
        ▼
   2. Run 4-agent pipeline (LangGraph)
        │     ┌────────────────────────────┐
        │     │  classify → severity →      │
        │     │  graph_map → cascade        │
        │     └────────────────────────────┘
        │
        ▼
   3. Update Disruption (event_type, severity, affected_nodes…)
        │
        ▼
   4. ScenarioGenerator → exactly 3 options
        │
        ▼
   5. TradeoffScorer → rank options, pick recommended
        │
        ▼
   6. Save 3 Scenario rows
        │
        ▼
   7. ConfidenceEvaluator → 0–100% score
        │
        ▼
   8. Create Decision row (status="pending")
        │
        ▼
   9. Executor.execute()
        │     ┌──────────────────────────────┐
        │     │ confidence >= 85% ?          │
        │     │   yes → auto_execute         │
        │     │        • write audit log     │
        │     │        • mock ERP update     │
        │     │        • draft supplier email│
        │     │   no  → escalate_to_human   │
        │     │        • write audit log     │
        │     │        • publish to Redis    │
        │     └──────────────────────────────┘
        │
        ▼
   10. Update Disruption (status="resolved" or "escalated")
```

### 3.3 Backend File Map (who does what)

```
r3flex-backend/
├── app/
│   ├── main.py              ← FastAPI app, lifespan, CORS, /health, /ready
│   ├── config.py            ← Pydantic settings (env vars)
│   ├── database.py          ← async SQLAlchemy engine + session factory
│   ├── redis_client.py      ← Redis async client + pub/sub helpers
│   │
│   ├── routers/             ← HTTP endpoints (one file per resource)
│   │   ├── disruptions.py   ← /disruptions  (demo, trigger, list, get)
│   │   ├── scenarios.py     ← /scenarios
│   │   ├── decisions.py     ← /decisions    (list, approve, reject)
│   │   ├── audit.py         ← /audit
│   │   └── ws.py            ← /ws/disruptions/{company_id}  (WebSocket)
│   │
│   ├── services/            ← Business logic (DB writes, orchestration)
│   │   ├── disruption_svc.py← process_signal() — full pipeline orchestrator
│   │   ├── decision_svc.py  ← list / approve / reject decisions
│   │   └── audit_svc.py     ← write audit_logs rows
│   │
│   ├── agents/              ← LangGraph nodes (each is one AI agent)
│   │   ├── orchestrator.py  ← StateGraph: classify → severity → map → cascade
│   │   ├── classifier.py    ← Gemini: event_type + geography
│   │   ├── severity.py      ← Gemini: severity_score + cost/delay estimate
│   │   ├── graph_mapper.py  ← map disruption → supplier-graph node IDs
│   │   └── cascade.py       ← simulate second-order impacts (BFS on graph)
│   │
│   ├── engine/              ← Decision logic
│   │   ├── scenario_gen.py  ← produce exactly 3 rerouting options
│   │   ├── tradeoff.py      ← weighted cost/time/risk scoring
│   │   ├── confidence.py    ← 4-factor composite confidence (0–1)
│   │   └── executor.py      ← auto-execute or escalate via Redis
│   │
│   ├── graph/               ← In-memory supplier network (NetworkX-like)
│   │   ├── supplier_graph.py← Graph data structure + BFS helpers
│   │   └── seed_data.py     ← PharmaDistrib demo: 8 nodes, 3 tiers
│   │
│   ├── ingestion/           ← External signal sources
│   │   ├── scheduler.py     ← APScheduler — polls every N seconds
│   │   ├── news_feed.py     ← NewsAPI (news signals)
│   │   ├── weather_feed.py  ← NOAA / weather API
│   │   └── mock_port_data.py← Hardcoded port-congestion demo
│   │
│   ├── models/              ← SQLAlchemy ORM (DB schema in code)
│   │   ├── disruption.py
│   │   ├── scenario.py
│   │   ├── decision.py
│   │   └── audit_log.py
│   │
│   └── schemas/             ← Pydantic request/response shapes
│       ├── disruption.py
│       ├── scenario.py
│       ├── decision.py
│       └── audit_log.py
│
├── alembic/                 ← DB version-control migrations
├── tests/                   ← Pytest suite (agents, engine, graph, routes)
├── Dockerfile
├── docker-compose.yml       ← db (Postgres) + redis + api
└── requirements.txt
```

### 3.4 WebSocket Workflow (real-time push to the browser)

```
Frontend opens ws://.../ws/disruptions/{companyId}
            │
            ▼
   FastAPI accepts the WebSocket
            │
            ▼
   Send "connected" message (confirms channel)
            │
            ▼
   Subscribe to Redis channel: "disruptions:{companyId}"
            │
            ▼
   Start heartbeat task (30s ping)
            │
            ├── async for message in pubsub.listen():
            │       │
            │       ▼
            │   parse JSON → send to client as "disruption_event"
            │
            └── on disconnect / cancel:
                   cancel heartbeat → unsubscribe → aclose pubsub
```

**What this lets us do:** when an agent decides a human must approve a decision, the executor publishes a payload to Redis. Every dashboard connected to that company's WebSocket channel gets the payload in real time and can pop up the approval modal.

---

## 4. AI Pipeline Architecture (the "thinking" part)

This is the heart of R3FLEX. The pipeline is built with **LangGraph** — a framework where each step is a "node" that reads the shared state and writes its own output. The nodes run in order; later nodes can read earlier nodes' outputs.

### 4.1 The State (the "notebook" passed between agents)

```
┌────────────────────────────────────────────────────────────────┐
│                       AgentState                               │
│                                                                │
│  INPUT          raw_signal, source, company_id                 │
│                                                                │
│  CLASSIFIER     event_type, geography,                         │
│                 affected_trade_routes,                         │
│                 classification_confidence, summary              │
│                                                                │
│  SEVERITY       severity_score, severity_reasoning,            │
│                 affected_shipment_count,                       │
│                 estimated_delay_days, estimated_cost_impact_usd │
│                                                                │
│  GRAPH MAPPER   primary_node, affected_nodes,                  │
│                 affected_shipment_ids,                         │
│                 mapping_confidence, mapping_method             │
│                                                                │
│  CASCADE        cascade_nodes, cascade_depth,                  │
│                 risk_summary, secondary_bottlenecks,           │
│                 stock_out_risk_nodes                           │
│                                                                │
│  META           pipeline_error, pipeline_complete              │
└────────────────────────────────────────────────────────────────┘
```

### 4.2 The 4 Agents in Sequence

```
                    ┌──────────────────────┐
                    │   CLASSIFIER AGENT   │
                    │   (Gemini 2.0 Flash) │
                    └──────────┬───────────┘
        reads:  raw_signal
        writes: event_type, geography, affected_trade_routes,
                classification_confidence, summary
        fallback: keyword match (suez, storm, fire, port, conflict)
                               │
                               ▼
                    ┌──────────────────────┐
                    │   SEVERITY AGENT     │
                    │  (Gemini + Heuristic)│
                    └──────────┬───────────┘
        reads:  event_type, geography, affected_nodes, raw_signal
        writes: severity_score (1–10), severity_reasoning,
                affected_shipment_count, estimated_delay_days,
                estimated_cost_impact_usd
        fallback: severity = 7.0 (high) for known keywords
                               │
                               ▼
                    ┌──────────────────────┐
                    │   GRAPH MAPPER       │
                    │   (deterministic)    │
                    └──────────┬───────────┘
        reads:  geography, event_type, affected_trade_routes
        writes: primary_node, affected_nodes, affected_shipment_ids,
                mapping_confidence, mapping_method
        how:    geography → node lookup table; if ambiguous, "graph_fallback"
                               │
                               ▼
                    ┌──────────────────────┐
                    │   CASCADE AGENT      │
                    │   (graph BFS)        │
                    └──────────┬───────────┘
        reads:  primary_node, event_type, severity_score, geography
        writes: cascade_nodes (BFS depth 2), cascade_depth,
                risk_summary, secondary_bottlenecks, stock_out_risk_nodes
        how:    BFS over supplier graph; flags bottlenecks
```

### 4.3 The Decision Engine (after the agents)

After the 4 agents finish, the decision engine takes over:

```
AgentState (filled in)
            │
            ▼
┌─────────────────────────┐
│   SCENARIO GENERATOR    │
│   "give me 3 options"   │
└────────────┬────────────┘
             │  for Suez demo → hardcoded templates
             │  for other events → Gemini generates
             ▼
   [Option 1, Option 2, Option 3]
             │
             ▼
┌─────────────────────────┐
│     TRADEOFF SCORER     │
│  time 0.40 + cost 0.35  │
│  + risk 0.25            │
└────────────┬────────────┘
             │  min-max normalize → weighted sum → sort
             ▼
   [ScoredScenario 1 (recommended), 2, 3]
             │
             ▼
┌─────────────────────────┐
│   CONFIDENCE EVALUATOR  │
│  4 sub-factors × 0.25   │
└────────────┬────────────┘
             │
             ├── 1. data_quality    (signal length + mapping_conf + primary_node)
             ├── 2. classification_confidence
             ├── 3. scenario_gap    (how much better #1 is vs #2)
             └── 4. severity_fit    (does severity justify decisive action?)
             │
             ▼
   confidence ∈ [0.0, 1.0]
             │
        ┌────┴────┐
        ▼         ▼
   >= 0.85     < 0.85
        │         │
        ▼         ▼
   AUTO-       ESCALATE
   EXECUTE     TO HUMAN
        │         │
        ▼         ▼
   write        write
   audit log    audit log
   mock ERP     publish
   email draft  to Redis →
   mark         WebSocket
   decision    → dashboard
   "executed"  → modal
```

### 4.4 Why LangGraph?

A normal Python function would call agents one by one. **LangGraph** is useful because:
- Each node is independent — easy to test, easy to swap
- State is shared and typed (`TypedDict`)
- If any node errors, the next nodes can short-circuit
- The graph is **compiled once at module load** (not per request), so the cost is paid one time

### 4.5 LLM vs Fallback (what happens if Gemini is down)

Every AI agent has a **deterministic fallback** so the demo never breaks:

| Agent | LLM path | Fallback path |
|---|---|---|
| Classifier | Gemini → event_type, geography | Keyword match: `suez` → `trade_route_disruption`, `storm` → `extreme_weather`, etc. |
| Severity | Gemini → severity_score | Heuristic: 7.0 default, 9.0 if "suez" mentioned |
| Scenario Gen | Gemini → 3 options | Generic templates: wait/backup/air-freight |
| Graph Mapper | (deterministic) | Geography → node lookup table |
| Cascade | (deterministic BFS) | Empty cascade if graph not seeded |

If `GOOGLE_API_KEY` is not set, the LLM is skipped entirely and the fallback runs.

---

## 5. DBMS Workflow (the Filing Cabinet)

R3FLEX uses **Supabase** (which is Postgres under the hood) plus **Row-Level Security (RLS)** to keep data safe.

### 5.1 Tables and What They Hold

```
┌────────────────────────────────────────────────────────────────────────┐
│                              SUPABASE                                 │
│                                                                        │
│  ┌─────────────────┐                                                   │
│  │  auth.users     │  ← Supabase managed (email + password)           │
│  └────────┬────────┘                                                   │
│           │ 1-to-1                                                     │
│           ▼                                                            │
│  ┌─────────────────┐                                                   │
│  │  profiles       │  first_name, last_name, phone, country, state     │
│  └─────────────────┘                                                   │
│                                                                        │
│  ┌─────────────────┐         ┌─────────────────┐                       │
│  │  disruptions    │ 1───∞  │  scenarios      │                       │
│  │  id, event_type,│         │  option_index,  │                       │
│  │  geography,     │         │  label, cost,   │                       │
│  │  severity,      │         │  time, risk,    │                       │
│  │  status         │         │  composite,     │                       │
│  └────────┬────────┘         │  recommended    │                       │
│           │                   └────────┬────────┘                       │
│           │ 1                       │ 1                                │
│           ▼                         ▼                                  │
│  ┌─────────────────┐         ┌─────────────────┐                       │
│  │  decisions      │         │  audit_logs     │                       │
│  │  confidence,    │         │  action_type,   │                       │
│  │  auto_executed, │         │  reasoning,     │                       │
│  │  approver_id,   │         │  signals_used,  │                       │
│  │  status         │         │  actor,         │                       │
│  └─────────────────┘         │  company_id     │                       │
│                              └─────────────────┘                       │
│                                                                        │
│  indexes:                                                             │
│    disruptions_created_at_idx, disruptions_status_idx                  │
│    scenarios_disruption_id_idx                                        │
│    decisions_status_idx, decisions_disruption_id_idx                   │
│    audit_logs_created_at_idx, audit_logs_disruption_id_idx             │
└────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Read vs Write — Who Can Do What?

The frontend **reads** with the **anon key** (limited by RLS). The backend's `/api/*` server routes **write** with the **service-role key** (bypasses RLS). This is the security model.

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   BROWSER  (anon key)                                          │
│   ─────────                                                    │
│   reads: disruptions, scenarios, decisions, audit_logs         │
│   writes: (blocked by RLS)                                    │
│                                                                │
│   NEXT.JS /api/*  (service-role key, server only)              │
│   ─────────────────                                            │
│   reads: anything (service role bypasses RLS)                  │
│   writes: anything                                            │
│   stamps actor / approver from verified JWT                    │
│                                                                │
│   FASTAPI BACKEND  (service-role key, server only)             │
│   ─────────────────                                            │
│   reads: anything via asyncpg                                  │
│   writes: anything (writes audit log FIRST, then acts)         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 5.3 Defense-in-Depth (the security layers)

```
Layer 1 — middleware.ts (Next.js)
            │
            │  anonymous → /login
            │  authed    → /dashboard
            ▼
Layer 2 — Supabase RLS (Postgres)
            │
            │  anon role: SELECT only
            │  service role: bypass (used by /api/*)
            ▼
Layer 3 — audit_logs immutability trigger
            │
            │  UPDATE / DELETE → raised exception
            │  "audit_logs are immutable"
            ▼
Layer 4 — decision replay trigger
            │
            │  approved/rejected → can't transition again
            ▼
Layer 5 — CSP + security headers (next.config.mjs)
            │
            │  default-src 'self'
            │  connect-src wss: https://*.supabase.co
            │  X-Frame-Options: DENY
            │  Strict-Transport-Security (HSTS)
```

### 5.4 SQL Migrations (version control for the database)

```
supabase/
├── schema.sql                                  ← v1: initial tables + RLS
└── migrations/
    ├── 20260421_0001_r3flex_supabase_schema.sql ← v2: indexes + RLS hardening
    └── 20260614_0002_r3flex_security_hardening.sql ← v3: triggers + helpers
```

Migrations are forward-only. Run them in order in the Supabase SQL editor.

### 5.5 Alembic (Python-side migrations for the same DB)

```
r3flex-backend/
└── alembic/
    ├── env.py
    └── versions/
        └── 20260421_1253_6e5d4c64c98e_initial.py
```

The backend uses **Alembic** for SQLAlchemy ORM models. The same DB is managed by *both* Supabase SQL and Alembic. They are kept in sync (with the Supabase migration adding indexes that the Alembic one misses — see `disruptions_created_at_idx`).

---

## 6. End-to-End: From a Storm in the Suez Canal to a Decision on Screen

Let's walk through one real disruption end-to-end. The user is a pharma distributor with 4 active shipments through the Suez Canal.

```
T+0s  News feed reports: "Vessel diversions at Suez Canal — military activity"
        │
        ▼
T+1s  APScheduler fires (poll_all_feeds)
        │
        ▼
T+2s  DisruptionService.process_signal() begins
        │
        ├── Creates Disruption row (status="processing")
        │
        ▼
T+3s  ClassifierAgent: "trade_route_disruption" / "Suez Canal, Egypt" / conf 0.94
        │
        ▼
T+5s  SeverityAgent: 9.1/10 — 4 shipments affected — +$28K cost, +14 days delay
        │
        ▼
T+6s  GraphMapperAgent: primary_node="suez-hub", 4 shipment IDs
        │
        ▼
T+7s  CascadeAgent: Rotterdam hub +6 days delay, Frankfurt stock-out risk
        │
        ▼
T+8s  ScenarioGenerator: 3 options (Cape / Air freight / Berlin backup)
        │
        ▼
T+9s  TradeoffScorer: Option 3 (Berlin) wins (composite 0.21)
        │
        ▼
T+10s ConfidenceEvaluator: 91% (data 0.85, classifier 0.94, gap 0.88, severity 0.95)
        │
        ▼
T+11s 91% >= 85% threshold → AUTO-EXECUTE path
        │
        ├── 1. Audit log written
        ├── 2. Mock ERP log entry created
        ├── 3. Supplier email drafted (operations@berlin-pharma.de)
        ├── 4. Decision marked "executed"
        ├── 5. Disruption marked "resolved"
        │
        ▼
T+12s  Response sent to browser (status 201)
        │
        ▼
T+13s Dashboard re-fetches → Live Log shows new card
                         "Suez Canal, Egypt • trade_route_disruption"
                         "Severity: 9.1/10"
        │
        ▼
        END — total: 13 seconds from news to dashboard
```

If the confidence had been *below* 85%, the executor would have published to Redis, the WebSocket would have pushed an `approval_required` event, the modal would have popped up, and a human would have approved or rejected.

---

## 7. Repository Layout

```text
R3FLEX/
├── frontend/            # Next.js app, configs, assets, and frontend env
│   ├── app/             # Next.js pages, layouts, route groups
│   ├── components/      # Landing, dashboard, and reusable UI components
│   ├── hooks/           # Custom client hooks
│   ├── lib/             # Shared utilities and API helpers
│   └── public/          # Static assets
├── r3flex-backend/      # FastAPI backend, LangGraph pipeline, and tests
│   ├── app/             # Routers, services, agents, engine, models
│   ├── alembic/         # DB migrations
│   └── tests/           # Pytest suite
├── supabase/            # SQL schema and migrations
└── SETUP.md             # End-to-end local environment setup
```

## 8. Quick Start (Frontend)

Requirements: Node.js 18+

```bash
cd frontend
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

If you prefer npm:

```bash
cd frontend
npm install
npm run dev
```

## 9. Full Local Stack (Frontend + Backend + DB)

For full local setup including Docker services, migrations, backend API, and demo flow, see [SETUP.md](SETUP.md).

## 10. Environment Variables

Frontend variables are documented in [frontend/.env.example](frontend/.env.example):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_WS_URL` (optional override)

Backend variables are documented in [r3flex-backend/.env.example](r3flex-backend/.env.example):
- `DATABASE_URL` (asyncpg DSN)
- `REDIS_URL`
- `GOOGLE_API_KEY` (Gemini — has fallbacks if missing)
- `CONFIDENCE_THRESHOLD` (default `0.85`)
- `POLL_INTERVAL_SECONDS` (default `60`)

## 11. Development Notes

- Landing page and core brand narrative are in [frontend/app/page.tsx](frontend/app/page.tsx).
- Global theme tokens and base styles are in [frontend/app/globals.css](frontend/app/globals.css).
- Root layout and metadata are in [frontend/app/layout.tsx](frontend/app/layout.tsx).
- Backend entry point is [r3flex-backend/app/main.py](r3flex-backend/app/main.py).
- AI pipeline is wired in [r3flex-backend/app/agents/orchestrator.py](r3flex-backend/app/agents/orchestrator.py).

## 12. AI Model Architecture Pipeline (R3FLEX)

> Backend AI is implemented with **LangGraph + LangChain + Google Gemini** and a confidence-threshold human-in-the-loop execution path.

```
External Signals / Events
        │
        ▼
Signal Ingestion Layer (Scheduler / API)
        │
        ▼
Disruption Service (FastAPI)
        │
        ▼
LangGraph Orchestrator (StateGraph)
        │
        ▼
+---------------- AI AGENT PIPELINE ----------------+
|                                                   |
|  Classifier Agent (Gemini)                        |
|        |                                          |
|        v                                          |
|  Severity Agent (LLM + Heuristic)                 |
|        |                                          |
|        v                                          |
|  Graph Mapper Agent (Supply Chain Mapping)        |
|        |                                          |
|        v                                          |
|  Cascade Agent (Impact Simulation)                |
|                                                   |
+---------------------------------------------------+
        |
        v
+--------------- DECISION ENGINE --------------------+
|                                                   |
|  Scenario Generator (Generate 3 Options)           |
|        |                                          |
|        v                                          |
|  Tradeoff Scorer (Cost / Time / Risk)             |
|        |                                          |
|        v                                          |
|  Confidence Evaluator                             |
|                                                   |
+---------------------------------------------------+
        |
        v
+---------------- EXECUTION -------------------------+
|                                                   |
|  if confidence >= threshold                       |
|        --> Auto Executor                          |
|                                                   |
|  if confidence < threshold                        |
|        --> Human-in-the-loop                      |
|                                                   |
+---------------------------------------------------+
        |
        v
+--------------------+        +----------------------+
|   PostgreSQL DB    |        |     Redis Pub/Sub    |
+--------------------+        +----------------------+
        |                               |
        v                               v
+--------------------+        +----------------------+
|   Audit Logger     |        |  WebSocket Server    |
+--------------------+        +----------------------+
        |                               |
        +---------------+---------------+
                        |
                        v
                Frontend UI / Storage
```

### Pipeline stages (what the "AI model" does)

1. **Signal ingestion** (scheduler polling + manual/demo triggers)
2. **ClassifierAgent (Gemini)** → event type + geography (fallback: keywords)
3. **SeverityAgent (Gemini)** → severity + cost/delay estimates (fallback: heuristic)
4. **GraphMapperAgent** → map disruption to supplier graph nodes + shipment IDs
5. **CascadeAgent** → simulate second-order impacts (cascade nodes, bottlenecks, stock-out risk)
6. **ScenarioGenerator** → generates **exactly 3** response options (demo: hardcoded Suez; otherwise Gemini)
7. **Tradeoff + Confidence** → ranks options + decides if confidence is above threshold
8. **Executor**
   - **Auto-exec** if confidence ≥ threshold
   - **Escalate to human** if confidence < threshold via **Redis → WebSocket → UI modal**
9. **Audit trail** persisted (reasoning, signals used, confidence, actor)
