import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ToastProvider } from "@/components/ui/toast"
import { TelemetryMonitor } from "@/components/TelemetryMonitor"

export const metadata: Metadata = {
  title: "eduMorph - AI-Powered Adaptive Learning",
  description: "Transform lectures into adaptive, AI-powered learning experiences with real-time analytics",
  generator: "v0.app",
  icons: {
    icon: "/images/sage.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-white antialiased">
        <div className="fixed inset-0 -z-10 starry-night-bg">
          <div className="stars"></div>
          <div className="shooting-star"></div>
          <div className="shooting-star"></div>
          <div className="shooting-star"></div>
        </div>
        <div className="relative z-10 min-h-screen">
          <ToastProvider>
            {children}
            <TelemetryMonitor />
          </ToastProvider>
        </div>
      </body>
    </html>
  )
}
