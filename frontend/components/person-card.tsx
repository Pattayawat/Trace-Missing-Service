"use client"

import { User, MapPin, Calendar, Phone, Eye } from "lucide-react"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Person } from "@/lib/mock-data"

interface PersonCardProps {
  person: Person
  onViewDetails: (person: Person) => void
  onContact?: (person: Person) => void
}

function StatusBadge({ status }: { status: Person["status"] }) {
  const config = {
    missing: {
      label: "Missing",
      className: "bg-destructive text-destructive-foreground",
    },
    found: {
      label: "Found",
      className: "bg-primary text-primary-foreground",
    },
    safe: {
      label: "Safe",
      className: "bg-success text-success-foreground",
    },
    unidentified: {
      label: "Unidentified",
      className: "bg-muted text-muted-foreground",
    },
  }

  const { label, className } = config[status]

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${className}`}
      role="status"
      aria-label={`Status: ${label}`}
    >
      {label}
    </span>
  )
}

function TypeBadge({ type }: { type: Person["type"] }) {
  const config = {
    "missing-person": {
      label: "Missing Person",
      className: "bg-destructive/10 text-destructive border-destructive/20",
    },
    "unidentified-body": {
      label: "Unidentified",
      className: "bg-muted text-muted-foreground border-border",
    },
    survivor: {
      label: "Survivor",
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
  const displayName = person.name || `Unidentified ${person.gender === "male" ? "Male" : person.gender === "female" ? "Female" : "Person"}`

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
              alt={`Photo of ${displayName}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center bg-secondary"
              aria-label="No photo available"
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
              {person.age && (
                <p className="text-sm text-muted-foreground">
                  {person.age} years old, {person.gender}
                </p>
              )}
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
                {new Date(person.lastSeenDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
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
              View Details
            </Button>
            {person.contactPhone && onContact && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => onContact(person)}
                aria-label={`Contact relative of ${displayName}`}
              >
                <Phone size={14} aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">Contact</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
