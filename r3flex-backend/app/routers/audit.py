"""
Audit router — read-only access to the audit log.
GET /audit           — paginated audit log
GET /audit/{id}      — single audit log entry with full reasoning
"""
import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogList, AuditLogRead
from app.services.audit_svc import AuditService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("", response_model=AuditLogList)
async def list_audit_logs(
    disruption_id: str | None = Query(
        default=None, description="Filter by disruption UUID"
    ),
    company_id: str | None = Query(
        default=None, description="Filter by company ID"
    ),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> AuditLogList:
    """
    Paginated audit log. Newest entries first.
    Supports filtering by disruption_id and company_id.

    Use this endpoint for compliance review — shows full decision chain
    for every disruption including reasoning and signals used.
    """
    disruption_uuid = None
    if disruption_id:
        try:
            disruption_uuid = uuid.UUID(disruption_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid disruption_id UUID.")

    items, total = await AuditService.get_paginated(
        db=db,
        disruption_id=disruption_uuid,
        company_id=company_id,
        page=page,
        page_size=page_size,
    )

    return AuditLogList(
        items=[AuditLogRead.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{audit_id}", response_model=AuditLogRead)
async def get_audit_log(
    audit_id: str,
    db: AsyncSession = Depends(get_db),
) -> AuditLogRead:
    """
    Get single audit log entry by ID.
    Includes full reasoning text from LLM and confidence breakdown.

    Path param:
        audit_id: UUID of the audit log entry
    """
    try:
        uid = uuid.UUID(audit_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format.")

    from sqlalchemy import select
    result = await db.execute(
        select(AuditLog).where(AuditLog.id == uid)
    )
    entry = result.scalar_one_or_none()

    if not entry:
        raise HTTPException(status_code=404, detail=f"Audit log {audit_id} not found.")

    return AuditLogRead.model_validate(entry)
