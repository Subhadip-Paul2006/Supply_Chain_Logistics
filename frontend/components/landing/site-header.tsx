"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"

import { LiquidButton } from "@/components/ui/liquid-glass-button"
import { Menu, MoreHorizontal, Radar, X } from "@/components/ui/phosphor-icons"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Platform", href: "/#platform" },
  { label: "Coverage", href: "/#coverage" },
  { label: "Detection", href: "/#detection" },
  { label: "Pricing", href: "/pricing" },
]

const shellMotion =
  "transition-[padding,gap,max-width,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"

const swapMotion =
  "transition-[opacity,transform,max-width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isCondensed, setIsCondensed] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0

    const syncScrollState = () => {
      frame = 0
      const nextCondensed = window.scrollY > 0
      setIsCondensed((previous) =>
        previous === nextCondensed ? previous : nextCondensed,
      )
    }

    syncScrollState()

    const handleScroll = () => {
      if (frame !== 0) return
      frame = window.requestAnimationFrame(syncScrollState)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (frame !== 0) {
        window.cancelAnimationFrame(frame)
      }
    }
  }, [])

  useEffect(() => {
    if (!isCondensed) {
      setMenuOpen(false)
    }
  }, [isCondensed])

  useEffect(() => {
    if (!menuOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [menuOpen])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[60] font-geist transition-[padding-top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        isCondensed ? "pt-2" : "pt-4",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "relative mx-auto w-full overflow-visible rounded-full border border-white/15 bg-popover/50 shadow-2xl backdrop-blur-xl",
            shellMotion,
            isCondensed
              ? "px-3 py-1.5 md:max-w-2xl lg:max-w-3xl"
              : "px-4 py-2.5 sm:px-6",
          )}
        >
          <div className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-r from-white/6 via-transparent to-white/4" />

          <div className="relative z-10 flex items-center justify-between gap-3">
            <Link
              href="/"
              className={cn(
                "flex shrink-0 items-center font-semibold text-foreground",
                shellMotion,
                isCondensed ? "gap-1.5" : "gap-2",
              )}
            >
              <span
                className={cn(
                  "grid place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25",
                  shellMotion,
                  isCondensed ? "h-7 w-7" : "h-8 w-8",
                )}
              >
                <Radar className={cn(shellMotion, isCondensed ? "h-3.5 w-3.5" : "h-4 w-4")} />
              </span>
              <span
                className={cn(
                  "tracking-tight transition-[font-size,opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                  isCondensed ? "text-sm" : "text-base",
                )}
              >
                R3FLEX
              </span>
            </Link>

            <div
              className={cn(
                "hidden items-center justify-center md:flex",
                isCondensed ? "w-0 flex-none" : "min-w-0 flex-1",
              )}
            >
              <nav
                aria-hidden={isCondensed}
                className={cn(
                  "flex min-w-0 items-center gap-7 overflow-hidden text-sm",
                  swapMotion,
                  isCondensed
                    ? "pointer-events-none max-w-0 scale-95 opacity-0"
                    : "max-w-[40rem] scale-100 opacity-100 delay-150",
                )}
              >
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="ml-auto flex items-center">
              <div ref={menuRef} className="relative hidden items-center md:flex">
                <div
                  aria-hidden={isCondensed}
                  className={cn(
                    "flex items-center gap-2 overflow-hidden",
                    swapMotion,
                    isCondensed
                      ? "pointer-events-none max-w-0 scale-95 opacity-0"
                      : "max-w-[20rem] scale-100 opacity-100 delay-200",
                  )}
                >
                  <LiquidButton asChild size="sm" variant="subtle">
                    <Link href="/login">Log in</Link>
                  </LiquidButton>
                  <LiquidButton asChild size="sm" variant="primary">
                    <Link href="/signup">Sign up</Link>
                  </LiquidButton>
                </div>

                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  className={cn(
                    "grid place-items-center rounded-full border border-white/20 bg-card/40 text-foreground backdrop-blur-md hover:border-white/30 hover:bg-card/60",
                    "transition-[opacity,transform,width,height,margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
                    isCondensed
                      ? "ml-3 h-9 w-9 scale-100 opacity-100 delay-150"
                      : "pointer-events-none ml-0 h-0 w-0 scale-90 opacity-0",
                  )}
                  aria-label="Open condensed navigation menu"
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>

                <div
                  role="menu"
                  className={cn(
                    "absolute right-0 top-full mt-2 min-w-[12rem] origin-top-right rounded-2xl border border-white/15 bg-popover/90 p-2 shadow-2xl backdrop-blur-xl",
                    "transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
                    menuOpen && isCondensed
                      ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                      : "pointer-events-none -translate-y-1 scale-95 opacity-0",
                  )}
                >
                  <nav className="flex flex-col gap-0.5">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card/60 hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>

                  <div className="my-2 h-px bg-border" />

                  <div className="flex flex-col gap-1">
                    <LiquidButton
                      asChild
                      size="sm"
                      variant="subtle"
                      className="w-full justify-center"
                    >
                      <Link href="/login" onClick={() => setMenuOpen(false)}>
                        Log in
                      </Link>
                    </LiquidButton>
                    <LiquidButton
                      asChild
                      size="sm"
                      variant="primary"
                      className="w-full justify-center"
                    >
                      <Link href="/signup" onClick={() => setMenuOpen(false)}>
                        Sign up
                      </Link>
                    </LiquidButton>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="relative z-10 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-card/40 text-foreground backdrop-blur-md md:hidden"
                onClick={() => setMobileOpen((open) => !open)}
                aria-label="Toggle navigation"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? (
                  <X className="h-4 w-4" />
                ) : isCondensed ? (
                  <MoreHorizontal className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] md:hidden",
            mobileOpen ? "mt-2 max-h-96 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="rounded-2xl border border-white/15 bg-popover/75 p-4 shadow-xl backdrop-blur-xl">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}

              <div className="my-2 h-px bg-border" />

              <LiquidButton
                asChild
                size="sm"
                variant="subtle"
                className="w-full justify-center"
              >
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  Log in
                </Link>
              </LiquidButton>
              <LiquidButton
                asChild
                size="sm"
                variant="primary"
                className="w-full justify-center"
              >
                <Link href="/signup" onClick={() => setMobileOpen(false)}>
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
