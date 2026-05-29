"use client"

import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { Starfield } from "@/components/starfield"
import { CelestialEmblem } from "@/components/celestial-emblem"
import { TarotFan } from "@/components/tarot-fan"
import { GoldButton } from "@/components/gold-button"

export function HomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <main className="cosmic-bg relative flex min-h-dvh items-center justify-center overflow-hidden p-0 sm:p-6">
      <Starfield />

      {/* Device frame */}
      <div className="relative z-10 flex h-dvh w-full max-w-[420px] flex-col sm:h-[840px] sm:max-h-[92vh] sm:rounded-[2.5rem] sm:border sm:border-gold/20 sm:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
        <div className="cosmic-bg relative flex h-full flex-col overflow-hidden sm:rounded-[2.5rem]">
          {/* Landscape backdrop in lower half */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]">
            <Image
              src="/moonlit-horizon.png"
              alt=""
              fill
              priority
              className="object-cover object-bottom opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-midnight via-midnight/30 to-midnight/85" />
          </div>

          {/* Foreground content */}
          <div className="relative z-10 flex h-full flex-col items-center px-6 pb-6 pt-10 text-center">
            {/* Animated Portal */}
            <div className="animate-float relative h-36 w-28 shrink-0 flex items-center justify-center">
              {/* Back glow */}
              <div className="absolute inset-0 rounded-full bg-gold/10 blur-xl -z-10 animate-pulse" />
              
              {/* GIF Container with oval mask */}
              <div 
                className="relative w-full h-full overflow-hidden"
                style={{
                  borderRadius: "50%",
                  maskImage: "radial-gradient(circle, black 35%, transparent 85%)",
                  WebkitMaskImage: "radial-gradient(circle, black 35%, transparent 85%)"
                }}
              >
                <Image
                  src="/aurea.gif"
                  alt="Aurea Celestial Portal"
                  fill
                  unoptimized
                  className="object-cover"
                  priority
                />
              </div>

              {/* Oval gold frame */}
              <div className="absolute inset-0 rounded-full border border-gold/25 pointer-events-none" />
            </div>

            {/* Title */}
            <h1 className="mt-6 font-serif text-4xl uppercase leading-tight tracking-[0.28em] text-gold text-balance">
              Arcana
              <br />
              Aurea
            </h1>

            {/* Divider */}
            <div className="mt-3 flex items-center gap-2 text-gold/60">
              <span className="h-px w-8 bg-gold/40" />
              <span className="text-xs">&#10022;</span>
              <span className="h-px w-8 bg-gold/40" />
            </div>

            {/* Subtitle */}
            <p className="mx-auto mt-5 max-w-[16rem] font-sans text-sm leading-relaxed text-foreground/75 text-pretty">
              Descubre las respuestas que el universo tiene para ti.
            </p>

            {/* Tarot cards */}
            <div className="flex min-h-0 flex-1 items-end justify-center">
              <TarotFan className="mb-2" />
            </div>

            {/* CTA */}
            <GoldButton onClick={onStart} className="w-full shrink-0">
              Comenzar
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </GoldButton>

            {/* Footer tagline */}
            <p className="mt-4 shrink-0 font-serif text-xs italic tracking-wide text-gold/50">
              Confía. Escucha. Descubre.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
