"use client"

import { AlertTriangle, Flame, Droplets, Mountain, Wind, CircleDot } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useIncident } from "@/context/incident-context"
import { getIncidentStatusLabel } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { IncidentType, IncidentStatus } from "@/lib/types"

function getIncidentTypeIcon(type: IncidentType) {
  switch (type) {
    case "fire":
      return Flame
    case "flood":
      return Droplets
    case "landslide":
      return Mountain
    case "storm":
      return Wind
    case "earthquake":
      return AlertTriangle
    default:
      return CircleDot
  }
}

function getStatusColor(status: IncidentStatus) {
  switch (status) {
    case "active":
      return "bg-destructive/10 text-destructive"
    case "monitoring":
      return "bg-warning/10 text-warning-foreground"
    case "resolved":
      return "bg-success/10 text-success"
    default:
      return "bg-muted text-muted-foreground"
  }
}

interface IncidentSelectorProps {
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  label?: string
  showOnlyActive?: boolean
}

export function IncidentSelector({
  value,
  onChange,
  error,
  required = true,
  label = "เหตุการณ์ที่เกี่ยวข้อง",
  showOnlyActive = true,
}: IncidentSelectorProps) {
  const { incidents, activeIncidents, isLoading } = useIncident()

  const displayIncidents = showOnlyActive ? activeIncidents : incidents

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="incident-selector" className={error ? "text-destructive" : ""}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id="incident-selector"
          className={cn("h-11", error && "border-destructive focus:ring-destructive")}
        >
          <SelectValue placeholder="กรุณาเลือกเหตุการณ์" />
        </SelectTrigger>
        <SelectContent>
          {displayIncidents.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              ไม่มีเหตุการณ์ที่กำลังดำเนินการ
            </div>
          ) : (
            displayIncidents.map((incident) => {
              const Icon = getIncidentTypeIcon(incident.incidentType)
              return (
                <SelectItem key={incident.incidentId} value={incident.incidentId}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">{incident.incidentName}</span>
                    <Badge
                      variant="secondary"
                      className={cn("text-[10px] px-1.5 py-0", getStatusColor(incident.incidentStatus))}
                    >
                      {getIncidentStatusLabel(incident.incidentStatus)}
                    </Badge>
                  </div>
                </SelectItem>
              )
            })
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {value && (
        <p className="text-xs text-muted-foreground">
          {(() => {
            const incident = incidents.find((i) => i.incidentId === value)
            return incident ? `${incident.province} - ${incident.location}` : ""
          })()}
        </p>
      )}
    </div>
  )
}
