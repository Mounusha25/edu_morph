import { NextResponse } from "next/server"
import { generateSampleData } from "@/lib/analytics"

export const dynamic = 'force-dynamic'

/**
 * Export learning telemetry data for Power BI
 * Returns CSV format for easy import into Power BI Desktop
 */
export async function GET() {
  try {
    // Generate comprehensive sample data (500 events)
    const events = []
    for (let i = 0; i < 5; i++) {
      events.push(...generateSampleData())
    }

    // Convert to CSV
    const headers = [
      "Timestamp",
      "Concept",
      "TeachingFormat",
      "QuizScore",
      "VideoCompletionRate",
      "Feedback",
      "RegenerationType",
      "LearningStreak",
      "Date",
      "Hour",
      "DayOfWeek",
    ]

    const csvRows = [headers.join(",")]

    events.forEach((event) => {
      const date = new Date(event.timestamp)
      const row = [
        event.timestamp,
        `"${event.concept}"`,
        event.teachingFormat,
        event.quizScore || "",
        event.videoCompletionRate || "",
        event.feedback,
        event.regenerationType,
        event.learningStreak,
        date.toISOString().split("T")[0], // Date column
        date.getHours(), // Hour column
        date.toLocaleDateString("en-US", { weekday: "short" }), // Day of week
      ]
      csvRows.push(row.join(","))
    })

    const csv = csvRows.join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="edumorph_learning_data.csv"',
      },
    })
  } catch (error) {
    console.error("[Export API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to export data" }, { status: 500 })
  }
}

/**
 * Export aggregated analytics for Power BI
 * Returns JSON with pre-calculated metrics
 */
export async function POST() {
  try {
    const {
      calculateConceptDifficulty,
      calculateFormatEffectiveness,
      calculateEngagementTrends,
      generatePredictiveInsights,
    } = await import("@/lib/analytics")

    // Generate sample data
    const events = []
    for (let i = 0; i < 5; i++) {
      events.push(...generateSampleData())
    }

    // Calculate all metrics
    const conceptMetrics = calculateConceptDifficulty(events)
    const formatEffectiveness = calculateFormatEffectiveness(events)
    const engagementTrends = calculateEngagementTrends(events)
    const predictiveInsights = generatePredictiveInsights(conceptMetrics)

    // Create Power BI dataset structure
    const powerBIData = {
      // Table 1: Concept Metrics
      ConceptDifficulty: conceptMetrics.map((c) => ({
        Concept: c.concept,
        TotalLearners: c.totalLearners,
        AvgQuizScore: c.avgQuizScore,
        AvgVideoCompletion: c.avgVideoCompletion,
        NegativeFeedbackRate: c.negativeFeedbackRate,
        DifficultyScore: c.difficultyScore,
        MostEffectiveFormat: c.mostEffectiveFormat,
        DifficultyLevel:
          c.difficultyScore >= 70 ? "Hard" : c.difficultyScore >= 50 ? "Moderate" : "Easy",
      })),

      // Table 2: Format Effectiveness
      FormatEffectiveness: formatEffectiveness.map((f) => ({
        Format: f.format,
        AvgQuizScore: f.avgQuizScore,
        AvgCompletion: f.avgCompletion,
        PositiveRate: f.positiveRate,
        UsageCount: f.usageCount,
        EffectivenessScore: f.effectivenessScore,
      })),

      // Table 3: Engagement Trends
      EngagementTrends: engagementTrends.map((e) => ({
        Timestamp: e.timestamp,
        AvgQuizScore: e.avgQuizScore,
        AvgVideoCompletion: e.avgVideoCompletion,
        EventCount: e.eventCount,
      })),

      // Table 4: Predictive Insights
      PredictiveInsights: predictiveInsights.map((p) => ({
        Concept: p.concept,
        Prediction: p.prediction,
        RecommendedFormat: p.recommendedFormat,
        SuggestedImprovement: p.suggestedImprovement,
        Confidence: p.confidence,
      })),

      // Table 5: Raw Events
      RawEvents: events.slice(0, 100).map((e) => ({
        // Limit to 100 for JSON size
        Timestamp: e.timestamp,
        Concept: e.concept,
        TeachingFormat: e.teachingFormat,
        QuizScore: e.quizScore,
        VideoCompletionRate: e.videoCompletionRate,
        Feedback: e.feedback,
        RegenerationType: e.regenerationType,
        LearningStreak: e.learningStreak,
      })),
    }

    return NextResponse.json(powerBIData, {
      headers: {
        "Content-Disposition": 'attachment; filename="edumorph_powerbi_data.json"',
      },
    })
  } catch (error) {
    console.error("[Export API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to export data" }, { status: 500 })
  }
}
