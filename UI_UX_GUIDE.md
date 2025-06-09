# EU Law Platform - UI/UX Guide

This guide provides an overview of the EU Law Platform's user interface (UI), user experience (UX) design, key reusable components, and a page-by-page breakdown of features and interactions.

## Table of Contents

1.  [Overall Application Layout](#overall-application-layout)
2.  [Global UI Components & Features](#global-ui-components--features)
    *   [Navigation Sidebar](#navigation-sidebar)
    *   [Breadcrumb Navigation](#breadcrumb-navigation)
    *   [Theming (Light/Dark Mode)](#theming-lightdark-mode)
3.  [Key Reusable UI Components](#key-reusable-ui-components)
    *   [Application-Specific Components (`/components`)](#application-specific-components-components)
    *   [Generic UI Primitives (`/components/ui`)](#generic-ui-primitives-componentsui)
4.  [Page-by-Page UI/UX Breakdown](#page-by-page-uiux-breakdown)
    *   [Home Page (`/`)](#home-page-)
    *   [Search Results Page (`/search`)](#search-results-page-search)
    *   [Legislation Detail Page (`/legislations/[id]`)](#legislation-detail-page-legislationsid)
    *   [Article Detail Page (`/articles/[id]`)](#article-detail-page-articlesid)
    *   [Case Law Detail Page (`/case-laws/[id]`)](#case-law-detail-page-case-lawsid)
    *   [Reports Pages (`/reports`, `/reports/preview`) (Inferred)](#reports-pages-reports-reportspreview-inferred)

## 1. Overall Application Layout

The application employs a consistent and responsive layout structure:

*   **Desktop View:**
    *   A two-column layout is standard for most views.
    *   **Left Column:** A collapsible navigation sidebar (`AppSidebar`) providing access to main application sections. It can be collapsed to an icon-only view or fully expanded. Its state is persisted.
    *   **Right Column:** The main content area (`SidebarInset`) where individual page content is displayed. This area adjusts its width based on the sidebar's state.
*   **Mobile View:**
    *   The navigation sidebar transforms into an off-canvas drawer, accessible via a trigger (typically a hamburger icon, though the trigger itself isn't explicitly part of `AppSidebar` but would be a global header element if one existed, or managed by `SidebarTrigger`).
    *   The main content area takes up the full width of the screen.
*   **Content Area:** Typically includes a `BreadcrumbNav` at the top for secondary navigation and context, followed by the specific page content structured using `Card` components.

## 2. Global UI Components & Features

These elements are present across most of the application, contributing to a consistent UX.

### Navigation Sidebar (`components/app-sidebar.tsx` & `components/ui/sidebar.tsx`)

*   **Purpose:** Primary navigation hub.
*   **Features & UX:**
    *   Displays links to: Search, Legislations, Case Laws, Reports.
    *   Uses icons for quick recognition.
    *   Highlights the active section based on the current URL path.
    *   Collapsible on desktop (full, icon-only, or fully hidden via `Cmd/Ctrl+B`).
    *   Off-canvas drawer on mobile.
    *   State (expanded/collapsed) is persisted using cookies.
*   **UI:** Built with the highly configurable `components/ui/sidebar.tsx` primitive.

### Breadcrumb Navigation (`components/breadcrumb-nav.tsx`)

*   **Purpose:** Shows the user's current location within the site's hierarchy.
*   **Features & UX:**
    *   Starts with a "Home" icon link.
    *   Dynamically populates with links to parent pages and the current page title.
    *   Helps with orientation and provides quick navigation back to higher levels.
*   **UI:** Uses `components/ui/breadcrumb.tsx` primitives.

### Theming (Light/Dark Mode) (`components/theme-provider.tsx`)

*   **Purpose:** Allows users to switch between light and dark color schemes.
*   **Features & UX:**
    *   Uses `next-themes` library.
    *   The theme choice is typically persisted (e.g., in `localStorage` by `next-themes`).
    *   A theme toggle button/switch would be expected in a global header or settings area (not explicitly reviewed, but `ThemeProvider` enables this).

## 3. Key Reusable UI Components

### Application-Specific Components (`/components`)

These components are tailored for the application's domain and features.

*   **`search-bar.tsx`**:
    *   **UX:** Central to information discovery. Offers immediate feedback with suggestions, reducing effort and guiding users. Recent/popular searches enhance efficiency for common queries.
*   **`search-results.tsx`**:
    *   **UX:** Clearly presents search findings. `ContentTypeBadge` aids in distinguishing items. Snippets provide context. Integrated `Pagination` is crucial for large result sets.
*   **`pagination.tsx`**:
    *   **UX:** Standard and intuitive way to navigate large lists of items. Clear "Previous/Next" controls.
*   **`content-type-badge.tsx`**:
    *   **UX:** Provides immediate visual cues about the nature of a piece of content (e.g., is this a law, a case, or an article?).
*   **`operative-part-toggle.tsx`**:
    *   **UX:** Manages complexity by allowing users to switch between detailed verbatim legal text and a simplified version, catering to different levels of expertise or interest.
*   **`related-items-sidebar.tsx`**:
    *   **UX:** Enhances discoverability by surfacing contextually relevant information without requiring new searches. Tabs for "Grouped" vs. "All" views offer flexibility.
*   **`table-of-contents.tsx`**:
    *   **UX:** Improves navigability of long documents (legislations, case laws) by providing direct scroll links to sections.

### Generic UI Primitives (`/components/ui`)

These are foundational elements (likely from Shadcn/UI) ensuring a consistent visual style and interaction patterns. Examples include:

*   `Button`: For all clickable actions.
*   `Card`: For structuring content blocks.
*   `Input`: For text entry.
*   `Badge`: For short informational tags.
*   `Dialog`: For modal interactions.
*   `Collapsible`, `Tabs`: For organizing content.
*   `Skeleton`: For loading placeholders, improving perceived performance.
*   `Tooltip`: For providing additional information on hover.

## 4. Page-by-Page UI/UX Breakdown

### Home Page (`/`)

*   **Purpose & Features:** Introduction, global search access, overview of content types, quick start guide.
*   **Layout & Structure:** Centered, with sections for search, content type cards, and quick start info.
*   **Key UI Elements:** `SearchBar`, `Card` components with icons and descriptions.
*   **UX Flow:** Users orient themselves, initiate a search, or understand platform capabilities. The page aims to be inviting and directive.

### Search Results Page (`/search`)

*   **Purpose & Features:** Display paginated search results, allow further search refinement.
*   **Layout & Structure:** `BreadcrumbNav`, `SearchBar`, main area for `SearchResults` component.
*   **Key UI Elements:** `SearchBar`, `SearchResults` (which includes `Card` per item, `ContentTypeBadge`, `Pagination`). `SearchSkeleton` for loading.
*   **UX Flow:** Users review results, click to view details, navigate pages, or modify their search query. The flow is focused on efficient information retrieval.

### Legislation Detail Page (`/legislations/[id]`)

*   **Purpose & Features:** Display full text and details of legislation, list its articles, show related cases.
*   **Layout & Structure:** Two-column: Main content (legislation text, articles list) on the left; `TableOfContents` and `RelatedItemsSidebar` on the right.
*   **Key UI Elements:** `BreadcrumbNav`, `Card`s for content, `TableOfContents`, `RelatedItemsSidebar`. Markdown rendering for legislation text.
*   **UX Flow:** Users read the legislation, use ToC or sidebar to jump to sections or articles. Explore related content easily.

### Article Detail Page (`/articles/[id]`)

*   **Purpose & Features:** Display article text, link to parent legislation, show related cases and interpreting operative parts.
*   **Layout & Structure:** Two-column: Main content (article text, key operative parts using `OperativePartToggle`) on the left; `RelatedItemsSidebar` (cases, all operative parts) on the right.
*   **Key UI Elements:** `BreadcrumbNav`, `Card`s, `OperativePartToggle`, `RelatedItemsSidebar`.
*   **UX Flow:** Users read the article, see its context (parent law), and dive into specific legal interpretations (cases, operative parts).

### Case Law Detail Page (`/case-laws/[id]`)

*   **Purpose & Features:** Display case details (summary, full text, metadata), list its operative parts.
*   **Layout & Structure:** Two-column: Main content (case info, summary, full text, list of operative parts using `OperativePartToggle`) on the left; `TableOfContents` and `RelatedItemsSidebar` (focused on the case's own operative parts for easy navigation) on the right.
*   **Key UI Elements:** `BreadcrumbNav`, `Card`s, `OperativePartToggle`, `TableOfContents`, `RelatedItemsSidebar`. HTML rendering for full text.
*   **UX Flow:** Users study the case, use ToC for long texts, and examine each operative part's verbatim/simplified text.

### Reports Pages (`/reports`, `/reports/preview`) (Inferred)

*   **Purpose & Features:** Generate, customize, preview, and export reports.
*   **Layout & Structure (Inferred):** A filter selection page (`ReportFiltersSidebar`), a preview page, and an export dialog (`ExportDialog`).
*   **Key UI Elements (Inferred):** `ReportFiltersSidebar`, `ReportTemplates`, `ExportDialog`, various form controls for filtering.
*   **UX Flow (Inferred):** User configures report -> generates preview -> reviews -> exports in desired format. The flow aims to be guided and customizable.

This guide should provide a solid foundation for understanding the UI and UX of the EU Law Platform.
