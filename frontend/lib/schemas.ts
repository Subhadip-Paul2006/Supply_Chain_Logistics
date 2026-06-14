// ─── Typed contracts for Supabase rows ────────────────────────────────────
// SECURITY (C-2 fix): all data crossing the browser/server boundary is
// parsed and validated with Zod. This keeps the rest of the app free of
// `any[]` and prevents attacker-controlled DB content from being treated as
// trusted.
//
// The shapes mirror the actual Supabase migrations in
// `supabase/migrations/20260421_0001_r3flex_supabase_schema.sql`.

import { z } from 'zod'

// ── shared primitives ─────────────────────────────────────────────────────
const uuid = z.string().uuid()
const isoDate = z.string().datetime({ offset: true }).or(z.string())
const numericString = z.union([z.number(), z.string()])
const jsonArray = z.array(z.unknown())

// ── disruptions ────────────────────────────────────────────────────────────
export const DisruptionStatusSchema = z.enum([
  'detected',
  'processing',
  'resolved',
  'escalated',
  'error',
])
export type DisruptionStatus = z.infer<typeof DisruptionStatusSchema>

export const DisruptionRowSchema = z.object({
  id: uuid,
  event_type: z.string().max(64),
  geography: z.string().max(256),
  severity_score: numericString.nullish(),
  raw_signal: z.string().max(10_000).nullish(),
  affected_nodes: jsonArray.nullish(),
  cascade_nodes: jsonArray.nullish(),
  status: DisruptionStatusSchema.or(z.string().max(32)),
  created_at: isoDate.optional(),
  updated_at: isoDate.optional(),
})
export type DisruptionRow = z.infer<typeof DisruptionRowSchema>

// ── scenarios ──────────────────────────────────────────────────────────────
export const ScenarioRowSchema = z.object({
  id: uuid,
  disruption_id: uuid.nullish(),
  option_index: z.number().int().min(1).max(3),
  label: z.string().max(256),
  description: z.string().max(2_000).nullish(),
  cost_delta_usd: numericString.nullish(),
  time_delta_days: numericString.nullish(),
  risk_score: numericString.nullish(),
  composite_score: numericString.nullish(),
  recommended: z.boolean().nullish(),
  created_at: isoDate.optional(),
})
export type ScenarioRow = z.infer<typeof ScenarioRowSchema>

// ── decisions ──────────────────────────────────────────────────────────────
export const DecisionStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
  'executed',
])
export type DecisionStatus = z.infer<typeof DecisionStatusSchema>

/**
 * Client-shaped scenario: the dashboard renders `estimated_cost_usd`,
 * `estimated_delay_days`, `success_confidence`, and a `name` (mapped from
 * `label`). This is what we get back from `fetchPendingDecisions()` after
 * `mapScenario()` re-shapes the raw PostgREST row for the UI.
 */
export const DecisionScenarioSchema = z.object({
  id: uuid.optional(),
  name: z.string().max(256),
  label: z.string().max(256).optional(),
  option_index: z.number().int().min(1).max(3).optional(),
  disruption_id: uuid.nullish(),
  description: z.string().max(2_000).nullish(),
  estimated_cost_usd: z.number().finite().nullable(),
  estimated_delay_days: z.number().finite().nullable(),
  cost_delta_usd: numericString.nullish(),
  time_delta_days: numericString.nullish(),
  risk_score: numericString.nullish(),
  composite_score: numericString.nullish(),
  recommended: z.boolean().nullish(),
  success_confidence: z.number().min(0).max(1),
  created_at: isoDate.optional(),
})
export type DecisionScenario = z.infer<typeof DecisionScenarioSchema>

export const DecisionRowSchema = z.object({
  id: uuid,
  disruption_id: uuid.nullish(),
  scenario_id: uuid.nullish(),
  confidence_score: numericString.nullish(),
  auto_executed: z.boolean().nullish(),
  human_approved: z.boolean().nullish(),
  approver_id: z.string().max(256).nullish(),
  status: DecisionStatusSchema.or(z.string().max(32)),
  outcome: z.string().max(2_000).nullish(),
  executed_at: isoDate.nullish(),
  created_at: isoDate.optional(),
  // joined from /scenarios — the dashboard renders the client-shaped fields
  scenarios: z.array(DecisionScenarioSchema).optional(),
})
export type DecisionRow = z.infer<typeof DecisionRowSchema>

// ── audit_logs ─────────────────────────────────────────────────────────────
export const AuditLogRowSchema = z.object({
  id: uuid,
  disruption_id: uuid.nullish(),
  decision_id: uuid.nullish(),
  action_type: z.string().max(64),
  reasoning: z.string().max(10_000).nullish(),
  signals_used: z.record(z.unknown()).nullish(),
  confidence_score: numericString.nullish(),
  actor: z.string().max(256).nullish(),
  company_id: z.string().max(128).nullish(),
  created_at: isoDate.optional(),
})
export type AuditLogRow = z.infer<typeof AuditLogRowSchema>

// ── API response envelopes ─────────────────────────────────────────────────
export const DisruptionListResponseSchema = z.object({
  items: z.array(DisruptionRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  page_size: z.number().int().positive(),
})
export type DisruptionListResponse = z.infer<typeof DisruptionListResponseSchema>

export const DecisionListResponseSchema = z.object({
  items: z.array(DecisionRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  page_size: z.number().int().positive(),
  pending_count: z.number().int().nonnegative().optional(),
})
export type DecisionListResponse = z.infer<typeof DecisionListResponseSchema>

// ── helpers ────────────────────────────────────────────────────────────────
/** Parse a row that came from Supabase. Throws on schema violation. */
export function parseDisruptionRow(raw: unknown): DisruptionRow {
  return DisruptionRowSchema.parse(raw)
}

/**
 * Parse an array of rows that came from Supabase. Items that fail validation
 * are dropped (with a dev-mode console warning) so a single bad row never
 * breaks the whole page.
 */
export function parseDisruptionRows(raw: unknown): DisruptionRow[] {
  if (!Array.isArray(raw)) return []
  const out: DisruptionRow[] = []
  for (const item of raw) {
    const parsed = DisruptionRowSchema.safeParse(item)
    if (parsed.success) {
      out.push(parsed.data)
    } else if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[disruptions] dropped invalid row', parsed.error.flatten())
    }
  }
  return out
}

export function parseDecisionRows(raw: unknown): DecisionRow[] {
  if (!Array.isArray(raw)) return []
  const out: DecisionRow[] = []
  for (const item of raw) {
    const parsed = DecisionRowSchema.safeParse(item)
    if (parsed.success) {
      out.push(parsed.data)
    } else if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[decisions] dropped invalid row', parsed.error.flatten())
    }
  }
  return out
}
