import { type NextRequest, NextResponse } from "next/server"
import { LearningEventSchema } from "@/lib/telemetry"
import { eventHubsClient } from "@/lib/azure/eventHubs"
import { z } from "zod"

export const dynamic = 'force-dynamic'

/**
 * Azure Telemetry API Endpoint
 * 
 * Purpose: Securely stream learning events to Azure Event Hubs
 * 
 * Flow:
 * 1. Frontend batches events → /api/telemetry
 * 2. Validates payload schema
 * 3. Sends to Azure Event Hubs
 * 4. Event Hubs → Stream Analytics → Data Lake Gen2
 * 5. Synapse Analytics queries Data Lake for insights
 * 6. Azure OpenAI uses insights to adapt teaching
 * 
 * This creates the feedback loop:
 * Teach → Observe → Stream → Store → Analyze → Adapt → Teach Better
 */

const TelemetryBatchSchema = z.object({
  events: z.array(LearningEventSchema).min(1).max(100), // Limit batch size
})

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_MAX = 100 // 100 requests per window
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute

function getRateLimitKey(request: NextRequest): string {
  return request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
}

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false
  }

  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request)
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: "rate_limit", message: "Too many telemetry requests" },
        { status: 429 },
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = TelemetryBatchSchema.parse(body)

    // Initialize Event Hubs client if not already done
    await eventHubsClient.initialize()

    // Send events to Azure Event Hubs
    // This is non-blocking for user experience
    await eventHubsClient.sendEvents(validatedData.events)

    console.log(`[Telemetry API] Successfully sent ${validatedData.events.length} events to Azure Event Hubs`)

    // Return success response
    return NextResponse.json({
      success: true,
      eventsProcessed: validatedData.events.length,
      message: "Learning events streamed to Azure successfully",
    })
  } catch (error) {
    console.error("[Telemetry API] Error processing telemetry:", error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "validation_error",
          message: "Invalid telemetry event schema",
          details: error.errors,
        },
        { status: 400 },
      )
    }

    // Handle Azure errors gracefully
    // Don't expose internal error details to client
    return NextResponse.json(
      {
        error: "server_error",
        message: "Failed to process telemetry. Learning will continue without analytics.",
      },
      { status: 500 },
    )
  }
}

/**
 * GET endpoint for health check
 * Useful for monitoring and debugging
 */
export async function GET() {
  const isConfigured = !!process.env.AZURE_EVENTHUB_CONNECTION_STRING

  return NextResponse.json({
    service: "eduMorph Learning Telemetry",
    status: isConfigured ? "configured" : "not_configured",
    message: isConfigured
      ? "Azure Event Hubs integration is active"
      : "Azure Event Hubs not configured. Set AZURE_EVENTHUB_CONNECTION_STRING to enable.",
    azureServices: {
      eventHubs: isConfigured,
      dataLake: "configured_in_stream_analytics",
      synapse: "configured_separately",
      openAI: !!process.env.AZURE_OPENAI_API_KEY,
    },
  })
}
