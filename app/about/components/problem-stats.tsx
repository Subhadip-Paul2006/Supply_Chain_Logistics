"use client"

import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion"
import { useEffect, useRef } from "react"
import {
  AlertTriangle,
  DollarSign,
  Flame,
  ShieldAlert,
  TrendingDown,
} from "lucide-react"
import { TypedText } from "./typed-text"

type Stat = {
  value: number
  suffix: string
  prefix?: string
  decimals?: number
  label: string
  source: string
  icon: React.ComponentType<{ className?: string }>
}

const stats: Stat[] = [
  {
    value: 70,
    suffix: "%",
    label: "of companies experienced major disruptions in the last 5 years",
    source: "BCI Annual Report",
    icon: AlertTriangle,
  },
  {
    value: 1.6,
    prefix: "$",
    suffix: "T+",
    decimals: 1,
    label: "lost globally per year to supply chain failures",
    source: "Global estimate",
    icon: DollarSign,
  },
  {
    value: 78,
    suffix: "%",
    label: "of leaders expect disruptions to intensify - only 25% feel prepared",
    source: "Dataiku, 2026",
    icon: TrendingDown,
  },
  {
    value: 6,
    suffix: "th yr",
    label: "Factory fires are the #1 disruption for the sixth consecutive year",
    source: "Resilinc, 2025",
    icon: Flame,
  },
  {
    value: 83,
    suffix: "%",
    label: "of US Customs shipments denied YTD 2025 - $55M+ in value",
    source: "US Customs",
    icon: ShieldAlert,
  },
  {
    value: 106,
    prefix: "$",
    suffix: "T",
    label: "global infrastructure investment gap through 2040",
    source: "Infrastructure forecast",
    icon: TrendingDown,
  },
]

function Counter({
  value,
  decimals = 0,
}: {
  value: number
  decimals?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (latest) =>
    decimals === 0
      ? Math.round(latest).toLocaleString()
      : latest.toFixed(decimals),
  )
  const inView = useInView(ref, { once: true, margin: "-80px" })

  useEffect(() => {
    if (!inView) return

    const controls = animate(motionValue, value, {
      duration: 1.6,
      ease: "easeOut",
    })

    return controls.stop
  }, [inView, motionValue, value])

  useEffect(() => {
    return rounded.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = latest
      }
    })
  }, [rounded])

  return <span ref={ref}>{decimals === 0 ? "0" : (0).toFixed(decimals)}</span>
}

export function ProblemStats() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <p className="text-xs font-medium tracking-[0.2em] text-primary uppercase">
            The problem
          </p>
          <h2 className="mt-4 text-3xl font-bold text-balance text-foreground sm:text-5xl">
            Why this matters{" "}
            <TypedText
              className="text-primary"
              strings={["right now."]}
              typeSpeed={70}
            />
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
            Aging physical assets plus intensifying extreme weather means the
            frequency and severity of disruptions will only increase. This is a
            structural, not cyclical, problem.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.07 }}
                whileHover={{ y: -6 }}
                className="liquid-glass liquid-glass-hover group relative rounded-xl p-6 transition-[border-color,box-shadow,transform] duration-300"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-70"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(228,87,46,0.45), transparent 70%)",
                  }}
                />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
                    {stat.source}
                  </span>
                </div>
                <div className="relative z-10 mt-6 flex items-baseline gap-1">
                  {stat.prefix ? (
                    <span className="text-3xl font-bold text-foreground sm:text-4xl">
                      {stat.prefix}
                    </span>
                  ) : null}
                  <span className="font-[var(--font-heading)] text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
                    <Counter value={stat.value} decimals={stat.decimals} />
                  </span>
                  <span className="text-2xl font-semibold text-primary sm:text-3xl">
                    {stat.suffix}
                  </span>
                </div>
                <p className="relative z-10 mt-3 text-sm leading-relaxed text-muted-foreground">
                  {stat.label}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
