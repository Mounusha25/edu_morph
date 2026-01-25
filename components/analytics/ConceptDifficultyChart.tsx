"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts"
import type { ConceptMetrics } from "@/lib/analytics"

interface ConceptDifficultyChartProps {
  data: ConceptMetrics[]
}

export function ConceptDifficultyChart({ data }: ConceptDifficultyChartProps) {
  // Take top 8 most difficult concepts
  const topConcepts = data.slice(0, 8)

  // Color based on difficulty
  const getColor = (difficultyScore: number) => {
    if (difficultyScore >= 70) return "#ef4444" // red-500
    if (difficultyScore >= 50) return "#f59e0b" // amber-500
    return "#10b981" // green-500
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-purple-500/30">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Concept Difficulty Analysis</h3>
        <p className="text-sm text-gray-400">
          Difficulty score based on quiz performance, video engagement, and feedback (0-100, higher = harder)
        </p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={topConcepts} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" />
          <YAxis dataKey="concept" type="category" stroke="#9ca3af" width={140} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #6366f1",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#fff" }}
            formatter={(value: number, name: string) => {
              if (name === "difficultyScore") return [`${value}/100`, "Difficulty"]
              if (name === "avgQuizScore") return [`${value}%`, "Avg Quiz Score"]
              if (name === "avgVideoCompletion") return [`${value}%`, "Avg Video Completion"]
              return [value, name]
            }}
          />
          <Legend />
          <Bar dataKey="difficultyScore" name="Difficulty Score" radius={[0, 8, 8, 0]}>
            {topConcepts.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.difficultyScore)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center gap-6 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span>Easy (&lt;50)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500"></div>
          <span>Moderate (50-70)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span>Hard (&gt;70)</span>
        </div>
      </div>
    </Card>
  )
}
