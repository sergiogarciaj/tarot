"use client"

import type { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GoldButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function GoldButton({ children, className, ...props }: GoldButtonProps) {
  return (
    <button
      className={cn(
        "gold-cta group relative flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5",
        "font-sans text-sm font-semibold tracking-wide",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
