"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { Bot, Radar, ShieldCheck, Zap } from "lucide-react"
import { TypedText } from "./typed-text"

type Metric = {
  label: string
  nexusguard: number
  competitor: number
  unit: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  competitorLabel: string
}

const metrics: Metric[] = [
  {
    label: "Autonomous Resolution",
    nexusguard: 86,
    competitor: 24,
    unit: "%",
    description:
      "Disruptions resolved by agents without human intervention. Legacy tools stop at dashboards.",
    competitorLabel: "Legacy TMS / SCRM",
    icon: Bot,
  },
  {
    label: "Signal Coverage",
    nexusguard: 94,
    competitor: 41,
    unit: "%",
    description:
      "Percentage of global disruption signals ingested - customs, weather, geopolitical, supplier.",
    competitorLabel: "Single-source platforms",
    icon: Radar,
  },
  {
    label: "Time-to-Reroute",
    nexusguard: 92,
    competitor: 33,
    unit: "%",
    description:
      "How quickly a viable alternate route is executed after a disruption fires. Higher is faster.",
    competitorLabel: "Manual workflows",
    icon: Zap,
  },
  {
    label: "Audit-Grade Traceability",
    nexusguard: 100,
    competitor: 58,
    unit: "%",
    description:
      "Every agent decision is logged, explainable, and exportable for customs and compliance.",
    competitorLabel: "Black-box AI tools",
    icon: ShieldCheck,
  },
]

function ComparisonDonut({
  value,
  competitor,
}: {
  value: number
  competitor: number
}) {
  const data = [
    { name: "NexusGuard", value },
    { name: "gap", value: 100 - value },
  ]
  const competitorData = [
    { name: "Competitor", value: competitor },
    { name: "gap", value: 100 - competitor },
  ]

  return (
    <div className="relative h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={competitorData}
            dataKey="value"
            innerRadius={60}
            outerRadius={72}
            startAngle={90}
            endAngle={-270}
            stroke="none"
            isAnimationActive
            animationDuration={1400}
            animationBegin={200}
          >
            <Cell fill="var(--foreground)" fillOpacity={0.35} />
            <Cell fill="var(--foreground)" fillOpacity={0.05} />
          </Pie>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={38}
            outerRadius={54}
            startAngle={90}
            endAngle={-270}
            stroke="none"
            isAnimationActive
            animationDuration={1600}
          >
            <Cell fill="var(--primary)" />
            <Cell fill="var(--primary)" fillOpacity={0.08} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tracking-tight text-foreground">
          {value}
          <span className="text-primary">%</span>
        </span>
        <span className="mt-0.5 text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
          NexusGuard
        </span>
      </div>
    </div>
  )
}

function LegendBar({
  label,
  value,
  accent = false,
}: {
  label: string
  value: number
  accent?: boolean
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className={accent ? "font-semibold text-foreground" : "text-muted-foreground"}>
          {label}
        </span>
        <span className={accent ? "font-semibold text-primary" : "text-muted-foreground"}>
          {value}%
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-foreground/8">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className={accent ? "h-full rounded-full bg-primary" : "h-full rounded-full bg-foreground/40"}
        />
      </div>
    </div>
  )
}

export function GlobeComparison() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  const headingY = useTransform(scrollYProgress, [0, 1], [40, -40])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-28 sm:py-40"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in oklab, var(--primary) 8%, transparent) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          style={{ y: headingY }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-xs font-medium tracking-[0.22em] text-primary uppercase"
          >
            NexusGuard vs. the field
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mt-4 text-3xl font-bold text-balance text-foreground sm:text-5xl"
          >
            Every signal. Every border.{" "}
            <TypedText
              className="text-primary"
              strings={["Every outcome."]}
              typeSpeed={55}
            />
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg"
          >
            Legacy supply chain tools surface alerts. NexusGuard executes. The
            benchmarks below compare our execution-native agentic platform
            against the best-in-class incumbent for each category.
          </motion.p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2">
          {metrics.map((metric, index) => {
            const Icon = metric.icon

            return (
              <motion.article
                key={metric.label}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                whileHover={{ y: -6 }}
                className="liquid-glass liquid-glass-hover group relative rounded-2xl p-6 transition-[border-color,box-shadow,transform] duration-300 sm:p-8"
              >
                <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div className="shrink-0 sm:w-[180px]">
                    <ComparisonDonut
                      value={metric.nexusguard}
                      competitor={metric.competitor}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <h3 className="text-base leading-tight font-semibold text-foreground sm:text-lg">
                          {metric.label}
                        </h3>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {metric.description}
                    </p>

                    <div className="mt-5 space-y-2.5">
                      <LegendBar
                        label="NexusGuard"
                        value={metric.nexusguard}
                        accent
                      />
                      <LegendBar
                        label={metric.competitorLabel}
                        value={metric.competitor}
                      />
                    </div>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
