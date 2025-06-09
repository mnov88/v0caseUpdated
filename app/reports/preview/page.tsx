"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Download, Eye, Printer, Share2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ExportDialog } from "@/components/export-dialog"
import { getCasesForLegislation } from "@/lib/database"
import { supabase } from "@/lib/supabase"

interface ReportCase {
  id: string
  case_id_text: string
  title: string
  court: string
  date_of_judgment: string
  parties: string
  operative_parts?: Array<{
    id: string
    part_number: number
    verbatim_text: string
    simplified_text: string
  }>
}

export default function ReportPreviewPage() {
  const searchParams = useSearchParams()
  const [cases, setCases] = useState<ReportCase[]>([])
  const [loading, setLoading] = useState(true)
  const [showSimplified, setShowSimplified] = useState(true)
  const [legislation, setLegislation] = useState<{ title: string; celex_number: string } | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  // Parse filters from URL
  const filters = {
    legislation: searchParams.get("legislation"),
    article: searchParams.get("article"),
    dateFrom: searchParams.get("dateFrom"),
    dateTo: searchParams.get("dateTo"),
    court: searchParams.get("court"),
  }

  useEffect(() => {
    const generateReport = async () => {
      if (!filters.legislation) return

      setLoading(true)
      try {
        // Get legislation info
        const { data: legislationData } = await supabase
          .from("legislations")
          .select("title, celex_number")
          .eq("id", filters.legislation)
          .single()

        if (legislationData) {
          setLegislation(legislationData)
        }

        // Get cases
        const result = await getCasesForLegislation(filters.legislation, {
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
          court: filters.court || undefined,
          article: filters.article !== "all" ? filters.article || undefined : undefined,
          pageSize: 1000, // Get all cases for preview
        })

        // Get operative parts for each case
        const casesWithOperativeParts = await Promise.all(
          result.data.map(async (caseItem: any) => {
            const { data: operativeParts } = await supabase
              .from("operative_parts")
              .select("id, part_number, verbatim_text, simplified_text")
              .eq("case_law_id", caseItem.id)
              .order("part_number")

            return {
              ...caseItem,
              operative_parts: operativeParts || [],
            }
          }),
        )

        setCases(casesWithOperativeParts)
        setTotalCount(result.count)
      } catch (error) {
        console.error("Error generating report:", error)
      } finally {
        setLoading(false)
      }
    }

    generateReport()
  }, [filters.legislation, filters.article, filters.dateFrom, filters.dateTo, filters.court])

  const handlePrint = () => {
    window.print()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `EU Law Report: ${legislation?.title}`,
          text: `Report containing ${totalCount} cases`,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Generating report preview...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Toolbar - hidden when printing */}
      <div className="no-print sticky top-0 bg-white border-b shadow-sm z-10">
        <div className="max-w-4xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                <span className="font-medium">Report Preview</span>
              </div>
              <Badge variant="outline">{totalCount} cases</Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="text-toggle" className="text-sm">
                  Simplified text:
                </Label>
                <Switch id="text-toggle" checked={showSimplified} onCheckedChange={setShowSimplified} />
              </div>

              <Separator orientation="vertical" className="h-6" />

              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>

              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>

              <ExportDialog
                data={{
                  title: `EU Law Report: ${legislation?.title || "Cases"}`,
                  subtitle: `Generated on ${new Date().toLocaleDateString()} • ${totalCount} cases found`,
                  cases,
                  showSimplified,
                  filters: {
                    dateFrom: filters.dateFrom || undefined,
                    dateTo: filters.dateTo || undefined,
                    court: filters.court || undefined,
                  },
                }}
                trigger={
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-4xl mx-auto p-8 print:p-0">
        {/* Header */}
        <div className="mb-8 print:mb-6">
          <div className="flex items-center gap-2 mb-2">
            {legislation?.celex_number && (
              <Badge variant="outline" className="print:border-black">
                {legislation.celex_number}
              </Badge>
            )}
            <Badge variant="secondary" className="print:bg-gray-100">
              {new Date().toLocaleDateString()}
            </Badge>
          </div>

          <h1 className="text-3xl font-bold mb-2 print:text-2xl">EU Law Report: {legislation?.title}</h1>

          <p className="text-muted-foreground print:text-gray-600">
            Comprehensive case analysis • {totalCount} cases found
          </p>

          {/* Applied Filters */}
          {(filters.dateFrom || filters.dateTo || filters.court || filters.article) && (
            <div className="mt-4 p-4 bg-muted rounded-lg print:bg-gray-50 print:border">
              <h3 className="font-medium mb-2">Applied Filters:</h3>
              <div className="flex flex-wrap gap-2 text-sm">
                {filters.dateFrom && (
                  <span>
                    <strong>From:</strong> {new Date(filters.dateFrom).toLocaleDateString()}
                  </span>
                )}
                {filters.dateTo && (
                  <span>
                    <strong>To:</strong> {new Date(filters.dateTo).toLocaleDateString()}
                  </span>
                )}
                {filters.court && (
                  <span>
                    <strong>Court:</strong> {filters.court}
                  </span>
                )}
                {filters.article && filters.article !== "all" && (
                  <span>
                    <strong>Specific Article Selected</strong>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cases */}
        <div className="space-y-6 print:space-y-4">
          {cases.map((caseItem, index) => (
            <Card key={caseItem.id} className="print:break-inside-avoid print:border print:shadow-none">
              <CardHeader className="print:pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="print:border-black">
                        {caseItem.case_id_text}
                      </Badge>
                      <Badge variant="secondary" className="print:bg-gray-100">
                        {caseItem.date_of_judgment}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg print:text-base">{caseItem.title}</CardTitle>
                    <CardDescription className="print:text-gray-600">{caseItem.court}</CardDescription>
                    {caseItem.parties && (
                      <p className="text-sm text-muted-foreground mt-2 print:text-gray-600">
                        <strong>Parties:</strong> {caseItem.parties}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="no-print">
                    #{index + 1}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="print:pt-0">
                {caseItem.operative_parts && caseItem.operative_parts.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm print:text-xs">Operative Parts:</h4>
                    {caseItem.operative_parts.map((part) => (
                      <div key={part.id} className="p-3 bg-muted rounded-md print:bg-gray-50 print:border">
                        <div className="font-medium mb-2 text-sm print:text-xs">Part {part.part_number}</div>
                        <div className="text-sm print:text-xs leading-relaxed">
                          {showSimplified ? part.simplified_text : part.verbatim_text}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground print:text-gray-600">No operative parts available</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground print:text-gray-600 print:mt-8">
          <p>
            Report generated on {new Date().toLocaleString()} • Total cases: {totalCount} • Text format:{" "}
            {showSimplified ? "Simplified" : "Full verbatim"}
          </p>
          <p className="mt-1">EU Law Platform</p>
        </div>
      </div>
    </div>
  )
}
