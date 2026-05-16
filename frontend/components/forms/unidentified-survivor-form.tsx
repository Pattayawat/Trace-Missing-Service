"use client"

import * as React from "react"
import { FormField } from "@/components/form-field"
import { PhotoUpload } from "@/components/photo-upload"
import { Button } from "@/components/ui/button"
import { CheckCircle, Heart, Loader2 } from "lucide-react"

interface FormData {
  currentLocation: string
  physicalCondition: string
  clothingDescription: string
  approximateAge: string
  gender: string
  distinctFeatures: string
  photo: File | null
  reporterName: string
  reporterPhone: string
}

interface FormErrors {
  [key: string]: string
}

export function UnidentifiedSurvivorForm() {
  const [formData, setFormData] = React.useState<FormData>({
    currentLocation: "",
    physicalCondition: "",
    clothingDescription: "",
    approximateAge: "",
    gender: "",
    distinctFeatures: "",
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

    if (!formData.currentLocation.trim()) {
      newErrors.currentLocation = "Current location is required"
    }
    if (!formData.physicalCondition) {
      newErrors.physicalCondition = "Please select physical condition"
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
          Thank you for reporting this survivor. This information will help reunite them with their loved ones.
        </p>
        <Button
          onClick={() => {
            setIsSubmitted(false)
            setFormData({
              currentLocation: "",
              physicalCondition: "",
              clothingDescription: "",
              approximateAge: "",
              gender: "",
              distinctFeatures: "",
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
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 mb-6">
        <div className="flex gap-3">
          <Heart className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-primary">
              Help Reunite Families
            </p>
            <p className="text-xs text-primary/80 mt-1">
              Your report can help connect unidentified survivors with their searching families. All fields marked with * are required.
            </p>
          </div>
        </div>
      </div>

      <section aria-labelledby="survivor-location-heading">
        <h3 id="survivor-location-heading" className="text-lg font-semibold text-foreground mb-4">
          Current Location
        </h3>
        <FormField
          id="currentLocation"
          label="Current Location / Shelter / Hospital"
          type="textarea"
          placeholder="Specify the shelter name, hospital, evacuation center, or current address where the survivor is located"
          value={formData.currentLocation}
          onChange={updateField("currentLocation")}
          error={errors.currentLocation}
          required
        />
      </section>

      <section aria-labelledby="survivor-condition-heading">
        <h3 id="survivor-condition-heading" className="text-lg font-semibold text-foreground mb-4">
          Physical Condition
        </h3>
        <FormField
          id="physicalCondition"
          label="Physical Condition"
          type="select"
          placeholder="Select condition"
          value={formData.physicalCondition}
          onChange={updateField("physicalCondition")}
          error={errors.physicalCondition}
          required
          options={[
            { value: "stable", label: "Stable - No apparent injuries" },
            { value: "minor-injuries", label: "Minor Injuries" },
            { value: "moderate-injuries", label: "Moderate Injuries - Medical attention needed" },
            { value: "severe-injuries", label: "Severe Injuries - Critical care" },
            { value: "unconscious", label: "Unconscious/Unresponsive" },
            { value: "disoriented", label: "Disoriented/Confused" },
          ]}
        />
      </section>

      <section aria-labelledby="survivor-details-heading">
        <h3 id="survivor-details-heading" className="text-lg font-semibold text-foreground mb-4">
          Survivor Details
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="approximateAge"
            label="Approximate Age"
            type="select"
            placeholder="Select range"
            value={formData.approximateAge}
            onChange={updateField("approximateAge")}
            error={errors.approximateAge}
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
            id="gender"
            label="Gender"
            type="select"
            placeholder="Select"
            value={formData.gender}
            onChange={updateField("gender")}
            error={errors.gender}
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "unknown", label: "Unknown" },
            ]}
          />
        </div>
        <div className="mt-4 space-y-4">
          <FormField
            id="clothingDescription"
            label="Clothing Description"
            type="textarea"
            placeholder="Describe what the survivor is wearing"
            value={formData.clothingDescription}
            onChange={updateField("clothingDescription")}
            error={errors.clothingDescription}
          />
          <FormField
            id="distinctFeatures"
            label="Distinguishing Features"
            type="textarea"
            placeholder="Any visible identifying features (tattoos, scars, birthmarks, jewelry)"
            value={formData.distinctFeatures}
            onChange={updateField("distinctFeatures")}
            error={errors.distinctFeatures}
          />
        </div>
      </section>

      <section aria-labelledby="survivor-photo-heading">
        <h3 id="survivor-photo-heading" className="text-lg font-semibold text-foreground mb-4">
          Photo
        </h3>
        <PhotoUpload
          id="survivorPhoto"
          label="Upload a photo of the survivor"
          value={formData.photo}
          onChange={updateField("photo") as (file: File | null) => void}
          error={errors.photo}
        />
      </section>

      <section aria-labelledby="survivor-reporter-heading">
        <h3 id="survivor-reporter-heading" className="text-lg font-semibold text-foreground mb-4">
          Reporter Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="survivorReporterName"
            label="Your Name"
            placeholder="Enter your name"
            value={formData.reporterName}
            onChange={updateField("reporterName")}
            error={errors.reporterName}
          />
          <FormField
            id="survivorReporterPhone"
            label="Phone Number"
            type="tel"
            placeholder="Your contact phone"
            value={formData.reporterPhone}
            onChange={updateField("reporterPhone")}
            error={errors.reporterPhone}
            required
            helperText="We may need to contact you for additional details"
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
            "Submit Survivor Report"
          )}
        </Button>
      </div>
    </form>
  )
}
