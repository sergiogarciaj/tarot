"use client"

import { useState } from "react"
import { HomeScreen } from "@/components/home-screen"
import { RitualFlow } from "@/components/ritual-flow"

export default function Page() {
  const [started, setStarted] = useState(false)

  if (!started) return <HomeScreen onStart={() => setStarted(true)} />
  return <RitualFlow />
}
