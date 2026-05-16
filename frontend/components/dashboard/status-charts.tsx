"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { BarChart3 } from "lucide-react"
import { LocationData, mockPersons } from "@/lib/mock-data"

interface StatusChartsProps {
  locations: LocationData[]
}

export function StatusCharts({ locations }: StatusChartsProps) {
  // Status breakdown data
  const statusData = [
    {
      name: "Missing",
      value: mockPersons.filter((p) => p.status === "missing").length,
      fill: "var(--color-destructive)",
    },
    {
      name: "Found",
      value: mockPersons.filter((p) => p.status === "found").length,
      fill: "var(--color-primary)",
    },
    {
      name: "Safe",
      value: mockPersons.filter((p) => p.status === "safe").length,
      fill: "var(--color-success)",
    },
    {
      name: "Unidentified",
      value: mockPersons.filter((p) => p.status === "unidentified").length,
      fill: "var(--color-muted-foreground)",
    },
  ]

  // Bar chart data by location
  const barData = locations.map((loc) => ({
    name: loc.name.split(" ")[0],
    missing: loc.missing,
    found: loc.found,
  }))

  const chartConfig = {
    missing: {
      label: "Missing",
      color: "var(--color-destructive)",
    },
    found: {
      label: "Found",
      color: "var(--color-success)",
    },
    safe: {
      label: "Safe",
      color: "var(--color-primary)",
    },
  }

  const total = statusData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Bar Chart - Cases by Area */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <BarChart3 className="h-4 w-4 text-primary" aria-hidden="true" />
            Cases by Area
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
              />
              <Bar
                dataKey="missing"
                fill="var(--color-destructive)"
                radius={[4, 4, 0, 0]}
                name="Missing"
              />
              <Bar
                dataKey="found"
                fill="var(--color-success)"
                radius={[4, 4, 0, 0]}
                name="Found"
              />
            </BarChart>
          </ChartContainer>
          <div className="mt-2 flex justify-center gap-4">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="h-2.5 w-2.5 rounded-sm bg-destructive" />
              <span className="text-muted-foreground">Missing</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="h-2.5 w-2.5 rounded-sm bg-success" />
              <span className="text-muted-foreground">Found</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pie Chart - Status Breakdown */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <div className="h-4 w-4 rounded-full border-2 border-primary" aria-hidden="true" />
            Status Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <ChartContainer config={chartConfig} className="h-[180px] w-[180px]">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              </PieChart>
            </ChartContainer>
            <div className="flex-1 space-y-2">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-sm"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-semibold">{item.value}</span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round((item.value / total) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
