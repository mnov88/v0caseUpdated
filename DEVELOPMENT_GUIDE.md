# EU Law Platform - Developer Guide

This guide provides a deeper understanding of the EU Law Platform's architecture, data flow, and development patterns. It's intended for developers working on the project and for AI assistants aiding in development tasks.

## Table of Contents

1.  [Architecture Overview](#architecture-overview)
2.  [Tech Stack Summary](#tech-stack-summary)
3.  [Directory Structure](#directory-structure)
4.  [Data Model and Structures](#data-model-and-structures)
5.  [Data Flow](#data-flow)
    *   [General Data Flow Pattern (Client-Side Fetching)](#general-data-flow-pattern-client-side-fetching)
    *   [Search Feature Data Flow](#search-feature-data-flow)
    *   [Detail Page Data Flow (Legislation, Article, Case Law)](#detail-page-data-flow-legislation-article-case-law)
6.  [API Interaction](#api-interaction)
7.  [State Management](#state-management)
8.  [Component Interaction Patterns](#component-interaction-patterns)
9.  [Loading States Management](#loading-states-management)
10. [Error Handling Strategy](#error-handling-strategy)
11. [Styling and Theming](#styling-and-theming)
12. [Environment Variables](#environment-variables)

---
**Note:** For specific details on the application's User Interface (UI), User Experience (UX), component showcase, and page-by-page visual and interaction flows, please see the [UI/UX Guide (UI_UX_GUIDE.md)](./UI_UX_GUIDE.md).
---

## 1. Architecture Overview

The EU Law Platform is a Next.js (App Router) application built with TypeScript. It uses Supabase as its PostgreSQL database and backend service. The architecture primarily relies on client-side data fetching within React components, with data access centralized in `lib/database.ts`.

Key characteristics:
*   **Client-Side Rendering Focus:** Most data-driven pages are client components (`"use client"`) that fetch data in `useEffect` hooks.
*   **Centralized Data Access:** `lib/database.ts` serves as a data access layer, abstracting Supabase queries.
*   **URL-Driven State:** Page navigation and content are heavily influenced by URL parameters.
*   **Component-Based UI:** Built with React and a rich set of UI components, likely leveraging Shadcn/UI for primitives.

## 2. Tech Stack Summary

*   **Frontend:** Next.js (v15+), React (v19+), TypeScript, Tailwind CSS
*   **Backend & Database:** Supabase (PostgreSQL)
*   **Key Libraries:** `@supabase/supabase-js`, `lucide-react` (icons), `date-fns`.
*   **UI Components:** Radix UI primitives (likely via Shadcn/UI).
*   **Package Manager:** PNPM

(For a more detailed list, see the main `README.md`)

## 3. Directory Structure

(Refer to the `README.md` for a general overview. This section could be expanded with more specifics if needed for developers.)

*   **`/app`**: Next.js App Router. Pages are client components managing their own data fetching.
    *   `loading.tsx` files provide initial loading UI for route segments.
*   **`/lib/database.ts`**: Crucial for data fetching logic.
*   **`/lib/supabase.ts`**: Supabase client initialization and core TypeScript type definitions.
*   **`/components/ui/`**: Generic, reusable UI primitives.
*   **`/components/`**: Application-specific composite components.
*   **`/hooks/`**: Reusable React hook logic.

## 4. Data Model and Structures

Core data entities are defined as TypeScript interfaces in `lib/supabase.ts`.

*   **`Legislation`**: Represents legislative documents.
    *   Fields: `id`, `celex_number`, `title`, `full_markdown_content`, `created_at`.
*   **`Article`**: Represents articles within legislations.
    *   Fields: `id`, `legislation_id`, `article_number_text`, `title`, `markdown_content`, `legislation?` (optional parent).
*   **`CaseLaw`**: Represents court case laws.
    *   Fields: `id`, `celex_number`, `case_id_text`, `title`, `court`, `date_of_judgment`, `summary_text`, `html_content`, etc.
*   **`OperativePart`**: Represents dispositive parts of a case law.
    *   Fields: `id`, `case_law_id`, `part_number`, `verbatim_text`, `simplified_text`, `markdown_content`, `case_law?`.
*   **`SearchResult`**: Unified interface for search results.
    *   Fields: `id`, `type` (discriminator), `title`, `snippet`, and optional identifiers.
*   **`PaginatedResults<T>`**: Generic wrapper for paginated data.
*   **`SearchOptions`**: Parameters for the search function.

**AI/Developer Notes:**
*   These types are fundamental for understanding data flow and component props.
*   Changes to the database schema should be reflected in these interfaces.

## 5. Data Flow

### General Data Flow Pattern (Client-Side Fetching)

1.  **User Interaction / Navigation** triggers a URL change or component event.
2.  **URL Update** (if applicable, via `next/navigation`).
3.  **Page Component** detects URL/dependency changes in `useEffect`.
4.  **Data Fetching Request:** Page component calls an async function from `lib/database.ts`.
5.  **Database Interaction:** `lib/database.ts` function queries Supabase via `supabase-js`.
6.  **Data Return** to `lib/database.ts`, then to the page component.
7.  **State Update:** Page component updates its local state (`useState`) with fetched data and loading status.
8.  **Re-render:** React re-renders components.
9.  **Data Propagation:** Data flows to child components via props.

### Search Feature Data Flow

*   **Suggestions (`SearchBar`):** Input change -> debounced `fetchSuggestions` -> `searchAll({ pageSize: 5 })` -> update `suggestions` state -> render dropdown.
*   **Full Search:** Submit/click suggestion in `SearchBar` -> `router.push(\`/search?q=...\`)` -> `SearchPage` `useEffect` detects query -> `performSearch` calls `searchAll({ page, pageSize })` -> update `results` state -> `SearchResults` component renders data.
*   **Pagination (`SearchPage`):** Click page number -> `handlePageChange` -> `router.push(\`/search?q=...&page=...\`)` -> `SearchPage` `useEffect` re-fetches.

### Detail Page Data Flow (Legislation, Article, Case Law)

*   **Example: `LegislationDetailPage` (`app/legislations/[id]/page.tsx`)**
    1.  Navigation to `/legislations/{id}`.
    2.  `useParams()` gets `id`.
    3.  `useEffect` calls `loadData()`.
    4.  `loadData()` uses `Promise.all` to call `getLegislation(id)`, `getLegislationArticles(id)`, `getCasesForLegislation(id)` from `lib/database.ts`.
    5.  Data returned, page state (`legislation`, `articles`, `cases`) updated via `useState`.
    6.  Page renders, passing data to `RelatedItemsSidebar`, etc.
*   **Article and Case Law detail pages follow a similar pattern**, calling their respective fetching functions from `lib/database.ts`.

**AI/Developer Notes:**
*   Data fetching is primarily client-initiated in response to navigation or interaction.
*   The `useEffect` hook in page components is the main trigger for data fetching.
*   `lib/database.ts` is the sole point of contact with Supabase for data retrieval.

## 6. API Interaction

*   **Implicit API:** The application doesn't define its own backend API routes for data fetching. Instead, it interacts directly with the Supabase backend API via the `supabase-js` client library. All functions in `lib/database.ts` use this client.
*   **Supabase API:** The "endpoints" are those provided by Supabase (e.g., `your-supabase-url/rest/v1/table_name`).
*   **Security:** Relies on Supabase Row Level Security (RLS) policies and the public anon key. Data access is primarily read-only for public content.
*   **Server Components/Actions:** Currently, pages are client components. Future development could use:
    *   **Server Components:** For server-side data fetching on initial load to improve performance.
    *   **Server Actions:** For data mutations (e.g., if user-generated content features were added).
*   **No Custom API Routes:** No `app/api/.../route.ts` files are used for core data fetching.

**AI/Developer Notes:**
*   Understand that "API calls" refer to `supabase-js` client methods.
*   RLS in Supabase is critical for data security.

## 7. State Management

*   **Local Component State (`useState`):** Most common; used for data, loading flags, UI toggles within components.
*   **URL-based State (Next.js Router):**
    *   `useParams()` for route parameters (e.g., item IDs).
    *   `useSearchParams()` for query parameters (e.g., search terms, page numbers).
    *   `useRouter().push()` to programmatically update URLs and trigger state changes.
    *   This is the primary method for managing global view state.
*   **React Context (`useContext`):**
    *   `SidebarProvider` (in `app/layout.tsx` via `components/ui/sidebar.tsx`) manages sidebar UI state.
    *   Not used for global *data* state.
*   **`localStorage`:**
    *   Used in `SearchBar` to store recent search terms.
*   **No Global Data State Library:** The project does not use Redux, Zustand, etc.

**AI/Developer Notes:**
*   The URL is a significant part of the application's state. Changes to it often trigger data re-fetching.
*   Most data fetched is stored in the local state of page components.

## 8. Component Interaction Patterns

*   **Parent-to-Child (Props):** Primary method for data flow and passing callbacks.
*   **Child-to-Parent (Callbacks):** Children invoke functions passed by parents to signal events or pass data up (e.g., `onPageChange` in `Pagination`).
*   **Sibling Communication (Indirect):** Mediated via a common parent component or context. No direct sibling interaction.
*   **Navigation-Driven Interaction:** Components trigger `router.push()` or use `<Link>`, leading to new page states and data fetches.
*   **UI Primitives (`components/ui/`):** Configured via props, communicate via callbacks.
*   **Custom Hooks (`hooks/`):** Encapsulate reusable stateful logic (e.g., `useIsMobile`).

**AI/Developer Notes:**
*   Trace data by following props downwards and callbacks upwards.
*   Router events are key points of interaction for page-level changes.

## 9. Loading States Management

*   **Page/Component Level (`useState`):**
    *   Boolean `loading` state (e.g., `const [loading, setLoading] = useState(true);`).
    *   Set to `true` before async operation, `false` in `finally` block.
    *   Conditional rendering of skeletons (`components/ui/skeleton.tsx`), spinners (`components/loading-spinner.tsx`), or placeholder text.
*   **Next.js `loading.tsx` Files:**
    *   Located in `app/loading.tsx`, `app/search/loading.tsx`, etc.
    *   Provide initial loading UI for route segments using React Suspense.
    *   Complements client-side loading flags, especially for initial navigation.

**AI/Developer Notes:**
*   Distinguish between the immediate `loading.tsx` UI (Suspense-based) and the client-side `loading` flags which manage the display of actual fetched content.

## 10. Error Handling Strategy

*   **Data Fetching (`lib/database.ts`):**
    *   `try...catch` blocks around Supabase calls.
    *   Errors logged via `console.error()`.
    *   Some functions return default/empty data on error (e.g., `searchAll`), others re-throw.
*   **Page-Level Data Fetching:**
    *   `try...catch` in `useEffect` data fetching logic.
    *   Errors logged via `console.error()`.
    *   UI often shows "not found" or empty state if data is null/empty post-fetch attempt. Explicit error messages to users are not common.
*   **Global Rendering Errors (`components/error-boundary.tsx`):**
    *   `RootLayout` wraps children in `<ErrorBoundary>`.
    *   Catches JavaScript errors during React rendering lifecycle and displays a fallback UI.

**AI/Developer Notes:**
*   Consider standardizing error object propagation from `lib/database.ts`.
*   For better UX, implement more explicit user-facing error messages in page components by managing an `error` state.
*   `ErrorBoundary` is for render errors, not a substitute for handling async data fetch errors.

## 11. Styling and Theming

*   **Tailwind CSS:** Primary styling methodology. Utility classes are used directly in components.
*   **`tailwind.config.ts`:** Tailwind configuration and customization.
*   **Global Styles:** `app/globals.css` for base styles and Tailwind layers.
*   **`components/theme-provider.tsx`:** Manages application theming (e.g., light/dark mode), likely using `next-themes`. (Actual implementation not fully reviewed).

## 12. Environment Variables

*   **`NEXT_PUBLIC_SUPABASE_URL`**: URL of the Supabase project.
*   **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Public anonymous key for the Supabase project.
*   These are defined in `.env.local` (not committed) and are essential for connecting to Supabase.

**AI/Developer Notes:**
*   Ensure `.env.local` is correctly set up as per the main `README.md`.
*   No other critical environment variables were identified in the reviewed core logic.
