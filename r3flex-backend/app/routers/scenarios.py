"""
Scenarios router — read-only access to rerouting options.
GET /disruptions/{id}/scenarios — list 3 options for a disruption
"""
import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.scenario import Scenario
from app.schemas.scenario import ScenarioList, ScenarioRead

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/disruptions/{disruption_id}/scenarios", response_model=ScenarioList)
async def list_scenarios(
    disruption_id: str,
    db: AsyncSession = Depends(get_db),
) -> ScenarioList:
    """
    Get all 3 rerouting scenarios for a disruption.
    Scenarios are created by the agent pipeline — this endpoint is read-only.

    Path param:
        disruption_id: UUID of the disruption

    Returns:
        ScenarioList with disruption_id, 3 scenarios, and recommended_index.
    """
    try:
        uid = uuid.UUID(disruption_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format.")

    result = await db.execute(
        select(Scenario)
        .where(Scenario.disruption_id == uid)
        .order_by(Scenario.option_index)
    )
    scenarios = list(result.scalars().all())

    if not scenarios:
        raise HTTPException(
            status_code=404,
            detail=f"No scenarios found for disruption {disruption_id}. "
                   "Scenarios are generated after processing — check disruption status."
        )

    recommended_index = next(
        (s.option_index for s in scenarios if s.recommended), None
    )

    return ScenarioList(
        disruption_id=uid,
        scenarios=[ScenarioRead.model_validate(s) for s in scenarios],
        recommended_index=recommended_index,
    )
