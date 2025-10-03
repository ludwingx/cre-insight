import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  iconColor?: string
  valueColor?: string
  trend?: {
    value: string
    isPositive: boolean
  }
  className?: string
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = "text-muted-foreground",
  valueColor = "text-foreground",
  trend,
  className
}: MetricCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">{title}</h3>
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
        <div className={cn("text-2xl font-bold", valueColor)}>{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <p className={cn(
            "text-xs",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
            {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
