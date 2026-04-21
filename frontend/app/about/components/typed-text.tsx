"use client"

import { useEffect, useRef, useState } from "react"

type TypedTextProps = {
  strings: string[]
  className?: string
  startDelay?: number
  typeSpeed?: number
  loop?: boolean
  showCursor?: boolean
  threshold?: number
  backDelay?: number
  backSpeed?: number
}

type Mode = "typing" | "backspacing" | "done"

export function TypedText({
  strings,
  className,
  startDelay = 120,
  typeSpeed = 55,
  loop = true,
  showCursor = true,
  threshold = 0.35,
  backDelay = 1800,
  backSpeed = 30,
}: TypedTextProps) {
  const elRef = useRef<HTMLSpanElement>(null)
  const timerRef = useRef<number | null>(null)
  const startedRef = useRef(false)
  const [started, setStarted] = useState(false)
  const [stringIndex, setStringIndex] = useState(0)
  const [text, setText] = useState("")
  const [mode, setMode] = useState<Mode>("typing")

  useEffect(() => {
    const el = elRef.current
    if (!el) return

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
      startedRef.current = true
      setStarted(true)
      setText(strings[strings.length - 1] ?? "")
      setStringIndex(Math.max(strings.length - 1, 0))
      setMode("done")
      return clearTimer
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || startedRef.current) continue

          startedRef.current = true
          clearTimer()
          timerRef.current = window.setTimeout(() => {
            setStarted(true)
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
  }, [startDelay, strings, threshold])

  useEffect(() => {
    if (!started) return

    const currentString = strings[stringIndex] ?? ""

    if (mode === "done") return

    const clearTimer = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    if (mode === "typing") {
      if (text.length < currentString.length) {
        timerRef.current = window.setTimeout(() => {
          setText(currentString.slice(0, text.length + 1))
        }, typeSpeed)
      } else {
        const hasNextString = stringIndex < strings.length - 1

        if (loop || hasNextString) {
          timerRef.current = window.setTimeout(() => {
            setMode("backspacing")
          }, backDelay)
        } else {
          setMode("done")
        }
      }
    } else if (mode === "backspacing") {
      if (text.length > 0) {
        timerRef.current = window.setTimeout(() => {
          setText(currentString.slice(0, text.length - 1))
        }, backSpeed)
      } else {
        setStringIndex((prev) => {
          const nextIndex = prev + 1
          return nextIndex < strings.length ? nextIndex : 0
        })
        setMode("typing")
      }
    }

    return clearTimer
  }, [
    backDelay,
    backSpeed,
    loop,
    mode,
    started,
    stringIndex,
    strings,
    text,
    typeSpeed,
  ])

  return (
    <span ref={elRef} className={className} aria-label={strings[0]}>
      {text}
      {showCursor ? <span aria-hidden className="typed-cursor">|</span> : null}
    </span>
  )
}
