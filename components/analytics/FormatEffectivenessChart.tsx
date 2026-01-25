"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { FormatEffectiveness } from "@/lib/analytics"

interface FormatEffectivenessChartProps {
  data: FormatEffectiveness[]
}

export function FormatEffectivenessChart({ data }: FormatEffectivenessChartProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-purple-500/30">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Teaching Format Effectiveness</h3>
        <p className="text-sm text-gray-400">
          Comparing quiz scores and engagement across different teaching formats
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="format" stroke="#9ca3af" />
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
              if (name === "avgQuizScore") return [`${value}%`, "Avg Quiz Score"]
              if (name === "avgCompletion") return [`${value}%`, "Avg Completion"]
              if (name === "effectivenessScore") return [`${value}/100`, "Effectiveness"]
              return [value, name]
            }}
          />
          <Legend />
          <Bar dataKey="avgQuizScore" fill="#10b981" name="Avg Quiz Score" radius={[8, 8, 0, 0]} />
          <Bar dataKey="avgCompletion" fill="#6366f1" name="Avg Completion" radius={[8, 8, 0, 0]} />
          <Bar dataKey="effectivenessScore" fill="#f59e0b" name="Effectiveness Score" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        {data.map((format) => (
          <div key={format.format} className="text-center">
            <div className="text-2xl font-bold text-purple-400">{format.usageCount}</div>
            <div className="text-xs text-gray-400">{format.format} uses</div>
            <div className="text-xs text-green-400 mt-1">{Math.round(format.positiveRate * 100)}% positive</div>
          </div>
        ))}
      </div>
    </Card>
  )
}
