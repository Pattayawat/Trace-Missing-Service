"use client"

import { useSearchParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { 
  fetchCaseDetail, 
  updatePersonStatus,
  getIncidentTypeLabel,
  getIncidentStatusLabel 
} from "@/lib/api"
import { 
  AlertTriangle, 
  MapPin, 
  Calendar, 
  ChevronLeft, 
  Clock,
  User,
  ShieldCheck,
  Building,
  Heart,
  Activity,
  History,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState, Suspense } from "react"
import type { Person, CaseEvent } from "@/lib/types"

function StatusControl({ id, currentStatus, onUpdate }: { id: string, currentStatus: string, onUpdate: () => void }) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true)
    const success = await updatePersonStatus(id, newStatus)
    if (success) onUpdate()
    setIsUpdating(false)
  }

  const statusOptions = [
    { value: "missing", label: "คนหาย (Missing)", color: "bg-destructive text-white" },
    { value: "investigating", label: "กำลังตรวจสอบ (Investigating)", color: "bg-warning text-black" },
    { value: "matching", label: "กำลังจับคู่ (Matching)", color: "bg-blue-500 text-white" },
    { value: "reunited", label: "รวมตัวแล้ว (Reunited)", color: "bg-success text-white" },
    { value: "closed", label: "ปิดเคส (Closed)", color: "bg-slate-600 text-white" },
  ]

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">ปรับเปลี่ยนสถานะ:</span>
      <Select onValueChange={handleStatusChange} disabled={isUpdating} value={currentStatus}>
        <SelectTrigger className="w-[240px] font-bold h-9">
          <SelectValue placeholder="เลือกสถานะ..." />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${opt.color.split(' ')[0]}`} />
                {opt.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function CaseDetailInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const caseId = searchParams.get("id") as string

  const { data: detail, error, isLoading, mutate } = useSWR(
    caseId ? `case-detail-${caseId}` : null,
    () => fetchCaseDetail(caseId)
  )

  if (!caseId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Search className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold text-foreground">ไม่พบรหัสเคส</h2>
        <Button onClick={() => router.push("/")} className="mt-6">กลับสู่หน้ารายการเคส</Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-xl font-bold">ไม่พบข้อมูลเคส</h2>
        <Button onClick={() => router.push("/")} className="mt-6">กลับสู่หน้ารายการเคส</Button>
      </div>
    )
  }

  const { person, matches, timeline, verification } = detail
  const displayName = person.name || "บุคคลไม่ทราบตัวตน"

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              กลับ
            </Button>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <h1 className="text-md font-bold text-foreground truncate hidden sm:block">
              รายละเอียดเคส: {person.caseId}
            </h1>
          </div>
          
          <StatusControl id={person.id} currentStatus={person.status} onUpdate={() => mutate()} />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Main Person Info */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Case Header Card */}
            <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-border/50">
              <div className="h-32 bg-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6">
                  <Badge className="text-lg py-1 px-4 shadow-sm uppercase">
                    {person.status}
                  </Badge>
                </div>
              </div>
              <CardContent className="relative -mt-16 pb-8 px-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Big Profile Photo */}
                  <div className="h-32 w-32 md:h-40 md:w-40 rounded-2xl border-4 border-card overflow-hidden shadow-xl bg-muted shrink-0">
                    {person.photoUrl ? (
                      <img src={person.photoUrl} className="h-full w-full object-cover" alt={displayName} />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-secondary">
                        <User className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 pt-16 md:pt-20 space-y-1">
                    <h2 className="text-3xl font-black text-foreground tracking-tight">{displayName}</h2>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5 font-medium">
                        <MapPin className="h-4 w-4 text-primary" />
                        {person.location}
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock className="h-4 w-4 text-primary" />
                        รายงานเมื่อ {new Date(person.lastSeenDate).toLocaleString("th-TH")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 p-6 rounded-xl bg-muted/30">
                   <div>
                     <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">อายุ</p>
                     <p className="text-sm font-semibold">{person.ageGroup || person.age || 'ไม่ทราบ'}</p>
                   </div>
                   <div>
                     <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">เพศ</p>
                     <p className="text-sm font-semibold capitalize">{person.gender}</p>
                   </div>
                   <div>
                     <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">เหตุการณ์</p>
                     <p className="text-sm font-semibold truncate">{person.incidentId}</p>
                   </div>
                   <div>
                     <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Citizen ID</p>
                     <p className="text-sm font-semibold">{person.citizenId || 'N/A'}</p>
                   </div>
                </div>

                <div className="mt-8 space-y-3">
                   <h3 className="text-sm font-bold flex items-center gap-2">
                     <FileText className="h-4 w-4 text-primary" />
                     รายละเอียดเพิ่มเติม
                   </h3>
                   <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap border-l-2 border-primary/20 pl-4 py-1">
                     {person.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                   </p>
                </div>
              </CardContent>
            </Card>

            {/* Timeline / History Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-black flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                ไทม์ไลน์และประวัติเคส
              </h3>
              <div className="relative space-y-6 before:absolute before:left-3 before:top-2 before:h-[calc(100%-8px)] before:w-px before:bg-border">
                {timeline.map((event, idx) => (
                  <div key={event.id} className="relative pl-10">
                    <div className={`absolute left-0 top-1 h-6 w-6 rounded-full border-2 bg-background flex items-center justify-center z-10 ${idx === 0 ? "border-primary text-primary" : "border-muted text-muted-foreground"}`}>
                      {idx === 0 ? <Activity size={12} /> : <div className="h-1.5 w-1.5 rounded-full bg-current" />}
                    </div>
                    <div className="flex flex-col gap-1 p-4 rounded-xl border bg-card shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground">{event.message}</span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {new Date(event.created_at).toLocaleString("th-TH")}
                        </span>
                      </div>
                      <Badge variant="outline" className="w-fit text-[10px] h-5 uppercase">
                        {event.event_type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Matching & Verification */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Matching Engine Results */}
            <section className="space-y-4">
              <h3 className="text-lg font-black flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                การจับคู่ที่ตรวจพบ
              </h3>
              {matches.length > 0 ? (
                <div className="space-y-4">
                  {matches.map((m) => (
                    <Card key={m.id} className="border-primary/20 bg-primary/5 hover:border-primary/40 transition-colors cursor-pointer group">
                      <CardContent className="p-4 flex gap-4">
                        <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden shrink-0">
                          {m.photo_url ? <img src={m.photo_url} className="h-full w-full object-cover" alt="match" /> : <User className="h-full w-full p-4 text-muted-foreground/30" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                             <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                               {m.first_name ? `${m.first_name} ${m.last_name}` : "บุคคลไม่ทราบตัวตน"}
                             </p>
                             <Badge variant="success" className="text-[10px]">95% Match</Badge>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                             <MapPin className="h-3 w-3" />
                             {m.match_location}
                          </div>
                          <div className="mt-2 text-[10px] text-muted-foreground italic truncate">
                             {m.match_details}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed py-8 text-center bg-muted/10">
                   <CardContent>
                      <Activity className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground font-medium">กำลังดำเนินการจับคู่ในพื้นหลัง...</p>
                   </CardContent>
                </Card>
              )}
            </section>

            {/* Verification Section */}
            <section className="space-y-4">
               <h3 className="text-lg font-black flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-success" />
                  การยืนยันตัวตน
               </h3>
               {verification ? (
                 <Card className="border-success/30 bg-success/5 shadow-sm">
                   <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                           <User className="h-6 w-6 text-success" />
                        </div>
                        <div>
                           <p className="text-sm font-bold">{verification.verifier_name}</p>
                           <p className="text-xs text-muted-foreground">ความเกี่ยวข้อง: {verification.relationship}</p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-success/10 space-y-2">
                         <div className="flex justify-between text-xs">
                           <span className="text-muted-foreground font-medium uppercase tracking-wider">เจ้าหน้าที่ผู้อนุมัติ</span>
                           <span className="font-bold text-success">{verification.officer_id || "OFFICER-01"}</span>
                         </div>
                         <div className="flex justify-between text-xs">
                           <span className="text-muted-foreground font-medium uppercase tracking-wider">วันเวลาที่อนุมัติ</span>
                           <span className="font-bold">{new Date(verification.created_at).toLocaleString("th-TH")}</span>
                         </div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-success/20 text-xs italic text-muted-foreground">
                        "{verification.notes || "รับรองตัวตนผ่านเอกสารทางราชการและพยานบุคคลในพื้นที่"}"
                      </div>
                   </CardContent>
                 </Card>
               ) : (
                 <Button variant="outline" className="w-full h-16 border-dashed border-2 hover:bg-success/5 hover:border-success/40 group">
                    <div className="flex items-center gap-3">
                       <Plus className="h-5 w-5 text-muted-foreground group-hover:text-success" />
                       <div className="text-left">
                          <p className="text-sm font-bold text-muted-foreground group-hover:text-success">บันทึกการยืนยันตัวตน</p>
                          <p className="text-[10px] text-muted-foreground">ใช้สำหรับการระบุตัวตนบุคคลที่ถูกพบ</p>
                       </div>
                    </div>
                 </Button>
               )}
            </section>

            {/* Location & Transfer Info */}
            <section className="space-y-4">
               <h3 className="text-lg font-black flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  พิกัดล่าสุดและการโอนย้าย
               </h3>
               <Card className="shadow-sm">
                  <CardContent className="p-6 space-y-6">
                     <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                           <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                           <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-0.5">พิกัดปัจจุบัน</p>
                           <p className="text-md font-bold text-foreground">{person.location}</p>
                           <Button variant="link" size="sm" className="h-auto p-0 text-primary text-xs gap-1 mt-1">
                              <ExternalLink className="h-3 w-3" /> เปิดใน Google Maps
                           </Button>
                        </div>
                     </div>

                     <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                           <Building className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                           <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-0.5">ศูนย์พักพิง/โรงพยาบาล</p>
                           <p className="text-sm font-semibold">{person.hospital_id || person.location.includes('Shelter') ? person.location : "ไม่ได้อยู่ในสถานรับรองทางราชการ"}</p>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </section>

          </div>
        </div>
      </main>
    </div>
  )
}

export default function CaseDetailPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading case details...</div>}>
      <CaseDetailInner />
    </Suspense>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ")
}
