"use client"

import { motion, useMotionValue, useSpring } from "framer-motion"
import { useMemo, type MouseEvent } from "react"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import { HolographicCard } from "@/components/ui/holographic-card"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  Check,
  Clock3,
  DatabaseZap,
  Globe2,
  Network,
  Radar,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Workflow,
  Zap,
} from "@/components/ui/phosphor-icons"
import { cn } from "@/lib/utils"
import { StatusParallax } from "@/app/status/components/status-parallax"
import { StatusShineLink } from "@/app/status/components/status-shine-link"

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

const glassPanel =
  "relative overflow-hidden rounded-[1.9rem] border border-[#E6B566]/12 bg-[linear-gradient(180deg,rgba(11,11,12,0.96),rgba(19,19,20,0.95)_52%,rgba(28,20,17,0.88))] shadow-[0_28px_100px_rgba(0,0,0,0.58)] backdrop-blur-xl"

const heroStats = [
  {
    label: "Operator surface",
    value: "Ready",
    detail: "Next.js App Router workspace on port 3000",
    icon: Radar,
    glowColor: "rgba(194,24,7,0.24)",
    beamColor: "rgba(230,181,102,0.22)",
  },
  {
    label: "Decision core",
    value: "Standby",
    detail: "FastAPI orchestration and approval routing on port 8000",
    icon: BrainCircuit,
    glowColor: "rgba(90,15,46,0.28)",
    beamColor: "rgba(204,85,0,0.22)",
  },
  {
    label: "Signal feeds",
    value: "Fallback armed",
    detail: "News, NOAA, and port feeds can degrade to mock data safely",
    icon: Globe2,
    glowColor: "rgba(204,85,0,0.2)",
    beamColor: "rgba(230,181,102,0.2)",
  },
  {
    label: "Audit fabric",
    value: "Traceable",
    detail: "Redis + Postgres underpin queueing, state, and decision history",
    icon: DatabaseZap,
    glowColor: "rgba(90,15,46,0.24)",
    beamColor: "rgba(194,24,7,0.2)",
  },
] as const

const serviceCards = [
  {
    eyebrow: "Signal Watch",
    title: "Disruption intake stays close to the edge",
    body:
      "Live weather, geopolitical, and logistics signals are expected to reach the war room fast, with graceful fallback behavior when upstream APIs stall.",
    metrics: ["External feeds + mock backups", "Operator triage first", "Cold-start friendly"],
    icon: Activity,
    glowColor: "rgba(194,24,7,0.24)",
    beamColor: "rgba(230,181,102,0.2)",
  },
  {
    eyebrow: "Scenario Engine",
    title: "Simulation and tradeoff scoring stay in the loop",
    body:
      "The product brief centers on rapid scenario generation, confidence scoring, and route-level tradeoff comparisons before impact cascades downstream.",
    metrics: ["Digital-twin posture", "Confidence thresholding", "Second-order reasoning"],
    icon: Workflow,
    glowColor: "rgba(90,15,46,0.28)",
    beamColor: "rgba(204,85,0,0.22)",
  },
  {
    eyebrow: "Human Control",
    title: "Low-confidence decisions pause for approval",
    body:
      "R3FLEX keeps the execution layer fast without dropping traceability, routing novel or high-risk actions through an explicit human approval path.",
    metrics: ["Approval modal ready", "Kill switch posture", "Auditable escalation"],
    icon: ShieldCheck,
    glowColor: "rgba(204,85,0,0.2)",
    beamColor: "rgba(230,181,102,0.2)",
  },
] as const

const runtimeCards = [
  {
    title: "Frontend command deck",
    value: "pnpm dev / npm run dev",
    body: "The operator-facing application remains the primary touchpoint, with shared UI in `frontend/components` and routes in `frontend/app`.",
    icon: Sparkles,
  },
  {
    title: "Local service bring-up",
    value: "Docker + venv + migrations",
    body: "The backend stack expects Postgres and Redis containers first, then Python dependencies, Alembic migrations, and the FastAPI runtime.",
    icon: Zap,
  },
  {
    title: "Execution runtime",
    value: "REST + WebSocket",
    body: "Frontend and backend exchange disruption events, approvals, and execution traces over REST and WebSocket integration points.",
    icon: Network,
  },
] as const

const timeline = [
  {
    stamp: "Signal posture",
    title: "Fallback channels are part of the baseline",
    body:
      "The setup flow explicitly allows mock fallbacks for NOAA and News APIs, which means the war room can still demo, rehearse, and validate the execution loop under degraded conditions.",
    icon: Check,
  },
  {
    stamp: "Execution policy",
    title: "Confidence threshold remains the control boundary",
    body:
      "The PRD keeps the moat on autonomous execution above threshold and human approvals below threshold, so the status surface highlights trust and escalation rather than vanity uptime.",
    icon: TrendingUp,
  },
  {
    stamp: "Runtime readiness",
    title: "Frontend, API, Redis, and Postgres form the core stack",
    body:
      "SETUP.md anchors the bring-up path around ports 3000, 8000, 5432, and 6379, which defines the main operational map for this status experience.",
    icon: Clock3,
  },
] as const

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
      <p className="text-xs font-geist uppercase tracking-[0.3em] text-[#E6B566]">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#FBF6EE] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-8 text-[#B0A99F] sm:text-lg">
        {body}
      </p>
    </div>
  )
}

function StatusChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#E6B566]/14 bg-[rgba(90,15,46,0.18)] px-3 py-1.5 text-xs font-medium tracking-[0.16em] text-[#B0A99F] uppercase">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inset-0 rounded-full bg-[#E6B566] opacity-70 blur-[2px]" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#E6B566]" />
      </span>
      {label}
    </span>
  )
}

export function StatusPage() {
  const glowX = useMotionValue(240)
  const glowY = useMotionValue(180)
  const springX = useSpring(glowX, { stiffness: 170, damping: 25, mass: 0.75 })
  const springY = useSpring(glowY, { stiffness: 170, damping: 25, mass: 0.75 })

  const heroMetrics = useMemo(
    () => [
      "Execution-first disruption response",
      "Confidence-aware approvals",
      "Traceable audit chain",
    ],
    [],
  )

  function handleHeroMove(event: MouseEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    glowX.set(event.clientX - bounds.left)
    glowY.set(event.clientY - bounds.top)
  }

  function handleHeroLeave() {
    glowX.set(240)
    glowY.set(180)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080808] text-[#FBF6EE]">
      <StatusParallax />
      <SiteHeader />

      <main className="relative z-10 pb-24 pt-28">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.section
              variants={fadeUp}
              onMouseMove={handleHeroMove}
              onMouseLeave={handleHeroLeave}
              className={cn(glassPanel, "p-6 sm:p-8 lg:p-10")}
            >
              <motion.div
                style={{ left: springX, top: springY }}
                className="pointer-events-none absolute h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(230,181,102,0.16),rgba(194,24,7,0.08)_34%,transparent_74%)] blur-3xl"
              />
              <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.16fr)_minmax(380px,0.84fr)] xl:items-end">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#E6B566]/16 bg-[rgba(90,15,46,0.26)] px-4 py-2 text-xs font-geist uppercase tracking-[0.26em] text-[#E6B566]">
                    <Activity className="h-4 w-4 text-[#E6B566]" />
                    Agentic Supply Chain War Room
                  </div>
                  <h1 className="mt-6 max-w-5xl text-4xl font-semibold tracking-tight text-[#FBF6EE] sm:text-5xl lg:text-6xl">
                    R3FLEX platform status
                  </h1>
                  <p className="mt-5 max-w-3xl text-base leading-8 text-[#B0A99F] sm:text-lg">
                    A premium operations surface for the current R3FLEX stack: frontend readiness, backend execution posture, fallback coverage, and audit-oriented control paths distilled from the repository architecture and setup flow.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {heroMetrics.map((metric) => (
                      <StatusChip key={metric} label={metric} />
                    ))}
                  </div>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <StatusShineLink
                      href="/docs"
                      className="border-[#E6B566]/32 bg-[rgba(230,181,102,0.92)] text-[#140d09] shadow-[0_12px_34px_rgba(230,181,102,0.18)]"
                      contentClassName="px-5 py-3 text-sm font-semibold"
                    >
                      Open docs
                      <ArrowRight className="h-4 w-4 text-[#140d09]" />
                    </StatusShineLink>
                    <StatusShineLink
                      href="#runtime-posture"
                      className="border-[#E6B566]/18 bg-[linear-gradient(135deg,rgba(90,15,46,0.36),rgba(204,85,0,0.12))] text-[#FBF6EE] shadow-[0_10px_28px_rgba(0,0,0,0.28)]"
                      contentClassName="px-5 py-3 text-sm font-medium"
                    >
                      Runtime posture
                      <Workflow className="h-4 w-4 text-[#E6B566]" />
                    </StatusShineLink>
                  </div>
                </div>

                <HolographicCard
                  className="rounded-[1.7rem] bg-[linear-gradient(180deg,rgba(18,18,19,0.92),rgba(35,24,22,0.82))]"
                  contentClassName="p-6"
                  glowColor="rgba(230,181,102,0.18)"
                  beamColor="rgba(194,24,7,0.24)"
                >
                  <p className="text-xs font-geist uppercase tracking-[0.28em] text-[#E6B566]">
                    War room posture
                  </p>
                  <div className="mt-5 space-y-4">
                    <div className="flex items-start justify-between gap-4 rounded-[1.25rem] border border-[#E6B566]/10 bg-[rgba(11,11,12,0.42)] px-4 py-4">
                      <div>
                        <p className="text-sm text-[#8E8E8E]">Current surface</p>
                        <p className="mt-2 text-2xl font-semibold text-[#FBF6EE]">
                          Architecture-informed
                        </p>
                      </div>
                      <AlertTriangle className="h-6 w-6 text-[#E6B566]" />
                    </div>
                    <ul className="space-y-3 text-sm leading-7 text-[#B0A99F]">
                      <li className="flex items-start gap-3">
                        <Check className="mt-1 h-4 w-4 text-[#E6B566]" />
                        Built from `README.md`, `prd.md`, and `SETUP.md` so the page reflects the current repo contract.
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="mt-1 h-4 w-4 text-[#E6B566]" />
                        Highlights the execution loop rather than pretending to be wired to live health telemetry.
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="mt-1 h-4 w-4 text-[#E6B566]" />
                        Emphasizes readiness, fallback behavior, and trust boundaries across the stack.
                      </li>
                    </ul>
                  </div>
                </HolographicCard>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {heroStats.map((item) => {
                  const Icon = item.icon
                  return (
                    <HolographicCard
                      key={item.label}
                      className="rounded-[1.45rem] bg-[linear-gradient(180deg,rgba(16,16,17,0.92),rgba(33,23,19,0.84))]"
                      contentClassName="p-5"
                      glowColor={item.glowColor}
                      beamColor={item.beamColor}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E6B566]/18 bg-[rgba(90,15,46,0.24)]">
                          <Icon className="h-5 w-5 text-[#E6B566]" />
                        </div>
                        <span className="rounded-full border border-[#E6B566]/14 bg-[rgba(17,17,17,0.42)] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#8E8E8E]">
                          {item.label}
                        </span>
                      </div>
                      <p className="mt-5 text-2xl font-semibold tracking-tight text-[#FBF6EE]">
                        {item.value}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[#B0A99F]">
                        {item.detail}
                      </p>
                    </HolographicCard>
                  )
                })}
              </div>
            </motion.section>

            <motion.section
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className={cn(glassPanel, "p-6 sm:p-8 lg:p-10")}
            >
              <SectionHeader
                eyebrow="Operational Layers"
                title="The stack is monitored like an execution system, not a marketing site"
                body="Each layer below maps directly to the operating principles in the repo: detect disruptions, simulate options, route the edge cases for approval, and preserve an auditable trail of action."
              />

              <div className="mt-8 grid gap-5 xl:grid-cols-3">
                {serviceCards.map((item) => {
                  const Icon = item.icon

                  return (
                    <HolographicCard
                      key={item.title}
                      className="rounded-[1.6rem] bg-[linear-gradient(180deg,rgba(15,15,16,0.94),rgba(31,22,20,0.86))]"
                      contentClassName="flex h-full flex-col p-6"
                      glowColor={item.glowColor}
                      beamColor={item.beamColor}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E6B566]/18 bg-[rgba(90,15,46,0.22)]">
                        <Icon className="h-5 w-5 text-[#E6B566]" />
                      </div>
                      <p className="mt-5 text-xs font-geist uppercase tracking-[0.28em] text-[#E6B566]">
                        {item.eyebrow}
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[#FBF6EE]">
                        {item.title}
                      </h3>
                      <p className="mt-4 flex-1 text-sm leading-7 text-[#B0A99F]">
                        {item.body}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {item.metrics.map((metric) => (
                          <span
                            key={metric}
                            className="rounded-full border border-[#E6B566]/12 bg-[rgba(17,17,17,0.38)] px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-[#8E8E8E]"
                          >
                            {metric}
                          </span>
                        ))}
                      </div>
                    </HolographicCard>
                  )
                })}
              </div>
            </motion.section>

            <motion.section
              id="runtime-posture"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className={cn(glassPanel, "p-6 sm:p-8 lg:p-10")}
            >
              <SectionHeader
                eyebrow="Runtime Posture"
                title="Bring-up expectations are visible to operators and engineers"
                body="The status view stays grounded in the local stack path from SETUP.md, showing how the frontend, backend, and state services line up when the war room is brought online."
              />

              <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                <div className="grid gap-5">
                  {runtimeCards.map((item, index) => {
                    const Icon = item.icon

                    return (
                      <HolographicCard
                        key={item.title}
                        className="rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(14,14,15,0.93),rgba(27,20,18,0.84))]"
                        contentClassName="p-6"
                        glowColor={
                          index === 0
                            ? "rgba(90,15,46,0.28)"
                            : index === 1
                              ? "rgba(194,24,7,0.24)"
                              : "rgba(204,85,0,0.18)"
                        }
                        beamColor="rgba(230,181,102,0.22)"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-geist uppercase tracking-[0.28em] text-[#E6B566]">
                              {item.title}
                            </p>
                            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[#FBF6EE]">
                              {item.value}
                            </h3>
                          </div>
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E6B566]/18 bg-[rgba(90,15,46,0.22)]">
                            <Icon className="h-5 w-5 text-[#E6B566]" />
                          </div>
                        </div>
                        <p className="mt-4 text-sm leading-7 text-[#B0A99F]">
                          {item.body}
                        </p>
                      </HolographicCard>
                    )
                  })}
                </div>

                <HolographicCard
                  className="rounded-[1.7rem] bg-[linear-gradient(180deg,rgba(18,18,19,0.94),rgba(34,24,22,0.86))]"
                  contentClassName="p-6"
                  glowColor="rgba(194,24,7,0.2)"
                  beamColor="rgba(230,181,102,0.24)"
                >
                  <p className="text-xs font-geist uppercase tracking-[0.28em] text-[#E6B566]">
                    Port map
                  </p>
                  <div className="mt-5 space-y-4 rounded-[1.35rem] border border-[#E6B566]/12 bg-[rgba(10,10,10,0.42)] p-5 font-mono text-sm leading-7">
                    <div className="flex items-center justify-between gap-4 text-[#B0A99F]">
                      <span>Frontend</span>
                      <span className="text-[#FBF6EE]">:3000</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-[#B0A99F]">
                      <span>Backend API</span>
                      <span className="text-[#FBF6EE]">:8000</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-[#B0A99F]">
                      <span>Postgres</span>
                      <span className="text-[#FBF6EE]">:5432</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-[#B0A99F]">
                      <span>Redis</span>
                      <span className="text-[#FBF6EE]">:6379</span>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[1.35rem] border border-[#E6B566]/12 bg-[rgba(17,17,17,0.42)] p-5">
                    <p className="text-sm leading-7 text-[#B0A99F]">
                      This page deliberately leans on readiness language rather than synthetic uptime numbers, because the repo defines the system contract but does not expose live monitoring feeds in this workspace.
                    </p>
                  </div>
                </HolographicCard>
              </div>
            </motion.section>

            <motion.section
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className={cn(glassPanel, "p-6 sm:p-8 lg:p-10")}
            >
              <SectionHeader
                eyebrow="Control Notes"
                title="Recent operational cues and resilience assumptions"
                body="These notes convert the PRD and setup guidance into a status narrative: where the product is resilient by design, where it pauses for approvals, and how the local stack expects to recover."
              />

              <div className="mt-8 grid gap-5 xl:grid-cols-3">
                {timeline.map((item, index) => {
                  const Icon = item.icon

                  return (
                    <HolographicCard
                      key={item.title}
                      className="rounded-[1.55rem] bg-[linear-gradient(180deg,rgba(14,14,15,0.94),rgba(30,21,19,0.84))]"
                      contentClassName="p-6"
                      glowColor={
                        index === 0
                          ? "rgba(204,85,0,0.18)"
                          : index === 1
                            ? "rgba(90,15,46,0.28)"
                            : "rgba(194,24,7,0.22)"
                      }
                      beamColor="rgba(230,181,102,0.22)"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-xs font-geist uppercase tracking-[0.28em] text-[#E6B566]">
                          {item.stamp}
                        </p>
                        <Icon className="h-5 w-5 text-[#E6B566]" />
                      </div>
                      <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[#FBF6EE]">
                        {item.title}
                      </h3>
                      <p className="mt-4 text-sm leading-7 text-[#B0A99F]">
                        {item.body}
                      </p>
                    </HolographicCard>
                  )
                })}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <StatusShineLink
                  href="/docs"
                  className="border-[#E6B566]/18 bg-[linear-gradient(135deg,rgba(90,15,46,0.34),rgba(194,24,7,0.12))] text-[#FBF6EE]"
                  contentClassName="px-5 py-3 text-sm font-medium"
                >
                  Documentation
                  <ArrowRight className="h-4 w-4 text-[#E6B566]" />
                </StatusShineLink>
                <StatusShineLink
                  href="/pricing"
                  className="border-[#E6B566]/18 bg-[linear-gradient(135deg,rgba(17,17,17,0.72),rgba(204,85,0,0.08))] text-[#FBF6EE]"
                  contentClassName="px-5 py-3 text-sm font-medium"
                >
                  View plans
                  <ArrowRight className="h-4 w-4 text-[#E6B566]" />
                </StatusShineLink>
              </div>
            </motion.section>
          </motion.div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
