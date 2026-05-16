"use client"

import { useState } from "react"
import {
  User,
  MapPin,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  X,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { PotentialMatch, Person } from "@/lib/mock-data"

interface MatchComparisonCardProps {
  match: PotentialMatch
}

function PersonSide({
  person,
  label,
  isFound,
}: {
  person: Person
  label: string
  isFound?: boolean
}) {
  const displayName = person.name || `Unidentified ${person.gender === "male" ? "Male" : "Female"}`

  return (
    <div className="flex-1 rounded-lg border bg-secondary/20 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            isFound
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {label}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {person.caseId}
        </span>
      </div>

      {/* Photo / Avatar */}
      <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-muted">
        {person.photoUrl ? (
          <img
            src={person.photoUrl}
            alt={`Photo of ${displayName}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-12 w-12 text-muted-foreground/40" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Info */}
      <h4 className="font-semibold text-foreground">{displayName}</h4>
      {person.age && (
        <p className="text-sm text-muted-foreground">
          {person.age} years old, {person.gender}
        </p>
      )}

      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="line-clamp-2">{person.location}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            {new Date(person.lastSeenDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
        {person.description}
      </p>
    </div>
  )
}

function VerificationForm({ match, onClose }: { match: PotentialMatch; onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 1500)
  }

  if (isSubmitted) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          Verification Request Submitted
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          A case officer will contact you within 30 minutes to verify your identity
          and begin the reunification process.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Reference: VRQ-{match.id.toUpperCase()}-{Date.now().toString(36).toUpperCase()}
        </p>
        <Button onClick={onClose} className="mt-6">
          Close
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg bg-warning/10 border border-warning/20 p-3">
        <p className="text-sm text-warning-foreground">
          <strong>Important:</strong> Only submit this form if you genuinely believe 
          this is your missing relative. False claims may delay reunification for others.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="verifier-name">Your Full Name *</Label>
          <Input id="verifier-name" placeholder="Enter your full name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="verifier-phone">Phone Number *</Label>
          <Input id="verifier-phone" type="tel" placeholder="+1 (555) 000-0000" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="verifier-email">Email Address *</Label>
        <Input id="verifier-email" type="email" placeholder="your@email.com" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="relationship">Relationship to Missing Person *</Label>
        <Input id="relationship" placeholder="e.g., Parent, Sibling, Spouse" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="identifying-info">
          Identifying Information (to verify identity) *
        </Label>
        <Textarea
          id="identifying-info"
          placeholder="Provide details only a close relative would know: birthmarks, scars, medical conditions, etc."
          rows={3}
          required
        />
      </div>

      <div className="flex gap-3 pt-2">
        <DialogClose asChild>
          <Button type="button" variant="outline" className="flex-1">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" className="flex-1 gap-2" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Submit Verification
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export function MatchComparisonCard({ match }: MatchComparisonCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const confidenceColor =
    match.confidence >= 80
      ? "text-success bg-success/10"
      : match.confidence >= 60
        ? "text-warning bg-warning/10"
        : "text-muted-foreground bg-muted"

  const timeAgo = Math.round(
    (Date.now() - match.createdAt.getTime()) / (1000 * 60)
  )
  const timeLabel =
    timeAgo < 60 ? `${timeAgo}m ago` : `${Math.round(timeAgo / 60)}h ago`

  return (
    <Card className="overflow-hidden border-primary/20">
      <CardHeader className="bg-primary/5 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
            Potential Match Found
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{timeLabel}</span>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold ${confidenceColor}`}
            >
              {match.confidence}% Match
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Side by Side Comparison */}
        <div className="flex gap-4">
          <PersonSide
            person={match.missingPerson}
            label="Reported Missing"
            isFound={false}
          />

          <div className="flex flex-col items-center justify-center px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <ArrowRight className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
          </div>

          <PersonSide
            person={match.foundPerson}
            label="Found Survivor"
            isFound={true}
          />
        </div>

        {/* Matching Features */}
        <div className="mt-4 rounded-lg bg-success/5 border border-success/20 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-success">
            Matching Features
          </p>
          <div className="flex flex-wrap gap-2">
            {match.matchingFeatures.map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success"
              >
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 w-full gap-2" size="lg">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              This is my relative - Begin Verification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Identity Verification Request
              </DialogTitle>
              <DialogDescription>
                Help us verify your relationship to {match.missingPerson.name || "the missing person"}.
                A case officer will contact you to complete the reunification process.
              </DialogDescription>
            </DialogHeader>
            <VerificationForm match={match} onClose={() => setIsOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
