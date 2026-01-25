import { NextRequest, NextResponse } from "next/server"
import { generateSampleData, getStudentAnalytics, calculateConceptDifficulty } from "@/lib/analytics"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    // Get events from localStorage or use sample data
    const sampleEvents = generateSampleData()
    
    // Get student-specific analytics
    const studentAnalytics = getStudentAnalytics(sampleEvents, userId)
    
    // Calculate class averages for comparison
    const allMetrics = calculateConceptDifficulty(sampleEvents)
    const classAvgQuizScore = allMetrics.length > 0
      ? allMetrics.reduce((sum, m) => sum + m.avgQuizScore, 0) / allMetrics.length
      : 0
    const classAvgCompletion = allMetrics.length > 0
      ? allMetrics.reduce((sum, m) => sum + m.avgVideoCompletion, 0) / allMetrics.length
      : 0

    // Get student metadata
    const studentEvent = sampleEvents.find(e => e.userId === userId)
    const studentName = (studentEvent?.metadata as any)?.studentName || "Student"
    
    // Calculate learning streak (max consecutive days)
    const studentEvents = sampleEvents.filter(e => e.userId === userId)
    const maxStreak = studentEvents.length > 0
      ? Math.max(...studentEvents.map(e => e.learningStreak || 0))
      : 0

    return NextResponse.json({
      success: true,
      data: {
        userId,
        studentName,
        totalEvents: studentAnalytics.totalEvents,
        avgQuizScore: studentAnalytics.conceptMetrics.length > 0
          ? studentAnalytics.conceptMetrics.reduce((sum, m) => sum + m.avgQuizScore, 0) / studentAnalytics.conceptMetrics.length
          : 0,
        avgVideoCompletion: studentAnalytics.conceptMetrics.length > 0
          ? studentAnalytics.conceptMetrics.reduce((sum, m) => sum + m.avgVideoCompletion, 0) / studentAnalytics.conceptMetrics.length
          : 0,
        learningStreak: maxStreak,
        conceptMetrics: studentAnalytics.conceptMetrics,
        engagementTrends: studentAnalytics.engagementTrends,
        predictiveInsights: studentAnalytics.predictiveInsights,
        classAvgQuizScore: Math.round(classAvgQuizScore),
        classAvgCompletion: Math.round(classAvgCompletion),
      },
    })
  } catch (error) {
    console.error("[Student Analytics API] Error:", error)
    return NextResponse.json(
      { error: "Failed to calculate student analytics" },
      { status: 500 }
    )
  }
}
