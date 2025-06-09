"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { searchAll } from "@/lib/database"
import { SearchBar } from "@/components/search-bar"
import { SearchResults } from "@/components/search-results"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { PaginatedResults, SearchResult } from "@/lib/database"

function SearchSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get("q") || ""
  const page = Number.parseInt(searchParams.get("page") || "1")

  const [results, setResults] = useState<PaginatedResults<SearchResult>>({
    data: [],
    count: 0,
    hasMore: false,
    page: 1,
    pageSize: 20,
  })
  const [loading, setLoading] = useState(false)

  const performSearch = useCallback(async (searchQuery: string, searchPage: number) => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const searchResults = await searchAll(searchQuery, { page: searchPage, pageSize: 20 })
      setResults(searchResults)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (query) {
      performSearch(query, page)
    }
  }, [query, page, performSearch])

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    router.push(`/search?${params.toString()}`)
  }

  const breadcrumbItems = [
    { label: "Search", href: "/search" },
    ...(query ? [{ label: `Results for "${query}"` }] : []),
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <BreadcrumbNav items={breadcrumbItems} />

      <div>
        <h1 className="text-3xl font-bold mb-4">Search Results</h1>
        <SearchBar defaultValue={query} />
      </div>

      {loading && <SearchSkeleton />}

      {!loading && query && (
        <SearchResults results={results} query={query} onPageChange={handlePageChange} loading={loading} />
      )}

      {!query && !loading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Enter a search term to find EU laws, cases, and articles.</p>
        </div>
      )}
    </div>
  )
}
