"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { Plus, LayoutGrid, List, BarChart3, Heart, AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SearchFilters } from "@/components/search-filters"
import { PersonCard } from "@/components/person-card"
import { PersonDetailModal } from "@/components/person-detail-modal"
import { StatsSummary } from "@/components/stats-summary"
import { fetchPersons } from "@/lib/api"
import { useIncident } from "@/context/incident-context"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Person, FilterState } from "@/lib/types"

export function AnnouncementBoard() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    location: "all",
    ageGroup: "all",
    dateRange: "all",
    incidentId: "all",
    incidentType: "all",
    province: "all",
  })
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState<string>("all")

  const {
    selectedIncidentId,
    selectedIncident,
    incidents,
    setSelectedIncidentId,
  } = useIncident()

  // Fetch persons
  const { data: allPersons = [], isLoading, error, mutate } = useSWR(
    "all-persons",
    () => fetchPersons(),
    { revalidateOnFocus: false }
  )

  // Extract unique locations for filter
  const locations = useMemo(() => {
    const locs = new Set(allPersons.map((p) => p.location.split(",")[0].trim()))
    return Array.from(locs).sort()
  }, [allPersons])

  // Filter persons based on current filters and selected incident
  const filteredPersons = useMemo(() => {
    return allPersons.filter((person) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          person.name?.toLowerCase().includes(searchLower) ||
          person.caseId.toLowerCase().includes(searchLower) ||
          person.citizenId?.toLowerCase().includes(searchLower) ||
          person.description.toLowerCase().includes(searchLower) ||
          person.location.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Incident filter (from dropdown or sidebar selection)
      const effectiveIncidentId = filters.incidentId !== "all" 
        ? filters.incidentId 
        : selectedIncidentId
      
      if (effectiveIncidentId && person.incidentId !== effectiveIncidentId) {
        return false
      }

      // Incident type filter
      if (filters.incidentType !== "all") {
        const personIncident = incidents.find((i) => i.incidentId === person.incidentId)
        if (!personIncident || personIncident.incidentType !== filters.incidentType) {
          return false
        }
      }

      // Province filter
      if (filters.province !== "all") {
        const personIncident = incidents.find((i) => i.incidentId === person.incidentId)
        if (!personIncident || personIncident.province !== filters.province) {
          return false
        }
      }

      // Status filter
      if (filters.status !== "all" && person.status !== filters.status) {
        return false
      }

      // Location filter
      if (
        filters.location !== "all" &&
        !person.location.includes(filters.location)
      ) {
        return false
      }

      // Age group filter
      if (filters.ageGroup !== "all" && person.ageGroup !== filters.ageGroup) {
        return false
      }

      // Date range filter
      if (filters.dateRange !== "all") {
        const personDate = new Date(person.lastSeenDate)
        const now = new Date()
        const diffDays = Math.floor(
          (now.getTime() - personDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (filters.dateRange === "today" && diffDays > 0) return false
        if (filters.dateRange === "week" && diffDays > 7) return false
        if (filters.dateRange === "month" && diffDays > 30) return false
      }

      // Tab filter
      if (activeTab !== "all") {
        if (activeTab === "missing-person" && person.type !== "missing-person") return false
        if (activeTab === "survivor" && person.type !== "survivor") return false
        if (activeTab === "unidentified-body" && person.type !== "unidentified-body") return false
      }

      return true
    })
  }, [filters, allPersons, selectedIncidentId, incidents, activeTab])

  // Calculate stats
  const stats = useMemo(() => {
    // Use the filtered base (considering incident selection but not tab)
    const basePersons = allPersons.filter((person) => {
      const effectiveIncidentId = filters.incidentId !== "all" 
        ? filters.incidentId 
        : selectedIncidentId
      if (effectiveIncidentId && person.incidentId !== effectiveIncidentId) {
        return false
      }
      return true
    })

    return {
      missing: basePersons.filter((p) => p.status === "missing" || p.status === "investigating" || p.status === "matching").length,
      found: basePersons.filter((p) => p.status === "found" || p.status === "closed").length,
      safe: basePersons.filter((p) => p.status === "safe" || (p.type === "survivor" && p.status !== "found")).length,
      unidentified: basePersons.filter((p) => p.status === "unidentified" || (p.type === "unidentified-body" && p.status !== "found")).length,
    }
  }, [allPersons, filters.incidentId, selectedIncidentId])

  const handleViewDetails = (person: Person) => {
    router.push(`/cases/detail?id=${person.id}`)
  }

  const handleContact = (person: Person) => {
    if (person.contactPhone) {
      window.location.href = `tel:${person.contactPhone}`
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 lg:top-0">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                ศูนย์ประสานงานช่วยเหลือผู้ประสบภัย
              </h1>
              <p className="text-sm text-muted-foreground">
                ค้นหาและรายงานคนหาย ผู้รอดชีวิต และบุคคลไม่ทราบตัวตน
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/reunification" className="gap-2">
                  <Heart size={16} aria-hidden="true" />
                  <span className="hidden sm:inline">ตามหาครอบครัว</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard" className="gap-2">
                  <BarChart3 size={16} aria-hidden="true" />
                  <span className="hidden sm:inline">แดชบอร์ด</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="hidden lg:flex">
                <a href="tel:191" className="gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
                  </span>
                  ฉุกเฉิน 191
                </a>
              </Button>
              <Button asChild className="gap-2">
                <Link href="/report">
                  <Plus size={16} aria-hidden="true" />
                  <span className="hidden sm:inline">รายงาน</span>
                  <span className="sm:hidden">รายงาน</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Current Incident Banner */}
        {selectedIncident && (
          <div className="mb-6 rounded-xl border border-primary/40 bg-primary/5 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Badge className="w-fit gap-1.5 bg-primary text-primary-foreground border-0">
                <AlertTriangle className="h-3.5 w-3.5" />
                กำลังดูเหตุการณ์
              </Badge>
              <p className="text-sm font-medium text-foreground">
                {selectedIncident.incidentName}
              </p>
              <div className="sm:ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIncidentId(null)}
                  className="text-muted-foreground h-7"
                >
                  ดูทุกเหตุการณ์
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <section className="mb-6" aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">
            สถิติปัจจุบัน
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : (
            <StatsSummary
              totalMissing={stats.missing}
              totalFound={stats.found}
              totalSafe={stats.safe}
              totalUnidentified={stats.unidentified}
            />
          )}
        </section>

        {/* Search and Filters */}
        <section className="mb-6" aria-labelledby="search-heading">
          <h2 id="search-heading" className="sr-only">
            การค้นหาและตัวกรอง
          </h2>
          <SearchFilters
            filters={filters}
            onFiltersChange={setFilters}
            locations={locations}
          />
        </section>

        {/* Tabs for Person Types */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="all" className="text-sm py-2">
              ทั้งหมด
            </TabsTrigger>
            <TabsTrigger value="missing-person" className="text-sm py-2">
              ผู้สูญหาย
            </TabsTrigger>
            <TabsTrigger value="survivor" className="text-sm py-2">
              ผู้ประสบภัยไม่ทราบตัวตน
            </TabsTrigger>
            <TabsTrigger value="unidentified-body" className="text-sm py-2">
              ผู้เสียชีวิตไม่ทราบตัวตน
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Results Header */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            แสดง{" "}
            <span className="font-medium text-foreground">
              {filteredPersons.length}
            </span>{" "}
            รายการ
          </p>
          <div className="flex items-center gap-1 rounded-lg border bg-card p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode("grid")}
              aria-label="มุมมองตาราง"
              aria-pressed={viewMode === "grid"}
            >
              <LayoutGrid size={16} />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode("list")}
              aria-label="มุมมองรายการ"
              aria-pressed={viewMode === "list"}
            >
              <List size={16} />
            </Button>
          </div>
        </div>

        {/* Results Grid */}
        <section aria-labelledby="results-heading">
          <h2 id="results-heading" className="sr-only">
            ผลการค้นหา
          </h2>
          {error ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 py-16 text-center">
              <AlertTriangle className="mb-4 h-12 w-12 text-destructive" />
              <h3 className="mb-1 text-lg font-semibold text-foreground">
                เกิดข้อผิดพลาดในการโหลดข้อมูล
              </h3>
              <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                ไม่สามารถดึงข้อมูลรายชื่อได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง
              </p>
              <Button onClick={() => mutate()} variant="outline" className="gap-2">
                <RefreshCw size={16} />
                ลองใหม่
              </Button>
            </div>
          ) : isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          ) : filteredPersons.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "flex flex-col gap-4"
              }
            >
              {filteredPersons.map((person) => (
                <PersonCard
                  key={person.id}
                  person={person}
                  onViewDetails={handleViewDetails}
                  onContact={handleContact}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 py-16 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <LayoutGrid className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-foreground">
                ไม่พบผลลัพธ์
              </h3>
              <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                ลองปรับการค้นหาหรือตัวกรองเพื่อค้นหาสิ่งที่คุณต้องการ
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    search: "",
                    status: "all",
                    location: "all",
                    ageGroup: "all",
                    dateRange: "all",
                    incidentId: "all",
                    incidentType: "all",
                    province: "all",
                  })
                  setActiveTab("all")
                }}
              >
                ล้างตัวกรองทั้งหมด
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
