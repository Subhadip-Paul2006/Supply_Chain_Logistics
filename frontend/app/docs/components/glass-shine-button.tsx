"use client"

import { motion } from "framer-motion"
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react"
import { cn } from "@/lib/utils"

type SharedProps = {
  children: ReactNode
  className?: string
  contentClassName?: string
  shineClassName?: string
  active?: boolean
}

type GlassShineLinkProps = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement>

type GlassShineButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement>

function GlassShineFrame({
  children,
  contentClassName,
  shineClassName,
  active = false,
}: SharedProps) {
  return (
    <>
      <span className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_34%,rgba(230,181,102,0.08)_58%,rgba(255,255,255,0.04))]" />
      <span className="absolute inset-[1px] rounded-[inherit] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(230,181,102,0.12),transparent_42%)] opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-[#FBF6EE]/70 to-transparent opacity-80 transition-opacity duration-300 group-hover:via-[#E6B566]/90" />
      <motion.span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-[-45%] left-[-35%] w-[40%] -skew-x-[24deg] rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.02),rgba(255,255,255,0.24),rgba(230,181,102,0.34),rgba(255,255,255,0.1),transparent)] blur-[2px] mix-blend-screen",
          active ? "opacity-90" : "opacity-70 group-hover:opacity-100",
          shineClassName,
        )}
        animate={{ x: ["-120%", "280%"] }}
        transition={{
          duration: active ? 2.8 : 3.8,
          ease: "linear",
          repeat: Infinity,
          repeatDelay: active ? 0.2 : 0.55,
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
    </>
  )
}

export function GlassShineLink({
  children,
  className,
  contentClassName,
  shineClassName,
  active,
  ...props
}: GlassShineLinkProps) {
  return (
    <a
      className={cn(
        "group relative isolate inline-flex overflow-hidden backdrop-blur-xl transition-[transform,box-shadow,border-color,background-color,color] duration-300 hover:-translate-y-[1.5px] hover:scale-[1.01] active:scale-[0.99]",
        className,
      )}
      {...props}
    >
      <GlassShineFrame
        contentClassName={contentClassName}
        shineClassName={shineClassName}
        active={active}
      >
        {children}
      </GlassShineFrame>
    </a>
  )
}

export function GlassShineButton({
  children,
  className,
  contentClassName,
  shineClassName,
  active,
  type = "button",
  ...props
}: GlassShineButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "group relative isolate inline-flex overflow-hidden backdrop-blur-xl transition-[transform,box-shadow,border-color,background-color,color] duration-300 hover:-translate-y-[1.5px] hover:scale-[1.01] active:scale-[0.99]",
        className,
      )}
      {...props}
    >
      <GlassShineFrame
        contentClassName={contentClassName}
        shineClassName={shineClassName}
        active={active}
      >
        {children}
      </GlassShineFrame>
    </button>
  )
}
