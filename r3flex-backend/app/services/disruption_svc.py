"""
DisruptionService — orchestrates the full signal→decision pipeline.
Called by scheduler (automated) and POST /disruptions/trigger (manual).
"""
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.orchestrator import AgentState, run_pipeline
from app.config import get_settings
from app.engine.confidence import ConfidenceEvaluator
from app.engine.executor import Executor
from app.engine.scenario_gen import ScenarioGenerator
from app.engine.tradeoff import TradeoffScorer
from app.models.decision import Decision
from app.models.disruption import Disruption
from app.models.scenario import Scenario

logger = logging.getLogger(__name__)
settings = get_settings()


class DisruptionService:
    """
    Full pipeline: signal → agents → scenarios → confidence → execute/escalate.
    All DB writes happen inside a single transaction (get_db() commits on exit).
    """

    @staticmethod
    async def process_signal(
        signal: dict,
        db: AsyncSession,
        company_id: str = "pharma-distrib-india",
    ) -> Optional[Disruption]:
        """
        Process a raw signal through the full agent + decision pipeline.

        Args:
            signal    : Normalized signal dict (from news_feed/weather_feed/mock_port_data)
            db        : Async SQLAlchemy session
            company_id: Company identifier

        Returns:
            Created Disruption ORM object, or None if processing failed.
        """
        raw_text = signal.get("text", signal.get("title", ""))
        if not raw_text:
            logger.warning("Signal has no text content. Skipping.")
            return None

        logger.info(
            "Processing signal: source=%s severity=%.1f",
            signal.get("source"), signal.get("severity", 0)
        )

        # ── Step 1: Create Disruption record in DB ─────────────────────────────
        disruption = Disruption(
            status="processing",
            raw_signal=raw_text,
        )
        db.add(disruption)
        await db.flush()  # Get disruption.id
        disruption_id = disruption.id
        logger.info("Disruption created: id=%s", disruption_id)

        # ── Step 2: Run agent pipeline ─────────────────────────────────────────
        agent_state: AgentState = await run_pipeline(
            raw_signal=raw_text,
            source=signal.get("source", "unknown"),
            company_id=company_id,
        )

        if agent_state.get("pipeline_error"):
            disruption.status = "error"
            logger.error(
                "Pipeline error for disruption %s: %s",
                disruption_id, agent_state["pipeline_error"]
            )
            await db.flush()
            return disruption

        # ── Step 3: Update Disruption with agent results ───────────────────────
        disruption.event_type = agent_state.get("event_type")
        disruption.geography = agent_state.get("geography")
        disruption.severity_score = agent_state.get("severity_score")
        disruption.affected_nodes = agent_state.get("affected_nodes", [])
        disruption.cascade_nodes = agent_state.get("cascade_nodes", [])
        await db.flush()

        # ── Step 4: Generate 3 scenarios ──────────────────────────────────────
        scenario_gen = ScenarioGenerator()
        raw_scenarios = await scenario_gen.generate(agent_state)

        # ── Step 5: Score tradeoffs ────────────────────────────────────────────
        scorer = TradeoffScorer()
        scored_scenarios = scorer.score(raw_scenarios)

        # ── Step 6: Save scenarios to DB ──────────────────────────────────────
        scenario_records: list[Scenario] = []
        for scored in scored_scenarios:
            opt = scored.option
            rec = Scenario(
                disruption_id=disruption_id,
                option_index=opt.option_index,
                label=opt.label,
                description=opt.description,
                cost_delta_usd=opt.cost_delta_usd,
                time_delta_days=opt.time_delta_days,
                risk_score=opt.risk_score,
                composite_score=scored.composite_score,
                recommended=scored.recommended,
            )
            db.add(rec)
            scenario_records.append(rec)
        await db.flush()

        # ── Step 7: Evaluate confidence ────────────────────────────────────────
        recommended_scored = next(s for s in scored_scenarios if s.recommended)
        evaluator = ConfidenceEvaluator()
        confidence_result = evaluator.evaluate(
            recommended=recommended_scored,
            all_scenarios=scored_scenarios,
            agent_state=agent_state,
        )

        # ── Step 8: Create Decision record ────────────────────────────────────
        recommended_record = next(r for r in scenario_records if r.recommended)
        decision = Decision(
            disruption_id=disruption_id,
            scenario_id=recommended_record.id,
            confidence_score=confidence_result.confidence,
            status="pending",
        )
        db.add(decision)
        await db.flush()
        decision_id = decision.id

        # ── Step 9: Execute or escalate ───────────────────────────────────────
        executor = Executor()
        exec_result = await executor.execute(
            disruption_id=disruption_id,
            decision_id=decision_id,
            confidence_result=confidence_result,
            recommended_scenario=recommended_scored,
            agent_state=agent_state,
            db=db,
            company_id=company_id,
        )

        # ── Step 10: Update Disruption status ─────────────────────────────────
        disruption.status = (
            "resolved" if exec_result.auto_executed else "escalated"
        )
        disruption.updated_at = datetime.now(timezone.utc)
        await db.flush()

        logger.info(
            "Disruption %s complete: status=%s confidence=%.2f",
            disruption_id, disruption.status, confidence_result.confidence
        )

        return disruption

    @staticmethod
    async def get_by_id(
        disruption_id: uuid.UUID, db: AsyncSession
    ) -> Optional[Disruption]:
        """Fetch single disruption by ID with scenarios eager-loaded."""
        from sqlalchemy import select
        result = await db.execute(
            select(Disruption).where(Disruption.id == disruption_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_paginated(
        db: AsyncSession,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Disruption], int]:
        """Paginated list of disruptions, newest first."""
        from sqlalchemy import select, func, desc
        count_result = await db.execute(select(func.count(Disruption.id)))
        total = count_result.scalar() or 0

        result = await db.execute(
            select(Disruption)
            .order_by(desc(Disruption.created_at))
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        return list(result.scalars().all()), total
