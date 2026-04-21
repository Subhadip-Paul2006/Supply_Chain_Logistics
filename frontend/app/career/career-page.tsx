"use client"

import { useMemo, useRef, useState, type ReactNode } from "react"
import { motion, useInView } from "framer-motion"
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Building2,
  ChevronDown,
  Code2,
  DatabaseZap,
  Map,
  Orbit,
  Radar,
  Rocket,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "@/components/ui/phosphor-icons"
import Link from "next/link"
import { SiteHeader } from "@/components/landing/site-header"
import { SiteFooter } from "@/components/landing/site-footer"
import { GlowButton } from "@/components/ui/glow-button"
import { SplitTypewriter } from "@/components/ui/split-typewriter"

type ValueCard = {
  title: string
  body: string
  icon: React.ComponentType<{ className?: string }>
}

type Role = {
  title: string
  mode: "Remote" | "Hybrid" | "On-Site"
  location: string
  summary: string
  details: string[]
}

type Department = {
  title: string
  label: string
  roles: Role[]
}

const values: ValueCard[] = [
  {
    title: "Agentic Thinking",
    body: "We design systems that act with context, not dashboards that just observe. Every hire is expected to think in loops, tools, and autonomous outcomes.",
    icon: BrainCircuit,
  },
  {
    title: "Ship Fast",
    body: "We value engineers who move from idea to production quickly, with enough rigor to make speed compound instead of backfire.",
    icon: Rocket,
  },
  {
    title: "Data-Driven",
    body: "Every customer-facing decision should be legible in the telemetry. We instrument relentlessly and let the evidence sharpen the product.",
    icon: DatabaseZap,
  },
  {
    title: "War Room Ownership",
    body: "We hire operators who stay calm under pressure, make the hard call, and leave an explainable trail behind every change.",
    icon: ShieldCheck,
  },
]

const departments: Department[] = [
  {
    title: "AI / ML",
    label: "Models, agents, simulation",
    roles: [
      {
        title: "Applied AI Engineer",
        mode: "Remote",
        location: "US / EU overlap",
        summary:
          "Build decision-making agents that reason across logistics events, trade constraints, and customer workflows.",
        details: [
          "Own agent evaluation loops and intervention policies.",
          "Prototype retrieval, planning, and simulation systems with product engineers.",
          "Turn real operational edge cases into safer autonomous playbooks.",
        ],
      },
      {
        title: "ML Systems Engineer",
        mode: "Hybrid",
        location: "Bangalore / Remote",
        summary:
          "Design the model-serving and scoring pipelines that keep the War Room responsive under live event load.",
        details: [
          "Build low-latency inference and feature pipelines for time-critical predictions.",
          "Partner with platform teams on observability, cost, and resilience.",
          "Operationalize evaluation data from customer incidents into model improvements.",
        ],
      },
    ],
  },
  {
    title: "Engineering",
    label: "Frontend, backend, platform",
    roles: [
      {
        title: "Senior Frontend Engineer",
        mode: "Remote",
        location: "Global",
        summary:
          "Craft operator-grade interfaces that feel cinematic at a glance and frictionless at decision time.",
        details: [
          "Build dense, beautiful React surfaces for live incident response.",
          "Translate telemetry, maps, and automation state into calm UI systems.",
          "Collaborate closely with product and AI teams on new workflows.",
        ],
      },
      {
        title: "Backend Platform Engineer",
        mode: "Hybrid",
        location: "Bangalore",
        summary:
          "Own the event backbone powering ingestion, orchestration, and cross-border resilience automations.",
        details: [
          "Scale APIs and workflow services that coordinate agent actions.",
          "Design systems for replayability, traceability, and low-latency fanout.",
          "Work across Kotlin, TypeScript, and infra tooling with a product-first mindset.",
        ],
      },
      {
        title: "Developer Experience Engineer",
        mode: "On-Site",
        location: "War Room HQ",
        summary:
          "Make the product team faster by tightening internal tools, release quality, and the engineering feedback loop.",
        details: [
          "Improve local dev, test pipelines, and deployment confidence.",
          "Build tools that keep experimentation fast without sacrificing reliability.",
          "Create the ergonomics that let engineering scale without slowing down.",
        ],
      },
    ],
  },
  {
    title: "Product",
    label: "Operator workflows, systems design",
    roles: [
      {
        title: "Product Designer, Systems",
        mode: "Remote",
        location: "India / Europe",
        summary:
          "Design decision surfaces for resilience teams who live in ambiguity, time pressure, and incomplete data.",
        details: [
          "Lead information architecture for the War Room and incident flows.",
          "Prototype high-trust motion and glassmorphism interfaces for technical users.",
          "Work directly with engineers to shape shipped interactions, not static mockups.",
        ],
      },
      {
        title: "Product Manager, Autonomy",
        mode: "Hybrid",
        location: "Bangalore / Remote",
        summary:
          "Own the roadmap for where human operators hand off to agents, and how trust is earned in that boundary.",
        details: [
          "Define autonomy thresholds, review flows, and success metrics.",
          "Prioritize features from customer ops pain, not abstract roadmaps.",
          "Work daily with engineering and customers on rollout quality.",
        ],
      },
    ],
  },
]

const stack = [
  "Next.js",
  "React",
  "Framer Motion",
  "Kotlin",
  "TypeScript",
  "Agent Tools",
  "LangGraph",
  "Postgres",
  "OpenTelemetry",
  "Vector Search",
]

function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function ModeBadge({ mode }: { mode: Role["mode"] }) {
  const classes =
    mode === "Remote"
      ? "text-emerald-300 border-emerald-300/20 bg-emerald-300/10"
      : mode === "Hybrid"
        ? "text-primary border-primary/20 bg-primary/10"
        : "text-sky-300 border-sky-300/20 bg-sky-300/10"

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] tracking-[0.18em] uppercase ${classes}`}
    >
      {mode}
    </span>
  )
}

function RoleRow({
  role,
  defaultOpen = false,
  delay = 0,
}: {
  role: Role
  defaultOpen?: boolean
  delay?: number
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Reveal delay={delay}>
      <motion.button
        type="button"
        onClick={() => setOpen((current) => !current)}
        whileHover={{ y: -2 }}
        className="career-bar group w-full overflow-hidden rounded-[1.7rem] p-[1px] text-left"
      >
        <div className="career-bar-inner rounded-[calc(1.7rem-1px)] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground sm:text-xl">
                  {role.title}
                </h3>
                <ModeBadge mode={role.mode} />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {role.summary}
              </p>
            </div>

            <div className="flex items-center gap-4 sm:shrink-0">
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground">
                {role.location}
              </div>
              <motion.div
                animate={{ rotate: open ? 90 : 0, x: open ? 4 : 0 }}
                transition={{ duration: 0.24 }}
                className="text-muted-foreground transition-colors duration-300 group-hover:text-primary"
              >
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={false}
            animate={{
              height: open ? "auto" : 0,
              opacity: open ? 1 : 0,
              marginTop: open ? 20 : 0,
            }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="grid gap-3 border-t border-white/8 pt-5 text-sm text-muted-foreground sm:grid-cols-3">
              {role.details.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                >
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.button>
    </Reveal>
  )
}

function HeroBlob() {
  const [pointer, setPointer] = useState({ x: 50, y: 38 })

  return (
    <div
      className="relative overflow-hidden rounded-[2.4rem] border border-white/8 bg-black/20"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        setPointer({
          x: ((event.clientX - rect.left) / rect.width) * 100,
          y: ((event.clientY - rect.top) / rect.height) * 100,
        })
      }}
    >
      <div aria-hidden className="career-grid absolute inset-0" />
      <motion.div
        aria-hidden
        animate={{
          background: `radial-gradient(38rem circle at ${pointer.x}% ${pointer.y}%, rgba(228,87,46,0.28), rgba(228,87,46,0.08) 28%, transparent 65%)`,
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="absolute inset-0"
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, 30, -20, 0], y: [0, -20, 22, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[8%] top-[12%] h-64 w-64 rounded-full bg-primary/18 blur-3xl"
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, -26, 18, 0], y: [0, 24, -18, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[12%] bottom-[8%] h-72 w-72 rounded-full bg-white/10 blur-3xl"
      />

      <div className="relative grid gap-10 px-6 py-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-12 lg:py-20">
        <div>
          <Reveal className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs tracking-[0.2em] text-muted-foreground uppercase backdrop-blur-xl">
            <Radar className="h-3.5 w-3.5 text-primary" />
            Join the War Room
          </Reveal>

          <Reveal delay={0.08} className="mt-6">
            <h1 className="max-w-4xl text-4xl font-semibold leading-[0.95] text-balance text-foreground sm:text-6xl xl:text-7xl">
              <SplitTypewriter
                line1="Build the future of"
                line2="agentic supply chains."
                line1ClassName="block text-foreground"
                line2ClassName="block text-primary"
              />
            </h1>
          </Reveal>

          <Reveal delay={0.14} className="mt-6 max-w-2xl">
            <p className="text-lg leading-relaxed text-muted-foreground text-pretty">
              We are hiring AI specialists, frontend engineers, backend
              builders, and product operators who want to turn global logistics
              software into a real-time decision engine.
            </p>
          </Reveal>

          <Reveal
            delay={0.2}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <GlowButton
              asChild
              label="See open positions"
              variant="primary"
              className="group w-full sm:w-auto"
            >
              <a href="#positions">
                See open positions
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </GlowButton>
            <GlowButton
              asChild
              label="Explore our platform"
              variant="secondary"
              className="w-full sm:w-auto"
            >
              <Link href="/customers">Explore our platform</Link>
            </GlowButton>
          </Reveal>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: Orbit,
              title: "Operator-grade autonomy",
              body: "Ship software that thinks in scenarios, thresholds, and interventions.",
            },
            {
              icon: Workflow,
              title: "High-trust systems",
              body: "Design experiences where every automated move is inspectable and explainable.",
            },
            {
              icon: Map,
              title: "Global scale",
              body: "Work on software that touches ports, customs, carriers, and warehouses at once.",
            },
            {
              icon: Building2,
              title: "War Room cadence",
              body: "Tight loops, strong ownership, and fast feedback from real operators.",
            },
          ].map((item, index) => {
            const Icon = item.icon
            return (
              <Reveal key={item.title} delay={0.16 + index * 0.08}>
                <div className="career-glass rounded-[1.6rem] p-5">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/12 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="font-medium text-foreground">{item.title}</p>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function CareerExperience() {
  const stackTrack = useMemo(() => [...stack, ...stack], [])

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div aria-hidden className="career-matrix fixed inset-0 -z-10" />
      <SiteHeader />

      <section className="relative px-4 pt-34 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <HeroBlob />
        </div>
      </section>

      <section className="relative px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-10 max-w-3xl">
            <p className="text-xs tracking-[0.22em] text-primary uppercase">
              Core values
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-balance text-foreground sm:text-5xl">
              Engineering culture for people who like building under pressure.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              We want curious builders who move fast, think clearly, and care
              about the operational consequences of every product decision.
            </p>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {values.map((value, index) => {
              const Icon = value.icon

              return (
                <Reveal key={value.title} delay={0.08 * index}>
                  <motion.article
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="career-value group relative overflow-hidden rounded-[2rem] p-[1px]"
                  >
                    <div className="career-value-inner rounded-[calc(2rem-1px)] px-5 py-6">
                      <div className="mb-5 flex items-center gap-3">
                        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/12 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {value.title}
                        </h3>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {value.body}
                      </p>
                    </div>
                  </motion.article>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <section
        id="positions"
        className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-10 max-w-3xl">
            <p className="text-xs tracking-[0.22em] text-primary uppercase">
              The War Room positions
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-balance text-foreground sm:text-5xl">
              Open roles grouped like a live engineering command board.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Every row is a frosted-glass role bar with location badges and a
              hover-reactive arrow. Expand a row to see what the team actually
              needs from the role.
            </p>
          </Reveal>

          <div className="space-y-10">
            {departments.map((department, departmentIndex) => (
              <section key={department.title}>
                <Reveal delay={departmentIndex * 0.08} className="mb-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs tracking-[0.2em] text-primary uppercase">
                        {department.label}
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
                        {department.title}
                      </h3>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-muted-foreground">
                      {department.roles.length} openings
                    </div>
                  </div>
                </Reveal>

                <div className="space-y-3">
                  {department.roles.map((role, index) => (
                    <RoleRow
                      key={role.title}
                      role={role}
                      defaultOpen={departmentIndex === 0 && index === 0}
                      delay={0.06 * index}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-8">
            <p className="text-xs tracking-[0.22em] text-primary uppercase">
              Tech stack marquee
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
              Tools we like to move with.
            </h2>
          </Reveal>

          <div className="career-glass overflow-hidden rounded-[2rem] px-4 py-5 sm:px-6">
            <div className="career-marquee-track flex w-max items-center gap-4">
              {stackTrack.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="career-stack-pill group rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 font-geist text-sm tracking-[0.18em] text-white/45 uppercase transition-all duration-300 hover:-translate-y-0.5 hover:text-primary"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-4 pt-8 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Reveal className="career-glass rounded-[2.2rem] px-6 py-10 text-center sm:px-10">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs tracking-[0.2em] text-muted-foreground uppercase backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Build with us
            </div>
            <h2 className="mt-5 text-3xl font-semibold text-balance text-foreground sm:text-5xl">
              If you like high-trust systems and real-world complexity, we
              should talk.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              We are building for operators who do not get to pause the world.
              That means the bar is high, the loops are fast, and the work
              matters every day.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <GlowButton
                asChild
                label="View roles again"
                variant="primary"
                className="group w-full sm:w-auto"
              >
                <a href="#positions">
                  View roles again
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </GlowButton>
              <GlowButton
                asChild
                label="See customer impact"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                <Link href="/customers">See customer impact</Link>
              </GlowButton>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
