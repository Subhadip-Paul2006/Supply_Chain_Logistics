'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Facebook, Instagram, Linkedin } from '@/components/ui/phosphor-icons'

import { authInputClassName } from '@/lib/auth-field-classes'
import { cn } from '@/lib/utils'

export interface AppAuthInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: React.ReactNode
}

export function AppAuthInput({
  label,
  placeholder,
  icon,
  className,
  ...rest
}: AppAuthInputProps) {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = React.useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <div className="relative w-full min-w-[200px]">
      {label ? (
        <label className="mb-2 block text-left text-sm text-[var(--color-heading)]">
          {label}
        </label>
      ) : null}
      <div
        className="relative w-full"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <input
          className={cn(
            authInputClassName,
            'font-normal',
            icon ? 'pr-11' : undefined,
            className,
          )}
          placeholder={placeholder}
          {...rest}
        />
        {isHovering ? (
          <>
            <div
              className="pointer-events-none absolute top-0 right-0 left-0 z-20 h-[2px] overflow-hidden rounded-t-[var(--rounded-lg)]"
              style={{
                background: `radial-gradient(30px circle at ${mousePosition.x}px 0px, var(--color-text-primary) 0%, transparent 70%)`,
              }}
            />
            <div
              className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 h-[2px] overflow-hidden rounded-b-[var(--rounded-lg)]"
              style={{
                background: `radial-gradient(30px circle at ${mousePosition.x}px 2px, var(--color-text-primary) 0%, transparent 70%)`,
              }}
            />
          </>
        ) : null}
        {icon ? (
          <div className="absolute top-1/2 right-3 z-20 -translate-y-1/2 text-[var(--color-text-secondary)]">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  )
}

const SOCIAL = [
  {
    icon: <Instagram className="size-5" aria-hidden />,
    href: '#',
    label: 'Instagram',
  },
  {
    icon: <Linkedin className="size-5" aria-hidden />,
    href: '#',
    label: 'LinkedIn',
  },
  {
    icon: <Facebook className="size-5" aria-hidden />,
    href: '#',
    label: 'Facebook',
  },
]

export default function LoginOne() {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = React.useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const leftSection = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - leftSection.left,
      y: e.clientY - leftSection.top,
    })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[var(--color-bg)] p-4">
      <div className="card flex h-auto min-h-[600px] w-[90%] max-w-5xl justify-between overflow-hidden rounded-[var(--rounded-lg)] border border-[var(--color-border)] bg-[var(--color-muted-surface)]/40 shadow-[var(--shadow-xl)] md:w-[80%] lg:w-[70%]">
        <div
          className="left relative h-full w-full overflow-hidden px-4 py-8 lg:w-1/2 lg:px-16"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div
            className={cn(
              'pointer-events-none absolute h-[500px] w-[500px] rounded-full bg-gradient-to-r from-[var(--color-text-primary)]/25 via-[var(--color-bg-2)]/20 to-[var(--color-border)]/25 blur-3xl transition-opacity duration-200',
              isHovering ? 'opacity-100' : 'opacity-0',
            )}
            style={{
              transform: `translate(${mousePosition.x - 250}px, ${mousePosition.y - 250}px)`,
              transition: 'transform 0.1s ease-out',
            }}
          />

          <div className="sign-in-container relative z-10 flex h-full min-h-[520px] flex-col justify-center">
            <form
              className="grid h-full gap-6 py-6 text-center md:py-12"
              onSubmit={handleSubmit}
            >
              <div className="grid gap-4 md:gap-6">
                <h1 className="text-3xl font-extrabold text-[var(--color-heading)] md:text-4xl">
                  Sign in
                </h1>
                <div className="social-container">
                  <div className="flex items-center justify-center">
                    <ul className="flex gap-3 md:gap-4">
                      {SOCIAL.map((social) => (
                        <li key={social.label} className="list-none">
                          <a
                            href={social.href}
                            aria-label={social.label}
                            className="group relative z-[1] flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--color-text-primary)] bg-[var(--color-surface)] md:h-12 md:w-12"
                          >
                            <div className="absolute inset-0 h-full w-full origin-bottom scale-y-0 bg-[var(--color-bg-2)] transition-transform duration-500 ease-in-out group-hover:scale-y-100" />
                            <span className="relative z-[2] text-[var(--color-icon-on-social)] transition-all duration-500 ease-in-out group-hover:rotate-[360deg] group-hover:text-[var(--color-heading)]">
                              {social.icon}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  or use your account
                </span>
              </div>

              <div className="mx-auto grid w-full max-w-sm gap-4">
                <AppAuthInput
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email"
                  required
                />
                <AppAuthInput
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  required
                />
              </div>

              <a
                href="#"
                className="text-sm font-light text-[var(--color-text-primary)] hover:underline md:text-base"
              >
                Forgot your password?
              </a>

              <div className="flex items-center justify-center gap-4">
                <button
                  type="submit"
                  className="group/button relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-[var(--rounded-lg)] bg-[var(--color-border)] px-4 py-2 text-xs font-normal text-white transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-[var(--color-text-primary)]"
                >
                  <span className="relative z-10 px-2 py-1 text-sm">Sign In</span>
                  <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
                    <div className="relative h-full w-8 bg-white/20" />
                  </div>
                </button>
              </div>

              <p className="text-sm text-[var(--color-text-secondary)]">
                Don&apos;t have an account?{' '}
                <Link
                  href="/signup"
                  className="font-medium text-[var(--color-text-primary)] hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>

        <div className="relative hidden h-full min-h-[600px] w-1/2 overflow-hidden lg:block">
          <Image
            src="https://images.pexels.com/photos/7102037/pexels-photo-7102037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            loader={({ src }) => src}
            width={1000}
            height={1000}
            priority
            alt=""
            className="h-full w-full object-cover opacity-40 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-transparent to-transparent" />
        </div>
      </div>
    </div>
  )
}
