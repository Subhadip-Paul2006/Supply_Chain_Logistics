"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/landing/site-header"
import { SiteFooter } from "@/components/landing/site-footer"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"

/* ─── colour tokens (matching the War-Room palette) ─────────────────────── */
const C = {
  bg: "linear-gradient(160deg, #0B0B0E 0%, #1A1816 40%, #1E1510 100%)",
  card: "linear-gradient(135deg, #5A0F2E 0%, #C21807 60%, #CC5500 100%)",
  cardSubtle: "rgba(90,15,46,0.22)",
  cardBorder: "rgba(198,33,7,0.35)",
  sand: "#B0A99F",
  ivory: "#FBF6EE",
  ash: "#8E8E8E",
  gold: "#E6B566",
  goldHover: "#F4CE8A",
}

/* ─── info cards data ────────────────────────────────────────────────────── */
const infoCards = [
  {
    icon: "📡",
    title: "Sales & Partnerships",
    body: "Talk to us about enterprise pricing, pharma cold-chain modules, ERP connectors, or logistics-broker partnerships.",
    action: "sales@r3flex.io",
    href: "mailto:sales@r3flex.io",
  },
  {
    icon: "🛡️",
    title: "Security & Compliance",
    body: "Report a vulnerability, request an audit report, or ask about SOC 2 / EU-AI-Act compliance documentation.",
    action: "security@r3flex.io",
    href: "mailto:security@r3flex.io",
  },
  {
    icon: "⚡",
    title: "Technical Support",
    body: "Experiencing a WebSocket drop, a cascade-simulator anomaly, or an agent confidence-threshold misbehave? We're on-call.",
    action: "support@r3flex.io",
    href: "mailto:support@r3flex.io",
  },
  {
    icon: "📰",
    title: "Press & Media",
    body: "Covering agentic AI, supply-chain resilience, or mid-market logistics? We'd love to brief you. Embargo-friendly.",
    action: "press@r3flex.io",
    href: "mailto:press@r3flex.io",
  },
]

/* ─── FAQ data ───────────────────────────────────────────────────────────── */
const faqs = [
  {
    q: "How fast will you respond?",
    a: "Sales and support tickets get a human response within 4 business hours. Security reports are acknowledged within 24 h and triaged within 48 h.",
  },
  {
    q: "Can I book a live War Room demo?",
    a: "Absolutely. Select 'Book a demo' in the form above and our solutions team will schedule a 30-minute live session showing real disruption detection, cascade simulation, and autonomous execution.",
  },
  {
    q: "Do you have a status page?",
    a: "Yes — status.r3flex.io shows real-time uptime for every service tier. Subscribe to incident notifications so you're never caught off-guard.",
  },
  {
    q: "Where are your offices?",
    a: "We're a distributed-first team with hubs in Bangalore, Amsterdam, and Dallas. All sales conversations happen over video — no travel required on your end.",
  },
]

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function ContactPage() {
  const { scrollY } = useScroll()
  const bgY1 = useTransform(scrollY, [0, 1000], [0, -200])
  const bgY2 = useTransform(scrollY, [0, 1000], [0, 300])
  const bgRotate = useTransform(scrollY, [0, 1000], [0, 45])

  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    intent: "demo",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In production this would POST to an API route
    setSubmitted(true)
  }

  return (
    <main
      className="relative min-h-screen overflow-x-hidden text-foreground"
      style={{ background: C.bg }}
    >
      {/* ── shared noise texture overlay ── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
          opacity: 0.5,
        }}
      />

      {/* ── grid overlay ── */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.09]"
        style={{
          y: bgY1,
          backgroundImage:
            "linear-gradient(to right, rgba(230,181,102,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(230,181,102,0.4) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "linear-gradient(to bottom, black 0%, transparent 65%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 65%)",
        }}
      />

      {/* ── Parallax 3D Background Elements ── */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed -top-40 -left-20 w-96 h-96 rounded-full blur-[100px] opacity-20 z-0"
        style={{ background: "#C21807", y: bgY1, rotate: bgRotate }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-[40%] -right-20 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.12] z-0"
        style={{ background: "#E6B566", y: bgY2 }}
      />

      <SiteHeader />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-4 pt-36 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* badge */}
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs tracking-[0.2em] uppercase"
            style={{
              borderColor: "rgba(230,181,102,0.35)",
              background: "rgba(90,15,46,0.25)",
              color: C.gold,
            }}
          >
            <span
              className="relative flex h-1.5 w-1.5"
            >
              <span
                className="absolute inline-flex h-full w-full rounded-full animate-ping"
                style={{ background: C.gold, opacity: 0.75 }}
              />
              <span
                className="relative inline-flex h-1.5 w-1.5 rounded-full"
                style={{ background: C.gold }}
              />
            </span>
            Get in touch
          </div>

          <TypewriterHeading />

          <p
            className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed"
            style={{ color: C.sand }}
          >
            Whether you're evaluating R3FLEX for your pharma cold chain, need a live War Room demo, or want
            to report a security finding — our team responds fast.
          </p>
        </div>
      </section>

      {/* ── MAIN GRID ────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl grid gap-10 lg:grid-cols-[1fr_400px]">

          {/* ── Contact Form ── */}
          <div
            className="relative rounded-3xl border p-8 md:p-10 backdrop-blur-xl overflow-hidden"
            style={{
              background: "rgba(26,24,22,0.72)",
              borderColor: C.cardBorder,
            }}
          >
            {/* inner glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -left-24 w-64 h-64 rounded-full blur-3xl opacity-20"
              style={{ background: "radial-gradient(circle, #C21807, transparent)" }}
            />

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-6">
                <div
                  className="w-20 h-20 rounded-full grid place-items-center text-4xl"
                  style={{ background: C.cardSubtle, border: `1px solid ${C.cardBorder}` }}
                >
                  ✓
                </div>
                <h2 className="text-2xl font-semibold" style={{ color: C.ivory }}>
                  Signal received.
                </h2>
                <p style={{ color: C.sand }}>
                  We&apos;ll respond within 4 business hours. Keep your eyes on your inbox.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", company: "", intent: "demo", message: "" }) }}
                  className="rounded-full px-5 py-2 text-sm font-medium transition-colors"
                  style={{ background: C.cardSubtle, border: `1px solid ${C.cardBorder}`, color: C.gold }}
                >
                  Send another
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-semibold mb-2" style={{ color: C.ivory }}>
                  Send us a message
                </h2>
                <p className="text-sm mb-8" style={{ color: C.ash }}>
                  Fields marked <span style={{ color: C.gold }}>*</span> are required.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      id="contact-name"
                      label="Full name *"
                      type="text"
                      value={form.name}
                      onChange={(v) => setForm({ ...form, name: v })}
                      placeholder="Ada Lovelace"
                      required
                    />
                    <FormField
                      id="contact-email"
                      label="Work email *"
                      type="email"
                      value={form.email}
                      onChange={(v) => setForm({ ...form, email: v })}
                      placeholder="ada@company.io"
                      required
                    />
                  </div>

                  <FormField
                    id="contact-company"
                    label="Company / Organisation"
                    type="text"
                    value={form.company}
                    onChange={(v) => setForm({ ...form, company: v })}
                    placeholder="Acme Pharma Distributors"
                  />

                  {/* Intent dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-intent" className="text-xs font-mono uppercase tracking-widest" style={{ color: C.ash }}>
                      What are you looking for?
                    </label>
                    <select
                      id="contact-intent"
                      value={form.intent}
                      onChange={(e) => setForm({ ...form, intent: e.target.value })}
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                      style={{
                        background: "rgba(11,11,14,0.6)",
                        border: `1px solid rgba(230,181,102,0.2)`,
                        color: C.ivory,
                      }}
                    >
                      <option value="demo">Book a live War Room demo</option>
                      <option value="sales">Enterprise / sales inquiry</option>
                      <option value="support">Technical support</option>
                      <option value="security">Security / compliance</option>
                      <option value="press">Press & media</option>
                      <option value="other">Something else</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-message" className="text-xs font-mono uppercase tracking-widest" style={{ color: C.ash }}>
                      Message *
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us about your supply chain, the disruptions you face, or your integration requirements…"
                      className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-colors"
                      style={{
                        background: "rgba(11,11,14,0.6)",
                        border: `1px solid rgba(230,181,102,0.2)`,
                        color: C.ivory,
                      }}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(198,33,7,0.6)" }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    id="contact-submit-btn"
                    className="glow-btn w-full rounded-full py-3.5 text-sm font-semibold tracking-wide transition-all duration-200"
                    style={{
                      background: C.card,
                      color: C.ivory,
                      boxShadow: "0 0 32px rgba(198,33,7,0.4)",
                    }}
                  >
                    Send signal →
                  </motion.button>
                </form>
              </>
            )}
          </div>

          {/* ── Right sidebar: info cards ── */}
          <div className="flex flex-col gap-5">
            {infoCards.map((card) => (
              <InfoCard key={card.title} {...card} />
            ))}

            {/* Response SLA badge */}
            <div
              className="rounded-2xl border px-5 py-4 flex items-center gap-4"
              style={{
                background: "rgba(26,24,22,0.6)",
                borderColor: "rgba(230,181,102,0.2)",
              }}
            >
              <span className="text-2xl">⏱</span>
              <div>
                <p className="text-xs font-mono uppercase tracking-widest mb-0.5" style={{ color: C.ash }}>
                  Response SLA
                </p>
                <p className="text-sm font-medium" style={{ color: C.ivory }}>
                  Sales &amp; support: <span style={{ color: C.gold }}>≤ 4 h</span> · Security: <span style={{ color: C.gold }}>≤ 24 h</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-4 pb-20 sm:px-6 lg:px-8">
        <div
          className="mx-auto max-w-6xl rounded-3xl border p-6 sm:p-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          style={{
            background: "rgba(90,15,46,0.18)",
            borderColor: C.cardBorder,
          }}
        >
          {[
            { stat: "190+", label: "Countries monitored" },
            { stat: "23 s", label: "Avg. disruption → resolution" },
            { stat: "99.97%", label: "Platform uptime SLA" },
            { stat: "≤ 4 h", label: "Human response time" },
          ].map(({ stat, label }) => (
            <div key={label}>
              <p className="text-3xl font-semibold tracking-tight" style={{ color: C.gold }}>
                {stat}
              </p>
              <p className="mt-1 text-xs font-mono uppercase tracking-widest" style={{ color: C.ash }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs tracking-[0.2em] uppercase"
              style={{
                borderColor: "rgba(230,181,102,0.3)",
                background: "rgba(90,15,46,0.2)",
                color: C.gold,
              }}
            >
              FAQ
            </div>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: C.ivory }}>
              Quick answers
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} {...faq} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="relative z-10 px-4 pb-24 sm:px-6 lg:px-8">
        <div
          className="mx-auto max-w-5xl rounded-3xl border p-10 text-center md:p-14 overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, rgba(90,15,46,0.55) 0%, rgba(194,24,7,0.35) 60%, rgba(204,85,0,0.3) 100%)",
            borderColor: C.cardBorder,
          }}
        >
          {/* decorative glow orbs */}
          <div aria-hidden className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: "#C21807" }} />
          <div aria-hidden className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl opacity-15" style={{ background: "#5A0F2E" }} />

          <h3 className="relative text-balance text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: C.ivory }}>
            See R3FLEX in action — live.
          </h3>
          <p className="relative mx-auto mt-4 max-w-xl" style={{ color: C.sand }}>
            Watch the War Room detect a Suez disruption, simulate three reroutes, and autonomously execute — in under 30 seconds.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/signup"
                id="contact-cta-trial"
                className="glow-btn block items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-all duration-200"
                style={{
                  background: C.card,
                  color: C.ivory,
                  boxShadow: "0 0 28px rgba(198,33,7,0.45)",
                }}
              >
                Start free trial
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="#contact-submit-btn"
                id="contact-cta-demo"
                className="block items-center gap-2 rounded-full border px-7 py-3.5 text-sm font-semibold tracking-wide transition-all duration-200"
                style={{
                  borderColor: C.gold,
                  color: C.gold,
                  background: "rgba(230,181,102,0.08)",
                }}
              >
                Book a demo
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function FormField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
}: {
  id: string
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-mono uppercase tracking-widest" style={{ color: C.ash }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
        style={{
          background: "rgba(11,11,14,0.6)",
          border: `1px solid rgba(230,181,102,0.2)`,
          color: C.ivory,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(230,181,102,0.6)"
          e.currentTarget.style.boxShadow = `0 0 0 2px rgba(230,181,102,0.1)`
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(230,181,102,0.2)"
          e.currentTarget.style.boxShadow = "none"
        }}
      />
    </div>
  )
}

function InfoCard({
  icon,
  title,
  body,
  action,
  href,
}: {
  icon: string
  title: string
  body: string
  action: string
  href: string
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={(e) => {
        if (!cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group rounded-2xl border p-5 relative overflow-hidden transition-colors duration-300"
      style={{
        background: hovered ? "rgba(90,15,46,0.22)" : "rgba(26,24,22,0.55)",
        borderColor: hovered ? C.cardBorder : "rgba(230,181,102,0.15)",
      }}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-none absolute inset-0 z-0"
          >
            {/* Soft spotlight follow */}
            <div
              className="absolute inset-0 mix-blend-overlay opacity-60"
              style={{
                background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, rgba(230,181,102,0.4), transparent 40%)`,
              }}
            />
            {/* Holographic shifting sheen overlay */}
            <div
              className="absolute inset-0 opacity-40 mix-blend-color-dodge transition-opacity duration-300"
              style={{
                background: `conic-gradient(from ${mousePos.x * 0.5}deg at ${mousePos.x}px ${mousePos.y}px, transparent 0%, rgba(230,181,102,0.25) 20%, rgba(194,24,7,0.3) 40%, rgba(90,15,46,0.3) 60%, transparent 80%)`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex items-start gap-4">
        <span
          className="text-2xl w-10 h-10 flex-shrink-0 grid place-items-center rounded-xl transition-colors duration-300"
          style={{ background: hovered ? "rgba(198,33,7,0.3)" : "rgba(90,15,46,0.4)", border: `1px solid ${C.cardBorder}` }}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <h3 className="font-semibold text-sm mb-1" style={{ color: C.ivory }}>
            {title}
          </h3>
          <p className="text-xs leading-relaxed mb-3" style={{ color: C.ash }}>
            {body}
          </p>
          <a
            href={href}
            className="text-xs font-mono transition-colors hover:underline"
            style={{ color: C.gold }}
          >
            {action} →
          </a>
        </div>
      </div>
    </motion.div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="rounded-xl border overflow-hidden transition-colors duration-200"
      style={{
        background: open ? "rgba(90,15,46,0.2)" : "rgba(26,24,22,0.55)",
        borderColor: open ? C.cardBorder : "rgba(230,181,102,0.12)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium" style={{ color: C.ivory }}>
          {q}
        </span>
        <span
          className="flex-shrink-0 grid size-6 place-items-center rounded-full border text-sm leading-none transition-transform duration-300"
          style={{
            borderColor: open ? C.gold : "rgba(230,181,102,0.3)",
            color: open ? C.gold : C.ash,
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          +
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: C.sand }}>
          {a}
        </div>
      )}
    </div>
  )
}

function TypewriterHeading() {
  const [key, setKey] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setKey(k => k + 1)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const text1 = "Every signal starts with a "
  const text2 = "conversation."

  return (
    <h1
      className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl mx-auto"
      style={{ color: C.ivory, display: "grid", justifyItems: "center" }}
    >
      <span className="invisible select-none" style={{ gridArea: "1/1" }} aria-hidden>
        {text1} <span style={{ color: C.gold }}>{text2}</span>|
      </span>

      <span key={key} style={{ gridArea: "1/1", display: "inline-block" }}>
        {text1.split("").map((c, i) => (
          <motion.span
            key={`t1-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04, duration: 0.01 }}
          >
            {c}
          </motion.span>
        ))}
        {text2.split("").map((c, i) => (
          <motion.span
            key={`t2-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: (text1.length + i) * 0.04, duration: 0.01 }}
            style={{ color: C.gold }}
          >
            {c}
          </motion.span>
        ))}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          style={{ color: C.gold, display: "inline-block", marginLeft: "2px" }}
        >
          |
        </motion.span>
      </span>
    </h1>
  )
}
