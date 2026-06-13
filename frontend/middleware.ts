import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Server-side auth gate. Runs before the request hits the page. This is the
// defense-in-depth companion to the client-side redirect in
// `app/dashboard/page.tsx`: a logged-out user never even sees the dashboard
// HTML or the React tree, so they can't view-source the JS or the Supabase
// queries. (D-1 fix.)

const PROTECTED_PREFIXES = ['/dashboard']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )
  if (!isProtected) {
    return NextResponse.next()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env is missing we cannot validate the session; fail closed to /login.
  if (!supabaseUrl || !supabaseAnonKey) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('error', 'auth_misconfigured')
    return NextResponse.redirect(url)
  }

  let response = NextResponse.next({ request: { headers: request.headers } })

  // Mirror cookies set by the SSR client onto the outgoing response.
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname + request.nextUrl.search)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    // Run on protected paths; skip Next internals and static assets.
    '/dashboard/:path*',
  ],
}
