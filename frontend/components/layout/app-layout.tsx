"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  AlertTriangle,
  LayoutDashboard,
  Search,
  FileText,
  Heart,
  Menu,
  X,
  ChevronDown,
  Phone,
  Flame,
  Droplets,
  Mountain,
  Wind,
  CircleDot,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useIncident } from "@/context/incident-context"
import { getIncidentTypeLabel, getIncidentStatusLabel } from "@/lib/api"
import type { IncidentType, IncidentStatus } from "@/lib/types"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const navItems = [
  { href: "/", label: "ค้นหา", icon: Search },
  { href: "/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
  { href: "/incidents", label: "เหตุการณ์", icon: AlertTriangle },
  { href: "/report", label: "รายงาน", icon: FileText },
  { href: "/reunification", label: "ตามหาครอบครัว", icon: Heart },
]

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
      return "bg-destructive text-destructive-foreground"
    case "monitoring":
      return "bg-warning text-warning-foreground"
    case "resolved":
      return "bg-success text-success-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [incidentsOpen, setIncidentsOpen] = useState(true)
  const {
    activeIncidents,
    selectedIncidentId,
    setSelectedIncidentId,
    isLoading,
  } = useIncident()

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <span className="font-bold text-foreground text-sm">ศูนย์ประสานงาน</span>
                <p className="text-xs text-muted-foreground">ผู้ประสบภัย</p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )
              })}
            </div>

            {/* Active Incidents Section */}
            <div className="mt-6">
              <Collapsible open={incidentsOpen} onOpenChange={setIncidentsOpen}>
                <CollapsibleTrigger asChild>
                  <button className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
                    <span>เหตุการณ์ที่กำลังดำเนินการ</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        incidentsOpen && "rotate-180"
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-1">
                  {/* All incidents option */}
                  <button
                    onClick={() => setSelectedIncidentId(null)}
                    className={cn(
                      "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors text-left",
                      selectedIncidentId === null
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>ทุกเหตุการณ์</span>
                  </button>

                  {isLoading ? (
                    <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                      กำลังโหลด...
                    </div>
                  ) : activeIncidents.length === 0 ? (
                    <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                      ไม่มีเหตุการณ์ที่กำลังดำเนินการ
                    </div>
                  ) : (
                    activeIncidents.map((incident) => {
                      const Icon = getIncidentTypeIcon(incident.incidentType)
                      const isSelected = selectedIncidentId === incident.incidentId
                      return (
                        <button
                          key={incident.incidentId}
                          onClick={() => setSelectedIncidentId(incident.incidentId)}
                          className={cn(
                            "flex items-start gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors text-left",
                            isSelected
                              ? "bg-secondary text-secondary-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate text-foreground">
                              {incident.incidentName}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs truncate">
                                {incident.province}
                              </span>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-[10px] px-1.5 py-0",
                                  getStatusColor(incident.incidentStatus)
                                )}
                              >
                                {getIncidentStatusLabel(incident.incidentStatus)}
                              </Badge>
                            </div>
                          </div>
                        </button>
                      )
                    })
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </nav>

          {/* Emergency Contact */}
          <div className="p-4 border-t">
            <a
              href="tel:191"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>ฉุกเฉิน 191</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <span className="font-semibold text-foreground">ศูนย์ประสานงานผู้ประสบภัย</span>
          </div>
          <a
            href="tel:191"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>191</span>
          </a>
        </header>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
