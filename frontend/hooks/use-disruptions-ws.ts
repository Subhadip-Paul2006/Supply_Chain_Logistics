import { useEffect, useState, useRef } from "react"

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/disruptions"

export interface DisruptionEvent {
  type: string;
  event?: string;
  message?: string;
  channel?: string;
  [key: string]: any;
}

export function useDisruptionsWS(companyId: string = "pharma-distrib-india") {
  const [events, setEvents] = useState<DisruptionEvent[]>([])
  const [connected, setConnected] = useState(false)
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    const url = `${WS_URL}/${companyId}`
    console.log("Connecting to WS:", url)
    ws.current = new WebSocket(url)

    ws.current.onopen = () => {
      setConnected(true)
      console.log("WS Connected")
    }

    ws.current.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data)
        if (data.type === "heartbeat") return // Ignore heartbeats
        
        console.log("WS Received:", data)
        setEvents((prev) => [data, ...prev])
      } catch (err) {
        console.error("WS Parse Error:", err)
      }
    }

    ws.current.onclose = () => {
      setConnected(false)
      console.log("WS Disconnected")
    }

    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [companyId])

  return { events, connected }
}
