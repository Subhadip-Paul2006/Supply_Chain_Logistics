import Link from "next/link"
import { Radar, Github, Twitter, Linkedin } from "lucide-react"
import { LiquidButton } from "@/components/ui/liquid-glass-button"

const nav = [
  {
    title: "Platform",
    links: [
      { label: "Overview", href: "/#platform" },
      { label: "Coverage Map", href: "/#coverage" },
      { label: "Detection Engine", href: "/#detection" },
      { label: "API Reference", href: "#" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Supply Chain", href: "#" },
      { label: "Logistics", href: "#" },
      { label: "Threat Intelligence", href: "#" },
      { label: "Customs & Trade", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Pricing", href: "/pricing" },
      { label: "Customers", href: "/customers" },
      { label: "Careers", href: "/career" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Status", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="relative z-30 border-t border-border bg-popover/80 font-geist backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="grid place-items-center w-9 h-9 rounded-full bg-primary text-primary-foreground">
                <Radar className="w-4 h-4" />
              </span>
              <span className="tracking-tight text-lg">R3FLEX</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Real-time visibility across every shipment, signal, and network node. Built for the
              teams that can&apos;t afford to miss a single beat.
            </p>

            {/* Status card */}
            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card/60 px-4 py-2 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-primary opacity-75 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-primary" />
              </span>
              All systems operational
            </div>

            <div className="flex items-center gap-3 pt-2">
              <LiquidButton
                asChild
                size="sm"
                variant="subtle"
                className="w-9 p-0 text-muted-foreground"
              >
                <a href="#" aria-label="Twitter">
                  <Twitter className="w-4 h-4" />
                </a>
              </LiquidButton>
              <LiquidButton
                asChild
                size="sm"
                variant="subtle"
                className="w-9 p-0 text-muted-foreground"
              >
                <a href="#" aria-label="GitHub">
                  <Github className="w-4 h-4" />
                </a>
              </LiquidButton>
              <LiquidButton
                asChild
                size="sm"
                variant="subtle"
                className="w-9 p-0 text-muted-foreground"
              >
                <a href="#" aria-label="LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </a>
              </LiquidButton>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {nav.map((col) => (
              <div key={col.title}>
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                  {col.title}
                </h3>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-foreground/80 hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-mono">
            © {new Date().getFullYear()} R3FLEX, Inc. All signals reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
