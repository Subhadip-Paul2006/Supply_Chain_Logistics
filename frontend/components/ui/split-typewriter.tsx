"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type Phase = "idle" | "line1" | "line2" | "pause"

interface SplitTypewriterProps {
  line1: string
  line2?: string
  line1ClassName?: string
  line2ClassName?: string
  typeSpeed?: number
  startDelay?: number
  pauseDelay?: number
  threshold?: number
}

export function SplitTypewriter({
  line1,
  line2,
  line1ClassName,
  line2ClassName,
  typeSpeed = 55,
  startDelay = 180,
  pauseDelay = 1800,
  threshold = 0.3,
}: SplitTypewriterProps) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const timerRef = useRef<number | null>(null)
  const startedRef = useRef(false)
  const [started, setStarted] = useState(false)
  const [phase, setPhase] = useState<Phase>("idle")
  const [line1Text, setLine1Text] = useState("")
  const [line2Text, setLine2Text] = useState("")

  useEffect(() => {
    const clearTimer = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    const prefersReduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (prefersReduce) {
      setLine1Text(line1)
      setLine2Text(line2 ?? "")
      setStarted(true)
      setPhase(line2 ? "line2" : "line1")
      return clearTimer
    }

    const el = containerRef.current
    if (!el) return clearTimer

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || startedRef.current) continue

          startedRef.current = true
          timerRef.current = window.setTimeout(() => {
            setStarted(true)
            setPhase("line1")
          }, startDelay)
          observer.disconnect()
          break
        }
      },
      { threshold },
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
      clearTimer()
    }
  }, [line1, line2, startDelay, threshold])

  useEffect(() => {
    if (!started) return

    const clearTimer = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    if (phase === "line1") {
      if (line1Text.length < line1.length) {
        timerRef.current = window.setTimeout(() => {
          setLine1Text(line1.slice(0, line1Text.length + 1))
        }, typeSpeed)
      } else if (line2) {
        timerRef.current = window.setTimeout(() => {
          setPhase("line2")
        }, 120)
      } else {
        timerRef.current = window.setTimeout(() => {
          setPhase("pause")
        }, pauseDelay)
      }
    } else if (phase === "line2") {
      if (line2 && line2Text.length < line2.length) {
        timerRef.current = window.setTimeout(() => {
          setLine2Text(line2.slice(0, line2Text.length + 1))
        }, typeSpeed)
      } else {
        timerRef.current = window.setTimeout(() => {
          setPhase("pause")
        }, pauseDelay)
      }
    } else if (phase === "pause") {
      timerRef.current = window.setTimeout(() => {
        setLine1Text("")
        setLine2Text("")
        setPhase("line1")
      }, 0)
    }

    return clearTimer
  }, [
    line1,
    line1Text,
    line2,
    line2Text,
    pauseDelay,
    phase,
    started,
    typeSpeed,
  ])

  const line1Cursor = phase === "line1"
  const line2Cursor = phase === "line2"

  return (
    <span ref={containerRef}>
      <span className={cn(line1ClassName)} aria-label={line1}>
        {line1Text}
        {line1Cursor ? (
          <span aria-hidden className="typed-cursor">
            |
          </span>
        ) : null}
      </span>
      {line2 ? (
        <span className={cn(line2ClassName)} aria-label={line2}>
          {line2Text}
          {line2Cursor ? (
            <span aria-hidden className="typed-cursor">
              |
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  )
}
