import type { Metadata } from "next"
import { Architecture } from "./components/architecture"
import { Competitors } from "./components/competitors"
import { AboutCTA } from "./components/cta"
import { ExecutionGap } from "./components/execution-gap"
import { GlobeComparison } from "./components/globe-comparison"
import { AboutHero } from "./components/hero"
import { Mission } from "./components/mission"
import { Moats } from "./components/moats"
import { ProblemStats } from "./components/problem-stats"
import { ScrollProgress } from "./components/scroll-progress"
import { SiteNav } from "./components/site-nav"
import { Vertical } from "./components/vertical"

export const metadata: Metadata = {
  title: "About - NexusGuard",
  description:
    "NexusGuard is the first execution-native agentic AI platform for supply chain resilience. Learn about our mission, our moat, and the architecture behind autonomous rerouting.",
}

export default function AboutPage() {
  return (
    <main className="relative w-full max-w-[100vw] overflow-x-hidden bg-background text-foreground">
      <ScrollProgress />
      <SiteNav />
      <AboutHero />
      <Mission />
      <ProblemStats />
      <ExecutionGap />
      <GlobeComparison />
      <Competitors />
      <Moats />
      <Architecture />
      <Vertical />
      <AboutCTA />
      <footer className="border-t border-border py-10 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} NexusGuard. Every signal. Every
        border.
      </footer>
    </main>
  )
}
