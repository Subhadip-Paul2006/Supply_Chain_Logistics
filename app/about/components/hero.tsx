"use client"

import { motion } from "framer-motion"
import { ArrowDown, Radar } from "lucide-react"
import { GlowButton } from "@/components/ui/glow-button"
import { HeroTyped } from "./hero-typed"

export function AboutHero() {
  return (
    <section className="relative overflow-hidden pt-40 pb-24 sm:pt-48 sm:pb-32">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 animate-grid-pulse"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          opacity: 0.3,
        }}
      />

      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary animate-ping-slow" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          About NexusGuard
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="mt-6 min-h-[4.5em] text-4xl font-bold tracking-tight text-balance text-foreground sm:min-h-[3em] sm:text-6xl md:text-7xl"
        >
          <HeroTyped line1="We don't score risk." line2="We execute." />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.2, ease: "easeOut" }}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg"
        >
          NexusGuard is an agentic AI platform that detects global supply chain
          threats in real time, simulates thousands of rerouting scenarios via a
          live digital twin, and autonomously executes the optimal response -
          before the disruption reaches your warehouse.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.45, ease: "easeOut" }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <GlowButton
            asChild
            label="Explore our mission"
            variant="primary"
            className="group w-full sm:w-auto"
          >
            <a href="#mission">
              <Radar className="h-4 w-4 transition-transform group-hover:rotate-45" />
              Explore our mission
            </a>
          </GlowButton>
          <GlowButton
            asChild
            label="See the 7 moats"
            variant="secondary"
            className="group w-full sm:w-auto"
          >
            <a href="#moats">
              See the 7 moats
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </a>
          </GlowButton>
        </motion.div>
      </div>
    </section>
  )
}
