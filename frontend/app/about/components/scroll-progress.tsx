"use client"

import { motion, useScroll, useSpring } from "framer-motion"

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <div className="fixed top-0 left-0 z-50 h-0.5 w-full bg-border/30">
      <motion.div
        style={{ scaleX, transformOrigin: "0% 50%" }}
        className="h-full bg-gradient-to-r from-primary via-primary to-destructive will-change-transform"
      />
    </div>
  )
}
