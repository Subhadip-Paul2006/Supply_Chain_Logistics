"use client"

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion"
import {
  type MouseEvent,
  type ReactNode,
} from "react"
import { cn } from "@/lib/utils"

type HolographicCardProps = {
  children: ReactNode
  className?: string
  contentClassName?: string
  glowColor?: string
  beamColor?: string
}

export function HolographicCard({
  children,
  className,
  contentClassName,
  glowColor = "rgba(228,87,46,0.22)",
  beamColor = "rgba(228,87,46,0.18)",
}: HolographicCardProps) {
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const glowX = useMotionValue(160)
  const glowY = useMotionValue(120)
  const backgroundX = useMotionValue(50)
  const backgroundY = useMotionValue(50)

  const springRotateX = useSpring(rotateX, {
    stiffness: 220,
    damping: 26,
    mass: 0.85,
  })
  const springRotateY = useSpring(rotateY, {
    stiffness: 220,
    damping: 26,
    mass: 0.85,
  })
  const springGlowX = useSpring(glowX, {
    stiffness: 240,
    damping: 30,
    mass: 0.9,
  })
  const springGlowY = useSpring(glowY, {
    stiffness: 240,
    damping: 30,
    mass: 0.9,
  })
  const springBackgroundX = useSpring(backgroundX, {
    stiffness: 180,
    damping: 22,
    mass: 0.9,
  })
  const springBackgroundY = useSpring(backgroundY, {
    stiffness: 180,
    damping: 22,
    mass: 0.9,
  })

  const transform = useMotionTemplate`perspective(1200px) rotateX(${springRotateX}deg) rotateY(${springRotateY}deg)`
  const holographicGlow = useMotionTemplate`radial-gradient(340px circle at ${springGlowX}px ${springGlowY}px, ${glowColor}, transparent 68%)`
  const holographicBeam = useMotionTemplate`linear-gradient(135deg, transparent 18%, ${beamColor} 44%, transparent 72%)`
  const shimmerBackground = useMotionTemplate`radial-gradient(circle at ${springBackgroundX}% ${springBackgroundY}%, rgba(248,249,251,0.14), transparent 28%)`

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    glowX.set(x)
    glowY.set(y)
    backgroundX.set((x / rect.width) * 100)
    backgroundY.set((y / rect.height) * 100)
    rotateX.set((centerY - y) / 16)
    rotateY.set((x - centerX) / 18)
  }

  function handleMouseLeave() {
    glowX.set(160)
    glowY.set(120)
    backgroundX.set(50)
    backgroundY.set(50)
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.015, y: -6 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      style={{ transform, willChange: "transform" }}
      className={cn(
        "group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.045] shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-xl",
        className,
      )}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ backgroundImage: holographicGlow }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-screen opacity-0 transition-opacity duration-300 group-hover:opacity-90"
        style={{ backgroundImage: holographicBeam }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ backgroundImage: shimmerBackground }}
      />
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/8 transition-all duration-300 group-hover:ring-white/14" />
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </motion.div>
  )
}
