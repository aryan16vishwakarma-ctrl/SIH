import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.database import engine, Base
import app.models
from app.routers import auth, farmers, products, orders, pricing, beckn

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure all tables exist on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title="KisaanConnect API",
    description="Farmer-to-Buyer Digital Marketplace API for SIH Problem Statement 26033 (Realtime & Speed Optimized)",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# 1. GZip Compression Middleware for response compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 2. CORS Middleware with WebSocket support
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Execution Time Middleware (X-Process-Time)
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
    response.headers["X-Process-Time"] = f"{process_time_ms}ms"
    return response

# Include Routers
app.include_router(auth.router)
app.include_router(farmers.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(pricing.router)
app.include_router(beckn.router)

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "KisaanConnect Backend",
        "version": "2.0.0",
        "mode": "async-realtime"
    }

@app.get("/", tags=["Health"])
async def root():
    return {
        "message": "Welcome to KisaanConnect API v2.0 (Speed & Realtime Enabled)",
        "docs": "/docs",
        "health": "/health"
    }
