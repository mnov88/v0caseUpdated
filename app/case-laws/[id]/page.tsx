"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getCaseLaw, getCaseLawOperativeParts } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OperativePartToggle } from "@/components/operative-part-toggle"
import { FileText } from "lucide-react"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { LoadingSpinner } from "@/components/loading-spinner"
import { TableOfContents } from "@/components/table-of-contents"
import { RelatedItemsSidebar, operativePartToRelatedItem } from "@/components/related-items-sidebar"
import type { CaseLaw, OperativePart } from "@/lib/supabase"

export default function CaseLawDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [caseLaw, setCaseLaw] = useState<CaseLaw | null>(null)
  const [operativeParts, setOperativeParts] = useState<OperativePart[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [caseLawData, operativePartsData] = await Promise.all([getCaseLaw(id), getCaseLawOperativeParts(id)])

        setCaseLaw(caseLawData)
        setOperativeParts(operativePartsData)
      } catch (error) {
        console.error("Error loading case law data:", error)
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

  if (!caseLaw) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Case law not found</h1>
        <p>The case law you are looking for does not exist or has been removed.</p>
      </div>
    )
  }

  const breadcrumbItems = [{ label: "Case Laws", href: "/case-laws" }, { label: caseLaw.case_id_text }]

  // Prepare related items for sidebar
  const relatedGroups = [
    {
      title: "Operative Parts",
      type: "operative_part" as const,
      items: operativeParts.map(operativePartToRelatedItem),
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
                <Badge variant="outline">{caseLaw.case_id_text}</Badge>
                {caseLaw.celex_number && <Badge variant="secondary">{caseLaw.celex_number}</Badge>}
              </div>
              <CardTitle className="text-2xl">{caseLaw.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  <strong>Court:</strong> {caseLaw.court}
                </span>
                <span>
                  <strong>Date:</strong> {caseLaw.date_of_judgment}
                </span>
              </div>
              {caseLaw.parties && (
                <p className="text-sm text-muted-foreground">
                  <strong>Parties:</strong> {caseLaw.parties}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {caseLaw.summary_text && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <div className="prose prose-sm max-w-none">
                    <p>{caseLaw.summary_text}</p>
                  </div>
                </div>
              )}

              {caseLaw.html_content && (
                <div id="case-content">
                  <h3 className="font-semibold mb-2">Full Text</h3>
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: caseLaw.html_content }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {operativeParts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Operative Parts ({operativeParts.length})
                </CardTitle>
                <CardDescription>The dispositive sections of this case</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {operativeParts.map((operativePart) => (
                    <OperativePartToggle
                      key={operativePart.id}
                      id={`part-${operativePart.part_number}`}
                      verbatimText={operativePart.verbatim_text}
                      simplifiedText={operativePart.simplified_text}
                      partNumber={operativePart.part_number}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <TableOfContents contentId="case-content" />
          <RelatedItemsSidebar
            groups={relatedGroups}
            title="Operative Parts"
            description="Navigate to specific operative parts"
          />
        </div>
      </div>
    </div>
  )
}
