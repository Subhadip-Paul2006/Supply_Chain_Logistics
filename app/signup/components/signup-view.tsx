'use client'

import Link from 'next/link'
import { Radar } from 'lucide-react'

import { AnimatedSignUp } from '@/components/ui/sign-up'
import { LiquidButton } from '@/components/ui/liquid-glass-button'

export function SignupView() {
  return (
    <div className="relative min-h-screen">
      <header className="pointer-events-none fixed top-0 left-0 z-50 flex w-full justify-center p-4">
        <LiquidButton asChild variant="default" className="pointer-events-auto h-10 px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-(--color-heading)">
            <Radar className="size-4 text-(--color-text-primary)" aria-hidden />
            <span className="font-geist tracking-tight">
              Global<span className="text-(--color-text-primary)">Tracker</span>
            </span>
          </Link>
        </LiquidButton>
      </header>
      <AnimatedSignUp />
    </div>
  )
}
