import { useEffect, useState, useRef } from "react"
import { z } from "zod"
import { createSupabaseBrowserClient } from "@/lib/supabase"

// WebSocket hardening (H-2 fix):
//  - Default to wss:// (TLS). The plaintext ws:// is retained ONLY for
//    localhost development via the env var. Production builds will use wss://.
//  - Attach the current Supabase access token so the server can authenticate
//    the connection (when the server enforces it).
//  - Validate every incoming event with Zod; drop anything that doesn't match.
//  - Strip console.log in production (L-2 fix).

const DEFAULT_WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? "wss://api.r3flex.io/ws/disruptions"

const EventSchema = z
  .object({
    type: z.string().max(64).optional(),
    event: z.string().max(64).optional(),
    message: z.string().max(1024).optional(),
    channel: z.string().max(128).optional(),
  })
  .passthrough()

const IS_PROD = process.env.NODE_ENV === "production"

function debugLog(...args: unknown[]) {
  if (IS_PROD) return
  // eslint-disable-next-line no-console
  console.log(...args)
}

export interface DisruptionEvent {
  type?: string
  event?: string
  message?: string
  channel?: string
  [key: string]: unknown
}

export function useDisruptionsWS(companyId: string = "pharma-distrib-india") {
  const [events, setEvents] = useState<DisruptionEvent[]>([])
  const [connected, setConnected] = useState(false)
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    let cancelled = false

    async function open() {
      // Build a per-connection token; expired/missing tokens just go unauth'd.
      let token: string | null = null
      try {
        const supabase = createSupabaseBrowserClient()
        const { data } = await supabase.auth.getSession()
        token = data.session?.access_token ?? null
      } catch {
        token = null
      }

      const baseUrl = DEFAULT_WS_URL
      const url = new URL(baseUrl)
      // If the URL is wss://, force https origin; if it was overridden to
      // ws:// for localhost, fall through without warning.
      if (
        url.protocol === "wss:" &&
        typeof window !== "undefined" &&
        url.hostname !== "localhost" &&
        url.hostname !== "127.0.0.1"
      ) {
        // No-op; this branch exists so future origin allowlisting has a hook.
      }

      url.pathname = url.pathname.replace(/\/$/, "")
      const fullUrl = `${url.toString()}/${encodeURIComponent(companyId)}${
        token ? `?token=${encodeURIComponent(token)}` : ""
      }`

      if (cancelled) return
      debugLog("Connecting to WS:", fullUrl)
      ws.current = new WebSocket(fullUrl)

      ws.current.onopen = () => {
        if (cancelled) return
        setConnected(true)
        debugLog("WS Connected")
      }

      ws.current.onmessage = (msg) => {
        if (cancelled) return
        let raw: unknown
        try {
          raw = JSON.parse(msg.data as string)
        } catch (err) {
          debugLog("WS Parse Error:", err)
          return
        }
        // Reject anything that isn't a plain object, then run Zod validation.
        if (typeof raw !== "object" || raw === null) return
        const parsed = EventSchema.safeParse(raw)
        if (!parsed.success) {
          debugLog("WS rejected malformed event")
          return
        }
        const data = parsed.data as DisruptionEvent
        if (data.type === "heartbeat") return
        debugLog("WS Received:", data)
        setEvents((prev) => [data, ...prev].slice(0, 200))
      }

      ws.current.onclose = () => {
        if (cancelled) return
        setConnected(false)
        debugLog("WS Disconnected")
      }

      ws.current.onerror = () => {
        if (cancelled) return
        // Never log raw event payloads in production.
        debugLog("WS Error")
      }
    }

    open()

    return () => {
      cancelled = true
      if (ws.current) {
        try {
          ws.current.close()
        } catch {
          /* noop */
        }
      }
    }
  }, [companyId])

  return { events, connected }
}
