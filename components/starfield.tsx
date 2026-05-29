"use client"

import { useEffect, useMemo, useState } from "react"

type Star = {
  top: string
  left: string
  size: number
  dur: string
  delay: string
}

// Deterministic pseudo-random so server/client markup matches.
function seeded(i: number) {
  const x = Math.sin(i * 999.13) * 10000
  return x - Math.floor(x)
}

export function Starfield({ count = 46 }: { count?: number }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: count }).map((_, i) => ({
      top: `${seeded(i + 1) * 100}%`,
      left: `${seeded(i + 50) * 100}%`,
      size: 1 + Math.round(seeded(i + 99) * 2),
      dur: `${3 + seeded(i + 7) * 4}s`,
      delay: `${seeded(i + 3) * 5}s`,
    }))
  }, [count])

  if (!mounted) return <div aria-hidden className="pointer-events-none absolute inset-0" />

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s, i) => (
        <span
          key={i}
          className="star"
          style={
            {
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              "--dur": s.dur,
              "--delay": s.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
