# KisaanConnect Backend (v2.0 - Speed & Realtime Enabled)

Production-structured FastAPI backend for **KisaanConnect**, a farmer-to-buyer digital marketplace developed for Smart India Hackathon (SIH) Problem Statement 26033: *"Multiple intermediaries reduce farmers' earnings and increase consumer prices"*.

---

## What's New in v2.0 (Speed & Realtime Architecture)

- **Async Database Layer:** Fully non-blocking DB queries using `AsyncSession` with `asyncpg` (PostgreSQL) or `aiosqlite` (SQLite local dev).
- **Sub-100ms Instant Pricing:** `POST /api/pricing/suggest` returns in-memory estimates in <5ms without blocking on external APIs.
- **Server-Sent Events (SSE) AI Streaming:** `GET /api/pricing/suggest/stream` streams live AI reasoning tokens and yields an `event: result` payload with a 6s timeout fallback.
- **Non-Blocking Product Creation:** `POST /api/products` saves listings instantly (<60ms) with `BackgroundTasks` refining AI pricing asynchronously.
- **Live WebSocket Channels:** `WS /api/ws/orders/{user_id}` broadcasts real-time `order_update` events when order statuses change.
- **Performance Middleware:** Automatic response compression (`GZipMiddleware`) and handler latency tracking (`X-Process-Time` header).

---

## Tech Stack

- **Framework:** FastAPI (Python 3.11+), async endpoints
- **Database:** PostgreSQL / PostGIS with `asyncpg` (or SQLite + `aiosqlite`)
- **ORM & Migrations:** Async SQLAlchemy 2.0 + Alembic
- **Auth:** JWT (`python-jose`) + Bcrypt (`bcrypt`)
- **AI & SSE:** Groq Async Python SDK (`groq`), Server-Sent Events (`StreamingResponse`)
- **WebSockets:** FastAPI WebSockets (`ConnectionManager`)
- **Caching:** `cachetools` (10-min AI price TTL, 30-sec listing TTL)

---

## Quick Start Setup Guide

### 1. Prerequisites & Virtual Environment

Ensure Python 3.11+ is installed. Clone the repository and navigate to `backend/`:

```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate

# On Linux / macOS:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

Copy `.env.example` to create `.env`:

```bash
cp .env.example .env
```

Update parameters inside `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kisaanconnect
SECRET_KEY=kisaan_connect_super_secret_jwt_key_sih_2026_demo
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Database Setup (Docker PostgreSQL + PostGIS)

```bash
docker run -d \
  --name kisaanconnect-db \
  -p 5432:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=kisaanconnect \
  postgis/postgis:15-3.3
```

### 5. Run Migrations & Seed Sample Data

```bash
alembic upgrade head
python scripts/seed.py
```

### 6. Run Local Development Server

```bash
uvicorn app.main:app --reload --port 8000
```

---

## Endpoints: Instant vs Realtime/Streaming

### Instant Endpoints (Sub-100ms Response Time)
- `POST /api/pricing/suggest`: Instant in-memory price estimate (`source: instant`).
- `POST /api/products`: Creates listing instantly; AI refinement executes in background.
- `POST /api/orders`: Computes Haversine distance & delivery days synchronously and returns immediately.

### Realtime & Streaming Endpoints
- `GET /api/pricing/suggest/stream`: SSE text stream delivering token reasoning and final `event: result`.
- `WS /api/ws/orders/{user_id}`: WebSocket connection broadcasting `order_update` events on status changes.

---

## Recommended Frontend Optimistic UI Pattern

To keep the animated React frontend (Framer Motion / Three.js) responsive with zero loading spinners:

1. **Instant Render:** Call `POST /api/pricing/suggest` on crop input. Render the initial price estimate card immediately (<5ms).
2. **Parallel Streaming:** In parallel, open `EventSource('/api/pricing/suggest/stream?...')`.
3. **Smooth Reconciliation:** Show the live "AI is analyzing mandi trends..." typing effect. When the `event: result` SSE message fires, smoothly swap in the refined AI value.

---

## Sample Credentials for Demo (after running `scripts/seed.py`)

- **Default Password:** `password123`
- **Farmer Phones:** `9823011111` (Ramesh Patil - Nashik), `9814033333` (Harpreet Singh - Ludhiana)
- **Buyer Phones:** `9900011111` (FreshMart Bulk Buyer - Mumbai), `9900022222` (Anita Sharma Consumer - Delhi)
