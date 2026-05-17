"use client"

import { User, MapPin, Calendar, Phone, Eye, AlertTriangle } from "lucide-react"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useIncident } from "@/context/incident-context"
import type { Person } from "@/lib/types"

interface PersonCardProps {
  person: Person
  onViewDetails: (person: Person) => void
  onContact?: (person: Person) => void
}

function StatusBadge({ status }: { status: Person["status"] }) {
  const config: Record<string, { label: string, className: string }> = {
    missing: {
      label: "คนหาย",
      className: "bg-destructive text-destructive-foreground",
    },
    found: {
      label: "พบแล้ว",
      className: "bg-primary text-primary-foreground",
    },
    safe: {
      label: "ปลอดภัย",
      className: "bg-success text-success-foreground",
    },
    unidentified: {
      label: "ไม่ทราบตัวตน",
      className: "bg-muted text-muted-foreground",
    },
    investigating: {
      label: "กำลังตรวจสอบ",
      className: "bg-warning text-warning-foreground",
    },
    matching: {
      label: "กำลังจับคู่",
      className: "bg-info text-info-foreground",
    },
    closed: {
      label: "ปิดเคสแล้ว",
      className: "bg-slate-600 text-white",
    },
  }

  const current = config[status] || { label: status, className: "bg-muted text-muted-foreground" }
  const { label, className } = current

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${className}`}
      role="status"
      aria-label={`สถานะ: ${label}`}
    >
      {label}
    </span>
  )
}

function TypeBadge({ type }: { type: Person["type"] }) {
  const config = {
    "missing-person": {
      label: "คนหาย",
      className: "bg-destructive/10 text-destructive border-destructive/20",
    },
    "unidentified-body": {
      label: "ไม่ทราบตัวตน",
      className: "bg-muted text-muted-foreground border-border",
    },
    survivor: {
      label: "ผู้รอดชีวิต",
      className: "bg-success/10 text-success border-success/20",
    },
  }

  const { label, className } = config[type]

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${className}`}
    >
      {label}
    </span>
  )
}

export function PersonCard({
  person,
  onViewDetails,
  onContact,
}: PersonCardProps) {
  const { getIncidentById } = useIncident()
  const incident = getIncidentById(person.incidentId)
  
  const displayName = person.name || `${person.gender === "male" ? "ผู้ชาย" : person.gender === "female" ? "ผู้หญิง" : "บุคคล"}ไม่ทราบตัวตน`

  // Map ageGroup values to Thai labels
  const ageGroupLabels: Record<string, string> = {
    infant: "ทารก",
    child: "เด็ก",
    teen: "วัยรุ่น",
    "young-adult": "ผู้ใหญ่ตอนต้น",
    "middle-aged": "วัยกลางคน",
    elderly: "ผู้สูงอายุ",
    ADULT: "ผู้ใหญ่",
    CHILD: "เด็ก"
  }

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/30 py-0">
      {/* Urgent indicator for missing persons */}
      {person.status === "missing" && (
        <div
          className="absolute inset-x-0 top-0 h-1 bg-destructive"
          aria-hidden="true"
        />
      )}

      <CardContent className="p-0">
        {/* Photo / Avatar Section */}
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {person.photoUrl ? (
            <img
              src={person.photoUrl}
              alt={`รูปภาพของ ${displayName}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center bg-secondary"
              aria-label="ไม่มีรูปภาพ"
            >
              <User
                className="h-16 w-16 text-muted-foreground/50"
                aria-hidden="true"
              />
            </div>
          )}

          {/* Status Badge Overlay */}
          <div className="absolute top-3 left-3">
            <StatusBadge status={person.status} />
          </div>

          {/* Case ID */}
          <div className="absolute bottom-3 right-3">
            <span className="rounded bg-foreground/80 px-2 py-1 text-xs font-mono text-background">
              {person.caseId}
            </span>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold text-foreground">
                {displayName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {ageGroupLabels[person.ageGroup || ""] || "ไม่ระบุช่วงวัย"}, {person.gender === "male" ? "ชาย" : person.gender === "female" ? "หญิง" : "ไม่ระบุเพศ"}
              </p>
            </div>
            <TypeBadge type={person.type} />
          </div>

          <div className="mb-4 space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <MapPin
                size={14}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <span className="line-clamp-2">{person.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="shrink-0" aria-hidden="true" />
              <span>
                {new Date(person.lastSeenDate).toLocaleDateString("th-TH", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            {incident && (
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="shrink-0 text-primary" aria-hidden="true" />
                <span className="truncate text-xs">{incident.incidentName}</span>
              </div>
            )}
          </div>

          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {person.description}
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={() => onViewDetails(person)}
            >
              <Eye size={14} aria-hidden="true" />
              ดูรายละเอียด
            </Button>
            {person.contactPhone && onContact && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => onContact(person)}
                aria-label={`ติดต่อญาติของ ${displayName}`}
              >
                <Phone size={14} aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">ติดต่อ</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
