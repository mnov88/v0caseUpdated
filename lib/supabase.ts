import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Legislation {
  id: string
  celex_number: string
  title: string
  full_markdown_content: string
  created_at: string
}

export interface Article {
  id: string
  legislation_id: string
  article_number_text: string
  title: string
  filename: string
  markdown_content: string
  legislation?: Legislation
}

export interface CaseLaw {
  id: string
  celex_number: string
  case_id_text: string
  title: string
  court: string
  date_of_judgment: string
  parties: string
  summary_text: string
  operative_parts_combined: string
  operative_parts_individual: string
  html_content: string
  plaintext_content: string
}

export interface OperativePart {
  id: string
  case_law_id: string
  part_number: number
  verbatim_text: string
  simplified_text: string
  markdown_content: string
  case_law?: CaseLaw
}

export interface SearchResult {
  id: string
  type: "legislation" | "article" | "case_law" | "operative_part"
  title: string
  snippet: string
  celex_number?: string
  case_id_text?: string
  article_number_text?: string
}
