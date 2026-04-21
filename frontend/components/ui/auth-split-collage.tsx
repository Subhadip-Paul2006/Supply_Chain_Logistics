'use client'

import { cn } from '@/lib/utils'

export type AuthTheme = 'light' | 'dark'

export function AuthSplitCollage({
  theme,
  visible,
  className,
}: {
  theme: AuthTheme
  visible: boolean
  className?: string
}) {
  const isDark = theme === 'dark'

  return (
    <div
      className={cn(
        'hidden h-full min-h-[420px] w-full md:block md:w-3/5',
        isDark ? 'bg-muted/40' : 'bg-muted/30',
        className,
      )}
    >
      <div className="grid h-full min-h-[420px] grid-cols-2 grid-rows-3 gap-4 p-6">
        <div className="overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80"
            alt=""
            className="h-full w-full object-cover opacity-90"
          />
        </div>

        <div
          className={cn(
            'flex flex-col items-center justify-center rounded-xl p-6 text-primary-foreground',
            'bg-primary',
          )}
          style={{
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            opacity: visible ? 1 : 0,
            transition: 'transform 0.6s ease-out, opacity 0.6s ease-out',
            transitionDelay: '0.15s',
          }}
        >
          <h2 className="mb-2 text-4xl font-bold md:text-5xl">190+</h2>
          <p className="text-center text-sm">
            countries with live detection coverage on the R3FLEX network.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80"
            alt=""
            className="h-full w-full object-cover opacity-90"
          />
        </div>

        <div className="overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&q=80"
            alt=""
            className="h-full w-full object-cover opacity-90"
          />
        </div>

        <div
          className={cn(
            'flex flex-col items-center justify-center rounded-xl p-6 text-secondary-foreground',
            'bg-secondary',
          )}
          style={{
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            opacity: visible ? 1 : 0,
            transition: 'transform 0.6s ease-out, opacity 0.6s ease-out',
            transitionDelay: '0.3s',
          }}
        >
          <h2 className="mb-2 text-4xl font-bold md:text-5xl">2.4B+</h2>
          <p className="text-center text-sm">
            events normalized every day into a single operational timeline.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80"
            alt=""
            className="h-full w-full object-cover opacity-90"
          />
        </div>
      </div>
    </div>
  )
}
