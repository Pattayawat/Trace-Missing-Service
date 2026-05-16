"use client"

import * as React from "react"
import { Upload, X, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PhotoUploadProps {
  id: string
  label: string
  value: File | null
  onChange: (file: File | null) => void
  error?: string
}

export function PhotoUpload({ id, label, value, onChange, error }: PhotoUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [preview, setPreview] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (value) {
      const url = URL.createObjectURL(value)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    }
    setPreview(null)
  }, [value])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith("image/")) {
        onChange(file)
      }
    }
  }

  const handleRemove = () => {
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-colors",
          error ? "border-destructive bg-destructive/5" : "border-border hover:border-primary/50 bg-secondary/30"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          id={id}
          accept="image/*"
          onChange={handleFileChange}
          className="sr-only"
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {preview ? (
          <div className="relative aspect-video w-full">
            <img
              src={preview}
              alt="ตัวอย่างรูปภาพ"
              className="h-full w-full rounded-lg object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8"
              onClick={handleRemove}
              aria-label="ลบรูปภาพ"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <label
            htmlFor={id}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 p-8"
          >
            <div className="rounded-full bg-primary/10 p-4">
              <ImageIcon className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                คลิกเพื่ออัปโหลดรูปภาพ
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG หรือ GIF ขนาดไม่เกิน 10MB
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Upload className="h-3 w-3" />
              <span>ลากและวางหรือคลิกเพื่อเลือกไฟล์</span>
            </div>
          </label>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
