"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react"

interface MetricsCardsProps {
  totalEvents: number
  avgQuizScore: number
  avgVideoCompletion: number
  highRiskConcepts: number
}

export function MetricsCards({ totalEvents, avgQuizScore, avgVideoCompletion, highRiskConcepts }: MetricsCardsProps) {
  const metrics = [
    {
      label: "Total Learning Events",
      value: totalEvents.toLocaleString(),
      icon: Activity,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      change: "+12% vs last week",
      isPositive: true,
    },
    {
      label: "Avg Quiz Score",
      value: `${Math.round(avgQuizScore)}%`,
      icon: Target,
      color: avgQuizScore >= 70 ? "text-green-400" : "text-yellow-400",
      bgColor: avgQuizScore >= 70 ? "bg-green-500/10" : "bg-yellow-500/10",
      change: avgQuizScore >= 70 ? "+5% improvement" : "Needs attention",
      isPositive: avgQuizScore >= 70,
    },
    {
      label: "Avg Video Completion",
      value: `${Math.round(avgVideoCompletion)}%`,
      icon: TrendingUp,
      color: avgVideoCompletion >= 80 ? "text-green-400" : "text-yellow-400",
      bgColor: avgVideoCompletion >= 80 ? "bg-green-500/10" : "bg-yellow-500/10",
      change: avgVideoCompletion >= 80 ? "Above target" : "Below 80% target",
      isPositive: avgVideoCompletion >= 80,
    },
    {
      label: "High-Risk Concepts",
      value: highRiskConcepts.toString(),
      icon: TrendingDown,
      color: highRiskConcepts === 0 ? "text-green-400" : "text-red-400",
      bgColor: highRiskConcepts === 0 ? "bg-green-500/10" : "bg-red-500/10",
      change: highRiskConcepts === 0 ? "All on track!" : "Requires AI adaptation",
      isPositive: highRiskConcepts === 0,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, idx) => {
        const Icon = metric.icon
        return (
          <Card
            key={idx}
            className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-purple-500/30 hover:border-purple-500/50 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <Icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              <div className={`text-xs ${metric.isPositive ? "text-green-400" : "text-yellow-400"}`}>
                {metric.change}
              </div>
            </div>
            <div className={`text-3xl font-bold mb-1 ${metric.color}`}>{metric.value}</div>
            <div className="text-sm text-gray-400">{metric.label}</div>
          </Card>
        )
      })}
    </div>
  )
}
