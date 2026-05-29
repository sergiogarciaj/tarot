import type React from "react"
import type { Metadata, Viewport } from "next"
import { Libre_Caslon_Text, Inter } from "next/font/google"
import "./globals.css"

const libreCaslon = Libre_Caslon_Text({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Arcana Aurea — El Ritual",
  description:
    "Tarot digital místico en sincronía astral. Configura tu ritual y deja que el oráculo revele tu camino.",
  generator: "v0.app",
  icons: {
    icon: "/icon.svg",
  },
}

export const viewport: Viewport = {
  themeColor: "#0d1321",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${libreCaslon.variable} ${inter.variable} bg-midnight`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
