"use client"

import { motion, useMotionValue, useSpring } from "framer-motion"
import { useEffect, useState, type MouseEvent } from "react"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import { CorePlatformGoals } from "@/app/docs/components/core-platform-goals"
import { ExecutionFlow } from "@/app/docs/components/ExecutionFlow"
import { GlassShineLink } from "@/app/docs/components/glass-shine-button"
import { SpotlightCard } from "@/app/docs/components/spotlight-card"
import { TerminalBlock } from "@/app/docs/components/terminal-block"
import {
  ArrowRight,
  Check,
  Rocket,
  Sparkles,
  Workflow,
} from "@/components/ui/phosphor-icons"
import { cn } from "@/lib/utils"

const docSections = [
  { id: "introduction", label: "Introduction" },
  { id: "quick-start", label: "Quick Start" },
  { id: "architecture-overview", label: "Architecture Overview" },
  { id: "environment-variables", label: "Environment Variables" },
] as const

const envVars = [
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    detail: "Required for Supabase auth and frontend data access.",
    example: "https://your-project-ref.supabase.co",
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    detail: "Required public anon key for client-side Supabase access.",
    example: "Set this from your Supabase project settings",
  },
  {
    name: "NEXT_PUBLIC_WS_URL",
    detail: "Optional override for the disruptions websocket endpoint.",
    example: "ws://localhost:8000/ws/disruptions",
  },
] as const

const quickStartCommand = ["cd frontend", "pnpm install", "pnpm dev"].join("\n")
const envSetupCommand = ["cd frontend", "cp .env.example .env"].join("\n")

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.12,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

const glassPanel =
  "relative overflow-hidden rounded-[1.75rem] border border-[#E6B566]/14 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(38,38,40,0.92)_58%,rgba(33,23,18,0.76))] shadow-[0_24px_90px_rgba(0,0,0,0.54)] backdrop-blur-xl"

function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string
  title: string
  body: string
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-geist uppercase tracking-[0.28em] text-[#E6B566]">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold text-[#FBF6EE] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-[#B0A99F] sm:text-lg">
        {body}
      </p>
    </div>
  )
}

function SidebarLink({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <GlassShineLink
      href={href}
      active={active}
      className={cn(
        "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-all duration-300",
        active
          ? "border-[#E6B566]/35 bg-[#E6B566]/10 text-[#FBF6EE] shadow-[0_0_0_1px_rgba(230,181,102,0.14)]"
          : "border-[#E6B566]/12 bg-[rgba(17,17,17,0.38)] text-[#8E8E8E] hover:border-[#E6B566]/25 hover:text-[#FBF6EE]",
      )}
    >
      <span>{label}</span>
      <ArrowRight
        className={cn(
          "h-4 w-4 transition-transform duration-300 group-hover:translate-x-1",
          active ? "text-[#E6B566]" : "text-[#8E8E8E]",
        )}
      />
    </GlassShineLink>
  )
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<(typeof docSections)[number]["id"]>("introduction")
  const glowX = useMotionValue(180)
  const glowY = useMotionValue(120)
  const springX = useSpring(glowX, { stiffness: 180, damping: 26, mass: 0.7 })
  const springY = useSpring(glowY, { stiffness: 180, damping: 26, mass: 0.7 })

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visibleEntries[0]) {
          setActiveSection(visibleEntries[0].target.id as (typeof docSections)[number]["id"])
        }
      },
      {
        threshold: [0.2, 0.4, 0.65],
        rootMargin: "-20% 0px -55% 0px",
      },
    )

    for (const section of docSections) {
      const element = document.getElementById(section.id)
      if (element) observer.observe(element)
    }

    return () => observer.disconnect()
  }, [])

  function handleHeroMove(event: MouseEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    glowX.set(event.clientX - bounds.left)
    glowY.set(event.clientY - bounds.top)
  }

  function handleHeroLeave() {
    glowX.set(180)
    glowY.set(120)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#111111] text-[#FBF6EE]">
      <SiteHeader />

      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(204,85,0,0.08),transparent_26%),linear-gradient(180deg,#111111_0%,#232325_48%,#1a1411_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(90,15,46,0.08),transparent_34%,rgba(194,24,7,0.04)_70%,rgba(204,85,0,0.06))]" />
      </div>

      <main className="relative z-10 pb-24 pt-28">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 xl:grid-cols-[290px_minmax(0,1fr)] xl:gap-10">
            <motion.aside
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
              className="xl:pt-10"
            >
              <div className={cn(glassPanel, "sticky top-24 p-5")}>
                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#E6B566]/75 to-transparent" />
                <div className="rounded-2xl border border-[#E6B566]/14 bg-[rgba(90,15,46,0.16)] px-4 py-4">
                  <p className="font-geist text-xs uppercase tracking-[0.26em] text-[#E6B566]">
                    Docs Index
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#8E8E8E]">
                    Product orientation, startup commands, architecture flow, and runtime configuration.
                  </p>
                </div>

                <nav className="mt-5 space-y-3">
                  {docSections.map((section) => (
                    <SidebarLink
                      key={section.id}
                      href={`#${section.id}`}
                      label={section.label}
                      active={activeSection === section.id}
                    />
                  ))}
                </nav>
              </div>
            </motion.aside>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.section
                id="introduction"
                variants={itemVariants}
                onMouseMove={handleHeroMove}
                onMouseLeave={handleHeroLeave}
                className={cn(glassPanel, "overflow-hidden p-6 sm:p-8 lg:p-10")}
              >
                <motion.div
                  style={{ left: springX, top: springY }}
                  className="pointer-events-none absolute h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(230,181,102,0.14),rgba(194,24,7,0.06)_35%,transparent_72%)] blur-3xl"
                />
                <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.72fr)] lg:items-end">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#E6B566]/18 bg-[#5A0F2E]/28 px-4 py-2 text-xs font-geist uppercase tracking-[0.24em] text-[#E6B566]">
                      <Sparkles className="h-4 w-4 text-[#E6B566]" />
                      Agentic Supply Chain War Room
                    </div>
                    <h1 className="mt-6 max-w-4xl text-4xl font-semibold text-[#FBF6EE] sm:text-5xl lg:text-6xl">
                      R3FLEX Platform Documentation
                    </h1>
                    <p className="mt-5 max-w-3xl text-base leading-8 text-[#B0A99F] sm:text-lg">
                      The operator-facing reference for R3FLEX: product intent, startup flow, runtime topology, and the environment variables that wire the platform together.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <GlassShineLink
                        href="#quick-start"
                        className="inline-flex items-center gap-2 rounded-full border border-[#E6B566]/35 bg-[#E6B566] px-5 py-3 text-sm font-medium text-[#221610] shadow-[0_10px_30px_rgba(230,181,102,0.22)] transition-transform hover:-translate-y-0.5"
                      >
                        Quick Start
                        <ArrowRight className="h-4 w-4 text-[#221610]" />
                      </GlassShineLink>
                      <GlassShineLink
                        href="#architecture-overview"
                        className="inline-flex items-center gap-2 rounded-full border border-[#E6B566]/18 bg-[rgba(90,15,46,0.24)] px-5 py-3 text-sm font-medium text-[#FBF6EE] transition-colors hover:border-[#E6B566]/35 hover:bg-[#C21807]/16"
                      >
                        Architecture Flow
                        <Workflow className="h-4 w-4 text-[#E6B566]" />
                      </GlassShineLink>
                    </div>
                  </div>

                  <SpotlightCard className="rounded-[1.5rem] bg-[rgba(19,19,20,0.82)]" contentClassName="p-5">
                    <p className="font-geist text-xs uppercase tracking-[0.24em] text-[#E6B566]">
                      Platform Focus
                    </p>
                    <ul className="mt-4 space-y-3 text-sm leading-6 text-[#B0A99F]">
                      <li className="flex items-start gap-3">
                        <Check className="mt-0.5 h-4 w-4 text-[#E6B566]" />
                        Execution-first logistics intelligence with simulation and approval paths.
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="mt-0.5 h-4 w-4 text-[#E6B566]" />
                        Frontend workspace in Next.js with optional FastAPI, Redis, and Postgres services.
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="mt-0.5 h-4 w-4 text-[#E6B566]" />
                        Runtime designed for traceability across signals, borders, and operator decisions.
                      </li>
                    </ul>
                  </SpotlightCard>
                </div>

                <div className="relative mt-10">
                  <SectionHeader
                    eyebrow="What Is R3FLEX"
                    title="Core platform goals"
                    body="These are the three operating principles that anchor the product story in the project README."
                  />
                  <CorePlatformGoals />
                </div>
              </motion.section>

              <motion.section
                id="quick-start"
                variants={itemVariants}
                className={cn(glassPanel, "p-6 sm:p-8 lg:p-10")}
              >
                <SectionHeader
                  eyebrow="Quick Start"
                  title="Launch the frontend workspace fast"
                  body="The checked-in README uses pnpm for the frontend flow. Start in the frontend workspace, install dependencies, then boot the dev server."
                />

                <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                  <TerminalBlock
                    title="Install + Run"
                    body="Minimal local startup path for the Next.js application."
                    command={quickStartCommand}
                  />

                  <div className="grid gap-5">
                    <SpotlightCard className="rounded-[1.5rem] bg-[rgba(19,19,20,0.82)]" contentClassName="p-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E6B566]/20 bg-[#E6B566]/10">
                          <Rocket className="h-5 w-5 text-[#E6B566]" />
                        </div>
                        <div>
                          <p className="font-geist text-xs uppercase tracking-[0.24em] text-[#E6B566]">
                            Runtime
                          </p>
                          <p className="mt-1 text-sm text-[#8E8E8E]">
                            Dev server defaults to `http://localhost:3000`
                          </p>
                        </div>
                      </div>
                      <p className="mt-5 text-sm leading-7 text-[#B0A99F]">
                        For the full local stack with backend services, migrations, and demo flow, the repo points developers to `SETUP.md`.
                      </p>
                    </SpotlightCard>

                    <TerminalBlock
                      title="Environment Prep"
                      body="Create the local env file before running production-like flows or auth-integrated features."
                      command={envSetupCommand}
                    />
                  </div>
                </div>
              </motion.section>

              <motion.section
                id="architecture-overview"
                variants={itemVariants}
                className={cn(glassPanel, "p-6 sm:p-8 lg:p-10")}
              >
                <SectionHeader
                  eyebrow="Architecture Overview"
                  title="Next.js frontend to backend execution flow"
                  body="R3FLEX ships with a Next.js App Router frontend and an optional service stack built around FastAPI, Redis, and Postgres."
                />

                <div className="mt-8 grid gap-5">
                  <ExecutionFlow />

                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
                    <SpotlightCard className="rounded-[1.5rem] bg-[rgba(19,19,20,0.82)]" contentClassName="p-6">
                      <p className="font-geist text-xs uppercase tracking-[0.24em] text-[#E6B566]">
                        Runtime Topology
                      </p>
                      <div className="mt-5 rounded-[1.25rem] border border-[#E6B566]/12 bg-[rgba(17,17,17,0.34)] p-5 font-mono text-sm leading-7 text-[#8E8E8E]">
                        <p>Browser</p>
                        <p className="pl-4 text-[#FBF6EE]">-&gt; Next.js frontend (:3000)</p>
                        <p className="pl-8">-&gt; REST and WebSocket integration points</p>
                        <p className="pl-12 text-[#FBF6EE]">-&gt; FastAPI backend (:8000, optional local stack)</p>
                        <p className="pl-16">-&gt; Postgres + Redis</p>
                      </div>
                    </SpotlightCard>

                    <SpotlightCard className="rounded-[1.5rem] bg-[rgba(19,19,20,0.82)]" contentClassName="p-6">
                      <p className="font-geist text-xs uppercase tracking-[0.24em] text-[#E6B566]">
                        Integration Notes
                      </p>
                      <ul className="mt-5 space-y-4 text-sm leading-7 text-[#B0A99F]">
                        <li className="flex items-start gap-3">
                          <Check className="mt-1 h-4 w-4 text-[#E6B566]" />
                          Shared UI lives in `frontend/components` and route code lives in `frontend/app`.
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="mt-1 h-4 w-4 text-[#E6B566]" />
                          Hooks and API helpers sit in `frontend/hooks` and `frontend/lib`.
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="mt-1 h-4 w-4 text-[#E6B566]" />
                          The backend and database layers are optional locally, but the docs reflect their intended runtime role.
                        </li>
                      </ul>
                    </SpotlightCard>
                  </div>
                </div>
              </motion.section>

              <motion.section
                id="environment-variables"
                variants={itemVariants}
                className={cn(glassPanel, "p-6 sm:p-8 lg:p-10")}
              >
                <SectionHeader
                  eyebrow="Environment Variables"
                  title="Frontend runtime configuration"
                  body="These values are documented in `frontend/.env.example` and define the client-side runtime surface for auth, data access, and websocket overrides."
                />

                <div className="mt-8 grid gap-4 lg:grid-cols-3">
                  {envVars.map((item) => (
                    <SpotlightCard
                      key={item.name}
                      className="rounded-[1.5rem] bg-[rgba(19,19,20,0.82)]"
                      contentClassName="p-6"
                    >
                      <p className="font-mono text-sm text-[#E6B566]">{item.name}</p>
                      <p className="mt-4 text-sm leading-7 text-[#B0A99F]">
                        {item.detail}
                      </p>
                      <div className="mt-5 rounded-2xl border border-[#E6B566]/12 bg-[rgba(17,17,17,0.34)] px-4 py-3 font-mono text-xs leading-6 text-[#FBF6EE]">
                        {item.example}
                      </div>
                    </SpotlightCard>
                  ))}
                </div>
              </motion.section>
            </motion.div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
