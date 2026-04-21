"use client"

import { motion } from "framer-motion"
import { FileCheck2, Pill, Thermometer, Timer } from "lucide-react"
import { TypedText } from "./typed-text"

const reasons = [
  {
    icon: Thermometer,
    title: "$35B+ lost annually",
    body: "Temperature excursions destroy drugs and profits simultaneously.",
  },
  {
    icon: FileCheck2,
    title: "Existential regulation",
    body: "FDA and EMA consequences make compliance non-negotiable.",
  },
  {
    icon: Timer,
    title: "Time-critical decisions",
    body: "A reroute at hour 2 vs. hour 4 is the difference between saved and spoiled.",
  },
  {
    icon: Pill,
    title: "Highest willingness-to-pay",
    body: "Structured data availability combined with the strongest buyer urgency in logistics.",
  },
]

export function Vertical() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card/80 via-card/40 to-background p-8 sm:p-14"
        >
          <div
            aria-hidden
            className="absolute -top-24 -left-24 h-96 w-96 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(228,87,46,0.2), transparent 70%)",
            }}
          />
          <div className="relative grid items-start gap-10 md:grid-cols-2">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-primary uppercase">
                Beachhead vertical
              </p>
              <h2 className="mt-4 text-3xl font-bold text-balance text-foreground sm:text-5xl">
                Pharma cold chain{" "}
                <TypedText
                  className="text-primary"
                  strings={["first."]}
                  typeSpeed={80}
                />{" "}
                Then everywhere.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
                Generic tools try to serve everyone and end up deeply serving
                no one. We dominate one vertical first - where the stakes, the
                data, and the willingness-to-pay all align.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                NexusGuard agents monitor temperature sensors, carrier
                reliability, route weather, and regulatory clearance timelines
                simultaneously - and reroute before a drug expires in a
                warehouse.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {reasons.map((reason, index) => {
                const Icon = reason.icon

                return (
                  <motion.div
                    key={reason.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.45, delay: index * 0.08 }}
                    whileHover={{ y: -4 }}
                    className="group rounded-xl border border-border bg-background/40 p-5 backdrop-blur transition-colors hover:border-primary/50"
                  >
                    <Icon className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
                    <h3 className="mt-4 text-sm font-semibold text-foreground">
                      {reason.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {reason.body}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
