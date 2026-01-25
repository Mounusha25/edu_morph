"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MetricsCards } from "@/components/analytics/MetricsCards"
import { ConceptDifficultyChart } from "@/components/analytics/ConceptDifficultyChart"
import { FormatEffectivenessChart } from "@/components/analytics/FormatEffectivenessChart"
import { EngagementTrendsChart } from "@/components/analytics/EngagementTrendsChart"
import { AIInsights } from "@/components/analytics/AIInsights"
import { PowerBIEmbed } from "@/components/analytics/PowerBIEmbed"
import { ArrowLeft, RefreshCw, Database, Sparkles, User } from "lucide-react"
import Link from "next/link"
import type { ConceptMetrics, FormatEffectiveness, EngagementTrend, PredictiveInsight } from "@/lib/analytics"

interface AnalyticsData {
  conceptMetrics: ConceptMetrics[]
  formatEffectiveness: FormatEffectiveness[]
  engagementTrends: EngagementTrend[]
  predictiveInsights: PredictiveInsight[]
  totalEvents: number
  lastUpdated: string
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<string>("all")
  const [availableStudents, setAvailableStudents] = useState<Array<{ userId: string; name: string }>>([])

  // Fetch student list on mount
  useEffect(() => {
    fetch("/api/student-list")
      .then(res => res.json())
      .then(result => {
        if (result.students) {
          setAvailableStudents(result.students)
        }
      })
      .catch(err => console.error("Failed to fetch student list:", err))
  }, [])

  const fetchAnalytics = async (useSample = false, userId: string = "all") => {
    setLoading(true)
    setError(null)

    try {
      if (useSample) {
        // Request sample data from API
        const response = await fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ useSampleData: true, userId: userId !== "all" ? userId : undefined }),
        })

        if (!response.ok) throw new Error("Failed to fetch analytics")
        const result = await response.json()
        setData(result.data)
      } else {
        // Fetch data with optional user filter
        const url = userId !== "all" 
          ? `/api/analytics?userId=${userId}`
          : "/api/analytics"
        
        const storedEvents = localStorage.getItem("telemetry_events")
        
        if (!storedEvents || JSON.parse(storedEvents).length === 0) {
          // No real data, use sample
          const response = await fetch("/api/analytics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ useSampleData: true, userId: userId !== "all" ? userId : undefined }),
          })

          if (!response.ok) throw new Error("Failed to fetch analytics")
          const result = await response.json()
          setData(result.data)
        } else {
          // Has real data
          const response = await fetch(url)
          if (!response.ok) throw new Error("Failed to fetch analytics")
          const result = await response.json()
          setData(result.data)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  // Refetch when user selection changes
  useEffect(() => {
    if (availableStudents.length > 0) {
      fetchAnalytics(true, selectedUser)
    }
  }, [selectedUser])

  // Calculate summary metrics
  const avgQuizScore =
    data && data.conceptMetrics.length > 0
      ? data.conceptMetrics.reduce((sum, m) => sum + m.avgQuizScore, 0) / data.conceptMetrics.length
      : 0

  const avgVideoCompletion =
    data && data.conceptMetrics.length > 0
      ? data.conceptMetrics.reduce((sum, m) => sum + m.avgVideoCompletion, 0) / data.conceptMetrics.length
      : 0

  const highRiskConcepts = data ? data.predictiveInsights.filter((i) => i.prediction === "high_risk").length : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-card p-6 mb-8 border-purple-500/30">
          <Link href="/">
            <Button variant="ghost" className="mb-6 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          {/* Title Section */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Learning Analytics Dashboard
            </h1>
            <p className="text-gray-400 text-sm">
              Real-time insights from Azure Event Hubs → Data Lake → Synapse Analytics
            </p>
          </div>

          {/* Controls Section */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              {/* User Filter Dropdown */}
              <div className="relative">
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="appearance-none bg-gradient-to-br from-gray-800 to-gray-900 border border-purple-500/40 rounded-lg pl-4 pr-10 py-2 text-sm text-white font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 cursor-pointer hover:border-purple-500/60 transition-all shadow-lg"
                >
                  <option value="all">All Students ({availableStudents.reduce((sum, s) => sum + s.eventCount, 0)} events)</option>
                  {availableStudents.map((student) => (
                    <option key={student.userId} value={student.userId}>
                      {student.name} ({student.eventCount} events)
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-purple-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <Link href="/student-dashboard">
                <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 hover:border-purple-500" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Student View
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-500/50 px-2.5 py-1 text-xs shadow-lg shadow-blue-500/20">
                  <Database className="w-3 h-3 mr-1" />
                  Synapse
                </Badge>
                <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-500/50 px-2.5 py-1 text-xs shadow-lg shadow-purple-500/20">
                  <Sparkles className="w-3 h-3 mr-1" />
                  OpenAI
                </Badge>
              </div>
              
              <Button
                onClick={() => fetchAnalytics(true, selectedUser)}
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
            <p className="text-gray-400">Loading analytics...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="glass-card p-8 text-center border-red-500/30">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            <p className="text-red-400 mb-4">Error: {error}</p>
            <Button 
              onClick={() => fetchAnalytics()} 
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg shadow-red-500/30"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Data */}
        {!loading && !error && data && (
          <div className="space-y-8">
            {/* Metrics Cards */}
            <MetricsCards
              totalEvents={data.totalEvents}
              avgQuizScore={avgQuizScore}
              avgVideoCompletion={avgVideoCompletion}
              highRiskConcepts={highRiskConcepts}
            />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ConceptDifficultyChart data={data.conceptMetrics} />
              <FormatEffectivenessChart data={data.formatEffectiveness} />
            </div>

            {/* Engagement Trends */}
            <EngagementTrendsChart data={data.engagementTrends} />

            {/* AI Insights */}
            <AIInsights insights={data.predictiveInsights} />

            {/* Power BI Embed */}
            <PowerBIEmbed embedUrl={process.env.NEXT_PUBLIC_POWERBI_EMBED_URL} />

            {/* Footer Info */}
            <div className="glass-card p-6 text-center border-gray-500/20">
              <p className="text-gray-400 text-sm">Last updated: {new Date(data.lastUpdated).toLocaleString()}</p>
              <p className="mt-2 text-gray-500 text-xs">
                Data pipeline: Azure Event Hubs → Stream Analytics → Data Lake Gen2 → Synapse Analytics → Power BI
              </p>
              <Button
                onClick={() => fetchAnalytics(true)}
                variant="outline"
                size="sm"
                className="mt-4 text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:border-purple-500/50"
              >
                Load Sample Demo Data
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
