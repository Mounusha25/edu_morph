"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, ExternalLink, Download, FileJson } from "lucide-react"

interface PowerBIEmbedProps {
  embedUrl?: string
}

export function PowerBIEmbed({ embedUrl }: PowerBIEmbedProps) {
  const hasEmbedUrl = embedUrl && embedUrl.length > 0

  const handleDownloadCSV = async () => {
    try {
      const response = await fetch("/api/export-data")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "edumorph_learning_data.csv"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Failed to download CSV:", error)
      alert("Failed to download data. Please try again.")
    }
  }

  const handleDownloadJSON = async () => {
    try {
      const response = await fetch("/api/export-data", { method: "POST" })
      const data = await response.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "edumorph_powerbi_data.json"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Failed to download JSON:", error)
      alert("Failed to download data. Please try again.")
    }
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-purple-500/30">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            Power BI Dashboard
          </h3>
          <p className="text-sm text-gray-400">Interactive Azure Synapse Analytics dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-500/50">
            Microsoft Power BI
          </Badge>
        </div>
      </div>

      {hasEmbedUrl ? (
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-lg border border-gray-700"
            src={embedUrl}
            frameBorder="0"
            allowFullScreen={true}
          ></iframe>
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800/50 rounded-lg border border-gray-700 border-dashed">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h4 className="text-lg font-semibold text-white mb-2">Power BI Dashboard Not Connected</h4>
          <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
            To enable Power BI integration, create a dashboard in Power BI connected to your Azure Synapse Analytics
            workspace, then add the embed URL to the environment variables.
          </p>

          <div className="space-y-4">
            <div className="text-left max-w-2xl mx-auto bg-gray-900 p-4 rounded-lg border border-gray-700">
              <div className="text-xs text-gray-400 mb-2">Example Setup Steps:</div>
              <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                <li>Open Power BI Desktop</li>
                <li>Connect to Azure Synapse Analytics</li>
                <li>
                  Import views from <code className="text-purple-400">ConceptDifficultyScores</code>
                </li>
                <li>Create visualizations (bar charts, heatmaps, trends)</li>
                <li>Publish to Power BI Service</li>
                <li>
                  Get embed URL and add to <code className="text-purple-400">.env.local</code>
                </li>
              </ol>
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <Button onClick={handleDownloadCSV} className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
              <Button
                onClick={handleDownloadJSON}
                variant="outline"
                className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
              >
                <FileJson className="w-4 h-4 mr-2" />
                Download JSON
              </Button>
              <Button
                onClick={() => window.open("https://app.powerbi.com", "_blank")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Power BI
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <strong>Tip:</strong> Download the data above, then import into Power BI Desktop to create your dashboard.
      </div>
    </Card>
  )
}
