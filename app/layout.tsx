import type React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ErrorBoundary } from "@/components/error-boundary"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { AccessibilityFeatures } from "@/components/accessibility-features"
import { PerformanceMonitor } from "@/components/performance-monitor"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="EU Law Platform - Search, browse, and analyze EU legislation, articles, and case law"
        />
        <title>EU Law Platform</title>
      </head>
      <body>
        <ErrorBoundary>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <main className="flex-1 p-6">{children}</main>
            </SidebarInset>
          </SidebarProvider>
          <KeyboardShortcuts />
          <AccessibilityFeatures />
          <PerformanceMonitor />
        </ErrorBoundary>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
