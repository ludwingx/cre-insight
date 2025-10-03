import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface QuickActionCardProps {
  title: string
  icon: LucideIcon
  href: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  className?: string
}

export function QuickActionCard({
  title,
  icon: Icon,
  href,
  variant = "default",
  className
}: QuickActionCardProps) {
  return (
    <Button 
      asChild 
      variant={variant} 
      className={cn("h-20 flex-col gap-2", className)}
    >
      <Link href={href}>
        <Icon className="h-6 w-6" />
        <span>{title}</span>
      </Link>
    </Button>
  )
}
