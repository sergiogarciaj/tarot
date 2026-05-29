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

function CardBack({ size = "normal" }: { size?: "normal" | "large" }) {
  const isLarge = size === "large"
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
          <svg viewBox="0 0 64 64" className={cn("text-gold/80 animate-float", isLarge ? "h-14 w-14" : "h-9 w-9")} fill="currentColor">
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
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [stage, setStage] = useState<"selecting" | "revealing" | "reading">("selecting")
  const [flippedCards, setFlippedCards] = useState<boolean[]>([false, false, false])

  const themeLabel = THEMES.find((t) => t.key === theme)?.label ?? "General"
  const horizonLabel = HORIZONS.find((h) => h.key === horizon)?.label ?? "Hoy"

  // Helper to shuffle array
  const shuffleDeck = (array: TarotCard[]) => {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  // Shuffle deck on mount
  useEffect(() => {
    setDeck(shuffleDeck(TAROT_CARDS))
  }, [])

  const handleShuffle = () => {
    setDeck(shuffleDeck(TAROT_CARDS))
    setSelectedIndices([])
    setCurrentIndex(0)
  }

  const moveToNextCard = () => {
    if (deck.length === 0) return
    let nextIdx = (currentIndex + 1) % deck.length
    // Skip already selected cards
    while (selectedIndices.includes(nextIdx) && selectedIndices.length < deck.length) {
      nextIdx = (nextIdx + 1) % deck.length
    }
    setCurrentIndex(nextIdx)
  }

  const chooseCurrentCard = () => {
    if (deck.length === 0 || selectedIndices.includes(currentIndex)) return
    
    if (selectedIndices.length < 3) {
      const newSelection = [...selectedIndices, currentIndex]
      setSelectedIndices(newSelection)

      // Staggered transition to reveal animation once 3 cards are selected
      if (newSelection.length === 3) {
        setTimeout(() => {
          setStage("revealing")
        }, 1000)
      } else {
        // Move to the next unselected card automatically
        let nextIdx = (currentIndex + 1) % deck.length
        while (newSelection.includes(nextIdx) && newSelection.length < deck.length) {
          nextIdx = (nextIdx + 1) % deck.length
        }
        setCurrentIndex(nextIdx)
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
      <div className="flex h-full flex-col items-center justify-between py-1 w-full animate-step-in">
        <div className="text-center shrink-0">
          <p className="font-serif text-[10px] uppercase tracking-[0.3em] text-gold/70">{themeLabel}</p>
          <h2 className="mt-0.5 font-serif text-xl text-foreground text-glow">La Elección</h2>
          <p className="text-[11px] text-muted-foreground">Concentra tu mente en tu consulta</p>
        </div>

        {/* Selection slots */}
        <div className="flex gap-4 my-2 shrink-0">
          {POSITIONS.map((pos, idx) => {
            const cardIndex = selectedIndices[idx]
            const card = cardIndex !== undefined ? deck[cardIndex] : null

            return (
              <div key={pos} className="flex flex-col items-center gap-1">
                <div className={cn(
                  "w-12 h-18 rounded-lg border flex items-center justify-center bg-midnight-deep/40 relative overflow-hidden transition-all duration-300",
                  card ? "border-gold/60 shadow-[0_0_8px_rgba(212,175,55,0.3)]" : "border-dashed border-gold/20"
                )}>
                  {card ? (
                    <div className="absolute inset-0 p-0.5">
                      <CardBack />
                    </div>
                  ) : (
                    <span className="text-[10px] text-gold/30">{idx + 1}</span>
                  )}
                </div>
                <span className="text-[9px] font-serif italic text-gold/60">{pos}</span>
              </div>
            )
          })}
        </div>

        {/* Central Large Card Display */}
        <div className="relative my-2.5 flex flex-col items-center justify-center flex-1 min-h-0">
          {deck[currentIndex] && (
            <div 
              onClick={chooseCurrentCard}
              className="relative w-36 h-56 shrink-0 cursor-pointer select-none active:scale-98 hover:scale-102 transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.6)] rounded-xl"
            >
              <CardBack size="large" />
            </div>
          )}
          
          <span className="mt-2 text-[10px] font-sans text-gold/60 tracking-wider uppercase">
            Carta {currentIndex + 1} de 78
          </span>
        </div>

        {/* Control Buttons */}
        <div className="w-full flex flex-col items-center gap-2.5 shrink-0 pt-1">
          <div className="flex w-full items-center justify-center gap-3">
            <button
              onClick={handleShuffle}
              className="glass-soft flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-full text-[11px] font-serif text-gold/80 hover:text-gold transition-colors"
              title="Barajar el mazo"
            >
              <RotateCcw className="h-3 w-3" strokeWidth={2} />
              Barajar
            </button>

            <button
              onClick={moveToNextCard}
              className="glass flex items-center justify-center gap-1 px-4 py-1.5 rounded-full text-[11px] font-serif text-gold/80 hover:text-gold transition-colors"
            >
              Siguiente Carta &rarr;
            </button>
          </div>

          <GoldButton 
            onClick={chooseCurrentCard}
            className="w-full max-w-[200px] h-9 text-[11px] py-1.5 shadow-md"
          >
            Elegir esta carta
          </GoldButton>
        </div>

        {/* Guidance text */}
        <div className="w-full text-center px-4 mt-2 shrink-0">
          <p className="text-[10px] text-gold/85 italic min-h-[1.2rem]">
            {selectedIndices.length === 0 && "Elige la carta para tu Pasado..."}
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

