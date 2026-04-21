'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, Eye, EyeOff, Moon, Sun } from '@/components/ui/phosphor-icons'

import { AuthSplitCollage, type AuthTheme } from '@/components/ui/auth-split-collage'
import { GlowButton } from '@/components/ui/glow-button'
import { authInputClassName } from '@/lib/auth-field-classes'
import { createSupabaseBrowserClient, getSupabaseRedirectUrl } from '@/lib/supabase'
import { cn } from '@/lib/utils'

import { INDIA_STATES } from '@/app/signup/lib/india-states'

export function AnimatedSignUp() {
  const [theme, setTheme] = React.useState<AuthTheme>('light')
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [oauthLoading, setOauthLoading] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [formSuccess, setFormSuccess] = React.useState<string | null>(null)
  const [formVisible, setFormVisible] = React.useState(false)

  React.useEffect(() => {
    const t = window.setTimeout(() => setFormVisible(true), 200)
    return () => window.clearTimeout(t)
  }, [])

  const isDark = theme === 'dark'

  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const firstName = String(fd.get('firstName') ?? '').trim()
    const lastName = String(fd.get('lastName') ?? '').trim()
    const phone = String(fd.get('phone') ?? '').trim()
    const email = String(fd.get('email') ?? '').trim()
    const pw = String(fd.get('password') ?? '')
    const confirm = String(fd.get('confirmPassword') ?? '')

    if (pw !== confirm) {
      setFormError('Passwords do not match.')
      return
    }

    setFormError(null)
    setFormSuccess(null)
    setIsLoading(true)

    try {
      const supabase = createSupabaseBrowserClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pw,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone,
            country: 'India',
            state: String(fd.get('state') ?? ''),
          },
        },
      })

      if (error) {
        throw error
      }

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          phone,
          country: 'India',
          state: String(fd.get('state') ?? ''),
          email,
        })
      }

      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData.session) {
        router.replace('/dashboard')
        router.refresh()
        return
      }

      setFormSuccess('Account created. Check your email to confirm your session.')
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to create account.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleSignUp() {
    setOauthLoading(true)
    setFormError(null)
    setFormSuccess(null)

    try {
      const supabase = createSupabaseBrowserClient()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getSupabaseRedirectUrl('/auth/callback?next=/dashboard'),
        },
      })

      if (error) {
        throw error
      }

      if (data.url) {
        window.location.assign(data.url)
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Google sign-up failed.')
      setOauthLoading(false)
    }
  }

  const fieldBase = () =>
    cn(
      'block w-full rounded-md border py-2.5 pr-4 pl-4 text-sm focus:ring-2 focus:outline-none',
      'border-border bg-muted/50 text-foreground placeholder:text-muted-foreground focus:ring-primary',
    )

  return (
    <div
      className={cn(
        'min-h-screen w-full transition-colors duration-300',
        'bg-background',
      )}
    >
      <div className="flex min-h-screen items-center justify-center p-4 py-12 md:p-8">
        <div
          className={cn(
            'relative w-full max-w-6xl overflow-hidden rounded-2xl border border-border shadow-xl transition-all duration-500',
            'bg-card shadow-black/40',
            formVisible ? 'scale-100 opacity-100' : 'scale-[0.98] opacity-0',
          )}
        >
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={cn(
              'absolute top-4 right-4 z-10 rounded-full p-2 transition-colors',
              isDark
                ? 'bg-muted text-amber-400 hover:bg-muted/80'
                : 'bg-muted/80 text-muted-foreground hover:bg-muted',
            )}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
          </button>

          <div className="flex flex-col md:flex-row">
            <AuthSplitCollage theme={theme} visible={formVisible} />

            <div
              className={cn(
                'w-full p-8 md:w-2/5 md:p-10 lg:p-12',
                'bg-card text-foreground',
              )}
              style={{
                transform: formVisible ? 'translateX(0)' : 'translateX(16px)',
                opacity: formVisible ? 1 : 0,
                transition: 'transform 0.55s ease-out, opacity 0.55s ease-out',
              }}
            >
              <div className="mb-6 flex justify-end">
                <p
                  className={cn(
                    'text-sm',
                    'text-muted-foreground',
                  )}
                >
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="ml-1 font-medium text-primary hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>

              <div className="mb-6">
                <h1
                  className={cn(
                    'mb-1 text-2xl font-bold',
                    'text-foreground',
                  )}
                >
                  Create your <span className="text-primary">R3FLEX</span> account
                </h1>
                <p
                  className={cn(
                    'text-sm',
                    'text-muted-foreground',
                  )}
                >
                  Join operations teams with live visibility across lanes and borders.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label
                      htmlFor="firstName"
                      className={cn(
                        'block text-sm font-medium',
                        'text-foreground',
                      )}
                    >
                      First name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      required
                      autoComplete="given-name"
                      className={fieldBase()}
                      placeholder="Ada"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="lastName"
                      className={cn(
                        'block text-sm font-medium',
                        'text-foreground',
                      )}
                    >
                      Last name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      required
                      autoComplete="family-name"
                      className={fieldBase()}
                      placeholder="Lovelace"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="phone"
                    className={cn(
                      'block text-sm font-medium',
                      'text-foreground',
                    )}
                  >
                    Phone number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    className={fieldBase()}
                    placeholder="+91 …"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="email"
                    className={cn(
                      'block text-sm font-medium',
                      'text-foreground',
                    )}
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className={fieldBase()}
                    placeholder="you@company.com"
                  />
                </div>

                <div className="space-y-1">
                  <span
                    className={cn(
                      'block text-sm font-medium',
                      'text-foreground',
                    )}
                  >
                    Country
                  </span>
                  <div
                    className={cn(
                      'rounded-md border py-2.5 pr-4 pl-4 text-sm',
                      'border-border bg-muted/40 text-foreground',
                    )}
                  >
                    India
                  </div>
                  <input type="hidden" name="country" value="India" />
                </div>

                <div className="relative space-y-1">
                  <label
                    htmlFor="state"
                    className={cn(
                      'block text-sm font-medium',
                      'text-foreground',
                    )}
                  >
                    State (India)
                  </label>
                  <div className="relative">
                    <select
                      id="state"
                      name="state"
                      required
                      defaultValue=""
                      className={cn(
                        authInputClassName,
                        'cursor-pointer appearance-none pr-10 font-normal',
                        isDark ? 'bg-muted/50' : 'bg-white',
                      )}
                    >
                      <option value="" disabled>
                        Select state / UT
                      </option>
                      {INDIA_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="password"
                    className={cn(
                      'block text-sm font-medium',
                      'text-foreground',
                    )}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={10}
                      autoComplete="new-password"
                      className={cn(fieldBase(), 'pr-11')}
                      placeholder="At least 10 characters"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4.5" />
                      ) : (
                        <Eye className="size-4.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="confirmPassword"
                    className={cn(
                      'block text-sm font-medium',
                      'text-foreground',
                    )}
                  >
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      required
                      minLength={10}
                      autoComplete="new-password"
                      className={cn(fieldBase(), 'pr-11')}
                      placeholder="Repeat password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                      onClick={() => setShowConfirm(!showConfirm)}
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? (
                        <EyeOff className="size-4.5" />
                      ) : (
                        <Eye className="size-4.5" />
                      )}
                    </button>
                  </div>
                </div>

                {formError ? (
                  <p className="text-destructive text-sm" role="alert">
                    {formError}
                  </p>
                ) : null}

                {formSuccess ? (
                  <p className="text-sm text-emerald-400" role="status">
                    {formSuccess}
                  </p>
                ) : null}

                <GlowButton
                  type="submit"
                  disabled={isLoading}
                  label="Create account"
                  variant="primary"
                  showSparkle={false}
                  className={cn('mt-2 h-11 w-full', isLoading && 'cursor-not-allowed opacity-70')}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Creating account…
                    </span>
                  ) : (
                    <span>Create account</span>
                  )}
                </GlowButton>

                <div className="relative flex items-center py-2">
                  <div className={cn('grow border-t', 'border-border')} />
                  <span className={cn('mx-4 shrink-0 text-sm', 'text-muted-foreground')}>
                    OR
                  </span>
                  <div className={cn('grow border-t', 'border-border')} />
                </div>

                <GlowButton
                  type="button"
                  variant="secondary"
                  showSparkle={false}
                  className={cn(
                    'h-11 w-full gap-2 rounded-md',
                    oauthLoading && 'cursor-not-allowed opacity-70',
                  )}
                  disabled={oauthLoading}
                  onClick={handleGoogleSignUp}
                >
                  {oauthLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Connecting…
                    </span>
                  ) : null}
                  <svg className="h-5 w-5 text-foreground/80" viewBox="0 0 24 24" aria-hidden>
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="currentColor"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="currentColor"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="currentColor"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="currentColor"
                    />
                  </svg>
                  Continue with Google
                </GlowButton>

                <p
                  className={cn(
                    'pt-2 text-center text-xs leading-relaxed',
                    'text-muted-foreground',
                  )}
                >
                  By signing up you agree to the{' '}
                  <Link href="#" className="text-primary hover:underline">
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
