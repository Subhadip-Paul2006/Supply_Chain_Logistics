"use client"

import { motion, useScroll, useTransform } from "framer-motion"

export function WireframeGlobe() {
  const { scrollYProgress } = useScroll()
  const rotateY = useTransform(scrollYProgress, [0, 1], [-18, 22])
  const rotateX = useTransform(scrollYProgress, [0, 1], [8, -6])
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1.06])

  const longitudes = [-96, -72, -48, -24, 0, 24, 48, 72, 96]
  const latitudes = [-72, -48, -24, 0, 24, 48, 72]

  const africaDots = Array.from({ length: 18 }, (_, row) =>
    Array.from({ length: 14 }, (_, col) => ({
      x: 298 + col * 10.5 + (row % 2 ? 3.5 : 0),
      y: 170 + row * 10.5,
      visible:
        (col > 1 || row < 15) &&
        (col < 12 || row < 10) &&
        !(row < 2 && col < 3) &&
        !(row > 13 && col > 9),
    })),
  ).flat()

  const europeDots = Array.from({ length: 7 }, (_, row) =>
    Array.from({ length: 10 }, (_, col) => ({
      x: 288 + col * 8.5 + (row % 2 ? 3.2 : 0),
      y: 122 + row * 8.2,
      visible:
        !(row < 2 && col < 2) &&
        !(row > 4 && col > 7) &&
        !(row === 6 && col < 2),
    })),
  ).flat()

  const middleEastDots = Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 9 }, (_, col) => ({
      x: 350 + col * 8.8 + (row % 2 ? 3.4 : 0),
      y: 138 + row * 8.6,
      visible: !(row > 2 && col > 6),
    })),
  ).flat()

  const madagascarDots = Array.from({ length: 6 }, (_, row) =>
    Array.from({ length: 3 }, (_, col) => ({
      x: 392 + col * 8.5 + (row % 2 ? 2 : 0),
      y: 274 + row * 9,
      visible: !(row < 1 && col > 1) && !(row > 4 && col < 1),
    })),
  ).flat()

  const southAmericaLines = Array.from({ length: 26 }, (_, index) => ({
    y: 86 + index * 10.2,
    x: 68 + Math.max(0, 42 - Math.abs(index - 11) * 1.8),
    width: 96 + Math.cos(index / 5) * 22,
  }))

  const asiaLines = Array.from({ length: 24 }, (_, index) => ({
    y: 92 + index * 9.4,
    x: 408 - Math.max(0, 16 - Math.abs(index - 8)) * 1.4,
    width: 126 + Math.sin(index / 4.5) * 26,
  }))

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        aria-hidden
        style={{ rotateY, rotateX, scale }}
        className="absolute left-1/2 top-1/2 h-[min(88vw,58rem)] w-[min(88vw,58rem)] -translate-x-1/2 -translate-y-1/2 opacity-[0.16] [perspective:1400px] [transform-style:preserve-3d] sm:opacity-[0.18]"
      >
        <svg
          viewBox="0 0 640 640"
          className="h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(248,249,251,0.28)" />
              <stop offset="58%" stopColor="rgba(248,249,251,0.08)" />
              <stop offset="100%" stopColor="rgba(248,249,251,0)" />
            </radialGradient>
            <clipPath id="globeClip">
              <circle cx="320" cy="320" r="232" />
            </clipPath>
          </defs>

          <circle cx="320" cy="320" r="246" fill="url(#globeGlow)" opacity="0.35" />
          <circle cx="320" cy="320" r="232" stroke="rgba(248,249,251,0.62)" strokeWidth="1.2" />
          <ellipse cx="320" cy="320" rx="232" ry="232" stroke="rgba(248,249,251,0.16)" strokeWidth="1" />
          <ellipse cx="320" cy="320" rx="232" ry="204" stroke="rgba(248,249,251,0.14)" strokeWidth="1" />
          <ellipse cx="320" cy="320" rx="232" ry="160" stroke="rgba(248,249,251,0.12)" strokeWidth="1" />
          <ellipse cx="320" cy="320" rx="232" ry="110" stroke="rgba(248,249,251,0.1)" strokeWidth="1" />

          {latitudes.map((latitude) => {
            const yRadius = Math.cos((latitude * Math.PI) / 180) * 232
            const y = 320 + Math.sin((latitude * Math.PI) / 180) * 232
            return (
              <ellipse
                key={latitude}
                cx="320"
                cy={y}
                rx={yRadius}
                ry={Math.max(12, yRadius * 0.18)}
                stroke="rgba(248,249,251,0.22)"
                strokeWidth="0.9"
              />
            )
          })}

          {longitudes.map((longitude) => {
            const xOffset = Math.sin((longitude * Math.PI) / 180) * 220
            const controlOffset = Math.cos((longitude * Math.PI) / 180) * 60
            return (
              <path
                key={longitude}
                d={`M ${320 + xOffset} 88 C ${320 + xOffset + controlOffset} 196, ${320 + xOffset + controlOffset} 444, ${320 + xOffset} 552`}
                stroke="rgba(248,249,251,0.2)"
                strokeWidth="0.9"
              />
            )
          })}

          <g clipPath="url(#globeClip)">
            <path
              d="M258 122c20-14 41-18 66-14 18 4 35 10 49 23 11 10 18 21 29 22 18 2 40 7 52 18 8 7 8 20-3 22-13 3-27-2-36 3-9 5-18 15-25 21-10 7-22 8-33 6-6-1-12-1-16 4-5 7-6 17-12 24-9 12-24 20-28 35-4 16-3 34-13 48-8 11-21 18-33 26-10 6-20 15-23 29-5 18-8 31-20 37-14 8-33-1-44-17-12-18-14-43-11-66 2-17 9-30 7-48-2-14-11-25-9-39 2-17 13-28 20-42 8-16 10-35 16-53 10-25 25-42 47-59Z"
              stroke="rgba(248,249,251,0.82)"
              strokeWidth="1.6"
            />
            <path
              d="M277 125c15-11 33-15 52-13 16 2 28 7 40 16 8 5 12 12 8 16-7 6-17 2-29 3-11 1-22 10-29 17-9 9-19 21-18 34 1 11-2 20-12 27-12 8-20 22-22 40-2 20 1 39-7 54-6 10-15 14-23 20-8 5-16 12-18 22-4 15-5 26-13 27-9 2-23-9-31-23-9-15-11-37-9-57 2-13 7-24 5-36-2-14-9-24-7-36 2-14 11-24 17-35 6-13 8-30 13-45 10-24 24-36 43-51Z"
              stroke="rgba(248,249,251,0.4)"
              strokeWidth="0.9"
            />

            {africaDots.filter((dot) => dot.visible).map((dot) => (
              <circle
                key={`af-${dot.x}-${dot.y}`}
                cx={dot.x}
                cy={dot.y}
                r="1.45"
                fill="rgba(248,249,251,0.78)"
              />
            ))}
            {europeDots.filter((dot) => dot.visible).map((dot) => (
              <circle
                key={`eu-${dot.x}-${dot.y}`}
                cx={dot.x}
                cy={dot.y}
                r="1.35"
                fill="rgba(248,249,251,0.8)"
              />
            ))}
            {middleEastDots.filter((dot) => dot.visible).map((dot) => (
              <circle
                key={`me-${dot.x}-${dot.y}`}
                cx={dot.x}
                cy={dot.y}
                r="1.25"
                fill="rgba(248,249,251,0.72)"
              />
            ))}
            {madagascarDots.filter((dot) => dot.visible).map((dot) => (
              <circle
                key={`md-${dot.x}-${dot.y}`}
                cx={dot.x}
                cy={dot.y}
                r="1.2"
                fill="rgba(248,249,251,0.7)"
              />
            ))}

            {southAmericaLines.map((line, index) => (
              <line
                key={`sa-${index}`}
                x1={line.x}
                y1={line.y}
                x2={line.x + line.width}
                y2={line.y}
                stroke="rgba(248,249,251,0.64)"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            ))}

            {asiaLines.map((line, index) => (
              <line
                key={`as-${index}`}
                x1={line.x}
                y1={line.y}
                x2={line.x + line.width}
                y2={line.y}
                stroke="rgba(248,249,251,0.6)"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            ))}

            <path
              d="M130 156c18-14 35-20 57-21 18 0 37 4 51 14 8 6 8 15-1 17-13 2-25 5-34 11-10 7-14 18-20 28-7 12-18 21-28 31-11 11-20 23-22 40-3 18 0 33-8 49-8 16-21 24-29 39-7 13-11 27-19 32"
              stroke="rgba(248,249,251,0.86)"
              strokeWidth="1.6"
            />
            <path
              d="M452 146c20 4 38 14 53 28 8 8 7 17-2 18-13 1-25 7-34 14-11 9-20 20-27 31-9 13-11 29-12 44-1 20 4 36-2 54-5 16-16 30-18 48-2 12 0 24 6 33"
              stroke="rgba(248,249,251,0.74)"
              strokeWidth="1.4"
            />
          </g>
        </svg>
      </motion.div>
    </div>
  )
}
