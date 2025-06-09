# EU Law Platform

## Description

The EU Law Platform is a web application designed for searching, browsing, and analyzing European Union (EU) legislation, legal articles, and case law. It provides a user-friendly interface to access complex legal information, view relationships between different legal documents, and generate reports.

The project is built with Next.js, TypeScript, and uses Supabase as its backend database.

## Key Features

*   **Comprehensive Search:**
    *   Search across Legislations, Articles, Case Laws, and Operative Parts.
    *   Dynamic search suggestions.
    *   Recent and popular search history.
*   **Browse Functionality:**
    *   Dedicated sections for browsing Legislations and Case Laws.
    *   Easy navigation to related articles and other documents.
*   **Detailed Document Views:**
    *   View full text and metadata for Legislations.
    *   Access individual Articles with their content and links to related cases.
    *   Explore Case Laws with summaries, operative parts, and judgment details.
*   **Relationship Mapping:**
    *   Visualize connections: articles within legislations, case laws interpreting articles, etc.
*   **Reporting & Export:**
    *   Generate reports based on selected criteria (e.g., for a specific regulation).
    *   Export data in formats like CSV or DOCX (deduced from dependencies).
*   **User Interface & Experience:**
    *   Responsive design for desktop and mobile devices.
    *   Intuitive sidebar and breadcrumb navigation.
    *   Support for light/dark themes.
    *   Loading states, error handling, keyboard shortcuts, and accessibility features.

## Tech Stack

*   **Frontend:**
    *   Next.js (v15+) with App Router
    *   React (v19+)
    *   TypeScript
    *   Tailwind CSS
    *   Shadcn/UI (likely, based on component structure and `components.json`)
    *   Lucide Icons
*   **Backend & Database:**
    *   Supabase (PostgreSQL)
*   **Key Libraries:**
    *   `@supabase/supabase-js` (Supabase client)
    *   `date-fns` (date utility)
    *   `jspdf`, `docx` (document export)
    *   Various Radix UI components for UI primitives.
*   **Package Manager:**
    *   PNPM (recommended)

## Getting Started

### Prerequisites

*   Node.js (v18.x or later recommended)
*   PNPM (recommended), or NPM / Yarn
*   A Supabase project. You can create one at [supabase.com](https://supabase.com/).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:**
    *   Using PNPM (recommended):
        ```bash
        pnpm install
        ```
    *   Or using NPM:
        ```bash
        npm install
        ```
    *   Or using Yarn:
        ```bash
        yarn install
        ```

3.  **Set up environment variables:**
    *   Create a file named `.env.local` in the root of the project.
    *   Add your Supabase project URL and anon key:
        ```env
        NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
        NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
        ```
    *   Replace `your_supabase_project_url` and `your_supabase_anon_key` with your actual Supabase credentials.

### Database Setup

The database schema is defined in SQL scripts. You need to run these against your Supabase database.

1.  **Navigate to your Supabase Project Dashboard.**
2.  Go to the **SQL Editor** section.
3.  **Create Tables:**
    *   Open the `scripts/create-tables.sql` file from this repository.
    *   Copy its content and paste it into the Supabase SQL editor.
    *   Run the query to create all necessary tables, relationships, and indexes.
4.  **Seed Sample Data (Optional but Recommended for Development):**
    *   Open the `scripts/seed-sample-data.sql` file.
    *   Copy its content and paste it into the Supabase SQL editor.
    *   Run the query. This will populate your database with initial data, making it easier to test the application.

### Running the Development Server

```bash
pnpm dev
```
Or `npm run dev` / `yarn dev`.

The application should now be running at `http://localhost:3000`.

## Available Scripts

*   `pnpm dev`: Starts the development server.
*   `pnpm build`: Builds the application for production.
*   `pnpm start`: Starts the production server (after building).
*   `pnpm lint`: Runs ESLint to lint the codebase.

## Project Structure

Here's a high-level overview of the directory structure:

*   **`/app`**: Next.js App Router directory. Contains all routes, pages, and layouts.
    *   `app/articles/[id]`: Dynamic route for individual articles.
    *   `app/case-laws`: Routes related to case laws.
    *   `app/legislations`: Routes related to legislations.
    *   `app/reports`: Routes for generating and viewing reports.
    *   `app/search`: Route for search functionality.
    *   `layout.tsx`: The main application layout.
    *   `page.tsx`: The main homepage component.
*   **`/components`**: Reusable React components.
    *   `components/ui/`: Generic UI primitives (Button, Card, Input, etc.).
    *   Application-specific components like `app-sidebar.tsx`, `search-bar.tsx`.
*   **`/hooks`**: Custom React hooks (e.g., `use-mobile.tsx`).
*   **`/lib`**: Utility functions and modules.
    *   `lib/database.ts`: Data fetching and database interaction logic.
    *   `lib/supabase.ts`: Supabase client initialization.
*   **`/public`**: Static assets (images, fonts, etc.).
*   **`/scripts`**: Database scripts.
    *   `scripts/create-tables.sql`: Database schema definition.
    *   `scripts/seed-sample-data.sql`: Sample data for the database.
*   **Root Directory Files:**
    *   `next.config.mjs`: Next.js configuration.
    *   `tailwind.config.ts`: Tailwind CSS configuration.
    *   `tsconfig.json`: TypeScript configuration.
    *   `package.json`: Project dependencies and scripts.

## Additional Documentation

For more detailed information on specific aspects of the project, please refer to the following guides:

*   **[Developer Guide (DEVELOPMENT_GUIDE.md)](./DEVELOPMENT_GUIDE.md):** In-depth details on architecture, data flow, state management, API interaction, and other technical aspects.
*   **[UI/UX Guide (UI_UX_GUIDE.md)](./UI_UX_GUIDE.md):** An overview of the application's UI layout, global components, key reusable UI elements, and a page-by-page breakdown of features and user experience.

## Contributing

(Placeholder: Contributions are welcome. Please follow standard coding practices and ensure tests pass. Consider adding more specific guidelines if needed.)

## License

(Placeholder: Specify a license, e.g., MIT License. If no license is chosen, it defaults to exclusive copyright.)