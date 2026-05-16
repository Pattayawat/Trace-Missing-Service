"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface MetricCardProps {
  title: string
  value: number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    direction: "up" | "down"
    label: string
  }
  variant: "danger" | "success" | "warning" | "neutral" | "primary"
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant,
}: MetricCardProps) {
  const variantStyles = {
    danger: {
      card: "border-destructive/40 bg-destructive/5",
      iconBg: "bg-destructive/15",
      iconColor: "text-destructive",
      valueColor: "text-destructive",
    },
    success: {
      card: "border-success/40 bg-success/5",
      iconBg: "bg-success/15",
      iconColor: "text-success",
      valueColor: "text-success",
    },
    warning: {
      card: "border-accent/40 bg-accent/5",
      iconBg: "bg-accent/15",
      iconColor: "text-accent-foreground",
      valueColor: "text-accent-foreground",
    },
    neutral: {
      card: "border-border bg-muted/30",
      iconBg: "bg-muted",
      iconColor: "text-muted-foreground",
      valueColor: "text-muted-foreground",
    },
    primary: {
      card: "border-primary/40 bg-primary/5",
      iconBg: "bg-primary/15",
      iconColor: "text-primary",
      valueColor: "text-primary",
    },
  }

  const styles = variantStyles[variant]

  return (
    <Card className={cn("shadow-sm", styles.card)}>
      <CardContent className="p-4 lg:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {title}
            </p>
            <p className={cn("mt-1 text-3xl font-bold tabular-nums", styles.valueColor)}>
              {value.toLocaleString()}
            </p>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className="mt-2 flex items-center gap-1 text-xs">
                {trend.direction === "up" ? (
                  <TrendingUp className="h-3 w-3 text-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                )}
                <span
                  className={
                    trend.direction === "up"
                      ? "text-success"
                      : "text-destructive"
                  }
                >
                  {trend.value}%
                </span>
                <span className="text-muted-foreground">{trend.label}</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              styles.iconBg
            )}
          >
            <Icon className={cn("h-5 w-5", styles.iconColor)} aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
