"""
Disruptions router — REST endpoints for disruption events.
POST /disruptions/demo       — trigger hardcoded Suez demo (hackathon showcase)
POST /disruptions/trigger    — trigger custom signal analysis
GET  /disruptions            — paginated list
GET  /disruptions/{id}       — single disruption with scenarios
"""
import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.disruption import DisruptionCreate, DisruptionList, DisruptionRead, DisruptionSummary
from app.services.disruption_svc import DisruptionService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/demo", response_model=DisruptionRead, status_code=201)
async def trigger_demo_disruption(
    db: AsyncSession = Depends(get_db),
) -> DisruptionRead:
    """
    Trigger the hardcoded Suez Canal demo scenario.

    This is the primary hackathon demo endpoint. No request body needed.
    Expected output:
        - event_type: trade_route_disruption
        - geography: Suez Canal, Egypt
        - severity_score: 9.1
        - 3 scenarios generated
        - confidence: ~91% → auto-executes (above 85% threshold)
        - audit log entry written

    Returns the created Disruption with nested scenarios.
    """
    from app.ingestion.mock_port_data import get_demo_suez_signal
    signal = get_demo_suez_signal()

    logger.info("Demo disruption triggered via POST /disruptions/demo")

    disruption = await DisruptionService.process_signal(
        signal=signal, db=db
    )

    if disruption is None:
        raise HTTPException(status_code=500, detail="Demo scenario processing failed.")

    # Refresh to load relationships
    await db.refresh(disruption)
    return DisruptionRead.model_validate(disruption)


@router.post("/trigger", response_model=DisruptionRead, status_code=201)
async def trigger_custom_disruption(
    payload: DisruptionCreate,
    db: AsyncSession = Depends(get_db),
) -> DisruptionRead:
    """
    Trigger analysis of a custom raw signal.

    Runs the full agent pipeline:
    Classifier → Severity → Graph Mapper → Cascade → Scenario Gen → Confidence → Execute/Escalate

    Request body:
        raw_signal: Text to analyze (min 10 chars)
        source: "news" | "weather" | "port" | "manual" (default)
        company_id: Company identifier (default: "pharma-distrib-india")
    """
    signal = {
        "text": payload.raw_signal,
        "source": payload.source or "manual",
        "severity": 5.0,  # Placeholder — SeverityAgent will compute real score
    }

    logger.info(
        "Custom disruption triggered: source=%s signal_len=%d",
        payload.source, len(payload.raw_signal)
    )

    disruption = await DisruptionService.process_signal(
        signal=signal,
        db=db,
        company_id=payload.company_id or "pharma-distrib-india",
    )

    if disruption is None:
        raise HTTPException(status_code=500, detail="Signal processing failed.")

    await db.refresh(disruption)
    return DisruptionRead.model_validate(disruption)


@router.get("", response_model=DisruptionList)
async def list_disruptions(
    page: int = Query(default=1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(default=20, ge=1, le=100, description="Records per page"),
    db: AsyncSession = Depends(get_db),
) -> DisruptionList:
    """
    Paginated list of all disruptions, newest first.
    Returns summary format (no nested scenarios) for efficiency.
    """
    disruptions, total = await DisruptionService.get_paginated(db, page, page_size)
    return DisruptionList(
        items=[DisruptionSummary.model_validate(d) for d in disruptions],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{disruption_id}", response_model=DisruptionRead)
async def get_disruption(
    disruption_id: str,
    db: AsyncSession = Depends(get_db),
) -> DisruptionRead:
    """
    Get single disruption by ID with full details including nested scenarios.

    Path param:
        disruption_id: UUID string of the disruption
    """
    import uuid
    try:
        uid = uuid.UUID(disruption_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format.")

    disruption = await DisruptionService.get_by_id(uid, db)
    if not disruption:
        raise HTTPException(status_code=404, detail=f"Disruption {disruption_id} not found.")

    return DisruptionRead.model_validate(disruption)
