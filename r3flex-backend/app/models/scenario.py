"""
Scenario ORM model.
Stores the 3 rerouting options generated per disruption.
Always exactly 3 rows per disruption (option_index 1, 2, 3).
"""
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Scenario(Base):
    """
    One of 3 rerouting options produced by ScenarioGenerator.

    Columns:
        id            : UUID primary key
        disruption_id : FK to Disruption
        option_index  : 1, 2, or 3 — identifies position in ranked list
        label         : Short name e.g. "Cape of Good Hope Route"
        description   : Full text explanation of the option
        cost_delta_usd: Extra cost vs. current route (USD). Positive = more expensive.
        time_delta_days: Extra transit days. Positive = slower.
        risk_score    : 1.0–10.0. Lower = safer.
        composite_score: Weighted tradeoff score (computed by TradeoffScorer)
        recommended   : True for the top-ranked option
        created_at    : UTC timestamp
    """

    __tablename__ = "scenarios"

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
    option_index: Mapped[int] = mapped_column(
        Integer, nullable=False
    )  # 1, 2, or 3
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    cost_delta_usd: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    time_delta_days: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    risk_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    composite_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    recommended: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    disruption: Mapped["Disruption"] = relationship(  # noqa: F821
        "Disruption", back_populates="scenarios"
    )
    decisions: Mapped[list["Decision"]] = relationship(  # noqa: F821
        "Decision",
        back_populates="scenario",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return (
            f"<Scenario id={self.id} option={self.option_index} "
            f"recommended={self.recommended} score={self.composite_score}>"
        )
