"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp, Sparkles, Target } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { EngagementTrend, PredictiveInsight } from "@/lib/analytics"

interface LearningJourneyProps {
  engagementTrends: EngagementTrend[]
  predictiveInsights: PredictiveInsight[]
  studentName: string
}

export function LearningJourney({ engagementTrends, predictiveInsights, studentName }: LearningJourneyProps) {
  // Format data for chart
  const chartData = engagementTrends.map((trend, idx) => ({
    day: `Day ${idx + 1}`,
    score: trend.avgQuizScore,
    completion: trend.avgVideoCompletion,
    timestamp: trend.timestamp,
  }))

  // Calculate improvement
  const firstScore = chartData[0]?.score || 0
  const lastScore = chartData[chartData.length - 1]?.score || 0
  const improvement = lastScore - firstScore

  // Get personalized recommendations (top 3)
  const recommendations = predictiveInsights.slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Journey Header */}
      <Card className="p-6 bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500/50">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-400" />
              Your 7-Day Learning Journey
            </h2>
            <p className="text-gray-300">
              Track your progress and AI-powered recommendations
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2">
            {improvement >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : null}
            {improvement >= 0 ? '+' : ''}{Math.round(improvement)}% this week
          </Badge>
        </div>
      </Card>

      {/* Progress Chart */}
      <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-purple-500/30">
        <h3 className="text-lg font-bold text-white mb-4">Performance Trend</h3>
        
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="day" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #6366f1",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fff" }}
              itemStyle={{ color: "#fff" }}
              formatter={(value: number, name: string) => {
                if (name === "score") return [`${value}%`, "Quiz Score"]
                if (name === "completion") return [`${value}%`, "Video Completion"]
                return [value, name]
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#a855f7"
              strokeWidth={3}
              dot={{ fill: "#a855f7", r: 5 }}
              name="score"
            />
            <Line
              type="monotone"
              dataKey="completion"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: "#3b82f6", r: 5 }}
              name="completion"
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <div className="text-2xl font-bold text-purple-400">{firstScore}%</div>
            <div className="text-xs text-gray-400">Day 1 Performance</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="text-2xl font-bold text-blue-400">{lastScore}%</div>
            <div className="text-xs text-gray-400">Current Performance</div>
          </div>
        </div>
      </Card>

      {/* AI Recommendations */}
      <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Recommendations for {studentName}
          </h3>
          <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-500/50">
            Powered by Azure OpenAI
          </Badge>
        </div>

        <div className="space-y-3">
          {recommendations.map((insight, idx) => {
            const colors = {
              high_risk: { 
                bg: "bg-red-500/10", 
                border: "border-red-500/30", 
                text: "text-red-300",
                badge: "bg-red-500/20 text-red-300"
              },
              moderate: { 
                bg: "bg-yellow-500/10", 
                border: "border-yellow-500/30", 
                text: "text-yellow-300",
                badge: "bg-yellow-500/20 text-yellow-300"
              },
              on_track: { 
                bg: "bg-green-500/10", 
                border: "border-green-500/30", 
                text: "text-green-300",
                badge: "bg-green-500/20 text-green-300"
              },
            }

            const color = colors[insight.prediction]

            return (
              <div key={idx} className={`p-4 rounded-lg ${color.bg} border ${color.border}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className={`w-4 h-4 ${color.text}`} />
                      <h4 className="font-semibold text-white">{insight.concept}</h4>
                      <Badge className={color.badge}>
                        {insight.prediction.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{insight.suggestedImprovement}</p>
                    <div className="text-xs text-gray-400">
                      Recommended format: <span className="text-purple-400 font-medium">{insight.recommendedFormat}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`text-xl font-bold ${color.text}`}>
                      {Math.round(insight.confidence * 100)}%
                    </div>
                    <div className="text-xs text-gray-400">confidence</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {recommendations.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>Great work! Keep up the momentum.</p>
          </div>
        )}
      </Card>
    </div>
  )
}
