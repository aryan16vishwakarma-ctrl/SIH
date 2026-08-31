import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

from app.config import settings

raw_url = settings.DATABASE_URL

# Convert URLs for async drivers
if raw_url.startswith("postgresql://"):
    async_database_url = raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif raw_url.startswith("postgres://"):
    async_database_url = raw_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif raw_url.startswith("sqlite:///"):
    async_database_url = raw_url.replace("sqlite:///", "sqlite+aiosqlite:///", 1)
else:
    async_database_url = raw_url

connect_args = {}
if "sqlite" in async_database_url:
    connect_args["check_same_thread"] = False
else:
    connect_args["statement_cache_size"] = 0
    connect_args["prepared_statement_cache_size"] = 0

# Configure Async Engine with pool sizing
if "sqlite" in async_database_url:
    engine = create_async_engine(
        async_database_url,
        connect_args=connect_args,
        echo=False
    )
else:
    engine = create_async_engine(
        async_database_url,
        connect_args=connect_args,
        pool_size=10,
        max_overflow=5,
        pool_pre_ping=True,
        echo=False
    )

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
