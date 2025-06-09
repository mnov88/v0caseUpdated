"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { ReportFiltersSidebar } from "@/components/report-filters-sidebar"
import { supabase } from "@/lib/supabase"
import { getCasesForLegislation } from "@/lib/database"
import { LoadingSpinner } from "@/components/loading-spinner"

interface ReportFilters {
  legislation?: string
  article?: string
  dateFrom?: Date
  dateTo?: Date
  court?: string
}

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

export default function ReportsPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<ReportFilters>({})
  const [loading, setLoading] = useState(false)
  const [cases, setCases] = useState<ReportCase[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [showSimplified, setShowSimplified] = useState(true)
  const [showOperativeParts, setShowOperativeParts] = useState(true)
  const [selectedLegislation, setSelectedLegislation] = useState<{ title: string; celex_number: string } | null>(null)

  useEffect(() => {
    if (filters.legislation) {
      generateReport()
    }
  }, [filters])

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
        setSelectedLegislation(legislationData)
      }

      // Get cases
      const result = await getCasesForLegislation(filters.legislation, {
        dateFrom: filters.dateFrom?.toISOString().split("T")[0],
        dateTo: filters.dateTo?.toISOString().split("T")[0],
        court: filters.court || undefined,
        article: filters.article !== "all" ? filters.article || undefined : undefined,
        pageSize: 100, // Get a reasonable number of cases
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

  const handleGeneratePreview = () => {
    if (!filters.legislation) return

    // Build URL parameters
    const params = new URLSearchParams()
    params.set("legislation", filters.legislation)

    if (filters.article) params.set("article", filters.article)
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom.toISOString().split("T")[0])
    if (filters.dateTo) params.set("dateTo", filters.dateTo.toISOString().split("T")[0])
    if (filters.court) params.set("court", filters.court)

    // Open preview in new tab
    const previewUrl = `/reports/preview?${params.toString()}`
    window.open(previewUrl, "_blank")
  }

  const breadcrumbItems = [{ label: "Reports" }]

  return (
    <div className="max-w-7xl mx-auto">
      <BreadcrumbNav items={breadcrumbItems} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Reports</h1>
            <p className="text-muted-foreground">
              Generate comprehensive reports for EU legislation analysis and case law research
            </p>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : cases.length > 0 ? (
            <div className="space-y-6">
              <Card className="border rounded-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Showing {totalCount} results</span>
                      {selectedLegislation && (
                        <Badge variant="outline" className="ml-2">
                          {selectedLegislation.title}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Operative Parts:</span>
                      <Button
                        variant={!showOperativeParts ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setShowOperativeParts(false)}
                        className="h-8"
                      >
                        Hide
                      </Button>
                      <Button
                        variant={showOperativeParts && showSimplified ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => {
                          setShowOperativeParts(true)
                          setShowSimplified(true)
                        }}
                        className="h-8"
                      >
                        Simplified
                      </Button>
                      <Button
                        variant={showOperativeParts && !showSimplified ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => {
                          setShowOperativeParts(true)
                          setShowSimplified(false)
                        }}
                        className="h-8"
                      >
                        Verbatim
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleGeneratePreview} className="ml-4 h-8">
                        View as Page
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                {cases.map((caseItem) => (
                  <Card key={caseItem.id} className="border rounded-md">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-xl font-bold">{caseItem.case_id_text}</h2>
                          <p className="text-lg">{caseItem.title}</p>
                          {caseItem.parties && <p className="text-muted-foreground mt-1">{caseItem.parties}</p>}
                        </div>
                        <Badge variant="outline">{new Date(caseItem.date_of_judgment).toLocaleDateString()}</Badge>
                      </div>

                      {showOperativeParts && caseItem.operative_parts && caseItem.operative_parts.length > 0 && (
                        <div className="mt-4">
                          <h3 className="font-bold mb-2">Verbatim Operative Parts</h3>
                          <div className="space-y-3">
                            {caseItem.operative_parts.map((part) => (
                              <div key={part.id} className="text-sm">
                                <p>
                                  <span className="font-medium">{part.part_number}. </span>
                                  {showSimplified ? part.simplified_text : part.verbatim_text}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : filters.legislation ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No cases found matching your criteria.</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Select a legislation to generate a report.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <ReportFiltersSidebar
            filters={filters}
            onFiltersChange={setFilters}
            onGeneratePreview={handleGeneratePreview}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}
