"use client"

import { useEffect, useState, useRef } from "react"
import { RotateCcw, Hourglass } from "lucide-react"
import { THEMES } from "@/components/steps/step-intention"
import { HORIZONS } from "@/components/steps/step-horizon"
import { GoldButton } from "@/components/gold-button"
import { TAROT_CARDS, TarotCard } from "@/lib/cards-data"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"

interface Props {
  theme: string | null
  horizon: string | null
  question: string
  birthDate: string
  birthTime: string
  unknownTime: boolean
  onReset: () => void
  readingType: "trinidad" | "cruz" | "siono"
}

function CardBack({ size = "normal" }: { size?: "normal" | "large" }) {
  const treasures = size === "large"
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
          <svg viewBox="0 0 64 64" className={cn("text-gold/80 animate-float", treasures ? "h-14 w-14" : "h-9 w-9")} fill="currentColor">
            <path d="M32 4 C32 4, 38 18, 48 24 C38 30, 32 44, 32 44 C32 44, 26 30, 16 24 C26 18, 32 4, 32 4 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="32" cy="24" r="5" fill="currentColor" fillOpacity="0.4" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export function ReadingTable({
  theme,
  horizon,
  question,
  birthDate,
  birthTime,
  unknownTime,
  onReset,
  readingType = "trinidad"
}: Props) {
  const { data: session } = useSession()
  const [deck, setDeck] = useState<TarotCard[]>([])
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [stage, setStage] = useState<"selecting" | "revealing" | "reading">("selecting")
  const [flippedCards, setFlippedCards] = useState<boolean[]>([])
  const [activeTab, setActiveTab] = useState<number>(0)
  const [visitedTabs, setVisitedTabs] = useState<number[]>([0])
  const [reversedIndices, setReversedIndices] = useState<boolean[]>([])

  // AI Interpretation States
  const [interpretation, setInterpretation] = useState<{
    individual: { position: string; interpretation: string }[]
    synthesis: string
    binary_answer?: string
    isMock?: boolean
  } | null>(null)
  const [loadingInterpretation, setLoadingInterpretation] = useState<boolean>(false)
  const [interpretationError, setInterpretationError] = useState<string | null>(null)
  const [fetchedIndices, setFetchedIndices] = useState<string>("")

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const themeLabel = THEMES.find((t) => t.key === theme)?.label ?? "General"
  const horizonLabel = HORIZONS.find((h) => h.key === horizon)?.label ?? "Hoy"

  // Get dynamic positions based on reading type
  const getPositions = () => {
    if (readingType === "siono") return ["Consejo Astral"]
    if (readingType === "cruz") return ["Situación Actual", "Obstáculo", "Corona", "Raíz", "Desenlace"]
    return ["Pasado", "Presente", "Futuro"]
  }
  const POSITIONS = getPositions()

  // Helper to shuffle array
  const shuffleDeck = (array: TarotCard[]) => {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  // Shuffle deck on mount / readingType change
  useEffect(() => {
    setDeck(shuffleDeck(TAROT_CARDS))
    setSelectedIndices([])
    setReversedIndices([])
    setStage("selecting")
    setInterpretation(null)
    setActiveTab(0)
    setVisitedTabs([0])
    setFlippedCards(new Array(POSITIONS.length).fill(false))
  }, [readingType])

  const handleShuffle = () => {
    setDeck(shuffleDeck(TAROT_CARDS))
    setSelectedIndices([])
    setReversedIndices([])
  }

  const scrollDeck = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const handleCardClick = (index: number) => {
    if (selectedIndices.includes(index)) {
      // Allow deselecting
      const indexInSelection = selectedIndices.indexOf(index)
      setSelectedIndices(selectedIndices.filter((i) => i !== index))
      setReversedIndices(prev => prev.filter((_, idx) => idx !== indexInSelection))
      return
    }
    if (selectedIndices.length < POSITIONS.length) {
      const newSelection = [...selectedIndices, index]
      setSelectedIndices(newSelection)

      // Randomly determine if the card is reversed (50% probability)
      const isReversed = Math.random() < 0.5
      setReversedIndices(prev => [...prev, isReversed])

      // Transition to reveal animation once enough cards are selected
      if (newSelection.length === POSITIONS.length) {
        setTimeout(() => {
          setStage("revealing")
        }, 1000)
      }
    }
  }

  // Fetch AI interpretation once in "reading" stage
  const fetchInterpretation = async () => {
    setLoadingInterpretation(true)
    setInterpretationError(null)
    try {
      const selectedCardsData = selectedIndices.map((idx, i) => ({
        name: deck[idx]?.name,
        position: POSITIONS[i],
        isReversed: reversedIndices[i]
      }))

      const res = await fetch("/api/interpret", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          theme,
          horizon,
          question,
          birthDate,
          birthTime,
          unknownTime,
          userName: session?.user?.name || session?.user?.email || "Buscador del Destino",
          selectedCards: selectedCardsData,
          readingType
        })
      })

      if (!res.ok) {
        throw new Error("Error en la respuesta del oráculo.")
      }

      const data = await res.json()
      if (data.error) {
        throw new Error(data.error)
      }

      setInterpretation(data)
    } catch (err: any) {
      console.error(err)
      setInterpretationError(err.message || "No se pudo conectar con el oráculo celestial.")
    } finally {
      setLoadingInterpretation(false)
    }
  }

  useEffect(() => {
    if (stage === "reading" && selectedIndices.length === POSITIONS.length) {
      const currentKey = selectedIndices.map((idx, i) => `${idx}-${reversedIndices[i] ? "rev" : "up"}`).join(",")
      if (fetchedIndices !== currentKey) {
        setFetchedIndices(currentKey)
        fetchInterpretation()
      }
    }
  }, [stage, selectedIndices, reversedIndices, fetchedIndices, POSITIONS.length])

  // Handle staggered flips when stage is "revealing"
  useEffect(() => {
    if (stage === "revealing") {
      setFlippedCards(new Array(POSITIONS.length).fill(false))

      const timers: NodeJS.Timeout[] = []
      
      POSITIONS.forEach((_, i) => {
        const timer = setTimeout(() => {
          setFlippedCards(prev => {
            const next = [...prev]
            if (i < next.length) {
              next[i] = true
            }
            return next
          })
        }, 800 + i * 1000)
        timers.push(timer)
      })

      const finalTimer = setTimeout(() => {
        setStage("reading")
      }, 800 + POSITIONS.length * 1000 + 1000)

      return () => {
        timers.forEach(clearTimeout)
        clearTimeout(finalTimer)
      }
    }
  }, [stage, POSITIONS.length])

  // Track visited tabs in reading stage
  useEffect(() => {
    if (stage === "reading" && !visitedTabs.includes(activeTab)) {
      setVisitedTabs(prev => [...prev, activeTab])
    }
  }, [activeTab, stage, visitedTabs])

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
        <div className={cn("flex flex-wrap justify-center shrink-0 w-full my-3", POSITIONS.length === 5 ? "gap-2" : "gap-5")}>
          {POSITIONS.map((pos, idx) => {
            const cardIndex = selectedIndices[idx]
            const card = cardIndex !== undefined ? deck[cardIndex] : null
            
            // Dynamic sizing for slots to fit 5 cards nicely on mobile
            const slotSizeClass = POSITIONS.length === 5 ? "w-12 h-18 text-[9px]" : POSITIONS.length === 1 ? "w-20 h-30 text-sm" : "w-16 h-24 text-xs"

            return (
              <div key={pos} className="flex flex-col items-center gap-1">
                <div className={cn(
                  "rounded-xl border flex items-center justify-center bg-midnight-deep/40 relative overflow-hidden transition-all duration-300",
                  slotSizeClass,
                  card ? "border-gold/70 shadow-[0_0_12px_rgba(212,175,55,0.4)] scale-102" : "border-dashed border-gold/20"
                )}>
                  {card ? (
                    <div className="absolute inset-0 p-0.5">
                      <img
                        src={card.image}
                        alt={card.name}
                        className={cn(
                          "w-full h-full object-cover rounded-lg",
                          reversedIndices[idx] ? "rotate-180" : ""
                        )}
                      />
                    </div>
                  ) : (
                    <span className="font-serif text-gold/40">{idx + 1}</span>
                  )}
                </div>
                <span className="text-[9px] font-serif italic text-gold/70 mt-0.5 max-w-[65px] truncate text-center" title={pos}>
                  {pos}
                </span>
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
            className="flex overflow-x-auto gap-0 px-8 pt-8 pb-4 no-scrollbar scroll-smooth snap-x w-full"
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
            {selectedIndices.length < POSITIONS.length
              ? `Elige la carta para la posición: ${POSITIONS[selectedIndices.length]}...`
              : "Preparando la revelación celestial..."}
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

        {/* cards side-by-side */}
        <div className={cn("flex items-center justify-center w-full px-1 flex-wrap", POSITIONS.length === 5 ? "gap-1.5" : "gap-3")}>
          {POSITIONS.map((pos, idx) => {
            const cardIndex = selectedIndices[idx]
            const card = deck[cardIndex]
            const isFlipped = flippedCards[idx]

            const cardWidthClass = POSITIONS.length === 5 ? "w-[17%] max-w-[70px]" : POSITIONS.length === 1 ? "w-[65%] max-w-[190px]" : "w-[30%] max-w-[125px]"

            return (
              <div key={pos} className={cn("flex flex-col items-center gap-2", cardWidthClass)}>
                <div 
                  className={cn(
                    "relative w-full aspect-[2/3] select-none perspective-1000 transition-all duration-1000",
                    isFlipped 
                      ? "shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-105" 
                      : "shadow-md hover:scale-102"
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
                      <CardBack size={POSITIONS.length === 5 ? "normal" : "large"} />
                    </div>

                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full rounded-xl border border-gold/50 bg-midnight-deep p-1 shadow-inner flex items-center justify-center">
                      {card && (
                        <img 
                          src={card.image} 
                          alt={card.name} 
                          className={cn(
                            "w-full h-full object-contain rounded-lg transition-transform duration-500",
                            reversedIndices[idx] ? "rotate-180" : ""
                          )}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <span className="font-serif text-[9px] italic text-gold/70 mt-0.5 truncate w-full text-center" title={pos}>
                  {pos}
                </span>
                
                <span 
                  className={cn(
                    "text-[9px] font-sans text-foreground/80 text-center w-full leading-tight transition-opacity duration-700 min-h-[1.5rem]",
                    isFlipped ? "opacity-100" : "opacity-0"
                  )}
                >
                  <span className="truncate block">{card?.name}</span>
                  {isFlipped && reversedIndices[idx] && (
                    <span className="text-gold/80 block font-semibold text-[8px] leading-none mt-0.5">(Invertida)</span>
                  )}
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
  const isReversed = reversedIndices[activeTab]

  return (
    <div className="flex h-full flex-col items-center justify-between py-1.5 w-full animate-step-in relative">
      {/* Mystical Hourglass Loading Overlay */}
      {loadingInterpretation && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-midnight-deep/95 backdrop-blur-md rounded-[2.5rem] p-6 text-center animate-step-in">
          <div className="relative mb-6">
            {/* Spinning/flipping hourglass */}
            <div className="relative z-10 text-gold animate-[spin_3s_linear_infinite] p-5 bg-gold/5 rounded-full border border-gold/20 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
              <Hourglass className="h-10 w-10 text-gold-bright" strokeWidth={1.5} />
            </div>
            
            {/* Pulsing cosmic rings */}
            <div className="absolute inset-0 rounded-full border border-gold/10 animate-ping opacity-75" />
            <div className="absolute -inset-4 rounded-full border border-gold/5 animate-pulse" />
          </div>
          
          <h3 className="font-serif text-base text-gold text-glow mb-2">Invocando al Oráculo</h3>
          <p className="text-[11px] font-serif text-gold/80 italic max-w-[260px] leading-relaxed mx-auto">
            "El Oráculo Celestial está meditando tu lectura y consultando las corrientes del cosmos..."
          </p>
          <span className="text-[9px] text-muted-foreground/60 font-sans tracking-widest mt-4 uppercase animate-pulse">
            Sincronizando energías astrales
          </span>
        </div>
      )}
      {/* Header */}
      <div className="text-center shrink-0">
        <p className="font-serif text-[10px] uppercase tracking-[0.3em] text-gold/70">{themeLabel}</p>
        <h2 className="mt-0.5 font-serif text-lg text-foreground text-glow">{horizonLabel}</h2>
      </div>

      {/* Tab Navigation for card positions */}
      <div className="flex w-full justify-center gap-1.5 my-2 shrink-0 flex-wrap px-2">
        {POSITIONS.map((pos, idx) => {
          const firstUnvisited = POSITIONS.findIndex((_, i) => !visitedTabs.includes(i));
          const shouldPulse = idx === firstUnvisited;

          return (
            <button
              key={pos}
              onClick={() => setActiveTab(idx)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[10px] font-serif border transition-all duration-300 cursor-pointer relative",
                activeTab === idx 
                  ? "bg-gold text-midnight-deep border-gold font-bold shadow-[0_0_10px_rgba(212,175,55,0.4)]" 
                  : "bg-midnight-deep/40 text-gold/60 border-gold/20 hover:text-gold",
                shouldPulse && "animate-pulse shadow-[0_0_12px_rgba(212,175,55,0.6)] border-gold/60 text-gold/90"
              )}
            >
              {pos}
              {shouldPulse && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold"></span>
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 w-full overflow-y-auto no-scrollbar px-1 my-1 flex flex-col items-center">
        {/* Large Page-Filling Card Display */}
        <div 
          className={cn(
            "relative my-2 flex flex-col items-center justify-center w-full px-6 transition-all",
            activeTab < POSITIONS.length - 1 ? "cursor-pointer group" : ""
          )}
          onClick={() => {
            if (activeTab < POSITIONS.length - 1) setActiveTab(activeTab + 1)
          }}
        >
          <div className="relative w-64 h-[26rem] max-h-[46vh] shrink-0 shadow-[0_20px_45px_rgba(0,0,0,0.7)] rounded-2xl border border-gold/50 bg-midnight-deep p-1.5 animate-step-in flex items-center justify-center group-hover:shadow-[0_0_25px_rgba(212,175,55,0.3)] transition-shadow duration-300">
            {card && (
              <img 
                src={card.image} 
                alt={card.name} 
                className={cn(
                  "w-full h-full object-contain rounded-xl transition-transform duration-500",
                  isReversed ? "rotate-180" : ""
                )}
              />
            )}
            
            {/* Hint overlay to click for next card */}
            {activeTab < POSITIONS.length - 1 && (
              <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-midnight-deep/80 text-gold px-4 py-2 rounded-full font-serif text-xs border border-gold/30 shadow-lg backdrop-blur-sm flex items-center gap-2">
                  Siguiente Carta <span className="text-lg leading-none">&rarr;</span>
                </div>
              </div>
            )}
          </div>
          
          <h3 className="mt-3 font-serif text-lg text-gold text-glow text-center leading-tight">
            {card?.name}
            {isReversed && (
              <span className="text-xs text-gold/80 font-sans block mt-1 font-semibold">(Invertida)</span>
            )}
          </h3>
          <p className="text-[10px] font-sans text-muted-foreground uppercase tracking-widest mt-1">
            {readingType === "siono" ? "Tu Carta Revelada" : `Carta de: ${POSITIONS[activeTab]}`}
          </p>
        </div>

        {/* AI Interpretation Section */}
        <div className="w-full mt-4 px-4 pb-2">
          {loadingInterpretation ? (
            <div className="glass rounded-2xl p-5 border border-gold/20 flex flex-col items-center justify-center gap-3 animate-pulse">
              {/* Star loader */}
              <div className="animate-spin text-gold/75">
                <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M2 12h20M5.75 5.75l12.5 12.5M18.25 5.75L5.75 18.25" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-[11px] font-serif text-gold/80 italic text-center animate-glow-pulse">
                El Oráculo Celestial está meditando tu lectura...
              </p>
            </div>
          ) : interpretationError ? (
            <div className="glass rounded-2xl p-4 border border-destructive/30 bg-destructive/5 text-center">
              <p className="text-xs text-destructive-foreground/90 font-sans">{interpretationError}</p>
              <button 
                onClick={fetchInterpretation}
                className="mt-2 text-[10px] uppercase font-serif text-gold hover:text-gold-bright underline"
              >
                Volver a invocar al oráculo
              </button>
            </div>
          ) : interpretation ? (
            <div className="flex flex-col gap-4">
              
              {/* Binary Answer Badge for Si o No */}
              {readingType === "siono" && interpretation.binary_answer && (
                <div className="glass rounded-xl p-3 border border-gold/30 bg-gold/10 text-center flex flex-col items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.15)] animate-step-in">
                  <span className="text-[10px] uppercase font-serif tracking-widest text-gold/70">La Respuesta Cósmica es</span>
                  <span className={cn(
                    "text-3xl font-serif font-bold tracking-widest text-glow mt-1",
                    interpretation.binary_answer === "SÍ" ? "text-gold" : "text-destructive-foreground/90"
                  )}>
                    {interpretation.binary_answer}
                  </span>
                </div>
              )}

              {/* Individual Card Interpretation */}
              <div className="glass rounded-2xl p-4 border border-gold/20 bg-midnight-deep/30">
                <h4 className="font-serif text-xs text-gold uppercase tracking-wider mb-2 border-b border-gold/15 pb-1 flex justify-between items-center">
                  <span>Significado ({POSITIONS[activeTab]})</span>
                  <span className="text-[9px] text-muted-foreground font-sans lowercase">influencia personal</span>
                </h4>
                <p className="text-xs leading-relaxed text-foreground/90 font-sans text-pretty text-left">
                  {interpretation.individual.find(item => item.position === POSITIONS[activeTab])?.interpretation}
                </p>
              </div>

              {/* General Synthesis Interpretation */}
              <div className="glass rounded-2xl p-5 border border-gold/25 bg-gold/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 text-gold/10 pointer-events-none text-xl font-serif">
                  &#10022;
                </div>
                <h4 className="font-serif text-sm text-gold-bright uppercase tracking-widest mb-2.5 border-b border-gold/20 pb-1.5 text-center">
                  Interpretación Celestial
                </h4>
                <p className="text-xs leading-relaxed text-foreground/95 font-sans text-pretty text-left">
                  {interpretation.synthesis}
                </p>
                {interpretation.isMock && (
                  <p className="text-[9px] text-gold/40 text-center font-sans mt-3 border-t border-gold/10 pt-2 italic">
                    Modo Demostración — Configura la clave GEMINI_API_KEY en tu archivo .env para respuestas reales.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Question & Reset Section */}
      <div className="w-full px-2 shrink-0 pt-2 border-t border-gold/10 bg-midnight-deep/40">
        {question.trim() && (
          <p className="mb-2 text-center font-serif text-[11px] italic leading-relaxed text-muted-foreground max-w-[280px] mx-auto text-pretty">
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
