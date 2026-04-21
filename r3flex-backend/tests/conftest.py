"""
pytest configuration and shared fixtures.
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.graph.seed_data import seed_supplier_graph


@pytest.fixture(scope="session", autouse=True)
def seed_graph():
    """Seed supplier graph once per test session."""
    seed_supplier_graph()


@pytest_asyncio.fixture
async def client():
    """
    Async HTTP test client for FastAPI app.
    Does NOT start scheduler or connect to real Redis/DB.
    Routers that call DB will need their own DB mocking.
    """
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac
