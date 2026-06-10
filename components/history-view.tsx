"use client"

import { useState, useEffect } from "react"
import { Moon, Trash2, Calendar, BookOpen, Compass, ChevronDown, ChevronUp } from "lucide-react"
import { Starfield } from "@/components/starfield"
import { GoldButton } from "@/components/gold-button"
import { cn } from "@/lib/utils"

interface Reading {
  id: number
  reading_type: string
  date: string
  theme: string
  horizon: string
  question: string
  cards: { name: string; position: string; isReversed: boolean }[]
  synthesis: string
}

export function HistoryView({ onHome }: { onHome: () => void }) {
  const [readings, setReadings] = useState<Reading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [selectedTab, setSelectedTab] = useState<"trinidad" | "cruz" | "siono">("trinidad")

  const fetchReadings = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/readings")
      if (!res.ok) {
        throw new Error("No se pudieron cargar las lecturas.")
      }
      const data = await res.json()
      setReadings(data.readings || [])
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Error al conectar con la base de datos.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReadings()
  }, [])

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent expanding/collapsing when clicking delete
    
    if (!confirm("¿Estás seguro de que deseas borrar este registro de tu historial celestial?")) {
      return
    }

    try {
      const res = await fetch(`/api/readings?id=${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        throw new Error("No se pudo eliminar el registro.")
      }
      setReadings((prev) => prev.filter((r) => r.id !== id))
      if (expandedId === id) {
        setExpandedId(null)
      }
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Error al borrar el registro.")
    }
  }

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  // Filter readings by selected reading type tab
  const filteredReadings = readings.filter((r) => r.reading_type === selectedTab)

  return (
    <main className="cosmic-bg relative flex min-h-dvh items-center justify-center overflow-hidden p-0 sm:p-6">
      <Starfield />

      {/* Device frame */}
      <div className="relative z-10 flex h-dvh w-full max-w-[420px] flex-col sm:h-[840px] sm:max-h-[92vh] sm:rounded-[2.5rem] sm:border sm:border-gold/20 sm:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
        <div className="cosmic-bg flex h-full flex-col overflow-hidden px-6 pb-6 pt-7 sm:rounded-[2.5rem]">
          
          {/* Header */}
          <header className="relative flex shrink-0 items-center justify-center pb-4 border-b border-gold/15">
            <button
              onClick={onHome}
              title="Volver a la portada"
              className="absolute left-0 top-0.5 flex h-6 w-6 items-center justify-center rounded-full text-gold/80 hover:text-gold transition-all hover:bg-gold/10 hover:scale-110 active:scale-95 focus:outline-none"
              aria-label="Volver a la portada"
            >
              <Moon className="h-4 w-4 text-gold animate-float" strokeWidth={1.75} fill="currentColor" />
            </button>
            <h1 className="font-serif text-base tracking-[0.25em] text-gold/90 uppercase">Historial Astral</h1>
          </header>

          {/* Reading Type Tabs */}
          {(() => {
            const trinidadCount = readings.filter((r) => r.reading_type === "trinidad").length
            const cruzCount = readings.filter((r) => r.reading_type === "cruz").length
            const sionoCount = readings.filter((r) => r.reading_type === "siono").length

            return (
              <div className="flex w-full justify-center gap-1.5 shrink-0 py-3 border-b border-gold/10 flex-wrap">
                {[
                  { id: "trinidad", label: `Trinidad (${trinidadCount})` },
                  { id: "cruz", label: `Cruz Astral (${cruzCount})` },
                  { id: "siono", label: `Sí o No (${sionoCount})` }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSelectedTab(tab.id as any)
                      setExpandedId(null)
                    }}
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-serif border transition-all duration-300 cursor-pointer",
                      selectedTab === tab.id
                        ? "bg-gold text-midnight-deep border-gold font-bold shadow-[0_0_8px_rgba(212,175,55,0.3)]"
                        : "bg-midnight-deep/40 text-gold/60 border-gold/20 hover:text-gold"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )
          })()}

          {/* Body List Area */}
          <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-4">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <div className="animate-spin text-gold/75">
                  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M2 12h20M5.75 5.75l12.5 12.5M18.25 5.75L5.75 18.25" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-xs font-serif text-gold/70 italic animate-pulse">
                  Abriendo tu libro de destino...
                </p>
              </div>
            ) : error ? (
              <div className="glass rounded-2xl p-5 border border-destructive/30 bg-destructive/5 text-center mt-20">
                <p className="text-xs text-destructive-foreground/90 font-sans">{error}</p>
                <button 
                  onClick={fetchReadings}
                  className="mt-3 text-xs uppercase font-serif text-gold hover:text-gold-bright underline"
                >
                  Volver a cargar
                </button>
              </div>
            ) : filteredReadings.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4 mt-12 space-y-6">
                <div className="text-gold/20 text-5xl font-serif">&#10022;</div>
                <p className="text-sm font-serif italic text-muted-foreground/80 leading-relaxed text-balance">
                  {selectedTab === "trinidad" && "No hay lecturas registradas para Trinidad del Destino."}
                  {selectedTab === "cruz" && "No hay lecturas registradas para la Cruz Astral."}
                  {selectedTab === "siono" && "No hay lecturas registradas para el Oráculo del Sí o No."}
                </p>
                <GoldButton onClick={onHome} className="max-w-[200px] h-10 text-xs py-2">
                  Iniciar nuevo ritual
                </GoldButton>
              </div>
            ) : (
              filteredReadings.map((reading) => {
                const isExpanded = expandedId === reading.id
                const cardsCount = reading.cards.length
                
                // Dynamic grid styles for different card counts
                const gridColsClass = cardsCount === 5 ? "grid-cols-5 gap-1.5" : cardsCount === 1 ? "grid-cols-1 max-w-[110px] mx-auto" : "grid-cols-3 gap-2.5"
                const cardWidthClass = cardsCount === 5 ? "w-11 h-16" : cardsCount === 1 ? "w-24 h-36" : "w-[72px] h-[108px]"

                return (
                  <div
                    key={reading.id}
                    onClick={() => toggleExpand(reading.id)}
                    className={cn(
                      "glass rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer",
                      isExpanded 
                        ? "border-gold/45 bg-midnight-deep/60 shadow-[0_0_15px_rgba(212,175,55,0.15)]" 
                        : "border-gold/15 bg-midnight-deep/20 hover:border-gold/30"
                    )}
                  >
                    {/* Header Row */}
                    <div className="p-4 flex items-center justify-between gap-2">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-[10px] text-gold/70 font-serif uppercase tracking-wider">
                          <Calendar className="h-3 w-3" />
                          <span>{reading.date}</span>
                          <span>•</span>
                          <span className="text-gold">{reading.theme}</span>
                        </div>
                        <h3 className="font-serif text-xs text-foreground/90 truncate pr-2">
                          {reading.question ? `"${reading.question}"` : "Guía y Sincronía General"}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => handleDelete(reading.id, e)}
                          title="Borrar lectura"
                          className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors focus:outline-none"
                          aria-label="Borrar lectura"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gold/80" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gold/50" />
                        )}
                      </div>
                    </div>

                    {/* Expandable Section */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-gold/10 space-y-4 animate-step-in">
                        {/* Summary / Horizon */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground font-sans">
                          <span className="flex items-center gap-1">
                            <Compass className="h-3.5 w-3.5 text-gold/60" />
                            Horizonte: <strong className="text-foreground/90">{reading.horizon}</strong>
                          </span>
                        </div>

                        {/* Cards Visualization Row */}
                        <div className={cn("grid pt-1.5", gridColsClass)}>
                          {reading.cards.map((c, i) => (
                            <div key={i} className="flex flex-col items-center text-center space-y-1 min-w-0">
                              <div className={cn("relative rounded-lg border border-gold/30 bg-midnight p-0.5 overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.5)]", cardWidthClass)}>
                                <img
                                  src={`/images/tarot_cards/${c.name}.png`}
                                  alt={c.name}
                                  className={cn(
                                    "w-full h-full object-cover rounded-md",
                                    c.isReversed ? "rotate-180" : ""
                                  )}
                                />
                              </div>
                              <span className="text-[9px] font-serif text-gold leading-tight truncate w-full" title={c.name}>
                                {c.name}
                              </span>
                              <span className="text-[7px] uppercase tracking-wider text-muted-foreground font-sans leading-none truncate w-full" title={c.position}>
                                {c.position}
                                {c.isReversed && (
                                  <span className="text-gold/80 block mt-0.5 font-semibold font-sans normal-case">(Invertida)</span>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Oracle Synthesis */}
                        <div className="glass rounded-xl p-3.5 border border-gold/20 bg-gold/5 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-1 text-gold/10 pointer-events-none text-base font-serif">
                            &#10022;
                          </div>
                          <h4 className="font-serif text-[10px] text-gold-bright uppercase tracking-widest mb-1.5 border-b border-gold/10 pb-1 flex items-center gap-1.5">
                            <BookOpen className="h-3 w-3" />
                            Mensaje del Oráculo
                          </h4>
                          <p className="text-[11px] leading-relaxed text-foreground/95 font-sans text-pretty text-left">
                            {reading.synthesis}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
