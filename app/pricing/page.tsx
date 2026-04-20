import Link from "next/link"
import { SiteHeader } from "@/components/landing/site-header"
import { SiteFooter } from "@/components/landing/site-footer"
import { PricingClient } from "./pricing-client"
import { GlowButton } from "@/components/ui/glow-button"

const faqs = [
  {
    q: "How does billing work?",
    a: "Team plans are billed monthly per seat. Annual commitments save 20%. You can change plans or cancel anytime from your workspace settings.",
  },
  {
    q: "What counts as an event?",
    a: "An event is any discrete signal ingested by R3FLEX — a customs update, RFID scan, route telemetry ping, or API-reported state change.",
  },
  {
    q: "Do you offer non-profit or academic pricing?",
    a: "Yes. We offer 70% off Team plans for qualifying non-profits and research institutions. Contact our sales team to apply.",
  },
  {
    q: "Can I self-host R3FLEX?",
    a: "Enterprise customers can deploy on-prem or in an air-gapped environment. Reach out and we will walk you through the deployment options.",
  },
]

export default function PricingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <SiteHeader />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "linear-gradient(to bottom, black, transparent 70%)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent 70%)",
        }}
      />

      <section className="relative px-4 pt-36 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Pricing
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Plans that scale with your <span className="text-primary">network</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Start free. Upgrade when your operation outgrows a dashboard — and never worry about
            being rate-limited during an incident again.
          </p>
        </div>
      </section>

      <PricingClient />

      <section className="relative px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
              FAQ
            </div>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Questions, answered.
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl border border-border bg-card/60 backdrop-blur-sm open:border-primary/40 transition-colors"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium text-foreground">
                  <span className="text-balance">{faq.q}</span>
                  <span className="grid size-6 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-all group-open:rotate-45 group-open:border-primary/40 group-open:text-primary">
                    <span className="text-lg leading-none">+</span>
                  </span>
                </summary>
                <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-border bg-linear-to-br from-card via-card to-muted/40 p-10 text-center md:p-14">
          <h3 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to see every signal?
          </h3>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Spin up a workspace in minutes — no credit card required. Keep what you build.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <GlowButton asChild label="Start free trial" variant="primary" className="h-11">
              <Link href="/signup">Start free trial</Link>
            </GlowButton>
            <GlowButton asChild label="Book a demo" variant="secondary" className="h-11">
              <Link href="#">Book a demo</Link>
            </GlowButton>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
