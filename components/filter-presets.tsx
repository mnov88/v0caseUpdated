"use client"

import { useState, useEffect } from "react"
import { Save, Trash2, Filter } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface FilterPreset {
  id: string
  name: string
  description?: string
  filters: {
    dateFrom?: string
    dateTo?: string
    court?: string
    legislation?: string
    article?: string
  }
  createdAt: string
}

interface FilterPresetsProps {
  currentFilters: FilterPreset["filters"]
  onApplyPreset: (filters: FilterPreset["filters"]) => void
}

export function FilterPresets({ currentFilters, onApplyPreset }: FilterPresetsProps) {
  const [presets, setPresets] = useState<FilterPreset[]>([])
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)
  const [presetName, setPresetName] = useState("")
  const [presetDescription, setPresetDescription] = useState("")

  useEffect(() => {
    // Load presets from localStorage
    const savedPresets = localStorage.getItem("eu-law-filter-presets")
    if (savedPresets) {
      setPresets(JSON.parse(savedPresets))
    }
  }, [])

  const savePresets = (newPresets: FilterPreset[]) => {
    setPresets(newPresets)
    localStorage.setItem("eu-law-filter-presets", JSON.stringify(newPresets))
  }

  const saveCurrentFilters = () => {
    if (!presetName.trim()) return

    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      description: presetDescription.trim() || undefined,
      filters: currentFilters,
      createdAt: new Date().toISOString(),
    }

    const newPresets = [...presets, newPreset]
    savePresets(newPresets)

    setPresetName("")
    setPresetDescription("")
    setSaveDialogOpen(false)
  }

  const deletePreset = (id: string) => {
    const newPresets = presets.filter((p) => p.id !== id)
    savePresets(newPresets)
  }

  const applyPreset = (preset: FilterPreset) => {
    onApplyPreset(preset.filters)
    setLoadDialogOpen(false)
  }

  const hasActiveFilters = Object.values(currentFilters).some((value) => value && value.trim() !== "")

  return (
    <div className="flex gap-2">
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={!hasActiveFilters}>
            <Save className="h-4 w-4 mr-2" />
            Save Filters
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter Preset</DialogTitle>
            <DialogDescription>Save your current filter settings for quick access later.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                placeholder="e.g., GDPR Cases 2020-2024"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="preset-description">Description (optional)</Label>
              <Input
                id="preset-description"
                placeholder="Brief description of this filter set"
                value={presetDescription}
                onChange={(e) => setPresetDescription(e.target.value)}
              />
            </div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Current Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  {currentFilters.dateFrom && (
                    <div>
                      <strong>Date From:</strong> {currentFilters.dateFrom}
                    </div>
                  )}
                  {currentFilters.dateTo && (
                    <div>
                      <strong>Date To:</strong> {currentFilters.dateTo}
                    </div>
                  )}
                  {currentFilters.court && (
                    <div>
                      <strong>Court:</strong> {currentFilters.court}
                    </div>
                  )}
                  {currentFilters.legislation && (
                    <div>
                      <strong>Legislation:</strong> {currentFilters.legislation}
                    </div>
                  )}
                  {currentFilters.article && (
                    <div>
                      <strong>Article:</strong> {currentFilters.article}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveCurrentFilters} disabled={!presetName.trim()}>
                Save Preset
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Load Preset
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Load Filter Preset</DialogTitle>
            <DialogDescription>Choose a saved filter preset to apply to your search.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {presets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No saved presets yet.</p>
                <p className="text-sm">Save your current filters to create your first preset.</p>
              </div>
            ) : (
              presets.map((preset) => (
                <Card key={preset.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{preset.name}</CardTitle>
                        {preset.description && <CardDescription>{preset.description}</CardDescription>}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deletePreset(preset.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {preset.filters.dateFrom && <Badge variant="secondary">From: {preset.filters.dateFrom}</Badge>}
                      {preset.filters.dateTo && <Badge variant="secondary">To: {preset.filters.dateTo}</Badge>}
                      {preset.filters.court && <Badge variant="secondary">Court: {preset.filters.court}</Badge>}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Created: {new Date(preset.createdAt).toLocaleDateString()}
                      </span>
                      <Button size="sm" onClick={() => applyPreset(preset)}>
                        Apply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FilterPresets
