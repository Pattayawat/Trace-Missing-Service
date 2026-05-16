"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
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
  Flame,
  Droplets,
  Mountain,
  Wind,
  CircleDot,
  FolderOpen,
} from "lucide-react"
import {
  fetchPersons,
  fetchActivities,
  fetchDashboardMetrics,
  getIncidentTypeLabel,
} from "@/lib/api"
import { mockLocationData } from "@/lib/api"
import { useIncident } from "@/context/incident-context"
import { cn } from "@/lib/utils"
import type { IncidentType } from "@/lib/types"

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

export function ExecutiveDashboard() {
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const {
    selectedIncident,
    selectedIncidentId,
    setSelectedIncidentId,
    viewMode,
    setViewMode,
  } = useIncident()

  // Determine if we should filter by incident
  const shouldFilter = viewMode === "incident" && selectedIncidentId !== null

  // Fetch data with incident filter
  const {
    data: persons = [],
    isLoading: personsLoading,
    mutate: refreshPersons,
  } = useSWR(
    shouldFilter ? `persons-${selectedIncidentId}` : "persons-all",
    () => fetchPersons(shouldFilter ? selectedIncidentId! : undefined),
    { revalidateOnFocus: false }
  )

  const {
    data: activities = [],
    isLoading: activitiesLoading,
    mutate: refreshActivities,
  } = useSWR(
    shouldFilter ? `activities-${selectedIncidentId}` : "activities-all",
    () => fetchActivities(shouldFilter ? selectedIncidentId! : undefined),
    { revalidateOnFocus: false }
  )

  const { data: metrics, isLoading: metricsLoading } = useSWR(
    shouldFilter ? `metrics-${selectedIncidentId}` : "metrics-all",
    () => fetchDashboardMetrics(shouldFilter ? selectedIncidentId! : undefined),
    { revalidateOnFocus: false }
  )

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([refreshPersons(), refreshActivities()])
    setLastUpdated(new Date())
    setIsRefreshing(false)
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const isLoading = personsLoading || activitiesLoading || metricsLoading

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-card/95 backdrop-blur-sm lg:top-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  แดชบอร์ดผู้บริหาร
                </h1>
                <p className="text-xs text-muted-foreground">
                  ศูนย์ประสานงานบรรเทาสาธารณภัย
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  อัปเดตเมื่อ {lastUpdated.toLocaleTimeString("th-TH")}
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
                <span className="hidden sm:inline">รีเฟรช</span>
              </Button>
              <Link href="/">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Search className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">บอร์ดค้นหา</span>
                </Button>
              </Link>
              <Link href="/report">
                <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">รายงาน</span>
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5 hidden lg:flex"
                asChild
              >
                <a href="tel:191">
                  <Phone className="h-3.5 w-3.5" />
                  <span className="font-semibold">191</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* View Mode Toggle & Current Incident */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 rounded-lg border bg-card p-1">
            <Button
              variant={viewMode === "global" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => {
                setViewMode("global")
                setSelectedIncidentId(null)
              }}
              className="gap-2"
            >
              <FolderOpen className="h-4 w-4" />
              ภาพรวมทั้งหมด
            </Button>
            <Button
              variant={viewMode === "incident" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("incident")}
              className="gap-2"
              disabled={!selectedIncidentId && viewMode !== "incident"}
            >
              <AlertTriangle className="h-4 w-4" />
              แยกตามเหตุการณ์
            </Button>
          </div>

          {/* Selected Incident Badge */}
          {selectedIncident && viewMode === "incident" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">กำลังดู:</span>
              <Badge
                variant="outline"
                className="gap-2 py-1.5 px-3 bg-primary/5 border-primary/30"
              >
                {(() => {
                  const Icon = getIncidentTypeIcon(selectedIncident.incidentType)
                  return <Icon className="h-4 w-4" />
                })()}
                <span className="font-medium">{selectedIncident.incidentName}</span>
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIncidentId(null)}
                className="text-muted-foreground h-7 px-2"
              >
                ล้าง
              </Button>
            </div>
          )}
        </div>

        {/* Alert Banner */}
        {selectedIncident && viewMode === "incident" ? (
          <div className="mb-6 rounded-xl border border-primary/40 bg-primary/5 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Badge className="w-fit gap-1.5 bg-primary text-primary-foreground border-0">
                {(() => {
                  const Icon = getIncidentTypeIcon(selectedIncident.incidentType)
                  return <Icon className="h-3.5 w-3.5" />
                })()}
                {getIncidentTypeLabel(selectedIncident.incidentType)}
              </Badge>
              <p className="text-sm font-medium text-foreground">
                {selectedIncident.incidentName} - {selectedIncident.location}
              </p>
              <div className="sm:ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                <span>รหัส: {selectedIncident.incidentId}</span>
                <span className="hidden sm:inline">|</span>
                <span className="hidden sm:inline">
                  เริ่ม:{" "}
                  {new Date(selectedIncident.startDate).toLocaleDateString("th-TH")}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-xl border border-accent/40 bg-accent/10 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Badge className="w-fit gap-1.5 bg-accent text-accent-foreground border-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-foreground opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-foreground" />
                </span>
                ภาพรวมทั้งหมด
              </Badge>
              <p className="text-sm font-medium text-foreground">
                แสดงข้อมูลรวมจากทุกเหตุการณ์ที่กำลังดำเนินการ
              </p>
            </div>
          </div>
        )}

        {/* Metric Cards */}
        <section aria-label="Key metrics" className="mb-6">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 lg:p-5">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <MetricCard
                title="ผู้สูญหายทั้งหมด"
                value={metrics?.totalMissing || 0}
                subtitle="เคสที่กำลังดำเนินการ"
                icon={AlertTriangle}
                variant="danger"
              />
              <MetricCard
                title="พบแล้ว"
                value={metrics?.totalFound || 0}
                subtitle="ได้พบครอบครัวแล้ว"
                icon={UserCheck}
                variant="success"
              />
              <MetricCard
                title="ผู้ประสบภัยไม่ทราบตัวตน"
                value={metrics?.totalSafe || 0}
                subtitle="ในศูนย์พักพิง/โรงพยาบาล"
                icon={CheckCircle2}
                variant="primary"
              />
              <MetricCard
                title="ผู้เสียชีวิตไม่ทราบตัวตน"
                value={metrics?.totalUnidentified || 0}
                subtitle="รอการระบุตัวตน"
                icon={HelpCircle}
                variant="neutral"
              />
              <MetricCard
                title="เคสเปิดอยู่"
                value={metrics?.openCases || 0}
                subtitle="รอดำเนินการ"
                icon={FolderOpen}
                variant="warning"
              />
            </div>
          )}
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
              {activitiesLoading ? (
                <Card className="h-full">
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-32 mb-4" />
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex gap-3 mb-3">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <ActivityFeed activities={activities} />
              )}
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <section aria-label="Analytics">
          {personsLoading ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-[200px] w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-[200px] w-full" />
                </CardContent>
              </Card>
            </div>
          ) : (
            <StatusCharts locations={mockLocationData} persons={persons} />
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>ศูนย์ประสานงานตอบโต้เหตุฉุกเฉิน</p>
            <p>ข้อมูลอัปเดตอัตโนมัติทุก 30 วินาที</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
