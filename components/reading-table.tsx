"use client"

import { useEffect, useState, useRef } from "react"
import { RotateCcw } from "lucide-react"
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
        <div className="absolute top-1.5 left-1.5 text-[7px] text-gold/50">&#10022;</div>
        <div className="absolute top-1.5 right-1.5 text-[7px] text-gold/50">&#10022;</div>
        <div className="absolute bottom-1.5 left-1.5 text-[7px] text-gold/50">&#10022;</div>
        <div className="absolute bottom-1.5 right-1.5 text-[7px] text-gold/50">&#10022;</div>

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
  const [stage, setStage] = useState<"selecting" | "revealing" | "reading">("selecting")
  const [flippedCards, setFlippedCards] = useState<boolean[]>([false, false, false])
  const [activeTab, setActiveTab] = useState<number>(0)

  const scrollContainerRef = useRef<HTMLDivElement>(null)

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
  }

  const scrollDeck = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      })
    }
  }

  const handleCardClick = (index: number) => {
    if (selectedIndices.includes(index)) {
      // Allow deselecting
      setSelectedIndices(selectedIndices.filter((i) => i !== index))
      return
    }
    if (selectedIndices.length < 3) {
      const newSelection = [...selectedIndices, index]
      setSelectedIndices(newSelection)

      // Transition to reveal animation once 3 cards are selected
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

  // 1. SELECTING STAGE (Fanned Deck Carousel)
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

        {/* 78-card Carousel container */}
        <div className="w-full relative py-4 my-1 shrink-0 flex items-center px-2">
          {/* Left Navigation Chevron */}
          <button
            onClick={() => scrollDeck("left")}
            className="absolute left-1 z-20 glass-soft text-gold/80 hover:text-gold w-7 h-7 rounded-full flex items-center justify-center transition-colors active:scale-95 text-xs font-bold"
            aria-label="Deslizar izquierda"
          >
            &larr;
          </button>

          {/* Right Navigation Chevron */}
          <button
            onClick={() => scrollDeck("right")}
            className="absolute right-1 z-20 glass-soft text-gold/80 hover:text-gold w-7 h-7 rounded-full flex items-center justify-center transition-colors active:scale-95 text-xs font-bold"
            aria-label="Deslizar derecha"
          >
            &rarr;
          </button>

          {/* Edge fade gradients */}
          <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-midnight via-midnight/50 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-midnight via-midnight/50 to-transparent pointer-events-none z-10" />
          
          {/* Scrollable track */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-0 px-8 py-3 no-scrollbar scroll-smooth snap-x w-full"
          >
            {deck.map((card, idx) => {
              const selectedOrder = selectedIndices.indexOf(idx)
              const isSelected = selectedOrder !== -1

              return (
                <div 
                  key={idx}
                  onClick={() => handleCardClick(idx)}
                  className={cn(
                    "relative w-15 h-26 shrink-0 cursor-pointer transition-all duration-300 snap-center select-none",
                    isSelected ? "-translate-y-4 shadow-[0_0_15px_rgba(212,175,55,0.6)] scale-105" : "hover:-translate-y-2 hover:scale-102"
                  )}
                  style={{
                    marginLeft: idx > 0 ? "-2.05rem" : "0",
                    zIndex: isSelected ? 50 : idx,
                  }}
                >
                  <CardBack />
                  {isSelected && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gold text-midnight-deep rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] font-bold shadow-md border border-gold-bright">
                      {selectedOrder + 1}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Shuffle Button */}
        <div className="w-full flex justify-center shrink-0 my-1">
          <button
            onClick={handleShuffle}
            className="glass-soft flex items-center justify-center gap-1.5 px-4.5 py-1.5 rounded-full text-[11px] font-serif text-gold/80 hover:text-gold transition-colors shadow-sm"
          >
            <RotateCcw className="h-3 w-3" strokeWidth={2} />
            Barajar el Mazo
          </button>
        </div>

        {/* Guidance text */}
        <div className="w-full text-center px-4 mt-2 shrink-0">
          <p className="text-[10px] text-gold/85 italic min-h-[1.2rem]">
            {selectedIndices.length === 0 && "Desliza la baraja y elige la carta para tu Pasado..."}
            {selectedIndices.length === 1 && "Elige la carta para tu Presente..."}
            {selectedIndices.length === 2 && "Elige la carta para tu Futuro..."}
            {selectedIndices.length === 3 && "Preparando la revelación celestial..."}
          </p>
        </div>
      </div>
    )
  }

  // 2. REVEALING STAGE (Staggered 3D flips side by side)
  if (stage === "revealing") {
    return (
      <div className="flex h-full flex-col items-center justify-between py-2 w-full animate-step-in">
        <div className="text-center">
          <p className="font-serif text-xs uppercase tracking-[0.3em] text-gold/70">{themeLabel}</p>
          <h2 className="mt-1 font-serif text-xl text-foreground text-glow">La Revelación</h2>
          <p className="mt-1 text-xs text-muted-foreground">Volteando las cartas de tu destino...</p>
        </div>

        {/* 3 cards side-by-side */}
        <div className="flex items-center justify-center gap-2.5 my-4">
          {POSITIONS.map((pos, idx) => {
            const cardIndex = selectedIndices[idx]
            const card = deck[cardIndex]
            const isFlipped = flippedCards[idx]

            return (
              <div key={pos} className="flex flex-col items-center gap-1.5">
                <div 
                  className={cn(
                    "relative w-20 h-32 select-none perspective-1000 transition-all duration-1000",
                    isFlipped ? "shadow-[0_10px_20px_rgba(212,175,55,0.15)]" : "shadow-md"
                  )}
                >
                  <div 
                    className={cn(
                      "w-full h-full preserve-3d duration-1000 ease-out relative",
                      isFlipped ? "rotate-y-180" : ""
                    )}
                  >
                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden w-full h-full">
                      <CardBack />
                    </div>

                    {/* Front */}
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
                <span className="font-serif text-[10px] italic text-gold/70">{pos}</span>
                
                <span 
                  className={cn(
                    "text-[9px] font-sans text-foreground/80 text-center max-w-[4.8rem] leading-tight transition-opacity duration-700 min-h-[1.5rem]",
                    isFlipped ? "opacity-100" : "opacity-0"
                  )}
                >
                  {card?.name}
                </span>
              </div>
            )
          })}
        </div>

        {/* Empty footer during reveal */}
        <div className="h-10 w-full" />
      </div>
    )
  }

  // 3. READING STAGE (Full page cards display)
  const cardIndex = selectedIndices[activeTab]
  const card = deck[cardIndex]

  return (
    <div className="flex h-full flex-col items-center justify-between py-1.5 w-full animate-step-in">
      {/* Header */}
      <div className="text-center shrink-0">
        <p className="font-serif text-[10px] uppercase tracking-[0.3em] text-gold/70">{themeLabel}</p>
        <h2 className="mt-0.5 font-serif text-lg text-foreground text-glow">{horizonLabel}</h2>
      </div>

      {/* Tab Navigation for Past, Present, Future */}
      <div className="flex w-full justify-center gap-2 my-2 shrink-0">
        {POSITIONS.map((pos, idx) => (
          <button
            key={pos}
            onClick={() => setActiveTab(idx)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-serif border transition-all duration-300 cursor-pointer",
              activeTab === idx 
                ? "bg-gold text-midnight-deep border-gold font-bold shadow-[0_0_10px_rgba(212,175,55,0.4)]" 
                : "bg-midnight-deep/40 text-gold/60 border-gold/20 hover:text-gold"
            )}
          >
            {pos}
          </button>
        ))}
      </div>

      {/* Large Page-Filling Card Display */}
      <div className="relative my-2 flex flex-col items-center justify-center flex-1 min-h-0 w-full px-6">
        <div className="relative w-48 h-76 max-h-[48vh] shrink-0 shadow-[0_20px_45px_rgba(0,0,0,0.7)] rounded-2xl border border-gold/50 overflow-hidden bg-midnight-deep animate-step-in">
          {card && (
            <img 
              src={card.image} 
              alt={card.name} 
              className="w-full h-full object-cover"
            />
          )}
        </div>
        
        <h3 className="mt-3 font-serif text-lg text-gold text-glow text-center leading-tight">
          {card?.name}
        </h3>
        <p className="text-[10px] font-sans text-muted-foreground uppercase tracking-widest mt-1">
          Carta del {POSITIONS[activeTab]}
        </p>
      </div>

      {/* Question & Reset Section */}
      <div className="w-full px-2 shrink-0 pt-1">
        {question.trim() && (
          <p className="mb-3 text-center font-serif text-xs italic leading-relaxed text-muted-foreground max-w-[280px] mx-auto text-pretty">
            {'"'}
            {question}
            {'"'}
          </p>
        )}
        
        <div className="flex justify-center">
          <GoldButton onClick={onReset} className="h-9 text-xs py-1.5 max-w-[220px]">
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
            Iniciar un nuevo ritual
          </GoldButton>
        </div>
      </div>
    </div>
  )
}
