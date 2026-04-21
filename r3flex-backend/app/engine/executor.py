"""
Executor — executes autonomous decisions or escalates to human via Redis pub/sub.
CRITICAL: AuditService.log() MUST be called BEFORE Executor.execute().
This ordering is a core business rule — never change it.
"""
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.engine.confidence import ConfidenceResult
from app.engine.tradeoff import ScoredScenario
from app.agents.orchestrator import AgentState

logger = logging.getLogger(__name__)
settings = get_settings()


class ExecutionResult:
    """Result from Executor.execute()."""

    def __init__(
        self,
        auto_executed: bool,
        status: str,
        message: str,
        mock_erp_log: Optional[str] = None,
        supplier_email_draft: Optional[str] = None,
    ) -> None:
        self.auto_executed = auto_executed
        self.status = status          # "executed" | "pending_approval"
        self.message = message
        self.mock_erp_log = mock_erp_log
        self.supplier_email_draft = supplier_email_draft

    def to_dict(self) -> dict:
        return {
            "auto_executed": self.auto_executed,
            "status": self.status,
            "message": self.message,
            "mock_erp_log": self.mock_erp_log,
            "supplier_email_draft": self.supplier_email_draft,
        }


class Executor:
    """
    Executes or escalates a decision based on confidence score.

    Execution paths:
        confidence >= threshold → auto_execute()
            1. Write audit log  ← ALWAYS FIRST
            2. Generate mock ERP update
            3. Draft supplier notification email
            4. Mark decision as executed

        confidence < threshold → escalate_to_human()
            1. Write audit log  ← ALWAYS FIRST
            2. Publish pending decision to Redis pub/sub
            3. Frontend WebSocket receives it → shows approval modal
    """

    async def execute(
        self,
        disruption_id: uuid.UUID,
        decision_id: uuid.UUID,
        confidence_result: ConfidenceResult,
        recommended_scenario: ScoredScenario,
        agent_state: AgentState,
        db: AsyncSession,
        company_id: str = "pharma-distrib-india",
    ) -> ExecutionResult:
        """
        Route decision to auto-execute or human escalation based on confidence.

        IMPORTANT: Audit log is written inside this method BEFORE any action.
        Callers must NOT write audit logs separately.

        Args:
            disruption_id       : UUID of the Disruption record
            decision_id         : UUID of the Decision record
            confidence_result   : From ConfidenceEvaluator
            recommended_scenario: Top-ranked scenario from TradeoffScorer
            agent_state         : Full pipeline state (for audit reasoning)
            db                  : Async SQLAlchemy session
            company_id          : Company identifier for Redis channel

        Returns:
            ExecutionResult with status and execution details
        """
        if confidence_result.above_threshold:
            return await self._auto_execute(
                disruption_id=disruption_id,
                decision_id=decision_id,
                confidence_result=confidence_result,
                recommended_scenario=recommended_scenario,
                agent_state=agent_state,
                db=db,
            )
        else:
            return await self._escalate_to_human(
                disruption_id=disruption_id,
                decision_id=decision_id,
                confidence_result=confidence_result,
                recommended_scenario=recommended_scenario,
                agent_state=agent_state,
                db=db,
                company_id=company_id,
            )

    async def _auto_execute(
        self,
        disruption_id: uuid.UUID,
        decision_id: uuid.UUID,
        confidence_result: ConfidenceResult,
        recommended_scenario: ScoredScenario,
        agent_state: AgentState,
        db: AsyncSession,
    ) -> ExecutionResult:
        """
        Auto-execute path: confidence >= threshold.
        Step 1 (MANDATORY): Write audit log.
        Step 2: Generate mock ERP log entry.
        Step 3: Draft supplier email.
        Step 4: Update Decision status.
        """
        logger.info(
            "AUTO-EXECUTE: disruption=%s decision=%s confidence=%.2f",
            disruption_id, decision_id, confidence_result.confidence
        )

        option = recommended_scenario.option

        # ── Step 1: Write audit log FIRST ─────────────────────────────────────
        from app.services.audit_svc import AuditService
        await AuditService.log(
            action_type="auto_execute",
            disruption_id=disruption_id,
            decision_id=decision_id,
            reasoning=(
                f"{confidence_result.reasoning}\n\n"
                f"Executing: {option.label}\n"
                f"Cost delta: ${option.cost_delta_usd:,.0f} | "
                f"Time delta: +{option.time_delta_days:.0f} days | "
                f"Risk score: {option.risk_score:.1f}/10"
            ),
            signals_used={
                "news": agent_state.get("source") == "news",
                "weather": agent_state.get("source") == "weather",
                "port": agent_state.get("source") in ("port_mock", "port"),
            },
            confidence_score=confidence_result.confidence,
            actor="agent",
            db=db,
        )
        logger.info("Audit log written for auto-execution.")

        # ── Step 2: Mock ERP log entry ─────────────────────────────────────────
        erp_log = self._generate_erp_log(option, agent_state, disruption_id)

        # ── Step 3: Supplier notification email draft ──────────────────────────
        email_draft = self._draft_supplier_email(option, agent_state)

        # ── Step 4: Update Decision record ────────────────────────────────────
        from app.models.decision import Decision
        from sqlalchemy import select
        result = await db.execute(
            select(Decision).where(Decision.id == decision_id)
        )
        decision = result.scalar_one_or_none()
        if decision:
            decision.status = "executed"
            decision.auto_executed = True
            decision.executed_at = datetime.now(timezone.utc)
            decision.outcome = f"Auto-executed: {option.label}"
            await db.flush()

        logger.info(
            "Auto-execution complete: '%s' | $%.0f | +%.0fd",
            option.label, option.cost_delta_usd, option.time_delta_days
        )

        return ExecutionResult(
            auto_executed=True,
            status="executed",
            message=(
                f"Autonomously executed: {option.label}. "
                f"Confidence was {confidence_result.confidence:.0%} "
                f"(threshold {confidence_result.threshold_used:.0%}). "
                f"Full reasoning saved to audit log."
            ),
            mock_erp_log=erp_log,
            supplier_email_draft=email_draft,
        )

    async def _escalate_to_human(
        self,
        disruption_id: uuid.UUID,
        decision_id: uuid.UUID,
        confidence_result: ConfidenceResult,
        recommended_scenario: ScoredScenario,
        agent_state: AgentState,
        db: AsyncSession,
        company_id: str,
    ) -> ExecutionResult:
        """
        Human escalation path: confidence < threshold.
        Step 1 (MANDATORY): Write audit log.
        Step 2: Publish to Redis for WebSocket delivery to frontend.
        """
        logger.info(
            "ESCALATING TO HUMAN: disruption=%s confidence=%.2f (threshold=%.2f)",
            disruption_id, confidence_result.confidence, confidence_result.threshold_used
        )

        # ── Step 1: Write audit log FIRST ─────────────────────────────────────
        from app.services.audit_svc import AuditService
        await AuditService.log(
            action_type="escalate_human",
            disruption_id=disruption_id,
            decision_id=decision_id,
            reasoning=confidence_result.reasoning,
            signals_used={
                "news": agent_state.get("source") == "news",
                "weather": agent_state.get("source") == "weather",
                "port": agent_state.get("source") in ("port_mock", "port"),
            },
            confidence_score=confidence_result.confidence,
            actor="agent",
            db=db,
        )
        logger.info("Audit log written for escalation.")

        # ── Step 2: Publish to Redis → WebSocket ──────────────────────────────
        channel = f"disruptions:{company_id}"
        payload = {
            "event": "approval_required",
            "disruption_id": str(disruption_id),
            "decision_id": str(decision_id),
            "confidence": confidence_result.confidence,
            "threshold": confidence_result.threshold_used,
            "confidence_breakdown": confidence_result.breakdown,
            "recommended_scenario": {
                "option_index": recommended_scenario.option.option_index,
                "label": recommended_scenario.option.label,
                "description": recommended_scenario.option.description,
                "cost_delta_usd": recommended_scenario.option.cost_delta_usd,
                "time_delta_days": recommended_scenario.option.time_delta_days,
                "risk_score": recommended_scenario.option.risk_score,
            },
            "risk_summary": agent_state.get("risk_summary", ""),
            "severity_score": agent_state.get("severity_score", 0),
            "geography": agent_state.get("geography", ""),
        }

        try:
            from app.redis_client import publish
            await publish(channel, payload)
            logger.info("Published approval_required to Redis channel '%s'.", channel)
        except Exception as exc:
            logger.error("Redis publish failed: %s. Decision still escalated.", exc)

        return ExecutionResult(
            auto_executed=False,
            status="pending_approval",
            message=(
                f"Confidence {confidence_result.confidence:.0%} below threshold "
                f"{confidence_result.threshold_used:.0%}. "
                "Escalated to human approval. Check WebSocket or /decisions endpoint."
            ),
        )

    def _generate_erp_log(
        self,
        option,
        agent_state: AgentState,
        disruption_id: uuid.UUID,
    ) -> str:
        """Generate mock ERP system log entry string."""
        timestamp = datetime.now(timezone.utc).isoformat()
        return (
            f"[ERP UPDATE | {timestamp}]\n"
            f"Disruption ID: {disruption_id}\n"
            f"Action: {option.label}\n"
            f"Trigger: {agent_state.get('event_type')} at {agent_state.get('geography')}\n"
            f"Severity: {agent_state.get('severity_score')}/10\n"
            f"Affected shipments: {', '.join(agent_state.get('affected_shipment_ids', []))}\n"
            f"Cost delta: +${option.cost_delta_usd:,.0f}\n"
            f"ETA delta: +{option.time_delta_days:.0f} days\n"
            f"Status: EXECUTED_BY_AGENT\n"
            f"Next ERP sync: PENDING_CONFIRMATION"
        )

    def _draft_supplier_email(self, option, agent_state: AgentState) -> str:
        """Draft supplier notification email text."""
        is_berlin = "berlin" in option.label.lower() or "backup" in option.label.lower()

        if is_berlin:
            recipient = "operations@berlin-pharma.de"
            subject = "URGENT: Backup Supply Activation Request — PharmaDistrib India"
            body = (
                f"Dear Berlin Pharma GmbH Operations Team,\n\n"
                f"Due to a critical supply chain disruption ({agent_state.get('event_type')} at "
                f"{agent_state.get('geography')}, severity {agent_state.get('severity_score')}/10), "
                f"we are activating your facility as our primary EU backup supplier "
                f"effective immediately.\n\n"
                f"Required action: Begin fulfilment of Frankfurt warehouse replenishment "
                f"orders within 72 hours. Our procurement team will share the exact "
                f"purchase orders within 2 hours.\n\n"
                f"This is an automated notification from the R3flex AI system. "
                f"A human account manager will follow up within 1 hour.\n\n"
                f"Reference: Disruption ID {agent_state.get('source', 'auto')}-"
                f"{datetime.now(timezone.utc).strftime('%Y%m%d%H%M')}\n\n"
                f"Best regards,\nR3flex Automated Operations\nPharmaDistrib India Pvt Ltd"
            )
        else:
            recipient = "logistics@carrier.example.com"
            subject = f"URGENT: Rerouting Request — {option.label}"
            body = (
                f"Due to supply chain disruption at {agent_state.get('geography')}, "
                f"we are implementing: {option.label}.\n\n"
                f"Please acknowledge receipt and confirm implementation timeline. "
                f"Affected shipments: {', '.join(agent_state.get('affected_shipment_ids', []))}."
            )

        return f"TO: {recipient}\nSUBJECT: {subject}\n\n{body}"
