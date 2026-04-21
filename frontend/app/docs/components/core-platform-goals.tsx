"use client"

import { motion } from "framer-motion"
import { HolographicCard } from "@/components/ui/holographic-card"
import { BrainCircuit, Radar, ShieldCheck } from "@/components/ui/phosphor-icons"
import { cn } from "@/lib/utils"

const cards = [
  {
    title: "Detect Risk",
    body: "Monitor routes, ports, suppliers, and live event streams so disruption is visible before it compounds.",
    icon: Radar,
    accent: "text-[#E6B566]",
    iconWrap: "border-[#E6B566]/20 bg-[#5A0F2E]/28",
    glow: "rgba(230,181,102,0.18)",
    beam: "rgba(194,24,7,0.12)",
  },
  {
    title: "Simulate Options",
    body: "Run digital-twin scenario planning before impact cascades so teams can compare tradeoffs with context.",
    icon: BrainCircuit,
    accent: "text-[#E6B566]",
    iconWrap: "border-[#E6B566]/20 bg-[#C21807]/14",
    glow: "rgba(194,24,7,0.18)",
    beam: "rgba(204,85,0,0.12)",
  },
  {
    title: "Human-in-the-Loop Control",
    body: "Route lower-confidence decisions through approvals while preserving an auditable trail of every recommended action.",
    icon: ShieldCheck,
    accent: "text-[#E6B566]",
    iconWrap: "border-[#E6B566]/20 bg-[#CC5500]/14",
    glow: "rgba(204,85,0,0.18)",
    beam: "rgba(230,181,102,0.12)",
  },
] as const

export function CorePlatformGoals() {
  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-3">
      {cards.map((card, index) => {
        const Icon = card.icon

        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.65,
              delay: index * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <HolographicCard
              glowColor={card.glow}
              beamColor={card.beam}
              className="min-h-[22rem] bg-[rgba(18,18,19,0.86)]"
              contentClassName="flex h-full flex-col p-6"
            >
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-2xl border",
                  card.iconWrap,
                )}
              >
                <Icon className={cn("h-5 w-5", card.accent)} />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-[#FBF6EE]">
                {card.title}
              </h3>
              <p className="mt-3 max-w-[24ch] text-sm leading-8 text-[#B0A99F]">
                {card.body}
              </p>
            </HolographicCard>
          </motion.div>
        )
      })}
    </div>
  )
}
