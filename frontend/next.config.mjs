/** @type {import('next').NextConfig} */
const nextConfig = {
  // M-4: don't hide type errors. CI runs `tsc --noEmit`; build must fail
  // when types are wrong.
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },

  // M-2: defense-in-depth security response headers. The dashboard and
  // /api/* routes are gated by middleware; CSP tightens what scripts can
  // run if any XSS ever slips through.
  async headers() {
    const csp = [
      "default-src 'self'",
      // Next.js dev needs 'unsafe-eval' for HMR; production sets it off.
      process.env.NODE_ENV !== "production"
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://images.unsplash.com https://images.pexels.com",
      "font-src 'self' data:",
      "connect-src 'self' wss: ws: https://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; ")

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ]
  },
}

export default nextConfig
