"use client"

import { useState } from "react"
import { GlassShineButton } from "@/app/docs/components/glass-shine-button"
import { Check, Code2 } from "@/components/ui/phosphor-icons"
import { SpotlightCard } from "@/app/docs/components/spotlight-card"

type TerminalBlockProps = {
  title: string
  body: string
  command: string
}

export function TerminalBlock({ title, body, command }: TerminalBlockProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <SpotlightCard className="rounded-[1.5rem] bg-[rgba(18,18,19,0.88)]" contentClassName="h-full">
      <div className="flex items-start justify-between gap-6 border-b border-[#E6B566]/12 px-5 py-4 sm:px-6">
        <div>
          <p className="font-geist text-xs uppercase tracking-[0.24em] text-[#E6B566]">
            {title}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#B0A99F]">{body}</p>
        </div>
        <GlassShineButton
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-full border border-[#E6B566]/16 bg-[#5A0F2E]/28 px-3 py-2 text-xs font-medium text-[#FBF6EE] transition-colors hover:border-[#E6B566]/35 hover:bg-[#C21807]/16"
        >
          {copied ? (
            <Check className="h-4 w-4 text-[#E6B566]" />
          ) : (
            <Code2 className="h-4 w-4 text-[#E6B566]" />
          )}
          {copied ? "Copied" : "Copy"}
        </GlassShineButton>
      </div>

      <div className="space-y-3 px-5 py-5 font-mono text-sm sm:px-6">
        {command.split("\n").map((line) => {
          const [head, ...tail] = line.split(" ")

          return (
            <div
              key={line}
              className="flex items-center gap-3 rounded-2xl border border-[#E6B566]/10 bg-[rgba(17,17,17,0.35)] px-4 py-3"
            >
              <span className="text-[#E6B566]">$</span>
              <span className="text-[#E6B566]">{head}</span>
              {tail.length ? (
                <span className="text-[#FBF6EE]">{tail.join(" ")}</span>
              ) : null}
            </div>
          )
        })}
      </div>
    </SpotlightCard>
  )
}
