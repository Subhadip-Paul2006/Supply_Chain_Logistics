"use client"

import { motion, useScroll, useTransform } from "framer-motion"

export function StatusParallax() {
  const { scrollYProgress } = useScroll()

  const gridY = useTransform(scrollYProgress, [0, 1], [0, 220])
  const beamY = useTransform(scrollYProgress, [0, 1], [0, -260])
  const beamRotate = useTransform(scrollYProgress, [0, 1], [0, 16])
  const orbX = useTransform(scrollYProgress, [0, 1], [0, 90])
  const orbY = useTransform(scrollYProgress, [0, 1], [0, -120])
  const leftOrbX = useTransform(scrollYProgress, [0, 1], [0, -70])
  const leftOrbY = useTransform(scrollYProgress, [0, 1], [0, 120])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.98)_0%,rgba(13,13,14,0.985)_34%,rgba(18,18,18,0.99)_58%,rgba(24,19,16,0.985)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,34,36,0.44),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(56,40,31,0.22),transparent_20%),linear-gradient(135deg,rgba(90,15,46,0.08),transparent_38%,rgba(194,24,7,0.05)_74%,rgba(204,85,0,0.08))]" />

      <motion.div
        style={{ y: gridY }}
        className="absolute inset-[-18%] opacity-30 [mask-image:radial-gradient(circle_at_center,black_24%,transparent_80%)]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(176,169,159,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(176,169,159,0.05)_1px,transparent_1px)] bg-[size:96px_96px]" />
      </motion.div>

      <motion.div
        style={{ y: beamY, rotate: beamRotate }}
        className="absolute inset-x-[-18%] top-[-10%] h-[55vh] bg-[radial-gradient(circle_at_center,rgba(230,181,102,0.06),transparent_52%),linear-gradient(90deg,transparent,rgba(251,246,238,0.05),transparent)] blur-3xl"
      />

      <motion.div
        style={{ x: orbX, y: orbY }}
        className="absolute right-[-12rem] top-[16vh] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(90,15,46,0.22),rgba(194,24,7,0.08)_36%,transparent_68%)] blur-3xl"
      />
      <motion.div
        style={{ x: leftOrbX, y: leftOrbY }}
        className="absolute left-[-10rem] top-[52vh] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(204,85,0,0.16),rgba(90,15,46,0.08)_42%,transparent_70%)] blur-3xl"
      />
    </div>
  )
}
