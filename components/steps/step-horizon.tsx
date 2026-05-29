"use client"

import { Sun, Moon, Infinity as InfinityIcon, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export const HORIZONS = [
  {
    key: "hoy",
    label: "Hoy",
    desc: "Consejo práctico para las próximas 24 horas.",
    Icon: Sun,
  },
  {
    key: "futuro",
    label: "Futuro Cercano",
    desc: "El despliegue de semanas y meses por venir.",
    Icon: Moon,
  },
  {
    key: "destino",
    label: "Destino",
    desc: "Un viaje kármico hacia tu camino a largo plazo.",
    Icon: InfinityIcon,
  },
] as const

interface Props {
  horizon: string | null
  onHorizon: (key: string) => void
}

export function StepHorizon({ horizon, onHorizon }: Props) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h2 className="font-serif text-xl text-foreground text-balance">El Horizonte</h2>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          ¿Hasta dónde debe mirar el oráculo?
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-3">
        {HORIZONS.map(({ key, label, desc, Icon }) => {
          const active = horizon === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onHorizon(key)}
              aria-pressed={active}
              className={cn(
                "group relative flex items-center gap-3.5 rounded-2xl p-4 text-left transition-all duration-300",
                active ? "glass scale-[1.01] ring-1 ring-gold/60" : "glass-soft hover:ring-1 hover:ring-gold/30",
              )}
            >
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                  active
                    ? "bg-gradient-to-b from-gold-bright to-gold-deep text-midnight shadow-[0_0_16px_rgba(212,175,55,0.5)]"
                    : "bg-midnight-soft text-gold/70",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("font-serif text-base transition-colors", active ? "text-gold" : "text-foreground")}>
                  {label}
                </p>
                <p className="text-xs leading-snug text-muted-foreground">{desc}</p>
              </div>
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                  active ? "border-gold bg-gold text-midnight" : "border-gold/25",
                )}
              >
                {active && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
