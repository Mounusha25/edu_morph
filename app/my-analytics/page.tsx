"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StudentProgress } from "@/components/analytics/StudentProgress"
import { LearningJourney } from "@/components/analytics/LearningJourney"
import { ArrowLeft, RefreshCw, Sparkles, BarChart3, TrendingUp } from "lucide-react"
import Link from "next/link"
import type { ConceptMetrics, EngagementTrend, PredictiveInsight } from "@/lib/analytics"

interface StudentData {
  userId: string
  studentName: string
  totalEvents: number
  avgQuizScore: number
  avgVideoCompletion: number
  learningStreak: number
  conceptMetrics: ConceptMetrics[]
  engagementTrends: EngagementTrend[]
  predictiveInsights: PredictiveInsight[]
  classAvgQuizScore: number
  classAvgCompletion: number
}

export default function MyAnalyticsPage() {
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)

  // Hardcoded to Marcus Johnson (MJ)
  const STUDENT_ID = "student_marcus_johnson"

  const fetchStudentData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/student-analytics?userId=${STUDENT_ID}`)
      if (!response.ok) throw new Error("Failed to fetch student analytics")
      const result = await response.json()
      setStudentData(result.data)
    } catch (error) {
      console.error("Error fetching student data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-card p-6 mb-8 border-purple-500/30">
          <Link href="/">
            <Button variant="ghost" className="mb-4 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <span className="text-xl font-bold text-white">MJ</span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    My Learning Dashboard
                  </h1>
                  <p className="text-gray-400">
                    Marcus Johnson's personalized insights
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-500/50 px-3 py-1.5 shadow-lg shadow-purple-500/20">
                <Sparkles className="w-3 h-3 mr-1" />
                Powered by Azure OpenAI
              </Badge>
              <Button
                onClick={fetchStudentData}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/30 transition-all"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="glass-card p-12 text-center border-purple-500/30">
            <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-400" />
            <p className="text-gray-400">Loading your learning data...</p>
          </div>
        )}

        {/* Student Dashboard Content */}
        {!loading && studentData && (
          <div className="space-y-8">
            {/* Progress Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Your Progress</h2>
              </div>
              <StudentProgress
                userId={studentData.userId}
                studentName={studentData.studentName}
                totalEvents={studentData.totalEvents}
                avgQuizScore={studentData.avgQuizScore}
                avgVideoCompletion={studentData.avgVideoCompletion}
                learningStreak={studentData.learningStreak}
                conceptMetrics={studentData.conceptMetrics}
                classAvgQuizScore={studentData.classAvgQuizScore}
                classAvgCompletion={studentData.classAvgCompletion}
              />
            </section>

            {/* Learning Journey Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Learning Journey</h2>
              </div>
              <LearningJourney
                engagementTrends={studentData.engagementTrends}
                predictiveInsights={studentData.predictiveInsights}
                studentName={studentData.studentName}
              />
            </section>
          </div>
        )}

        {/* Empty State */}
        {!loading && !studentData && (
          <div className="glass-card p-12 text-center border-purple-500/30">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-400/50" />
            <p className="text-gray-400 mb-4">No analytics data available</p>
            <Button 
              onClick={fetchStudentData} 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/30"
            >
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
