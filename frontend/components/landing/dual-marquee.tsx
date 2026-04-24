import type { CSSProperties } from "react"
import { SplitTypewriter } from "@/components/ui/split-typewriter"

type BrandKey =
  | "bbc"
  | "cnn"
  | "al-jazeera"
  | "reuters"
  | "bloomberg"
  | "cnbc"
  | "nhk"
  | "maersk"
  | "msc"
  | "fedex"
  | "dhl"
  | "ups"
  | "cma-cgm"
  | "h-l"

type MarqueeItem = {
  key: BrandKey
  name: string
  meta: string
}

const newsNetworks: MarqueeItem[] = [
  { key: "bbc", name: "BBC News", meta: "Broadcast Network" },
  { key: "cnn", name: "CNN International", meta: "Global Newsroom" },
  { key: "al-jazeera", name: "Al Jazeera", meta: "World Coverage" },
  { key: "reuters", name: "Reuters", meta: "Wire Service" },
  { key: "bloomberg", name: "Bloomberg", meta: "Markets Desk" },
  { key: "cnbc", name: "CNBC", meta: "Business Channel" },
  { key: "nhk", name: "NHK World", meta: "Public Broadcaster" },
]

const logisticsNetworks: MarqueeItem[] = [
  { key: "maersk", name: "Maersk", meta: "Ocean Carrier" },
  { key: "msc", name: "MSC", meta: "Container Line" },
  { key: "fedex", name: "FedEx", meta: "Air Express" },
  { key: "dhl", name: "DHL", meta: "Parcel Network" },
  { key: "ups", name: "UPS", meta: "Ground Freight" },
  { key: "cma-cgm", name: "CMA CGM", meta: "Shipping Group" },
  { key: "h-l", name: "Hapag-Lloyd", meta: "Trade Lanes" },
]

function BrandGlyph({ brand }: { brand: BrandKey }) {
  const glyphClassName = "h-5 w-5 sm:h-6 sm:w-6"

  switch (brand) {
    case "bbc":
      return (
        <svg viewBox="0 0 32 32" aria-hidden="true" className={glyphClassName}>
          <rect x="2.5" y="7" width="7" height="18" rx="2.2" fill="currentColor" opacity="0.92" />
          <rect x="12.5" y="7" width="7" height="18" rx="2.2" fill="currentColor" opacity="0.82" />
          <rect x="22.5" y="7" width="7" height="18" rx="2.2" fill="currentColor" opacity="0.72" />
        </svg>
      )
    case "cnn":
      return (
        <svg viewBox="0 0 32 32" aria-hidden="true" className={glyphClassName}>
          <path
            d="M5 20c1.9-4.9 4.1-7.4 6.7-7.4 2.1 0 3.5 1.5 3.7 4.3h.9c.5-2.8 2-4.3 4.5-4.3 2.6 0 4.8 2.5 6.2 7.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.2 20h4.5l1.4-6.1M18.2 20h3.9l1.7-6.1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.78"
          />
        </svg>
      )
    case "al-jazeera":
      return (
        <svg viewBox="0 0 32 32" aria-hidden="true" className={glyphClassName}>
          <path
            d="M16 4.5c3.8 3.5 6.3 7.1 6.3 10.6 0 3.9-2.6 7.3-6.3 12.4-3.7-5.1-6.3-8.5-6.3-12.4 0-3.5 2.5-7.1 6.3-10.6Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinejoin="round"
          />
          <path
            d="M16 8.5c1.5 1.9 2.5 4 2.5 5.9 0 2.1-1 4.1-2.5 6.3-1.5-2.2-2.5-4.2-2.5-6.3 0-1.9 1-4 2.5-5.9Z"
            fill="currentColor"
            opacity="0.76"
          />
        </svg>
      )
    case "reuters":
      return (
        <svg viewBox="0 0 32 32" aria-hidden="true" className={glyphClassName}>
          <circle cx="16" cy="16" r="2.6" fill="currentColor" />
          <circle cx="16" cy="7" r="1.7" fill="currentColor" opacity="0.9" />
          <circle cx="23.1" cy="9.1" r="1.7" fill="currentColor" opacity="0.82" />
          <circle cx="25" cy="16" r="1.7" fill="currentColor" opacity="0.74" />
          <circle cx="23.1" cy="22.9" r="1.7" fill="currentColor" opacity="0.66" />
          <circle cx="16" cy="25" r="1.7" fill="currentColor" opacity="0.58" />
          <circle cx="8.9" cy="22.9" r="1.7" fill="currentColor" opacity="0.5" />
          <circle cx="7" cy="16" r="1.7" fill="currentColor" opacity="0.42" />
          <circle cx="8.9" cy="9.1" r="1.7" fill="currentColor" opacity="0.34" />
        </svg>
      )
    case "bloomberg":
      return (
        <svg viewBox="0 0 32 32" aria-hidden="true" className={glyphClassName}>
          <rect x="5" y="18" width="4" height="8" rx="1.4" fill="currentColor" opacity="0.56" />
          <rect x="11.5" y="14" width="4" height="12" rx="1.4" fill="currentColor" opacity="0.68" />
          <rect x="18" y="10" width="4" height="16" rx="1.4" fill="currentColor" opacity="0.8" />
          <rect x="24.5" y="6" width="3" height="20" rx="1.4" fill="currentColor" opacity="0.92" />
        </svg>
      )
    case "cnbc":
      return (
        <svg viewBox="0 0 32 32" aria-hidden="true" className={glyphClassName}>
          <path d="M16 8c-2.5 0-4.7 1.4-5.8 3.5 2 .3 3.9 1.4 5.8 3.3 1.9-1.9 3.8-3 5.8-3.3C20.7 9.4 18.5 8 16 8Z" fill="currentColor" opacity="0.92" />
          <path d="M9.8 12.3c-2.2.4-4 2.2-4.4 4.4 2-.1 4.2.6 6.6 2.1-.2-2.4-.9-4.6-2.2-6.5Z" fill="currentColor" opacity="0.74" />
          <path d="M22.2 12.3c1.3 1.9 2 4.1 2.2 6.5 2.4-1.5 4.6-2.2 6.6-2.1-.4-2.2-2.2-4-4.4-4.4Z" fill="currentColor" opacity="0.74" />
          <path d="M10.6 21.2c1.4 1.7 3.3 2.8 5.4 2.8s4-1.1 5.4-2.8c-1.8-1.3-3.6-2-5.4-2s-3.6.7-5.4 2Z" fill="currentColor" opacity="0.58" />
        </svg>
      )
    case "nhk":
      return (
        <svg viewBox="0 0 32 32" aria-hidden="true" className={glyphClassName}>
          <rect x="4" y="9" width="24" height="14" rx="7" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <circle cx="10.5" cy="16" r="1.8" fill="currentColor" opacity="0.92" />
          <circle cx="16" cy="16" r="1.8" fill="currentColor" opacity="0.72" />
          <circle cx="21.5" cy="16" r="1.8" fill="currentColor" opacity="0.52" />
        </svg>
      )
    case "maersk":
      return (
        <svg viewBox="0 0 32 32" aria-hidden="true" className={glyphClassName}>
          <path
            d="M16 6.2l1.8 5.5h5.8l-4.7 3.4 1.8 5.5-4.7-3.4-4.7 3.4 1.8-5.5-4.7-3.4h5.8L16 6.2Z"
            fill="currentColor"
          />
        </svg>
      )
    case "msc":
      return (
        <svg viewBox="0 0 32 32" aria-hidden="true" className={glyphClassName}>
          <path
            d="M5 20c3.4 0 3.4-6 6.8-6s3.4 6 6.8 6 3.4-6 6.8-6 3.4 6 6.8 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case "fedex":
      return (
        <svg viewBox="0 0 32 32" aria-hidden="true" className={glyphClassName}>
          <path d="M6 16h12" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M15 10l8 6-8 6" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case "dhl":
      return (
        <svg viewBox="0 0 32 32" aria-hidden="true" className={glyphClassName}>
          <path d="M5 11h22M3.5 16h25M5 21h22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      )
    case "ups":
      return (
        <svg viewBox="0 0 32 32" aria-hidden="true" className={glyphClassName}>
          <path
            d="M16 5.5 25 9v8.3c0 4.1-3 7.8-9 10.9-6-3.1-9-6.8-9-10.9V9l9-3.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinejoin="round"
          />
          <path d="M12.2 14.4h7.6" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" opacity="0.8" />
        </svg>
      )
    case "cma-cgm":
      return (
        <svg viewBox="0 0 32 32" aria-hidden="true" className={glyphClassName}>
          <path d="M5.5 19.2c2.8-4.8 6.3-7.2 10.5-7.2 4.4 0 7.9 2.4 10.5 7.2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M10 22.5c1.6-2.1 3.6-3.2 6-3.2 2.4 0 4.4 1.1 6 3.2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.76" />
        </svg>
      )
    case "h-l":
      return (
        <svg viewBox="0 0 32 32" aria-hidden="true" className={glyphClassName}>
          <rect x="5" y="9" width="22" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <path d="M10 9v14M16 9v14M22 9v14" fill="none" stroke="currentColor" strokeWidth="1.8" opacity="0.72" />
        </svg>
      )
  }
}

function MarqueeRow({
  items,
  direction,
  duration,
}: {
  items: MarqueeItem[]
  direction: "left" | "right"
  duration: number
}) {
  const duplicatedItems = [...items, ...items]
  const animationStyle = {
    ["--ticker-duration" as string]: `${duration}s`,
  } as CSSProperties

  return (
    <div className="dual-marquee-row relative overflow-hidden rounded-full border border-white/10 bg-transparent px-3 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.14)] backdrop-blur-[2px] sm:px-4">
      <div
        className={`dual-marquee-track ${direction === "left" ? "dual-marquee-track-left" : "dual-marquee-track-right"} flex w-max min-w-full items-center gap-5 sm:gap-8 lg:gap-10`}
        style={animationStyle}
      >
        {duplicatedItems.map((item, index) => (
          <div
            key={`${item.key}-${index}`}
            className="dual-marquee-pill group/item relative flex shrink-0 items-center gap-3 rounded-full border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.018)_58%,rgba(255,255,255,0.035))] px-4 py-2.5 text-foreground/68 transition-all duration-300 hover:border-primary/35 hover:text-foreground sm:px-5 sm:py-3"
            style={
              {
                ["--logo-delay" as string]: `${(index % items.length) * 0.32}s`,
              } as CSSProperties
            }
          >
            <span className="dual-marquee-emblem relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.12),rgba(255,255,255,0.03)_58%,rgba(255,255,255,0.015))] text-foreground/72 transition-all duration-300 group-hover/item:border-primary/35 group-hover/item:text-foreground sm:h-11 sm:w-11">
              <span className="dual-marquee-emblem-glow absolute inset-1 rounded-full border border-white/8" />
              <span className="dual-marquee-icon relative z-10">
                <BrandGlyph brand={item.key} />
              </span>
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="whitespace-nowrap text-[0.82rem] font-semibold tracking-[0.14em] text-foreground/82 sm:text-[0.88rem]">
                {item.name}
              </span>
              <span className="whitespace-nowrap text-[0.58rem] uppercase tracking-[0.22em] text-foreground/38 sm:text-[0.62rem]">
                {item.meta}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DualMarquee() {
  return (
    <section className="relative overflow-hidden bg-transparent py-8 sm:py-10">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-24 -translate-y-1/2 bg-linear-to-r from-transparent via-primary/[0.045] to-transparent" />
      <div className="pointer-events-none absolute left-[12%] top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-primary/8 blur-[110px]" />
      <div className="pointer-events-none absolute right-[10%] top-1/2 h-36 w-36 -translate-y-1/2 rounded-full bg-primary/10 blur-[130px]" />

      <div className="dual-marquee-mask relative mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 sm:px-6 lg:px-8">
        <div className="pb-2 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            <SplitTypewriter
              line1="Our Sources & Partners"
              line1ClassName="text-foreground"
            />
          </h2>
        </div>
        <MarqueeRow items={newsNetworks} direction="left" duration={34} />
        <MarqueeRow items={logisticsNetworks} direction="right" duration={38} />
        <div className="pt-2 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            <SplitTypewriter
              line1="Our Clients"
              line1ClassName="text-foreground"
            />
          </h2>
        </div>
      </div>
    </section>
  )
}
