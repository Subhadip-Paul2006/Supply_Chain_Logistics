"use client"

import Link from "next/link"
import { Menu, Radar } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { LiquidButton } from "@/components/ui/liquid-glass-button"

export function SiteNav() {
  const [open, setOpen] = useState(false)

  const links = [
    { href: "#mission", label: "Mission" },
    { href: "#moats", label: "Moats" },
    { href: "#architecture", label: "Architecture" },
    { href: "#contact", label: "Contact" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-[60]">
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between gap-4 overflow-hidden rounded-full border border-white/15 bg-popover/50 px-4 py-2.5 shadow-2xl backdrop-blur-xl sm:px-6">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-white/6 via-transparent to-white/4" />
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-foreground"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
              <Radar className="h-4 w-4" />
            </span>
            <span className="tracking-tight">
              Nexus<span className="text-primary">Guard</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <LiquidButton asChild size="sm" variant="subtle">
              <Link href="/login">Sign in</Link>
            </LiquidButton>
            <LiquidButton asChild size="sm" variant="primary">
              <Link href="/pricing">Request demo</Link>
            </LiquidButton>
          </div>

          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen((value) => !value)}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-card/40 text-foreground backdrop-blur-md md:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300 md:hidden",
            open ? "mt-2 max-h-96" : "max-h-0",
          )}
        >
          <div className="rounded-2xl border border-white/15 bg-popover/75 p-4 shadow-xl backdrop-blur-xl">
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="my-2 h-px bg-border" />
              <LiquidButton
                asChild
                size="sm"
                variant="subtle"
                className="w-full justify-center"
              >
                <Link href="/login" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              </LiquidButton>
              <LiquidButton
                asChild
                size="sm"
                variant="primary"
                className="w-full justify-center"
              >
                <Link href="/pricing" onClick={() => setOpen(false)}>
                  Request demo
                </Link>
              </LiquidButton>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
