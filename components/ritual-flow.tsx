"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Moon } from "lucide-react"
import { useSession } from "next-auth/react"
import { Starfield } from "@/components/starfield"
import { AstralStepper } from "@/components/astral-stepper"
import { GoldButton } from "@/components/gold-button"
import { StepIntention } from "@/components/steps/step-intention"
import { StepAstral } from "@/components/steps/step-astral"
import { StepHorizon } from "@/components/steps/step-horizon"
import { ReadingTable } from "@/components/reading-table"
import { cn } from "@/lib/utils"

export function RitualFlow({ onHome }: { onHome: () => void }) {
  const { data: session } = useSession()
  const [step, setStep] = useState(0)
  const [revealed, setRevealed] = useState(false)

  // Step 1
  const [theme, setTheme] = useState<string | null>(null)
  const [question, setQuestion] = useState("")
  // Step 2
  const [birthDate, setBirthDate] = useState("")
  const [birthTime, setBirthTime] = useState("")
  const [unknownTime, setUnknownTime] = useState(false)
  // Step 3
  const [horizon, setHorizon] = useState<string | null>(null)

  const canContinue =
    step === 0 ? theme !== null : step === 1 ? birthDate !== "" && (unknownTime || birthTime !== "") : horizon !== null

  const next = () => {
    if (!canContinue) return
    if (step < 2) setStep((s) => s + 1)
    else setRevealed(true)
  }
  const back = () => setStep((s) => Math.max(0, s - 1))

  const reset = () => {
    setRevealed(false)
    setStep(0)
    setTheme(null)
    setQuestion("")
    setBirthDate("")
    setBirthTime("")
    setUnknownTime(false)
    setHorizon(null)
  }

  return (
    <main className="cosmic-bg relative flex min-h-dvh items-center justify-center overflow-hidden p-0 sm:p-6">
      <Starfield />

      {/* slow celestial halo */}
      <div
        aria-hidden
        className="animate-spin-slow pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[150vmin] w-[150vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(212,175,55,0.06) 60deg, transparent 120deg, rgba(110,130,200,0.06) 200deg, transparent 280deg)",
        }}
      />

      {/* Device frame */}
      <div className="relative z-10 flex h-dvh w-full max-w-[420px] flex-col sm:h-[840px] sm:max-h-[92vh] sm:rounded-[2.5rem] sm:border sm:border-gold/20 sm:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
        <div className="cosmic-bg flex h-full flex-col overflow-hidden px-6 pb-6 pt-7 sm:rounded-[2.5rem]">
          {/* Header */}
          <header className="relative flex shrink-0 items-center justify-center pb-5">
            <button
              onClick={onHome}
              title="Volver a la portada"
              className="absolute left-0 top-0.5 flex h-6 w-6 items-center justify-center rounded-full text-gold/80 hover:text-gold transition-all hover:bg-gold/10 hover:scale-110 active:scale-95 focus:outline-none"
              aria-label="Volver a la portada"
            >
              <Moon className="h-4 w-4 text-gold animate-float" strokeWidth={1.75} fill="currentColor" />
            </button>
            <h1 className="font-serif text-base tracking-[0.25em] text-gold/90 uppercase">Arcana Aurea</h1>
            
            {/* User Profile Image */}
            {session?.user && (
              <div 
                className="absolute right-0 top-0.5 h-6 w-6 overflow-hidden rounded-full border border-gold/40 flex items-center justify-center bg-gold/10 shadow-inner text-[10px] font-sans font-bold text-gold uppercase"
                title={`Astral: ${session.user.name || "Usuario"}`}
              >
                {session.user.image ? (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || "Usuario"} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (session.user.name || "U").charAt(0)
                )}
              </div>
            )}
          </header>

          {revealed ? (
            <div className="animate-step-in flex min-h-0 flex-1">
              <ReadingTable theme={theme} horizon={horizon} question={question} onReset={reset} />
            </div>
          ) : (
            <>
              {/* Stepper */}
              <div className="shrink-0 pb-5">
                <AstralStepper current={step} />
              </div>

              {/* Body */}
              <div className="relative min-h-0 flex-1">
                <div key={step} className="animate-step-in h-full">
                  {step === 0 && (
                    <StepIntention theme={theme} onTheme={setTheme} question={question} onQuestion={setQuestion} />
                  )}
                  {step === 1 && (
                    <StepAstral
                      birthDate={birthDate}
                      onBirthDate={setBirthDate}
                      birthTime={birthTime}
                      onBirthTime={setBirthTime}
                      unknownTime={unknownTime}
                      onUnknownTime={setUnknownTime}
                    />
                  )}
                  {step === 2 && <StepHorizon horizon={horizon} onHorizon={setHorizon} />}
                </div>
              </div>

              {/* Footer */}
              <div className="flex shrink-0 items-center gap-3 pt-5">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={back}
                    aria-label="Paso anterior"
                    className="glass-soft flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-gold/80 transition-colors hover:text-gold"
                  >
                    <ChevronLeft className="h-5 w-5" strokeWidth={2} />
                  </button>
                )}
                <GoldButton onClick={next} disabled={!canContinue} className={cn(step === 0 && "w-full")}>
                  {step < 2 ? "Continuar" : "Revelar las cartas"}
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                </GoldButton>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
