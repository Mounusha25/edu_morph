"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, AlertCircle, Brain, TrendingUp } from "lucide-react"
import type { PredictiveInsight } from "@/lib/analytics"

interface AIInsightsProps {
  insights: PredictiveInsight[]
}

export function AIInsights({ insights }: AIInsightsProps) {
  const getIcon = (prediction: string) => {
    switch (prediction) {
      case "high_risk":
        return AlertTriangle
      case "moderate":
        return AlertCircle
      default:
        return CheckCircle
    }
  }

  const getColor = (prediction: string) => {
    switch (prediction) {
      case "high_risk":
        return {
          icon: "text-red-400",
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          badge: "destructive" as const,
        }
      case "moderate":
        return {
          icon: "text-yellow-400",
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/30",
          badge: "default" as const,
        }
      default:
        return {
          icon: "text-green-400",
          bg: "bg-green-500/10",
          border: "border-green-500/30",
          badge: "default" as const,
        }
    }
  }

  // Show top 6 insights
  const topInsights = insights.slice(0, 6)

  return (
    <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-purple-500/30">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            AI-Powered Predictive Insights
          </h3>
          <p className="text-sm text-gray-400">
            Azure OpenAI analyzes learning patterns and recommends optimizations
          </p>
        </div>
        <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-500/50">
          <TrendingUp className="w-3 h-3 mr-1" />
          Powered by Azure OpenAI
        </Badge>
      </div>

      <div className="space-y-4">
        {topInsights.map((insight, idx) => {
          const Icon = getIcon(insight.prediction)
          const colors = getColor(insight.prediction)

          return (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${colors.border} ${colors.bg} transition-all hover:border-purple-500/50`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${colors.bg}`}>
                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{insight.concept}</h4>
                    <Badge variant={colors.badge} className="mt-1 text-xs">
                      {insight.prediction.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Confidence</div>
                  <div className={`text-lg font-bold ${colors.icon}`}>{Math.round(insight.confidence * 100)}%</div>
                </div>
              </div>

              <div className="text-sm text-gray-300 mb-2">{insight.suggestedImprovement}</div>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="font-medium text-purple-400">Recommended Format:</span>
                <Badge variant="outline" className="text-xs">
                  {insight.recommendedFormat}
                </Badge>
              </div>
            </div>
          )
        })}
      </div>

      {insights.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Brain className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No insights yet. Collect more learning data to enable AI predictions.</p>
        </div>
      )}
    </Card>
  )
}
