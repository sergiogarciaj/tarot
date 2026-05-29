"use client"

import { Heart, Briefcase, Activity, Sparkles, Coins, Compass } from "lucide-react"
import { cn } from "@/lib/utils"

export const THEMES = [
  { key: "amor", label: "Amor", Icon: Heart },
  { key: "trabajo", label: "Trabajo", Icon: Briefcase },
  { key: "salud", label: "Salud", Icon: Activity },
  { key: "espiritu", label: "Espíritu", Icon: Sparkles },
  { key: "dinero", label: "Dinero", Icon: Coins },
  { key: "general", label: "General", Icon: Compass },
] as const

interface Props {
  theme: string | null
  onTheme: (key: string) => void
  question: string
  onQuestion: (q: string) => void
}

export function StepIntention({ theme, onTheme, question, onQuestion }: Props) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h2 className="font-serif text-xl text-foreground text-balance">¿Qué busca tu alma?</h2>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          Elige el sendero de tu consulta al oráculo.
        </p>
      </div>

      {/* Theme grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {THEMES.map(({ key, label, Icon }) => {
          const active = theme === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onTheme(key)}
              aria-pressed={active}
              className={cn(
                "group relative flex flex-col items-center justify-center gap-1.5 rounded-2xl py-3.5 transition-all duration-300",
                active
                  ? "glass scale-[1.02] ring-1 ring-gold/60"
                  : "glass-soft hover:ring-1 hover:ring-gold/30",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300",
                  active
                    ? "bg-gradient-to-b from-gold-bright to-gold-deep text-midnight shadow-[0_0_16px_rgba(212,175,55,0.5)]"
                    : "bg-midnight-soft text-gold/70",
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </span>
              <span
                className={cn(
                  "font-sans text-[11px] font-medium tracking-wide transition-colors",
                  active ? "text-gold" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Custom question */}
      <div className="mt-auto">
        <label htmlFor="oracle-question" className="mb-1.5 block font-serif text-sm italic text-gold/80">
          Tu pregunta al oráculo
        </label>
        <div className="glass-soft rounded-2xl p-0.5">
          <textarea
            id="oracle-question"
            value={question}
            onChange={(e) => onQuestion(e.target.value)}
            rows={3}
            maxLength={180}
            placeholder="Susurra lo que deseas saber..."
            className="w-full resize-none rounded-[14px] bg-transparent px-3.5 py-3 font-sans text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
          <div className="px-3.5 pb-2 text-right font-sans text-[10px] text-muted-foreground/60">
            {question.length}/180
          </div>
        </div>
      </div>
    </div>
  )
}
