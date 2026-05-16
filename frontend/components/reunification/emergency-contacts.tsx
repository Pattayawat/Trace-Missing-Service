"use client"

import { Phone, Clock, MessageCircle, AlertTriangle, Shield, Heart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { emergencyContacts, type EmergencyContact } from "@/lib/mock-data"

function PriorityIcon({ priority }: { priority: EmergencyContact["priority"] }) {
  if (priority === "critical") {
    return <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
  }
  if (priority === "high") {
    return <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
  }
  return <Heart className="h-5 w-5 text-success" aria-hidden="true" />
}

export function EmergencyContacts() {
  return (
    <div className="space-y-6">
      {/* Emergency Hotline Directory */}
      <Card className="border-destructive/30 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5 text-destructive" aria-hidden="true" />
            Emergency Hotline Directory
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Click any number to call directly
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {emergencyContacts.map((contact) => (
            <div
              key={contact.id}
              className="rounded-lg border bg-secondary/30 p-3 transition-colors hover:bg-secondary/50"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <PriorityIcon priority={contact.priority} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-foreground">
                      {contact.name}
                    </h4>
                    {contact.priority === "critical" && (
                      <span className="rounded bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                        Critical
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {contact.description}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {contact.available}
                    </span>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    variant={contact.priority === "critical" ? "destructive" : "default"}
                    className="mt-3 w-full gap-2"
                  >
                    <a href={`tel:${contact.phone.replace(/[^0-9]/g, "")}`}>
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      Call {contact.phone}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Live Chat Support Widget */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5 text-primary" aria-hidden="true" />
            Live Support Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border-2 border-dashed border-primary/20 bg-primary/5 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <MessageCircle className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <h4 className="font-semibold text-foreground">
              Chat with a Response Agent
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Get immediate assistance from trained disaster response personnel
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              <span className="text-xs text-success">
                12 agents available now
              </span>
            </div>
            <Button className="mt-4 w-full gap-2">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Start Live Chat
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Average response time: {"<"} 2 minutes
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
