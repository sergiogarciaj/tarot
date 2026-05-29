"use client"

import { cn } from "@/lib/utils"

const PHASES = [
  { key: "sendero", label: "El Sendero" },
  { key: "sincronia", label: "Sincronía" },
  { key: "horizonte", label: "El Horizonte" },
] as const

/** A small moon that fills from crescent -> half -> full based on `fill` (0..1). */
function MoonPhase({ fill, active }: { fill: number; active: boolean }) {
  // fill 0 => thin crescent, 0.5 => half, 1 => full
  const cx = 12 - (1 - fill) * 9 // shadow circle offset
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full">
      <defs>
        <radialGradient id="moonGlow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#f1d479" />
          <stop offset="70%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#a4842a" />
        </radialGradient>
      </defs>
      {/* lit moon */}
      <circle cx="12" cy="12" r="9" fill="url(#moonGlow)" />
      {/* shadow that carves the phase */}
      {fill < 1 && (
        <circle cx={cx} cy="12" r="9" fill={active ? "#141c2f" : "#0d1321"} opacity={0.96} />
      )}
    </svg>
  )
}

export function AstralStepper({ current }: { current: number }) {
  // current is 0-based index of active step
  return (
    <div className="w-full px-2">
      <div className="relative flex items-end justify-between">
        {/* connecting constellation line */}
        <div className="absolute left-[14%] right-[14%] top-[18px] -z-0 h-px bg-gold/20" />
        <div
          className="absolute left-[14%] top-[18px] -z-0 h-px bg-gradient-to-r from-gold-deep via-gold to-gold-bright transition-all duration-700 ease-out"
          style={{ width: `${(current / (PHASES.length - 1)) * 72}%` }}
        />

        {PHASES.map((phase, i) => {
          const isActive = i === current
          const isDone = i < current
          const fill = i === 0 ? 0.32 : i === 1 ? 0.55 : 1
          return (
            <div key={phase.key} className="relative z-10 flex flex-1 flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full p-[3px] transition-all duration-500",
                  isActive
                    ? "scale-110 bg-midnight ring-1 ring-gold/70 animate-glow-pulse"
                    : isDone
                      ? "bg-midnight ring-1 ring-gold/40"
                      : "bg-midnight ring-1 ring-gold/15",
                )}
              >
                <div className={cn("h-full w-full transition-opacity", isActive || isDone ? "opacity-100" : "opacity-40")}>
                  <MoonPhase fill={fill} active={isActive} />
                </div>
              </div>
              <span
                className={cn(
                  "font-serif text-[11px] tracking-wide transition-colors",
                  isActive ? "text-gold text-glow" : isDone ? "text-gold/60" : "text-muted-foreground/60",
                )}
              >
                {phase.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
