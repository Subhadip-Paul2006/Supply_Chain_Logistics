// M-1: error sanitizer. Maps raw Supabase / fetch / network errors to
// user-safe categories. The raw message is logged via the dev-only console
// and never sent to the UI. (Server responses from /api/* are already
// shape-controlled; this helper covers everything else.)

export type SafeErrorCode =
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'rate_limited'
  | 'network'
  | 'validation'
  | 'server'
  | 'unknown'

const SAFE_MESSAGES: Record<SafeErrorCode, string> = {
  unauthorized: 'Your session has expired. Please sign in again.',
  forbidden: 'You do not have permission to perform that action.',
  not_found: 'The requested item was not found.',
  conflict: 'This item was already updated. Reloading the latest state.',
  rate_limited: 'You are sending requests too quickly. Please slow down.',
  network: 'Network error. Check your connection and try again.',
  validation: 'Some fields are invalid. Please review and resubmit.',
  server: 'Something went wrong on our side. Please try again in a moment.',
  unknown: 'Something went wrong. Please try again.',
}

export interface SanitizedError {
  code: SafeErrorCode
  message: string
}

const KNOWN_API_CODES = new Set<SafeErrorCode>([
  'unauthorized',
  'forbidden',
  'not_found',
  'conflict',
  'rate_limited',
])

export function sanitizeError(err: unknown, devMessage?: string): SanitizedError {
  if (IS_DEV && devMessage) {
    // eslint-disable-next-line no-console
    console.warn('[error]', devMessage, err)
  }

  // String codes from /api/* responses
  if (err && typeof err === 'object') {
    const e = err as { error?: unknown; code?: unknown; status?: unknown }
    if (typeof e.error === 'string' && KNOWN_API_CODES.has(e.error as SafeErrorCode)) {
      const code = e.error as SafeErrorCode
      return { code, message: SAFE_MESSAGES[code] }
    }
    if (typeof e.code === 'string' && KNOWN_API_CODES.has(e.code as SafeErrorCode)) {
      const code = e.code as SafeErrorCode
      return { code, message: SAFE_MESSAGES[code] }
    }
    if (typeof e.status === 'number') {
      if (e.status === 401) return { code: 'unauthorized', message: SAFE_MESSAGES.unauthorized }
      if (e.status === 403) return { code: 'forbidden', message: SAFE_MESSAGES.forbidden }
      if (e.status === 404) return { code: 'not_found', message: SAFE_MESSAGES.not_found }
      if (e.status === 409) return { code: 'conflict', message: SAFE_MESSAGES.conflict }
      if (e.status === 429) return { code: 'rate_limited', message: SAFE_MESSAGES.rate_limited }
      if (e.status >= 500) return { code: 'server', message: SAFE_MESSAGES.server }
    }
  }

  // Fetch failures
  if (err instanceof TypeError) {
    return { code: 'network', message: SAFE_MESSAGES.network }
  }

  if (err instanceof Error) {
    if (/auth/i.test(err.message) && /session|jwt|token/i.test(err.message)) {
      return { code: 'unauthorized', message: SAFE_MESSAGES.unauthorized }
    }
    if (/network|fetch|failed to fetch/i.test(err.message)) {
      return { code: 'network', message: SAFE_MESSAGES.network }
    }
  }

  return { code: 'unknown', message: SAFE_MESSAGES.unknown }
}

export function safeMessageForCode(code: SafeErrorCode): string {
  return SAFE_MESSAGES[code] ?? SAFE_MESSAGES.unknown
}

const IS_DEV = process.env.NODE_ENV !== 'production'
