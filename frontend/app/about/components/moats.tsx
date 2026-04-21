"use client"

import { motion } from "framer-motion"
import {
  Building2,
  FileCheck2,
  Network,
  Repeat,
  ShieldCheck,
  Syringe,
  Zap,
} from "@/components/ui/phosphor-icons"
import { TypedText } from "./typed-text"

const moats = [
  {
    n: "01",
    title: "Execution Layer",
    subtitle: "The core moat",
    icon: Zap,
    body: "When confidence exceeds the threshold, the agent books carriers, notifies suppliers, updates ETAs, and logs every decision. Every month of live executions compounds into a proprietary dataset advisory tools can never replicate.",
  },
  {
    n: "02",
    title: "Cascade Failure Detection",
    subtitle: "Second-order simulation",
    icon: Network,
    body: "If we reroute via Cape of Good Hope, does that create a secondary bottleneck at Rotterdam? Our digital twin models what happens next - not just the single-point failure every other tool sees.",
  },
  {
    n: "03",
    title: "Confidence-Threshold HITL",
    subtitle: "Trust, tuned per customer",
    icon: ShieldCheck,
    body: "Above threshold: the agent acts autonomously. Below: it surfaces the top 3 options with tradeoff scores. A $50K decision can be autonomous; a $5M supplier switch always gets human approval.",
  },
  {
    n: "04",
    title: "Mid-Market Access",
    subtitle: "300,000+ underserved buyers",
    icon: Building2,
    body: "Every incumbent requires 3-6 month onboarding and $200K-$2M contracts. NexusGuard connects to public feeds, ships mock ERP connectors for demos, and onboards in hours - not months.",
  },
  {
    n: "05",
    title: "Pharma Cold Chain Beachhead",
    subtitle: "Domain-specific flywheel",
    icon: Syringe,
    body: "Temperature excursions cost pharma $35B+ annually. Regulatory stakes are existential. We reroute cold-chain shipments before a drug expires in a warehouse - then expand into adjacent verticals.",
  },
  {
    n: "06",
    title: "Audit-Native Compliance",
    subtitle: "Built for the EU AI Act",
    icon: FileCheck2,
    body: "Every autonomous action is logged with the signals that triggered it, scenarios considered, confidence score, approver, and outcome. Audit infrastructure can't be retrofitted - we're native from day one.",
  },
  {
    n: "07",
    title: "The Outcome Flywheel",
    subtitle: "Data no competitor can replicate",
    icon: Repeat,
    body: "Every execution produces a labeled outcome: did the reroute succeed? Was the cost accurate? That data trains a proprietary model - the more customers we serve, the sharper our predictions.",
  },
]

export function Moats() {
  return (
    <section id="moats" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <p className="text-xs font-medium tracking-[0.2em] text-primary uppercase">
            The moat
          </p>
          <h2 className="mt-4 text-3xl font-bold text-balance text-foreground sm:text-5xl">
            Seven solidified{" "}
            <TypedText
              className="text-primary"
              strings={["differentiators."]}
              typeSpeed={60}
            />
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
            Competitors detect. We decide, execute, and compound. Each layer of
            our moat gets deeper with every shipment we route.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {moats.map((moat, index) => {
            const Icon = moat.icon

            return (
              <motion.article
                key={moat.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: (index % 3) * 0.08 }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/60 p-7 backdrop-blur transition-colors hover:border-primary/50"
              >
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(600px circle at var(--mx,50%) var(--my,0%), rgba(228,87,46,0.12), transparent 40%)",
                  }}
                />
                <div className="relative flex items-start justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-transform group-hover:scale-110 group-hover:ring-primary/40">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className="text-5xl font-bold text-border transition-colors group-hover:text-primary/30"
                    aria-hidden
                  >
                    {moat.n}
                  </span>
                </div>
                <h3 className="relative mt-5 text-xl font-semibold text-foreground">
                  {moat.title}
                </h3>
                <p className="relative mt-1 text-xs tracking-widest text-primary/90 uppercase">
                  {moat.subtitle}
                </p>
                <p className="relative mt-4 text-sm leading-relaxed text-muted-foreground">
                  {moat.body}
                </p>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
