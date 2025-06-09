"use client"

import type React from "react"

import { useState } from "react"
import { FileText, BarChart3, Calendar, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export interface ReportTemplate {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  fields: string[]
  defaultFilters?: Record<string, any>
  category: "standard" | "analytical" | "compliance"
}

interface ReportTemplatesProps {
  onSelectTemplate: (template: ReportTemplate) => void
}

const templates: ReportTemplate[] = [
  {
    id: "standard-case-report",
    name: "Standard Case Report",
    description: "Basic case listing with operative parts",
    icon: FileText,
    fields: ["case_id", "title", "court", "date", "operative_parts"],
    category: "standard",
  },
  {
    id: "court-analysis",
    name: "Court Analysis",
    description: "Cases grouped by court with statistics",
    icon: BarChart3,
    fields: ["case_id", "title", "court", "date", "parties", "operative_parts"],
    defaultFilters: { groupBy: "court" },
    category: "analytical",
  },
  {
    id: "temporal-analysis",
    name: "Temporal Analysis",
    description: "Cases over time with trend analysis",
    icon: Calendar,
    fields: ["case_id", "title", "court", "date", "operative_parts"],
    defaultFilters: { groupBy: "year" },
    category: "analytical",
  },
  {
    id: "compliance-report",
    name: "Compliance Report",
    description: "Detailed report for compliance purposes",
    icon: Users,
    fields: ["case_id", "title", "court", "date", "parties", "operative_parts", "full_text"],
    category: "compliance",
  },
]

export function ReportTemplates({ onSelectTemplate }: ReportTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const filteredTemplates = templates.filter(
    (template) => selectedCategory === "all" || template.category === selectedCategory,
  )

  const categories = [
    { id: "all", name: "All Templates" },
    { id: "standard", name: "Standard" },
    { id: "analytical", name: "Analytical" },
    { id: "compliance", name: "Compliance" },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Report Templates</h3>
        <p className="text-sm text-muted-foreground">Choose a pre-configured report template to get started quickly.</p>
      </div>

      <div className="flex gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <template.icon className="h-5 w-5" />
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">{template.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium mb-1">Included Fields:</div>
                  <div className="flex flex-wrap gap-1">
                    {template.fields.map((field) => (
                      <Badge key={field} variant="outline" className="text-xs">
                        {field.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button className="w-full" onClick={() => onSelectTemplate(template)}>
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ReportTemplates
