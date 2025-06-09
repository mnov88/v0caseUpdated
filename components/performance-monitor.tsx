"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, Clock, Database, Zap } from "lucide-react"

interface PerformanceMetrics {
  searchTime: number
  renderTime: number
  dbQueries: number
  cacheHits: number
  totalRequests: number
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    searchTime: 0,
    renderTime: 0,
    dbQueries: 0,
    cacheHits: 0,
    totalRequests: 0,
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show performance monitor in development or when explicitly enabled
    const showMonitor =
      process.env.NODE_ENV === "development" || localStorage.getItem("show-performance-monitor") === "true"
    setIsVisible(showMonitor)

    if (!showMonitor) return

    // Monitor performance metrics
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()

      entries.forEach((entry) => {
        if (entry.entryType === "measure") {
          setMetrics((prev) => ({
            ...prev,
            searchTime: entry.name.includes("search") ? entry.duration : prev.searchTime,
            renderTime: entry.name.includes("render") ? entry.duration : prev.renderTime,
          }))
        }
      })
    })

    observer.observe({ entryTypes: ["measure", "navigation"] })

    return () => observer.disconnect()
  }, [])

  if (!isVisible) return null

  const getPerformanceColor = (value: number, thresholds: [number, number]) => {
    if (value < thresholds[0]) return "text-green-600"
    if (value < thresholds[1]) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-background/95 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Performance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>Search:</span>
            <Badge variant="outline" className={getPerformanceColor(metrics.searchTime, [500, 2000])}>
              {metrics.searchTime.toFixed(0)}ms
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3" />
            <span>Render:</span>
            <Badge variant="outline" className={getPerformanceColor(metrics.renderTime, [100, 500])}>
              {metrics.renderTime.toFixed(0)}ms
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-3 w-3" />
            <span>DB Queries:</span>
            <Badge variant="outline">{metrics.dbQueries}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span>Cache Hit:</span>
            <Badge variant="outline" className="text-green-600">
              {metrics.totalRequests > 0 ? Math.round((metrics.cacheHits / metrics.totalRequests) * 100) : 0}%
            </Badge>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Search Performance</span>
            <span>{metrics.searchTime < 2000 ? "Good" : "Needs Optimization"}</span>
          </div>
          <Progress value={Math.min((metrics.searchTime / 2000) * 100, 100)} className="h-1" />
        </div>
      </CardContent>
    </Card>
  )
}
