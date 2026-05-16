"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  UserPlus,
  RefreshCw,
  Link2,
  Building,
  Clock,
  Activity,
} from "lucide-react"
import type { ActivityItem } from "@/lib/types"

interface ActivityFeedProps {
  activities: ActivityItem[]
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))

  if (diffMins < 1) return "เมื่อสักครู่"
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} ชม. ที่แล้ว`
  return `${Math.floor(diffHours / 24)} วันที่แล้ว`
}

function getActivityIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "new_report":
      return UserPlus
    case "status_update":
      return RefreshCw
    case "match_found":
      return Link2
    case "shelter_update":
      return Building
    default:
      return Activity
  }
}

function getActivityBadge(type: ActivityItem["type"]) {
  switch (type) {
    case "new_report":
      return { label: "รายงานใหม่", className: "bg-primary/15 text-primary border-primary/30" }
    case "status_update":
      return { label: "อัปเดต", className: "bg-accent/15 text-accent-foreground border-accent/30" }
    case "match_found":
      return { label: "การจับคู่", className: "bg-success/15 text-success border-success/30" }
    case "shelter_update":
      return { label: "ศูนย์พักพิง", className: "bg-muted text-muted-foreground border-border" }
    default:
      return { label: "กิจกรรม", className: "bg-muted text-muted-foreground border-border" }
  }
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Activity className="h-4 w-4 text-primary" aria-hidden="true" />
            กิจกรรมล่าสุด
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </span>
            <span className="text-xs font-medium text-success">สด</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[360px] pr-3">
          <div className="space-y-3" role="feed" aria-label="กิจกรรมล่าสุด">
            {activities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type)
              const badge = getActivityBadge(activity.type)

              return (
                <article
                  key={activity.id}
                  className={cn(
                    "group relative flex gap-3 rounded-lg border border-border/60 bg-card p-3 transition-colors hover:bg-muted/50",
                    index === 0 && "border-primary/30 bg-primary/5"
                  )}
                  aria-label={activity.message}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug text-foreground">
                        {activity.message}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn("shrink-0 text-[10px] px-1.5 py-0", badge.className)}
                      >
                        {badge.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="truncate">{activity.location}</span>
                      {activity.caseId && (
                        <>
                          <span className="text-border">|</span>
                          <span className="font-mono text-[11px]">{activity.caseId}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground/80">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      <time dateTime={activity.timestamp.toISOString()}>
                        {formatTimeAgo(activity.timestamp)}
                      </time>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
