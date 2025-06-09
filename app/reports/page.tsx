"use client"

import Link from "next/link"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { getCasesForLegislation } from "@/lib/database"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { ProgressIndicator } from "@/components/progress-indicator"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExportDialog } from "@/components/export-dialog"
import { FilterPresets } from "@/components/filter-presets"
import { ReportTemplates } from "@/components/report-templates"

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
  const searchParams = useSearchParams()
  const router = useRouter()
  const [legislations, setLegislations] = useState<Array<{ id: string; title: string }>>([])
  const [selectedLegislation, setSelectedLegislation] = useState(
    searchParams.get("legislation") || "defaultLegislation",
  )
  const [cases, setCases] = useState<ReportCase[]>([])
  const [loading, setLoading] = useState(false)
  const [showSimplified, setShowSimplified] = useState(true)
  const [exportProgress, setExportProgress] = useState(0)
  const [showExportProgress, setShowExportProgress] = useState(false)
  const [exportType, setExportType] = useState<"csv" | "html" | "pdf">("csv")
  const [exportMessage, setExportMessage] = useState("")

  // Filters
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)
  const [courtFilter, setCourtFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const pageSize = 50
  const [articleFilter, setArticleFilter] = useState("all")
  const [availableArticles, setAvailableArticles] = useState<
    Array<{ id: string; article_number_text: string; title: string }>
  >([])

  useEffect(() => {
    // Load legislations for dropdown
    const loadLegislations = async () => {
      const { data } = await supabase.from("legislations").select("id, title").order("title").limit(100)

      if (data) {
        setLegislations(data)
      }
    }

    loadLegislations()
  }, [])

  useEffect(() => {
    if (selectedLegislation) {
      // Load articles for the selected legislation
      const loadArticles = async () => {
        const { data } = await supabase
          .from("articles")
          .select("id, article_number_text, title")
          .eq("legislation_id", selectedLegislation)
          .order("article_number_text")

        if (data) {
          setAvailableArticles(data)
        }
      }

      loadArticles()
      generateReport()
    }
  }, [selectedLegislation, currentPage, dateFrom, dateTo, courtFilter, articleFilter])

  const generateReport = async () => {
    if (!selectedLegislation) return

    setLoading(true)
    try {
      const filters = {
        dateFrom: dateFrom?.toISOString().split("T")[0],
        dateTo: dateTo?.toISOString().split("T")[0],
        court: courtFilter,
        article: articleFilter !== "all" ? articleFilter : undefined,
        page: currentPage,
        pageSize,
      }

      const result = await getCasesForLegislation(selectedLegislation, filters)

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
      setHasMore(result.hasMore)
    } catch (error) {
      console.error("Error generating report:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLegislationChange = (value: string) => {
    setSelectedLegislation(value)
    setCurrentPage(1)

    // Update URL
    const params = new URLSearchParams(searchParams.toString())
    params.set("legislation", value)
    router.push(`/reports?${params.toString()}`)
  }

  const breadcrumbItems = [{ label: "Reports" }]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <BreadcrumbNav items={breadcrumbItems} />

      <ProgressIndicator progress={exportProgress} message={exportMessage} show={showExportProgress} />

      <div>
        <h1 className="text-3xl font-bold mb-2">Reports</h1>
        <p className="text-muted-foreground">Generate comprehensive reports for any regulation or article</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Case Report</CardTitle>
          <CardDescription>Select a legislation to generate a table of all related cases</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="legislation">Select Legislation</Label>
              <Select value={selectedLegislation} onValueChange={handleLegislationChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a legislation..." />
                </SelectTrigger>
                <SelectContent>
                  {legislations.map((legislation) => (
                    <SelectItem key={legislation.id} value={legislation.id}>
                      {legislation.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={generateReport} disabled={!selectedLegislation || loading}>
                {loading ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </div>

          {selectedLegislation && (
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="date-from" className="mb-2 block">
                      Date From
                    </Label>
                    <DatePicker date={dateFrom} setDate={setDateFrom} className="w-full" />
                  </div>
                  <div>
                    <Label htmlFor="date-to" className="mb-2 block">
                      Date To
                    </Label>
                    <DatePicker date={dateTo} setDate={setDateTo} className="w-full" />
                  </div>
                  <div>
                    <Label htmlFor="court" className="mb-2 block">
                      Court
                    </Label>
                    <Input
                      id="court"
                      placeholder="Filter by court..."
                      value={courtFilter}
                      onChange={(e) => setCourtFilter(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="article" className="mb-2 block">
                      Article
                    </Label>
                    <Select value={articleFilter} onValueChange={setArticleFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by article..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Articles</SelectItem>
                        {availableArticles.map((article) => (
                          <SelectItem key={article.id} value={article.id}>
                            Article {article.article_number_text}: {article.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {cases.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Case Report Results</CardTitle>
                <CardDescription>Found {totalCount} cases related to the selected legislation</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="text-toggle" className="text-sm">
                  Show:
                </Label>
                <Select
                  value={showSimplified ? "simplified" : "full"}
                  onValueChange={(value) => setShowSimplified(value === "simplified")}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simplified">Simplified</SelectItem>
                    <SelectItem value="full">Full Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="table">
              <TabsList className="mb-4">
                <TabsTrigger value="builder">Report Builder</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="table">Table View</TabsTrigger>
                <TabsTrigger value="cards">Card View</TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="mt-0">
                <ReportTemplates
                  onSelectTemplate={(template) => {
                    // Apply template settings
                    console.log("Selected template:", template)
                    // You can implement template application logic here
                  }}
                />
              </TabsContent>

              <TabsContent value="builder" className="mt-0">
                {/* Move the existing filter and generation UI here */}
              </TabsContent>

              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of{" "}
                  {totalCount} results
                </div>
                <div className="flex gap-2">
                  <FilterPresets
                    currentFilters={{
                      dateFrom: dateFrom?.toISOString().split("T")[0],
                      dateTo: dateTo?.toISOString().split("T")[0],
                      court: courtFilter,
                      legislation: selectedLegislation,
                    }}
                    onApplyPreset={(filters) => {
                      if (filters.dateFrom) setDateFrom(new Date(filters.dateFrom))
                      if (filters.dateTo) setDateTo(new Date(filters.dateTo))
                      if (filters.court) setCourtFilter(filters.court)
                      if (filters.legislation) setSelectedLegislation(filters.legislation)
                    }}
                  />
                  <ExportDialog
                    data={{
                      title: `EU Law Report: ${legislations.find((l) => l.id === selectedLegislation)?.title || "Cases"}`,
                      subtitle: `Generated on ${new Date().toLocaleDateString()} • ${totalCount} cases found`,
                      cases,
                      showSimplified,
                      filters: {
                        dateFrom: dateFrom?.toISOString().split("T")[0],
                        dateTo: dateTo?.toISOString().split("T")[0],
                        court: courtFilter,
                      },
                    }}
                  />
                </div>
              </div>

              <TabsContent value="table" className="mt-0">
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Case ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Court</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Operative Parts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cases.map((caseItem) => (
                        <TableRow key={caseItem.id}>
                          <TableCell>
                            <Badge variant="outline">{caseItem.case_id_text}</Badge>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="font-medium">
                              <Link href={`/case-laws/${caseItem.id}`} className="hover:text-primary">
                                {caseItem.title}
                              </Link>
                            </div>
                            {caseItem.parties && (
                              <div className="text-sm text-muted-foreground mt-1">{caseItem.parties}</div>
                            )}
                          </TableCell>
                          <TableCell>{caseItem.court}</TableCell>
                          <TableCell>{caseItem.date_of_judgment}</TableCell>
                          <TableCell className="max-w-md">
                            {caseItem.operative_parts && caseItem.operative_parts.length > 0 ? (
                              <div className="space-y-2">
                                {caseItem.operative_parts.map((part) => (
                                  <div key={part.id} className="text-sm p-2 bg-muted rounded">
                                    <div className="font-medium mb-1">Part {part.part_number}</div>
                                    <div className="text-xs">
                                      {showSimplified ? part.simplified_text : part.verbatim_text}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No operative parts</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="cards" className="mt-0">
                <div className="grid gap-4">
                  {cases.map((caseItem) => (
                    <Card key={caseItem.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{caseItem.case_id_text}</Badge>
                          <Badge variant="secondary">{caseItem.date_of_judgment}</Badge>
                        </div>
                        <CardTitle className="text-lg">
                          <Link href={`/case-laws/${caseItem.id}`} className="hover:text-primary">
                            {caseItem.title}
                          </Link>
                        </CardTitle>
                        <CardDescription>
                          {caseItem.court} • {caseItem.parties}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {caseItem.operative_parts && caseItem.operative_parts.length > 0 ? (
                          <div className="space-y-3">
                            {caseItem.operative_parts.map((part) => (
                              <div key={part.id} className="p-3 bg-muted rounded-md">
                                <div className="font-medium mb-1 text-sm">Part {part.part_number}</div>
                                <div className="text-sm">
                                  {showSimplified ? part.simplified_text : part.verbatim_text}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No operative parts</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {totalCount > pageSize && (
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {Math.ceil(totalCount / pageSize)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={!hasMore || loading}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
