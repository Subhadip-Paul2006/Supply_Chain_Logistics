"use client"

import Link, { type LinkProps } from "next/link"
import { motion } from "framer-motion"
import {
  useCallback,
  useState,
  type AnchorHTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from "react"
import { cn } from "@/lib/utils"

type ShinePhase = "intro" | "idle" | "hover"

type StatusShineLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    children: ReactNode
    className?: string
    contentClassName?: string
  }

export function StatusShineLink({
  children,
  className,
  contentClassName,
  onMouseEnter,
  onMouseLeave,
  ...props
}: StatusShineLinkProps) {
  const [phase, setPhase] = useState<ShinePhase>("intro")

  const handleMouseEnter = useCallback<MouseEventHandler<HTMLAnchorElement>>(
    (event) => {
      setPhase("hover")
      onMouseEnter?.(event)
    },
    [onMouseEnter],
  )

  const handleMouseLeave = useCallback<MouseEventHandler<HTMLAnchorElement>>(
    (event) => {
      setPhase("idle")
      onMouseLeave?.(event)
    },
    [onMouseLeave],
  )

  const isIntro = phase === "intro"
  const isHover = phase === "hover"

  return (
    <Link
      {...props}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative isolate inline-flex overflow-hidden rounded-full border backdrop-blur-xl transition-[transform,border-color,background-color,box-shadow,color] duration-300 hover:-translate-y-0.5 hover:scale-[1.01]",
        className,
      )}
    >
      <span className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_34%,rgba(230,181,102,0.08)_58%,rgba(255,255,255,0.05))]" />
      <span className="absolute inset-[1px] rounded-[inherit] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(230,181,102,0.12),transparent_44%)] opacity-85 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[#FBF6EE]/85 to-transparent opacity-90 group-hover:via-[#E6B566]" />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-y-[-45%] left-[-38%] w-[42%] -skew-x-[22deg] rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.04),rgba(255,255,255,0.26),rgba(230,181,102,0.38),rgba(255,255,255,0.12),transparent)] blur-[2px] mix-blend-screen"
        animate={
          isIntro || isHover
            ? { x: ["-140%", "290%"], opacity: [0.18, 0.92, 0.16] }
            : { x: "-180%", opacity: 0 }
        }
        transition={
          isHover
            ? {
                duration: 1.05,
                ease: "linear",
                repeat: Infinity,
                repeatDelay: 0.18,
              }
            : isIntro
              ? {
                  duration: 1.08,
                  ease: "linear",
                  repeat: 1,
                  repeatDelay: 0.22,
                }
              : { duration: 0.24, ease: "easeOut" }
        }
        onAnimationComplete={() => {
          setPhase((current) => (current === "intro" ? "idle" : current))
        }}
      />
      <span
        className={cn(
          "relative z-10 flex items-center justify-center gap-2",
          contentClassName,
        )}
      >
        {children}
      </span>
    </Link>
  )
}
