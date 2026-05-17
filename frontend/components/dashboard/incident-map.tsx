"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MapPin, AlertTriangle, CheckCircle, HelpCircle, Layers } from "lucide-react"
import type { LocationData } from "@/lib/types"

interface IncidentMapProps {
  locations: LocationData[]
}

export function IncidentMap({ locations }: IncidentMapProps) {
  const totalMissing = locations.reduce((sum, loc) => sum + loc.missing, 0)
  const totalFound = locations.reduce((sum, loc) => sum + loc.found, 0)
  const totalUnidentified = locations.reduce((sum, loc) => sum + loc.unidentified, 0)

  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Layers className="h-4 w-4 text-primary" aria-hidden="true" />
            กลุ่มเหตุการณ์
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 text-[10px] bg-destructive/10 text-destructive border-destructive/30">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
              คนหาย {totalMissing}
            </Badge>
            <Badge variant="outline" className="gap-1 text-[10px] bg-success/10 text-success border-success/30">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              พบแล้ว {totalFound}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Map Placeholder with Interactive Grid */}
        <div
          className="relative h-[280px] rounded-xl border border-border/60 bg-muted/30 overflow-hidden"
          role="img"
          aria-label="แผนที่แสดงตำแหน่งกลุ่มเหตุการณ์"
        >
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-30">
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Incident Markers */}
          {locations.map((location, index) => {
            const total = location.missing + location.found + location.unidentified
            const size = Math.max(40, Math.min(80, total * 4))
            // Position markers in different areas
            const positions = [
              { top: "20%", left: "25%" },
              { top: "15%", left: "65%" },
              { top: "50%", left: "15%" },
              { top: "45%", left: "75%" },
              { top: "70%", left: "45%" },
            ]
            const pos = positions[index % positions.length]

            return (
              <div
                key={location.name}
                className="absolute group cursor-pointer"
                style={{ top: pos.top, left: pos.left, transform: "translate(-50%, -50%)" }}
              >
                {/* Pulse Animation */}
                {location.missing > 10 && (
                  <span
                    className="absolute inset-0 rounded-full bg-destructive/30 animate-ping"
                    style={{ width: size, height: size }}
                  />
                )}
                {/* Marker Circle */}
                <div
                  className={cn(
                    "relative flex items-center justify-center rounded-full border-2 shadow-lg transition-transform group-hover:scale-110",
                    location.missing > location.found
                      ? "border-destructive/60 bg-destructive/20"
                      : "border-success/60 bg-success/20"
                  )}
                  style={{ width: size, height: size }}
                >
                  <MapPin
                    className={cn(
                      "h-5 w-5",
                      location.missing > location.found ? "text-destructive" : "text-success"
                    )}
                  />
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                  <div className="bg-popover border border-border rounded-lg shadow-xl p-2.5 min-w-[140px]">
                    <p className="font-semibold text-sm text-foreground">{location.name}</p>
                    <div className="mt-1.5 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-destructive">
                          <AlertTriangle className="h-3 w-3" />
                          คนหาย
                        </span>
                        <span className="font-medium text-destructive">{location.missing}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-success">
                          <CheckCircle className="h-3 w-3" />
                          พบแล้ว
                        </span>
                        <span className="font-medium text-success">{location.found}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <HelpCircle className="h-3 w-3" />
                          ไม่ทราบตัวตน
                        </span>
                        <span className="font-medium">{location.unidentified}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Legend */}
          <div className="absolute bottom-3 left-3 flex items-center gap-3 rounded-lg border border-border/60 bg-card/95 px-3 py-2 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="h-3 w-3 rounded-full border-2 border-destructive/60 bg-destructive/20" />
              <span className="text-muted-foreground">ลำดับความสำคัญสูง</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="h-3 w-3 rounded-full border-2 border-success/60 bg-success/20" />
              <span className="text-muted-foreground">กำลังฟื้นฟู</span>
            </div>
          </div>

          {/* Coordinates Display */}
          <div className="absolute top-3 right-3 rounded-lg border border-border/60 bg-card/95 px-2 py-1 shadow-sm backdrop-blur-sm">
            <p className="font-mono text-[10px] text-muted-foreground">
              เหตุการณ์ทั้งหมด {totalMissing + totalFound + totalUnidentified} รายการ
            </p>
          </div>
        </div>

        {/* Location List */}
        <div className="mt-3 space-y-2">
          {locations.slice(0, 3).map((location) => (
            <div
              key={location.name}
              className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">{location.name}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-destructive font-medium">คนหาย {location.missing}</span>
                <span className="text-success font-medium">พบแล้ว {location.found}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
