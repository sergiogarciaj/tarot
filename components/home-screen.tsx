"use client"

import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Starfield } from "@/components/starfield"
import { CelestialEmblem } from "@/components/celestial-emblem"
import { TarotFan } from "@/components/tarot-fan"
import { GoldButton } from "@/components/gold-button"

export function HomeScreen({ onStart, onHistory }: { onStart: () => void; onHistory: () => void }) {
  const { data: session, status } = useSession()
  const loading = status === "loading"
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
          <div className="home-content relative z-10 flex h-full flex-col items-center px-6 pb-6 pt-10 text-center">
            {/* User Profile Image */}
            {session?.user && (
              <div 
                className="absolute right-6 top-[30px] h-6 w-6 overflow-hidden rounded-full border border-gold/40 flex items-center justify-center bg-gold/10 shadow-inner text-[10px] font-sans font-bold text-gold uppercase"
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
            {/* Animated Portal */}
            <div className="portal-container animate-float relative flex items-center justify-center">
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
            <h1 className="home-title font-serif text-4xl uppercase leading-tight tracking-[0.28em] text-gold text-balance">
              Arcana
              <br />
              Aurea
            </h1>

            {/* Divider */}
            <div className="home-divider flex items-center gap-2 text-gold/60">
              <span className="h-px w-8 bg-gold/40" />
              <span className="text-xs">&#10022;</span>
              <span className="h-px w-8 bg-gold/40" />
            </div>

            {/* Subtitle */}
            <p className="home-subtitle mx-auto max-w-[16rem] font-sans text-sm leading-relaxed text-foreground/75 text-pretty">
              Descubre las respuestas que el universo tiene para ti.
            </p>

            {/* Tarot cards */}
            <div className="tarot-fan-wrap">
              <TarotFan />
            </div>

            {/* CTA / Auth */}
            {loading ? (
              <div className="w-full h-12 flex items-center justify-center text-gold/60 text-sm">
                Conectando con el cosmos...
              </div>
            ) : session ? (
              <div className="w-full shrink-0 space-y-3">
                <GoldButton onClick={onStart} className="w-full">
                  Comenzar
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                </GoldButton>

                <button
                  onClick={onHistory}
                  className="w-full h-11 rounded-full border border-gold/30 bg-midnight-deep/40 text-gold text-xs font-serif tracking-wider uppercase transition-all duration-300 hover:border-gold hover:bg-gold/10 hover:shadow-[0_0_15px_rgba(212,175,55,0.25)] cursor-pointer"
                >
                  Historial de Lecturas
                </button>
                
                <div className="flex items-center justify-center gap-3 text-xs text-gold/70">
                  <span>Astral: {session.user?.name}</span>
                  <span className="text-gold/30">|</span>
                  <button 
                    onClick={() => signOut()} 
                    className="underline hover:text-gold transition-colors focus:outline-none cursor-pointer"
                  >
                    Salir
                  </button>
                </div>
              </div>
            ) : (
              <GoldButton onClick={() => signIn("google")} className="w-full shrink-0">
                Iniciar con Google
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
              </GoldButton>
            )}

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
