"use client"

import { Moon, Sparkles, Compass, HelpCircle } from "lucide-react"
import { Starfield } from "@/components/starfield"

export interface ReadingTypeOption {
  id: "trinidad" | "cruz" | "siono"
  title: string
  subtitle: string
  description: string
  cardsCount: number
  cost: number
  icon: React.ReactNode
}

import { useState, useEffect } from "react"

export function ReadingMenu({
  onSelect,
  onBack,
}: {
  onSelect: (type: "trinidad" | "cruz" | "siono") => void
  onBack: () => void
}) {
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/user/credits")
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.credits === 'number') {
          setCredits(data.credits)
        }
      })
      .catch(console.error)
  }, [])

  const options: ReadingTypeOption[] = [
    {
      id: "trinidad",
      title: "Trinidad del Destino",
      subtitle: "Tirada de 3 Cartas",
      description: "Explora la evolución de tu energía vital en los senderos del Pasado, Presente y Futuro.",
      cardsCount: 3,
      cost: 3,
      icon: <Sparkles className="h-5 w-5 text-gold" />,
    },
    {
      id: "cruz",
      title: "Cruz Astral",
      subtitle: "Tirada de 5 Cartas",
      description: "Análisis profundo de un dilema. Examina tu situación actual, obstáculos, corona mental, bases ocultas y desenlace.",
      cardsCount: 5,
      cost: 5,
      icon: <Compass className="h-5 w-5 text-gold" />,
    },
    {
      id: "siono",
      title: "Oráculo del Sí o No",
      subtitle: "Tirada de 1 Carta",
      description: "Obtén una respuesta directa, afirmativa o negativa, respaldada por la sabiduría del arcano revelado.",
      cardsCount: 1,
      cost: 1,
      icon: <HelpCircle className="h-5 w-5 text-gold" />,
    },
  ]

  return (
    <main className="cosmic-bg relative flex min-h-dvh items-center justify-center overflow-hidden p-0 sm:p-6">
      <Starfield />

      {/* Device frame */}
      <div className="relative z-10 flex h-dvh w-full max-w-[420px] flex-col sm:h-[840px] sm:max-h-[92vh] sm:rounded-[2.5rem] sm:border sm:border-gold/20 sm:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
        <div className="cosmic-bg flex h-full flex-col overflow-hidden px-6 pb-6 pt-7 sm:rounded-[2.5rem]">
          
          {/* Header */}
          <header className="relative flex shrink-0 items-center justify-between pb-5 border-b border-gold/15">
            <button
              onClick={onBack}
              title="Volver a la portada"
              className="flex h-8 w-8 items-center justify-center rounded-full text-gold/80 hover:text-gold transition-all hover:bg-gold/10 hover:scale-110 active:scale-95 focus:outline-none"
              aria-label="Volver a la portada"
            >
              <Moon className="h-4 w-4 text-gold animate-float" strokeWidth={1.75} fill="currentColor" />
            </button>
            <h1 className="font-serif text-sm tracking-[0.2em] text-gold/90 uppercase absolute left-1/2 -translate-x-1/2">
              Ritual del Destino
            </h1>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/20">
              <span className="text-[10px] font-sans text-gold/80 uppercase tracking-wider">Saldo</span>
              <span className="text-sm font-serif text-gold-bright">{credits !== null ? credits : '-'}</span>
            </div>
          </header>

          {/* Subtitle */}
          <div className="text-center py-5 shrink-0">
            <p className="font-serif italic text-xs text-gold/70">
              "Elige la tirada de cartas que canalizará la luz de los arcanos."
            </p>
          </div>

          {/* Selection List */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-4">
            {options.map((opt) => (
              <div
                key={opt.id}
                onClick={() => onSelect(opt.id)}
                className="group relative glass rounded-2xl p-5 border border-gold/15 bg-midnight-deep/20 hover:border-gold/45 hover:bg-midnight-deep/60 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all duration-300 cursor-pointer overflow-hidden animate-step-in"
              >
                {/* Gold glow top border on hover */}
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="flex items-start gap-4">
                  {/* Icon Frame */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/25 bg-gold/5 shadow-inner group-hover:scale-110 group-hover:border-gold/50 transition-all duration-300">
                    {opt.icon}
                  </div>

                  {/* Text */}
                  <div className="space-y-1.5 flex-1 text-left">
                    <div className="flex items-baseline justify-between gap-1">
                      <h2 className="font-serif text-sm text-foreground/95 group-hover:text-gold-bright transition-colors">
                        {opt.title}
                      </h2>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-sans text-gold/80 bg-gold/10 px-2 py-0.5 rounded border border-gold/20 shrink-0 uppercase tracking-widest">
                          {opt.cost} {opt.cost === 1 ? "Crédito" : "Créditos"}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] font-serif uppercase tracking-widest text-gold/75">
                      {opt.subtitle}
                    </p>
                    <p className="text-[11px] leading-relaxed text-muted-foreground group-hover:text-foreground/90 transition-colors font-sans">
                      {opt.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <footer className="text-center pt-3 shrink-0 border-t border-gold/10">
            <p className="font-serif text-[10px] italic tracking-wide text-gold/40">
              Arcana Aurea © Guía y Astrología Divina
            </p>
          </footer>

        </div>
      </div>
    </main>
  )
}
