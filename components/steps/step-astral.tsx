"use client"

import { CalendarDays, Clock, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  birthDate: string
  onBirthDate: (v: string) => void
  birthTime: string
  onBirthTime: (v: string) => void
  unknownTime: boolean
  onUnknownTime: (v: boolean) => void
}

export function StepAstral({
  birthDate,
  onBirthDate,
  birthTime,
  onBirthTime,
  unknownTime,
  onUnknownTime,
}: Props) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h2 className="font-serif text-xl text-foreground text-balance">Sincronía Astral</h2>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          Tu carta natal afina la voz de los arcanos.
        </p>
      </div>

      {/* Birth date */}
      <div className="glass rounded-2xl p-4">
        <label htmlFor="birth-date" className="mb-2 flex items-center gap-2 font-serif text-sm italic text-gold/85">
          <CalendarDays className="h-4 w-4 text-gold" strokeWidth={1.75} />
          Fecha de nacimiento
        </label>
        <input
          id="birth-date"
          type="date"
          value={birthDate}
          onChange={(e) => onBirthDate(e.target.value)}
          className="w-full rounded-xl border border-gold/20 bg-midnight-deep/60 px-3.5 py-2.5 font-sans text-sm text-foreground [color-scheme:dark] focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/40"
        />
      </div>

      {/* Birth time */}
      <div className={cn("glass rounded-2xl p-4 transition-opacity", unknownTime && "opacity-70")}>
        <label htmlFor="birth-time" className="mb-2 flex items-center gap-2 font-serif text-sm italic text-gold/85">
          <Clock className="h-4 w-4 text-gold" strokeWidth={1.75} />
          Hora de nacimiento
        </label>
        <input
          id="birth-time"
          type="time"
          value={birthTime}
          disabled={unknownTime}
          onChange={(e) => onBirthTime(e.target.value)}
          className="w-full rounded-xl border border-gold/20 bg-midnight-deep/60 px-3.5 py-2.5 font-sans text-sm text-foreground [color-scheme:dark] focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/40 disabled:cursor-not-allowed disabled:opacity-50"
        />

        {/* stylized checkbox */}
        <button
          type="button"
          role="checkbox"
          aria-checked={unknownTime}
          onClick={() => onUnknownTime(!unknownTime)}
          className="mt-3 flex w-full items-center gap-2.5 text-left"
        >
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-300",
              unknownTime
                ? "border-gold bg-gradient-to-b from-gold-bright to-gold-deep text-midnight shadow-[0_0_12px_rgba(212,175,55,0.5)]"
                : "border-gold/30 bg-midnight-deep/60",
            )}
          >
            {unknownTime && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
          </span>
          <span className="font-sans text-xs text-muted-foreground">No conozco mi hora de nacimiento</span>
        </button>
      </div>

      <p className="mt-auto text-center font-serif text-[11px] italic text-muted-foreground/60">
        {"\u2727 Los astros guardan tus secretos en confianza \u2727"}
      </p>
    </div>
  )
}
