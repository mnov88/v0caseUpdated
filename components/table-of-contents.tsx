"use client"

import { useState, useEffect } from "react"
import { Link } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  contentId: string
}

export function TableOfContents({ contentId }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const content = document.getElementById(contentId)
    if (!content) return

    // Find all headings in the content
    const headingElements = content.querySelectorAll("h1, h2, h3")
    const items: TocItem[] = Array.from(headingElements).map((heading) => {
      // Create an ID if one doesn't exist
      if (!heading.id) {
        heading.id = heading.textContent?.toLowerCase().replace(/\s+/g, "-") || ""
      }

      return {
        id: heading.id,
        text: heading.textContent || "",
        level: Number.parseInt(heading.tagName.substring(1)),
      }
    })

    setHeadings(items)

    // Set up intersection observer to highlight active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: "-100px 0px -80% 0px" },
    )

    headingElements.forEach((heading) => observer.observe(heading))

    return () => {
      headingElements.forEach((heading) => observer.unobserve(heading))
    }
  }, [contentId])

  if (headings.length === 0) {
    return null
  }

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Link className="h-4 w-4" />
          Table of Contents
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
          <div className="px-6 pb-6">
            <nav>
              <ul className="space-y-1">
                {headings.map((heading) => (
                  <li key={heading.id} style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }} className="text-sm">
                    <a
                      href={`#${heading.id}`}
                      className={`block py-1 hover:text-primary transition-colors ${
                        activeId === heading.id ? "font-medium text-primary" : "text-muted-foreground"
                      }`}
                      onClick={(e) => {
                        e.preventDefault()
                        document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth" })
                      }}
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
