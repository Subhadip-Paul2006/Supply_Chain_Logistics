"use client"

import { motion } from "framer-motion"
import { Check, X } from "@/components/ui/phosphor-icons"
import { TypedText } from "./typed-text"

const before = [
  "AI stops at advice - humans do the rest",
  "Only 20% report meaningful AI value",
  "95% of GenAI projects fail to deliver ROI",
  "Fragmented data, siloed systems, undocumented workflows",
]

const after = [
  "Agent books the alternative carrier directly",
  "Auto-notifies affected suppliers",
  "Updates ETA in downstream systems",
  "Logs every decision with full reasoning for audit",
]

export function ExecutionGap() {
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
            The execution gap
          </p>
          <h2 className="mt-4 text-3xl font-bold text-balance text-foreground sm:text-5xl">
            The problem isn't that AI doesn't exist.{" "}
            <TypedText
              className="text-primary"
              strings={["It's that AI stops at advice."]}
              typeSpeed={45}
            />
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
            Every competitor in this market is an advisory system. They detect,
            they score, they recommend. The human then opens a different
            system, makes a call, sends an email, updates a spreadsheet.
            NexusGuard is the first execution-native system for supply chain
            resilience in the mid-market.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card/40 p-8"
          >
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-destructive/15 text-destructive ring-1 ring-destructive/30">
                <X className="h-4 w-4" />
              </span>
              <h3 className="text-lg font-semibold text-foreground">
                The old way
              </h3>
            </div>
            <ul className="mt-6 space-y-3">
              {before.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-card to-card/50 p-8"
          >
            <div
              aria-hidden
              className="absolute -top-16 -right-16 h-44 w-44 rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(228,87,46,0.35), transparent 70%)",
              }}
            />
            <div className="relative flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30">
                <Check className="h-4 w-4" />
              </span>
              <h3 className="text-lg font-semibold text-foreground">
                NexusGuard acts
              </h3>
            </div>
            <ul className="relative mt-6 space-y-3">
              {after.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-foreground"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
