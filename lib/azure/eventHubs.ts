import { EventHubProducerClient } from "@azure/event-hubs"
import { DefaultAzureCredential } from "@azure/identity"
import type { LearningEvent } from "./telemetry"

/**
 * Azure Event Hubs Client
 * 
 * Streams learning telemetry events to Azure Event Hubs for:
 * - Real-time ingestion
 * - Downstream processing via Azure Stream Analytics
 * - Storage in Azure Data Lake Gen2
 * - Analytics in Azure Synapse
 * 
 * Connection Methods:
 * - Connection String (simpler for development/hackathon)
 * - Managed Identity (production-ready, more secure)
 */

class AzureEventHubsClient {
  private client: EventHubProducerClient | null = null
  private connectionString: string | null = null
  private eventHubName: string | null = null

  /**
   * Initialize Event Hubs client
   * Uses connection string for simplicity during hackathon
   * Can be upgraded to Managed Identity for production
   */
  async initialize(): Promise<void> {
    if (this.client) return // Already initialized

    this.connectionString = process.env.AZURE_EVENTHUB_CONNECTION_STRING || null
    this.eventHubName = process.env.AZURE_EVENTHUB_NAME || "slidesage-learning-events"

    if (!this.connectionString) {
      console.warn("[Azure Event Hubs] Connection string not configured. Telemetry disabled.")
      return
    }

    try {
      // Create producer client
      this.client = new EventHubProducerClient(this.connectionString, this.eventHubName)
      console.log("[Azure Event Hubs] Client initialized successfully")
    } catch (error) {
      console.error("[Azure Event Hubs] Initialization failed:", error)
      throw error
    }
  }

  /**
   * Send learning events to Event Hubs
   * Supports batching for efficiency
   */
  async sendEvents(events: LearningEvent[]): Promise<void> {
    if (!this.client) {
      console.warn("[Azure Event Hubs] Client not initialized. Skipping event send.")
      return
    }

    if (events.length === 0) return

    try {
      // Create batch
      const batch = await this.client.createBatch()

      // Add events to batch
      for (const event of events) {
        const eventData = {
          body: event,
          properties: {
            concept: event.concept,
            format: event.teachingFormat,
            timestamp: event.timestamp,
          },
        }

        // Try to add to batch
        const added = batch.tryAdd(eventData)
        
        if (!added) {
          // Batch is full, send it and create a new one
          await this.client.sendBatch(batch)
          const newBatch = await this.client.createBatch()
          newBatch.tryAdd(eventData)
          await this.client.sendBatch(newBatch)
        }
      }

      // Send remaining events in batch
      if (batch.count > 0) {
        await this.client.sendBatch(batch)
        console.log(`[Azure Event Hubs] Sent ${batch.count} events successfully`)
      }
    } catch (error) {
      console.error("[Azure Event Hubs] Failed to send events:", error)
      throw error
    }
  }

  /**
   * Close the client connection
   * Should be called on application shutdown
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.client = null
      console.log("[Azure Event Hubs] Client closed")
    }
  }
}

// Singleton instance
export const eventHubsClient = new AzureEventHubsClient()

/**
 * Stream Analytics to Data Lake Gen2
 * 
 * This is configured in Azure Portal, not in code.
 * The Stream Analytics job should:
 * 
 * 1. INPUT: Azure Event Hubs (slidesage-learning-events)
 * 2. QUERY: SELECT * INTO datalake FROM eventhub
 * 3. OUTPUT: Azure Data Lake Gen2
 *    - Path pattern: /learning-telemetry/{date}/{concept}/events.json
 *    - Format: Line-delimited JSON (JSONL)
 * 
 * This enables:
 * - Real-time data ingestion
 * - Time-series partitioning
 * - Efficient querying in Synapse
 */

/**
 * Example Stream Analytics Query (for reference):
 * 
 * -- Basic passthrough with enrichment
 * SELECT
 *     concept,
 *     teachingFormat,
 *     quizScore,
 *     feedback,
 *     regenerationType,
 *     videoCompletionRate,
 *     learningStreak,
 *     timestamp,
 *     System.Timestamp() AS ProcessedTime,
 *     DATEPART(year, timestamp) AS Year,
 *     DATEPART(month, timestamp) AS Month,
 *     DATEPART(day, timestamp) AS Day
 * INTO datalake
 * FROM eventhub
 * 
 * -- Also send to Synapse for real-time analytics
 * SELECT
 *     concept,
 *     teachingFormat,
 *     AVG(quizScore) AS AvgScore,
 *     COUNT(*) AS EventCount,
 *     System.Timestamp() AS WindowEnd
 * INTO synapse
 * FROM eventhub
 * GROUP BY
 *     concept,
 *     teachingFormat,
 *     TumblingWindow(minute, 5)
 */
