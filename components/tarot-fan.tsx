import { cn } from "@/lib/utils"

function Card({
  className,
  children,
  style,
}: {
  className?: string
  children?: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      className={cn(
        "absolute bottom-0 left-1/2 h-44 w-28 -translate-x-1/2 rounded-xl border border-gold/40",
        "bg-gradient-to-b from-midnight-soft/90 to-midnight-deep/95 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)]",
        "backdrop-blur-sm",
        className,
      )}
      style={style}
    >
      <div className="absolute inset-1.5 rounded-lg border border-gold/20" />
      {children}
    </div>
  )
}

export function TarotFan({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("tarot-fan-container relative mx-auto", className)}>
      {/* Left card */}
      <Card style={{ transform: "translateX(-50%) rotate(-16deg) translateY(10px)" }} />
      {/* Right card */}
      <Card style={{ transform: "translateX(-50%) rotate(16deg) translateY(10px)" }} />
      {/* Center card with sun emblem */}
      <Card className="z-10">
        <div className="flex h-full w-full items-center justify-center">
          <svg viewBox="0 0 64 64" className="h-14 w-14" role="img" aria-label="Sol radiante">
            <g stroke="#d4af37" strokeOpacity="0.85" strokeWidth="1.4" strokeLinecap="round">
              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i * Math.PI) / 6
                const x1 = 32 + Math.cos(a) * 16
                const y1 = 32 + Math.sin(a) * 16
                const x2 = 32 + Math.cos(a) * 24
                const y2 = 32 + Math.sin(a) * 24
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
              })}
            </g>
            <circle cx="32" cy="32" r="12" fill="none" stroke="#d4af37" strokeWidth="1.4" />
            <circle cx="32" cy="32" r="4" fill="#d4af37" fillOpacity="0.8" />
          </svg>
        </div>
        {/* small crescent at bottom */}
        <svg viewBox="0 0 24 24" className="absolute bottom-3 left-1/2 h-4 w-4 -translate-x-1/2" aria-hidden>
          <path
            d="M16 12a6 6 0 0 1-7.5 5.8 7 7 0 0 0 0-11.6A6 6 0 0 1 16 12Z"
            fill="#d4af37"
            fillOpacity="0.7"
          />
        </svg>
      </Card>
    </div>
  )
}
