"use client"

import { useState } from "react"
import {
  User,
  MapPin,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  X,
  History,
  Building,
  Activity
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { PotentialMatch, Person } from "@/lib/types"

interface MatchComparisonCardProps {
  match: PotentialMatch
}

function PersonSide({
  person,
  label,
  isFound,
}: {
  person: Person
  label: string
  isFound?: boolean
}) {
  const displayName = person.name || `${person.gender === "male" ? "ชาย" : "หญิง"}ไม่ทราบตัวตน`

  return (
    <div className="flex-1 rounded-lg border bg-secondary/20 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            isFound
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {label}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {person.caseId}
        </span>
      </div>

      {/* Photo / Avatar */}
      <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-muted">
        {person.photoUrl ? (
          <img
            src={person.photoUrl}
            alt={`รูปถ่ายของ ${displayName}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-12 w-12 text-muted-foreground/40" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Info */}
      <h4 className="font-semibold text-foreground">{displayName}</h4>
      <p className="text-sm text-muted-foreground">
        {person.ageGroup === "adult" ? "ผู้ใหญ่" : person.ageGroup === "child" ? "เด็ก" : person.ageGroup || "ไม่ระบุช่วงวัย"}, {person.gender === "male" ? "ชาย" : person.gender === "female" ? "หญิง" : "ไม่ระบุเพศ"}
      </p>

      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="line-clamp-2">{person.location}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            {new Date(person.lastSeenDate).toLocaleDateString("th-TH", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
        {person.description}
      </p>
    </div>
  )
}

function VerificationForm({ match, onClose }: { match: PotentialMatch; onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 1500)
  }

  if (isSubmitted) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          ยื่นคำขอรับรองสำเร็จแล้ว
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          เจ้าหน้าที่ผู้ดูแลเคสจะติดต่อคุณภายใน 30 นาที เพื่อยืนยันตัวตนของคุณ
          และเริ่มกระบวนการประสานงานครอบครัว
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          รหัสอ้างอิง: VRQ-{match.id.toUpperCase()}-{Date.now().toString(36).toUpperCase()}
        </p>
        <Button onClick={onClose} className="mt-6">
          ปิด
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg bg-warning/10 border border-warning/20 p-3">
        <p className="text-sm text-warning-foreground">
          <strong>ข้อควรระวัง:</strong> โปรดยื่นแบบฟอร์มนี้เฉพาะในกรณีที่คุณเชื่อมั่นอย่างยิ่งว่า 
          บุคคลนี้เป็นญาติที่สูญหายของคุณเท่านั้น การแจ้งข้อมูลเท็จอาจทำให้กระบวนการประสานงานของผู้อื่นล่าช้า
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="verifier-name">ชื่อ-นามสกุล ของคุณ *</Label>
          <Input id="verifier-name" placeholder="ระบุชื่อ-นามสกุล ของคุณ" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="verifier-phone">เบอร์โทรศัพท์ *</Label>
          <Input id="verifier-phone" type="tel" placeholder="0XX-XXX-XXXX" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="verifier-email">อีเมล *</Label>
        <Input id="verifier-email" type="email" placeholder="your@email.com" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="relationship">ความสัมพันธ์กับบุคคลที่สูญหาย *</Label>
        <Input id="relationship" placeholder="เช่น พ่อ/แม่, พี่/น้อง, คู่สมรส" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="identifying-info">
          ข้อมูลยืนยันตัวตน (เพื่อใช้ในการตรวจสอบ) *
        </Label>
        <Textarea
          id="identifying-info"
          placeholder="ระบุรายละเอียดที่มีเพียงญาติใกล้ชิดเท่านั้นที่ทราบ: ปาน, แผลเป็น, อาการป่วย, ฯลฯ"
          rows={3}
          required
        />
      </div>

      <div className="flex gap-3 pt-2">
        <DialogClose asChild>
          <Button type="button" variant="outline" className="flex-1">
            ยกเลิก
          </Button>
        </DialogClose>
        <Button type="submit" className="flex-1 gap-2" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              กำลังยื่นคำขอ...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              ยื่นคำขอรับรอง
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export function MatchComparisonCard({ match }: MatchComparisonCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const confidenceColor =
    match.confidence >= 80
      ? "text-success bg-success/10"
      : match.confidence >= 60
        ? "text-warning bg-warning/10"
        : "text-muted-foreground bg-muted"

  const matchDate = new Date(match.matchDate)
  const timeAgo = Math.round(
    (Date.now() - matchDate.getTime()) / (1000 * 60)
  )
  const timeLabel =
    timeAgo < 60 ? `${timeAgo} นาทีที่แล้ว` : `${Math.round(timeAgo / 60)} ชั่วโมงที่แล้ว`

  return (
    <Card className="overflow-hidden border-primary/20">
      <CardHeader className="bg-primary/5 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
            พบคู่ที่อาจตรงกัน
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{timeLabel}</span>
            <Badge variant="outline" className={confidenceColor}>
              สถานะ: {match.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Side by Side Comparison */}
        <div className="flex flex-col md:flex-row gap-4">
          <PersonSide
            person={match.missingPerson}
            label="แจ้งหาย"
            isFound={false}
          />

          <div className="flex flex-row md:flex-col items-center justify-center px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <ArrowRight className="h-5 w-5 text-primary rotate-90 md:rotate-0" aria-hidden="true" />
            </div>
          </div>

          <PersonSide
            person={match.matchedPerson}
            label="พบผู้ประสบภัย"
            isFound={true}
          />
        </div>

        {/* Location History / Timeline */}
        {match.locationHistory && match.locationHistory.length > 0 && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <History className="h-3 w-3" />
              ไทม์ไลน์ตำแหน่งล่าสุด
            </div>
            <div className="relative space-y-4 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-muted">
              {match.locationHistory.map((history, idx) => (
                <div key={idx} className="relative pl-8">
                  <div className={cn(
                    "absolute left-0 top-1 h-6 w-6 rounded-full border-2 bg-background flex items-center justify-center z-10",
                    idx === 0 ? "border-primary text-primary" : "border-muted text-muted-foreground"
                  )}>
                    {history.type === "shelter" ? <Building size={12} /> : <Activity size={12} />}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{history.location}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(history.timestamp).toLocaleString("th-TH", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "numeric",
                          month: "short"
                        })}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground italic">{history.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="mt-6 w-full gap-2" size="lg">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              นี่คือญาติของฉัน - เริ่มการตรวจสอบ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                คำขอรับรองตัวตน
              </DialogTitle>
              <DialogDescription>
                ช่วยเราตรวจสอบความสัมพันธ์ของคุณกับ {match.missingPerson.name || "บุคคลที่สูญหาย"}
                เจ้าหน้าที่ผู้ดูแลเคสจะติดต่อคุณเพื่อดำเนินการประสานงานครอบครัวให้เสร็จสิ้น
              </DialogDescription>
            </DialogHeader>
            <VerificationForm match={match} onClose={() => setIsOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ")
}
