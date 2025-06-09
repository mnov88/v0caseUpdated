"use client"

import { useState, useEffect } from "react"
import { Calendar, Filter, FileText, Building2, Scale } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"

interface ReportFilters {
  legislation?: string
  article?: string
  dateFrom?: Date
  dateTo?: Date
  court?: string
}

interface ReportFiltersSidebarProps {
  filters: ReportFilters
  onFiltersChange: (filters: ReportFilters) => void
  onGeneratePreview: () => void
  loading?: boolean
}

export function ReportFiltersSidebar({
  filters,
  onFiltersChange,
  onGeneratePreview,
  loading,
}: ReportFiltersSidebarProps) {
  const [legislations, setLegislations] = useState<Array<{ id: string; title: string; celex_number: string }>>([])
  const [availableArticles, setAvailableArticles] = useState<
    Array<{ id: string; article_number_text: string; title: string }>
  >([])
  const [courts, setCourts] = useState<string[]>([])

  useEffect(() => {
    // Load legislations
    const loadLegislations = async () => {
      const { data } = await supabase.from("legislations").select("id, title, celex_number").order("title").limit(100)

      if (data) {
        setLegislations(data)
      }
    }

    // Load available courts
    const loadCourts = async () => {
      const { data } = await supabase.from("case_laws").select("court").not("court", "is", null).neq("court", "")

      if (data) {
        const uniqueCourts = [...new Set(data.map((item) => item.court).filter(Boolean))].sort()
        setCourts(uniqueCourts)
      }
    }

    loadLegislations()
    loadCourts()
  }, [])

  useEffect(() => {
    if (filters.legislation) {
      // Load articles for the selected legislation
      const loadArticles = async () => {
        const { data } = await supabase
          .from("articles")
          .select("id, article_number_text, title")
          .eq("legislation_id", filters.legislation)
          .order("article_number_text")

        if (data) {
          setAvailableArticles(data)
        }
      }

      loadArticles()
    } else {
      setAvailableArticles([])
    }
  }, [filters.legislation])

  const updateFilter = <K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) => {
    const newFilters = { ...filters, [key]: value }

    // Reset article when legislation changes
    if (key === "legislation") {
      newFilters.article = undefined
    }

    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const selectedLegislation = legislations.find((l) => l.id === filters.legislation)

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Filter className="h-4 w-4" />
          Filters
        </CardTitle>
        <CardDescription>Configure report parameters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-3">
        {/* Legislation Selection */}
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1">
            <Scale className="h-3 w-3" />
            Legislation *
          </Label>
          <Select value={filters.legislation || "none"} onValueChange={(value) => updateFilter("legislation", value)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select legislation..." />
            </SelectTrigger>
            <SelectContent>
              {legislations.map((legislation) => (
                <SelectItem key={legislation.id} value={legislation.id}>
                  <div className="flex flex-col">
                    <span className="font-medium text-xs">{legislation.title}</span>
                    <span className="text-xs text-muted-foreground">{legislation.celex_number}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedLegislation && (
            <Badge variant="outline" className="text-xs mt-1">
              {selectedLegislation.celex_number}
            </Badge>
          )}
        </div>

        {/* Article Selection */}
        {availableArticles.length > 0 && (
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Article
            </Label>
            <Select
              value={filters.article || "all"}
              onValueChange={(value) => updateFilter("article", value === "all" ? undefined : value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All articles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Articles</SelectItem>
                {availableArticles.map((article) => (
                  <SelectItem key={article.id} value={article.id}>
                    <div className="flex flex-col">
                      <span className="font-medium text-xs">Article {article.article_number_text}</span>
                      <span className="text-xs text-muted-foreground">{article.title}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Separator className="my-2" />

        {/* Date Range */}
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Date Range
          </Label>
          <div className="grid grid-cols-1 gap-2">
            <div>
              <Label htmlFor="date-from" className="text-xs text-muted-foreground">
                From
              </Label>
              <DatePicker
                date={filters.dateFrom}
                setDate={(date) => updateFilter("dateFrom", date)}
                className="w-full h-8 text-xs"
              />
            </div>
            <div>
              <Label htmlFor="date-to" className="text-xs text-muted-foreground">
                To
              </Label>
              <DatePicker
                date={filters.dateTo}
                setDate={(date) => updateFilter("dateTo", date)}
                className="w-full h-8 text-xs"
              />
            </div>
          </div>
        </div>

        <Separator className="my-2" />

        {/* Court Filter */}
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            Court
          </Label>
          <Select
            value={filters.court || "all-courts"}
            onValueChange={(value) => updateFilter("court", value === "all-courts" ? undefined : value)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All courts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-courts">All Courts</SelectItem>
              {courts.map((court) => (
                <SelectItem key={court} value={court}>
                  {court}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator className="my-2" />

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button onClick={() => onFiltersChange({})} variant="outline" size="sm" className="w-full h-8 text-xs">
            Clear Filters
          </Button>
          <Button onClick={onGeneratePreview} disabled={!filters.legislation || loading} className="w-full h-8 text-xs">
            View Full Report
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ReportFiltersSidebar
