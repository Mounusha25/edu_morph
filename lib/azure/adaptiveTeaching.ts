import { OpenAIClient, AzureKeyCredential } from "@azure/openai"

/**
 * Azure OpenAI - Adaptive Teaching Logic
 * 
 * Purpose: Use aggregated analytics from Synapse to improve teaching quality
 * 
 * This service:
 * 1. Receives concept performance metrics from Synapse Analytics
 * 2. Uses Azure OpenAI to generate adaptive teaching strategies
 * 3. Returns prompt modifiers that influence content generation
 * 
 * Example Input (from Synapse):
 * {
 *   concept: "Eigenvectors",
 *   avgQuizScore: 65,
 *   negFeedbackRate: 0.35,
 *   videoDropoffRate: 0.45,
 *   topRegenerationType: "simpler"
 * }
 * 
 * Example Output:
 * {
 *   analogyStyle: "use everyday objects, avoid abstract math",
 *   diagramComplexity: "break into 5+ smaller steps",
 *   videoPacing: "slower, repeat key points",
 *   quizDifficulty: "easier, focus on basics"
 * }
 */

interface ConceptAnalytics {
  concept: string
  avgQuizScore: number
  negFeedbackRate: number
  videoDropoffRate: number
  topRegenerationType: string
  sampleSize: number
}

interface AdaptiveStrategy {
  analogyStyle: string
  diagramComplexity: string
  videoPacing: string
  quizDifficulty: string
  prerequisiteCheck: string
}

class AzureOpenAIAdaptiveService {
  private client: OpenAIClient | null = null
  private deploymentName: string = "gpt-4o" // Azure OpenAI deployment name

  /**
   * Initialize Azure OpenAI client
   */
  async initialize(): Promise<void> {
    if (this.client) return

    const endpoint = process.env.AZURE_OPENAI_ENDPOINT
    const apiKey = process.env.AZURE_OPENAI_API_KEY

    if (!endpoint || !apiKey) {
      console.warn("[Azure OpenAI] Credentials not configured. Adaptive logic disabled.")
      return
    }

    try {
      this.client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey))
      console.log("[Azure OpenAI] Client initialized successfully")
    } catch (error) {
      console.error("[Azure OpenAI] Initialization failed:", error)
      throw error
    }
  }

  /**
   * Generate adaptive teaching strategy based on concept analytics
   */
  async generateAdaptiveStrategy(analytics: ConceptAnalytics): Promise<AdaptiveStrategy | null> {
    if (!this.client) {
      console.warn("[Azure OpenAI] Client not initialized. Using default strategy.")
      return this.getDefaultStrategy()
    }

    try {
      const prompt = this.buildAdaptivePrompt(analytics)

      const result = await this.client.getChatCompletions(this.deploymentName, [
        {
          role: "system",
          content: `You are an educational AI that analyzes learning data and recommends teaching improvements.
          
Based on concept performance metrics, you provide specific, actionable teaching adjustments.

Return ONLY a JSON object with these fields:
- analogyStyle: How to adjust analogies (e.g., "use more concrete examples", "relate to daily life")
- diagramComplexity: How to adjust step-by-step breakdowns (e.g., "add 2 more intermediate steps", "simplify technical terms")
- videoPacing: How to adjust video explanations (e.g., "slow down by 20%", "repeat key concepts")
- quizDifficulty: How to adjust quiz questions (e.g., "focus on basics first", "add hint system")
- prerequisiteCheck: Any missing prerequisites to address (e.g., "review matrix basics first", "none needed")

Be specific and actionable. Each field should be 5-15 words.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ])

      const content = result.choices[0]?.message?.content
      if (!content) {
        throw new Error("No response from Azure OpenAI")
      }

      // Parse JSON response
      const strategy = JSON.parse(content) as AdaptiveStrategy
      console.log(`[Azure OpenAI] Generated adaptive strategy for: ${analytics.concept}`)

      return strategy
    } catch (error) {
      console.error("[Azure OpenAI] Failed to generate adaptive strategy:", error)
      return this.getDefaultStrategy()
    }
  }

  /**
   * Build prompt for Azure OpenAI based on analytics
   */
  private buildAdaptivePrompt(analytics: ConceptAnalytics): string {
    const {
      concept,
      avgQuizScore,
      negFeedbackRate,
      videoDropoffRate,
      topRegenerationType,
      sampleSize,
    } = analytics

    // Interpret the metrics
    const scoreIssue = avgQuizScore < 70 ? "significantly below passing (70%)" : "acceptable"
    const feedbackIssue = negFeedbackRate > 0.3 ? "high negative feedback rate" : "low negative feedback"
    const engagementIssue = videoDropoffRate > 0.4 ? "poor video retention" : "good video retention"

    return `Concept: "${concept}"

Learning Analytics (${sampleSize} learners):
- Average Quiz Score: ${avgQuizScore}% (${scoreIssue})
- Negative Feedback Rate: ${(negFeedbackRate * 100).toFixed(1)}% (${feedbackIssue})
- Video Drop-off Rate: ${(videoDropoffRate * 100).toFixed(1)}% (${engagementIssue})
- Most Common Regeneration Request: "${topRegenerationType}"

Based on this data, how should we adapt our teaching approach for this concept?
Provide specific, actionable improvements in JSON format.`
  }

  /**
   * Fallback strategy when Azure OpenAI is unavailable
   */
  private getDefaultStrategy(): AdaptiveStrategy {
    return {
      analogyStyle: "use simple, everyday examples",
      diagramComplexity: "break into clear, numbered steps",
      videoPacing: "moderate pace with visual emphasis",
      quizDifficulty: "progressive difficulty, basics first",
      prerequisiteCheck: "verify foundational understanding",
    }
  }
}

// Singleton instance
export const azureOpenAIService = new AzureOpenAIAdaptiveService()

/**
 * Helper function to get adaptive strategy for a concept
 */
export async function getAdaptiveTeachingStrategy(
  concept: string,
  analytics?: ConceptAnalytics,
): Promise<AdaptiveStrategy> {
  // If no analytics provided, use default strategy
  if (!analytics) {
    console.log(`[Adaptive Logic] No analytics for "${concept}", using default strategy`)
    return azureOpenAIService["getDefaultStrategy"]()
  }

  // Initialize service and get strategy
  await azureOpenAIService.initialize()
  const strategy = await azureOpenAIService.generateAdaptiveStrategy(analytics)

  return strategy || azureOpenAIService["getDefaultStrategy"]()
}
