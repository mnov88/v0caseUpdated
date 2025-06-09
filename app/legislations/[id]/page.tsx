"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { getLegislation, getLegislationArticles, getCasesForLegislation } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { LoadingSpinner } from "@/components/loading-spinner"
import { RelatedItemsSidebar, caseLawToRelatedItem, articleToRelatedItem } from "@/components/related-items-sidebar"
import { TableOfContents } from "@/components/table-of-contents"
import type { Legislation, Article, CaseLaw } from "@/lib/supabase"

export default function LegislationDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [legislation, setLegislation] = useState<Legislation | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [cases, setCases] = useState<CaseLaw[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [legislationData, articlesData, casesData] = await Promise.all([
          getLegislation(id),
          getLegislationArticles(id),
          getCasesForLegislation(id),
        ])

        setLegislation(legislationData)
        setArticles(articlesData)
        setCases(casesData.data || [])
      } catch (error) {
        console.error("Error loading legislation data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!legislation) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Legislation not found</h1>
        <p>The legislation you are looking for does not exist or has been removed.</p>
      </div>
    )
  }

  const breadcrumbItems = [{ label: "Legislations", href: "/legislations" }, { label: legislation.title }]

  // Prepare related items for sidebar
  const relatedGroups = [
    {
      title: "Articles",
      type: "article" as const,
      items: articles.map(articleToRelatedItem),
    },
    {
      title: "Related Cases",
      type: "case_law" as const,
      items: cases.map(caseLawToRelatedItem),
    },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <BreadcrumbNav items={breadcrumbItems} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{legislation.celex_number}</Badge>
              </div>
              <CardTitle className="text-2xl">{legislation.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none" id="legislation-content">
                <div className="whitespace-pre-wrap">{legislation.full_markdown_content}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Articles ({articles.length})
              </CardTitle>
              <CardDescription>Individual articles within this legislation</CardDescription>
            </CardHeader>
            <CardContent>
              {articles.length > 0 ? (
                <div className="space-y-2">
                  {articles.map((article) => (
                    <div key={article.id} className="flex items-center justify-between p-2 rounded border">
                      <div>
                        <Link
                          href={`/articles/${article.id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          Article {article.article_number_text}
                        </Link>
                        <p className="text-sm text-muted-foreground">{article.title}</p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/articles/${article.id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No articles found.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <TableOfContents contentId="legislation-content" />
          <RelatedItemsSidebar
            groups={relatedGroups}
            title="Related Items"
            description="Articles and cases related to this legislation"
          />
        </div>
      </div>
    </div>
  )
}
