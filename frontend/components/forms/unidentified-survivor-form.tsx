"use client"

import * as React from "react"
import { FormField } from "@/components/form-field"
import { PhotoUpload } from "@/components/photo-upload"
import { IncidentSelector } from "@/components/forms/incident-selector"
import { Button } from "@/components/ui/button"
import { createPerson } from "@/lib/api"
import { useSWRConfig } from "swr"
import { CheckCircle, Heart, Loader2, Info, User, MapPin, ClipboardList, ShieldCheck, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface FormData {
  incidentId: string
  sourceSystem: string
  reportingAgency: string
  firstName: string
  lastName: string
  ageGroup: string
  gender: string
  occupation: string
  photo: File | null
  clothing: string
  locationFound: string
  timeFound: string
  physicalDescription: string
  tattoos: string
  medicalInfo: string
  identityDocs: string
  status: string
}

interface FormErrors {
  [key: string]: string
}

export function UnidentifiedSurvivorForm() {
  const { mutate } = useSWRConfig()
  const [formData, setFormData] = React.useState<FormData>({
    incidentId: "",
    sourceSystem: "",
    reportingAgency: "",
    firstName: "",
    lastName: "",
    ageGroup: "",
    gender: "",
    occupation: "",
    photo: null,
    clothing: "",
    locationFound: "",
    timeFound: "",
    physicalDescription: "",
    tattoos: "",
    medicalInfo: "",
    identityDocs: "",
    status: "มีชีวิตอยู่",
  })
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  const updateField = (field: keyof FormData) => (value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.incidentId) newErrors.incidentId = "กรุณาเลือกเหตุการณ์"
    if (!formData.sourceSystem.trim()) newErrors.sourceSystem = "กรุณาระบุระบบต้นทาง"
    if (!formData.reportingAgency.trim()) newErrors.reportingAgency = "กรุณาระบุหน่วยงานที่แจ้ง"
    if (!formData.ageGroup) newErrors.ageGroup = "กรุณาเลือกช่วงวัย"
    if (!formData.gender) newErrors.gender = "กรุณาเลือกเพศ"
    if (!formData.locationFound.trim()) newErrors.locationFound = "กรุณาระบุสถานที่ที่พบ"
    if (!formData.timeFound) newErrors.timeFound = "กรุณาระบุวันเวลาที่พบ"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    
    try {
      await createPerson({
        type: "survivor",
        status: "REPORTED",
        name: formData.firstName ? `${formData.firstName} ${formData.lastName}` : null,
        citizenId: formData.identityDocs || null,
        age: null,
        ageGroup: formData.ageGroup as any,
        gender: formData.gender as any,
        location: formData.locationFound,
        lastSeenDate: formData.timeFound,
        photoUrl: null,
        photo: formData.photo, // Pass the File object for upload
        description: `${formData.physicalDescription}\n\nตำหนิ: ${formData.tattoos}\n\nการแต่งกาย: ${formData.clothing}\n\nอาชีพ: ${formData.occupation}\n\nแพทย์: ${formData.medicalInfo}`,
        incidentId: formData.incidentId,
      })

      // Refresh all relevant global data using key matcher
      mutate((key: any) => 
        typeof key === 'string' && 
        (key.includes('persons') || key.includes('metrics') || key.includes('activities') || key.includes('reunification'))
      )

      setIsSubmitting(false)
      setIsSubmitted(true)
    } catch (e) {
      console.error("Submission failed", e)
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-success/10 p-4 mb-4">
          <CheckCircle className="h-12 w-12 text-success" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          ส่งรายงานสำเร็จแล้ว
        </h3>
        <p className="text-muted-foreground max-w-md">
          ขอบคุณที่รายงานข้อมูลผู้รอดชีวิตไม่ทราบตัวตน ข้อมูลนี้จะช่วยในการประสานงานเพื่อตามหาครอบครัวต่อไป
        </p>
        <Button
          onClick={() => {
            setIsSubmitted(false)
            setFormData({
              incidentId: "",
              sourceSystem: "",
              reportingAgency: "",
              firstName: "",
              lastName: "",
              ageGroup: "",
              gender: "",
              occupation: "",
              photo: null,
              clothing: "",
              locationFound: "",
              timeFound: "",
              physicalDescription: "",
              tattoos: "",
              medicalInfo: "",
              identityDocs: "",
              status: "มีชีวิตอยู่",
            })
          }}
          className="mt-6"
          variant="outline"
        >
          ส่งรายงานอื่นอีกครั้ง
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
        <div className="flex gap-3">
          <Heart className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-primary">
              รายงานผู้รอดชีวิตไม่ทราบตัวตน
            </p>
            <p className="text-xs text-primary/80 mt-1">
              กรุณาให้ข้อมูลที่ละเอียดที่สุดเพื่อช่วยในการระบุตัวตนและพาพวกเขากลับสู่ครอบครัว
            </p>
          </div>
        </div>
      </div>

      {/* Incident Selection */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-1 border-b">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h3 className="font-bold text-foreground text-md">เหตุการณ์ที่เกี่ยวข้อง</h3>
        </div>
        <IncidentSelector
          value={formData.incidentId}
          onChange={(value) => updateField("incidentId")(value)}
          error={errors.incidentId}
          required
        />
      </section>

      {/* Section 1: Source Info */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-1 border-b">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground text-md">ข้อมูลการแจ้งเหตุ</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="sourceSystem"
            label="ระบบต้นทางที่ส่งข้อมูลเข้ามา"
            placeholder="เช่น ระบบรวมศูนย์, แอปพลิเคชัน, หรือการแจ้งตรง"
            value={formData.sourceSystem}
            onChange={updateField("sourceSystem")}
            error={errors.sourceSystem}
            required
          />
          <FormField
            id="reportingAgency"
            label="หน่วยงานที่แจ้งข้อมูล"
            placeholder="ชื่อหน่วยงาน หรือ ศูนย์พักพิง"
            value={formData.reportingAgency}
            onChange={updateField("reportingAgency")}
            error={errors.reportingAgency}
            required
          />
        </div>
      </section>

      {/* Section 2: Personal Info */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-1 border-b">
          <User className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground text-md">ข้อมูลบุคคลนิรนาม</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="firstName"
            label="ชื่อจริงบุคคลนิรนาม (ถ้าทราบ)"
            placeholder="ไม่ระบุ"
            value={formData.firstName}
            onChange={updateField("firstName")}
          />
          <FormField
            id="lastName"
            label="นามสกุลบุคคลนิรนาม (ถ้าทราบ)"
            placeholder="ไม่ระบุ"
            value={formData.lastName}
            onChange={updateField("lastName")}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            id="ageGroup"
            label="ช่วงวัย"
            type="select"
            placeholder="เลือกช่วงวัย"
            value={formData.ageGroup}
            onChange={updateField("ageGroup")}
            error={errors.ageGroup}
            required
            options={[
              { value: "infant", label: "ทารก (0-2)" },
              { value: "child", label: "เด็ก (3-12)" },
              { value: "teen", label: "วัยรุ่น (13-19)" },
              { value: "young-adult", label: "วัยผู้ใหญ่ตอนต้น (20-35)" },
              { value: "middle-aged", label: "วัยกลางคน (36-55)" },
              { value: "elderly", label: "ผู้สูงอายุ (56+)" },
            ]}
          />
          <FormField
            id="gender"
            label="เพศสภาพ"
            type="select"
            placeholder="เลือกเพศ"
            value={formData.gender}
            onChange={updateField("gender")}
            error={errors.gender}
            required
            options={[
              { value: "male", label: "ชาย" },
              { value: "female", label: "หญิง" },
              { value: "unknown", label: "ไม่ทราบ" },
            ]}
          />
          <FormField
            id="occupation"
            label="อาชีพที่คาดคะเนได้"
            placeholder="จากเครื่องแต่งกาย/สิ่งของ"
            value={formData.occupation}
            onChange={updateField("occupation")}
          />
          <FormField
            id="status"
            label="สถานะ"
            value={formData.status}
            onChange={() => {}}
            required
            disabled={true}
            helperText="สถานะเริ่มต้นสำหรับผู้ประสบภัยที่พบตัวแล้ว"
          />
        </div>
        <div className="grid gap-4">
          <PhotoUpload
            id="survivorPhoto"
            label="รูปถ่ายบุคคลนิรนาม"
            value={formData.photo}
            onChange={updateField("photo") as (file: File | null) => void}
          />
        </div>
      </section>

      {/* Section 3: Location & Appearance */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-1 border-b">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground text-md">สถานที่และลักษณะที่พบ</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="timeFound"
            label="วันเวลาที่พบ"
            type="datetime-local"
            value={formData.timeFound}
            onChange={updateField("timeFound")}
            error={errors.timeFound}
            required
          />
          <FormField
            id="locationFound"
            label="สถานที่ที่พบ"
            type="textarea"
            placeholder="ระบุสถานที่ที่พบตัวบุคคลโดยละเอียด"
            value={formData.locationFound}
            onChange={updateField("locationFound")}
            error={errors.locationFound}
            required
          />
        </div>
        <div className="space-y-4">
          <FormField
            id="physicalDescription"
            label="รูปพรรณสัณฐาน"
            type="textarea"
            placeholder="ระบุความสูง ผม ผิวกาย และลักษณะเด่นอื่นๆ"
            value={formData.physicalDescription}
            onChange={updateField("physicalDescription")}
          />
          <FormField
            id="tattoos"
            label="รอยสัก / แผลเป็น / ตำหนิ"
            type="textarea"
            placeholder="ระบุรอยสักหรือตำหนิที่ชัดเจนตามร่างกาย"
            value={formData.tattoos}
            onChange={updateField("tattoos")}
          />
          <FormField
            id="clothing"
            label="การแต่งกาย / เครื่องประดับ / สิ่งของที่นำติดตัวไป"
            type="textarea"
            placeholder="อธิบายเสื้อผ้า เครื่องประดับ หรือกระเป๋า/ของใช้ที่พบ"
            value={formData.clothing}
            onChange={updateField("clothing")}
          />
        </div>
      </section>

      {/* Section 4: Documents & Medical */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-1 border-b">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground text-md">ข้อมูลเพิ่มเติม</h3>
        </div>
        <div className="space-y-4">
          <FormField
            id="medicalInfo"
            label="ข้อมูลทางการแพทย์"
            type="textarea"
            placeholder="โรคประจำตัว ยาประจำตัว หรือสภาพร่างกายที่ผิดปกติ"
            value={formData.medicalInfo}
            onChange={updateField("medicalInfo")}
          />
          <FormField
            id="identityDocs"
            label="เอกสารยืนยันบุคคล"
            placeholder="หากพบบัตรประชาชน หรือเอกสารอื่นๆ ให้ระบุข้อมูลที่นี่"
            value={formData.identityDocs}
            onChange={updateField("identityDocs")}
          />
        </div>
      </section>

      <div className="pt-4">
        <Button
          type="submit"
          size="lg"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-lg shadow-md transition-all active:scale-[0.98]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              กำลังส่งรายงาน...
            </>
          ) : (
            "ส่งรายงานผู้รอดชีวิต"
          )}
        </Button>
      </div>
    </form>
  )
}
