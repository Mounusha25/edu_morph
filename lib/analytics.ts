import { LearningEvent } from "./telemetry"

/**
 * Analytics calculations for learning telemetry data
 */

export interface ConceptMetrics {
  concept: string
  totalLearners: number
  avgQuizScore: number
  avgVideoCompletion: number
  negativeFeedbackRate: number
  difficultyScore: number
  mostEffectiveFormat: string
}

export interface FormatEffectiveness {
  format: string
  avgQuizScore: number
  avgCompletion: number
  positiveRate: number
  usageCount: number
  effectivenessScore: number
}

export interface EngagementTrend {
  timestamp: string
  avgQuizScore: number
  avgVideoCompletion: number
  eventCount: number
}

export interface PredictiveInsight {
  concept: string
  prediction: "high_risk" | "moderate" | "on_track"
  recommendedFormat: string
  suggestedImprovement: string
  confidence: number
}

/**
 * Calculate concept difficulty scores
 */
export function calculateConceptDifficulty(events: LearningEvent[]): ConceptMetrics[] {
  const conceptMap = new Map<string, LearningEvent[]>()

  // Group events by concept
  events.forEach((event) => {
    const existing = conceptMap.get(event.concept) || []
    conceptMap.set(event.concept, [...existing, event])
  })

  const metrics: ConceptMetrics[] = []

  conceptMap.forEach((conceptEvents, concept) => {
    const totalLearners = conceptEvents.length

    // Calculate average quiz score
    const quizScores = conceptEvents.filter((e) => e.quizScore !== undefined).map((e) => e.quizScore!)
    const avgQuizScore = quizScores.length > 0 ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length : 0

    // Calculate average video completion
    const videoCompletions = conceptEvents
      .filter((e) => e.videoCompletionRate !== undefined)
      .map((e) => e.videoCompletionRate!)
    const avgVideoCompletion =
      videoCompletions.length > 0 ? videoCompletions.reduce((a, b) => a + b, 0) / videoCompletions.length : 0

    // Calculate negative feedback rate
    const negativeCount = conceptEvents.filter((e) => e.feedback === "negative").length
    const negativeFeedbackRate = totalLearners > 0 ? negativeCount / totalLearners : 0

    // Calculate difficulty score (0-100, higher = more difficult)
    const difficultyScore =
      (100 - avgQuizScore) * 0.4 + // Quiz difficulty weight: 40%
      negativeFeedbackRate * 100 * 0.3 + // Negative feedback weight: 30%
      (100 - avgVideoCompletion) * 0.3 // Drop-off weight: 30%

    // Determine most effective format
    const formatScores = new Map<string, number>()
    conceptEvents.forEach((e) => {
      const current = formatScores.get(e.teachingFormat) || 0
      const score = (e.quizScore || 0) + (e.videoCompletionRate || 0)
      formatScores.set(e.teachingFormat, current + score)
    })

    const mostEffectiveFormat =
      Array.from(formatScores.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "Video"

    metrics.push({
      concept,
      totalLearners,
      avgQuizScore: Math.round(avgQuizScore),
      avgVideoCompletion: Math.round(avgVideoCompletion),
      negativeFeedbackRate: Math.round(negativeFeedbackRate * 100) / 100,
      difficultyScore: Math.round(difficultyScore),
      mostEffectiveFormat,
    })
  })

  return metrics.sort((a, b) => b.difficultyScore - a.difficultyScore)
}

/**
 * Calculate teaching format effectiveness
 */
export function calculateFormatEffectiveness(events: LearningEvent[]): FormatEffectiveness[] {
  const formatMap = new Map<string, LearningEvent[]>()

  // Group events by format
  events.forEach((event) => {
    const existing = formatMap.get(event.teachingFormat) || []
    formatMap.set(event.teachingFormat, [...existing, event])
  })

  const effectiveness: FormatEffectiveness[] = []

  formatMap.forEach((formatEvents, format) => {
    const usageCount = formatEvents.length

    // Calculate average quiz score
    const quizScores = formatEvents.filter((e) => e.quizScore !== undefined).map((e) => e.quizScore!)
    const avgQuizScore = quizScores.length > 0 ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length : 0

    // Calculate average completion
    const completions = formatEvents
      .filter((e) => e.videoCompletionRate !== undefined)
      .map((e) => e.videoCompletionRate!)
    const avgCompletion = completions.length > 0 ? completions.reduce((a, b) => a + b, 0) / completions.length : 0

    // Calculate positive feedback rate
    const positiveCount = formatEvents.filter((e) => e.feedback === "positive").length
    const positiveRate = usageCount > 0 ? positiveCount / usageCount : 0

    // Effectiveness score (0-100)
    const effectivenessScore = avgQuizScore * 0.5 + avgCompletion * 0.3 + positiveRate * 100 * 0.2

    effectiveness.push({
      format,
      avgQuizScore: Math.round(avgQuizScore),
      avgCompletion: Math.round(avgCompletion),
      positiveRate: Math.round(positiveRate * 100) / 100,
      usageCount,
      effectivenessScore: Math.round(effectivenessScore),
    })
  })

  return effectiveness.sort((a, b) => b.effectivenessScore - a.effectivenessScore)
}

/**
 * Calculate engagement trends over time
 */
export function calculateEngagementTrends(events: LearningEvent[]): EngagementTrend[] {
  const hourMap = new Map<string, LearningEvent[]>()

  // Group events by hour
  events.forEach((event) => {
    const date = new Date(event.timestamp)
    const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:00`
    const existing = hourMap.get(hourKey) || []
    hourMap.set(hourKey, [...existing, event])
  })

  const trends: EngagementTrend[] = []

  hourMap.forEach((hourEvents, timestamp) => {
    const eventCount = hourEvents.length

    // Calculate averages
    const quizScores = hourEvents.filter((e) => e.quizScore !== undefined).map((e) => e.quizScore!)
    const avgQuizScore = quizScores.length > 0 ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length : 0

    const completions = hourEvents
      .filter((e) => e.videoCompletionRate !== undefined)
      .map((e) => e.videoCompletionRate!)
    const avgVideoCompletion = completions.length > 0 ? completions.reduce((a, b) => a + b, 0) / completions.length : 0

    trends.push({
      timestamp,
      avgQuizScore: Math.round(avgQuizScore),
      avgVideoCompletion: Math.round(avgVideoCompletion),
      eventCount,
    })
  })

  return trends.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

/**
 * Generate predictive insights using rules-based logic
 */
export function generatePredictiveInsights(metrics: ConceptMetrics[]): PredictiveInsight[] {
  const insights: PredictiveInsight[] = []

  metrics.forEach((metric) => {
    let prediction: "high_risk" | "moderate" | "on_track" = "on_track"
    let suggestedImprovement = "Content is performing well. Continue monitoring."
    let confidence = 0.8

    // High risk: difficulty score > 70
    if (metric.difficultyScore > 70) {
      prediction = "high_risk"
      suggestedImprovement = `High difficulty detected (${metric.difficultyScore}/100). Recommend: Simplify language, add more examples, break into smaller steps.`
      confidence = 0.9
    }
    // Moderate risk: difficulty score 50-70
    else if (metric.difficultyScore > 50) {
      prediction = "moderate"
      suggestedImprovement = `Moderate difficulty (${metric.difficultyScore}/100). Recommend: Add visual aids, slow down pacing, reinforce key concepts.`
      confidence = 0.85
    }
    // Low quiz scores specifically
    else if (metric.avgQuizScore < 60) {
      prediction = "moderate"
      suggestedImprovement = `Low quiz performance (${metric.avgQuizScore}%). Recommend: Review quiz questions, add hints, provide prerequisite review.`
      confidence = 0.8
    }
    // Low video completion
    else if (metric.avgVideoCompletion < 60) {
      prediction = "moderate"
      suggestedImprovement = `Low video engagement (${metric.avgVideoCompletion}% completion). Recommend: Shorten videos, improve pacing, add interactive elements.`
      confidence = 0.75
    }

    insights.push({
      concept: metric.concept,
      prediction,
      recommendedFormat: metric.mostEffectiveFormat,
      suggestedImprovement,
      confidence,
    })
  })

  return insights.sort((a, b) => {
    const order = { high_risk: 0, moderate: 1, on_track: 2 }
    return order[a.prediction] - order[b.prediction]
  })
}

/**
 * Student personas for impressive demo data
 */
interface StudentPersona {
  userId: string
  name: string
  learningProfile: string
  strengths: string[]
  struggles: string[]
  preferredFormat: "Analogy" | "Diagram" | "Video" | "OneLiner" | "Quiz"
  basePerformance: number
  improvementRate: number
}

const STUDENT_PERSONAS: StudentPersona[] = [
  {
    userId: "student_sarah_chen",
    name: "Sarah Chen",
    learningProfile: "Visual learner struggling with abstract math, showing improvement with diagrams",
    strengths: ["React Hooks", "Binary Search Trees", "Blockchain Technology", "Graph Algorithms"],
    struggles: ["Eigenvectors", "Calculus Limits", "Quantum Computing", "Gradient Descent"],
    preferredFormat: "Diagram",
    basePerformance: 52, // Starts lower
    improvementRate: 7, // 7% improvement per day
  },
  {
    userId: "student_marcus_johnson",
    name: "Marcus Johnson",
    learningProfile: "Advanced CS student, excels with video content, seeks challenging material",
    strengths: ["Neural Networks", "Machine Learning Basics", "Quantum Computing", "Big O Notation", "Recursion Patterns", "Gradient Descent"],
    struggles: ["Eigenvectors"], // Only struggles with 1 topic
    preferredFormat: "Video",
    basePerformance: 78, // Starts at 78%
    improvementRate: 5, // 5% improvement per day (78 + 7*5 = 113, capped at ~92%)
  },
  {
    userId: "student_aisha_patel",
    name: "Aisha Patel",
    learningProfile: "Learns through analogies and real-world examples, improving rapidly",
    strengths: ["Machine Learning Basics", "Blockchain Technology", "Calculus Limits", "Recursion Patterns"],
    struggles: ["Eigenvectors", "Binary Search Trees", "Neural Networks"],
    preferredFormat: "Analogy",
    basePerformance: 65, // Mid-range
    improvementRate: 6, // Good improvement
  },
]

/**
 * Generate sample data with compelling learning stories
 * Creates 800+ events showing realistic student progression
 */
export function generateSampleData(): LearningEvent[] {
  const concepts = [
    "Eigenvectors",
    "Machine Learning Basics", 
    "Quantum Computing",
    "Neural Networks",
    "Calculus Limits",
    "Blockchain Technology",
    "React Hooks",
    "Binary Search Trees",
    "Gradient Descent",
    "Big O Notation",
    "Recursion Patterns",
    "Graph Algorithms",
  ]

  const formats: Array<"Analogy" | "Diagram" | "Video" | "OneLiner" | "Quiz"> = [
    "Analogy",
    "Diagram", 
    "Video",
    "OneLiner",
    "Quiz",
  ]

  const sampleEvents: LearningEvent[] = []
  const now = new Date()

  // Generate events over past 7 days for each student
  STUDENT_PERSONAS.forEach((student) => {
    for (let day = 0; day < 7; day++) {
      // More activity on weekdays (15-25 events) vs weekends (8-12 events)
      const dayOfWeek = (now.getDay() - day + 7) % 7
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const eventsPerDay = isWeekend ? 8 + Math.floor(Math.random() * 5) : 15 + Math.floor(Math.random() * 11)
      
      for (let i = 0; i < eventsPerDay; i++) {
        const concept = concepts[Math.floor(Math.random() * concepts.length)]
        
        // Student uses preferred format 60% of time, but MORE on struggling topics
        const isStruggling = student.struggles.includes(concept)
        const usePreferred = isStruggling ? Math.random() < 0.4 : Math.random() < 0.6 // Less likely to use preferred when struggling (realism)
        const format = usePreferred 
          ? student.preferredFormat
          : formats[Math.floor(Math.random() * formats.length)]
        
        // Calculate performance based on student profile and day progression
        const isStrength = student.strengths.includes(concept)
        
        let baseScore = student.basePerformance
        if (isStrength) baseScore += 20  // Increased from 15
        if (isStruggling) baseScore -= 30  // Increased struggle penalty from -20 to -30
        
        // Show improvement over time (AI adaptation working!)
        // But struggling topics improve SLOWER
        const improvementMultiplier = isStruggling ? 0.6 : 1.0
        const dayImprovement = day * student.improvementRate * improvementMultiplier
        const currentScore = Math.min(95, baseScore + dayImprovement)
        
        // Preferred format gives +15% boost (increased from 10%)
        // But WRONG format on hard topics gives -10% penalty
        let formatBonus = 0
        if (format === student.preferredFormat) {
          formatBonus = 15
        } else if (isStruggling) {
          formatBonus = -10  // Wrong format makes it worse!
        }
        
        const finalScore = Math.max(25, Math.min(100, currentScore + formatBonus + (Math.random() * 12 - 6)))
        
        // Feedback logic: more negative feedback on struggling topics
        let feedback: "positive" | "negative" | "none" = "none"
        if (finalScore < 60) {  // Changed threshold from 65 to 60
          feedback = Math.random() < 0.85 ? "negative" : "none"  // Increased from 0.7
        } else if (finalScore > 80) {
          feedback = Math.random() < 0.8 ? "positive" : "none"
        } else {
          // Mid-range: occasional feedback
          feedback = Math.random() < 0.15 ? (Math.random() < 0.5 ? "positive" : "negative") : "none"
        }
        
        // Regeneration requests when struggling
        let regenerationType: "simpler" | "examples" | "breakdown" | "analogy" | "none" = "none"
        if (feedback === "negative") {
          const regenOptions: Array<"simpler" | "examples" | "breakdown" | "analogy"> = [
            "simpler",
            "examples", 
            "breakdown",
            "analogy"
          ]
          regenerationType = regenOptions[Math.floor(Math.random() * 4)]
        }
        
        // More activity during study hours (9 AM - 11 PM)
        const hourOffset = 9 + Math.floor(Math.random() * 14) // 9 AM to 11 PM
        const minuteOffset = Math.floor(Math.random() * 60)
        
        const timestamp = new Date(
          now.getTime() - 
          day * 24 * 60 * 60 * 1000 - 
          (23 - hourOffset) * 60 * 60 * 1000 -
          minuteOffset * 60 * 1000
        ).toISOString()
        
        // Learning streak increases over days (showing habit formation)
        const learningStreak = Math.min(day + Math.floor(Math.random() * 3), 10)
        
        const event: LearningEvent = {
          userId: student.userId,
          concept,
          teachingFormat: format,
          quizScore: format === "Quiz" ? Math.round(finalScore) : undefined,
          videoCompletionRate: format === "Video" 
            ? Math.round(finalScore * (0.85 + Math.random() * 0.15)) // Video completion correlates with understanding
            : undefined,
          feedback,
          regenerationType,
          learningStreak,
          timeSpentSeconds: 120 + Math.floor(Math.random() * 480), // 2-10 minutes per interaction
          interactionCount: 1 + Math.floor(Math.random() * 5),
          timestamp,
          metadata: {
            studentName: student.name,
            learningProfile: student.learningProfile,
            dayNumber: 7 - day,
          },
        }

        sampleEvents.push(event)
      }
    }
  })

  // Sort by timestamp (oldest first)
  return sampleEvents.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

/**
 * Get student-specific analytics
 */
export function getStudentAnalytics(events: LearningEvent[], userId: string) {
  const studentEvents = events.filter(e => e.userId === userId)
  
  return {
    totalEvents: studentEvents.length,
    conceptMetrics: calculateConceptDifficulty(studentEvents),
    formatEffectiveness: calculateFormatEffectiveness(studentEvents),
    engagementTrends: calculateEngagementTrends(studentEvents),
    predictiveInsights: generatePredictiveInsights(calculateConceptDifficulty(studentEvents)),
  }
}

/**
 * Get list of unique students from events
 */
export function getStudentList(events: LearningEvent[]): Array<{ userId: string; name: string; eventCount: number }> {
  const studentMap = new Map<string, { name: string; count: number }>()
  
  events.forEach(event => {
    const current = studentMap.get(event.userId) || { name: event.userId, count: 0 }
    studentMap.set(event.userId, {
      name: (event.metadata as any)?.studentName || event.userId,
      count: current.count + 1,
    })
  })
  
  return Array.from(studentMap.entries())
    .map(([userId, data]) => ({
      userId,
      name: data.name,
      eventCount: data.count,
    }))
    .sort((a, b) => b.eventCount - a.eventCount)
}
