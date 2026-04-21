# R3flex Backend

Agentic supply chain resilience platform. Detects disruptions, simulates rerouting, executes autonomously.

## Stack

- **FastAPI** + Uvicorn (async ASGI)
- **PostgreSQL 15** + async SQLAlchemy 2.0
- **Redis 7** — pub/sub + caching
- **NetworkX** — multi-tier supplier graph
- **LangGraph** — multi-agent pipeline (Gemini 2.0 Flash as LLM)
- **APScheduler** — polls feeds every 60s

## Quickstart (Docker — recommended)

```bash
# 1. Clone and enter backend
cd r3flex-backend

# 2. Copy env template
cp .env.example .env
# Fill in GOOGLE_API_KEY (free at aistudio.google.com/apikey)

# 3. Spin up all services
docker-compose up --build

# 4. Run migrations (first time only)
docker-compose exec api alembic upgrade head

# 5. Visit API docs
open http://localhost:8000/docs
```

## Quickstart (Local — no Docker)

```bash
# Prerequisites: Python 3.11+, PostgreSQL 15, Redis 7

cd r3flex-backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # Fill in your values

alembic upgrade head            # Create tables
uvicorn app.main:app --reload   # Start dev server
```

## Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/disruptions/demo` | Trigger hardcoded Suez Canal demo (confidence 91%, auto-executes) |
| `POST` | `/disruptions/trigger` | Trigger custom analysis pipeline |
| `GET`  | `/disruptions` | List all disruptions (paginated) |
| `GET`  | `/disruptions/{id}` | Single disruption with scenarios |
| `POST` | `/decisions/{id}/approve` | Human approval (below-threshold cases) |
| `GET`  | `/audit` | Full audit log |
| `WS`   | `/ws/disruptions/{company_id}` | Real-time event stream |

## Demo Scenario

```bash
curl -X POST http://localhost:8000/disruptions/demo
```

**Expected response:**
- Event: Suez Canal disruption, severity 9.1
- 3 scenarios generated (Cape of Good Hope / Air freight / Berlin backup)
- Confidence: 91% → auto-executes (> 85% threshold)
- Audit log entry written before execution

## WebSocket

Connect to `ws://localhost:8000/ws/disruptions/pharma-distrib-india` for real-time events.
Below-threshold decisions publish here for human approval modal.

## Environment Variables

See `.env.example` for full list. Key ones:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | asyncpg connection string |
| `REDIS_URL` | ✅ | Redis connection string |
| `GOOGLE_API_KEY` | ✅ | Gemini API key (free) |
| `NEWS_API_KEY` | Optional | Mock fallback if missing |
| `NOAA_API_KEY` | Optional | Mock fallback if missing |
| `CONFIDENCE_THRESHOLD` | Optional | Default 0.85 |

## Run Tests

```bash
pytest tests/ -v
```

## Architecture

```
Signal Feeds (NewsAPI + NOAA + mock)
    ↓  APScheduler (60s)
Classifier Agent → Severity Agent → Graph Mapper → Cascade Agent
    ↓  LangGraph orchestrator
Scenario Generator → Tradeoff Scorer → Confidence Evaluator
    ↓
≥85% confidence → Executor (auto) → Audit Log
<85% confidence → Redis pub/sub → WebSocket → Human approval
```
