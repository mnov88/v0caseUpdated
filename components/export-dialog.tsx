"use client"

import type React from "react"

import { useState } from "react"
import { Download, FileText, FileSpreadsheet, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ExportManager, type ExportData, type ExportProgress } from "@/lib/export-utils"

interface ExportDialogProps {
  data: ExportData
  trigger?: React.ReactNode
}

export function ExportDialog({ data, trigger }: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null)
  const [exportManager, setExportManager] = useState<ExportManager | null>(null)
  const [selectedFormat, setSelectedFormat] = useState<"csv" | "html" | "word" | "pdf">("csv")
  const [exportOptions, setExportOptions] = useState({
    includeMetadata: true,
    includeFilters: true,
    customTitle: "",
    customSubtitle: "",
    includeOperativeParts: true,
    includeParties: true,
  })

  const handleExport = async (format: "csv" | "html" | "word" | "pdf") => {
    const manager = new ExportManager((progress) => {
      setExportProgress(progress)
    })
    setExportManager(manager)

    try {
      const exportData: ExportData = {
        ...data,
        title: exportOptions.customTitle || data.title,
        subtitle: exportOptions.customSubtitle || data.subtitle,
      }

      // Filter data based on options
      if (!exportOptions.includeOperativeParts) {
        exportData.cases = exportData.cases.map((c) => ({ ...c, operative_parts: [] }))
      }

      if (!exportOptions.includeParties) {
        exportData.cases = exportData.cases.map((c) => ({ ...c, parties: "" }))
      }

      switch (format) {
        case "csv":
          await manager.exportToCSV(exportData)
          break
        case "html":
          await manager.exportToHTML(exportData)
          break
        case "word":
          await manager.exportToWord(exportData)
          break
        case "pdf":
          await manager.exportToPDF(exportData)
          break
      }

      // Close dialog after successful export
      setTimeout(() => {
        setOpen(false)
        setExportProgress(null)
        setExportManager(null)
      }, 2000)
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  const handleCancel = () => {
    if (exportManager) {
      exportManager.cancel()
      setExportProgress(null)
      setExportManager(null)
    }
  }

  const formatOptions = [
    {
      id: "csv",
      name: "CSV",
      description: "Comma-separated values for Excel",
      icon: FileSpreadsheet,
      size: "~50KB",
    },
    {
      id: "html",
      name: "HTML",
      description: "Web page with styling and links",
      icon: FileText,
      size: "~200KB",
    },
    {
      id: "word",
      name: "Word",
      description: "Microsoft Word document",
      icon: FileText,
      size: "~300KB",
    },
    {
      id: "pdf",
      name: "PDF",
      description: "Portable document format",
      icon: FileText,
      size: "~400KB",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>Choose your export format and customize the output options.</DialogDescription>
        </DialogHeader>

        {exportProgress ? (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      {exportProgress.stage === "complete" ? "Export Complete!" : "Exporting..."}
                    </h3>
                    <p className="text-sm text-muted-foreground">{exportProgress.message}</p>
                  </div>
                  {exportProgress.stage !== "complete" && exportProgress.stage !== "error" && (
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                </div>
                <Progress value={exportProgress.progress} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Stage: {exportProgress.stage}</span>
                  <span>{Math.round(exportProgress.progress)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="format" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="format">Format & Options</TabsTrigger>
              <TabsTrigger value="customize">Customize</TabsTrigger>
            </TabsList>

            <TabsContent value="format" className="space-y-4">
              <div>
                <Label className="text-base font-medium">Export Format</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {formatOptions.map((format) => (
                    <Card
                      key={format.id}
                      className={`cursor-pointer transition-colors ${
                        selectedFormat === format.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedFormat(format.id as any)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <format.icon className="h-5 w-5 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium">{format.name}</div>
                            <div className="text-sm text-muted-foreground">{format.description}</div>
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {format.size}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Include in Export</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="metadata"
                      checked={exportOptions.includeMetadata}
                      onCheckedChange={(checked) =>
                        setExportOptions((prev) => ({ ...prev, includeMetadata: !!checked }))
                      }
                    />
                    <Label htmlFor="metadata">Case metadata (court, date, parties)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="operative-parts"
                      checked={exportOptions.includeOperativeParts}
                      onCheckedChange={(checked) =>
                        setExportOptions((prev) => ({ ...prev, includeOperativeParts: !!checked }))
                      }
                    />
                    <Label htmlFor="operative-parts">Operative parts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="parties"
                      checked={exportOptions.includeParties}
                      onCheckedChange={(checked) =>
                        setExportOptions((prev) => ({ ...prev, includeParties: !!checked }))
                      }
                    />
                    <Label htmlFor="parties">Party information</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="filters"
                      checked={exportOptions.includeFilters}
                      onCheckedChange={(checked) =>
                        setExportOptions((prev) => ({ ...prev, includeFilters: !!checked }))
                      }
                    />
                    <Label htmlFor="filters">Applied filters information</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="customize" className="space-y-4">
              <div>
                <Label htmlFor="custom-title">Custom Title</Label>
                <Input
                  id="custom-title"
                  placeholder={data.title}
                  value={exportOptions.customTitle}
                  onChange={(e) => setExportOptions((prev) => ({ ...prev, customTitle: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="custom-subtitle">Custom Subtitle</Label>
                <Textarea
                  id="custom-subtitle"
                  placeholder={data.subtitle || "Add a subtitle..."}
                  value={exportOptions.customSubtitle}
                  onChange={(e) => setExportOptions((prev) => ({ ...prev, customSubtitle: e.target.value }))}
                  rows={3}
                />
              </div>

              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-2">Export Preview</h4>
                  <div className="text-sm space-y-1">
                    <div>
                      <strong>Title:</strong> {exportOptions.customTitle || data.title}
                    </div>
                    {(exportOptions.customSubtitle || data.subtitle) && (
                      <div>
                        <strong>Subtitle:</strong> {exportOptions.customSubtitle || data.subtitle}
                      </div>
                    )}
                    <div>
                      <strong>Cases:</strong> {data.cases.length}
                    </div>
                    <div>
                      <strong>Format:</strong> {selectedFormat.toUpperCase()}
                    </div>
                    <div>
                      <strong>Text:</strong> {data.showSimplified ? "Simplified" : "Full verbatim"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {!exportProgress && (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleExport(selectedFormat)}>
              <Download className="h-4 w-4 mr-2" />
              Export {selectedFormat.toUpperCase()}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ExportDialog
