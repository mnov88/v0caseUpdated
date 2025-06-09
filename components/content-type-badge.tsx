import { Badge } from "@/components/ui/badge"
import { FileText, Gavel, Scale, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContentTypeBadgeProps {
  type: "legislation" | "article" | "case_law" | "operative_part"
  variant?: "default" | "secondary" | "outline"
  showIcon?: boolean
  className?: string
}

export function ContentTypeBadge({ type, variant = "default", showIcon = true, className }: ContentTypeBadgeProps) {
  const config = {
    legislation: {
      label: "Legislation",
      icon: Scale,
      color: "bg-blue-100 text-blue-800 border-blue-200",
    },
    article: {
      label: "Article",
      icon: BookOpen,
      color: "bg-green-100 text-green-800 border-green-200",
    },
    case_law: {
      label: "Case Law",
      icon: Gavel,
      color: "bg-purple-100 text-purple-800 border-purple-200",
    },
    operative_part: {
      label: "Operative Part",
      icon: FileText,
      color: "bg-orange-100 text-orange-800 border-orange-200",
    },
  }

  const { label, icon: Icon, color } = config[type]

  return (
    <Badge variant={variant} className={cn(variant === "default" && color, "flex items-center gap-1", className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      {label}
    </Badge>
  )
}
