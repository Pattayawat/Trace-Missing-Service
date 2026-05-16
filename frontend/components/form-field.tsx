"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FormFieldProps {
  id: string
  label: string
  type?: "text" | "number" | "tel" | "email" | "textarea" | "select" | "datetime-local" | "date"
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  options?: { value: string; label: string }[]
  helperText?: string
  disabled?: boolean
}

export function FormField({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required,
  options,
  helperText,
  disabled,
}: FormFieldProps) {
  const inputId = `field-${id}`
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`

  const renderInput = () => {
    const baseProps = {
      id: inputId,
      placeholder,
      "aria-invalid": !!error,
      "aria-describedby": error ? errorId : helperText ? helperId : undefined,
      required,
      disabled,
    }

    if (type === "textarea") {
      return (
        <Textarea
          {...baseProps}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "min-h-[100px] resize-none",
            error && "border-destructive focus-visible:ring-destructive/30"
          )}
        />
      )
    }

    if (type === "select" && options) {
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger
            id={inputId}
            className={cn(
              "w-full",
              error && "border-destructive focus-visible:ring-destructive/30"
            )}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    return (
      <Input
        {...baseProps}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          error && "border-destructive focus-visible:ring-destructive/30"
        )}
      />
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className="text-foreground">
        {label}
        {required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
      </Label>
      {renderInput()}
      {helperText && !error && (
        <p id={helperId} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
