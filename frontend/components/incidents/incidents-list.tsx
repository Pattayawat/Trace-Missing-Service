"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import {
  Search,
  Filter,
  ChevronDown,
  MapPin,
  Calendar,
  Users,
  Flame,
  Droplets,
  Mountain,
  Wind,
  AlertTriangle,
  CircleDot,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  fetchIncidents,
  fetchIncidentCaseCounts,
  getIncidentTypeLabel,
  getIncidentStatusLabel,
  getProvinces,
} from "@/lib/api"
import { useIncident } from "@/context/incident-context"
import { cn } from "@/lib/utils"
import type { Incident, IncidentType, IncidentStatus } from "@/lib/types"

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

function getStatusColor(status: IncidentStatus) {
  switch (status) {
    case "active":
      return "bg-destructive/10 text-destructive border-destructive/20"
    case "monitoring":
      return "bg-warning/10 text-warning-foreground border-warning/20"
    case "resolved":
      return "bg-success/10 text-success border-success/20"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getTypeColor(type: IncidentType) {
  switch (type) {
    case "fire":
      return "bg-orange-100 text-orange-700 border-orange-200"
    case "flood":
      return "bg-blue-100 text-blue-700 border-blue-200"
    case "landslide":
      return "bg-amber-100 text-amber-700 border-amber-200"
    case "storm":
      return "bg-slate-100 text-slate-700 border-slate-200"
    case "earthquake":
      return "bg-red-100 text-red-700 border-red-200"
    default:
      return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

interface IncidentCardProps {
  incident: Incident
  caseCount: number
  onSelect: (incidentId: string) => void
}

function IncidentCard({ incident, caseCount, onSelect }: IncidentCardProps) {
  const Icon = getIncidentTypeIcon(incident.incidentType)
  const startDate = new Date(incident.startDate)
  const router = useRouter()

  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
      onClick={() => router.push(`/incidents/${incident.incidentId}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                getTypeColor(incident.incidentType)
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
                {incident.incidentName}
              </CardTitle>
              <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{incident.province}</span>
              </div>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn("shrink-0", getStatusColor(incident.incidentStatus))}
          >
            {getIncidentStatusLabel(incident.incidentStatus)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {incident.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {incident.description}
          </p>
        )}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {startDate.toLocaleDateString("th-TH", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3.5 w-3.5" />
              {caseCount} เคส
            </Badge>
          </div>
          <Badge
            variant="outline"
            className={cn("text-xs", getTypeColor(incident.incidentType))}
          >
            {getIncidentTypeLabel(incident.incidentType)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function IncidentCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

export function IncidentsList() {
  const router = useRouter()
  const { setSelectedIncidentId } = useIncident()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [provinceFilter, setProvinceFilter] = useState<string>("all")

  const {
    data: incidents = [],
    isLoading,
    error,
    mutate: refresh,
  } = useSWR("incidents-list", fetchIncidents)

  const { data: caseCounts = {} } = useSWR("case-counts", fetchIncidentCaseCounts)

  const provinces = useMemo(() => getProvinces(), [])

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        const matchesSearch =
          incident.incidentName.toLowerCase().includes(searchLower) ||
          incident.province.toLowerCase().includes(searchLower) ||
          incident.location.toLowerCase().includes(searchLower) ||
          incident.incidentId.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Status filter
      if (statusFilter !== "all" && incident.incidentStatus !== statusFilter) {
        return false
      }

      // Type filter
      if (typeFilter !== "all" && incident.incidentType !== typeFilter) {
        return false
      }

      // Province filter
      if (provinceFilter !== "all" && incident.province !== provinceFilter) {
        return false
      }

      return true
    })
  }, [incidents, search, statusFilter, typeFilter, provinceFilter])

  const handleSelectIncident = (incidentId: string) => {
    setSelectedIncidentId(incidentId)
    router.push("/")
  }

  // Calculate summary stats
  const stats = useMemo(() => {
    return {
      total: incidents.length,
      active: incidents.filter((i) => i.incidentStatus === "active").length,
      monitoring: incidents.filter((i) => i.incidentStatus === "monitoring").length,
      resolved: incidents.filter((i) => i.incidentStatus === "resolved").length,
    }
  }, [incidents])

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">เหตุการณ์ภัยพิบัติ</h1>
          <p className="text-sm text-muted-foreground mt-1">
            รายการเหตุการณ์ที่กำลังติดตามและประสานงาน
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refresh()}
          className="gap-2 self-start"
        >
          <RefreshCw className="h-4 w-4" />
          รีเฟรช
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-sm text-muted-foreground">เหตุการณ์ทั้งหมด</div>
          </CardContent>
        </Card>
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-destructive">{stats.active}</div>
            <div className="text-sm text-muted-foreground">กำลังดำเนินการ</div>
          </CardContent>
        </Card>
        <Card className="bg-warning/5 border-warning/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning-foreground">{stats.monitoring}</div>
            <div className="text-sm text-muted-foreground">เฝ้าระวัง</div>
          </CardContent>
        </Card>
        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">{stats.resolved}</div>
            <div className="text-sm text-muted-foreground">ปิดเคสแล้ว</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาเหตุการณ์..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="สถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกสถานะ</SelectItem>
                  <SelectItem value="active">กำลังดำเนินการ</SelectItem>
                  <SelectItem value="monitoring">เฝ้าระวัง</SelectItem>
                  <SelectItem value="resolved">ปิดเคสแล้ว</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="ประเภท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกประเภท</SelectItem>
                  <SelectItem value="flood">น้ำท่วม</SelectItem>
                  <SelectItem value="fire">ไฟไหม้/ไฟป่า</SelectItem>
                  <SelectItem value="earthquake">แผ่นดินไหว</SelectItem>
                  <SelectItem value="storm">พายุ</SelectItem>
                  <SelectItem value="landslide">ดินถล่ม</SelectItem>
                  <SelectItem value="other">อื่นๆ</SelectItem>
                </SelectContent>
              </Select>

              <Select value={provinceFilter} onValueChange={setProvinceFilter}>
                <SelectTrigger className="w-[160px]">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="จังหวัด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกจังหวัด</SelectItem>
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(statusFilter !== "all" ||
                typeFilter !== "all" ||
                provinceFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("all")
                    setTypeFilter("all")
                    setProvinceFilter("all")
                  }}
                  className="text-muted-foreground"
                >
                  ล้างตัวกรอง
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          แสดง{" "}
          <span className="font-medium text-foreground">{filteredIncidents.length}</span>{" "}
          เหตุการณ์
        </p>
      </div>

      {/* Incidents Grid */}
      {error ? (
        <Card className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">เกิดข้อผิดพลาด</h3>
          <p className="text-muted-foreground mb-4">
            ไม่สามารถโหลดข้อมูลเหตุการณ์ได้ กรุณาลองใหม่อีกครั้ง
          </p>
          <Button variant="outline" onClick={() => refresh()}>
            ลองใหม่
          </Button>
        </Card>
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <IncidentCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredIncidents.length === 0 ? (
        <Card className="p-8 text-center">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">ไม่พบเหตุการณ์</h3>
          <p className="text-muted-foreground mb-4">
            ไม่พบเหตุการณ์ที่ตรงกับเงื่อนไขการค้นหา
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearch("")
              setStatusFilter("all")
              setTypeFilter("all")
              setProvinceFilter("all")
            }}
          >
            ล้างตัวกรองทั้งหมด
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredIncidents.map((incident) => (
            <IncidentCard
              key={incident.incidentId}
              incident={incident}
              caseCount={caseCounts[incident.incidentId] || 0}
              onSelect={handleSelectIncident}
            />
          ))}
        </div>
      )}
    </div>
  )
}
