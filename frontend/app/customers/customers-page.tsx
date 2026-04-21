"use client"

import { useMemo, useRef, useState } from "react"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import {
  Activity,
  ArrowRight,
  Bot,
  Clock3,
  Globe2,
  Radar,
  Route,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Waves,
} from "@/components/ui/phosphor-icons"
import Link from "next/link"
import { SiteHeader } from "@/components/landing/site-header"
import { SiteFooter } from "@/components/landing/site-footer"
import { GlowButton } from "@/components/ui/glow-button"
import { SplitTypewriter } from "@/components/ui/split-typewriter"

type Metric = {
  label: string
  agentic: number
  legacy: number
  suffix: string
  note: string
}

type Testimonial = {
  company: string
  role: string
  name: string
  quote: string
  stat: string
  detail: string
  accent: string
  size: string
}

const metrics: Metric[] = [
  {
    label: "Incident response",
    agentic: 11,
    legacy: 147,
    suffix: "min",
    note: "Median time from disruption detection to action recommendation.",
  },
  {
    label: "Autonomous reroute success",
    agentic: 94,
    legacy: 38,
    suffix: "%",
    note: "Shipments recovered without human escalation across active lanes.",
  },
  {
    label: "Prediction confidence",
    agentic: 91,
    legacy: 52,
    suffix: "%",
    note: "Confidence score on port congestion and customs volatility models.",
  },
  {
    label: "Cross-border visibility",
    agentic: 188,
    legacy: 67,
    suffix: "nodes",
    note: "Average facilities, ports, and partners mapped per customer network.",
  },
]

const partners = [
  "Astra Freight",
  "Helix Pharma",
  "Northline Cold Chain",
  "Vantage Ports",
  "Meridian Cargo",
  "Sovereign Trade",
  "BlueArc Logistics",
  "Vector Customs",
  "Luma Foods",
  "Atlas MedSupply",
]

const testimonials: Testimonial[] = [
  {
    company: "Helix Pharma",
    role: "VP, Global Logistics",
    name: "Maya Desai",
    quote:
      "R3FLEX turned our control tower into a decision engine. We stopped monitoring risk and started rerouting around it in real time.",
    stat: "37% fewer cold-chain write-offs",
    detail:
      "Recovered 22 temperature-sensitive shipments during two weather events in the same week.",
    accent: "from-primary/30 via-primary/10 to-transparent",
    size: "md:col-span-2 md:row-span-2",
  },
  {
    company: "Astra Freight",
    role: "Director, Network Operations",
    name: "Theo Nguyen",
    quote:
      "The War Room gave our planners one shared picture. Customs, carrier ops, and customer support finally act from the same timeline.",
    stat: "11-minute response time",
    detail: "Escalations now route with full audit context attached.",
    accent: "from-sky-400/15 via-primary/10 to-transparent",
    size: "md:col-span-1",
  },
  {
    company: "Northline Cold Chain",
    role: "Head of Resilience",
    name: "Sofia Alvarez",
    quote:
      "The spotlight view on alternate lanes let us reroute before the bottleneck even appeared on the carrier portal.",
    stat: "91% reroute confidence",
    detail:
      "Saved two priority biologics programs during a port labor slowdown.",
    accent: "from-emerald-400/15 via-primary/10 to-transparent",
    size: "md:col-span-1",
  },
  {
    company: "Meridian Cargo",
    role: "Chief Customer Officer",
    name: "Ethan Brooks",
    quote:
      "Our customers now see the recovery plan before they ask for it. That changed how they talk about our service quality.",
    stat: "4.8/5 service confidence",
    detail:
      "Proactive updates now flow from the same incident graph as ops.",
    accent: "from-fuchsia-400/15 via-primary/10 to-transparent",
    size: "md:col-span-1",
  },
  {
    company: "Vector Customs",
    role: "SVP, Trade Intelligence",
    name: "Lina Park",
    quote:
      "The best part is not the dashboard. It is the confidence to let the system move first when every minute counts.",
    stat: "3x faster clearance recovery",
    detail: "Autonomous playbooks now cover 18 high-risk corridors.",
    accent: "from-amber-300/15 via-primary/10 to-transparent",
    size: "md:col-span-2",
  },
]

function Reveal({
  children,
  delay = 0,
  y = 32,
  className,
}: {
  children: React.ReactNode
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

function ImpactField() {
  const { scrollYProgress } = useScroll()
  const rotate = useTransform(scrollYProgress, [0, 1], [-8, 14])
  const y = useTransform(scrollYProgress, [0, 1], [-40, 50])
  const scale = useTransform(scrollYProgress, [0, 1], [0.96, 1.08])

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        style={{ y, rotate, scale }}
        className="absolute top-[8%] right-[-12%] h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(228,87,46,0.25),rgba(228,87,46,0.08)_34%,transparent_70%)] blur-3xl"
      />
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [30, -60]) }}
        className="absolute left-[-8%] top-[22%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(61,71,81,0.5),rgba(17,17,17,0)_72%)] blur-3xl"
      />

      <div className="absolute inset-x-0 top-20 mx-auto h-[34rem] w-[34rem] rounded-full border border-white/8" />
      <div className="customers-orbit absolute inset-x-0 top-16 mx-auto h-[36rem] w-[36rem] rounded-full border border-primary/15 border-dashed" />
      <div className="customers-orbit-reverse absolute inset-x-0 top-24 mx-auto h-[28rem] w-[28rem] rounded-full border border-white/6 border-dashed" />

      <svg
        viewBox="0 0 900 900"
        className="absolute inset-x-0 top-8 mx-auto h-[42rem] w-[42rem] opacity-70"
      >
        <defs>
          <linearGradient id="impact-grid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(228,87,46,0.45)" />
            <stop offset="55%" stopColor="rgba(248,249,251,0.08)" />
            <stop offset="100%" stopColor="rgba(228,87,46,0.1)" />
          </linearGradient>
        </defs>
        <g stroke="url(#impact-grid)" fill="none">
          <circle cx="450" cy="450" r="160" strokeWidth="1" />
          <circle cx="450" cy="450" r="230" strokeWidth="1" />
          <circle cx="450" cy="450" r="300" strokeWidth="1" />
          <path d="M182 400C290 240 562 200 690 360" strokeWidth="1.4" />
          <path d="M210 560C332 632 554 650 702 520" strokeWidth="1.4" />
          <path d="M286 234C420 324 520 332 646 242" strokeWidth="0.9" />
          <path d="M262 668C370 578 532 562 666 646" strokeWidth="0.9" />
        </g>
        {[220, 318, 402, 514, 616, 700].map((x, index) => (
          <g key={x}>
            <circle
              cx={x}
              cy={index % 2 === 0 ? 350 : 548}
              r="5"
              fill="rgba(228,87,46,0.8)"
            />
            <circle
              cx={x}
              cy={index % 2 === 0 ? 350 : 548}
              r="18"
              className="customers-node-pulse"
              fill="rgba(228,87,46,0.12)"
              style={{ animationDelay: `${index * 0.5}s` }}
            />
          </g>
        ))}
      </svg>
    </div>
  )
}

function MetricRow({ metric, index }: { metric: Metric; index: number }) {
  const peak = useMemo(
    () =>
      Math.max(...metrics.map((item) => Math.max(item.agentic, item.legacy))),
    [],
  )
  const agenticWidth = `${(metric.agentic / peak) * 100}%`
  const legacyWidth = `${(metric.legacy / peak) * 100}%`

  return (
    <Reveal
      delay={0.08 * index}
      className="customers-glass customers-glass-hover rounded-3xl p-5"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">{metric.label}</p>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {metric.note}
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-geist text-[11px] tracking-[0.24em] text-primary uppercase">
          Signal {index + 1}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs tracking-[0.2em] text-muted-foreground uppercase">
            <span>Agentic War Room</span>
            <span className="text-primary">
              {metric.agentic}
              {metric.suffix}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/6">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: agenticWidth }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1, delay: 0.2 + index * 0.08 }}
              className="h-full rounded-full bg-[linear-gradient(90deg,rgba(228,87,46,0.45),rgba(228,87,46,1))] shadow-[0_0_22px_rgba(228,87,46,0.4)]"
            />
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-xs tracking-[0.2em] text-muted-foreground uppercase">
            <span>Traditional supply chain</span>
            <span>
              {metric.legacy}
              {metric.suffix}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/6">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: legacyWidth }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1, delay: 0.3 + index * 0.08 }}
              className="h-full rounded-full bg-[linear-gradient(90deg,rgba(248,249,251,0.12),rgba(248,249,251,0.35))]"
            />
          </div>
        </div>
      </div>
    </Reveal>
  )
}

function LiveChartPanel() {
  return (
    <Reveal delay={0.14} className="customers-glass rounded-[2rem] p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.22em] text-primary uppercase">
            The Global Impact View
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            Live network pressure.
          </h2>
        </div>
        <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-muted-foreground">
          Updated every 4s
        </div>
      </div>

      <div className="customers-grid relative overflow-hidden rounded-[1.5rem] border border-white/8 bg-black/25 p-5">
        <svg viewBox="0 0 520 240" className="h-56 w-full">
          <defs>
            <linearGradient id="agentic-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(228,87,46,0.2)" />
              <stop offset="100%" stopColor="rgba(228,87,46,1)" />
            </linearGradient>
            <linearGradient id="legacy-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(248,249,251,0.12)" />
              <stop offset="100%" stopColor="rgba(248,249,251,0.42)" />
            </linearGradient>
          </defs>

          {[40, 90, 140, 190].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="520"
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="4 8"
            />
          ))}

          <motion.path
            initial={{ pathLength: 0, opacity: 0.2 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            d="M8 190C58 166 118 74 178 82C238 90 282 158 334 150C386 142 428 72 512 34"
            fill="none"
            stroke="url(#agentic-line)"
            strokeWidth="4"
            strokeLinecap="round"
            filter="drop-shadow(0 0 12px rgba(228,87,46,0.45))"
          />
          <motion.path
            initial={{ pathLength: 0, opacity: 0.14 }}
            whileInView={{ pathLength: 1, opacity: 0.8 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.6, delay: 0.16, ease: "easeInOut" }}
            d="M8 198C70 194 122 182 172 170C222 158 274 154 324 132C374 110 430 100 512 92"
            fill="none"
            stroke="url(#legacy-line)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {[178, 334, 512].map((x, index) => (
            <g key={x}>
              <circle
                cx={x}
                cy={index === 0 ? 82 : index === 1 ? 150 : 34}
                r="5"
                fill="rgba(228,87,46,1)"
              />
              <circle
                cx={x}
                cy={index === 0 ? 82 : index === 1 ? 150 : 34}
                r="18"
                className="customers-node-pulse"
                fill="rgba(228,87,46,0.12)"
                style={{ animationDelay: `${index * 0.55}s` }}
              />
            </g>
          ))}
        </svg>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Route className="h-4 w-4 text-primary" />
              Agentic recovery lane
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Reroute execution climbs as pressure rises, keeping service levels
              above SLA thresholds.
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock3 className="h-4 w-4 text-primary" />
              Legacy response drift
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Traditional teams react after visibility degrades, creating a long
              tail of escalations and missed handoffs.
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  )
}

function PartnerMarquee() {
  const track = [...partners, ...partners]

  return (
    <section className="relative px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-8 flex items-center justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.22em] text-primary uppercase">
              Infinite Client Marquee
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
              Networks already running live.
            </h2>
          </div>
          <div className="hidden rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-muted-foreground md:block">
            Hover to surface the glow layer
          </div>
        </Reveal>

        <div className="customers-glass overflow-hidden rounded-[2rem] px-4 py-5 sm:px-6">
          <div className="customers-marquee-track flex w-max items-center gap-4">
            {track.map((partner, index) => (
              <div
                key={`${partner}-${index}`}
                className="customers-logo-chip group relative flex min-w-[12rem] items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 py-4 font-geist text-sm tracking-[0.18em] text-white/50 uppercase transition-all duration-300 hover:-translate-y-0.5 hover:text-foreground"
              >
                <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(228,87,46,0.18),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative">{partner}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function SpotlightCard({
  testimonial,
  index,
}: {
  testimonial: Testimonial
  index: number
}) {
  const [position, setPosition] = useState({ x: 120, y: 120, active: false })

  return (
    <Reveal delay={0.08 * index} className={testimonial.size}>
      <motion.article
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          setPosition({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            active: true,
          })
        }}
        onMouseLeave={() =>
          setPosition((current) => ({ ...current, active: false }))
        }
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3 }}
        className="customers-glass customers-glass-hover group relative h-full overflow-hidden rounded-[2rem] p-6 sm:p-7"
      >
        <motion.div
          aria-hidden
          animate={{ opacity: position.active ? 1 : 0 }}
          transition={{ duration: 0.22 }}
          className="pointer-events-none absolute inset-0 rounded-[2rem]"
          style={{
            background: `radial-gradient(320px circle at ${position.x}px ${position.y}px, rgba(228,87,46,0.18), transparent 60%)`,
          }}
        />
        <div
          aria-hidden
          className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${testimonial.accent} opacity-70`}
        />

        <div className="relative z-10 flex h-full flex-col">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.18em] text-primary uppercase">
                {testimonial.company}
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {testimonial.stat}
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-muted-foreground">
              Live case
            </div>
          </div>

          <blockquote className="flex-1 text-lg leading-relaxed text-foreground sm:text-xl">
            "{testimonial.quote}"
          </blockquote>

          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="font-medium text-foreground">{testimonial.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {testimonial.role}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {testimonial.detail}
            </p>
          </div>
        </div>
      </motion.article>
    </Reveal>
  )
}

function CustomersHero() {
  return (
    <section className="relative isolate min-h-screen overflow-hidden px-4 pt-36 pb-20 sm:px-6 lg:px-8">
      <ImpactField />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <Reveal className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs tracking-[0.2em] text-muted-foreground uppercase backdrop-blur-xl">
            <Radar className="h-3.5 w-3.5 text-primary" />
            Customers & Impact
          </Reveal>

          <Reveal delay={0.08} className="mt-6">
            <h1 className="max-w-4xl text-4xl font-semibold leading-[0.98] text-balance text-foreground sm:text-6xl xl:text-7xl">
              <SplitTypewriter
                line1="The Agentic Supply Chain"
                line2="War Room in production."
                line1ClassName="block text-foreground"
                line2ClassName="block text-primary"
              />
            </h1>
          </Reveal>

          <Reveal delay={0.14} className="mt-6 max-w-2xl">
            <p className="text-lg leading-relaxed text-muted-foreground text-pretty">
              One command surface for resilience teams that need to detect,
              simulate, reroute, and explain every cross-border decision before
              disruption reaches the warehouse floor.
            </p>
          </Reveal>

          <Reveal
            delay={0.2}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <GlowButton
              asChild
              label="See customer outcomes"
              variant="primary"
              className="group w-full sm:w-auto"
            >
              <a href="#war-room">
                See customer outcomes
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </GlowButton>
            <GlowButton
              asChild
              label="Explore the platform"
              variant="secondary"
              className="w-full sm:w-auto"
            >
              <Link href="/pricing">Explore the platform</Link>
            </GlowButton>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Activity,
                label: "War Room coverage",
                value: "190+ corridors",
              },
              {
                icon: Bot,
                label: "Autonomous actions",
                value: "14.2k / week",
              },
              {
                icon: ShieldCheck,
                label: "Audit-ready decisions",
                value: "100% traceable",
              },
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <Reveal key={item.label} delay={0.24 + index * 0.08}>
                  <div className="customers-glass customers-glass-hover rounded-[1.5rem] p-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Icon className="h-4 w-4" />
                      <span className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                        {item.label}
                      </span>
                    </div>
                    <p className="mt-4 text-xl font-semibold text-foreground">
                      {item.value}
                    </p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>

        <div className="space-y-5">
          <LiveChartPanel />
          <div className="grid gap-4 sm:grid-cols-2">
            {metrics.slice(0, 2).map((metric, index) => (
              <MetricRow key={metric.label} metric={metric} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function CustomersExperience() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <SiteHeader />

      <CustomersHero />

      <section className="relative px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 lg:grid-cols-[0.58fr_0.42fr]">
            <div className="grid gap-4">
              {metrics.slice(2).map((metric, index) => (
                <MetricRow
                  key={metric.label}
                  metric={metric}
                  index={index + 2}
                />
              ))}
            </div>

            <Reveal className="customers-glass rounded-[2rem] p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary">
                  <Globe2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs tracking-[0.2em] text-primary uppercase">
                    Global Impact View
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-foreground">
                    Network resilience delta
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    icon: TrendingUp,
                    title: "Service recovery",
                    body: "Teams restore customer promise windows before exception queues spike.",
                  },
                  {
                    icon: Waves,
                    title: "Pressure absorption",
                    body: "Alternate lanes are scored against customs, weather, and carrier volatility in one pass.",
                  },
                  {
                    icon: Sparkles,
                    title: "Operator confidence",
                    body: "Every autonomous move arrives with rationale, tradeoffs, and full audit metadata.",
                  },
                ].map((item) => {
                  const Icon = item.icon

                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className="font-medium text-foreground">
                          {item.title}
                        </p>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {item.body}
                      </p>
                    </div>
                  )
                })}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <PartnerMarquee />

      <section
        id="war-room"
        className="relative px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-10 max-w-3xl">
            <p className="text-xs tracking-[0.22em] text-primary uppercase">
              The "War Room" Testimonials
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-balance text-foreground sm:text-5xl">
              Customer stories arranged like a live operations board.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Every card below responds to the cursor with a soft magnetic
              spotlight, while staggered reveal timing keeps the page feeling
              measured, not noisy.
            </p>
          </Reveal>

          <div className="grid auto-rows-[minmax(18rem,1fr)] gap-4 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <SpotlightCard
                key={testimonial.company}
                testimonial={testimonial}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
