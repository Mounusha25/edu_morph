"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Database, TrendingUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TelemetryEvent {
  id: string
  concept: string
  teachingFormat: string
  quizScore?: number
  videoCompletionRate?: number
  feedback: string
  regenerationType: string
  timestamp: string
}

export function TelemetryMonitor() {
  const [events, setEvents] = useState<TelemetryEvent[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [totalEvents, setTotalEvents] = useState(0)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Listen for telemetry events from localStorage or custom events
    const checkTelemetry = setInterval(() => {
      const stored = localStorage.getItem("telemetry_events")
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as TelemetryEvent[]
          setEvents(parsed.slice(-10)) // Show last 10 events
          setTotalEvents(parsed.length)
        } catch (e) {
          console.error("Failed to parse telemetry", e)
        }
      }
    }, 1000)

    // Check Azure connection status
    fetch("/api/telemetry")
      .then((res) => res.json())
      .then((data) => {
        // API returns `status` and `azureServices.eventHubs` but not `configured`
        const connected = data.status === "configured" || data?.azureServices?.eventHubs === true
        setIsConnected(connected)
      })
      .catch(() => setIsConnected(false))

    return () => clearInterval(checkTelemetry)
  }, [])

  // Keyboard shortcut: Ctrl+Shift+T to toggle
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "T" || e.key === "t")) {
        e.preventDefault()
        setIsVisible((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  // Listen for custom toggle events from UI buttons
  useEffect(() => {
    const handleToggle = () => {
      setIsVisible((prev) => !prev)
    }
    window.addEventListener("toggleTelemetry", handleToggle)
    return () => window.removeEventListener("toggleTelemetry", handleToggle)
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <Card className="glass-card fixed bottom-4 right-4 z-50 w-96 max-h-[600px] overflow-hidden border-2 border-green-400/60 shadow-2xl shadow-green-500/40 ring-2 ring-green-500/30">
      <div className="p-4 border-b border-green-500/30 flex items-center justify-between bg-gradient-to-r from-green-900/20 to-emerald-900/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <Database className="w-4 h-4 text-green-400" />
          </div>
          <h3 className="font-semibold text-white">Azure Telemetry Monitor</h3>
        </div>
        <Button
          onClick={() => setIsVisible(false)}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Connection Status */}
      <div className="px-4 py-3 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-b border-white/10">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-white/60">Event Hubs Status:</span>
          <Badge 
            variant={isConnected ? "default" : "destructive"} 
            className={`text-xs ${isConnected ? 'bg-green-500/20 text-green-300 border-green-500/50' : 'bg-red-500/20 text-red-300 border-red-500/50'}`}
          >
            {isConnected ? "✓ Connected" : "✗ Disconnected"}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Total Events Sent:</span>
          <span className="text-green-400 font-mono font-bold text-lg">{totalEvents}</span>
        </div>
      </div>

      {/* Event Stream */}
      <div className="overflow-y-auto max-h-[400px] p-4 space-y-3 bg-black/20">
        {events.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
              <Activity className="w-8 h-8 text-green-400/30" />
            </div>
            <p className="text-sm text-white/60">No events yet</p>
            <p className="text-xs mt-1 text-white/40">Interact with eduMorph to see live telemetry</p>
          </div>
        ) : (
          events
            .slice()
            .reverse()
            .map((event, idx) => (
              <div
                key={event.id || idx}
                className="glass-card p-3 border-green-500/20 hover:border-green-500/40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs bg-green-900/30 text-green-300 border-green-500/50">
                    {event.teachingFormat}
                  </Badge>
                  <span className="text-xs text-white/40 font-mono">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-sm font-medium text-white mb-2 truncate" title={event.concept}>
                  {event.concept}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {event.quizScore !== undefined && (
                    <div className="flex items-center gap-1">
                      <span className="text-white/60">Quiz:</span>
                      <span className={`font-mono font-semibold ${event.quizScore >= 70 ? "text-green-400" : "text-red-400"}`}>
                        {event.quizScore}%
                      </span>
                    </div>
                  )}

                  {event.videoCompletionRate !== undefined && (
                    <div className="flex items-center gap-1">
                      <span className="text-white/60">Video:</span>
                      <span className={`font-mono font-semibold ${event.videoCompletionRate >= 80 ? "text-green-400" : "text-yellow-400"}`}>
                        {event.videoCompletionRate}%
                      </span>
                    </div>
                  )}

                  {event.feedback !== "none" && (
                    <div className="flex items-center gap-1">
                      <span className="text-white/60">Feedback:</span>
                      <span className={`${event.feedback === "positive" ? "text-green-400" : "text-red-400"}`}>
                        {event.feedback === "positive" ? "👍" : "👎"}
                      </span>
                    </div>
                  )}

                  {event.regenerationType !== "none" && (
                    <div className="flex items-center gap-1">
                      <span className="text-white/60">Regen:</span>
                      <span className="text-blue-400 text-xs">{event.regenerationType}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-t border-green-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-green-400">
          <TrendingUp className="w-3 h-3" />
          <span className="font-medium">Live Stream</span>
        </div>
        <span className="text-xs text-white/40 font-mono">Ctrl+Shift+T</span>
      </div>
    </Card>
  )
}
