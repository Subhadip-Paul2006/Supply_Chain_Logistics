"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const liquidButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium outline-none transition-[transform,color,box-shadow] duration-300",
  {
    // Keep all visual layers in CSS so `asChild` can pass a single element.
    // Radix Slot expects exactly one React element child.
    variants: {
      variant: {
        default:
          "text-foreground hover:scale-[1.03] border border-white/20 bg-white/8 shadow-[0_8px_28px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.26),inset_0_-8px_18px_rgba(0,0,0,0.25)] backdrop-blur-xl",
        primary:
          "text-primary-foreground hover:scale-[1.03] border border-primary/35 bg-primary/70 shadow-[0_8px_28px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.26)] backdrop-blur-xl",
        subtle:
          "text-muted-foreground hover:text-foreground border border-white/15 bg-white/6 shadow-[0_8px_20px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-lg",
      },
      size: {
        sm: "h-8 px-3",
        default: "h-10 px-4",
        lg: "h-11 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

interface LiquidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidButtonVariants> {
  asChild?: boolean
}

export const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        data-slot="liquid-button"
        className={cn(
          "relative isolate",
          liquidButtonVariants({ variant, size, className }),
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:bg-linear-to-b before:from-white/18 before:to-transparent before:opacity-80",
        )}
        {...props}
      >
        {children}
      </Comp>
    )
  },
)

LiquidButton.displayName = "LiquidButton"
