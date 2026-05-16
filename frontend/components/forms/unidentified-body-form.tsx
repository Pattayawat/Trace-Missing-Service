"use client"

import * as React from "react"
import { FormField } from "@/components/form-field"
import { PhotoUpload } from "@/components/photo-upload"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react"

interface FormData {
  foundLocation: string
  estimatedAge: string
  estimatedGender: string
  distinctFeatures: string
  clothingDescription: string
  photo: File | null
  reporterName: string
  reporterPhone: string
}

interface FormErrors {
  [key: string]: string
}

export function UnidentifiedBodyForm() {
  const [formData, setFormData] = React.useState<FormData>({
    foundLocation: "",
    estimatedAge: "",
    estimatedGender: "",
    distinctFeatures: "",
    clothingDescription: "",
    photo: null,
    reporterName: "",
    reporterPhone: "",
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

    if (!formData.foundLocation.trim()) {
      newErrors.foundLocation = "Found location is required"
    }
    if (!formData.estimatedGender) {
      newErrors.estimatedGender = "Please select estimated gender"
    }
    if (!formData.reporterPhone.trim()) {
      newErrors.reporterPhone = "Contact phone is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-success/10 p-4 mb-4">
          <CheckCircle className="h-12 w-12 text-success" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Report Submitted Successfully
        </h3>
        <p className="text-muted-foreground max-w-md">
          Your report has been received. Authorities have been notified and will investigate promptly.
        </p>
        <Button
          onClick={() => {
            setIsSubmitted(false)
            setFormData({
              foundLocation: "",
              estimatedAge: "",
              estimatedGender: "",
              distinctFeatures: "",
              clothingDescription: "",
              photo: null,
              reporterName: "",
              reporterPhone: "",
            })
          }}
          className="mt-6"
          variant="outline"
        >
          Submit Another Report
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 mb-6">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">
              Sensitive Report
            </p>
            <p className="text-xs text-destructive/80 mt-1">
              This information will be handled with care and shared only with authorized personnel. All fields marked with * are required.
            </p>
          </div>
        </div>
      </div>

      <section aria-labelledby="location-heading">
        <h3 id="location-heading" className="text-lg font-semibold text-foreground mb-4">
          Discovery Location
        </h3>
        <FormField
          id="foundLocation"
          label="Found Location"
          type="textarea"
          placeholder="Describe the exact location where the body was found (address, landmarks, coordinates if known)"
          value={formData.foundLocation}
          onChange={updateField("foundLocation")}
          error={errors.foundLocation}
          required
        />
      </section>

      <section aria-labelledby="identification-heading">
        <h3 id="identification-heading" className="text-lg font-semibold text-foreground mb-4">
          Identification Details
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="estimatedAge"
            label="Estimated Age Range"
            type="select"
            placeholder="Select range"
            value={formData.estimatedAge}
            onChange={updateField("estimatedAge")}
            error={errors.estimatedAge}
            options={[
              { value: "infant", label: "Infant (0-2)" },
              { value: "child", label: "Child (3-12)" },
              { value: "teen", label: "Teen (13-19)" },
              { value: "young-adult", label: "Young Adult (20-35)" },
              { value: "middle-aged", label: "Middle Aged (36-55)" },
              { value: "elderly", label: "Elderly (56+)" },
            ]}
          />
          <FormField
            id="estimatedGender"
            label="Estimated Gender"
            type="select"
            placeholder="Select"
            value={formData.estimatedGender}
            onChange={updateField("estimatedGender")}
            error={errors.estimatedGender}
            required
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "unknown", label: "Unknown/Undeterminable" },
            ]}
          />
        </div>
      </section>

      <section aria-labelledby="features-heading">
        <h3 id="features-heading" className="text-lg font-semibold text-foreground mb-4">
          Distinguishing Features
        </h3>
        <div className="space-y-4">
          <FormField
            id="distinctFeatures"
            label="Distinct Features / Tattoos / Birthmarks"
            type="textarea"
            placeholder="Describe any visible identifying features such as tattoos, scars, birthmarks, jewelry, or other distinguishing characteristics"
            value={formData.distinctFeatures}
            onChange={updateField("distinctFeatures")}
            error={errors.distinctFeatures}
          />
          <FormField
            id="clothingDescription"
            label="Clothing Description"
            type="textarea"
            placeholder="Describe the clothing worn, including colors, brands, condition"
            value={formData.clothingDescription}
            onChange={updateField("clothingDescription")}
            error={errors.clothingDescription}
          />
        </div>
      </section>

      <section aria-labelledby="photo-body-heading">
        <h3 id="photo-body-heading" className="text-lg font-semibold text-foreground mb-4">
          Photo Documentation
        </h3>
        <PhotoUpload
          id="bodyPhoto"
          label="Upload photo (for authorized personnel only)"
          value={formData.photo}
          onChange={updateField("photo") as (file: File | null) => void}
          error={errors.photo}
        />
      </section>

      <section aria-labelledby="reporter-heading">
        <h3 id="reporter-heading" className="text-lg font-semibold text-foreground mb-4">
          Reporter Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="reporterName"
            label="Your Name"
            placeholder="Enter your name"
            value={formData.reporterName}
            onChange={updateField("reporterName")}
            error={errors.reporterName}
          />
          <FormField
            id="reporterPhone"
            label="Phone Number"
            type="tel"
            placeholder="Your contact phone"
            value={formData.reporterPhone}
            onChange={updateField("reporterPhone")}
            error={errors.reporterPhone}
            required
            helperText="Authorities may need to contact you"
          />
        </div>
      </section>

      <div className="pt-4">
        <Button
          type="submit"
          size="lg"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting Report...
            </>
          ) : (
            "Submit Report"
          )}
        </Button>
      </div>
    </form>
  )
}
