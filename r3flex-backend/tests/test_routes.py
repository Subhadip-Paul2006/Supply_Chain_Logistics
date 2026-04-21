"""
Integration tests for FastAPI routes.
Uses TestClient — no real DB or Redis required for basic route tests.
"""
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.mark.asyncio
async def test_health_check():
    """/health must return 200 with status=ok."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data


@pytest.mark.asyncio
async def test_docs_accessible():
    """/docs must return 200 (OpenAPI UI available)."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/docs")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_list_disruptions_empty():
    """GET /disruptions must return 200 with empty list when DB is empty."""
    # Note: This test expects a real DB. In CI without DB, it will return 500.
    # Mark as skip if no DATABASE_URL configured.
    import os
    if not os.getenv("DATABASE_URL"):
        pytest.skip("DATABASE_URL not set — skipping DB-dependent test")

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/disruptions")

    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert isinstance(data["items"], list)


@pytest.mark.asyncio
async def test_disruption_not_found():
    """GET /disruptions/{invalid-id} must return 400 for invalid UUID."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/disruptions/not-a-uuid")
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_disruption_uuid_not_found():
    """GET /disruptions/{valid-uuid} must return 404 for nonexistent UUID."""
    import os
    if not os.getenv("DATABASE_URL"):
        pytest.skip("DATABASE_URL not set — skipping DB-dependent test")

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/disruptions/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_approve_invalid_uuid():
    """POST /decisions/{invalid}/approve must return 400."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/decisions/not-a-uuid/approve",
            json={"approver_id": "test-user"}
        )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_audit_list_empty():
    """GET /audit must return 200."""
    import os
    if not os.getenv("DATABASE_URL"):
        pytest.skip("DATABASE_URL not set")

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/audit")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
