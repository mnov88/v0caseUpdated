"use client"

import { useEffect, useState } from "react"
import { Eye, Type, Contrast, Volume2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface AccessibilitySettings {
  fontSize: number
  highContrast: boolean
  reducedMotion: boolean
  screenReader: boolean
}

export function AccessibilityFeatures() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 100,
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
  })

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem("accessibility-settings")
    if (saved) {
      setSettings(JSON.parse(saved))
    }

    // Detect system preferences
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const prefersHighContrast = window.matchMedia("(prefers-contrast: high)").matches

    if (prefersReducedMotion || prefersHighContrast) {
      setSettings((prev) => ({
        ...prev,
        reducedMotion: prefersReducedMotion,
        highContrast: prefersHighContrast,
      }))
    }
  }, [])

  useEffect(() => {
    // Apply settings to document
    const root = document.documentElement

    // Font size
    root.style.fontSize = `${settings.fontSize}%`

    // High contrast
    if (settings.highContrast) {
      root.classList.add("high-contrast")
    } else {
      root.classList.remove("high-contrast")
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add("reduce-motion")
    } else {
      root.classList.remove("reduce-motion")
    }

    // Save settings
    localStorage.setItem("accessibility-settings", JSON.stringify(settings))
  }, [settings])

  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const resetSettings = () => {
    setSettings({
      fontSize: 100,
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="fixed bottom-4 left-4 z-50">
          <Eye className="h-4 w-4" />
          <span className="sr-only">Accessibility Options</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Accessibility
            </CardTitle>
            <CardDescription>Customize the interface to meet your accessibility needs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Font Size: {settings.fontSize}%
              </Label>
              <Slider
                value={[settings.fontSize]}
                onValueChange={([value]) => updateSetting("fontSize", value)}
                min={75}
                max={150}
                step={5}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="high-contrast" className="flex items-center gap-2">
                <Contrast className="h-4 w-4" />
                High Contrast
              </Label>
              <Switch
                id="high-contrast"
                checked={settings.highContrast}
                onCheckedChange={(checked) => updateSetting("highContrast", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="reduced-motion" className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Reduce Motion
              </Label>
              <Switch
                id="reduced-motion"
                checked={settings.reducedMotion}
                onCheckedChange={(checked) => updateSetting("reducedMotion", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="screen-reader" className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Screen Reader Mode
              </Label>
              <Switch
                id="screen-reader"
                checked={settings.screenReader}
                onCheckedChange={(checked) => updateSetting("screenReader", checked)}
              />
            </div>

            <Button variant="outline" onClick={resetSettings} className="w-full">
              Reset to Defaults
            </Button>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
