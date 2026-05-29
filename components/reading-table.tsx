"use client"

import { useEffect, useState } from "react"
import { Sparkles, RotateCcw } from "lucide-react"
import { THEMES } from "@/components/steps/step-intention"
import { HORIZONS } from "@/components/steps/step-horizon"
import { GoldButton } from "@/components/gold-button"

interface Props {
  theme: string | null
  horizon: string | null
  question: string
  onReset: () => void
}

const POSITIONS = ["Pasado", "Presente", "Futuro"]

export function ReadingTable({ theme, horizon, question, onReset }: Props) {
  const [dealt, setDealt] = useState(0)
  const themeLabel = THEMES.find((t) => t.key === theme)?.label ?? "General"
  const horizonLabel = HORIZONS.find((h) => h.key === horizon)?.label ?? "Hoy"

  useEffect(() => {
    const timers = POSITIONS.map((_, i) => setTimeout(() => setDealt((d) => Math.max(d, i + 1)), 500 + i * 450))
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="flex h-full flex-col items-center justify-between py-2">
      <div className="text-center">
        <p className="font-serif text-xs uppercase tracking-[0.3em] text-gold/70">{themeLabel}</p>
        <h2 className="mt-1 font-serif text-2xl text-foreground text-glow">La Mesa de Lectura</h2>
        <p className="mt-1 text-xs text-muted-foreground">{horizonLabel}</p>
      </div>

      {/* Cards */}
      <div className="flex items-center justify-center gap-3">
        {POSITIONS.map((pos, i) => {
          const revealed = dealt > i
          return (
            <div key={pos} className="flex flex-col items-center gap-2">
              <div
                className="relative h-36 w-24 transition-all duration-700"
                style={{
                  transform: revealed ? "translateY(0) rotate(0)" : "translateY(40px) rotate(-8deg)",
                  opacity: revealed ? 1 : 0,
                }}
              >
                <div className="glass flex h-full w-full items-center justify-center rounded-xl border border-gold/40">
                  <div className="flex h-[88%] w-[86%] items-center justify-center rounded-lg border border-gold/30 bg-gradient-to-b from-midnight-soft to-midnight-deep">
                    <Sparkles
                      className="h-7 w-7 text-gold animate-float"
                      strokeWidth={1.5}
                      style={{ animationDelay: `${i * 0.4}s` }}
                    />
                  </div>
                </div>
              </div>
              <span className="font-serif text-[11px] italic text-gold/70">{pos}</span>
            </div>
          )
        })}
      </div>

      <div className="w-full">
        {question.trim() && (
          <p className="mb-3 text-center font-serif text-sm italic leading-relaxed text-muted-foreground text-pretty">
            {'"'}
            {question}
            {'"'}
          </p>
        )}
        <GoldButton onClick={onReset}>
          <RotateCcw className="h-4 w-4" strokeWidth={2} />
          Iniciar un nuevo ritual
        </GoldButton>
      </div>
    </div>
  )
}
