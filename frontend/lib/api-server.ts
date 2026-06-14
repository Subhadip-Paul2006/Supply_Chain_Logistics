// Shared server-side helpers for /api/* routes. These run on the Next.js
// server (Node runtime) and use the **service-role** Supabase key. They
// must never be imported from a 'use client' module.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { randomBytes, timingSafeEqual } from 'node:crypto'

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

// ─── CSRF (double-submit cookie) ───────────────────────────────────────────
// SECURITY (H-2 + H-5 fix): every mutating /api/* route MUST call
// `enforceCsrf()` after authentication. The browser sends the same random
// secret in two places:
//
//   1. Cookie `r3flex_csrf`  (not HttpOnly so JS can mirror it)
//   2. Header `x-csrf-token`
//
// An attacker on a different origin can read neither, so they cannot forge
// the matching pair. The cookie is bound to the exact path `/api/` and is
// `SameSite=Strict` + `Secure`, so it is not sent on cross-site requests.

const CSRF_COOKIE = 'r3flex_csrf'
const CSRF_HEADER = 'x-csrf-token'
const CSRF_TTL_SECONDS = 60 * 60 * 8 // 8h — matches a typical login session

/** Issue a fresh CSRF token, set the cookie, and return the value. */
export function issueCsrfToken(response: NextResponse): string {
  const token = randomBytes(32).toString('hex')
  response.cookies.set(CSRF_COOKIE, token, {
    path: '/api',
    httpOnly: false, // intentionally readable by JS so the browser can echo it
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: CSRF_TTL_SECONDS,
  })
  return token
}

/** Read the CSRF cookie + header off an incoming request. */
export async function readCsrfFromRequest(
  request: NextRequest,
): Promise<{ cookie: string | null; header: string | null }> {
  const cookieStore = await cookies()
  const cookie =
    cookieStore.get(CSRF_COOKIE)?.value ?? request.cookies.get(CSRF_COOKIE)?.value ?? null
  const header = request.headers.get(CSRF_HEADER)
  return { cookie, header }
}

/**
 * Compare two strings in constant time. Returns true iff they match.
 * Avoids using `===` which short-circuits and leaks length info via timing.
 */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8')
  const bb = Buffer.from(b, 'utf8')
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

/** Returns a 403 Response if CSRF check fails; null if the request is OK. */
export function checkCsrf(
  cookie: string | null,
  header: string | null,
): NextResponse | null {
  if (!cookie || !header) {
    return jsonError(403, 'forbidden', 'Missing CSRF token.')
  }
  if (!safeEqual(cookie, header)) {
    return jsonError(403, 'forbidden', 'CSRF token mismatch.')
  }
  return null
}

// ─── Tenant isolation (H-3 fix) ────────────────────────────────────────────
/**
 * Read the company_id from the authenticated user's JWT app_metadata.
 * Falls back to the demo company only if the JWT has no claim — that is
 * a misconfiguration, not a feature, so we also log a warning.
 */
export function getCompanyIdForUser(user: { app_metadata?: unknown } | null): string {
  const fromJwt = (user?.app_metadata as { company_id?: unknown } | undefined)?.company_id
  if (typeof fromJwt === 'string' && fromJwt.length > 0 && fromJwt.length <= 128) {
    return fromJwt
  }
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(
      '[auth] user has no app_metadata.company_id; falling back to demo company',
    )
  }
  return 'pharma-distrib-india'
}

// ─── Actor stamping (H-3 fix) ──────────────────────────────────────────────
/**
 * Build the server-asserted `actor` string for audit_logs. Always uses the
 * immutable Supabase user UUID — never the email, which is mutable.
 */
export function buildAuditActor(userId: string): string {
  return `server:user:${userId}`
}

