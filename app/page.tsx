"use client"

import { useState } from "react"
import { HomeScreen } from "@/components/home-screen"
import { ReadingMenu } from "@/components/reading-menu"
import { RitualFlow } from "@/components/ritual-flow"
import { HistoryView } from "@/components/history-view"

export default function Page() {
  const [view, setView] = useState<"home" | "menu" | "ritual" | "history">("home")
  const [readingType, setReadingType] = useState<"trinidad" | "cruz" | "siono">("trinidad")

  if (view === "menu") {
    return (
      <ReadingMenu 
        onSelect={(type) => {
          setReadingType(type)
          setView("ritual")
        }}
        onBack={() => setView("home")}
      />
    )
  }

  if (view === "ritual") {
    return <RitualFlow onHome={() => setView("home")} readingType={readingType} />
  }

  if (view === "history") {
    return <HistoryView onHome={() => setView("home")} />
  }

  return (
    <HomeScreen 
      onStart={() => setView("menu")} 
      onHistory={() => setView("history")} 
    />
  )
}
