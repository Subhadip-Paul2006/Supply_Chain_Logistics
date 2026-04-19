import { ScrollGlobe } from "@/components/landing/scroll-globe"
import { SiteHeader } from "@/components/landing/site-header"
import { SiteFooter } from "@/components/landing/site-footer"
import { ActivityTicker } from "@/components/landing/activity-ticker"

const sections = [
  {
    id: "hero",
    badge: "Global Activity Tracker",
    title: "Every signal.",
    subtitle: "Every border.",
    description:
      "A unified detection layer for your global operations. NexusGuard watches shipments, signals, and supply chains across 190+ countries — so your team can act on what matters, in the moment it happens.",
    align: "left" as const,
    actions: [
      { label: "Start free trial", variant: "primary" as const, href: "/signup" },
      { label: "View pricing", variant: "secondary" as const, href: "/pricing" },
    ],
  },
  {
    id: "platform",
    badge: "The Platform",
    title: "Connected across",
    subtitle: "every route.",
    description:
      "From the Strait of Malacca to the Panama Canal, our detection network ingests 2.4 billion events a day and resolves them into a single coherent view of your operation.",
    align: "center" as const,
  },
  {
    id: "coverage",
    badge: "Coverage",
    title: "Built for what",
    subtitle: "happens next.",
    description:
      "Anticipate delays before they cascade. Surface anomalies before they escalate. Route around disruption with confidence — grounded in live telemetry, not yesterday&apos;s spreadsheet.",
    align: "left" as const,
    features: [
      {
        title: "Detection Engine",
        description: "Sub-second anomaly classification across 40+ event streams with auditable signal lineage.",
      },
      {
        title: "Network Topology",
        description: "A living map of vessels, vehicles, and facilities — updated every 4 seconds worldwide.",
      },
      {
        title: "Secure by default",
        description: "SOC 2 Type II, end-to-end encryption, chain-of-custody verification on every event.",
      },
    ],
  },
  {
    id: "detection",
    badge: "Your Mission Control",
    title: "Shared world.",
    subtitle: "Unified view.",
    description:
      "When logistics, trade compliance, and threat intelligence work from the same source of truth, response time collapses. That&apos;s the promise of a single pane of glass — finally kept.",
    align: "center" as const,
    actions: [
      { label: "Create free account", variant: "primary" as const, href: "/signup" },
      { label: "Talk to sales", variant: "secondary" as const, href: "#" },
    ],
  },
  {
    id: "faq",
    variant: "faq" as const,
    badge: "FAQ",
    title: "Answers for",
    subtitle: "your ops team.",
    description:
      "Straight answers about security, integrations, rollout, and pricing — before you wire your first detection node.",
    align: "left" as const,
  },
  {
    id: "testimonials",
    variant: "testimonials" as const,
    badge: "Customers",
    title: "Trusted in production",
    subtitle: "",
    description: "",
    align: "center" as const,
  },
]

export default function HomePage() {
  return (
    <div className="relative bg-background text-foreground min-h-screen">
      <SiteHeader />
      <ScrollGlobe sections={sections} />

      {/* Activity tracker line across the globe */}
      <div className="relative z-30">
        <ActivityTicker />
      </div>

      <SiteFooter />
    </div>
  )
}
