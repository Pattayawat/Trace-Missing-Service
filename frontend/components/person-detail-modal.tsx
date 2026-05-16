"use client"

import {
  User,
  MapPin,
  Calendar,
  Phone,
  X,
  Share2,
  Printer,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Person } from "@/lib/mock-data"
import { useEffect, useRef } from "react"

interface PersonDetailModalProps {
  person: Person | null
  onClose: () => void
}

export function PersonDetailModal({ person, onClose }: PersonDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (person) {
      closeButtonRef.current?.focus()
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [person])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [onClose])

  if (!person) return null

  const displayName =
    person.name ||
    `${person.gender === "male" ? "ผู้ชาย" : person.gender === "female" ? "ผู้หญิง" : "บุคคล"}ไม่ทราบตัวตน`

  const statusConfig = {
    missing: {
      label: "คนหาย",
      className: "bg-destructive text-destructive-foreground",
      icon: AlertTriangle,
    },
    found: {
      label: "พบแล้ว",
      className: "bg-primary text-primary-foreground",
      icon: null,
    },
    safe: {
      label: "ปลอดภัย",
      className: "bg-success text-success-foreground",
      icon: null,
    },
    unidentified: {
      label: "ไม่ทราบตัวตน",
      className: "bg-muted text-muted-foreground",
      icon: null,
    },
  }

  const { label: statusLabel, className: statusClass } =
    statusConfig[person.status]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl bg-card shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-card p-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              เคสหมายเลข #{person.caseId}
            </p>
            <h2 id="modal-title" className="text-xl font-semibold text-foreground">
              {displayName}
            </h2>
          </div>
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="ปิดรายละเอียด"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-6 sm:flex-row">
            {/* Photo */}
            <div className="shrink-0">
              <div className="relative aspect-[3/4] w-full sm:w-48 overflow-hidden rounded-lg bg-muted">
                {person.photoUrl ? (
                  <img
                    src={person.photoUrl}
                    alt={`รูปภาพของ ${displayName}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="h-20 w-20 text-muted-foreground/40" />
                  </div>
                )}
                <div className="absolute bottom-2 left-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${statusClass}`}
                  >
                    {statusLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    อายุ
                  </p>
                  <p className="text-base text-foreground">
                    {person.age ? `${person.age} ปี` : "ไม่ทราบ"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    เพศ
                  </p>
                  <p className="text-base capitalize text-foreground">
                    {person.gender === "male" ? "ชาย" : person.gender === "female" ? "หญิง" : "ไม่ระบุ"}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {person.type === "missing-person"
                    ? "สถานที่พบเห็นล่าสุด"
                    : "สถานที่ปัจจุบัน"}
                </p>
                <div className="mt-1 flex items-start gap-2 text-foreground">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
                  <span>{person.location}</span>
                </div>
              </div>

              {/* Date */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {person.type === "missing-person"
                    ? "วันที่พบเห็นล่าสุด"
                    : "วันที่รายงาน"}
                </p>
                <div className="mt-1 flex items-center gap-2 text-foreground">
                  <Calendar size={16} className="shrink-0 text-primary" />
                  <span>
                    {new Date(person.lastSeenDate).toLocaleDateString("th-TH", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  รายละเอียด/ลักษณะเด่น
                </p>
                <p className="mt-1 text-foreground">{person.description}</p>
              </div>

              {/* Contact */}
              {person.contactPhone && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-primary">
                    ข้อมูลการติดต่อ
                  </p>
                  <a
                    href={`tel:${person.contactPhone}`}
                    className="inline-flex items-center gap-2 text-lg font-semibold text-primary hover:underline"
                  >
                    <Phone size={18} />
                    {person.contactPhone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Warning for missing */}
          {person.status === "missing" && (
            <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">
                    บุคคลนี้ได้รับการรายงานว่าหายตัวไป
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    หากท่านมีเบาะแสเกี่ยวกับบุคคลนี้ โปรดติดต่อหมายเลขด้านบนหรือเจ้าหน้าที่ในพื้นที่ทันที
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 border-t bg-muted/30 p-4">
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 size={14} />
            แชร์
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Printer size={14} />
            พิมพ์
          </Button>
          {person.contactPhone && (
            <Button asChild size="sm" className="gap-2">
              <a href={`tel:${person.contactPhone}`}>
                <Phone size={14} />
                โทรเลย
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
