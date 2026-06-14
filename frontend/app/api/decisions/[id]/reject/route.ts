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

  // SECURITY (H-2 fix): CSRF.
  const { cookie, header } = await readCsrfFromRequest(request)
  const csrfFail = checkCsrf(cookie, header)
  if (csrfFail) return csrfFail

  // SECURITY (H-1 fix): rate limit.
  const limited = enforceRateLimit(
    request,
    'decisions-reject',
    identifierForRequest(request, user.id),
  )
  if (limited) return limited

  // SECURITY (H-3 fix): immutable user UUID, tenant from JWT.
  const approverId = user.id
  const userCompanyId = getCompanyIdForUser(user)

  try {
    const supabase = serviceSupabase()

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

    // SECURITY (H-3 fix): tenant-isolation gate.
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
        status: 'rejected',
        human_approved: false,
        approver_id: approverId,
        outcome: 'Rejected by human operator in Supabase-backed workflow.',
        executed_at: now,
      })
      .eq('id', parsed.data.id)

    if (updateError) {
      return jsonError(500, 'internal')
    }

    const { error: auditError } = await supabase.from('audit_logs').insert({
      disruption_id: decision.disruption_id,
      decision_id: parsed.data.id,
      action_type: 'human_reject',
      reasoning:
        'Human rejected the recommended reroute from the dashboard.',
      signals_used: { news: true, weather: true, port: true },
      confidence_score: 0.74,
      actor: buildAuditActor(approverId),
      company_id: userCompanyId,
      created_at: now,
    })

    if (auditError) {
      return jsonError(500, 'internal')
    }

    const response = NextResponse.json({
      id: parsed.data.id,
      status: 'rejected',
      approver_id: approverId,
      executed_at: now,
    })
    issueCsrfToken(response)
    return response
  } catch {
    return jsonError(500, 'internal')
  }
}
