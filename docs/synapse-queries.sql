-- ============================================
-- AZURE SYNAPSE ANALYTICS - LEARNING INTELLIGENCE QUERIES
-- ============================================
-- Purpose: Transform raw learning telemetry into actionable insights
-- Data Source: Azure Data Lake Gen2 (via Stream Analytics)
-- Output: Metrics for Azure OpenAI adaptive teaching logic
--
-- These queries answer key questions:
-- 1. Which concepts are difficult to learn?
-- 2. Which teaching formats are most effective?
-- 3. Where do students drop off in videos?
-- 4. What regeneration strategies work best?
-- ============================================

-- ============================================
-- QUERY 1: Concept Difficulty Score
-- ============================================
-- Purpose: Identify concepts that students struggle with
-- Used by: Azure OpenAI to adjust teaching complexity

CREATE VIEW ConceptDifficultyScores AS
SELECT
    concept,
    COUNT(*) AS total_learners,
    AVG(CAST(quizScore AS FLOAT)) AS avg_quiz_score,
    
    -- Feedback metrics
    SUM(CASE WHEN feedback = 'negative' THEN 1 ELSE 0 END) AS negative_feedback_count,
    CAST(SUM(CASE WHEN feedback = 'negative' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) AS neg_feedback_rate,
    
    -- Video engagement
    AVG(CAST(videoCompletionRate AS FLOAT)) AS avg_video_completion,
    
    -- Regeneration signals
    SUM(CASE WHEN regenerationType != 'none' THEN 1 ELSE 0 END) AS regeneration_requests,
    
    -- Difficulty score (0-100, higher = more difficult)
    CAST(
        (100 - AVG(CAST(quizScore AS FLOAT))) * 0.4 +  -- Quiz difficulty weight: 40%
        (CAST(SUM(CASE WHEN feedback = 'negative' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100) * 0.3 +  -- Negative feedback weight: 30%
        ((100 - AVG(CAST(videoCompletionRate AS FLOAT))) * 0.3)  -- Drop-off weight: 30%
    AS FLOAT) AS difficulty_score,
    
    MAX(timestamp) AS last_updated
FROM
    learning_telemetry
WHERE
    teachingFormat IN ('Quiz', 'Video')
GROUP BY
    concept
HAVING
    COUNT(*) >= 5  -- Minimum 5 learners for statistical significance
ORDER BY
    difficulty_score DESC;

-- Usage Example:
-- SELECT TOP 10 * FROM ConceptDifficultyScores ORDER BY difficulty_score DESC;


-- ============================================
-- QUERY 2: Teaching Format Effectiveness
-- ============================================
-- Purpose: Determine which format works best for each concept
-- Used by: Content generation to prioritize effective formats

CREATE VIEW TeachingFormatEffectiveness AS
SELECT
    concept,
    teachingFormat,
    COUNT(*) AS usage_count,
    
    -- Engagement metrics
    AVG(CAST(CASE WHEN quizScore IS NOT NULL THEN quizScore ELSE 0 END AS FLOAT)) AS avg_quiz_score,
    AVG(CAST(CASE WHEN videoCompletionRate IS NOT NULL THEN videoCompletionRate ELSE 0 END AS FLOAT)) AS avg_completion_rate,
    
    -- Feedback sentiment
    CAST(SUM(CASE WHEN feedback = 'positive' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) AS positive_rate,
    CAST(SUM(CASE WHEN feedback = 'negative' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) AS negative_rate,
    
    -- Effectiveness score (0-100)
    CAST(
        AVG(CAST(CASE WHEN quizScore IS NOT NULL THEN quizScore ELSE 50 END AS FLOAT)) * 0.5 +  -- Learning outcome: 50%
        (CAST(SUM(CASE WHEN feedback = 'positive' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100) * 0.3 +  -- Positive feedback: 30%
        AVG(CAST(CASE WHEN videoCompletionRate IS NOT NULL THEN videoCompletionRate ELSE 75 END AS FLOAT)) * 0.2  -- Engagement: 20%
    AS FLOAT) AS effectiveness_score,
    
    MAX(timestamp) AS last_used
FROM
    learning_telemetry
GROUP BY
    concept,
    teachingFormat
HAVING
    COUNT(*) >= 3
ORDER BY
    concept,
    effectiveness_score DESC;

-- Usage Example:
-- SELECT * FROM TeachingFormatEffectiveness WHERE concept = 'Eigenvectors' ORDER BY effectiveness_score DESC;


-- ============================================
-- QUERY 3: Video Engagement Drop-off Analysis
-- ============================================
-- Purpose: Identify where students lose interest in videos
-- Used by: Video pacing and content regeneration logic

CREATE VIEW VideoDropoffAnalysis AS
SELECT
    concept,
    
    -- Completion buckets
    SUM(CASE WHEN videoCompletionRate < 25 THEN 1 ELSE 0 END) AS dropoff_0_25_pct,
    SUM(CASE WHEN videoCompletionRate >= 25 AND videoCompletionRate < 50 THEN 1 ELSE 0 END) AS dropoff_25_50_pct,
    SUM(CASE WHEN videoCompletionRate >= 50 AND videoCompletionRate < 75 THEN 1 ELSE 0 END) AS dropoff_50_75_pct,
    SUM(CASE WHEN videoCompletionRate >= 75 THEN 1 ELSE 0 END) AS completed_75_100_pct,
    
    -- Averages
    AVG(CAST(videoCompletionRate AS FLOAT)) AS avg_completion_rate,
    COUNT(*) AS total_views,
    
    -- Drop-off risk score (0-100, higher = worse retention)
    CAST(
        (CAST(SUM(CASE WHEN videoCompletionRate < 50 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100)
    AS FLOAT) AS dropoff_risk_score,
    
    MAX(timestamp) AS last_viewed
FROM
    learning_telemetry
WHERE
    teachingFormat = 'Video'
    AND videoCompletionRate IS NOT NULL
GROUP BY
    concept
HAVING
    COUNT(*) >= 5
ORDER BY
    dropoff_risk_score DESC;

-- Usage Example:
-- SELECT * FROM VideoDropoffAnalysis WHERE dropoff_risk_score > 50;


-- ============================================
-- QUERY 4: Regeneration Success Rate
-- ============================================
-- Purpose: Measure which regeneration strategies improve learning
-- Used by: Azure OpenAI to recommend improvements

CREATE VIEW RegenerationEffectiveness AS
SELECT
    concept,
    regenerationType,
    COUNT(*) AS regeneration_count,
    
    -- Post-regeneration improvement (requires joining with subsequent quiz attempts)
    -- This is a simplified version; production would use window functions
    AVG(CAST(quizScore AS FLOAT)) AS avg_post_regen_score,
    
    -- Feedback after regeneration
    CAST(SUM(CASE WHEN feedback = 'positive' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) AS post_regen_positive_rate,
    
    -- Success score (0-100)
    CAST(
        AVG(CAST(quizScore AS FLOAT)) * 0.6 +  -- Learning outcome: 60%
        (CAST(SUM(CASE WHEN feedback = 'positive' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100) * 0.4  -- Satisfaction: 40%
    AS FLOAT) AS success_score,
    
    MAX(timestamp) AS last_used
FROM
    learning_telemetry
WHERE
    regenerationType != 'none'
GROUP BY
    concept,
    regenerationType
HAVING
    COUNT(*) >= 2
ORDER BY
    concept,
    success_score DESC;

-- Usage Example:
-- SELECT * FROM RegenerationEffectiveness WHERE concept = 'Eigenvectors' ORDER BY success_score DESC;


-- ============================================
-- QUERY 5: Real-time Learning Dashboard (Last 24 Hours)
-- ============================================
-- Purpose: Power BI dashboard for live monitoring
-- Used by: Demo visualization and real-time insights

CREATE VIEW RealTimeLearningMetrics AS
SELECT
    -- Time buckets (hourly)
    DATEADD(HOUR, DATEDIFF(HOUR, 0, CAST(timestamp AS DATETIME)), 0) AS hour_bucket,
    
    -- Aggregates
    COUNT(*) AS total_events,
    COUNT(DISTINCT concept) AS unique_concepts,
    
    -- Performance
    AVG(CAST(quizScore AS FLOAT)) AS avg_quiz_score,
    AVG(CAST(videoCompletionRate AS FLOAT)) AS avg_video_completion,
    
    -- Sentiment
    CAST(SUM(CASE WHEN feedback = 'positive' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) AS positive_rate,
    CAST(SUM(CASE WHEN feedback = 'negative' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) AS negative_rate,
    
    -- Top concept
    (SELECT TOP 1 concept FROM learning_telemetry t2 
     WHERE DATEADD(HOUR, DATEDIFF(HOUR, 0, CAST(t2.timestamp AS DATETIME)), 0) = 
           DATEADD(HOUR, DATEDIFF(HOUR, 0, CAST(t1.timestamp AS DATETIME)), 0)
     GROUP BY concept ORDER BY COUNT(*) DESC) AS top_concept
FROM
    learning_telemetry t1
WHERE
    CAST(timestamp AS DATETIME) >= DATEADD(HOUR, -24, GETDATE())
GROUP BY
    DATEADD(HOUR, DATEDIFF(HOUR, 0, CAST(timestamp AS DATETIME)), 0)
ORDER BY
    hour_bucket DESC;

-- Usage Example:
-- SELECT * FROM RealTimeLearningMetrics ORDER BY hour_bucket DESC;


-- ============================================
-- QUERY 6: Adaptive Teaching Recommendations
-- ============================================
-- Purpose: Generate AI-ready insights for Azure OpenAI
-- This is the query that feeds the adaptive teaching logic

CREATE VIEW AdaptiveTeachingInsights AS
SELECT
    cd.concept,
    cd.avg_quiz_score,
    cd.neg_feedback_rate,
    cd.avg_video_completion AS video_completion_rate,
    
    -- Top regeneration request
    (SELECT TOP 1 regenerationType 
     FROM learning_telemetry 
     WHERE concept = cd.concept AND regenerationType != 'none'
     GROUP BY regenerationType 
     ORDER BY COUNT(*) DESC) AS top_regeneration_type,
    
    -- Sample size for confidence
    cd.total_learners AS sample_size,
    
    -- Difficulty classification
    CASE
        WHEN cd.difficulty_score > 70 THEN 'Very Difficult'
        WHEN cd.difficulty_score > 50 THEN 'Moderately Difficult'
        WHEN cd.difficulty_score > 30 THEN 'Slightly Difficult'
        ELSE 'Easy'
    END AS difficulty_level,
    
    -- Recommended action
    CASE
        WHEN cd.difficulty_score > 70 THEN 'Major simplification needed'
        WHEN cd.neg_feedback_rate > 0.4 THEN 'Improve explanation clarity'
        WHEN cd.avg_video_completion < 50 THEN 'Reduce video length or improve pacing'
        ELSE 'Maintain current approach'
    END AS recommended_action,
    
    cd.last_updated
FROM
    ConceptDifficultyScores cd
WHERE
    cd.total_learners >= 5  -- Minimum for statistical significance
ORDER BY
    cd.difficulty_score DESC;

-- Usage Example (feed to Azure OpenAI):
-- SELECT TOP 10 * FROM AdaptiveTeachingInsights WHERE difficulty_score > 50;


-- ============================================
-- EXTERNAL TABLE SETUP (if using Data Lake directly)
-- ============================================
-- This creates an external table to query JSON files in Data Lake Gen2

/*
-- Create External Data Source
CREATE EXTERNAL DATA SOURCE LearningTelemetryDataLake
WITH (
    TYPE = HADOOP,
    LOCATION = 'abfss://learning-telemetry@YOUR-STORAGE-ACCOUNT.dfs.core.windows.net/'
);

-- Create External File Format
CREATE EXTERNAL FILE FORMAT JsonLineFormat
WITH (
    FORMAT_TYPE = JSON,
    DATA_COMPRESSION = 'org.apache.hadoop.io.compress.GzipCodec'
);

-- Create External Table
CREATE EXTERNAL TABLE learning_telemetry (
    concept NVARCHAR(500),
    teachingFormat NVARCHAR(50),
    quizScore INT,
    videoCompletionRate FLOAT,
    feedback NVARCHAR(20),
    regenerationType NVARCHAR(50),
    learningStreak INT,
    timeSpentSeconds INT,
    interactionCount INT,
    timestamp DATETIME2,
    sessionId NVARCHAR(100),
    metadata NVARCHAR(MAX)
)
WITH (
    LOCATION = '/year=*/month=*/day=*/',
    DATA_SOURCE = LearningTelemetryDataLake,
    FILE_FORMAT = JsonLineFormat
);
*/

-- ============================================
-- DEMO QUERIES FOR JUDGES
-- ============================================

-- Show top 5 most difficult concepts
SELECT TOP 5 
    concept,
    difficulty_score,
    avg_quiz_score,
    neg_feedback_rate,
    total_learners
FROM ConceptDifficultyScores
ORDER BY difficulty_score DESC;

-- Show teaching format effectiveness comparison
SELECT 
    concept,
    teachingFormat,
    effectiveness_score,
    usage_count
FROM TeachingFormatEffectiveness
WHERE concept IN (SELECT TOP 3 concept FROM ConceptDifficultyScores ORDER BY difficulty_score DESC);

-- Show real-time learning trends
SELECT TOP 24 * FROM RealTimeLearningMetrics ORDER BY hour_bucket DESC;
