import { NextRequest, NextResponse } from "next/server"
import { LearningEvent } from "@/lib/telemetry"
import {
  calculateConceptDifficulty,
  calculateFormatEffectiveness,
  calculateEngagementTrends,
  generatePredictiveInsights,
  generateSampleData,
} from "@/lib/analytics"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    // Get events from localStorage (in real app, this would query Azure Data Lake/Synapse)
    let events: LearningEvent[] = []

    // For demo purposes, if no events exist, generate sample data
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("telemetry_events")
      events = stored ? JSON.parse(stored) : []
    }

    // If no events, use sample data for demo
    if (events.length === 0) {
      events = generateSampleData()
    }

    // Filter by user if specified
    if (userId && userId !== "all") {
      events = events.filter(e => e.userId === userId)
    }

    // Calculate analytics
    const conceptMetrics = calculateConceptDifficulty(events)
    const formatEffectiveness = calculateFormatEffectiveness(events)
    const engagementTrends = calculateEngagementTrends(events)
    const predictiveInsights = generatePredictiveInsights(conceptMetrics)

    return NextResponse.json({
      success: true,
      data: {
        conceptMetrics,
        formatEffectiveness,
        engagementTrends,
        predictiveInsights,
        totalEvents: events.length,
        lastUpdated: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[Analytics API] Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to calculate analytics" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { useSampleData, userId } = body

    // Allow client to request sample data explicitly
    let events = useSampleData ? generateSampleData() : []

    // Filter by user if specified
    if (userId && userId !== "all") {
      events = events.filter(e => e.userId === userId)
    }

    const conceptMetrics = calculateConceptDifficulty(events)
    const formatEffectiveness = calculateFormatEffectiveness(events)
    const engagementTrends = calculateEngagementTrends(events)
    const predictiveInsights = generatePredictiveInsights(conceptMetrics)

    return NextResponse.json({
      success: true,
      data: {
        conceptMetrics,
        formatEffectiveness,
        engagementTrends,
        predictiveInsights,
        totalEvents: events.length,
        lastUpdated: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[Analytics API] Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to calculate analytics" },
      { status: 500 }
    )
  }
}
