"use client"

import { Activity, AlertTriangle, Package, ShieldCheck, Zap } from "lucide-react"

type Event = {
  icon: React.ComponentType<{ className?: string }>
  location: string
  message: string
  tone: "info" | "warn" | "ok"
}

const events: Event[] = [
  { icon: Package, location: "Port of Singapore", message: "Shipment SG-4418 cleared customs", tone: "ok" },
  { icon: AlertTriangle, location: "Suez Canal", message: "Route anomaly detected — vessel diverted", tone: "warn" },
  { icon: ShieldCheck, location: "Rotterdam", message: "Container seal verified via RFID", tone: "ok" },
  { icon: Zap, location: "Los Angeles", message: "New signal relay online — 12ms latency", tone: "info" },
  { icon: Activity, location: "São Paulo", message: "Supply node registered 1,284 scans/hr", tone: "info" },
  { icon: AlertTriangle, location: "Istanbul", message: "Dwell time exceeds SLA threshold", tone: "warn" },
  { icon: Package, location: "Tokyo Narita", message: "Customs handoff complete — 38 parcels", tone: "ok" },
  { icon: ShieldCheck, location: "Dubai", message: "Chain-of-custody verified end-to-end", tone: "ok" },
]

const toneClass: Record<Event["tone"], string> = {
  info: "text-primary",
  warn: "text-destructive",
  ok: "text-secondary",
}

export function ActivityTicker() {
  const doubled = [...events, ...events]
  return (
    <div className="relative overflow-hidden border-y border-border bg-popover/85 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent opacity-70 animate-data-sheen" />
      <div className="pointer-events-none absolute inset-x-0 -top-20 h-40 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.22),transparent_68%)] animate-ticker-glow" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-background to-transparent" />

      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground/70 border-b border-border/60">
        <span className="relative flex w-2 h-2">
          <span className="absolute inline-flex w-full h-full rounded-full bg-primary opacity-75 animate-ping" />
          <span className="relative inline-flex w-2 h-2 rounded-full bg-primary" />
        </span>
        <span className="text-foreground/80">Global Activity Feed</span>
        <span className="hidden sm:inline text-muted-foreground/50">— streaming across the globe</span>
        <span className="ml-auto text-muted-foreground/50">UTC · LIVE</span>
      </div>

      <div className="overflow-hidden py-3">
        <div className="flex w-max gap-8 animate-ticker">
          {doubled.map((event, i) => {
            const Icon = event.icon
            return (
              <div
                key={`${event.location}-${i}`}
                className="group flex items-center gap-3 whitespace-nowrap rounded-full border border-border/35 bg-background/20 px-4 py-1.5 text-sm shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition-colors duration-300 hover:border-primary/35 hover:bg-background/35"
                style={{
                  animation: "tickerFloat 5.8s ease-in-out infinite",
                  animationDelay: `${(i % events.length) * 0.55}s`,
                }}
              >
                <span className="relative">
                  <span className={`absolute inset-0 rounded-full blur-sm opacity-70 ${toneClass[event.tone]}`} />
                  <Icon className={`relative h-4 w-4 shrink-0 ${toneClass[event.tone]} transition-transform duration-300 group-hover:scale-110`} />
                </span>
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                  {event.location}
                </span>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-foreground/90">{event.message}</span>
                <span className="ml-4 text-muted-foreground/30">//</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
