"use client"

import { useState } from "react"
import {
  Plus,
  Bell,
  Search,
  Mail,
  Phone,
  User,
  Shirt,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

export function FallbackSection() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubscribed(true)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="rounded-lg bg-warning/10 border border-warning/20 p-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-warning-foreground">
          <Search className="h-5 w-5" aria-hidden="true" />
          ไม่พบคนที่คุณรักใช่หรือไม่?
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          ไม่ต้องกังวล - มีหลายวิธีที่เราสามารถช่วยคุณค้นหาสมาชิกในครอบครัวของคุณได้
        </p>
      </div>

      {/* Report New Missing Person CTA */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <Plus className="h-6 w-6 text-destructive" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-foreground">
                รายงานคนหายรายใหม่
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                หากสมาชิกในครอบครัวของคุณยังไม่ได้รับการแจ้งหาย ให้สร้างรายงานโดยละเอียด 
                เพื่อเพิ่มข้อมูลเข้าสู่ระบบและเปิดใช้งานการจับคู่โดยอัตโนมัติ
              </p>
              <Button asChild className="mt-4 gap-2" variant="destructive">
                <Link href="/report">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  รายงานคนหายตอนนี้
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Notification Request Form */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-5 w-5 text-primary" aria-hidden="true" />
            สมัครรับการแจ้งเตือนการจับคู่
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            รับการแจ้งเตือนทาง SMS/อีเมล โดยอัตโนมัติ หากมีการเพิ่มโปรไฟล์ที่ตรงกัน
          </p>
        </CardHeader>
        <CardContent>
          {isSubscribed ? (
            <div className="rounded-lg bg-success/10 border border-success/20 p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <h4 className="font-semibold text-foreground">
                การสมัครรับแจ้งเตือนทำงานแล้ว
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                คุณจะได้รับการแจ้งเตือนเมื่อพบข้อมูลที่อาจตรงกัน 
                โปรดตรวจสอบอีเมลของคุณเพื่อยืนยัน
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                รหัสการสมัคร: SUB-{Date.now().toString(36).toUpperCase()}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="relative-name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  ชื่อญาติ
                </Label>
                <Input
                  id="relative-name"
                  placeholder="ชื่อ-นามสกุล ของบุคคลที่สูญหาย"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <Shirt className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  ลักษณะร่างกาย / เสื้อผ้า / อายุ
                </Label>
                <Textarea
                  id="description"
                  placeholder="อธิบายลักษณะทางกายภาพ, เสื้อผ้าที่สวมใส่ล่าสุด, อายุโดยประมาณ, จุดสังเกต..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    เบอร์โทรศัพท์ของคุณ
                  </Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    placeholder="0XX-XXX-XXXX"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    อีเมลของคุณ
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    กำลังสมัคร...
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4" aria-hidden="true" />
                    สมัครรับการแจ้งเตือนการจับคู่
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Manual Search Board Link */}
      <Card className="border-border bg-secondary/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-foreground">
                เรียกดูประกาศสาธารณะทั้งหมด
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                ค้นหาด้วยตนเองผ่านภาพถ่ายผู้รอดชีวิตและบุคคลไม่ทราบตัวตนทั้งหมด 
                ในกรณีที่ระบบอัตโนมัติยังไม่พบข้อมูลที่ตรงกัน
              </p>
              <Button asChild variant="outline" className="mt-4 gap-2">
                <Link href="/">
                  <Search className="h-4 w-4" aria-hidden="true" />
                  เปิดกระดานค้นหา
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
