import { SearchBar } from "@/components/search-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Gavel, Scale, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">EU Law Platform</h1>
        <p className="text-xl text-muted-foreground">
          Search, browse, and analyze EU legislation, articles, and case law
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <SearchBar />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <Scale className="h-8 w-8 text-primary" />
            <CardTitle>Legislations</CardTitle>
            <CardDescription>Browse EU regulations and directives with full text and metadata</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <FileText className="h-8 w-8 text-primary" />
            <CardTitle>Articles</CardTitle>
            <CardDescription>Explore individual articles with related cases and interpretations</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <Gavel className="h-8 w-8 text-primary" />
            <CardTitle>Case Laws</CardTitle>
            <CardDescription>Access court decisions with operative parts and case summaries</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <BarChart3 className="h-8 w-8 text-primary" />
            <CardTitle>Reports</CardTitle>
            <CardDescription>Generate comprehensive reports and export data for analysis</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>Get started with the EU Law Platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Search Everything</h3>
              <p className="text-sm text-muted-foreground">
                Use the search bar above to find legislations, articles, cases, and operative parts across the entire
                database.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Browse by Type</h3>
              <p className="text-sm text-muted-foreground">
                Navigate through the sidebar to browse specific document types and explore related content.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">View Relationships</h3>
              <p className="text-sm text-muted-foreground">
                Each document shows related items - cases interpreting articles, operative parts mentioning legislation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Generate Reports</h3>
              <p className="text-sm text-muted-foreground">
                Create comprehensive reports for any regulation or article and export them as CSV or Excel files.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
