"use client"
import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { 
  fetchIncident, 
  fetchDashboardMetrics, 
  fetchPersons,
  getIncidentTypeLabel,
  getIncidentStatusLabel 
} from "@/lib/api"
import { 
  AlertTriangle, 
  MapPin, 
  Calendar, 
  ChevronLeft, 
  LayoutDashboard,
  ClipboardList
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { MetricCard } from "@/components/dashboard/metric-card"
import { StatsSummary } from "@/components/stats-summary"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PersonCard } from "@/components/person-card"
import { useState, useMemo } from "react"
import type { Person } from "@/lib/types"

export default function IncidentDetailContent() {
  const params = useParams()
  const router = useRouter()
  const incidentId = params.id as string

  const { data: incident, error: incidentError, isLoading: incidentLoading } = useSWR(
    `incident-${incidentId}`,
    () => fetchIncident(incidentId)
  )

  const { data: metrics, isLoading: metricsLoading } = useSWR(
    `metrics-${incidentId}`,
    () => fetchDashboardMetrics(incidentId)
  )

  const { data: persons = [], isLoading: personsLoading } = useSWR(
    `persons-${incidentId}`,
    () => fetchPersons(incidentId)
  )

  if (incidentLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (incidentError || !incident) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-xl font-bold">ไม่พบข้อมูลเหตุการณ์</h2>
        <p className="text-muted-foreground mt-2">อาจเป็นเพราะเหตุการณ์นี้ถูกยกเลิกหรือไม่มีอยู่ในระบบ</p>
        <Button onClick={() => router.push("/incidents")} className="mt-6">กลับไปหน้ารายการ</Button>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Back */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          ย้อนกลับ
        </Button>
      </div>

      {/* Incident Summary Card */}
      <Card className="overflow-hidden border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {getIncidentTypeLabel(incident.incidentType)}
                </Badge>
                <Badge variant="secondary">
                  {getIncidentStatusLabel(incident.incidentStatus)}
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {incident.incidentName}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {incident.location}, {incident.province}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  เริ่มเมื่อ {new Date(incident.startDate).toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 min-w-[200px]">
              <MetricCard
                title="เคสเปิดอยู่"
                value={metrics?.openCases || 0}
                icon={ClipboardList}
                variant="warning"
              />
            </div>
          </div>
          {incident.description && (
            <p className="mt-6 text-muted-foreground text-sm border-t pt-4 border-primary/10 italic">
              {incident.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">สถิติภายในเหตุการณ์</h2>
        </div>
        <StatsSummary
          totalMissing={metrics?.totalMissing || 0}
          totalFound={metrics?.totalFound || 0}
          totalSafe={metrics?.totalSafe || 0}
          totalUnidentified={metrics?.totalUnidentified || 0}
        />
      </section>

      {/* Filtered Records Tabs */}
      <section className="pt-4">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">รายการบันทึก</h2>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1 mb-6">
            <TabsTrigger value="all" className="py-2 text-xs sm:text-sm">ทั้งหมด</TabsTrigger>
            <TabsTrigger value="missing" className="py-2 text-xs sm:text-sm">คนหาย</TabsTrigger>
            <TabsTrigger value="survivor" className="py-2 text-xs sm:text-sm">ผู้ประสบภัย</TabsTrigger>
            <TabsTrigger value="deceased" className="py-2 text-xs sm:text-sm">ผู้เสียชีวิต</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0 focus-visible:ring-0">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {persons.map(p => (
                <PersonCard 
                  key={p.id} 
                  person={p} 
                  onViewDetails={(p) => router.push(`/cases/detail?id=${p.id}`)} 
                  onContact={(p) => p.contactPhone && (window.location.href = `tel:${p.contactPhone}`)} 
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="missing" className="mt-0">
             <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {persons.filter(p => p.type === "missing-person").map(p => (
                <PersonCard key={p.id} person={p} onViewDetails={(p) => router.push(`/cases/detail?id=${p.id}`)} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="survivor" className="mt-0">
             <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {persons.filter(p => p.type === "survivor").map(p => (
                <PersonCard key={p.id} person={p} onViewDetails={(p) => router.push(`/cases/detail?id=${p.id}`)} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="deceased" className="mt-0">
             <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {persons.filter(p => p.type === "unidentified-body").map(p => (
                <PersonCard key={p.id} person={p} onViewDetails={(p) => router.push(`/cases/detail?id=${p.id}`)} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}
