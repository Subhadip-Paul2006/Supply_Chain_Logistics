"""
Pydantic v2 schemas for Disruption API layer.
DisruptionCreate — request body for manual trigger
DisruptionRead   — response shape (returned to client)
DisruptionList   — paginated list response
"""
import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field, field_validator

from app.schemas.scenario import ScenarioRead


class DisruptionCreate(BaseModel):
    """
    Request body for POST /disruptions/trigger.
    All fields optional — raw_signal is the minimum required input.
    """

    raw_signal: str = Field(
        ...,
        description="Raw text from news/weather/port feed to analyze",
        min_length=10,
        max_length=5000,
    )
    source: Optional[str] = Field(
        default="manual",
        description="Signal source: 'news', 'weather', 'port', 'manual'",
    )
    company_id: Optional[str] = Field(
        default="pharma-distrib-india",
        description="Company identifier for multi-tenant isolation",
    )


class DisruptionRead(BaseModel):
    """
    Full disruption response — returned by GET /disruptions/{id}.
    Includes nested scenarios list.
    """

    model_config = {"from_attributes": True}  # Pydantic v2: replaces orm_mode=True

    id: uuid.UUID
    event_type: Optional[str] = None
    geography: Optional[str] = None
    severity_score: Optional[float] = Field(
        default=None, ge=1.0, le=10.0, description="Impact score 1.0–10.0"
    )
    raw_signal: Optional[str] = None
    affected_nodes: Optional[list[str]] = None
    cascade_nodes: Optional[list[str]] = None
    status: str
    created_at: datetime
    updated_at: datetime
    scenarios: list[ScenarioRead] = []

    @field_validator("severity_score", mode="before")
    @classmethod
    def clamp_severity(cls, v: Any) -> Optional[float]:
        """Clamp severity to 1–10 range. Never return out-of-range value to client."""
        if v is None:
            return v
        return max(1.0, min(10.0, float(v)))


class DisruptionSummary(BaseModel):
    """Compact version for list responses — omits raw_signal and scenarios."""

    model_config = {"from_attributes": True}

    id: uuid.UUID
    event_type: Optional[str] = None
    geography: Optional[str] = None
    severity_score: Optional[float] = None
    status: str
    created_at: datetime


class DisruptionList(BaseModel):
    """Paginated list of disruptions."""

    items: list[DisruptionSummary]
    total: int
    page: int
    page_size: int
