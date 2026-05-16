"use client"

import { Search, Filter, X, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"

export interface FilterState {
  search: string
  status: string
  location: string
  ageGroup: string
  dateRange: string
}

interface SearchFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  locations: string[]
}

export function SearchFilters({
  filters,
  onFiltersChange,
  locations,
}: SearchFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.location !== "all" ||
    filters.ageGroup !== "all" ||
    filters.dateRange !== "all"

  const clearFilters = () => {
    onFiltersChange({
      search: filters.search,
      status: "all",
      location: "all",
      ageGroup: "all",
      dateRange: "all",
    })
  }

  return (
    <div className="bg-card rounded-xl border shadow-sm">
      {/* Main Search Bar */}
      <div className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={20}
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search by name, case ID, or description..."
              className="pl-10 h-12 text-base"
              value={filters.search}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value })
              }
              aria-label="Search persons"
            />
          </div>
          <Button
            variant="outline"
            className="h-12 gap-2 px-4"
            onClick={() => setShowAdvanced(!showAdvanced)}
            aria-expanded={showAdvanced}
            aria-controls="advanced-filters"
          >
            <Filter size={18} aria-hidden="true" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {
                  [
                    filters.status,
                    filters.location,
                    filters.ageGroup,
                    filters.dateRange,
                  ].filter((f) => f !== "all").length
                }
              </span>
            )}
            <ChevronDown
              size={16}
              className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div
          id="advanced-filters"
          className="border-t bg-muted/30 p-4"
          role="region"
          aria-label="Advanced filters"
        >
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5 min-w-[140px] flex-1 sm:flex-none">
              <label
                htmlFor="status-filter"
                className="text-sm font-medium text-foreground"
              >
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, status: value })
                }
              >
                <SelectTrigger id="status-filter" className="h-10 bg-card">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="missing">Missing</SelectItem>
                  <SelectItem value="found">Found</SelectItem>
                  <SelectItem value="safe">Safe / Survivor</SelectItem>
                  <SelectItem value="unidentified">Unidentified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[140px] flex-1 sm:flex-none">
              <label
                htmlFor="location-filter"
                className="text-sm font-medium text-foreground"
              >
                Location
              </label>
              <Select
                value={filters.location}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, location: value })
                }
              >
                <SelectTrigger id="location-filter" className="h-10 bg-card">
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[140px] flex-1 sm:flex-none">
              <label
                htmlFor="age-filter"
                className="text-sm font-medium text-foreground"
              >
                Age Group
              </label>
              <Select
                value={filters.ageGroup}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, ageGroup: value })
                }
              >
                <SelectTrigger id="age-filter" className="h-10 bg-card">
                  <SelectValue placeholder="All ages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="child">Child (0-12)</SelectItem>
                  <SelectItem value="teen">Teen (13-17)</SelectItem>
                  <SelectItem value="adult">Adult (18-64)</SelectItem>
                  <SelectItem value="elderly">Elderly (65+)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[140px] flex-1 sm:flex-none">
              <label
                htmlFor="date-filter"
                className="text-sm font-medium text-foreground"
              >
                Date Reported
              </label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, dateRange: value })
                }
              >
                <SelectTrigger id="date-filter" className="h-10 bg-card">
                  <SelectValue placeholder="Any date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Date</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Past Week</SelectItem>
                  <SelectItem value="month">Past Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-10 gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <X size={16} aria-hidden="true" />
                Clear filters
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
