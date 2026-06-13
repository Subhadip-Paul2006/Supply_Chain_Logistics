import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import {
  getAuthenticatedUser,
  jsonError,
  serviceSupabase,
} from '@/lib/api-server'

const ParamsSchema = z.object({
  id: z.string().uuid({ message: 'invalid_decision_id' }),
})

export async function POST(
  _request: NextRequest,
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

  const approverId = user.email ?? user.id

  try {
    const supabase = serviceSupabase()

    const { data: decision, error: fetchError } = await supabase
      .from('decisions')
      .select('id, status, disruption_id')
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
      actor: `server:user:${approverId}`,
      company_id: 'pharma-distrib-india',
      created_at: now,
    })

    if (auditError) {
      return jsonError(500, 'internal')
    }

    return NextResponse.json({
      id: parsed.data.id,
      status: 'rejected',
      approver_id: approverId,
      executed_at: now,
    })
  } catch {
    return jsonError(500, 'internal')
  }
}
