"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StudentProgress } from "@/components/analytics/StudentProgress"
import { LearningJourney } from "@/components/analytics/LearningJourney"
import { ArrowLeft, User, Users, RefreshCw } from "lucide-react"
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

export default function StudentDashboardPage() {
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [availableStudents, setAvailableStudents] = useState<Array<{ userId: string; name: string }>>([])
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [loading, setLoading] = useState(true)

  const fetchStudentData = async (userId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/student-analytics?userId=${userId}`)
      if (!response.ok) throw new Error("Failed to fetch student analytics")
      const result = await response.json()
      setStudentData(result.data)
    } catch (error) {
      console.error("Error fetching student data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentList = async () => {
    try {
      const response = await fetch("/api/student-list")
      if (!response.ok) throw new Error("Failed to fetch student list")
      const result = await response.json()
      setAvailableStudents(result.students)
      
      // Auto-select first student
      if (result.students.length > 0 && !selectedUserId) {
        const firstStudent = result.students[0].userId
        setSelectedUserId(firstStudent)
        fetchStudentData(firstStudent)
      }
    } catch (error) {
      console.error("Error fetching student list:", error)
    }
  }

  useEffect(() => {
    fetchStudentList()
  }, [])

  const handleStudentChange = (userId: string) => {
    setSelectedUserId(userId)
    fetchStudentData(userId)
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            <div className="flex items-center gap-3">
              <Link href="/analytics">
                <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
                  <Users className="w-4 h-4 mr-2" />
                  View Class Analytics
                </Button>
              </Link>
              
              <Button
                onClick={() => selectedUserId && fetchStudentData(selectedUserId)}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                My Learning Dashboard
              </h1>
              <p className="text-gray-400">
                Personalized insights powered by Azure OpenAI
              </p>
            </div>

            {/* Student Selector */}
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-500/50">
                <User className="w-3 h-3 mr-1" />
                Student View
              </Badge>
              
              <select
                value={selectedUserId}
                onChange={(e) => handleStudentChange(e.target.value)}
                className="bg-gray-800 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                {availableStudents.map((student) => (
                  <option key={student.userId} value={student.userId}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-400" />
            <p className="text-gray-400">Loading your learning data...</p>
          </div>
        )}

        {/* Student Dashboard Content */}
        {!loading && studentData && (
          <div className="space-y-8">
            {/* Progress Section */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Your Progress</h2>
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
              <h2 className="text-2xl font-bold text-white mb-4">Learning Journey</h2>
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
          <div className="text-center py-20">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">No student data available</p>
            <Button onClick={fetchStudentList} className="mt-4" variant="outline">
              Load Demo Data
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
