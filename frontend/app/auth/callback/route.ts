import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Only allow same-origin absolute paths. Blocks protocol-relative ("//evil.com"),
// backslash-prefixed, and absolute URLs ("https://evil.com") open-redirect
// attempts. The negative lookahead `(?!\/)` rejects anything that starts with
// a second slash (//host), and the leading `^/` anchor requires a single slash.
const SAFE_NEXT_RE = /^\/(?!\/|\\)/

function safeNextPath(input: string | null | undefined, fallback: string) {
  if (typeof input !== 'string' || !SAFE_NEXT_RE.test(input)) {
    return fallback
  }
  // Defense in depth: also reject anything containing CRLF, control chars,
  // or sequences that could re-introduce authority components.
  if (/[\r\n\t\0]/.test(input) || input.includes('://')) {
    return fallback
  }
  return input
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const nextPath = requestUrl.searchParams.get('next')
  const safeNextPath = safeNextPath(nextPath, '/dashboard')

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(
        new URL('/login?error=auth_callback', requestUrl.origin),
      )
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    })

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL(safeNextPath, requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_callback', requestUrl.origin))
}
