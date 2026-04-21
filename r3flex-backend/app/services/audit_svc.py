"""
AuditService — writes append-only audit log entries.
Called by Executor BEFORE any action. Never called after.
"""
import logging
import uuid
from typing import Any, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog

logger = logging.getLogger(__name__)


class AuditService:
    """Static service methods — no instance needed."""

    @staticmethod
    async def log(
        action_type: str,
        actor: str,
        db: AsyncSession,
        disruption_id: Optional[uuid.UUID] = None,
        decision_id: Optional[uuid.UUID] = None,
        reasoning: Optional[str] = None,
        signals_used: Optional[dict[str, Any]] = None,
        confidence_score: Optional[float] = None,
        company_id: str = "pharma-distrib-india",
    ) -> AuditLog:
        """
        Write an immutable audit log entry.

        CRITICAL: This must be called BEFORE any execution action.
        Caller (Executor) guarantees this ordering.

        Args:
            action_type     : e.g. "auto_execute", "escalate_human", "human_approve"
            actor           : "agent" or "human:{approver_id}"
            db              : Async SQLAlchemy session
            disruption_id   : FK to Disruption
            decision_id     : FK to Decision
            reasoning       : Full reasoning text from LLM + confidence eval
            signals_used    : Which feeds contributed to decision
            confidence_score: Snapshot at time of action
            company_id      : Company identifier

        Returns:
            Created AuditLog ORM instance
        """
        entry = AuditLog(
            disruption_id=disruption_id,
            decision_id=decision_id,
            action_type=action_type,
            reasoning=reasoning,
            signals_used=signals_used,
            confidence_score=confidence_score,
            actor=actor,
            company_id=company_id,
        )
        db.add(entry)
        await db.flush()  # Flush to get ID without committing transaction

        logger.info(
            "AuditLog written: action=%s actor=%s disruption=%s",
            action_type, actor, disruption_id
        )
        return entry

    @staticmethod
    async def get_by_disruption(
        disruption_id: uuid.UUID,
        db: AsyncSession,
    ) -> list[AuditLog]:
        """
        Fetch all audit logs for a disruption, ordered by creation time.

        Args:
            disruption_id: Filter by this disruption UUID
            db           : Async SQLAlchemy session

        Returns:
            List of AuditLog entries, oldest first
        """
        from sqlalchemy import select, asc
        result = await db.execute(
            select(AuditLog)
            .where(AuditLog.disruption_id == disruption_id)
            .order_by(asc(AuditLog.created_at))
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_paginated(
        db: AsyncSession,
        disruption_id: Optional[uuid.UUID] = None,
        company_id: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[AuditLog], int]:
        """
        Paginated audit log retrieval with optional filters.

        Args:
            db            : Async SQLAlchemy session
            disruption_id : Optional filter
            company_id    : Optional filter
            page          : 1-indexed page number
            page_size     : Records per page

        Returns:
            (list of AuditLog, total count)
        """
        from sqlalchemy import select, func, desc

        query = select(AuditLog)
        count_query = select(func.count(AuditLog.id))

        if disruption_id:
            query = query.where(AuditLog.disruption_id == disruption_id)
            count_query = count_query.where(AuditLog.disruption_id == disruption_id)
        if company_id:
            query = query.where(AuditLog.company_id == company_id)
            count_query = count_query.where(AuditLog.company_id == company_id)

        query = query.order_by(desc(AuditLog.created_at))
        query = query.offset((page - 1) * page_size).limit(page_size)

        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        result = await db.execute(query)
        items = list(result.scalars().all())

        return items, total
