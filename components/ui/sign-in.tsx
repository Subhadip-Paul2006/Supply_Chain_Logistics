'use client'

import * as React from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Moon, Sun } from 'lucide-react'

import { AuthSplitCollage, type AuthTheme } from '@/components/ui/auth-split-collage'
import { GlowButton } from '@/components/ui/glow-button'
import { cn } from '@/lib/utils'

export function AnimatedSignIn() {
  const [theme, setTheme] = React.useState<AuthTheme>('light')
  const [showPassword, setShowPassword] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [formVisible, setFormVisible] = React.useState(false)

  React.useEffect(() => {
    const t = window.setTimeout(() => setFormVisible(true), 200)
    return () => window.clearTimeout(t)
  }, [])

  const isDark = theme === 'dark'

  function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    window.setTimeout(() => {
      setIsLoading(false)
    }, 1200)
  }

  return (
    <div
      className={cn(
        'min-h-screen w-full transition-colors duration-300',
        'bg-background',
      )}
    >
      <div className="flex min-h-screen items-center justify-center p-4 md:p-8">
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
                'w-full p-8 md:w-2/5 md:p-12',
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
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/signup"
                    className="ml-1 font-medium text-primary hover:underline"
                  >
                    Sign up
                  </Link>
                </p>
              </div>

              <div className="mb-8">
                <h1
                  className={cn(
                    'mb-1 text-2xl font-bold',
                    'text-foreground',
                  )}
                >
                  Sign in to{' '}
                  <span className="text-primary">R3FLEX</span>
                </h1>
                <p
                  className={cn(
                    'text-sm',
                    'text-muted-foreground',
                  )}
                >
                  Welcome back — enter your credentials to access your workspace.
                </p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-6">
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
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(
                      'block w-full rounded-md border py-3 pr-4 pl-4 text-sm focus:ring-2 focus:outline-none',
                      'border-border bg-muted/50 text-foreground placeholder:text-muted-foreground focus:ring-primary',
                    )}
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                  />
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
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={cn(
                        'block w-full rounded-md border py-3 pr-11 pl-4 text-sm focus:ring-2 focus:outline-none',
                        'border-border bg-muted/50 text-foreground placeholder:text-muted-foreground focus:ring-primary',
                      )}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
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

                <div className="flex justify-end">
                  <Link
                    href="#"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <GlowButton
                  type="submit"
                  disabled={isLoading}
                  label="Log in"
                  variant="primary"
                  showSparkle={false}
                  className={cn('h-11 w-full', isLoading && 'cursor-not-allowed opacity-70')}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Signing in…
                    </span>
                  ) : (
                    <span>Log in</span>
                  )}
                </GlowButton>

                <div className="relative flex items-center py-2">
                  <div
                    className={cn(
                      'grow border-t',
                      'border-border',
                    )}
                  />
                  <span
                    className={cn(
                      'mx-4 shrink-0 text-sm',
                      'text-muted-foreground',
                    )}
                  >
                    OR
                  </span>
                  <div
                    className={cn(
                      'grow border-t',
                      'border-border',
                    )}
                  />
                </div>

                <GlowButton
                  type="button"
                  variant="secondary"
                  showSparkle={false}
                  className="h-11 w-full gap-2 rounded-md"
                >
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
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
