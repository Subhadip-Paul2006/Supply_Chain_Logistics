// Shared server-side helpers for /api/* routes. These run on the Next.js
// server (Node runtime) and use the **service-role** Supabase key. They
// must never be imported from a 'use client' module.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

let serviceClient: SupabaseClient | null = null

function getServiceClient() {
  if (serviceClient) return serviceClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error(
      'Server misconfigured: SUPABASE_SERVICE_ROLE_KEY is required for /api/* mutations.',
    )
  }
  serviceClient = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return serviceClient
}

export async function getAuthenticatedUser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    return { user: null, error: 'env_missing' as const }
  }
  const cookieStore = await cookies()
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll() {
        // No-op in API routes (cookies are not set on the response from here).
      },
    },
  })
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    return { user: null, error: 'unauthenticated' as const }
  }
  return { user: data.user, error: null }
}

export function jsonError(status: number, code: string, message?: string) {
  // Public-safe error shape: no PostgREST internals, no stack traces.
  return NextResponse.json({ error: code, message }, { status })
}

export const approveRejectBody = z.object({
  // No additional fields accepted — the decision id comes from the URL.
})

export type ApiErrorCode =
  | 'unauthenticated'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'bad_request'
  | 'rate_limited'
  | 'internal'

export const serviceSupabase = getServiceClient
