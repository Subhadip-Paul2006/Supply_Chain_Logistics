"""
Alembic env.py — async migration runner.
Configured for async SQLAlchemy (asyncpg driver).
Imports all models so Alembic can auto-generate migrations.
"""
import asyncio
import os
import sys

# ── Ensure `app` package is importable ────────────────────────────────────────
# Alembic runs from r3flex-backend/ but Python may not have it on sys.path.
# This resolves the directory that contains the `app/` folder and adds it.
_HERE = os.path.dirname(os.path.abspath(__file__))          # .../alembic/
_ROOT = os.path.dirname(_HERE)                              # .../r3flex-backend/
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)
from logging.config import fileConfig

from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine

# Import app config and Base
from app.config import get_settings
from app.database import Base

# Import all models so Alembic detects them for auto-generation
import app.models  # noqa: F401 — registers Disruption, Scenario, Decision, AuditLog

# Alembic Config object
config = context.config

# Set up Python logging from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# SQLAlchemy MetaData for 'autogenerate' support
target_metadata = Base.metadata


def get_url() -> str:
    """Read database URL from app settings (reads from .env)."""
    return get_settings().database_url


def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.
    Does not require a live DB connection — generates SQL script.
    """
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection) -> None:
    """Run migrations with an active connection."""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode with async engine.
    asyncpg requires run_sync() to execute synchronous Alembic migration code.
    """
    engine = create_async_engine(get_url(), echo=False)

    async with engine.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await engine.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
