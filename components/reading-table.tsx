"use client"

import { useEffect, useState } from "react"
import { Sparkles, RotateCcw } from "lucide-react"
import { THEMES } from "@/components/steps/step-intention"
import { HORIZONS } from "@/components/steps/step-horizon"
import { GoldButton } from "@/components/gold-button"
import { TAROT_CARDS, TarotCard } from "@/lib/cards-data"
import { cn } from "@/lib/utils"

interface Props {
  theme: string | null
  horizon: string | null
  question: string
  onReset: () => void
}

const POSITIONS = ["Pasado", "Presente", "Futuro"]

function CardBack() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-xl border border-gold/40 bg-gradient-to-b from-midnight-soft to-midnight-deep shadow-inner p-1 select-none">
      <div className="flex h-full w-full flex-col items-center justify-between rounded-lg border border-gold/25 p-2 relative overflow-hidden">
        {/* Subtle background stars grid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--gold)_1px,transparent_1px)] bg-[size:8px_8px]" />
        
        {/* Corner stars */}
        <div className="absolute top-1 left-1 text-[7px] text-gold/50">&#10022;</div>
        <div className="absolute top-1 right-1 text-[7px] text-gold/50">&#10022;</div>
        <div className="absolute bottom-1 left-1 text-[7px] text-gold/50">&#10022;</div>
        <div className="absolute bottom-1 right-1 text-[7px] text-gold/50">&#10022;</div>

        {/* Center symbol */}
        <div className="my-auto flex flex-col items-center justify-center">
          <svg viewBox="0 0 64 64" className="h-9 w-9 text-gold/80 animate-float" fill="currentColor">
            <path d="M32 4 C32 4, 38 18, 48 24 C38 30, 32 44, 32 44 C32 44, 26 30, 16 24 C26 18, 32 4, 32 4 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="32" cy="24" r="5" fill="currentColor" fillOpacity="0.4" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export function ReadingTable({ theme, horizon, question, onReset }: Props) {
  const [deck, setDeck] = useState<TarotCard[]>([])
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [stage, setStage] = useState<"selecting" | "revealing" | "reading">("selecting")
  const [flippedCards, setFlippedCards] = useState<boolean[]>([false, false, false])

  const themeLabel = THEMES.find((t) => t.key === theme)?.label ?? "General"
  const horizonLabel = HORIZONS.find((h) => h.key === horizon)?.label ?? "Hoy"

  // Shuffle deck on mount
  useEffect(() => {
    const shuffle = (array: TarotCard[]) => {
      const arr = [...array]
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
      }
      return arr
    }
    setDeck(shuffle(TAROT_CARDS))
  }, [])

  const handleCardClick = (index: number) => {
    if (selectedIndices.includes(index)) {
      // Allow deselecting if not yet locked
      setSelectedIndices(selectedIndices.filter((i) => i !== index))
      return
    }
    if (selectedIndices.length < 3) {
      const newSelection = [...selectedIndices, index]
      setSelectedIndices(newSelection)

      // Staggered transition to reveal animation once 3 cards are selected
      if (newSelection.length === 3) {
        setTimeout(() => {
          setStage("revealing")
        }, 1000)
      }
    }
  }

  // Handle staggered flips when stage is "revealing"
  useEffect(() => {
    if (stage === "revealing") {
      const timer1 = setTimeout(() => {
        setFlippedCards([true, false, false])
      }, 800)

      const timer2 = setTimeout(() => {
        setFlippedCards([true, true, false])
      }, 1800)

      const timer3 = setTimeout(() => {
        setFlippedCards([true, true, true])
      }, 2800)

      const timer4 = setTimeout(() => {
        setStage("reading")
      }, 3800)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
        clearTimeout(timer4)
      }
    }
  }, [stage])

  // 1. SELECTING STAGE
  if (stage === "selecting") {
    return (
      <div className="flex h-full flex-col items-center justify-between py-2 w-full animate-step-in">
        <div className="text-center">
          <p className="font-serif text-xs uppercase tracking-[0.3em] text-gold/70">{themeLabel}</p>
          <h2 className="mt-1 font-serif text-2xl text-foreground text-glow">La Elección</h2>
          <p className="mt-1 text-xs text-muted-foreground">Concentra tu mente y elige 3 cartas</p>
        </div>

        {/* Selection slots */}
        <div className="flex gap-4 my-2">
          {POSITIONS.map((pos, idx) => {
            const cardIndex = selectedIndices[idx]
            const card = cardIndex !== undefined ? deck[cardIndex] : null

            return (
              <div key={pos} className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-22 rounded-lg border border-dashed border-gold/30 flex items-center justify-center bg-midnight-deep/40 relative overflow-hidden">
                  {card ? (
                    <div className="absolute inset-0 p-0.5">
                      <CardBack />
                    </div>
                  ) : (
                    <span className="text-[10px] text-gold/40">{idx + 1}</span>
                  )}
                </div>
                <span className="text-[10px] font-serif italic text-gold/60">{pos}</span>
              </div>
            )
          })}
        </div>

        {/* Horizontal scrollable deck spread */}
        <div className="w-full relative py-6 my-2">
          {/* Edge fade gradients */}
          <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-midnight via-midnight/50 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-midnight via-midnight/50 to-transparent pointer-events-none z-10" />
          
          <div className="flex overflow-x-auto gap-0 px-8 py-4 no-scrollbar scroll-smooth snap-x">
            {deck.map((card, idx) => {
              const selectedOrder = selectedIndices.indexOf(idx)
              const isSelected = selectedOrder !== -1

              return (
                <div 
                  key={idx}
                  onClick={() => handleCardClick(idx)}
                  className={cn(
                    "relative w-16 h-28 shrink-0 cursor-pointer transition-all duration-300 snap-center select-none",
                    isSelected ? "-translate-y-4 shadow-[0_0_15px_rgba(212,175,55,0.6)] scale-105" : "hover:-translate-y-2 hover:scale-102"
                  )}
                  style={{
                    marginLeft: idx > 0 ? "-2.1rem" : "0",
                    zIndex: isSelected ? 50 : idx,
                  }}
                >
                  <CardBack />
                  {isSelected && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-midnight-deep rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md border border-gold-bright">
                      {selectedOrder + 1}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Guidance text */}
        <div className="w-full text-center px-4">
          <p className="text-xs text-gold/80 italic min-h-[1.5rem]">
            {selectedIndices.length === 0 && "Toca el mazo y desliza para ver todas las cartas..."}
            {selectedIndices.length === 1 && "Elige la carta para tu Presente..."}
            {selectedIndices.length === 2 && "Elige la carta para tu Futuro..."}
            {selectedIndices.length === 3 && "Preparando la revelación celestial..."}
          </p>
        </div>
      </div>
    )
  }

  // 2. REVEALING & READING STAGES
  return (
    <div className="flex h-full flex-col items-center justify-between py-2 w-full animate-step-in">
      <div className="text-center">
        <p className="font-serif text-xs uppercase tracking-[0.3em] text-gold/70">{themeLabel}</p>
        <h2 className="mt-1 font-serif text-2xl text-foreground text-glow">La Mesa de Lectura</h2>
        <p className="mt-1 text-xs text-muted-foreground">{horizonLabel}</p>
      </div>

      {/* Cards spread layout */}
      <div className="flex items-center justify-center gap-3 my-4">
        {POSITIONS.map((pos, idx) => {
          const cardIndex = selectedIndices[idx]
          const card = deck[cardIndex]
          const isFlipped = flippedCards[idx]

          return (
            <div key={pos} className="flex flex-col items-center gap-2">
              <div 
                className={cn(
                  "relative w-24 h-40 select-none perspective-1000 transition-all duration-1000",
                  isFlipped ? "shadow-[0_10px_25px_rgba(212,175,55,0.15)]" : "shadow-lg"
                )}
              >
                <div 
                  className={cn(
                    "w-full h-full preserve-3d duration-1000 ease-out relative",
                    isFlipped ? "rotate-y-180" : ""
                  )}
                >
                  {/* Card Back */}
                  <div className="absolute inset-0 backface-hidden w-full h-full">
                    <CardBack />
                  </div>

                  {/* Card Front */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full rounded-xl border border-gold/50 overflow-hidden bg-midnight shadow-inner">
                    {card && (
                      <img 
                        src={card.image} 
                        alt={card.name} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>
              <span className="font-serif text-[11px] italic text-gold/70">{pos}</span>
              
              {/* Card name (revealed after flip) */}
              <span 
                className={cn(
                  "text-[10px] font-sans text-foreground/80 text-center max-w-[5.5rem] leading-tight transition-opacity duration-700 min-h-[2rem]",
                  isFlipped ? "opacity-100" : "opacity-0"
                )}
              >
                {card?.name}
              </span>
            </div>
          )
        })}
      </div>

      {/* Question & Reset Section */}
      <div className="w-full px-2">
        {stage === "reading" && question.trim() && (
          <p className="mb-4 text-center font-serif text-sm italic leading-relaxed text-muted-foreground text-pretty">
            {'"'}
            {question}
            {'"'}
          </p>
        )}
        
        {stage === "reading" && (
          <div className="animate-step-in">
            <GoldButton onClick={onReset}>
              <RotateCcw className="h-4 w-4" strokeWidth={2} />
              Iniciar un nuevo ritual
            </GoldButton>
          </div>
        )}
      </div>
    </div>
  )
}
