"use client"

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion"
import { useState, type MouseEvent } from "react"
import {
  ArrowRight,
  DatabaseZap,
  Globe2,
  Radar,
  Workflow,
} from "@/components/ui/phosphor-icons"
import { cn } from "@/lib/utils"

const flowCards = [
  {
    title: "Browser + UI",
    body: "Operators interact with a dark-mode control surface tuned for fast triage and action.",
    icon: Globe2,
    badge: "Client",
  },
  {
    title: "Next.js Frontend",
    body: "App Router routes, shared components, and docs live in the frontend workspace on port 3000.",
    icon: Radar,
    badge: "Frontend",
  },
  {
    title: "FastAPI Integration",
    body: "REST and WebSocket integration points connect live disruptions, workflow actions, and orchestration.",
    icon: Workflow,
    badge: "Service Layer",
  },
  {
    title: "Postgres + Redis",
    body: "Optional backend state, queueing, and persistence sit behind the local FastAPI stack on port 8000.",
    icon: DatabaseZap,
    badge: "Data Layer",
  },
] as const

function FlowCard({
  badge,
  title,
  body,
  Icon,
  showArrow,
}: {
  badge: string
  title: string
  body: string
  Icon: typeof Globe2
  showArrow: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const springX = useSpring(pointerX, { stiffness: 260, damping: 28, mass: 0.8 })
  const springY = useSpring(pointerY, { stiffness: 260, damping: 28, mass: 0.8 })

  function handleMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    pointerX.set((x - rect.width / 2) / 14)
    pointerY.set((y - rect.height / 2) / 14)
  }

  function handleLeave() {
    setHovered(false)
    pointerX.set(0)
    pointerY.set(0)
  }

  return (
    <div className="relative">
      <motion.article
        layout
        onHoverStart={() => setHovered(true)}
        onHoverEnd={handleLeave}
        onMouseMove={handleMove}
        style={{ x: springX, y: springY }}
        whileHover={{ scale: 1.02 }}
        transition={{
          layout: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
          duration: 0.26,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="group relative min-h-[14.5rem] overflow-hidden rounded-[1.65rem] border border-[#E6B566]/12 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(35,35,37,0.9)_58%,rgba(28,21,18,0.74))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
      >
        <motion.div
          aria-hidden
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.28 }}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(230,181,102,0.12),rgba(194,24,7,0.05)_34%,transparent_62%)]"
        />
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-[#E6B566]/10 transition-all duration-300 group-hover:ring-[#E6B566]/22" />

        <motion.div layout className="relative z-10 flex flex-col">
          <span className="inline-flex w-fit rounded-full border border-[#E6B566]/14 bg-[rgba(17,17,17,0.24)] px-4 py-1.5 text-[11px] font-geist uppercase tracking-[0.26em] text-[#E6B566]">
            {badge}
          </span>

          <h3 className="mt-9 text-[2rem] font-semibold leading-tight text-[#FBF6EE]">
            {title}
          </h3>

          <AnimatePresence initial={false}>
            {hovered ? (
              <motion.div
                layout
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E6B566]/20 bg-[#E6B566]/10 shadow-[0_0_30px_rgba(230,181,102,0.14)]">
                  <Icon className="h-6 w-6 text-[#E6B566]" />
                </div>
                <p className="mt-6 text-base leading-8 text-[#E6B566]">
                  {body}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </motion.article>

      {showArrow ? (
        <div className="pointer-events-none absolute right-[-0.9rem] top-1/2 hidden xl:flex xl:-translate-y-1/2">
          <div className="flex items-center gap-2">
            <div className="h-px w-8 bg-gradient-to-r from-[#E6B566]/70 to-transparent" />
            <ArrowRight className="h-4 w-4 text-[#E6B566]" />
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function ExecutionFlow() {
  return (
    <div className="relative mt-8 -ml-3 w-[calc(100%+0.75rem)] gap-3 sm:-ml-4 sm:w-[calc(100%+1rem)] lg:-ml-6 lg:w-[calc(100%+1.5rem)] xl:grid xl:grid-cols-4 xl:gap-4 2xl:-ml-8 2xl:w-[calc(100%+2rem)]">
      {flowCards.map((card, index) => (
        <motion.div
          layout
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
          <FlowCard
            badge={card.badge}
            title={card.title}
            body={card.body}
            Icon={card.icon}
            showArrow={index < flowCards.length - 1}
          />
        </motion.div>
      ))}
    </div>
  )
}
