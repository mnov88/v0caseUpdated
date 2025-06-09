"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Search, X, Clock, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ContentTypeBadge } from "./content-type-badge"
import { searchAll } from "@/lib/database"
import type { SearchResult } from "@/lib/database"

interface SearchBarProps {
  placeholder?: string
  defaultValue?: string
  showSuggestions?: boolean
}

export function SearchBar({
  placeholder = "Search EU laws, cases, and articles...",
  defaultValue = "",
  showSuggestionsProp = true,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue)
  const [suggestions, setSuggestions] = useState<SearchResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [popularSearches] = useState([
    "GDPR",
    "Data Protection",
    "Article 6",
    "Right to be forgotten",
    "Google Spain",
    "Schrems",
  ])

  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem("eu-law-recent-searches")
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    // Handle clicks outside to close suggestions
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchSuggestions = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    setLoading(true)
    try {
      const results = await searchAll(searchQuery, { pageSize: 5 })
      setSuggestions(results.data)
    } catch (error) {
      console.error("Error fetching suggestions:", error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      if (value.trim() && showSuggestionsProp) {
        fetchSuggestions(value.trim())
      } else {
        setSuggestions([])
      }
    }, 300)
  }

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query
    if (!finalQuery.trim()) return

    // Save to recent searches
    const updated = [finalQuery, ...recentSearches.filter((s) => s !== finalQuery)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem("eu-law-recent-searches", JSON.stringify(updated))

    setShowSuggestions(false)
    router.push(`/search?q=${encodeURIComponent(finalQuery.trim())}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  const clearQuery = () => {
    setQuery("")
    setSuggestions([])
    setShowSuggestions(false)
  }

  return (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            className="pl-10 pr-10"
            autoComplete="off"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={clearQuery}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Button type="submit" disabled={!query.trim()}>
          Search
        </Button>
      </form>

      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {loading && <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>}

            {!loading && suggestions.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">Suggestions</div>
                {suggestions.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="px-3 py-2 hover:bg-muted cursor-pointer border-b last:border-b-0"
                    onClick={() => handleSearch(result.title)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <ContentTypeBadge type={result.type} variant="secondary" />
                      <span className="font-medium text-sm">{result.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{result.snippet}</p>
                  </div>
                ))}
              </div>
            )}

            {!loading && suggestions.length === 0 && query.length >= 2 && (
              <div className="p-4 text-center text-sm text-muted-foreground">No suggestions found</div>
            )}

            {!query && recentSearches.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Recent Searches
                </div>
                {recentSearches.map((search, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 hover:bg-muted cursor-pointer border-b last:border-b-0 flex items-center justify-between"
                    onClick={() => handleSearch(search)}
                  >
                    <span className="text-sm">{search}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        const updated = recentSearches.filter((_, i) => i !== index)
                        setRecentSearches(updated)
                        localStorage.setItem("eu-law-recent-searches", JSON.stringify(updated))
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {!query && (
              <div>
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Popular Searches
                </div>
                {popularSearches.map((search, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 hover:bg-muted cursor-pointer border-b last:border-b-0"
                    onClick={() => handleSearch(search)}
                  >
                    <span className="text-sm">{search}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
