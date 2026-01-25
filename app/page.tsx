"use client"

import { InputCard } from "@/components/InputCard"
import { ProfileCard } from "@/components/ProfileCard"
import { ConceptsLearned } from "@/components/ConceptsLearned"
import { Accelerator } from "@/components/Accelerator"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { BarChart3, User, Activity } from "lucide-react"

interface UserProgress {
  conceptsLearned: Array<{
    concept: string
    score: number
    completedAt: Date
  }>
  streak: number
  totalPoints: number
  learningMultiplier: number
}

export default function Home() {
  const [userProgress, setUserProgress] = useState<UserProgress>({
    conceptsLearned: [],
    streak: 0,
    totalPoints: 0,
    learningMultiplier: 1.0,
  })

  useEffect(() => {
    const savedProgress = localStorage.getItem("userProgress")
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress)
        // Convert date strings back to Date objects
        parsed.conceptsLearned = parsed.conceptsLearned.map((concept: any) => ({
          ...concept,
          completedAt: new Date(concept.completedAt),
        }))
        setUserProgress(parsed)
      } catch (error) {
        console.error("[v0] Error parsing saved progress:", error)
      }
    }
  }, [])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userProgress" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          parsed.conceptsLearned = parsed.conceptsLearned.map((concept: any) => ({
            ...concept,
            completedAt: new Date(concept.completedAt),
          }))
          setUserProgress(parsed)
        } catch (error) {
          console.error("[v0] Error parsing storage change:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handleConceptLearned = (concept: string, score: number) => {
    console.log("[v0] Concept learned:", concept, "Score:", score)

    const newConcept = {
      concept,
      score,
      completedAt: new Date(),
    }

    setUserProgress((prev) => {
      const newConceptsLearned = [...prev.conceptsLearned, newConcept]
      const points = score >= 70 ? Math.floor(score * prev.learningMultiplier) : 0

      const newStreak = newConceptsLearned.length

      const newMultiplier = Math.min(3.0, 1.0 + Math.floor(newStreak / 2) * 0.1)

      const updatedProgress = {
        conceptsLearned: newConceptsLearned,
        streak: newStreak,
        totalPoints: prev.totalPoints + points,
        learningMultiplier: newMultiplier,
      }

      console.log("[v0] Updated progress:", updatedProgress)

      localStorage.setItem("userProgress", JSON.stringify(updatedProgress))

      return updatedProgress
    })
  }

  return (
    <main className="min-h-screen w-full relative">
      <div className="relative z-10 p-4">
        <div className="w-full max-w-6xl mx-auto space-y-6">
          <ProfileCard
            streak={userProgress.streak}
            totalPoints={userProgress.totalPoints}
            learningMultiplier={userProgress.learningMultiplier}
          />

          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Image src="/images/sage-logo.png" alt="eduMorph Logo" width={80} height={80} className="rounded-xl" />
              <h1 className="text-4xl md:text-6xl font-bold glow-text">eduMorph</h1>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-white/90 mb-3">
              Transform lectures into adaptive, AI-powered learning experiences
            </h2>
            <p className="text-base text-white/60 max-w-3xl mx-auto mb-8">
              Personalized explanations, difficulty-aware insights, and real-time learning analytics — all in one platform.
            </p>
            <InputCard onConceptLearned={handleConceptLearned} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <ConceptsLearned concepts={userProgress.conceptsLearned} />
            <Accelerator
              streak={userProgress.streak}
              multiplier={userProgress.learningMultiplier}
              totalPoints={userProgress.totalPoints}
            />
          </div>

          {/* Admin/Teacher Tools Section */}
          <div className="pt-8 border-t border-white/10">
            <p className="text-center text-xs text-white/40 mb-4">Administrator & Analytics Tools</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <Link href="/analytics">
                <Card className="glass-card p-4 transition-all duration-300 cursor-pointer hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
                      <BarChart3 className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">Analytics Dashboard</h3>
                    <p className="text-xs text-white/60">View class performance metrics</p>
                  </div>
                </Card>
              </Link>
              <Link href="/student-dashboard">
                <Card className="glass-card p-4 transition-all duration-300 cursor-pointer hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                      <User className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">Student View</h3>
                    <p className="text-xs text-white/60">Browse individual student data</p>
                  </div>
                </Card>
              </Link>
              <button
                onClick={() => {
                  window.dispatchEvent(new Event('toggleTelemetry'));
                }}
                className="block w-full"
              >
                <Card className="glass-card p-4 transition-all duration-300 cursor-pointer hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/20">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
                      <Activity className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">Azure Monitor</h3>
                    <p className="text-xs text-white/60">Real-time telemetry tracking</p>
                  </div>
                </Card>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
