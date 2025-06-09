"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getLegislations } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/pagination"
import { LoadingSpinner } from "@/components/loading-spinner"
import type { PaginatedResults, Legislation } from "@/lib/database"

function LegislationsList() {
  const [results, setResults] = useState<PaginatedResults<Legislation>>({
    data: [],
    count: 0,
    hasMore: false,
    page: 1,
    pageSize: 20,
  })
  const [loading, setLoading] = useState(true)

  const loadLegislations = async (page: number) => {
    setLoading(true)
    try {
      const data = await getLegislations(page, 20)
      setResults(data)
    } catch (error) {
      console.error("Error loading legislations:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLegislations(1)
  }, [])

  const handlePageChange = (page: number) => {
    loadLegislations(page)
  }

  if (loading && results.data.length === 0) {
    return <LegislationsSkeleton />
  }

  if (!loading && results.data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No legislations found.</p>
      </div>
    )
  }

  const totalPages = Math.ceil(results.count / results.pageSize)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(results.page - 1) * results.pageSize + 1} to{" "}
          {Math.min(results.page * results.pageSize, results.count)} of {results.count} legislations
        </p>
        {loading && <LoadingSpinner size="sm" />}
      </div>

      <div className="grid gap-4">
        {results.data.map((legislation) => (
          <Card key={legislation.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{legislation.celex_number}</Badge>
                  </div>
                  <CardTitle className="text-lg">
                    <Link href={`/legislations/${legislation.id}`} className="hover:text-primary transition-colors">
                      {legislation.title}
                    </Link>
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                {legislation.full_markdown_content?.substring(0, 200)}...
              </CardDescription>
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

// Keep the existing LegislationsSkeleton component
function LegislationsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-3/4" />
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

export default function LegislationsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">EU Legislations</h1>
        <p className="text-muted-foreground">Browse EU regulations and directives with full text and metadata</p>
      </div>

      <LegislationsList />
    </div>
  )
}
