"""
Decision ORM model.
Records which scenario was chosen and how — autonomous or human-approved.
One decision per disruption (the final acted-upon choice).
"""
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Decision(Base):
    """
    The definitive record of what was decided for a disruption.

    Two execution paths:
        auto_executed=True  → confidence was ≥ threshold; agent acted immediately
        auto_executed=False → confidence was < threshold; awaiting human_approved

    Columns:
        id              : UUID primary key
        disruption_id   : FK to Disruption
        scenario_id     : FK to chosen Scenario
        confidence_score: Float 0.0–1.0 from ConfidenceEvaluator
        auto_executed   : True if agent acted without human approval
        human_approved  : True once human clicks "Approve" (null if auto-executed)
        approver_id     : Identifier of approving human (null if auto-executed)
        status          : "pending" | "approved" | "rejected" | "executed"
        outcome         : Post-execution notes (what actually happened)
        executed_at     : UTC timestamp of execution (null until executed)
        created_at      : UTC timestamp of decision creation
    """

    __tablename__ = "decisions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    disruption_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("disruptions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    scenario_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("scenarios.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    auto_executed: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    human_approved: Mapped[Optional[bool]] = mapped_column(
        Boolean, nullable=True, default=None
    )
    approver_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="pending", index=True
    )
    outcome: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    executed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    disruption: Mapped["Disruption"] = relationship(  # noqa: F821
        "Disruption", back_populates="decisions"
    )
    scenario: Mapped[Optional["Scenario"]] = relationship(  # noqa: F821
        "Scenario", back_populates="decisions"
    )
    audit_logs: Mapped[list["AuditLog"]] = relationship(  # noqa: F821
        "AuditLog",
        back_populates="decision",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return (
            f"<Decision id={self.id} confidence={self.confidence_score} "
            f"auto={self.auto_executed} status={self.status}>"
        )
