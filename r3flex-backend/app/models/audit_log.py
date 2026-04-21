"""
AuditLog ORM model.
Immutable record of every action taken by agent or human.
CRITICAL: Written BEFORE any execution — never after.
This is compliance infrastructure, not just logging.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class AuditLog(Base):
    """
    Append-only audit trail for every decision and action.

    Business rule: AuditService.log() MUST be called before Executor.execute().
    Violating this order is a critical bug.

    Columns:
        id              : UUID primary key
        disruption_id   : FK to Disruption (which event triggered this)
        decision_id     : FK to Decision (which decision this logs)
        action_type     : e.g. "auto_execute", "escalate_human", "human_approve",
                          "human_reject", "scenario_generated", "cascade_simulated"
        reasoning       : Full LLM reasoning text — what the agent was thinking
        signals_used    : JSON — which feeds contributed (news/weather/port)
        confidence_score: Snapshot of confidence at time of action
        actor           : "agent" | "human:{approver_id}"
        company_id      : Which company this belongs to (multi-tenant future)
        created_at      : UTC timestamp — IMMUTABLE, never updated
    """

    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    disruption_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("disruptions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    decision_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("decisions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    action_type: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True
    )
    reasoning: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    signals_used: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    actor: Mapped[str] = mapped_column(
        String(255), nullable=False, default="agent"
    )
    company_id: Mapped[str] = mapped_column(
        String(255), nullable=False, default="pharma-distrib-india", index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    disruption: Mapped[Optional["Disruption"]] = relationship(  # noqa: F821
        "Disruption", back_populates="audit_logs"
    )
    decision: Mapped[Optional["Decision"]] = relationship(  # noqa: F821
        "Decision", back_populates="audit_logs"
    )

    def __repr__(self) -> str:
        return (
            f"<AuditLog id={self.id} action={self.action_type} "
            f"actor={self.actor} created={self.created_at}>"
        )
