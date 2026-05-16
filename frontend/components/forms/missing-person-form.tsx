"use client"

import * as React from "react"
import { FormField } from "@/components/form-field"
import { PhotoUpload } from "@/components/photo-upload"
import { IncidentSelector } from "@/components/forms/incident-selector"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Save,
  Trash2,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"

interface FormData {
  // Incident selection
  incidentId: string
  // Step 1: Missing Person Info
  missingFirstName: string
  missingLastName: string
  missingAge: string
  missingGender: string
  missingIdCard: string
  missingOtherDocs: string
  missingNationality: string
  missingReligion: string
  missingStatus: string
  timeLost: string
  photo: File | null
  clothing: string
  locationLost: string
  physicalDescription: string
  tattoos: string
  medicalInfo: string

  // Step 2: Reporter Info
  reporterFirstName: string
  reporterLastName: string
  reporterAge: string
  reporterGender: string
  reporterIdCard: string
  reporterOtherDocs: string
  reporterNationality: string
  reporterPhone: string
  reporterEmail: string
  reporterAltContact: string
  relationship: string
}

interface FormErrors {
  [key: string]: string
}

const STORAGE_KEY = "missing_person_report_draft"

export function MissingPersonForm() {
  const [currentStep, setCurrentStep] = React.useState(1)
  const [formData, setFormData] = React.useState<FormData>({
    incidentId: "",
    missingFirstName: "",
    missingLastName: "",
    missingAge: "",
    missingGender: "",
    missingIdCard: "",
    missingOtherDocs: "",
    missingNationality: "ไทย",
    missingReligion: "",
    missingStatus: "",
    timeLost: "",
    photo: null,
    clothing: "",
    locationLost: "",
    physicalDescription: "",
    tattoos: "",
    medicalInfo: "",
    reporterFirstName: "",
    reporterLastName: "",
    reporterAge: "",
    reporterGender: "",
    reporterIdCard: "",
    reporterOtherDocs: "",
    reporterNationality: "ไทย",
    reporterPhone: "",
    reporterEmail: "",
    reporterAltContact: "",
    relationship: "",
  })
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  // Load draft on mount
  React.useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY)
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft)
        // Note: File objects can't be stringified/parsed. 
        // We restore everything except the photo.
        setFormData((prev) => ({ ...prev, ...parsed, photo: null }))
      } catch (e) {
        console.error("Failed to parse draft", e)
      }
    }
  }, [])

  // Save draft on change
  React.useEffect(() => {
    const { photo, ...dataToSave } = formData
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
  }, [formData])

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

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {}

    if (step === 1) {
      if (!formData.incidentId) newErrors.incidentId = "กรุณาเลือกเหตุการณ์"
      if (!formData.missingFirstName.trim()) newErrors.missingFirstName = "กรุณาระบุชื่อจริง"
      if (!formData.missingLastName.trim()) newErrors.missingLastName = "กรุณาระบุนามสกุล"
      if (!formData.missingAge.trim()) newErrors.missingAge = "กรุณาระบุอายุ"
      if (!formData.missingGender) newErrors.missingGender = "กรุณาเลือกเพศ"
      if (!formData.timeLost) newErrors.timeLost = "กรุณาระบุวันเวลาที่สูญหาย"
      if (!formData.locationLost.trim()) newErrors.locationLost = "กรุณาระบุสถานที่ที่สูญหาย"
    } else if (step === 2) {
      if (!formData.reporterFirstName.trim()) newErrors.reporterFirstName = "กรุณาระบุชื่อจริง"
      if (!formData.reporterLastName.trim()) newErrors.reporterLastName = "กรุณาระบุนามสกุล"
      if (!formData.reporterPhone.trim()) newErrors.reporterPhone = "กรุณาระบุเบอร์โทรศัพท์"
      if (!formData.relationship.trim()) newErrors.relationship = "กรุณาระบุความเกี่ยวข้อง"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo(0, 0)
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1)
    window.scrollTo(0, 0)
  }

  const handleSubmit = async () => {
    if (!validateStep(2)) return

    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    setIsSubmitted(true)
    localStorage.removeItem(STORAGE_KEY)
  }

  const clearDraft = () => {
    if (confirm("คุณต้องการล้างข้อมูลที่บันทึกไว้ใช่หรือไม่?")) {
      localStorage.removeItem(STORAGE_KEY)
      window.location.reload()
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-success/10 p-4 mb-4">
          <CheckCircle className="h-12 w-12 text-success" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          ส่งรายงานเรียบร้อยแล้ว
        </h3>
        <p className="text-muted-foreground max-w-md">
          ได้รับรายงานคนหายของคุณแล้ว ทีมตอบโต้ฉุกเฉินจะตรวจสอบข้อมูลนี้และดำเนินการประสานงานทันที
        </p>
        <Button
          onClick={() => {
            setIsSubmitted(false)
            setCurrentStep(1)
            setFormData({
              incidentId: "",
              missingFirstName: "",
              missingLastName: "",
              missingAge: "",
              missingGender: "",
              missingIdCard: "",
              missingOtherDocs: "",
              missingNationality: "ไทย",
              missingReligion: "",
              missingStatus: "",
              timeLost: "",
              photo: null,
              clothing: "",
              locationLost: "",
              physicalDescription: "",
              tattoos: "",
              medicalInfo: "",
              reporterFirstName: "",
              reporterLastName: "",
              reporterAge: "",
              reporterGender: "",
              reporterIdCard: "",
              reporterOtherDocs: "",
              reporterNationality: "ไทย",
              reporterPhone: "",
              reporterEmail: "",
              reporterAltContact: "",
              relationship: "",
            })
          }}
          className="mt-6"
          variant="outline"
        >
          ส่งรายงานอื่นเพิ่ม
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress & Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-primary">
              ขั้นตอนที่ {currentStep} จาก 2: {currentStep === 1 ? "ข้อมูลผู้สูญหาย" : "ข้อมูลผู้แจ้ง"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {currentStep === 1 
                ? "โปรดระบุรายละเอียดของผู้ที่หายไปให้ครบถ้วนที่สุด" 
                : "ข้อมูลของคุณจะถูกใช้เพื่อการติดต่อและยืนยันตัวตนเท่านั้น"}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={clearDraft} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">ล้างข้อมูล</span>
          </Button>
        </div>
        <Progress value={currentStep === 1 ? 50 : 100} className="h-2" />
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        {currentStep === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Incident Selection */}
            <section className="space-y-4">
              <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
                <div className="h-1 w-4 bg-destructive rounded-full" />
                เหตุการณ์ที่เกี่ยวข้อง
              </h3>
              <IncidentSelector
                value={formData.incidentId}
                onChange={(value) => updateField("incidentId")(value)}
                error={errors.incidentId}
                required
              />
            </section>

            {/* Essential Info */}
            <section className="space-y-4">
              <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
                <div className="h-1 w-4 bg-primary rounded-full" />
                ข้อมูลพื้นฐาน
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="missingFirstName"
                  label="ชื่อจริง"
                  placeholder="ระบุชื่อจริง"
                  value={formData.missingFirstName}
                  onChange={updateField("missingFirstName")}
                  error={errors.missingFirstName}
                  required
                />
                <FormField
                  id="missingLastName"
                  label="นามสกุล"
                  placeholder="ระบุนามสกุล"
                  value={formData.missingLastName}
                  onChange={updateField("missingLastName")}
                  error={errors.missingLastName}
                  required
                />
              </div>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
                <FormField
                  id="missingAge"
                  label="อายุ"
                  type="number"
                  placeholder="ปี"
                  value={formData.missingAge}
                  onChange={updateField("missingAge")}
                  error={errors.missingAge}
                  required
                />
                <FormField
                  id="missingGender"
                  label="เพศ"
                  type="select"
                  placeholder="เลือกเพศ"
                  value={formData.missingGender}
                  onChange={updateField("missingGender")}
                  error={errors.missingGender}
                  required
                  options={[
                    { value: "male", label: "ชาย" },
                    { value: "female", label: "หญิง" },
                    { value: "other", label: "อื่นๆ" },
                  ]}
                />
                <div className="col-span-2 sm:col-span-1">
                  <FormField
                    id="missingNationality"
                    label="สัญชาติ"
                    placeholder="ระบุสัญชาติ"
                    value={formData.missingNationality}
                    onChange={updateField("missingNationality")}
                  />
                </div>
              </div>
            </section>

            {/* Identification */}
            <section className="space-y-4">
              <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
                <div className="h-1 w-4 bg-primary rounded-full" />
                การยืนยันตัวตน
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="missingIdCard"
                  label="เลขบัตรประชาชน"
                  placeholder="1-XXXX-XXXXX-XX-X"
                  value={formData.missingIdCard}
                  onChange={updateField("missingIdCard")}
                />
                <FormField
                  id="missingOtherDocs"
                  label="เอกสารยืนยันตัวตนอื่นๆ"
                  placeholder="เช่น เลขพาสปอร์ต หรือข้อมูลเอกสารอื่น"
                  value={formData.missingOtherDocs}
                  onChange={updateField("missingOtherDocs")}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="missingReligion"
                  label="ศาสนา"
                  placeholder="ระบุศาสนา"
                  value={formData.missingReligion}
                  onChange={updateField("missingReligion")}
                />
                <FormField
                  id="missingStatus"
                  label="สถานภาพ"
                  type="select"
                  placeholder="เลือกสถานภาพ"
                  value={formData.missingStatus}
                  onChange={updateField("missingStatus")}
                  options={[
                    { value: "single", label: "โสด" },
                    { value: "married", label: "สมรส" },
                    { value: "divorced", label: "หย่าร้าง" },
                    { value: "widowed", label: "หม้าย" },
                  ]}
                />
              </div>
            </section>

            {/* Event Details */}
            <section className="space-y-4">
              <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
                <div className="h-1 w-4 bg-primary rounded-full" />
                รายละเอียดการสูญหาย
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="timeLost"
                  label="วันเวลาที่สูญหาย"
                  type="datetime-local"
                  value={formData.timeLost}
                  onChange={updateField("timeLost")}
                  error={errors.timeLost}
                  required
                />
                <FormField
                  id="locationLost"
                  label="สถานที่ที่สูญหาย / พบเห็นล่าสุด"
                  type="textarea"
                  placeholder="ระบุที่อยู่ จุดสังเกต หรือพื้นที่ที่พบเห็นล่าสุด"
                  value={formData.locationLost}
                  onChange={updateField("locationLost")}
                  error={errors.locationLost}
                  required
                />
              </div>
            </section>

            {/* Appearance */}
            <section className="space-y-4">
              <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
                <div className="h-1 w-4 bg-primary rounded-full" />
                รูปลักษณ์และจุดสังเกต
              </h3>
              <div className="space-y-4">
                <PhotoUpload
                  id="missingPersonPhoto"
                  label="รูปถ่ายผู้สูญหาย"
                  value={formData.photo}
                  onChange={updateField("photo") as (file: File | null) => void}
                />
                <FormField
                  id="physicalDescription"
                  label="รูปพรรณสัณฐาน"
                  type="textarea"
                  placeholder="สีผิว ทรงผม ส่วนสูง น้ำหนัก หรือลักษณะเด่นบนใบหน้า"
                  value={formData.physicalDescription}
                  onChange={updateField("physicalDescription")}
                />
                <FormField
                  id="tattoos"
                  label="รอยสัก / แผลเป็น / ตำหนิ"
                  type="textarea"
                  placeholder="ระบุรอยสัก แผลเป็น หรือปานตามร่างกาย"
                  value={formData.tattoos}
                  onChange={updateField("tattoos")}
                />
                <FormField
                  id="clothing"
                  label="การแต่งกายและสิ่งของที่นำติดตัวไป"
                  type="textarea"
                  placeholder="เสื้อผ้าที่สวมใส่ เครื่องประดับ หรือกระเป๋า/สิ่งของที่พกติดตัว"
                  value={formData.clothing}
                  onChange={updateField("clothing")}
                />
              </div>
            </section>

            {/* Medical */}
            <section className="space-y-4">
              <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
                <div className="h-1 w-4 bg-primary rounded-full" />
                ข้อมูลทางการแพทย์
              </h3>
              <FormField
                id="medicalInfo"
                label="โรคประจำตัว / ยาที่ต้องใช้ประจำ"
                type="textarea"
                placeholder="ระบุโรคประจำตัว ข้อมูลแพ้ยา หรือความต้องการทางการแพทย์พิเศษ"
                value={formData.medicalInfo}
                onChange={updateField("medicalInfo")}
              />
            </section>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Reporter Info */}
            <section className="space-y-4">
              <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
                <div className="h-1 w-4 bg-primary rounded-full" />
                ข้อมูลผู้แจ้ง
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="reporterFirstName"
                  label="ชื่อจริง"
                  placeholder="ระบุชื่อจริงของผู้แจ้ง"
                  value={formData.reporterFirstName}
                  onChange={updateField("reporterFirstName")}
                  error={errors.reporterFirstName}
                  required
                />
                <FormField
                  id="reporterLastName"
                  label="นามสกุล"
                  placeholder="ระบุนามสกุลของผู้แจ้ง"
                  value={formData.reporterLastName}
                  onChange={updateField("reporterLastName")}
                  error={errors.reporterLastName}
                  required
                />
              </div>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
                <FormField
                  id="reporterAge"
                  label="อายุ"
                  type="number"
                  placeholder="ปี"
                  value={formData.reporterAge}
                  onChange={updateField("reporterAge")}
                />
                <FormField
                  id="reporterGender"
                  label="เพศ"
                  type="select"
                  placeholder="เลือกเพศ"
                  value={formData.reporterGender}
                  onChange={updateField("reporterGender")}
                  options={[
                    { value: "male", label: "ชาย" },
                    { value: "female", label: "หญิง" },
                    { value: "other", label: "อื่นๆ" },
                  ]}
                />
                <div className="col-span-2 sm:col-span-1">
                  <FormField
                    id="reporterNationality"
                    label="สัญชาติ"
                    placeholder="ระบุสัญชาติ"
                    value={formData.reporterNationality}
                    onChange={updateField("reporterNationality")}
                  />
                </div>
              </div>
            </section>

            {/* Reporter Identification */}
            <section className="space-y-4">
              <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
                <div className="h-1 w-4 bg-primary rounded-full" />
                การยืนยันตัวตนผู้แจ้ง
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="reporterIdCard"
                  label="เลขบัตรประชาชน"
                  placeholder="1-XXXX-XXXXX-XX-X"
                  value={formData.reporterIdCard}
                  onChange={updateField("reporterIdCard")}
                />
                <FormField
                  id="reporterOtherDocs"
                  label="เอกสารอื่นๆ"
                  placeholder="ข้อมูลเอกสารยืนยันตัวตนอื่นๆ"
                  value={formData.reporterOtherDocs}
                  onChange={updateField("reporterOtherDocs")}
                />
              </div>
            </section>

            {/* Contact Info */}
            <section className="space-y-4">
              <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
                <div className="h-1 w-4 bg-primary rounded-full" />
                ข้อมูลการติดต่อ
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="reporterPhone"
                  label="เบอร์โทรศัพท์"
                  type="tel"
                  placeholder="0XX-XXX-XXXX"
                  value={formData.reporterPhone}
                  onChange={updateField("reporterPhone")}
                  error={errors.reporterPhone}
                  required
                />
                <FormField
                  id="reporterEmail"
                  label="อีเมล"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.reporterEmail}
                  onChange={updateField("reporterEmail")}
                />
              </div>
              <FormField
                id="reporterAltContact"
                label="ช่องทางการติดต่ออื่นๆ"
                placeholder="เช่น LINE ID, Facebook หรือเบอร์สำรอง"
                value={formData.reporterAltContact}
                onChange={updateField("reporterAltContact")}
              />
            </section>

            {/* Relationship */}
            <section className="space-y-4">
              <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
                <div className="h-1 w-4 bg-primary rounded-full" />
                ความเกี่ยวข้อง
              </h3>
              <FormField
                id="relationship"
                label="ความเกี่ยวข้องกับผู้สูญหาย"
                placeholder="เช่น พ่อ แม่ พี่น้อง เพื่อน หรือผู้พบเห็นเหตุการณ์"
                value={formData.relationship}
                onChange={updateField("relationship")}
                error={errors.relationship}
                required
              />
            </section>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              ย้อนกลับ
            </Button>
          )}
          
          {currentStep < 2 ? (
            <Button
              type="button"
              size="lg"
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleNext}
            >
              ต่อไป
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  size="lg"
                  className="flex-1 bg-primary hover:bg-primary/90 font-bold"
                  disabled={isSubmitting}
                >
                  ตรวจสอบและส่งรายงาน
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>ยืนยันการส่งรายงาน</AlertDialogTitle>
                  <AlertDialogDescription>
                    กรุณาตรวจสอบข้อมูลอีกครั้งก่อนส่ง ข้อมูลที่ท่านแจ้งจะเป็นข้อมูลสำคัญในการช่วยติดตามหาผู้สูญหาย
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4 space-y-4 max-h-[60vh] overflow-auto">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <p className="font-semibold col-span-2 text-primary border-b pb-1">ผู้สูญหาย</p>
                    <p className="text-muted-foreground">ชื่อ-นามสกุล:</p>
                    <p>{formData.missingFirstName} {formData.missingLastName}</p>
                    <p className="text-muted-foreground">อายุ/เพศ:</p>
                    <p>{formData.missingAge} ปี / {formData.missingGender === "male" ? "ชาย" : formData.missingGender === "female" ? "หญิง" : "อื่นๆ"}</p>
                    <p className="text-muted-foreground">วันเวลาที่หาย:</p>
                    <p>{formData.timeLost ? new Date(formData.timeLost).toLocaleString("th-TH") : "-"}</p>
                    <p className="text-muted-foreground">สถานที่:</p>
                    <p>{formData.locationLost}</p>
                    
                    <p className="font-semibold col-span-2 text-primary border-b pb-1 mt-2">ผู้แจ้ง</p>
                    <p className="text-muted-foreground">ชื่อ-นามสกุล:</p>
                    <p>{formData.reporterFirstName} {formData.reporterLastName}</p>
                    <p className="text-muted-foreground">เบอร์โทรศัพท์:</p>
                    <p>{formData.reporterPhone}</p>
                    <p className="text-muted-foreground">ความเกี่ยวข้อง:</p>
                    <p>{formData.relationship}</p>
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>กลับไปแก้ไข</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
                    ยืนยันการส่งข้อมูล
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </form>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
            <p className="font-medium text-foreground">กำลังส่งรายงาน...</p>
          </div>
        </div>
      )}
    </div>
  )
}
