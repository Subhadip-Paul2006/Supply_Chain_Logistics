import { createSupabaseBrowserClient } from '@/lib/supabase'
import {
  parseDisruptionRows,
  parseDecisionRows,
  type DisruptionRow,
  type DecisionRow,
} from '@/lib/schemas'

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

export async function fetchDisruptions(
  signal?: AbortSignal,
): Promise<{
  items: DisruptionRow[]
  total: number
  page: number
  page_size: number
}> {
  const supabase = createSupabaseBrowserClient()
  let query = supabase
    .from('disruptions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(20)
  if (signal) query = query.abortSignal?.(signal) ?? query
  const { data, error, count } = await query

  if (error) {
    throw new Error(error.message)
  }

  // SECURITY (C-2 fix): validate every row at the API boundary. Items that
  // fail the schema are dropped; a single bad row never breaks the page.
  const items = parseDisruptionRows(data ?? [])

  return {
    items,
    total: count ?? items.length,
    page: 1,
    page_size: 20,
  }
}

function mapScenario(row: Record<string, unknown>) {
  // Coerce numeric strings from PostgREST into numbers, but never trust the
  // shape — fall back to safe defaults.
  const num = (v: unknown): number | null => {
    if (typeof v === 'number') return Number.isFinite(v) ? v : null
    if (typeof v === 'string' && v.trim() !== '') {
      const n = Number(v)
      return Number.isFinite(n) ? n : null
    }
    return null
  }
  const cost = num(row.cost_delta_usd)
  const days = num(row.time_delta_days)
  const composite = num(row.composite_score)
  const recommended = row.recommended === true

  let success_confidence: number
  if (composite !== null) {
    success_confidence = Math.max(0.1, Math.min(0.99, 1 - composite / 10))
  } else if (recommended) {
    success_confidence = 0.91
  } else {
    success_confidence = 0.72
  }

  return {
    ...row,
    name: typeof row.label === 'string' ? row.label : '',
    estimated_cost_usd: cost,
    estimated_delay_days: days,
    success_confidence,
  }
}

export async function fetchPendingDecisions(
  signal?: AbortSignal,
): Promise<{
  items: DecisionRow[]
  total: number
  page: number
  page_size: number
  pending_count: number
}> {
  const supabase = createSupabaseBrowserClient()
  let query = supabase
    .from('decisions')
    .select('*', { count: 'exact' })
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(20)
  if (signal) query = query.abortSignal?.(signal) ?? query
  const { data: decisionRows, error, count } = await query

  if (error) {
    throw new Error(error.message)
  }

  // SECURITY (C-2 fix): validate decisions at the boundary.
  const decisions = parseDecisionRows(decisionRows ?? [])

  const disruptionIds = Array.from(
    new Set(decisions.map((row) => row.disruption_id).filter(Boolean) as string[]),
  )

  let scenariosByDisruption = new Map<string, ReturnType<typeof mapScenario>[]>()

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

  const items: DecisionRow[] = decisions.map((decision) => ({
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

// SECURITY (H-5 fix + M-1 fix): the browser sends a CSRF token header that
// the server compares against the double-submit cookie. All mutations go
// through this helper so the protection cannot be bypassed.
const CSRF_HEADER = 'x-csrf-token'
const CSRF_COOKIE = 'r3flex_csrf'

function readCsrfCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${CSRF_COOKIE}=`))
  return match ? decodeURIComponent(match.slice(CSRF_COOKIE.length + 1)) : null
}

async function postJson(url: string, body?: unknown) {
  const csrf = readCsrfCookie()
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      // SECURITY (H-5): include the CSRF token so the server can match it
      // against the `r3flex_csrf` cookie. Browsers do not allow JS to read
      // HttpOnly cookies, so this value is a non-HttpOnly *mirror* of the
      // same secret — the classic double-submit pattern.
      ...(csrf ? { [CSRF_HEADER]: csrf } : {}),
    },
    // SECURITY (M-1 fix): 30s timeout so a hung backend never freezes the
    // browser; 401/403/5xx are still surfaced to the user.
    credentials: 'include',
    signal: AbortSignal.timeout(30_000),
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
