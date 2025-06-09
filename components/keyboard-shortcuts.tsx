"use client"

import { useEffect, useState } from "react"
import { Command, Search, Home, FileText, Gavel, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export function KeyboardShortcuts() {
  const [showDialog, setShowDialog] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      }

      // Cmd/Ctrl + / for help
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault()
        setShowDialog(true)
      }

      // Navigation shortcuts
      if (e.altKey) {
        switch (e.key) {
          case "h":
            e.preventDefault()
            router.push("/")
            break
          case "s":
            e.preventDefault()
            router.push("/search")
            break
          case "l":
            e.preventDefault()
            router.push("/legislations")
            break
          case "c":
            e.preventDefault()
            router.push("/case-laws")
            break
          case "r":
            e.preventDefault()
            router.push("/reports")
            break
        }
      }

      // Escape to close dialogs
      if (e.key === "Escape") {
        setShowDialog(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [router])

  const shortcuts = [
    {
      keys: ["⌘", "K"],
      description: "Focus search bar",
      icon: Search,
    },
    {
      keys: ["⌘", "/"],
      description: "Show keyboard shortcuts",
      icon: Command,
    },
    {
      keys: ["Alt", "H"],
      description: "Go to home",
      icon: Home,
    },
    {
      keys: ["Alt", "L"],
      description: "Go to legislations",
      icon: FileText,
    },
    {
      keys: ["Alt", "C"],
      description: "Go to case laws",
      icon: Gavel,
    },
    {
      keys: ["Alt", "R"],
      description: "Go to reports",
      icon: BarChart3,
    },
  ]

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>Use these keyboard shortcuts to navigate the platform more efficiently.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <shortcut.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{shortcut.description}</span>
              </div>
              <div className="flex gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <Badge key={keyIndex} variant="outline" className="text-xs">
                    {key}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground mt-4">
          <p>
            Press{" "}
            <Badge variant="outline" className="text-xs">
              Esc
            </Badge>{" "}
            to close this dialog.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
