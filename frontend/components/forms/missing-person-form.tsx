"use client"

import * as React from "react"
import { FormField } from "@/components/form-field"
import { PhotoUpload } from "@/components/photo-upload"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface FormData {
  fullName: string
  age: string
  gender: string
  lastSeenLocation: string
  lastSeenClothing: string
  photo: File | null
  contactName: string
  contactPhone: string
  contactEmail: string
}

interface FormErrors {
  [key: string]: string
}

export function MissingPersonForm() {
  const [formData, setFormData] = React.useState<FormData>({
    fullName: "",
    age: "",
    gender: "",
    lastSeenLocation: "",
    lastSeenClothing: "",
    photo: null,
    contactName: "",
    contactPhone: "",
    contactEmail: "",
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

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }
    if (!formData.age.trim()) {
      newErrors.age = "Age is required"
    } else if (isNaN(Number(formData.age)) || Number(formData.age) < 0) {
      newErrors.age = "Please enter a valid age"
    }
    if (!formData.gender) {
      newErrors.gender = "Please select a gender"
    }
    if (!formData.lastSeenLocation.trim()) {
      newErrors.lastSeenLocation = "Last seen location is required"
    }
    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = "Contact phone is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    // Simulate API call
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
          Your missing person report has been received. Emergency response teams will review this information immediately.
        </p>
        <Button
          onClick={() => {
            setIsSubmitted(false)
            setFormData({
              fullName: "",
              age: "",
              gender: "",
              lastSeenLocation: "",
              lastSeenClothing: "",
              photo: null,
              contactName: "",
              contactPhone: "",
              contactEmail: "",
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
      <div className="rounded-lg border border-accent/50 bg-accent/10 p-4 mb-6">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-accent-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-accent-foreground">
              Time-Sensitive Information
            </p>
            <p className="text-xs text-accent-foreground/80 mt-1">
              Please provide as much detail as possible. All fields marked with * are required.
            </p>
          </div>
        </div>
      </div>

      <section aria-labelledby="person-info-heading">
        <h3 id="person-info-heading" className="text-lg font-semibold text-foreground mb-4">
          Person Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="fullName"
            label="Full Name"
            placeholder="Enter full name"
            value={formData.fullName}
            onChange={updateField("fullName")}
            error={errors.fullName}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="age"
              label="Age"
              type="number"
              placeholder="Age"
              value={formData.age}
              onChange={updateField("age")}
              error={errors.age}
              required
            />
            <FormField
              id="gender"
              label="Gender"
              type="select"
              placeholder="Select"
              value={formData.gender}
              onChange={updateField("gender")}
              error={errors.gender}
              required
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
                { value: "unknown", label: "Unknown" },
              ]}
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="last-seen-heading">
        <h3 id="last-seen-heading" className="text-lg font-semibold text-foreground mb-4">
          Last Seen Details
        </h3>
        <div className="space-y-4">
          <FormField
            id="lastSeenLocation"
            label="Last Seen Location"
            type="textarea"
            placeholder="Describe the location where the person was last seen (address, landmarks, area)"
            value={formData.lastSeenLocation}
            onChange={updateField("lastSeenLocation")}
            error={errors.lastSeenLocation}
            required
          />
          <FormField
            id="lastSeenClothing"
            label="Last Seen Clothing"
            type="textarea"
            placeholder="Describe what the person was wearing when last seen"
            value={formData.lastSeenClothing}
            onChange={updateField("lastSeenClothing")}
            error={errors.lastSeenClothing}
          />
        </div>
      </section>

      <section aria-labelledby="photo-heading">
        <h3 id="photo-heading" className="text-lg font-semibold text-foreground mb-4">
          Photo
        </h3>
        <PhotoUpload
          id="missingPersonPhoto"
          label="Upload a recent photo (if available)"
          value={formData.photo}
          onChange={updateField("photo") as (file: File | null) => void}
          error={errors.photo}
        />
      </section>

      <section aria-labelledby="contact-heading">
        <h3 id="contact-heading" className="text-lg font-semibold text-foreground mb-4">
          Reporter Contact Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="contactName"
            label="Your Name"
            placeholder="Enter your name"
            value={formData.contactName}
            onChange={updateField("contactName")}
            error={errors.contactName}
          />
          <FormField
            id="contactPhone"
            label="Phone Number"
            type="tel"
            placeholder="Your contact phone"
            value={formData.contactPhone}
            onChange={updateField("contactPhone")}
            error={errors.contactPhone}
            required
            helperText="We may need to contact you for additional information"
          />
        </div>
        <div className="mt-4">
          <FormField
            id="contactEmail"
            label="Email Address"
            type="email"
            placeholder="your.email@example.com"
            value={formData.contactEmail}
            onChange={updateField("contactEmail")}
            error={errors.contactEmail}
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
            "Submit Missing Person Report"
          )}
        </Button>
      </div>
    </form>
  )
}
