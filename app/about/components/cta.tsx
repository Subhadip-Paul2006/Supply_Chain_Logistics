"use client"

import { motion } from "framer-motion"
import { ArrowRight, Radar } from "lucide-react"
import Link from "next/link"
import { GlowButton } from "@/components/ui/glow-button"
import { TypedText } from "./typed-text"

export function AboutCTA() {
  return (
    <section id="contact" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl border border-primary/30 bg-card/60 p-10 text-center backdrop-blur-xl sm:p-16"
        >
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(228,87,46,0.2), transparent 60%)",
            }}
          />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-popover/60 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
              <Radar className="h-3.5 w-3.5 text-primary" />
              Every signal. Every border.
            </div>
            <h2 className="mt-6 text-3xl font-bold text-balance text-foreground sm:text-5xl">
              Ready to see the system that{" "}
              <TypedText
                className="text-primary"
                strings={["acts?"]}
                typeSpeed={90}
              />
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
              Request a demo and watch NexusGuard detect, simulate, and reroute
              a disruption - live - in under 90 seconds.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <GlowButton
                asChild
                label="Request a demo"
                variant="primary"
                className="group w-full sm:w-auto"
              >
                <Link href="/pricing">
                  Request a demo
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </GlowButton>
              <GlowButton
                asChild
                label="Back to top"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                <a href="#mission">Back to top</a>
              </GlowButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
