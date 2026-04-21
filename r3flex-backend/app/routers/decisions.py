"""
Decisions router — human approval / rejection for below-threshold decisions.
GET  /decisions                  — paginated list with pending count
POST /decisions/{id}/approve     — human approves pending decision
POST /decisions/{id}/reject      — human rejects pending decision
"""
import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.decision import DecisionList, DecisionRead, HumanApprovalRequest
from app.services.decision_svc import DecisionService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("", response_model=DecisionList)
async def list_decisions(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> DecisionList:
    """
    Paginated decisions list.
    Includes pending_count — frontend uses this for approval badge.
    """
    decisions, total, pending_count = await DecisionService.get_paginated(
        db, page, page_size
    )
    return DecisionList(
        items=[DecisionRead.model_validate(d) for d in decisions],
        total=total,
        page=page,
        page_size=page_size,
        pending_count=pending_count,
    )


@router.post("/{decision_id}/approve", response_model=DecisionRead)
async def approve_decision(
    decision_id: str,
    payload: HumanApprovalRequest,
    db: AsyncSession = Depends(get_db),
) -> DecisionRead:
    """
    Approve a pending decision (below-threshold escalation).
    Called when human clicks "Approve" in the frontend approval modal.

    Path param:
        decision_id: UUID of the Decision to approve

    Request body:
        approver_id: Identifier of the approving human
        notes: Optional approval notes

    Returns:
        Updated Decision with status="approved"
    """
    try:
        uid = uuid.UUID(decision_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format.")

    decision = await DecisionService.approve(
        decision_id=uid,
        approver_id=payload.approver_id,
        notes=payload.notes,
        db=db,
    )

    if decision is None:
        raise HTTPException(
            status_code=404,
            detail=f"Decision {decision_id} not found."
        )

    if decision.status not in ("approved", "pending"):
        raise HTTPException(
            status_code=409,
            detail=f"Decision cannot be approved — current status: {decision.status}"
        )

    logger.info("Decision %s approved by %s", decision_id, payload.approver_id)
    return DecisionRead.model_validate(decision)


@router.post("/{decision_id}/reject", response_model=DecisionRead)
async def reject_decision(
    decision_id: str,
    payload: HumanApprovalRequest,
    db: AsyncSession = Depends(get_db),
) -> DecisionRead:
    """
    Reject a pending decision.
    Called when human clicks "Reject" in the approval modal.

    Path param:
        decision_id: UUID of the Decision to reject

    Request body:
        approver_id: Identifier of the rejecting human
        notes: Reason for rejection (encouraged for audit trail)
    """
    try:
        uid = uuid.UUID(decision_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format.")

    decision = await DecisionService.reject(
        decision_id=uid,
        approver_id=payload.approver_id,
        notes=payload.notes,
        db=db,
    )

    if decision is None:
        raise HTTPException(
            status_code=404,
            detail=f"Decision {decision_id} not found."
        )

    logger.info("Decision %s rejected by %s", decision_id, payload.approver_id)
    return DecisionRead.model_validate(decision)
