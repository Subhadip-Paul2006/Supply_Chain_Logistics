"use client"

import type { ComponentType, KeyboardEvent } from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import {
  Activity,
  ArrowRight,
  Map,
  Package,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "@/components/ui/phosphor-icons"
import { cn } from "@/lib/utils"

type FeedTone = "signal" | "verified" | "watch"

type FeedItem = {
  id: string
  icon: ComponentType<{ className?: string }>
  title: string
  summary: string
  details: string
  href: string
  thumbnail: string
  tone: FeedTone
  meta: string
}

const feedTransition = {
  type: "spring",
  stiffness: 240,
  damping: 26,
  mass: 0.9,
}

const toneStyles: Record<FeedTone, { icon: string; glow: string; badge: string }> = {
  signal: {
    icon: "text-primary",
    glow: "bg-primary/35",
    badge: "border-primary/20 bg-primary/10 text-primary/80",
  },
  verified: {
    icon: "text-emerald-300",
    glow: "bg-emerald-400/30",
    badge: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  },
  watch: {
    icon: "text-sky-300",
    glow: "bg-sky-400/35",
    badge: "border-sky-400/20 bg-sky-400/10 text-sky-100",
  },
}

function TypewriterHeading({ text, className }: { text: string; className?: string }) {
  const [displayedText, setDisplayedText] = useState("")

  useEffect(() => {
    let i = 0
    const intervalId = setInterval(() => {
      setDisplayedText(text.substring(0, i))
      i++
      if (i > text.length) {
        clearInterval(intervalId)
      }
    }, 40) // 40ms per char

    return () => clearInterval(intervalId)
  }, [text])

  return (
    <h2 className={className}>
      {displayedText}
      <span className="typed-cursor">|</span>
    </h2>
  )
}

const feedItems: FeedItem[] = [
  {
    id: "tokyo",
    icon: Package,
    title: "TOKYO NARITA",
    summary: "Customs handoff complete for 38 pharma parcels moving into regional distribution.",
    details:
      "Narita customs released the consignment after automated document matching and cold-chain seal verification. The transfer lane is now green, uplift is scheduled inside the next departure bank, and downstream handlers in Osaka and Seoul received synchronized milestone updates for the handoff.",
    href: "/docs",
    thumbnail: "https://images.unsplash.com/photo-1586528116311-ad8ed3c8d256?auto=format&fit=crop&w=640&h=360&q=80",
    tone: "signal",
    meta: "AIR GATEWAY",
  },
  {
    id: "dubai",
    icon: ShieldCheck,
    title: "DUBAI JAFZA",
    summary: "Chain-of-custody was verified end-to-end across bonded transfer and warehouse intake.",
    details:
      "The bonded shipment cleared its trust check without manual intervention. RFID seal reads, driver identity validation, and warehouse bay assignment all matched the expected route graph, giving operations a full audit trail before goods moved into controlled storage.",
    href: "/status",
    thumbnail: "https://images.unsplash.com/photo-1493962853295-0fd70327578a?auto=format&fit=crop&w=640&h=360&q=80",
    tone: "verified",
    meta: "TRUST LAYER",
  },
  {
    id: "singapore",
    icon: Activity,
    title: "PORT OF SINGAPORE",
    summary: "Shipment SG-4418 cleared customs and rejoined the eastbound priority lane.",
    details:
      "Customs released the container after exception review closed within service targets. Berth coordination updated the onward connection window, truck drayage was automatically rebooked, and the destination control tower can now forecast arrival against the committed customer slot.",
    href: "/customers",
    thumbnail: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=640&h=360&q=80",
    tone: "watch",
    meta: "SEA CORRIDOR",
  },
  {
    id: "rotterdam",
    icon: TrendingUp,
    title: "ROTTERDAM",
    summary: "Rail throughput climbed after yard sequencing reduced dwell time across feeder connections.",
    details:
      "A revised sequencing model pulled three delayed feeder loads back inside the same dispatch window. Crane utilization improved, inland rail capacity was reassigned before the evening cutoff, and planners now have a cleaner recovery path for Northern Europe customers facing tight replenishment timelines.",
    href: "/about",
    thumbnail: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=640&h=360&q=80",
    tone: "watch",
    meta: "RECOVERY FLOW",
  },
  {
    id: "los-angeles",
    icon: Zap,
    title: "LOS ANGELES",
    summary: "A new signal relay came online to tighten latency across inland exception monitoring.",
    details:
      "The relay is now serving high-volume scans from drayage, customs, and warehouse systems with lower round-trip delay. Alert propagation is faster, duplicate event suppression is cleaner, and the West Coast team can respond to anomalies with a tighter operational feedback loop.",
    href: "/contact",
    thumbnail: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=640&h=360&q=80",
    tone: "signal",
    meta: "EDGE RELAY",
  },
  {
    id: "panama",
    icon: Map,
    title: "PANAMA CANAL",
    summary: "Transit sequencing adjusted to absorb a late weather window without missing customer ETAs.",
    details:
      "Control tower simulations recommended a revised vessel sequence after a short weather disruption. Teams updated berth windows, inland appointments, and customer ETAs in one pass, which kept the delay contained instead of cascading into downstream handoff commitments.",
    href: "/pricing",
    thumbnail: "https://images.unsplash.com/photo-1628116999298-5c46ab05e835?auto=format&fit=crop&w=640&h=360&q=80",
    tone: "verified",
    meta: "ROUTE CONTROL",
  },
]

const marqueeItems = [...feedItems, ...feedItems]

type FeedCardProps = {
  item: FeedItem
  expanded: boolean
  onActivate: () => void
  onDeactivate?: () => void
  mode: "desktop" | "mobile"
}


function FeedCard({ item, expanded, onActivate, onDeactivate, mode }: FeedCardProps) {
  const Icon = item.icon
  const tone = toneStyles[item.tone]

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onActivate()
    }
  }

  return (
    <motion.article
      layout
      transition={feedTransition}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
      onFocusCapture={onActivate}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          onDeactivate?.()
        }
      }}
      onClick={onActivate}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border border-border/60 bg-[linear-gradient(180deg,rgba(14,18,29,0.98),rgba(9,12,20,0.98))] text-left shadow-[0_12px_48px_rgba(0,0,0,0.34)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        mode === "desktop"
          ? expanded
            ? "w-[28rem] shrink-0 px-5 py-5 lg:px-6"
            : "h-[6.5rem] w-[19rem] shrink-0 px-4 py-4"
          : "min-h-[16rem] px-5 py-5"

      )}
    >
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent opacity-70" />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100",
          tone.glow,
          expanded && "opacity-100",
        )}
      />

      <div className="relative flex h-full flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="relative mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <span className={cn("absolute inset-1 rounded-full blur-md opacity-70", tone.glow)} />
            <Icon className={cn("relative h-[18px] w-[18px]", tone.icon)} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[0.72rem] font-mono uppercase tracking-[0.26em] text-muted-foreground/75">
              <span className="truncate text-foreground/92">{item.title}</span>
              <span aria-hidden="true" className="text-muted-foreground/35">&bull;</span>
              <span className="hidden truncate sm:inline">{item.meta}</span>
            </div>
            <p className="mt-2 truncate text-sm font-semibold text-foreground/88 sm:text-[0.95rem]">
              {item.summary}
            </p>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {expanded ? (
            <motion.div
              key={`${item.id}-details`}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex flex-1 flex-col gap-4 border-t border-white/8 pt-4"
            >
              <div className="overflow-hidden rounded-[1.4rem] border border-white/8 bg-black/20">
                <img
                  src={item.thumbnail}
                  alt={`${item.title} news thumbnail`}
                  className="h-32 w-full object-cover"
                />
              </div>

              <p className="line-clamp-5 text-sm leading-6 text-muted-foreground/92">
                {item.details}
              </p>

              <Link
                href={item.href}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors duration-200 hover:text-primary/80"
              >
                More details
                <ArrowRight className="size-4" />
              </Link>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.article>
  )
}

export function ActivityTicker() {
  const [activeDesktopKey, setActiveDesktopKey] = useState<string | null>(null)
  const [activeMobileId, setActiveMobileId] = useState<string>(feedItems[0].id)
  const [isPaused, setIsPaused] = useState(false)

  return (
    <section className="relative overflow-hidden border-b border-border/70 bg-transparent py-8 sm:py-10">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 pb-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.28em] text-muted-foreground/70">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-70" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              <span>Global Activity Feed</span>
            </div>

            <div className="max-w-2xl space-y-2">
              <TypewriterHeading 
                text="Live operational context, not just a headline." 
                className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
              />
              <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                The row now moves automatically from right to left and pauses when a user hovers
                a card.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 hidden md:block w-full">
        <div
          className="activity-feed-mask overflow-hidden mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            setIsPaused(false)
            setActiveDesktopKey(null)
          }}
        >
          <div
            className="activity-feed-marquee flex w-max items-start gap-4 px-4 sm:px-6 lg:px-8"
            data-paused={isPaused ? "true" : "false"}
          >
            {marqueeItems.map((item, index) => {
              const cardKey = `${item.id}-${index}`
              return (
                <FeedCard
                  key={cardKey}
                  item={item}
                  expanded={activeDesktopKey === cardKey}
                  onActivate={() => {
                    setIsPaused(true)
                    setActiveDesktopKey(cardKey)
                  }}
                  onDeactivate={() => {
                    setActiveDesktopKey(null)
                    setIsPaused(false)
                  }}
                  mode="desktop"
                />
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 md:hidden w-full overflow-hidden">
        <Carousel opts={{ align: "start", containScroll: "trimSnaps" }} className="w-full pl-4 pr-1">
          <CarouselContent className="-ml-3">
            {feedItems.map((item) => (
              <CarouselItem key={item.id} className="basis-[88%] pl-3 sm:basis-[70%]">
                <FeedCard
                  item={item}
                  expanded={activeMobileId === item.id}
                  onActivate={() => setActiveMobileId(item.id)}
                  mode="mobile"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  )
}
