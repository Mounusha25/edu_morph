"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Award, Target, Zap, BookOpen } from "lucide-react"
import type { ConceptMetrics } from "@/lib/analytics"

interface StudentProgressProps {
  userId: string
  studentName: string
  totalEvents: number
  avgQuizScore: number
  avgVideoCompletion: number
  learningStreak: number
  conceptMetrics: ConceptMetrics[]
  classAvgQuizScore: number
  classAvgCompletion: number
}

export function StudentProgress({
  userId,
  studentName,
  totalEvents,
  avgQuizScore,
  avgVideoCompletion,
  learningStreak,
  conceptMetrics,
  classAvgQuizScore,
  classAvgCompletion,
}: StudentProgressProps) {
  // Calculate mastery levels
  const masteredConcepts = conceptMetrics.filter(c => c.avgQuizScore >= 80).length
  const strugglingConcepts = conceptMetrics.filter(c => c.difficultyScore > 70).length
  const improvingConcepts = conceptMetrics.filter(c => 
    c.avgQuizScore >= 60 && c.avgQuizScore < 80
  ).length

  // Performance vs class average
  const quizDiff = avgQuizScore - classAvgQuizScore
  const completionDiff = avgVideoCompletion - classAvgCompletion

  return (
    <div className="space-y-6">
      {/* Personal Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-purple-900/40 to-purple-800/40 border-purple-500/50">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-8 h-8 text-purple-400" />
            <Badge className="bg-purple-500/20 text-purple-300">Streak</Badge>
          </div>
          <div className="text-3xl font-bold text-white">{learningStreak} days</div>
          <div className="text-sm text-gray-300 mt-1">Learning Streak</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-900/40 to-green-800/40 border-green-500/50">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 text-green-400" />
            <Badge className="bg-green-500/20 text-green-300">Mastery</Badge>
          </div>
          <div className="text-3xl font-bold text-white">{masteredConcepts}</div>
          <div className="text-sm text-gray-300 mt-1">Concepts Mastered</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-900/40 to-blue-800/40 border-blue-500/50">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-blue-400" />
            <Badge className="bg-blue-500/20 text-blue-300">Progress</Badge>
          </div>
          <div className="text-3xl font-bold text-white">{improvingConcepts}</div>
          <div className="text-sm text-gray-300 mt-1">Currently Learning</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-900/40 to-orange-800/40 border-orange-500/50">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-8 h-8 text-orange-400" />
            <Badge className="bg-orange-500/20 text-orange-300">Activity</Badge>
          </div>
          <div className="text-3xl font-bold text-white">{totalEvents}</div>
          <div className="text-sm text-gray-300 mt-1">Learning Sessions</div>
        </Card>
      </div>

      {/* Performance Comparison */}
      <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-purple-500/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          Performance vs Class Average
        </h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Quiz Performance</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">{Math.round(avgQuizScore)}%</span>
                <Badge 
                  variant={quizDiff >= 0 ? "default" : "destructive"}
                  className={quizDiff >= 0 ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}
                >
                  {quizDiff >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {quizDiff >= 0 ? '+' : ''}{Math.round(quizDiff)}%
                </Badge>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, avgQuizScore)}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Class average: {Math.round(classAvgQuizScore)}%
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Video Engagement</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">{Math.round(avgVideoCompletion)}%</span>
                <Badge 
                  variant={completionDiff >= 0 ? "default" : "destructive"}
                  className={completionDiff >= 0 ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}
                >
                  {completionDiff >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {completionDiff >= 0 ? '+' : ''}{Math.round(completionDiff)}%
                </Badge>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, avgVideoCompletion)}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Class average: {Math.round(classAvgCompletion)}%
            </div>
          </div>
        </div>
      </Card>

      {/* Concept Mastery Breakdown */}
      <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-purple-500/30">
        <h3 className="text-lg font-bold text-white mb-4">Your Concept Mastery</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="text-3xl font-bold text-green-400">{masteredConcepts}</div>
            <div className="text-sm text-green-300">Mastered (≥80%)</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="text-3xl font-bold text-blue-400">{improvingConcepts}</div>
            <div className="text-sm text-blue-300">Improving (60-79%)</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="text-3xl font-bold text-red-400">{strugglingConcepts}</div>
            <div className="text-sm text-red-300">Need Focus (&lt;60%)</div>
          </div>
        </div>

        <div className="space-y-2">
          {conceptMetrics.slice(0, 8).map((concept, idx) => {
            let statusColor = "text-green-400"
            let bgColor = "bg-green-500/10"
            let borderColor = "border-green-500/30"
            
            if (concept.avgQuizScore < 60) {
              statusColor = "text-red-400"
              bgColor = "bg-red-500/10"
              borderColor = "border-red-500/30"
            } else if (concept.avgQuizScore < 80) {
              statusColor = "text-blue-400"
              bgColor = "bg-blue-500/10"
              borderColor = "border-blue-500/30"
            }

            return (
              <div key={idx} className={`p-3 rounded-lg ${bgColor} border ${borderColor}`}>
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{concept.concept}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${statusColor}`}>
                      {concept.avgQuizScore}% mastery
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {concept.mostEffectiveFormat}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
