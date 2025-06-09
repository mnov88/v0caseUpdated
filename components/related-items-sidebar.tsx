"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, ChevronDown, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ContentTypeBadge } from "./content-type-badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CaseLaw, Article, Legislation, OperativePart } from "@/lib/supabase"

interface RelatedItem {
  id: string
  title: string
  subtitle?: string
  type: "legislation" | "article" | "case_law" | "operative_part"
  metadata?: Record<string, string>
  url: string
}

interface RelatedItemsGroup {
  title: string
  items: RelatedItem[]
  type: "legislation" | "article" | "case_law" | "operative_part"
  expanded?: boolean
}

interface RelatedItemsSidebarProps {
  groups: RelatedItemsGroup[]
  title?: string
  description?: string
  currentItemId?: string
}

export function RelatedItemsSidebar({
  groups,
  title = "Related Items",
  description,
  currentItemId,
}: RelatedItemsSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(groups.map((group) => [group.title, group.expanded !== false])),
  )

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }))
  }

  const hasItems = groups.some((group) => group.items.length > 0)

  if (!hasItems) {
    return null
  }

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="grouped">
          <div className="px-6 pb-2">
            <TabsList className="w-full">
              <TabsTrigger value="grouped" className="flex-1">
                Grouped
              </TabsTrigger>
              <TabsTrigger value="all" className="flex-1">
                All Items
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="grouped" className="mt-0">
            <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
              <div className="space-y-4 px-6 pb-6">
                {groups.map(
                  (group) =>
                    group.items.length > 0 && (
                      <Collapsible
                        key={group.title}
                        open={expandedGroups[group.title]}
                        onOpenChange={() => toggleGroup(group.title)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ContentTypeBadge type={group.type} variant="secondary" />
                            <h3 className="text-sm font-medium">
                              {group.title} ({group.items.length})
                            </h3>
                          </div>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-0 h-7 w-7">
                              {expandedGroups[group.title] ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent className="mt-2">
                          <div className="space-y-2">
                            {group.items.map((item) => (
                              <div
                                key={item.id}
                                className={`rounded-md border p-2 ${
                                  item.id === currentItemId ? "bg-muted border-primary" : ""
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <Link href={item.url} className="font-medium hover:text-primary transition-colors">
                                      {item.title}
                                    </Link>
                                    {item.subtitle && (
                                      <p className="text-xs text-muted-foreground mt-1">{item.subtitle}</p>
                                    )}
                                    {item.metadata && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {Object.entries(item.metadata).map(([key, value]) => (
                                          <Badge key={key} variant="outline" className="text-xs">
                                            {key}: {value}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <Link href={item.url} className="text-muted-foreground hover:text-primary">
                                    <ExternalLink className="h-3 w-3" />
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ),
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="all" className="mt-0">
            <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
              <div className="space-y-2 px-6 pb-6">
                {groups.flatMap((group) =>
                  group.items.map((item) => (
                    <div
                      key={`all-${item.id}`}
                      className={`rounded-md border p-2 ${item.id === currentItemId ? "bg-muted border-primary" : ""}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <ContentTypeBadge type={item.type} variant="secondary" showIcon={true} />
                          </div>
                          <Link href={item.url} className="font-medium hover:text-primary transition-colors">
                            {item.title}
                          </Link>
                          {item.subtitle && <p className="text-xs text-muted-foreground mt-1">{item.subtitle}</p>}
                        </div>
                        <Link href={item.url} className="text-muted-foreground hover:text-primary">
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  )),
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Helper functions to convert database entities to related items
export function caseLawToRelatedItem(caseLaw: CaseLaw): RelatedItem {
  return {
    id: caseLaw.id,
    title: caseLaw.case_id_text,
    subtitle: caseLaw.title,
    type: "case_law",
    metadata: {
      Court: caseLaw.court,
      Date: caseLaw.date_of_judgment,
    },
    url: `/case-laws/${caseLaw.id}`,
  }
}

export function articleToRelatedItem(article: Article): RelatedItem {
  return {
    id: article.id,
    title: `Article ${article.article_number_text}`,
    subtitle: article.title,
    type: "article",
    url: `/articles/${article.id}`,
  }
}

export function legislationToRelatedItem(legislation: Legislation): RelatedItem {
  return {
    id: legislation.id,
    title: legislation.title,
    type: "legislation",
    metadata: {
      CELEX: legislation.celex_number,
    },
    url: `/legislations/${legislation.id}`,
  }
}

export function operativePartToRelatedItem(operativePart: OperativePart): RelatedItem {
  return {
    id: operativePart.id,
    title: `Part ${operativePart.part_number}`,
    subtitle: operativePart.simplified_text.substring(0, 100) + "...",
    type: "operative_part",
    url: `/case-laws/${operativePart.case_law_id}#part-${operativePart.part_number}`,
  }
}
