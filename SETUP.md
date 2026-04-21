# R3FLEX — Quick Setup Guide

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | Next.js frontend |
| Python | 3.11+ | FastAPI backend |
| Docker | 24+ | PostgreSQL + Redis |
| Git | any | Version control |

---

## 1. Clone & Install Frontend

```bash
cd R3FLEX/frontend
npm install
```

## 2. Start Infrastructure (Postgres + Redis)

```bash
cd r3flex-backend
docker compose up -d db redis
```

Wait ~10s for both containers to become healthy:

```bash
docker compose ps   # both should show "healthy"
```

## 3. Setup Backend

```bash
cd r3flex-backend

# Create virtualenv (skip if already exists)
python -m venv venv

# Activate
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install deps
pip install -r requirements.txt
```

## 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` — the only **required** key:

```
GOOGLE_API_KEY=your-gemini-api-key
```

> Get free key at https://aistudio.google.com/apikey

Everything else has working defaults. NewsAPI/NOAA keys optional (mock fallbacks activate).

## 5. Run Database Migrations

```bash
alembic upgrade head
```

## 6. Start Backend

```bash
uvicorn app.main:app --reload --port 8000
```

Verify: http://localhost:8000/docs → Swagger UI should load.

## 7. Start Frontend

Open a **new terminal**:

```bash
cd R3FLEX/frontend
npm run dev
```

Frontend: http://localhost:3000

---

## Quick Demo Flow

1. Open http://localhost:3000 → Landing page
2. Click **Start free trial** → `/signup` or go to `/login`
3. Enter any email/password → redirects to `/dashboard`
4. Click **Trigger Scenario (Suez Blockade)** → fires `POST /disruptions/demo`
5. Watch live events stream via WebSocket
6. If confidence < 85% → Approval Modal appears → click **Execute**

---

## Architecture

```
┌──────────────────┐     REST/WS      ┌──────────────────┐
│  Next.js :3000   │ ◄──────────────► │  FastAPI :8000   │
│  (Frontend)      │                  │  (Backend)       │
└──────────────────┘                  └────────┬─────────┘
                                               │
                                    ┌──────────┴─────────┐
                                    │                    │
                              ┌─────▼─────┐      ┌──────▼──────┐
                              │ Postgres  │      │   Redis     │
                              │ :5432     │      │   :6379     │
                              └───────────┘      └─────────────┘
```

## Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend API | 8000 | http://localhost:8000 |
| Swagger Docs | 8000 | http://localhost:8000/docs |
| PostgreSQL | 5432 | — |
| Redis | 6379 | — |

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Connection refused :5432` | Run `docker compose up -d db redis` |
| `Redis connection failed` | Same as above |
| `alembic: target not found` | Run `alembic upgrade head` first |
| `GOOGLE_API_KEY missing` | Add key to `.env` |
| Frontend can't reach backend | Backend must be on `:8000`, check CORS |
