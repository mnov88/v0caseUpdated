"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getCaseLaws } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/pagination"
import { LoadingSpinner } from "@/components/loading-spinner"
import type { PaginatedResults, CaseLaw } from "@/lib/database"

function CaseLawsList() {
  const [results, setResults] = useState<PaginatedResults<CaseLaw>>({
    data: [],
    count: 0,
    hasMore: false,
    page: 1,
    pageSize: 20,
  })
  const [loading, setLoading] = useState(true)

  const loadCaseLaws = async (page: number) => {
    setLoading(true)
    try {
      const data = await getCaseLaws(page, 20)
      setResults(data)
    } catch (error) {
      console.error("Error loading case laws:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCaseLaws(1)
  }, [])

  const handlePageChange = (page: number) => {
    loadCaseLaws(page)
  }

  if (loading && results.data.length === 0) {
    return <CaseLawsSkeleton />
  }

  if (!loading && results.data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No case laws found.</p>
      </div>
    )
  }

  const totalPages = Math.ceil(results.count / results.pageSize)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(results.page - 1) * results.pageSize + 1} to{" "}
          {Math.min(results.page * results.pageSize, results.count)} of {results.count} case laws
        </p>
        {loading && <LoadingSpinner size="sm" />}
      </div>

      <div className="grid gap-4">
        {results.data.map((caseLaw) => (
          <Card key={caseLaw.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{caseLaw.case_id_text}</Badge>
                    {caseLaw.celex_number && <Badge variant="secondary">{caseLaw.celex_number}</Badge>}
                  </div>
                  <CardTitle className="text-lg">
                    <Link href={`/case-laws/${caseLaw.id}`} className="hover:text-primary transition-colors">
                      {caseLaw.title}
                    </Link>
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{caseLaw.court}</span>
                    <span>{caseLaw.date_of_judgment}</span>
                  </div>
                  {caseLaw.parties && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <strong>Parties:</strong> {caseLaw.parties}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">{caseLaw.summary_text?.substring(0, 300)}...</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {results.count > results.pageSize && (
        <Pagination
          currentPage={results.page}
          totalPages={totalPages}
          hasMore={results.hasMore}
          onPageChange={handlePageChange}
          loading={loading}
        />
      )}
    </div>
  )
}

// Keep the existing CaseLawsSkeleton component
function CaseLawsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex gap-2 mb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <div className="flex gap-4 mt-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function CaseLawsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">EU Case Laws</h1>
        <p className="text-muted-foreground">Browse court decisions with operative parts and case summaries</p>
      </div>

      <CaseLawsList />
    </div>
  )
}
