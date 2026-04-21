"""
Pydantic v2 schemas for AuditLog API layer.
Read-only — audit logs are never created or modified via API.
"""
import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class AuditLogRead(BaseModel):
    """
    Single audit log entry.
    Contains full reasoning text and signals that triggered the action.
    """

    model_config = {"from_attributes": True}

    id: uuid.UUID
    disruption_id: Optional[uuid.UUID] = None
    decision_id: Optional[uuid.UUID] = None
    action_type: str = Field(
        ...,
        description=(
            "e.g. 'auto_execute', 'escalate_human', 'human_approve', "
            "'human_reject', 'scenario_generated', 'cascade_simulated'"
        ),
    )
    reasoning: Optional[str] = Field(
        default=None,
        description="Full LLM reasoning or human notes at time of action",
    )
    signals_used: Optional[dict[str, Any]] = Field(
        default=None,
        description="Which signal feeds were active: {news: bool, weather: bool, port: bool}",
    )
    confidence_score: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description="Confidence snapshot at time of action",
    )
    actor: str = Field(
        ...,
        description="'agent' or 'human:{approver_id}'",
    )
    company_id: str
    created_at: datetime


class AuditLogList(BaseModel):
    """Paginated audit log response."""

    items: list[AuditLogRead]
    total: int
    page: int
    page_size: int
