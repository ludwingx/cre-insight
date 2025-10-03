import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActivityItemProps {
  title: string
  description: string
  value?: string
  timestamp: string
  icon: LucideIcon
  iconColor?: string
  className?: string
}

export function ActivityItem({
  title,
  description,
  value,
  timestamp,
  icon: Icon,
  iconColor = "text-muted-foreground",
  className
}: ActivityItemProps) {
  return (
    <div className={cn("flex items-center justify-between py-3 border-b last:border-b-0", className)}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          iconColor.includes("green") ? "bg-green-100" :
          iconColor.includes("blue") ? "bg-blue-100" :
          iconColor.includes("orange") ? "bg-orange-100" :
          iconColor.includes("purple") ? "bg-purple-100" :
          iconColor.includes("red") ? "bg-red-100" :
          "bg-gray-100"
        )}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="text-right">
        {value && <p className="text-sm font-medium">{value}</p>}
        <p className="text-xs text-muted-foreground">{timestamp}</p>
      </div>
    </div>
  )
}
