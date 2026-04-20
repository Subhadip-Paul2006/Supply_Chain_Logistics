"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Radar } from "lucide-react"
import { cn } from "@/lib/utils"
import { LiquidButton } from "@/components/ui/liquid-glass-button"

const navItems = [
  { label: "Platform", href: "/#platform" },
  { label: "Coverage", href: "/#coverage" },
  { label: "Detection", href: "/#detection" },
  { label: "Pricing", href: "/pricing" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-60 font-geist">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className="relative flex items-center justify-between gap-4 overflow-hidden rounded-full border border-white/15 bg-popover/50 px-4 py-2.5 shadow-2xl backdrop-blur-xl sm:px-6">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-white/6 via-transparent to-white/4" />
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <span className="grid place-items-center w-8 h-8 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <Radar className="w-4 h-4" />
            </span>
            <span className="tracking-tight">R3FLEX</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <LiquidButton asChild size="sm" variant="subtle">
              <Link href="/login">Log in</Link>
            </LiquidButton>
            <LiquidButton asChild size="sm" variant="primary">
              <Link href="/signup">Sign up</Link>
            </LiquidButton>
          </div>

          <button
            className="md:hidden grid place-items-center w-9 h-9 rounded-full border border-white/20 bg-card/40 text-foreground backdrop-blur-md"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            open ? "max-h-96 mt-2" : "max-h-0",
          )}
        >
          <div className="rounded-2xl border border-white/15 bg-popover/75 p-4 shadow-xl backdrop-blur-xl">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="h-px bg-border my-2" />
              <LiquidButton
                asChild
                size="sm"
                variant="subtle"
                className="w-full justify-center"
              >
                <Link href="/login" onClick={() => setOpen(false)}>
                  Log in
                </Link>
              </LiquidButton>
              <LiquidButton
                asChild
                size="sm"
                variant="primary"
                className="w-full justify-center"
              >
                <Link href="/signup" onClick={() => setOpen(false)}>
                  Sign up
                </Link>
              </LiquidButton>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}
