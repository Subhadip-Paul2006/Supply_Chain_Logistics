"use client"

import { motion } from "framer-motion"
import { Quote } from "lucide-react"
import { TypedText } from "./typed-text"

export function Mission() {
  return (
    <section id="mission" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl border border-border bg-card/60 p-8 backdrop-blur-xl sm:p-14"
        >
          <div
            aria-hidden
            className="absolute -top-20 -right-20 h-60 w-60 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(228,87,46,0.35), transparent 70%)",
            }}
          />

          <div className="relative flex items-start gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
              <Quote className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-primary uppercase">
                Executive summary
              </p>
              <h2 className="mt-4 text-2xl leading-snug font-semibold text-balance text-foreground sm:text-3xl md:text-4xl">
                This is not a dashboard. This is not a risk score.
                <br />
                <TypedText
                  className="text-primary"
                  strings={["This is a system that acts."]}
                  typeSpeed={45}
                />
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
                NexusGuard sits at the intersection of three converging forces:
                the{" "}
                <span className="font-medium text-foreground">
                  $8B+ supply chain risk market
                </span>{" "}
                growing at 13.8% CAGR, the rise of{" "}
                <span className="font-medium text-foreground">agentic AI</span>{" "}
                as the dominant enterprise paradigm in 2025-2026, and the
                single biggest gap no incumbent has closed -
                {" "}
                <span className="font-medium text-primary">
                  autonomous execution for the mid-market.
                </span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
