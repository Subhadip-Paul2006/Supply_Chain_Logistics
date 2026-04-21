"""
Disruption ORM model.
Represents a detected supply chain disruption event.
One disruption → many scenarios + one decision.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, Float, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Disruption(Base):
    """
    Stores every detected disruption event.

    Lifecycle:
        detected → classified → scored → graph_mapped → cascaded → resolved/escalated

    Columns:
        id            : UUID primary key
        event_type    : Classifier output e.g. "trade_route_disruption", "weather_event"
        geography     : Affected region e.g. "Suez Canal, Egypt"
        severity_score: 1.0–10.0 from SeverityAgent
        raw_signal    : Original text from news/weather/port feed
        affected_nodes: JSON list of supplier graph node IDs impacted
        cascade_nodes : JSON list of second-order affected nodes (2+ hops)
        status        : "detected" | "processing" | "resolved" | "escalated"
        created_at    : UTC timestamp of detection
        updated_at    : UTC timestamp of last status change
    """

    __tablename__ = "disruptions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    event_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    geography: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    severity_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    raw_signal: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    affected_nodes: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    cascade_nodes: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="detected", index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    scenarios: Mapped[list["Scenario"]] = relationship(  # noqa: F821
        "Scenario",
        back_populates="disruption",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    decisions: Mapped[list["Decision"]] = relationship(  # noqa: F821
        "Decision",
        back_populates="disruption",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    audit_logs: Mapped[list["AuditLog"]] = relationship(  # noqa: F821
        "AuditLog",
        back_populates="disruption",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return (
            f"<Disruption id={self.id} type={self.event_type} "
            f"severity={self.severity_score} status={self.status}>"
        )
