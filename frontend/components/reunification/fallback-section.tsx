"use client"

import { useState } from "react"
import {
  Plus,
  Bell,
  Search,
  Mail,
  Phone,
  User,
  Shirt,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

export function FallbackSection() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubscribed(true)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="rounded-lg bg-warning/10 border border-warning/20 p-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-warning-foreground">
          <Search className="h-5 w-5" aria-hidden="true" />
          Can&apos;t Find Your Loved One?
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Don&apos;t worry - there are several ways we can help you locate your family member.
        </p>
      </div>

      {/* Report New Missing Person CTA */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <Plus className="h-6 w-6 text-destructive" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-foreground">
                Report a New Missing Person
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                If your loved one hasn&apos;t been reported yet, create a detailed report 
                to add them to our system and enable automatic matching.
              </p>
              <Button asChild className="mt-4 gap-2" variant="destructive">
                <Link href="/report">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Report Missing Person Now
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Notification Request Form */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-5 w-5 text-primary" aria-hidden="true" />
            Subscribe to Match Alerts
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Receive automatic SMS/Email notifications if a matching profile is added
          </p>
        </CardHeader>
        <CardContent>
          {isSubscribed ? (
            <div className="rounded-lg bg-success/10 border border-success/20 p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <h4 className="font-semibold text-foreground">
                Alert Subscription Active
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                You will receive notifications when potential matches are found.
                Check your email for confirmation.
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Subscription ID: SUB-{Date.now().toString(36).toUpperCase()}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="relative-name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Relative&apos;s Name
                </Label>
                <Input
                  id="relative-name"
                  placeholder="Full name of missing person"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <Shirt className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Physical Description / Clothing / Age
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe physical features, last known clothing, approximate age, distinguishing marks..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    Your Phone
                  </Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    Your Email
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4" aria-hidden="true" />
                    Subscribe to Match Alerts
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Manual Search Board Link */}
      <Card className="border-border bg-secondary/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-foreground">
                Browse All Public Postings
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Manually search through all survivor and unidentified photos in case 
                the automated system hasn&apos;t matched them yet.
              </p>
              <Button asChild variant="outline" className="mt-4 gap-2">
                <Link href="/">
                  <Search className="h-4 w-4" aria-hidden="true" />
                  Open Search Board
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
