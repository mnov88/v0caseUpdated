"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ContentTypeBadge } from "./content-type-badge"
import { Pagination } from "./pagination"
import type { SearchResult, PaginatedResults } from "@/lib/database"

interface SearchResultsProps {
  results: PaginatedResults<SearchResult>
  query: string
  onPageChange: (page: number) => void
  loading?: boolean
}

export function SearchResults({ results, query, onPageChange, loading }: SearchResultsProps) {
  const getDetailUrl = (result: SearchResult) => {
    switch (result.type) {
      case "legislation":
        return `/legislations/${result.id}`
      case "article":
        return `/articles/${result.id}`
      case "case_law":
        return `/case-laws/${result.id}`
      case "operative_part":
        return `/operative-parts/${result.id}`
    }
  }

  if (results.data.length === 0 && !loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No results found for "{query}"</p>
      </div>
    )
  }

  const totalPages = Math.ceil(results.count / results.pageSize)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Found {results.count} results for "{query}"
        </p>
        {results.count > results.pageSize && (
          <Pagination
            currentPage={results.page}
            totalPages={totalPages}
            hasMore={results.hasMore}
            onPageChange={onPageChange}
            loading={loading}
          />
        )}
      </div>

      {results.data.map((result) => (
        <Card key={`${result.type}-${result.id}`} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <ContentTypeBadge type={result.type} />
                  {result.celex_number && <Badge variant="outline">{result.celex_number}</Badge>}
                  {result.case_id_text && <Badge variant="outline">{result.case_id_text}</Badge>}
                  {result.article_number_text && <Badge variant="outline">Art. {result.article_number_text}</Badge>}
                </div>
                <CardTitle className="text-lg">
                  <Link href={getDetailUrl(result)} className="hover:text-primary transition-colors">
                    {result.title}
                  </Link>
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm">{result.snippet}</CardDescription>
          </CardContent>
        </Card>
      ))}

      {results.count > results.pageSize && (
        <Pagination
          currentPage={results.page}
          totalPages={totalPages}
          hasMore={results.hasMore}
          onPageChange={onPageChange}
          loading={loading}
        />
      )}
    </div>
  )
}
