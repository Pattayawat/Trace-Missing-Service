"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MetricCard } from "./metric-card"
import { ActivityFeed } from "./activity-feed"
import { IncidentMap } from "./incident-map"
import { StatusCharts } from "./status-charts"
import {
  AlertTriangle,
  UserCheck,
  HelpCircle,
  CheckCircle2,
  Phone,
  FileText,
  Search,
  RefreshCw,
  Clock,
} from "lucide-react"
import { mockPersons, mockActivities, mockLocationData } from "@/lib/mock-data"

export function ExecutiveDashboard() {
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Calculate metrics
  const totalMissing = mockPersons.filter((p) => p.status === "missing").length
  const totalFound = mockPersons.filter((p) => p.status === "found").length
  const totalSafe = mockPersons.filter((p) => p.status === "safe").length
  const totalUnidentified = mockPersons.filter((p) => p.status === "unidentified").length
  const casesResolved = totalFound + mockPersons.filter((p) => p.type === "unidentified-body" && p.status !== "unidentified").length

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setLastUpdated(new Date())
      setIsRefreshing(false)
    }, 1000)
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-card/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  Emergency Response
                </h1>
                <p className="text-xs text-muted-foreground">
                  Executive Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Updated {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-1.5"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Link href="/">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Search className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Search Board</span>
                </Button>
              </Link>
              <Link href="/report">
                <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Report</span>
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5"
                asChild
              >
                <a href="tel:911">
                  <Phone className="h-3.5 w-3.5" />
                  <span className="font-semibold">911</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Alert Banner */}
        <div className="mb-6 rounded-xl border border-accent/40 bg-accent/10 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Badge className="w-fit gap-1.5 bg-accent text-accent-foreground border-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-foreground opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-foreground" />
              </span>
              Active Emergency
            </Badge>
            <p className="text-sm font-medium text-foreground">
              Regional disaster response in progress. All agencies on high alert.
            </p>
            <div className="sm:ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              <span>Event ID: EM-2024-0089</span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">Day 4 of operations</span>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <section aria-label="Key metrics" className="mb-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <MetricCard
              title="Total Missing"
              value={totalMissing}
              subtitle="Active cases"
              icon={AlertTriangle}
              variant="danger"
              trend={{ value: 12, direction: "down", label: "from yesterday" }}
            />
            <MetricCard
              title="Found Safe"
              value={totalFound}
              subtitle="Reunited"
              icon={UserCheck}
              variant="success"
              trend={{ value: 23, direction: "up", label: "from yesterday" }}
            />
            <MetricCard
              title="Safe Survivors"
              value={totalSafe}
              subtitle="In shelters/hospitals"
              icon={CheckCircle2}
              variant="primary"
            />
            <MetricCard
              title="Unidentified"
              value={totalUnidentified}
              subtitle="Pending ID"
              icon={HelpCircle}
              variant="neutral"
            />
            <MetricCard
              title="Cases Resolved"
              value={casesResolved}
              subtitle="Total closed"
              icon={CheckCircle2}
              variant="success"
            />
          </div>
        </section>

        {/* Main Split View */}
        <section aria-label="Incident overview" className="mb-6">
          <div className="grid gap-4 lg:grid-cols-5">
            {/* Map - Takes 3 columns */}
            <div className="lg:col-span-3">
              <IncidentMap locations={mockLocationData} />
            </div>
            {/* Activity Feed - Takes 2 columns */}
            <div className="lg:col-span-2">
              <ActivityFeed activities={mockActivities} />
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <section aria-label="Analytics">
          <StatusCharts locations={mockLocationData} />
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>Emergency Response Coordination Center</p>
            <p>Data refreshes automatically every 30 seconds</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
