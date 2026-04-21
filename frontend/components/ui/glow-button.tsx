"use client"

import React, { forwardRef, useState } from "react"
import { Sparkles } from "@/components/ui/phosphor-icons"
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"

type GlowButtonVariant = "default" | "primary" | "secondary" | "ghost"

interface GlowButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  label?: string
  onClick?(): void
  className?: string
  variant?: GlowButtonVariant
  asChild?: boolean
  showSparkle?: boolean
}

const variantClasses: Record<GlowButtonVariant, string> = {
  default:
    "bg-gradient-to-b from-zinc-200/95 to-zinc-300/80 text-zinc-900 border-zinc-300/80 hover:from-zinc-100 hover:to-zinc-200",
  primary:
    "bg-gradient-to-b from-primary to-primary/75 text-primary-foreground border-primary/50 hover:brightness-110",
  secondary:
    "bg-gradient-to-b from-secondary/95 to-secondary/65 text-secondary-foreground border-border hover:border-primary/40",
  ghost:
    "bg-transparent text-foreground border-border/70 hover:bg-card/70 hover:border-primary/40",
}

export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  (
    {
      label = "Generate",
      onClick,
      className,
      variant = "default",
      asChild = false,
      showSparkle = true,
      disabled,
      type = "button",
      children,
      ...props
    },
    ref,
  ) => {
    const [isClicked, setIsClicked] = useState(false)

    const handleClick = () => {
      if (disabled) return
      setIsClicked(true)
      setTimeout(() => setIsClicked(false), 200)
      onClick?.()
    }

    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        type={type}
        aria-label={label}
        className={cn(
          "glow-btn inline-flex h-10 items-center justify-center gap-1.5 rounded-full border px-5 text-sm font-medium shadow-md transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
          variantClasses[variant],
          className,
        )}
        onClick={handleClick}
        data-state={isClicked ? "clicked" : undefined}
        disabled={disabled}
        {...props}
      >
        {children ? (
          children
        ) : (
          <span className="flex items-center justify-center gap-1.5">
            {label}
            {showSparkle ? <Sparkles size={16} className="ml-0.5" /> : null}
          </span>
        )}
      </Comp>
    )
  },
)

GlowButton.displayName = "GlowButton"
