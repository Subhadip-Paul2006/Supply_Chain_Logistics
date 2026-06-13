import { createSupabaseBrowserClient } from '@/lib/supabase'

// ─── Security model ────────────────────────────────────────────────────────
// Reads (fetchDisruptions, fetchPendingDecisions) still use the anon key —
// RLS grants SELECT to anon/authenticated on the relevant tables, and these
// are read-only queries.
//
// Writes (triggerDemoDisruption, approveDecision, rejectDecision) MUST go
// through /api/* server routes. The server uses the service-role key,
// validates the caller's JWT, and overwrites client-controlled fields like
// `actor` and `approver_id` with values derived from the verified session.
// (C-1, H-3, H-4 fixes — see lib/api-server.ts and app/api/*/route.ts.)

type SupabaseRow = Record<string, any>

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

// ─── Mutations go through /api/* ───────────────────────────────────────────

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body ?? {}),
  })
  if (!res.ok) {
    // Throwing the user-friendly error code only; raw server text never
    // reaches the UI. (M-1 fix — see also lib/errors.ts.)
    const err = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error ?? 'request_failed')
  }
  return (await res.json().catch(() => ({}))) as Record<string, unknown>
}

export async function triggerDemoDisruption() {
  // Server runs the inserts with the service-role key. The browser only
  // sends an empty body — the server stamps actor/approver_id from the JWT.
  return postJson('/api/demo/trigger', {})
}

export async function approveDecision(decisionId: string) {
  return postJson(`/api/decisions/${encodeURIComponent(decisionId)}/approve`, {})
}

export async function rejectDecision(decisionId: string) {
  return postJson(`/api/decisions/${encodeURIComponent(decisionId)}/reject`, {})
}
