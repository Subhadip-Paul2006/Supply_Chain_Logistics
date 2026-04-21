"""
Pydantic v2 schemas for Decision API layer.
DecisionRead        — response shape
HumanApprovalRequest — request body for POST /decisions/{id}/approve
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class DecisionRead(BaseModel):
    """
    Decision response — shows confidence, execution path, and status.
    Returned by GET /decisions and nested in disruption responses.
    """

    model_config = {"from_attributes": True}

    id: uuid.UUID
    disruption_id: uuid.UUID
    scenario_id: Optional[uuid.UUID] = None
    confidence_score: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description="Confidence 0.0–1.0. ≥0.85 → auto-execute.",
    )
    auto_executed: bool
    human_approved: Optional[bool] = None
    approver_id: Optional[str] = None
    status: str = Field(
        ...,
        description="'pending' | 'approved' | 'rejected' | 'executed'",
    )
    outcome: Optional[str] = None
    executed_at: Optional[datetime] = None
    created_at: datetime


class HumanApprovalRequest(BaseModel):
    """
    Request body for POST /decisions/{id}/approve or /reject.
    Sent when human reviews a below-threshold decision.
    """

    approver_id: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Identifier of the approving human (user ID, email, etc.)",
    )
    notes: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Optional notes from the approver",
    )


class DecisionList(BaseModel):
    """Paginated list of decisions."""

    items: list[DecisionRead]
    total: int
    page: int
    page_size: int
    pending_count: int = Field(
        default=0,
        description="Number of decisions awaiting human approval",
    )
