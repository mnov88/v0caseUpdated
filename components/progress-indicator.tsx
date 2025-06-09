"use client"

import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"

interface ProgressIndicatorProps {
  progress: number
  message: string
  show: boolean
}

export function ProgressIndicator({ progress, message, show }: ProgressIndicatorProps) {
  if (!show) return null

  return (
    <Card className="fixed top-4 right-4 z-50 w-80">
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{message}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </CardContent>
    </Card>
  )
}
