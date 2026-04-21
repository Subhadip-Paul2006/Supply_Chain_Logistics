/**
 * Decorative network-themed backdrop for auth pages.
 * Pure CSS / SVG — no runtime cost.
 */
export function AuthBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vmax] h-[80vmax] rounded-full bg-primary/10 blur-3xl" />

      {/* Scanning line */}
      <div className="absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-scan" />

      {/* Corner markers */}
      <div className="absolute top-6 left-6 w-6 h-6 border-l border-t border-primary/40" />
      <div className="absolute top-6 right-6 w-6 h-6 border-r border-t border-primary/40" />
      <div className="absolute bottom-6 left-6 w-6 h-6 border-l border-b border-primary/40" />
      <div className="absolute bottom-6 right-6 w-6 h-6 border-r border-b border-primary/40" />
    </div>
  )
}
