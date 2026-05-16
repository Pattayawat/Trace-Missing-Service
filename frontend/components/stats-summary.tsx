"use client"

import { Users, AlertTriangle, Heart, HelpCircle } from "lucide-react"

interface StatsSummaryProps {
  totalMissing: number
  totalFound: number
  totalSafe: number
  totalUnidentified: number
}

export function StatsSummary({
  totalMissing,
  totalFound,
  totalSafe,
  totalUnidentified,
}: StatsSummaryProps) {
  const stats = [
    {
      label: "คนหาย",
      value: totalMissing,
      icon: AlertTriangle,
      className: "border-destructive/30 bg-destructive/5",
      iconClass: "text-destructive",
      valueClass: "text-destructive",
    },
    {
      label: "พบแล้ว",
      value: totalFound,
      icon: Users,
      className: "border-primary/30 bg-primary/5",
      iconClass: "text-primary",
      valueClass: "text-primary",
    },
    {
      label: "ผู้รอดชีวิต",
      value: totalSafe,
      icon: Heart,
      className: "border-success/30 bg-success/5",
      iconClass: "text-success",
      valueClass: "text-success",
    },
    {
      label: "ไม่ทราบตัวตน",
      value: totalUnidentified,
      icon: HelpCircle,
      className: "border-border bg-muted/50",
      iconClass: "text-muted-foreground",
      valueClass: "text-muted-foreground",
    },
  ]

  return (
    <div
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      role="region"
      aria-label="สรุปสถิติ"
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`flex items-center gap-3 rounded-xl border p-4 ${stat.className}`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg bg-card shadow-sm ${stat.iconClass}`}
          >
            <stat.icon size={20} aria-hidden="true" />
          </div>
          <div>
            <p className={`text-2xl font-bold ${stat.valueClass}`}>
              {stat.value}
            </p>
            <p className="text-xs font-medium text-muted-foreground">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
