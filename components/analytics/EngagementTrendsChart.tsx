"use client"

import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { EngagementTrend } from "@/lib/analytics"

interface EngagementTrendsChartProps {
  data: EngagementTrend[]
}

export function EngagementTrendsChart({ data }: EngagementTrendsChartProps) {
  // Format timestamp for display
  const formattedData = data.map((d) => ({
    ...d,
    displayTime: new Date(d.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
    }),
  }))

  return (
    <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-purple-500/30">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Engagement Trends Over Time</h3>
        <p className="text-sm text-gray-400">
          Tracking quiz performance and video completion hourly
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="displayTime" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
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
              if (name === "avgVideoCompletion") return [`${value}%`, "Avg Video Completion"]
              if (name === "eventCount") return [value, "Events"]
              return [value, name]
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="avgQuizScore"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: "#10b981", r: 4 }}
            name="Avg Quiz Score"
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="avgVideoCompletion"
            stroke="#6366f1"
            strokeWidth={3}
            dot={{ fill: "#6366f1", r: 4 }}
            name="Avg Video Completion"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-green-400">
            {formattedData.reduce((sum, d) => sum + d.eventCount, 0)}
          </div>
          <div className="text-xs text-gray-400">Total Events</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-400">
            {Math.round(
              formattedData.reduce((sum, d) => sum + d.avgQuizScore, 0) / (formattedData.length || 1)
            )}%
          </div>
          <div className="text-xs text-gray-400">Avg Quiz Score</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-400">
            {Math.round(
              formattedData.reduce((sum, d) => sum + d.avgVideoCompletion, 0) / (formattedData.length || 1)
            )}%
          </div>
          <div className="text-xs text-gray-400">Avg Completion</div>
        </div>
      </div>
    </Card>
  )
}
