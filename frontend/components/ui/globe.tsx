"use client"

import type React from "react"

/**
 * Globe
 * -----
 * A decorative rotating globe with an overlaid "Global Activity Tracker"
 * visualization: animated great-circle arcs sweep across the sphere,
 * detection nodes pulse at key cities, and an outer radar ring keeps watch.
 *
 * Everything is pure SVG + CSS so it stays crisp at any scale.
 */

type Node = {
  id: string
  cx: number
  cy: number
  label: string
}

type Arc = {
  id: string
  d: string
  delay: number
  color: "teal" | "yellow" | "red"
}

// Coordinates are in a 250x250 viewBox centered on the globe
const NODES: Node[] = [
  { id: "nyc", cx: 70, cy: 95, label: "NYC" },
  { id: "lon", cx: 125, cy: 80, label: "LON" },
  { id: "sgp", cx: 185, cy: 135, label: "SGP" },
  { id: "tok", cx: 205, cy: 105, label: "TOK" },
  { id: "syd", cx: 200, cy: 175, label: "SYD" },
  { id: "sao", cx: 90, cy: 170, label: "SAO" },
  { id: "dxb", cx: 155, cy: 120, label: "DXB" },
  { id: "lax", cx: 50, cy: 110, label: "LAX" },
]

const ARCS: Arc[] = [
  { id: "a1", d: "M70,95 Q100,30 125,80", delay: 0, color: "teal" },
  { id: "a2", d: "M125,80 Q165,40 205,105", delay: 1.2, color: "teal" },
  { id: "a3", d: "M155,120 Q180,90 205,105", delay: 2.4, color: "yellow" },
  { id: "a4", d: "M70,95 Q30,140 90,170", delay: 3.0, color: "teal" },
  { id: "a5", d: "M205,105 Q225,150 200,175", delay: 1.8, color: "yellow" },
  { id: "a6", d: "M185,135 Q190,100 155,120", delay: 3.6, color: "red" },
  { id: "a7", d: "M50,110 Q90,40 125,80", delay: 4.2, color: "teal" },
  { id: "a8", d: "M90,170 Q145,220 200,175", delay: 2.0, color: "yellow" },
]

const colorMap = {
  teal: "#E4572E",
  yellow: "#2A2A35",
  red: "#C1121F",
}

const Globe: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="relative">
        {/* Outer rotating detection ring */}
        <div
          aria-hidden
          className="absolute inset-0 -m-10 rounded-full border border-primary/20"
          style={{
            borderStyle: "dashed",
            animation: "spin 40s linear infinite",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 -m-16 rounded-full border border-primary/10"
          style={{
            borderStyle: "dashed",
            animation: "spin 80s linear infinite reverse",
          }}
        />

        {/* Radar ping */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full border border-primary/40 pointer-events-none"
          style={{
            animation: "ringPulse 3.2s ease-out infinite",
          }}
        />

        {/* The globe sphere */}
        <div
          className="relative w-[250px] h-[250px] rounded-full overflow-hidden"
          style={{
            boxShadow:
              "0 0 40px rgba(228,87,46,0.28), -5px 0 8px rgba(248,249,251,0.2) inset, 15px 2px 25px #000 inset, -24px -2px 34px rgba(248,249,251,0.2) inset, 250px 0 44px rgba(0,0,0,0.4) inset, 150px 0 38px rgba(0,0,0,0.66) inset",
            backgroundImage:
              "url('https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/globe.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "left",
            animation: "earthRotate 30s linear infinite",
          }}
        >
          {/* Tint to match network palette */}
          <div
            aria-hidden
            className="absolute inset-0 bg-primary/10 mix-blend-overlay"
          />

          {/* Stars */}
          <span
            className="absolute left-[10px] top-[20px] w-1 h-1 bg-foreground rounded-full"
            style={{ animation: "twinkling 3s infinite" }}
          />
          <span
            className="absolute left-[220px] top-[40px] w-1 h-1 bg-foreground rounded-full"
            style={{ animation: "twinkling 2s infinite" }}
          />
          <span
            className="absolute left-[40px] top-[210px] w-1 h-1 bg-foreground rounded-full"
            style={{ animation: "twinkling 4s infinite" }}
          />
          <span
            className="absolute left-[190px] top-[200px] w-1 h-1 bg-foreground rounded-full"
            style={{ animation: "twinkling 2.5s infinite" }}
          />
        </div>

        {/* Activity Tracker SVG overlay */}
        <svg
          aria-hidden
          viewBox="0 0 250 250"
          className="absolute inset-0 w-[250px] h-[250px] pointer-events-none"
        >
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E4572E" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#E4572E" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Clip arcs to the sphere */}
          <clipPath id="sphereClip">
            <circle cx="125" cy="125" r="125" />
          </clipPath>

          <g clipPath="url(#sphereClip)">
            {/* Faint latitude lines */}
            {[-60, -30, 0, 30, 60].map((lat) => {
              const y = 125 + lat * 1.4
              const rx = Math.sqrt(Math.max(0, 125 * 125 - (y - 125) * (y - 125)))
              return (
                <ellipse
                  key={lat}
                  cx="125"
                  cy={y}
                  rx={rx}
                  ry={rx * 0.15}
                  fill="none"
                  stroke="#E4572E"
                  strokeOpacity="0.08"
                  strokeWidth="0.5"
                />
              )
            })}

            {/* Animated arcs */}
            {ARCS.map((arc) => (
              <path
                key={arc.id}
                d={arc.d}
                fill="none"
                stroke={colorMap[arc.color]}
                strokeWidth={arc.color === "red" ? 1.4 : 1.1}
                strokeLinecap="round"
                strokeDasharray="60 240"
                style={{
                  filter: `drop-shadow(0 0 3px ${colorMap[arc.color]})`,
                  animation: `arcDraw 5s ease-in-out ${arc.delay}s infinite`,
                }}
              />
            ))}

            {/* Detection nodes */}
            {NODES.map((n, i) => (
              <g key={n.id}>
                <circle
                  cx={n.cx}
                  cy={n.cy}
                  r="8"
                  fill="url(#nodeGlow)"
                  opacity="0.6"
                />
                <circle
                  cx={n.cx}
                  cy={n.cy}
                  r="2"
                  fill="#E4572E"
                  style={{
                    animation: `pulseNode 2.4s ease-in-out ${i * 0.3}s infinite`,
                    transformOrigin: `${n.cx}px ${n.cy}px`,
                  }}
                />
              </g>
            ))}
          </g>

          {/* Alarm node (outside clip, always red) */}
          <g>
            <circle cx="155" cy="120" r="3" fill="#C1121F">
              <animate
                attributeName="r"
                values="3;6;3"
                dur="1.4s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="1;0.3;1"
                dur="1.4s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        </svg>
      </div>
    </div>
  )
}

export default Globe
