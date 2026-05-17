"use client"

import {
  Heart,
  Home,
  BarChart3,
  Users,
  RefreshCw,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmergencyContacts } from "./emergency-contacts"
import { MatchComparisonCard } from "./match-comparison-card"
import { FallbackSection } from "./fallback-section"
import { fetchPotentialMatches } from "@/lib/api"
import useSWR from "swr"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

export function ReunificationHub() {
  const { data: matches = [], isLoading, error, mutate } = useSWR(
    "potential-matches",
    fetchPotentialMatches,
    { revalidateOnFocus: false }
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                การประสานงานครอบครัว
              </h1>
              <p className="text-xs text-muted-foreground">
                ศูนย์ตอบโต้ภัยพิบัติ
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="gap-2">
                <Home className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">หน้าแรก</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard" className="gap-2">
                <BarChart3 className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">แดชบอร์ด</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="tel:191" className="gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
                </span>
                191
              </a>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="border-b bg-primary/5">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-8 w-8 text-primary" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
            ติดต่อและพบกับคนที่คุณรัก
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            ระบบทำการจับคู่รายงานคนหายกับผู้รอดชีวิตและบุคคลไม่ทราบตัวตนอย่างต่อเนื่อง 
            ตรวจสอบคู่ที่อาจตรงกันด้านล่าง หรือติดต่อทีมสนับสนุนของเราเพื่อขอความช่วยเหลือ
          </p>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Column - Emergency Contacts & Support */}
          <aside className="w-full lg:w-[360px] lg:shrink-0">
            <div className="sticky top-24">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                การสนับสนุนฉุกเฉิน
              </h3>
              <EmergencyContacts />
            </div>
          </aside>

          {/* Right Column - Family Reunification Hub */}
          <div className="flex-1 min-w-0">
            {/* Potential Matches Section */}
            <section aria-labelledby="matches-heading">
              <div className="mb-4 flex items-center justify-between">
                <h3
                  id="matches-heading"
                  className="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  คู่ที่อาจตรงกัน ({matches.length})
                </h3>
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={() => mutate()} className="h-8 text-xs gap-2">
                    <RefreshCw className="h-3 w-3" />
                    รีเฟรช
                  </Button>
                  <span className="flex items-center gap-2 text-xs text-success">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                    </span>
                    ระบบจับคู่กำลังทำงาน
                  </span>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-6">
                  {[...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="h-64 w-full rounded-xl" />
                  ))}
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-xl">
                  <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
                  <p className="text-sm text-muted-foreground">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
                  <Button variant="link" size="sm" onClick={() => mutate()}>ลองใหม่อีกครั้ง</Button>
                </div>
              ) : matches.length > 0 ? (
                <div className="space-y-6">
                  {matches.map((match) => (
                    <MatchComparisonCard key={match.id} match={match} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-xl bg-muted/20">
                  <Users className="h-12 w-12 text-muted-foreground/40 mb-4" />
                  <h4 className="text-lg font-medium text-foreground">ยังไม่มีคู่ที่ตรงกัน</h4>
                  <p className="text-sm text-muted-foreground max-w-xs text-center mt-1">
                    เมื่อระบบตรวจพบข้อมูลผู้รอดชีวิตหรือผู้ประสบภัยที่อาจตรงกับรายงานคนหาย รายการจะปรากฏขึ้นที่นี่
                  </p>
                </div>
              )}
            </section>

            {/* Divider */}
            <div className="my-8 border-t" />

            {/* Fallback Section */}
            <section aria-labelledby="fallback-heading">
              <FallbackSection />
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-sm text-muted-foreground">
            พอร์ทัลประสานงานครอบครัวเพื่อบรรเทาสาธารณภัย
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            สำหรับเหตุฉุกเฉิน โปรดโทร 191 เป็นอันดับแรกเสมอ
          </p>
        </div>
      </footer>
    </div>
  )
}
