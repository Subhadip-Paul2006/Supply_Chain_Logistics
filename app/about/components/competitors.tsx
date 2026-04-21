"use client"

import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { useState } from "react"
import { TypedText } from "./typed-text"

const incumbents = [
  {
    name: "Resilinc",
    tag: "Pioneer",
    summary: "Advisory-only. No execution layer, no cascade simulation.",
  },
  {
    name: "FourKites",
    tag: "Visibility leader",
    summary: "Tracks shipments. Doesn't reroute them. Not a resilience engine.",
  },
  {
    name: "o9 Solutions",
    tag: "Enterprise brain",
    summary: "Digital brain for Fortune 500. Inaccessible to the mid-market.",
  },
  {
    name: "Llamasoft (Coupa)",
    tag: "Simulation powerhouse",
    summary: "Heavy simulation, not real-time. Not built for live disruption.",
  },
  {
    name: "Kinaxis Maestro",
    tag: "Concurrent planning",
    summary: "Enterprise lock-in. Months of implementation, no autonomy.",
  },
  {
    name: "Everstream Analytics",
    tag: "Risk intelligence",
    summary: "Strong risk scores. Zero action. The gap we close.",
  },
]

export function Competitors() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="relative bg-gradient-to-b from-transparent via-card/20 to-transparent py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="grid items-start gap-10 md:grid-cols-2"
        >
          <div>
            <p className="text-xs font-medium tracking-[0.2em] text-primary uppercase">
              Competitive landscape
            </p>
            <h2 className="mt-4 text-3xl font-bold text-balance text-foreground sm:text-5xl">
              What exists today -{" "}
              <TypedText
                className="text-primary"
                strings={["and what doesn't."]}
                typeSpeed={55}
              />
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
              An $8B+ risk market growing at 13.8% CAGR. Every incumbent owns a
              piece. None own execution. That's our wedge.
            </p>
            <div className="mt-8 grid max-w-md grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-card/60 p-4">
                <div className="text-3xl font-bold text-primary">$8B+</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Risk market
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card/60 p-4">
                <div className="text-3xl font-bold text-primary">13.8%</div>
                <div className="mt-1 text-xs text-muted-foreground">CAGR</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {incumbents.map((company, index) => (
              <motion.button
                key={company.name}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                type="button"
                onClick={() => setOpen(open === index ? null : index)}
                className="w-full overflow-hidden rounded-xl border border-border bg-card/60 text-left backdrop-blur transition-colors hover:border-primary/40"
              >
                <div className="flex items-center justify-between gap-3 px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="text-xs text-muted-foreground font-mono">
                      0{index + 1}
                    </span>
                    <span className="truncate font-semibold text-foreground">
                      {company.name}
                    </span>
                    <span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-[10px] tracking-widest text-primary ring-1 ring-primary/20 uppercase sm:inline-block">
                      {company.tag}
                    </span>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      open === index ? "rotate-90 text-primary" : ""
                    }`}
                  />
                </div>
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    open === index
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                      {company.summary}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
