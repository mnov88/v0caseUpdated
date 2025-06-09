"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { getArticle, getRelatedCasesForArticle, getRelatedOperativePartsForArticle } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OperativePartToggle } from "@/components/operative-part-toggle"
import { FileText } from "lucide-react"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { LoadingSpinner } from "@/components/loading-spinner"
import {
  RelatedItemsSidebar,
  caseLawToRelatedItem,
  operativePartToRelatedItem,
} from "@/components/related-items-sidebar"
import type { Article, CaseLaw, OperativePart } from "@/lib/supabase"

export default function ArticleDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [article, setArticle] = useState<Article | null>(null)
  const [relatedCases, setRelatedCases] = useState<CaseLaw[]>([])
  const [relatedOperativeParts, setRelatedOperativeParts] = useState<OperativePart[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [articleData, casesData, operativePartsData] = await Promise.all([
          getArticle(id),
          getRelatedCasesForArticle(id),
          getRelatedOperativePartsForArticle(id),
        ])

        setArticle(articleData)
        setRelatedCases(casesData)
        setRelatedOperativeParts(operativePartsData)
      } catch (error) {
        console.error("Error loading article data:", error)
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

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Article not found</h1>
        <p>The article you are looking for does not exist or has been removed.</p>
      </div>
    )
  }

  const breadcrumbItems = [
    { label: "Legislations", href: "/legislations" },
    article.legislation && {
      label: article.legislation.title,
      href: `/legislations/${article.legislation.id}`,
    },
    { label: `Article ${article.article_number_text}` },
  ].filter(Boolean) as { label: string; href?: string }[]

  // Prepare related items for sidebar
  const relatedGroups = [
    {
      title: "Related Cases",
      type: "case_law" as const,
      items: relatedCases.map(caseLawToRelatedItem),
    },
    {
      title: "Operative Parts",
      type: "operative_part" as const,
      items: relatedOperativeParts.map(operativePartToRelatedItem),
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
                <Badge variant="outline">Article {article.article_number_text}</Badge>
                {article.legislation && (
                  <Badge variant="secondary">
                    <Link href={`/legislations/${article.legislation.id}`} className="hover:underline">
                      {article.legislation.title}
                    </Link>
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl">{article.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">{article.markdown_content}</div>
              </div>
            </CardContent>
          </Card>

          {relatedOperativeParts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Operative Parts ({relatedOperativeParts.length})
                </CardTitle>
                <CardDescription>Operative parts that interpret this article</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {relatedOperativeParts.slice(0, 3).map((operativePart) => (
                    <div key={operativePart.id}>
                      <div className="mb-2">
                        <Link
                          href={`/case-laws/${operativePart.case_law?.id}`}
                          className="text-sm font-medium hover:text-primary transition-colors"
                        >
                          {operativePart.case_law?.case_id_text}
                        </Link>
                      </div>
                      <OperativePartToggle
                        verbatimText={operativePart.verbatim_text}
                        simplifiedText={operativePart.simplified_text}
                        partNumber={operativePart.part_number}
                      />
                    </div>
                  ))}
                  {relatedOperativeParts.length > 3 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      And {relatedOperativeParts.length - 3} more operative parts...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <RelatedItemsSidebar
            groups={relatedGroups}
            title="Related Items"
            description="Cases and operative parts related to this article"
          />
        </div>
      </div>
    </div>
  )
}
