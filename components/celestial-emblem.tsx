import { cn } from "@/lib/utils"

export function CelestialEmblem({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label="Luna creciente celestial dentro de órbitas estelares"
    >
      <defs>
        <linearGradient id="moonGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f3d98b" />
          <stop offset="45%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#9c7a23" />
        </linearGradient>
        <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff6da" />
          <stop offset="60%" stopColor="#f3d98b" />
          <stop offset="100%" stopColor="#d4af37" />
        </radialGradient>
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer dotted orbit */}
      <circle
        cx="100"
        cy="100"
        r="78"
        fill="none"
        stroke="#d4af37"
        strokeOpacity="0.45"
        strokeWidth="1"
        strokeDasharray="1 6"
        strokeLinecap="round"
      />
      {/* Inner solid orbit */}
      <circle cx="100" cy="100" r="62" fill="none" stroke="#d4af37" strokeOpacity="0.3" strokeWidth="1" />

      {/* Top & bottom ornaments */}
      <g fill="#d4af37" fillOpacity="0.7">
        <circle cx="100" cy="14" r="2" />
        <circle cx="100" cy="24" r="1.2" />
        <circle cx="100" cy="186" r="2" />
        <circle cx="100" cy="176" r="1.2" />
      </g>

      {/* Crescent moon */}
      <g filter="url(#softGlow)">
        <path
          d="M132 100c0 21-17 38-38 38a38 38 0 0 1-12-2 30 30 0 0 0 0-72 38 38 0 0 1 12-2c21 0 38 17 38 38Z"
          fill="url(#moonGold)"
        />
      </g>

      {/* Sparkle star */}
      <g filter="url(#softGlow)">
        <path
          d="M120 80c1.5 9 4 11.5 13 13-9 1.5-11.5 4-13 13-1.5-9-4-11.5-13-13 9-1.5 11.5-4 13-13Z"
          fill="url(#starGlow)"
        />
        <circle cx="120" cy="93" r="1.6" fill="#fff6da" />
      </g>
    </svg>
  )
}
