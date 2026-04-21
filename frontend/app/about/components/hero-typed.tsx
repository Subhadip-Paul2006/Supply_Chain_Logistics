"use client"

import { useEffect, useRef, useState } from "react"

type Phase = "idle" | "line1" | "line2" | "done"

export function HeroTyped({
  line1,
  line2,
  typeSpeed = 60,
}: {
  line1: string
  line2: string
  typeSpeed?: number
}) {
  const timerRef = useRef<number | null>(null)
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
      setLine2Text(line2)
      setPhase("done")
      return clearTimer
    }

    timerRef.current = window.setTimeout(() => {
      setPhase("line1")
    }, 250)

    return clearTimer
  }, [line1, line2])

  useEffect(() => {
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
      } else {
        timerRef.current = window.setTimeout(() => {
          setPhase("line2")
        }, 120)
      }
    } else if (phase === "line2") {
      if (line2Text.length < line2.length) {
        timerRef.current = window.setTimeout(() => {
          setLine2Text(line2.slice(0, line2Text.length + 1))
        }, typeSpeed)
      } else {
        timerRef.current = window.setTimeout(() => {
          setLine1Text("")
          setLine2Text("")
          setPhase("line1")
        }, 1800)
      }
    }

    return clearTimer
  }, [line1, line1Text, line2, line2Text, phase, typeSpeed])

  return (
    <>
      <span aria-label={line1}>
        {line1Text}
        {phase === "line1" ? (
          <span aria-hidden className="typed-cursor">
            |
          </span>
        ) : null}
      </span>
      <br />
      <span
        aria-label={line2}
        className={`text-primary transition-opacity duration-300 ${
          phase === "line2" || phase === "done" ? "opacity-100" : "opacity-0"
        }`}
      >
        {line2Text}
        {phase === "line2" || phase === "done" ? (
          <span aria-hidden className="typed-cursor">
            |
          </span>
        ) : null}
      </span>
    </>
  )
}
