import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  trend?: "up" | "down" | "neutral"
  icon?: React.ReactNode
  className?: string
}

export function StatCard({ title, value, change, trend, icon, className }: StatCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <TrendIcon
              className={cn(
                "mr-1 h-3 w-3",
                trend === "up" && "text-openTransport-accent",
                trend === "down" && "text-red-600",
                trend === "neutral" && "text-gray-600"
              )}
            />
            {change}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
