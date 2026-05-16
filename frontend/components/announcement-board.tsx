"use client"

import { useState, useMemo } from "react"
import { Plus, LayoutGrid, List, BarChart3, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchFilters, type FilterState } from "@/components/search-filters"
import { PersonCard } from "@/components/person-card"
import { PersonDetailModal } from "@/components/person-detail-modal"
import { StatsSummary } from "@/components/stats-summary"
import { mockPersons, type Person } from "@/lib/mock-data"
import Link from "next/link"

export function AnnouncementBoard() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    location: "all",
    ageGroup: "all",
    dateRange: "all",
  })
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Extract unique locations for filter
  const locations = useMemo(() => {
    const locs = new Set(mockPersons.map((p) => p.location.split(",")[0].trim()))
    return Array.from(locs).sort()
  }, [])

  // Filter persons based on current filters
  const filteredPersons = useMemo(() => {
    return mockPersons.filter((person) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          person.name?.toLowerCase().includes(searchLower) ||
          person.caseId.toLowerCase().includes(searchLower) ||
          person.description.toLowerCase().includes(searchLower) ||
          person.location.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
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

      // Date range filter (simplified for demo)
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

      return true
    })
  }, [filters])

  // Calculate stats
  const stats = useMemo(() => {
    return {
      missing: mockPersons.filter((p) => p.status === "missing").length,
      found: mockPersons.filter((p) => p.status === "found").length,
      safe: mockPersons.filter((p) => p.status === "safe").length,
      unidentified: mockPersons.filter((p) => p.status === "unidentified")
        .length,
    }
  }, [])

  const handleViewDetails = (person: Person) => {
    setSelectedPerson(person)
  }

  const handleContact = (person: Person) => {
    if (person.contactPhone) {
      window.location.href = `tel:${person.contactPhone}`
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
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
              <Button variant="outline" size="sm" asChild>
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
        {/* Stats Summary */}
        <section className="mb-6" aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">
            สถิติปัจจุบัน
          </h2>
          <StatsSummary
            totalMissing={stats.missing}
            totalFound={stats.found}
            totalSafe={stats.safe}
            totalUnidentified={stats.unidentified}
          />
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
          {filteredPersons.length > 0 ? (
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
                onClick={() =>
                  setFilters({
                    search: "",
                    status: "all",
                    location: "all",
                    ageGroup: "all",
                    dateRange: "all",
                  })
                }
              >
                ล้างตัวกรองทั้งหมด
              </Button>
            </div>
          )}
        </section>
      </main>

      {/* Detail Modal */}
      <PersonDetailModal
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
      />
    </div>
  )
}
