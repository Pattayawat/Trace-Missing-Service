"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MissingPersonForm } from "@/components/forms/missing-person-form"
import { UnidentifiedBodyForm } from "@/components/forms/unidentified-body-form"
import { UnidentifiedSurvivorForm } from "@/components/forms/unidentified-survivor-form"
import { UserSearch, Heart, FileWarning, ShieldAlert, Phone } from "lucide-react"

export function DisasterReportForm() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <ShieldAlert className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground sm:text-xl">
                  Disaster Relief Portal
                </h1>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Emergency Reporting System
                </p>
              </div>
            </div>
            <a
              href="tel:911"
              className="flex items-center gap-2 rounded-lg bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 sm:px-4"
              aria-label="Call emergency services"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Emergency: 911</span>
              <span className="sm:hidden">911</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1 pb-4 sm:pb-6">
            <CardTitle className="text-xl font-bold text-foreground sm:text-2xl text-balance">
              Submit a Report
            </CardTitle>
            <CardDescription className="text-muted-foreground text-pretty">
              Help us locate missing persons, identify survivors, and support disaster relief efforts. 
              Your information can save lives.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="missing-person" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 h-auto p-1 gap-1">
                <TabsTrigger
                  value="missing-person"
                  className="flex flex-col items-center gap-1 py-3 px-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <UserSearch className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-center leading-tight">Missing Person</span>
                </TabsTrigger>
                <TabsTrigger
                  value="unidentified-body"
                  className="flex flex-col items-center gap-1 py-3 px-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <FileWarning className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-center leading-tight">Unidentified Body</span>
                </TabsTrigger>
                <TabsTrigger
                  value="unidentified-survivor"
                  className="flex flex-col items-center gap-1 py-3 px-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-center leading-tight">Unidentified Survivor</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="missing-person" className="mt-0">
                <MissingPersonForm />
              </TabsContent>

              <TabsContent value="unidentified-body" className="mt-0">
                <UnidentifiedBodyForm />
              </TabsContent>

              <TabsContent value="unidentified-survivor" className="mt-0">
                <UnidentifiedSurvivorForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-6 rounded-lg border border-border bg-card p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Need Immediate Assistance?
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-foreground">Emergency Services</p>
                <p className="text-muted-foreground">Call 911</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-foreground">Red Cross Hotline</p>
                <p className="text-muted-foreground">1-800-733-2767</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-foreground">FEMA Helpline</p>
                <p className="text-muted-foreground">1-800-621-3362</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-8">
        <div className="mx-auto max-w-4xl px-4 py-4 text-center text-xs text-muted-foreground">
          <p>
            This portal is monitored 24/7 by emergency response teams. 
            All reports are handled confidentially and prioritized based on urgency.
          </p>
        </div>
      </footer>
    </div>
  )
}
