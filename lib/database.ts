import { supabase } from "./supabase"
import type { Legislation, Article, CaseLaw, OperativePart, SearchResult } from "./supabase"

export interface PaginatedResults<T> {
  data: T[]
  count: number
  hasMore: boolean
  page: number
  pageSize: number
}

export interface SearchOptions {
  page?: number
  pageSize?: number
  type?: "legislation" | "article" | "case_law" | "operative_part"
}

export async function searchAll(query: string, options: SearchOptions = {}): Promise<PaginatedResults<SearchResult>> {
  const { page = 1, pageSize = 20, type } = options
  const offset = (page - 1) * pageSize
  const results: SearchResult[] = []
  let totalCount = 0

  try {
    // Search legislations
    if (!type || type === "legislation") {
      const { data: legislations, count } = await supabase
        .from("legislations")
        .select("id, celex_number, title, full_markdown_content", { count: "exact" })
        .or(`title.ilike.%${query}%,full_markdown_content.ilike.%${query}%`)
        .range(offset, offset + pageSize - 1)
        .order("title")

      if (legislations) {
        results.push(
          ...legislations.map((item) => ({
            id: item.id,
            type: "legislation" as const,
            title: item.title,
            snippet: item.full_markdown_content?.substring(0, 200) + "..." || "",
            celex_number: item.celex_number,
          })),
        )
        totalCount += count || 0
      }
    }

    // Search articles
    if (!type || type === "article") {
      const { data: articles, count } = await supabase
        .from("articles")
        .select("id, article_number_text, title, markdown_content, legislation:legislations(title)", { count: "exact" })
        .or(`title.ilike.%${query}%,markdown_content.ilike.%${query}%`)
        .range(offset, offset + pageSize - 1)
        .order("article_number_text")

      if (articles) {
        results.push(
          ...articles.map((item) => ({
            id: item.id,
            type: "article" as const,
            title: `${item.title} (${item.legislation?.title})`,
            snippet: item.markdown_content?.substring(0, 200) + "..." || "",
            article_number_text: item.article_number_text,
          })),
        )
        totalCount += count || 0
      }
    }

    // Search case laws
    if (!type || type === "case_law") {
      const { data: caseLaws, count } = await supabase
        .from("case_laws")
        .select("id, celex_number, case_id_text, title, summary_text", { count: "exact" })
        .or(`title.ilike.%${query}%,summary_text.ilike.%${query}%`)
        .range(offset, offset + pageSize - 1)
        .order("date_of_judgment", { ascending: false })

      if (caseLaws) {
        results.push(
          ...caseLaws.map((item) => ({
            id: item.id,
            type: "case_law" as const,
            title: item.title,
            snippet: item.summary_text?.substring(0, 200) + "..." || "",
            celex_number: item.celex_number,
            case_id_text: item.case_id_text,
          })),
        )
        totalCount += count || 0
      }
    }

    return {
      data: results.slice(0, pageSize),
      count: totalCount,
      hasMore: totalCount > offset + pageSize,
      page,
      pageSize,
    }
  } catch (error) {
    console.error("Search error:", error)
    return {
      data: [],
      count: 0,
      hasMore: false,
      page,
      pageSize,
    }
  }
}

export async function getLegislations(page = 1, pageSize = 20): Promise<PaginatedResults<Legislation>> {
  const offset = (page - 1) * pageSize

  const { data, count, error } = await supabase
    .from("legislations")
    .select("*", { count: "exact" })
    .order("title")
    .range(offset, offset + pageSize - 1)

  if (error) throw error

  return {
    data: data || [],
    count: count || 0,
    hasMore: (count || 0) > offset + pageSize,
    page,
    pageSize,
  }
}

export async function getCaseLaws(page = 1, pageSize = 20): Promise<PaginatedResults<CaseLaw>> {
  const offset = (page - 1) * pageSize

  const { data, count, error } = await supabase
    .from("case_laws")
    .select("*", { count: "exact" })
    .order("date_of_judgment", { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) throw error

  return {
    data: data || [],
    count: count || 0,
    hasMore: (count || 0) > offset + pageSize,
    page,
    pageSize,
  }
}

// Keep existing functions but add error handling
export async function getLegislation(id: string): Promise<Legislation | null> {
  try {
    const { data, error } = await supabase.from("legislations").select("*").eq("id", id).single()
    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching legislation:", error)
    return null
  }
}

export async function getLegislationArticles(legislationId: string): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("legislation_id", legislationId)
      .order("article_number_text")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching articles:", error)
    return []
  }
}

export async function getArticle(id: string): Promise<Article | null> {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*, legislation:legislations(*)")
      .eq("id", id)
      .single()
    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching article:", error)
    return null
  }
}

export async function getCaseLaw(id: string): Promise<CaseLaw | null> {
  try {
    const { data, error } = await supabase.from("case_laws").select("*").eq("id", id).single()
    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching case law:", error)
    return null
  }
}

export async function getCaseLawOperativeParts(caseLawId: string): Promise<OperativePart[]> {
  try {
    const { data, error } = await supabase
      .from("operative_parts")
      .select("*")
      .eq("case_law_id", caseLawId)
      .order("part_number")
    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching operative parts:", error)
    return []
  }
}

export async function getRelatedCasesForArticle(articleId: string): Promise<CaseLaw[]> {
  try {
    const { data, error } = await supabase
      .from("case_law_interprets_article")
      .select("case_law:case_laws(*)")
      .eq("article_id", articleId)

    if (error) throw error
    return data?.map((item) => item.case_law).filter(Boolean) || []
  } catch (error) {
    console.error("Error fetching related cases:", error)
    return []
  }
}

export async function getRelatedOperativePartsForArticle(articleId: string): Promise<OperativePart[]> {
  try {
    const { data, error } = await supabase
      .from("operative_part_interprets_article")
      .select("operative_part:operative_parts(*, case_law:case_laws(*))")
      .eq("article_id", articleId)

    if (error) throw error
    return data?.map((item) => item.operative_part).filter(Boolean) || []
  } catch (error) {
    console.error("Error fetching related operative parts:", error)
    return []
  }
}

export async function getCasesForLegislation(
  legislationId: string,
  filters: {
    dateFrom?: string
    dateTo?: string
    court?: string
    article?: string
    page?: number
    pageSize?: number
  } = {},
) {
  const { page = 1, pageSize = 50, dateFrom, dateTo, court, article } = filters
  const offset = (page - 1) * pageSize

  try {
    let query = supabase.from("case_laws").select(`
        *,
        case_law_interprets_article!inner(
          article:articles!inner(
            id,
            article_number_text,
            title,
            legislation_id
          )
        )
      `)

    // Filter by legislation through articles
    query = query.eq("case_law_interprets_article.article.legislation_id", legislationId)

    // Filter by specific article if provided
    if (article) {
      query = query.eq("case_law_interprets_article.article.id", article)
    }

    // Apply other filters
    if (dateFrom) {
      query = query.gte("date_of_judgment", dateFrom)
    }
    if (dateTo) {
      query = query.lte("date_of_judgment", dateTo)
    }
    if (court) {
      query = query.ilike("court", `%${court}%`)
    }

    const { data: casesData, count } = await query
      .order("date_of_judgment", { ascending: false })
      .range(offset, offset + pageSize - 1)

    // Also get cases through operative parts mentioning legislation
    let opQuery = supabase
      .from("case_laws")
      .select(`
        *,
        operative_parts!inner(
          operative_part_mentions_legislation!inner(
            mentioned_legislation_id
          )
        )
      `)
      .eq("operative_parts.operative_part_mentions_legislation.mentioned_legislation_id", legislationId)

    // Apply same filters to operative parts query
    if (dateFrom) {
      opQuery = opQuery.gte("date_of_judgment", dateFrom)
    }
    if (dateTo) {
      opQuery = opQuery.lte("date_of_judgment", dateTo)
    }
    if (court) {
      opQuery = opQuery.ilike("court", `%${court}%`)
    }

    const { data: operativePartCases } = await opQuery
      .order("date_of_judgment", { ascending: false })
      .range(offset, offset + pageSize - 1)

    // Combine and deduplicate cases
    const casesMap = new Map()

    casesData?.forEach((caseItem) => {
      casesMap.set(caseItem.id, caseItem)
    })

    // Only add operative part cases if no specific article filter
    if (!article) {
      operativePartCases?.forEach((caseItem) => {
        casesMap.set(caseItem.id, caseItem)
      })
    }

    const cases = Array.from(casesMap.values())
    const totalCount = cases.length

    return {
      data: cases.slice(0, pageSize),
      count: totalCount,
      hasMore: totalCount > pageSize,
      page,
      pageSize,
    }
  } catch (error) {
    console.error("Error fetching cases for legislation:", error)
    return {
      data: [],
      count: 0,
      hasMore: false,
      page,
      pageSize,
    }
  }
}
