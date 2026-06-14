// ─── In-memory rate limiter for /api/* routes ─────────────────────────────
// SECURITY (H-1 fix): demo / trigger and decision approve / reject are the
// only mutating routes. They are unauth-as-anyone, and any logged-in user
// can call them, so a single compromised account could otherwise flood the
// database. This is a *coarse* in-process token-bucket limiter suitable for
// a single-instance dev or demo deploy. For multi-instance production, swap
// the storage backend to Redis (see comments).
//
// All limits are PER (userId, route) and PER (ip, route). A user can trip
// either bucket; the more restrictive wins.

import type { NextRequest } from 'next/server'

export type RouteId =
  | 'demo-trigger'
  | 'decisions-approve'
  | 'decisions-reject'

interface Bucket {
  /** tokens currently in the bucket */
  tokens: number
  /** last refill timestamp (ms) */
  lastRefill: number
}

interface LimiterConfig {
  /** max tokens in the bucket */
  capacity: number
  /** tokens added per second */
  refillPerSec: number
}

const CONFIGS: Record<RouteId, LimiterConfig> = {
  // demo-trigger: 5 calls per minute per (user OR ip)
  'demo-trigger': { capacity: 5, refillPerSec: 5 / 60 },
  // decisions-approve / reject: 30 per minute per (user OR ip)
  'decisions-approve': { capacity: 30, refillPerSec: 30 / 60 },
  'decisions-reject': { capacity: 30, refillPerSec: 30 / 60 },
}

const buckets = new Map<string, Bucket>()

function getBucket(key: string, cfg: LimiterConfig): Bucket {
  const now = Date.now()
  const existing = buckets.get(key)
  if (!existing) {
    const fresh: Bucket = { tokens: cfg.capacity, lastRefill: now }
    buckets.set(key, fresh)
    return fresh
  }
  // Refill since last check
  const elapsedSec = (now - existing.lastRefill) / 1000
  if (elapsedSec > 0) {
    existing.tokens = Math.min(
      cfg.capacity,
      existing.tokens + elapsedSec * cfg.refillPerSec,
    )
    existing.lastRefill = now
  }
  return existing
}

function tryConsume(key: string, route: RouteId): boolean {
  const cfg = CONFIGS[route]
  const bucket = getBucket(key, cfg)
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1
    return true
  }
  return false
}

/** Best-effort identifier for a request — prefers user, falls back to IP. */
export function identifierForRequest(
  request: NextRequest,
  userId: string | null,
): string {
  if (userId) return `u:${userId}`
  const xff = request.headers.get('x-forwarded-for')
  const ip =
    xff?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  return `i:${ip}`
}

/**
 * Throws a 429-shaped Response if either the per-user or per-ip bucket is
 * empty. Returns silently if the request is allowed.
 */
export function enforceRateLimit(
  request: NextRequest,
  route: RouteId,
  userId: string | null,
): Response | null {
  const userKey = userId ? `u:${userId}:${route}` : null
  const xff = request.headers.get('x-forwarded-for')
  const ip =
    xff?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  const ipKey = `i:${ip}:${route}`

  // Whichever bucket is more depleted decides.
  const userOk = userKey ? tryConsume(userKey, route) : true
  const ipOk = tryConsume(ipKey, route)

  if (!userOk || !ipOk) {
    const retryAfter = Math.ceil(
      (1 - Math.max(
        userKey ? getBucket(userKey, CONFIGS[route]).tokens : 1,
        getBucket(ipKey, CONFIGS[route]).tokens,
      )) / CONFIGS[route].refillPerSec,
    )
    return new Response(
      JSON.stringify({
        error: 'rate_limited',
        message: 'Too many requests. Please slow down.',
      }),
      {
        status: 429,
        headers: {
          'content-type': 'application/json',
          'retry-after': String(Math.max(1, retryAfter)),
        },
      },
    )
  }
  return null
}

/** Test-only — clears all buckets. */
export function __resetAllBuckets() {
  buckets.clear()
}
