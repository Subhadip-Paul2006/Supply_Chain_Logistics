import { createSupabaseBrowserClient } from '@/lib/supabase'

const COMPANY_ID = 'pharma-distrib-india'

type SupabaseRow = Record<string, any>

function getIsoNow() {
  return new Date().toISOString()
}

function mapScenario(row: SupabaseRow) {
  return {
    ...row,
    name: row.label,
    estimated_cost_usd: row.cost_delta_usd ?? null,
    estimated_delay_days: row.time_delta_days ?? null,
    success_confidence:
      typeof row.composite_score === 'number'
        ? Math.max(0.1, Math.min(0.99, 1 - row.composite_score / 10))
        : row.recommended
          ? 0.91
          : 0.72,
  }
}

export async function fetchDisruptions() {
  const supabase = createSupabaseBrowserClient()
  const { data, error, count } = await supabase
    .from('disruptions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    throw new Error(error.message)
  }

  return {
    items: data ?? [],
    total: count ?? data?.length ?? 0,
    page: 1,
    page_size: 20,
  }
}

export async function fetchPendingDecisions() {
  const supabase = createSupabaseBrowserClient()
  const { data: decisionRows, error, count } = await supabase
    .from('decisions')
    .select('*', { count: 'exact' })
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    throw new Error(error.message)
  }

  const disruptionIds = Array.from(
    new Set((decisionRows ?? []).map((row) => row.disruption_id).filter(Boolean)),
  )

  let scenariosByDisruption = new Map<string, SupabaseRow[]>()

  if (disruptionIds.length > 0) {
    const { data: scenarioRows, error: scenarioError } = await supabase
      .from('scenarios')
      .select('*')
      .in('disruption_id', disruptionIds)
      .order('option_index', { ascending: true })

    if (scenarioError) {
      throw new Error(scenarioError.message)
    }

    scenariosByDisruption = new Map()
    for (const scenario of scenarioRows ?? []) {
      const disruptionId = String(scenario.disruption_id)
      const existing = scenariosByDisruption.get(disruptionId) ?? []
      existing.push(mapScenario(scenario))
      scenariosByDisruption.set(disruptionId, existing)
    }
  }

  const items = (decisionRows ?? []).map((decision) => ({
    ...decision,
    scenarios: scenariosByDisruption.get(String(decision.disruption_id)) ?? [],
  }))

  return {
    items,
    total: count ?? items.length,
    page: 1,
    page_size: 20,
    pending_count: items.length,
  }
}

export async function triggerDemoDisruption() {
  const supabase = createSupabaseBrowserClient()
  const now = getIsoNow()

  const disruptionPayload = {
    event_type: 'trade_route_disruption',
    geography: 'Suez Canal, Egypt',
    severity_score: 9.1,
    raw_signal:
      'Live port intelligence reports a Suez Canal closure with second-order rerouting pressure across the Europe lane.',
    affected_nodes: ['chennai-mfg', 'suez-hub', 'frankfurt-dc'],
    cascade_nodes: ['med-gateway', 'eu-distribution'],
    status: 'detected',
    created_at: now,
    updated_at: now,
  }

  const { data: disruptionRows, error: disruptionError } = await supabase
    .from('disruptions')
    .insert(disruptionPayload)
    .select('*')

  if (disruptionError) {
    throw new Error(disruptionError.message)
  }

  const disruption = disruptionRows?.[0]
  if (!disruption) {
    throw new Error('Demo disruption insert returned no rows.')
  }

  const scenarioPayloads = [
    {
      disruption_id: disruption.id,
      option_index: 1,
      label: 'Cape of Good Hope reroute',
      description: 'Divert vessels around the Cape to avoid the Suez choke point.',
      cost_delta_usd: 28000,
      time_delta_days: 12,
      risk_score: 2.4,
      composite_score: 1.8,
      recommended: true,
      created_at: now,
    },
    {
      disruption_id: disruption.id,
      option_index: 2,
      label: 'Air freight bridge',
      description: 'Move the most urgent pharmaceutical lane by air while preserving inventory.',
      cost_delta_usd: 85000,
      time_delta_days: 3,
      risk_score: 3.8,
      composite_score: 3.9,
      recommended: false,
      created_at: now,
    },
    {
      disruption_id: disruption.id,
      option_index: 3,
      label: 'Hold and monitor',
      description: 'Pause execution and wait for new port intelligence before rerouting.',
      cost_delta_usd: 12000,
      time_delta_days: 6,
      risk_score: 6.4,
      composite_score: 5.2,
      recommended: false,
      created_at: now,
    },
  ]

  const { data: scenarioRows, error: scenarioError } = await supabase
    .from('scenarios')
    .insert(scenarioPayloads)
    .select('*')

  if (scenarioError) {
    throw new Error(scenarioError.message)
  }

  const recommendedScenario = (scenarioRows ?? []).find((row) => row.recommended)

  const { error: decisionError } = await supabase.from('decisions').insert({
    disruption_id: disruption.id,
    scenario_id: recommendedScenario?.id ?? scenarioRows?.[0]?.id ?? null,
    confidence_score: 0.74,
    auto_executed: false,
    human_approved: null,
    approver_id: null,
    status: 'pending',
    outcome: 'Awaiting human approval in the war room.',
    executed_at: null,
    created_at: now,
  })

  if (decisionError) {
    throw new Error(decisionError.message)
  }

  const auditLogs = [
    {
      disruption_id: disruption.id,
      decision_id: null,
      action_type: 'scenario_generated',
      reasoning: 'Generated three rerouting options from the detected Suez blockage.',
      signals_used: { news: true, weather: true, port: true },
      confidence_score: 0.74,
      actor: 'agent',
      company_id: COMPANY_ID,
      created_at: now,
    },
    {
      disruption_id: disruption.id,
      decision_id: null,
      action_type: 'cascade_simulated',
      reasoning: 'Modeled second-order impact across the Europe distribution network.',
      signals_used: { news: true, weather: true, port: true },
      confidence_score: 0.74,
      actor: 'agent',
      company_id: COMPANY_ID,
      created_at: now,
    },
    {
      disruption_id: disruption.id,
      decision_id: null,
      action_type: 'escalate_human',
      reasoning: 'Confidence fell below the 85% threshold, so a manual approval step was queued.',
      signals_used: { news: true, weather: true, port: true },
      confidence_score: 0.74,
      actor: 'agent',
      company_id: COMPANY_ID,
      created_at: now,
    },
  ]

  const { error: auditError } = await supabase.from('audit_logs').insert(auditLogs)

  if (auditError) {
    throw new Error(auditError.message)
  }

  return disruption
}

async function recordDecisionAction(
  decisionId: string,
  approverId: string,
  actionType: 'human_approve' | 'human_reject',
  status: 'approved' | 'rejected',
) {
  const supabase = createSupabaseBrowserClient()
  const now = getIsoNow()

  const { data: decisionRows, error: decisionFetchError } = await supabase
    .from('decisions')
    .select('id, disruption_id')
    .eq('id', decisionId)
    .limit(1)

  if (decisionFetchError) {
    throw new Error(decisionFetchError.message)
  }

  const decision = decisionRows?.[0]
  if (!decision) {
    throw new Error('Decision not found.')
  }

  const updatePayload =
    status === 'approved'
      ? {
          status: 'approved',
          human_approved: true,
          approver_id: approverId,
          outcome: 'Approved by human operator in Supabase-backed workflow.',
          executed_at: now,
        }
      : {
          status: 'rejected',
          human_approved: false,
          approver_id: approverId,
          outcome: 'Rejected by human operator in Supabase-backed workflow.',
          executed_at: now,
        }

  const { error: updateError } = await supabase
    .from('decisions')
    .update(updatePayload)
    .eq('id', decisionId)

  if (updateError) {
    throw new Error(updateError.message)
  }

  const { error: auditError } = await supabase.from('audit_logs').insert({
    disruption_id: decision.disruption_id,
    decision_id: decisionId,
    action_type: actionType,
    reasoning:
      status === 'approved'
        ? 'Human approved the recommended reroute from the dashboard.'
        : 'Human rejected the recommended reroute from the dashboard.',
    signals_used: { news: true, weather: true, port: true },
    confidence_score: 0.74,
    actor: `human:${approverId}`,
    company_id: COMPANY_ID,
    created_at: now,
  })

  if (auditError) {
    throw new Error(auditError.message)
  }

  return {
    id: decisionId,
    ...updatePayload,
  }
}

export async function approveDecision(decisionId: string, approverId: string = 'demo-user') {
  return recordDecisionAction(decisionId, approverId, 'human_approve', 'approved')
}

export async function rejectDecision(decisionId: string, approverId: string = 'demo-user') {
  return recordDecisionAction(decisionId, approverId, 'human_reject', 'rejected')
}
