import { z } from "zod"

/**
 * Azure Event Hubs - Learning Telemetry Schema
 * 
 * This schema captures real-time learning interactions for:
 * - Concept difficulty analysis
 * - Teaching format effectiveness
 * - Engagement pattern detection
 * - AI-driven prompt adaptation
 */

export const LearningEventSchema = z.object({
  // Core identifiers
  userId: z.string().min(1).max(100).default("demo_user"), // Student identifier
  concept: z.string().min(1).max(500),
  teachingFormat: z.enum(["Analogy", "Diagram", "Video", "OneLiner", "Quiz"]),
  
  // Learning outcomes
  quizScore: z.number().min(0).max(100).optional(),
  videoCompletionRate: z.number().min(0).max(100).optional(), // Percentage watched
  
  // User feedback signals
  feedback: z.enum(["positive", "negative", "none"]).default("none"),
  regenerationType: z.enum(["simpler", "examples", "breakdown", "analogy", "none"]).default("none"),
  
  // Engagement metrics
  learningStreak: z.number().min(0).default(0),
  timeSpentSeconds: z.number().min(0).optional(),
  interactionCount: z.number().min(0).optional(), // Quiz attempts, video replays, etc.
  
  // Context
  timestamp: z.string().datetime(), // ISO-8601 format
  sessionId: z.string().uuid().optional(),
  
  // Metadata for analytics
  metadata: z.record(z.unknown()).optional(),
})

export type LearningEvent = z.infer<typeof LearningEventSchema>

/**
 * Batch telemetry events to reduce network overhead
 * Debounces and groups events before sending to Azure Event Hubs
 */
export class TelemetryBatcher {
  private queue: LearningEvent[] = []
  private flushTimeout: NodeJS.Timeout | null = null
  private readonly maxBatchSize = 10
  private readonly flushIntervalMs = 5000 // 5 seconds

  /**
   * Add event to batch queue
   * Auto-flushes when batch size reached or timeout expires
   */
  add(event: LearningEvent): void {
    this.queue.push(event)

    // Flush immediately if batch is full
    if (this.queue.length >= this.maxBatchSize) {
      this.flush()
    } else {
      // Schedule flush if not already scheduled
      if (!this.flushTimeout) {
        this.flushTimeout = setTimeout(() => this.flush(), this.flushIntervalMs)
      }
    }
  }

  /**
   * Send batched events to telemetry endpoint
   */
  private async flush(): Promise<void> {
    if (this.queue.length === 0) return

    const batch = [...this.queue]
    this.queue = []

    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout)
      this.flushTimeout = null
    }

    try {
      // Fire-and-forget: don't block user experience
      fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: batch }),
        // Use keepalive to ensure request completes even if user navigates away
        keepalive: true,
      }).catch((error) => {
        console.error("[Telemetry] Failed to send batch:", error)
        // In production, consider implementing retry with exponential backoff
      })
    } catch (error) {
      console.error("[Telemetry] Batch flush error:", error)
    }
  }

  /**
   * Force immediate flush (e.g., on page unload)
   */
  forceFlush(): void {
    this.flush()
  }
}

// Global singleton batcher instance
export const telemetryBatcher = new TelemetryBatcher()

/**
 * Helper function to track learning events
 * Validates schema and adds to batch queue
 */
export function trackLearningEvent(event: Partial<LearningEvent>): void {
  try {
    // Add timestamp if not provided
    const eventWithTimestamp = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
    }

    // Validate against schema
    const validatedEvent = LearningEventSchema.parse(eventWithTimestamp)

    // Add to batch queue
    telemetryBatcher.add(validatedEvent)

    // Also store with ID for demo monitor
    if (typeof window !== "undefined") {
      const eventWithId = {
        ...validatedEvent,
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }
      
      const stored = localStorage.getItem("telemetry_events")
      const existing = stored ? JSON.parse(stored) : []
      const updated = [...existing, eventWithId].slice(-50)
      localStorage.setItem("telemetry_events", JSON.stringify(updated))
    }

    console.log("[Telemetry] Event tracked:", validatedEvent.concept, validatedEvent.teachingFormat)
  } catch (error) {
    console.error("[Telemetry] Invalid event schema:", error)
    // Don't throw - telemetry should never break user experience
  }
}
