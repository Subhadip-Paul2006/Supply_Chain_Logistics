"use client"

import { motion } from "framer-motion"
import { Brain, Cog, GitBranch, Satellite } from "@/components/ui/phosphor-icons"
import { TypedText } from "./typed-text"

const layers = [
  {
    n: "Layer 1",
    title: "Signal Ingestion",
    icon: Satellite,
    items: [
      "News APIs (GDELT, NewsAPI, Reuters)",
      "Weather & climate feeds (NOAA)",
      "Port congestion (MarineTraffic)",
      "Geopolitical events (ACLED)",
    ],
  },
  {
    n: "Layer 2",
    title: "Cognition & Digital Twin",
    icon: Brain,
    items: [
      "Graph representation of the network",
      "Cascade failure modeling",
      "Thousands of scenarios per second",
      "Confidence scoring per action",
    ],
  },
  {
    n: "Layer 3",
    title: "Decision Orchestration",
    icon: GitBranch,
    items: [
      "Threshold-gated autonomy",
      "Top-3 option ranking with tradeoffs",
      "Human-in-the-loop escalation",
      "Novel-scenario briefs",
    ],
  },
  {
    n: "Layer 4",
    title: "Autonomous Execution",
    icon: Cog,
    items: [
      "Carrier booking via API",
      "Supplier notifications",
      "ERP / TMS ETA updates",
      "Audit-native decision logging",
    ],
  },
]

export function Architecture() {
  return (
    <section id="architecture" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <p className="text-xs font-medium tracking-[0.2em] text-primary uppercase">
            Technical architecture
          </p>
          <h2 className="mt-4 text-3xl font-bold text-balance text-foreground sm:text-5xl">
            Four layers.{" "}
            <TypedText
              className="text-primary"
              strings={["One autonomous system."]}
              typeSpeed={50}
            />
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
            A multi-agent architecture built around a live digital twin -
            designed to move from signal to execution without a human in the
            critical path.
          </p>
        </motion.div>

        <div className="relative mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden
            className="absolute top-16 left-[12%] right-[12%] hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent lg:block"
          />
          {layers.map((layer, index) => {
            const Icon = layer.icon

            return (
              <motion.div
                key={layer.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="group relative rounded-2xl border border-border bg-card/60 p-6 backdrop-blur transition-colors hover:border-primary/40"
              >
                <div className="relative grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/30 transition-all group-hover:ring-primary/60">
                  <Icon className="h-5 w-5" />
                  <span className="absolute -top-2 -right-2 grid h-6 min-w-[1.5rem] place-items-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground ring-2 ring-background">
                    {index + 1}
                  </span>
                </div>
                <p className="mt-5 text-xs tracking-widest text-muted-foreground uppercase">
                  {layer.n}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-foreground">
                  {layer.title}
                </h3>
                <ul className="mt-4 space-y-2">
                  {layer.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
