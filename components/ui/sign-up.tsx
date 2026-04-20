'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronDown, Eye, EyeOff, Moon, Sun } from 'lucide-react'

import { AuthSplitCollage, type AuthTheme } from '@/components/ui/auth-split-collage'
import { GlowButton } from '@/components/ui/glow-button'
import { authInputClassName } from '@/lib/auth-field-classes'
import { cn } from '@/lib/utils'

import { INDIA_STATES } from '@/app/signup/lib/india-states'

export function AnimatedSignUp() {
  const [theme, setTheme] = React.useState<AuthTheme>('light')
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [formVisible, setFormVisible] = React.useState(false)

  React.useEffect(() => {
    const t = window.setTimeout(() => setFormVisible(true), 200)
    return () => window.clearTimeout(t)
  }, [])

  const isDark = theme === 'dark'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const pw = String(fd.get('password') ?? '')
    const confirm = String(fd.get('confirmPassword') ?? '')
    if (pw !== confirm) {
      setFormError('Passwords do not match.')
      return
    }
    setFormError(null)
    setIsLoading(true)
    window.setTimeout(() => setIsLoading(false), 1200)
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
            {isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
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
                        <EyeOff className="size-[18px]" />
                      ) : (
                        <Eye className="size-[18px]" />
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
                        <EyeOff className="size-[18px]" />
                      ) : (
                        <Eye className="size-[18px]" />
                      )}
                    </button>
                  </div>
                </div>

                {formError ? (
                  <p className="text-destructive text-sm" role="alert">
                    {formError}
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
