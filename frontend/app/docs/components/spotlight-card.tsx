"use client"

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion"
import { type MouseEvent, type ReactNode } from "react"
import { cn } from "@/lib/utils"

type SpotlightCardProps = {
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function SpotlightCard({
  children,
  className,
  contentClassName,
}: SpotlightCardProps) {
  const mouseX = useMotionValue(160)
  const mouseY = useMotionValue(120)
  const glowX = useSpring(mouseX, { stiffness: 240, damping: 30, mass: 0.9 })
  const glowY = useSpring(mouseY, { stiffness: 240, damping: 30, mass: 0.9 })

  function handleMove(event: MouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    mouseX.set(event.clientX - bounds.left)
    mouseY.set(event.clientY - bounds.top)
  }

  function handleLeave() {
    mouseX.set(160)
    mouseY.set(120)
  }

  const spotlight = useMotionTemplate`radial-gradient(320px circle at ${glowX}px ${glowY}px, rgba(230,181,102,0.12), rgba(194,24,7,0.05) 24%, transparent 68%)`

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-[1.5rem] border border-[#E6B566]/12 bg-[linear-gradient(180deg,rgba(18,18,18,0.95),rgba(35,35,37,0.9)_58%,rgba(28,21,18,0.74))] shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl",
        className,
      )}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ backgroundImage: spotlight }}
      />
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#E6B566]/75 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-[#E6B566]/10 transition-all duration-300 group-hover:ring-[#E6B566]/22" />
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </motion.div>
  )
}
