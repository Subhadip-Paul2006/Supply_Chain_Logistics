"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import Link from "next/link"
import Globe from "@/components/ui/globe"
import { FaqAccordionSection } from "@/components/ui/faq-accordion"
import {
  AnimatedTestimonials,
  defaultSupplyChainTestimonials,
} from "@/components/ui/animated-testimonials"
import { SplitTypewriter } from "@/components/ui/split-typewriter"
import { cn } from "@/lib/utils"
import { GlowButton } from "@/components/ui/glow-button"

interface ScrollGlobeProps {
  sections: {
    id: string
    badge?: string
    title: string
    subtitle?: string
    description: string
    align?: "left" | "center" | "right"
    variant?: "default" | "faq" | "testimonials"
    features?: { title: string; description: string }[]
    actions?: {
      label: string
      variant: "primary" | "secondary"
      href?: string
      onClick?: () => void
    }[]
  }[]
  globeConfig?: {
    positions: {
      top: string
      left: string
      scale: number
    }[]
  }
  className?: string
}

const defaultGlobeConfig = {
  positions: [
    { top: "50%", left: "75%", scale: 1.4 },
    { top: "25%", left: "50%", scale: 0.9 },
    { top: "55%", left: "20%", scale: 1.2 },
    { top: "50%", left: "50%", scale: 1.8 },
    { top: "42%", left: "72%", scale: 1.25 },
    { top: "48%", left: "28%", scale: 1.2 },
  ],
}

const parsePercent = (str: string): number => Number.parseFloat(str.replace("%", ""))

export function ScrollGlobe({
  sections,
  globeConfig = defaultGlobeConfig,
  className,
}: ScrollGlobeProps) {
  const [activeSection, setActiveSection] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [globeTransform, setGlobeTransform] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])
  const animationFrameId = useRef<number | undefined>(undefined)

  const calculatedPositions = useMemo(() => {
    return globeConfig.positions.map((pos) => ({
      top: parsePercent(pos.top),
      left: parsePercent(pos.left),
      scale: pos.scale,
    }))
  }, [globeConfig.positions])

  const updateScrollPosition = useCallback(() => {
    const scrollTop = window.pageYOffset
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1)
    setScrollProgress(progress)

    const viewportCenter = window.innerHeight / 2
    let newActiveSection = 0
    let minDistance = Number.POSITIVE_INFINITY

    sectionRefs.current.forEach((ref, index) => {
      if (ref) {
        const rect = ref.getBoundingClientRect()
        const sectionCenter = rect.top + rect.height / 2
        const distance = Math.abs(sectionCenter - viewportCenter)
        if (distance < minDistance) {
          minDistance = distance
          newActiveSection = index
        }
      }
    })

    const currentPos =
      calculatedPositions[Math.min(newActiveSection, calculatedPositions.length - 1)]
    const transform = `translate3d(${currentPos.left}vw, ${currentPos.top}vh, 0) translate3d(-50%, -50%, 0) scale3d(${currentPos.scale}, ${currentPos.scale}, 1)`
    setGlobeTransform(transform)
    setActiveSection(newActiveSection)
  }, [calculatedPositions])

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        animationFrameId.current = requestAnimationFrame(() => {
          updateScrollPosition()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    updateScrollPosition()

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current)
    }
  }, [updateScrollPosition])

  useEffect(() => {
    const initialPos = calculatedPositions[0]
    setGlobeTransform(
      `translate3d(${initialPos.left}vw, ${initialPos.top}vh, 0) translate3d(-50%, -50%, 0) scale3d(${initialPos.scale}, ${initialPos.scale}, 1)`,
    )
  }, [calculatedPositions])

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full max-w-[100vw] overflow-x-hidden bg-background text-foreground",
        className,
      )}
    >
      {/* Progress bar */}
      <div className="fixed top-0 left-0 w-full h-0.5 bg-border/30 z-50">
        <div
          className="h-full bg-linear-to-r from-primary via-primary to-secondary will-change-transform"
          style={{
            transform: `scaleX(${scrollProgress})`,
            transformOrigin: "left center",
            transition: "transform 0.15s ease-out",
            filter: "drop-shadow(0 0 4px rgba(228,87,46,0.55))",
          }}
        />
      </div>

      {/* Side nav dots */}
      <div className="hidden sm:flex fixed right-4 lg:right-8 top-1/2 -translate-y-1/2 z-40">
        <div className="space-y-5">
          {sections.map((section, index) => (
            <div key={index} className="relative group">
              <div
                className={cn(
                  "absolute right-6 top-1/2 -translate-y-1/2",
                  "px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap",
                  "bg-card/95 backdrop-blur-md border border-border shadow-xl z-50",
                  activeSection === index ? "animate-fadeOut" : "opacity-0",
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-muted-foreground uppercase tracking-wider">
                    {section.badge || `Section ${index + 1}`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  sectionRefs.current[index]?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  })
                }}
                className={cn(
                  "relative w-2.5 h-2.5 rounded-full border-2 transition-all duration-300 hover:scale-125",
                  "before:absolute before:inset-0 before:rounded-full before:transition-all before:duration-300",
                  activeSection === index
                    ? "bg-primary border-primary shadow-lg before:animate-ping before:bg-primary/30"
                    : "bg-transparent border-muted-foreground/40 hover:border-primary/60 hover:bg-primary/10",
                )}
                aria-label={`Go to ${section.badge || `section ${index + 1}`}`}
              />
            </div>
          ))}
        </div>
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-linear-to-b from-transparent via-primary/20 to-transparent -translate-x-1/2 -z-10" />
      </div>

      {/* Globe layer */}
      <div
        className="fixed z-10 pointer-events-none will-change-transform transition-all duration-1400 ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{
          transform: globeTransform,
          filter: `opacity(${activeSection === sections.length - 1 ? 0.5 : 0.9})`,
        }}
      >
        <div className="scale-75 sm:scale-90 lg:scale-100">
          <Globe />
        </div>
      </div>

      {/* Sections */}
      {sections.map((section, index) => (
        <section
          key={section.id}
          ref={(el: HTMLDivElement | null) => {
            sectionRefs.current[index] = el
          }}
          className={cn(
            "relative min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12 z-20 py-20",
            "w-full max-w-full overflow-hidden",
            section.align === "center" && "items-center text-center",
            section.align === "right" && "items-end text-right",
            section.align !== "center" && section.align !== "right" && "items-start text-left",
          )}
        >
          <div
            className={cn(
              "w-full will-change-transform",
              section.variant === "testimonials"
                ? "max-w-6xl xl:max-w-7xl"
                : section.variant === "faq"
                  ? "max-w-3xl sm:max-w-3xl"
                  : "max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl",
            )}
          >
            {section.badge && (
              <div
                className={cn(
                  "inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-border bg-card/60 backdrop-blur-sm text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground",
                  section.align === "center" && "mx-auto",
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {section.badge}
              </div>
            )}

            {section.variant !== "testimonials" ? (
              <>
                <h1
                  className={cn(
                    "font-semibold mb-6 leading-[1.05] tracking-tight text-balance",
                    index === 0
                      ? "text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
                      : "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
                  )}
                >
                  {section.subtitle ? (
                    <SplitTypewriter
                      line1={section.title}
                      line2={section.subtitle}
                      line1ClassName="block text-foreground"
                      line2ClassName="block text-primary"
                    />
                  ) : (
                    <SplitTypewriter
                      line1={section.title}
                      line1ClassName="text-foreground"
                    />
                  )}
                </h1>

                <p
                  className={cn(
                    "text-muted-foreground mb-8 text-base font-light text-pretty leading-relaxed sm:text-lg",
                    section.align === "center" && "mx-auto",
                  )}
                >
                  {section.description}
                </p>
              </>
            ) : null}

            {section.variant === "faq" ? (
              <FaqAccordionSection className="mt-2" />
            ) : null}

            {section.variant === "testimonials" ? (
              <AnimatedTestimonials
                embedded
                badgeText=""
                testimonials={defaultSupplyChainTestimonials}
                trustedCompaniesTitle=""
                trustedCompanies={[]}
                className="mt-2"
              />
            ) : null}

            {index === 0 && (
              <div
                className={cn(
                  "mb-8 flex flex-wrap items-center gap-4 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground/70",
                  section.align === "center" && "justify-center",
                )}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                  <span>Live Telemetry</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-1 h-1 rounded-full bg-secondary animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  />
                  <span>24/7 Coverage</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-1 h-1 rounded-full bg-destructive animate-pulse"
                    style={{ animationDelay: "1s" }}
                  />
                  <span>Threat Detection</span>
                </div>
              </div>
            )}

            {section.features &&
              section.variant !== "faq" &&
              section.variant !== "testimonials" && (
              <div className="grid gap-3 sm:gap-4 mb-10">
                {section.features.map((feature) => (
                  <div
                    key={feature.title}
                    className="group p-5 rounded-lg border border-border bg-card/60 backdrop-blur-md hover:bg-card transition-all duration-300 hover:border-primary/40 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1.5 shrink-0">
                        <div className="w-2 h-2 rounded-full bg-primary group-hover:shadow-[0_0_12px_var(--primary)] transition-all" />
                      </div>
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <h3 className="font-semibold text-card-foreground text-base sm:text-lg">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {section.actions && (
              <div
                className={cn(
                  "flex flex-col sm:flex-row flex-wrap gap-3",
                  section.align === "center" && "justify-center",
                  section.align === "right" && "justify-end",
                )}
              >
                {section.actions.map((action) => {
                  const variant =
                    action.variant === "primary"
                      ? ("primary" as const)
                      : ("secondary" as const)

                  return action.href ? (
                    <GlowButton
                      key={action.label}
                      asChild
                      label={action.label}
                      variant={variant}
                      className="w-full sm:w-auto"
                    >
                      <Link href={action.href}>{action.label}</Link>
                    </GlowButton>
                  ) : (
                    <GlowButton
                      key={action.label}
                      label={action.label}
                      onClick={action.onClick}
                      variant={variant}
                      className="w-full sm:w-auto"
                    />
                  )
                })}
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  )
}
