import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import {
  getAuthenticatedUser,
  jsonError,
  serviceSupabase,
  issueCsrfToken,
  readCsrfFromRequest,
  checkCsrf,
  getCompanyIdForUser,
  buildAuditActor,
} from '@/lib/api-server'
import { enforceRateLimit, identifierForRequest } from '@/lib/rate-limit'

// POST /api/decisions/[id]/approve
// Approve a pending decision on behalf of the calling user. The user's id
// is read from the verified Supabase JWT — never from the request body —
// so a logged-in user cannot forge an approval under someone else's
// identity. CSRF is enforced (H-2), per-user rate limit is enforced (H-1),
// and tenant isolation is checked (H-3). (C-1, H-3, H-4 fixes.)

const ParamsSchema = z.object({
  id: z.string().uuid({ message: 'invalid_decision_id' }),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const parsed = ParamsSchema.safeParse(params)
  if (!parsed.success) {
    return jsonError(400, 'bad_request', 'Invalid decision id.')
  }

  const { user, error } = await getAuthenticatedUser()
  if (error || !user) {
    return jsonError(401, 'unauthenticated')
  }

  // SECURITY (H-2 fix): enforce CSRF before any DB writes.
  const { cookie, header } = await readCsrfFromRequest(request)
  const csrfFail = checkCsrf(cookie, header)
  if (csrfFail) return csrfFail

  // SECURITY (H-1 fix): throttle approvals.
  const limited = enforceRateLimit(
    request,
    'decisions-approve',
    identifierForRequest(request, user.id),
  )
  if (limited) return limited

  // SECURITY (H-3 fix): approver identity is the immutable user UUID, never
  // the mutable email address.
  const approverId = user.id
  const userCompanyId = getCompanyIdForUser(user)

  try {
    const supabase = serviceSupabase()

    // Read the decision first to confirm it exists, is pending, and belongs
    // to the caller's tenant. The `disruption.company_id` check is the
    // tenant-isolation gate — without it, a user from company A could
    // approve a decision belonging to company B.
    const { data: decision, error: fetchError } = await supabase
      .from('decisions')
      .select('id, status, disruption_id, disruption:disruptions(company_id)')
      .eq('id', parsed.data.id)
      .maybeSingle()

    if (fetchError) {
      return jsonError(500, 'internal')
    }
    if (!decision) {
      return jsonError(404, 'not_found')
    }
    if (decision.status !== 'pending') {
      return jsonError(409, 'conflict', `Decision is already ${decision.status}.`)
    }

    // SECURITY (H-3 fix): tenant-isolation check. The `disruption` join
    // returns the parent disruption's company_id. We require it to match
    // the caller's JWT-stamped company.
    type DecisionWithDisruption = {
      disruption?: { company_id?: string | null } | { company_id?: string | null }[] | null
    }
    const d = decision as unknown as DecisionWithDisruption
    const disruptionObj = Array.isArray(d.disruption) ? d.disruption[0] : d.disruption
    const disruptionCompanyId = disruptionObj?.company_id
    if (disruptionCompanyId && disruptionCompanyId !== userCompanyId) {
      return jsonError(403, 'forbidden', 'Decision is not in your tenant.')
    }

    const now = new Date().toISOString()

    const { error: updateError } = await supabase
      .from('decisions')
      .update({
        status: 'approved',
        human_approved: true,
        approver_id: approverId,
        outcome: 'Approved by human operator in Supabase-backed workflow.',
        executed_at: now,
      })
      .eq('id', parsed.data.id)

    if (updateError) {
      return jsonError(500, 'internal')
    }

    const { error: auditError } = await supabase.from('audit_logs').insert({
      disruption_id: decision.disruption_id,
      decision_id: parsed.data.id,
      action_type: 'human_approve',
      reasoning:
        'Human approved the recommended reroute from the dashboard.',
      signals_used: { news: true, weather: true, port: true },
      confidence_score: 0.74,
      // SECURITY (H-3 fix): server-asserted actor uses the immutable UUID.
      actor: buildAuditActor(approverId),
      company_id: userCompanyId,
      created_at: now,
    })

    if (auditError) {
      return jsonError(500, 'internal')
    }

    const response = NextResponse.json({
      id: parsed.data.id,
      status: 'approved',
      approver_id: approverId,
      executed_at: now,
    })
    issueCsrfToken(response)
    return response
  } catch {
    return jsonError(500, 'internal')
  }
}
