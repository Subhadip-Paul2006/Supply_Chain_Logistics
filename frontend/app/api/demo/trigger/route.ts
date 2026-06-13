import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import {
  getAuthenticatedUser,
  jsonError,
  serviceSupabase,
} from '@/lib/api-server'

// POST /api/demo/trigger
// Server-side equivalent of `triggerDemoDisruption()`. The original client
// function inserted directly into Supabase with the anon key, fabricating
// audit_logs entries with `actor: 'agent'`. Now:
//  - the caller is identified via their JWT (not the request body),
//  - audit logs are written by the **server** with a server-prefixed actor,
//  - the operation requires an authenticated user.
// (C-1, H-3, H-4 fixes.)

const BodySchema = z.object({
  // No body fields required. Adding fields would expand the surface.
  ticket: z.string().min(1).max(64).optional(),
})

const COMPANY_ID = 'pharma-distrib-india'

export async function POST(request: NextRequest) {
  let body: z.infer<typeof BodySchema> = {}
  try {
    const raw = await request.json().catch(() => ({}))
    body = BodySchema.parse(raw)
  } catch {
    return jsonError(400, 'bad_request', 'Invalid request body.')
  }

  const { user, error } = await getAuthenticatedUser()
  if (error || !user) {
    return jsonError(401, 'unauthenticated')
  }

  const now = new Date().toISOString()
  const supabase = serviceSupabase()

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
    return jsonError(500, 'internal')
  }

  const disruption = disruptionRows?.[0]
  if (!disruption) {
    return jsonError(500, 'internal')
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
    return jsonError(500, 'internal')
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
    return jsonError(500, 'internal')
  }

  const auditActor = `server:user:${user.email ?? user.id}`
  const auditLogs = [
    {
      disruption_id: disruption.id,
      decision_id: null,
      action_type: 'scenario_generated',
      reasoning: 'Generated three rerouting options from the detected Suez blockage.',
      signals_used: { news: true, weather: true, port: true },
      confidence_score: 0.74,
      actor: 'server:agent:demo',
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
      actor: 'server:agent:demo',
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
      actor: auditActor,
      company_id: COMPANY_ID,
      created_at: now,
    },
  ]

  const { error: auditError } = await supabase.from('audit_logs').insert(auditLogs)

  if (auditError) {
    return jsonError(500, 'internal')
  }

  // Echo only safe fields.
  return NextResponse.json({
    id: disruption.id,
    event_type: disruption.event_type,
    geography: disruption.geography,
    severity_score: disruption.severity_score,
    created_at: disruption.created_at,
    ticket: body.ticket ?? null,
  })
}
