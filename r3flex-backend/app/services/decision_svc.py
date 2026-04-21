"""
DecisionService — human approval/rejection flow for below-threshold decisions.
"""
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.decision import Decision

logger = logging.getLogger(__name__)


class DecisionService:
    """Handles human-in-the-loop approval flow."""

    @staticmethod
    async def approve(
        decision_id: uuid.UUID,
        approver_id: str,
        notes: Optional[str],
        db: AsyncSession,
    ) -> Optional[Decision]:
        """
        Record human approval and execute the decision.
        Writes audit log and updates Decision status.

        Args:
            decision_id : UUID of Decision to approve
            approver_id : Human identifier (user ID, email, etc.)
            notes       : Optional approver notes
            db          : Async SQLAlchemy session

        Returns:
            Updated Decision or None if not found
        """
        result = await db.execute(
            select(Decision).where(Decision.id == decision_id)
        )
        decision = result.scalar_one_or_none()

        if not decision:
            logger.warning("Decision %s not found for approval.", decision_id)
            return None

        if decision.status != "pending":
            logger.warning(
                "Decision %s cannot be approved — status is '%s'.",
                decision_id, decision.status
            )
            return decision

        decision.human_approved = True
        decision.approver_id = approver_id
        decision.status = "approved"
        decision.auto_executed = False
        decision.executed_at = datetime.now(timezone.utc)
        decision.outcome = f"Human approved by {approver_id}. Notes: {notes or 'none'}"
        await db.flush()

        # Write audit log for human approval
        from app.services.audit_svc import AuditService
        await AuditService.log(
            action_type="human_approve",
            actor=f"human:{approver_id}",
            disruption_id=decision.disruption_id,
            decision_id=decision_id,
            reasoning=f"Human approved decision. Approver: {approver_id}. Notes: {notes or 'none'}",
            confidence_score=decision.confidence_score,
            db=db,
        )

        logger.info(
            "Decision %s approved by %s.", decision_id, approver_id
        )
        return decision

    @staticmethod
    async def reject(
        decision_id: uuid.UUID,
        approver_id: str,
        notes: Optional[str],
        db: AsyncSession,
    ) -> Optional[Decision]:
        """
        Record human rejection of a pending decision.

        Args:
            decision_id : UUID of Decision to reject
            approver_id : Human identifier
            notes       : Reason for rejection
            db          : Async SQLAlchemy session

        Returns:
            Updated Decision or None if not found
        """
        result = await db.execute(
            select(Decision).where(Decision.id == decision_id)
        )
        decision = result.scalar_one_or_none()

        if not decision:
            return None

        if decision.status != "pending":
            return decision

        decision.human_approved = False
        decision.approver_id = approver_id
        decision.status = "rejected"
        decision.outcome = f"Rejected by {approver_id}. Notes: {notes or 'none'}"
        await db.flush()

        from app.services.audit_svc import AuditService
        await AuditService.log(
            action_type="human_reject",
            actor=f"human:{approver_id}",
            disruption_id=decision.disruption_id,
            decision_id=decision_id,
            reasoning=f"Human rejected decision. Approver: {approver_id}. Notes: {notes or 'none'}",
            confidence_score=decision.confidence_score,
            db=db,
        )

        logger.info("Decision %s rejected by %s.", decision_id, approver_id)
        return decision

    @staticmethod
    async def get_pending(db: AsyncSession) -> list[Decision]:
        """Return all decisions pending human approval."""
        result = await db.execute(
            select(Decision).where(Decision.status == "pending")
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_paginated(
        db: AsyncSession,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Decision], int, int]:
        """
        Paginated decisions list.

        Returns:
            (decisions, total_count, pending_count)
        """
        total_result = await db.execute(select(func.count(Decision.id)))
        total = total_result.scalar() or 0

        pending_result = await db.execute(
            select(func.count(Decision.id)).where(Decision.status == "pending")
        )
        pending_count = pending_result.scalar() or 0

        from sqlalchemy import desc
        result = await db.execute(
            select(Decision)
            .order_by(desc(Decision.created_at))
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        return list(result.scalars().all()), total, pending_count
