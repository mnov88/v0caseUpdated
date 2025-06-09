"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface OperativePartToggleProps {
  verbatimText: string
  simplifiedText: string
  partNumber?: number
  id?: string
}

export function OperativePartToggle({ verbatimText, simplifiedText, partNumber, id }: OperativePartToggleProps) {
  const [showFull, setShowFull] = useState(false)
  const partId = id || (partNumber ? `part-${partNumber}` : undefined)

  return (
    <Card id={partId}>
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-3">
          {partNumber && <span className="text-sm font-medium text-muted-foreground">Part {partNumber}</span>}
          <div className="flex items-center space-x-2">
            <Label htmlFor={`show-full-${partId}`} className="text-sm">
              {showFull ? "Full Text" : "Simplified"}
            </Label>
            <Switch
              id={`show-full-${partId}`}
              checked={showFull}
              onCheckedChange={setShowFull}
              aria-label="Toggle between simplified and full text"
            />
          </div>
        </div>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="w-full mb-2">
            <TabsTrigger value="text" className="flex-1">
              Text
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex-1">
              Compare
            </TabsTrigger>
          </TabsList>
          <TabsContent value="text" className="mt-0">
            <div className="prose prose-sm max-w-none">
              {showFull ? (
                <div className="text-sm leading-relaxed">{verbatimText}</div>
              ) : (
                <div className="text-sm leading-relaxed font-medium">{simplifiedText}</div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="compare" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-md p-3">
                <div className="text-xs font-medium mb-2 text-muted-foreground">Simplified</div>
                <div className="text-sm">{simplifiedText}</div>
              </div>
              <div className="border rounded-md p-3">
                <div className="text-xs font-medium mb-2 text-muted-foreground">Full Text</div>
                <div className="text-sm">{verbatimText}</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
