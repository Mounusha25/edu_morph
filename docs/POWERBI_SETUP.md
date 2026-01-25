# Power BI Dashboard Setup Guide

## 📊 How to Create Your SlideSage Power BI Dashboard

### **Step 1: Download the Data**

1. Go to Analytics Dashboard: `http://localhost:3000/analytics`
2. Scroll to **"Power BI Dashboard"** section
3. Click **"Download CSV"** button
   - This downloads: `slidesage_learning_data.csv` (500+ learning events)
4. **Optional**: Click **"Download JSON"** for pre-aggregated metrics

---

### **Step 2: Install Power BI Desktop**

1. Download from: https://powerbi.microsoft.com/desktop/
2. Install (free for Windows, use Power BI Service for Mac)
3. Open Power BI Desktop

---

### **Step 3: Import Data into Power BI**

#### **Option A: Import CSV (Recommended)**

1. Click **"Get Data"** → **"Text/CSV"**
2. Select `slidesage_learning_data.csv`
3. Click **"Transform Data"** to open Power Query Editor
4. **Data type corrections**:
   - `Timestamp` → Date/Time
   - `QuizScore` → Whole Number
   - `VideoCompletionRate` → Whole Number
   - `LearningStreak` → Whole Number
   - `Date` → Date
   - `Hour` → Whole Number
5. Click **"Close & Apply"**

#### **Option B: Import JSON (Advanced)**

1. Click **"Get Data"** → **"JSON"**
2. Select `slidesage_powerbi_data.json`
3. Expand each table:
   - `ConceptDifficulty`
   - `FormatEffectiveness`
   - `EngagementTrends`
   - `PredictiveInsights`
4. Click **"Close & Apply"**

---

### **Step 4: Create Visualizations**

#### **Dashboard 1: Concept Difficulty Heatmap**

1. Click **"Visualizations"** → **"Clustered Bar Chart"**
2. **Axis**: Concept
3. **Values**: DifficultyScore
4. **Conditional Formatting**:
   - Click on DifficultyScore → Conditional formatting → Background color
   - Set gradient: 0 = Green, 50 = Yellow, 100 = Red
5. **Title**: "Concept Difficulty Analysis"

#### **Dashboard 2: Format Effectiveness Comparison**

1. **Visualization**: Clustered Column Chart
2. **Axis**: Format (TeachingFormat)
3. **Values**: AvgQuizScore, AvgCompletion
4. **Legend**: Show
5. **Title**: "Teaching Format Effectiveness"

#### **Dashboard 3: Engagement Trends Over Time**

1. **Visualization**: Line Chart
2. **Axis**: Timestamp (Date)
3. **Values**: AvgQuizScore, AvgVideoCompletion
4. **Legend**: Show
5. **Title**: "Learning Performance Trends"

#### **Dashboard 4: Quiz Score Distribution**

1. **Visualization**: Histogram
2. **Field**: QuizScore
3. **Bin Count**: 10
4. **Title**: "Quiz Score Distribution"

#### **Dashboard 5: Video Completion Funnel**

1. **Visualization**: Funnel Chart
2. **Values**: VideoCompletionRate
3. **Group**: Ranges (0-25%, 25-50%, 50-75%, 75-100%)
4. **Title**: "Video Engagement Funnel"

#### **Dashboard 6: KPI Cards**

Create 4 **Card** visualizations:

1. **Card 1**: Count of Timestamp (Total Events)
2. **Card 2**: Average of QuizScore
3. **Card 3**: Average of VideoCompletionRate
4. **Card 4**: Count of Concept (Unique Concepts)

---

### **Step 5: Create DAX Measures (Advanced)**

Add calculated measures for richer insights:

```dax
// Average Quiz Score
AvgQuizScore = AVERAGE('learning_data'[QuizScore])

// Video Completion Rate
AvgVideoCompletion = AVERAGE('learning_data'[VideoCompletionRate])

// Difficulty Score Calculation
DifficultyScore = 
    (100 - AVERAGE('learning_data'[QuizScore])) * 0.4 + 
    (COUNTROWS(FILTER('learning_data', 'learning_data'[Feedback] = "negative")) / COUNTROWS('learning_data') * 100) * 0.3

// High Risk Concepts (Difficulty > 70)
HighRiskConcepts = 
    CALCULATE(
        DISTINCTCOUNT('learning_data'[Concept]),
        'learning_data'[DifficultyScore] > 70
    )

// Format Effectiveness Score
FormatEffectiveness = 
    AVERAGE('learning_data'[QuizScore]) * 0.5 + 
    AVERAGE('learning_data'[VideoCompletionRate]) * 0.3 + 
    (COUNTROWS(FILTER('learning_data', 'learning_data'[Feedback] = "positive")) / COUNTROWS('learning_data') * 100) * 0.2
```

---

### **Step 6: Apply Themes & Formatting**

1. **Color Scheme**:
   - Primary: Purple (#6366f1)
   - Secondary: Blue (#3b82f6)
   - Success: Green (#10b981)
   - Warning: Yellow (#f59e0b)
   - Danger: Red (#ef4444)

2. **Background**: Dark gray (#1f2937)

3. **Font**: Segoe UI or similar modern sans-serif

4. **Logo**: Add SlideSage logo to report header

---

### **Step 7: Publish to Power BI Service**

1. Click **"Publish"** in Power BI Desktop
2. Sign in with Microsoft account
3. Select workspace (e.g., "My Workspace")
4. Click **"Open [report] in Power BI"**

---

### **Step 8: Get Embed URL**

1. In Power BI Service, open your report
2. Click **"File"** → **"Embed report"** → **"Website or portal"**
3. Copy the **Embed URL** (looks like: `https://app.powerbi.com/reportEmbed?reportId=...`)
4. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_POWERBI_EMBED_URL=https://app.powerbi.com/reportEmbed?reportId=YOUR_REPORT_ID
   ```
5. Restart your Next.js dev server
6. The embed will now appear in the Analytics Dashboard!

---

## 📋 **Sample Dashboard Layout**

```
┌─────────────────────────────────────────────────────────────┐
│  SlideSage Learning Analytics - Powered by Azure            │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│ Total Events│  Avg Quiz   │  Avg Video  │  High Risk       │
│    525      │    67%      │    72%      │  Concepts: 2     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Concept Difficulty Heatmap (Bar Chart - Horizontal)        │
│  ████████████████████████ Eigenvectors        (78)          │
│  ██████████████████ Quantum Computing         (65)          │
│  █████████████ Neural Networks                (52)          │
│                                                               │
├──────────────────────────────┬──────────────────────────────┤
│                              │                               │
│  Format Effectiveness        │   Engagement Trends           │
│  (Clustered Column)          │   (Line Chart)                │
│                              │                               │
│  Video: 85%                  │   [Line graph trending up]    │
│  Diagram: 72%                │                               │
│  Quiz: 68%                   │                               │
│                              │                               │
├──────────────────────────────┴──────────────────────────────┤
│                                                               │
│  AI Predictive Insights (Table)                             │
│  ┌──────────────┬─────────┬────────────────────────────┐   │
│  │ Concept      │ Risk    │ Recommendation             │   │
│  ├──────────────┼─────────┼────────────────────────────┤   │
│  │ Eigenvectors │ High ⚠️  │ Simplify, add examples    │   │
│  │ Calculus     │ Moderate│ Add visual aids            │   │
│  └──────────────┴─────────┴────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 **Demo Tips for Judges**

1. **Show Data Refresh**: Click refresh button to demonstrate real-time connection
2. **Drill Down**: Click on a concept bar to filter other visuals
3. **Hover for Details**: Show tooltips with detailed metrics
4. **Cross-Filtering**: Click Video format → shows only Video-related trends
5. **Export to PDF**: Show you can export reports for sharing

---

## 🔗 **Connecting to Real Azure Synapse**

Once you have real data in Azure:

1. In Power BI Desktop: **Get Data** → **Azure** → **Azure Synapse Analytics**
2. Enter your workspace SQL endpoint (from Azure Portal)
3. Use **DirectQuery** for real-time data (not Import)
4. Select the views:
   - `ConceptDifficultyScores`
   - `TeachingFormatEffectiveness`
   - `RealTimeLearningMetrics`
5. Create the same visualizations
6. Schedule refresh every 15 minutes in Power BI Service

---

## ✅ **What Judges Will See**

- **Real Microsoft Power BI dashboard** (not mockup)
- **500+ data points** (shows scale)
- **Professional visualizations** (bar charts, trends, KPIs)
- **Azure branding** (Microsoft ecosystem integration)
- **Interactive filtering** (dynamic insights)

This makes your Azure integration **tangible and impressive**! 🏆
