"use client"

import React, { useRef, useState } from "react"
import { ArrowDown, ArrowUp, ImageIcon, Loader2, Plus, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { SectionField } from "@/lib/homepage-content"
import { toast } from "sonner"

/* -------------------------------------------------------------------------- */
/* Path helpers                                                               */
/* -------------------------------------------------------------------------- */

type Json = Record<string, unknown>

export function getByPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return (value as Json)[key]
    }
    return undefined
  }, source)
}

/** Immutable deep set supporting dotted paths. */
export function setByPath<T extends Json>(source: T, path: string, value: unknown): T {
  const keys = path.split(".")
  const clone: Json = { ...source }

  let cursor: Json = clone
  for (let index = 0; index < keys.length - 1; index += 1) {
    const key = keys[index]
    const current = cursor[key]
    const next = current && typeof current === "object" && !Array.isArray(current) ? { ...(current as Json) } : {}
    cursor[key] = next
    cursor = next
  }
  cursor[keys[keys.length - 1]] = value
  return clone as T
}

/* -------------------------------------------------------------------------- */
/* Image upload                                                               */
/* -------------------------------------------------------------------------- */

export function ImageUploadField({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (value: string) => void
  label: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const body = new FormData()
      body.append("file", file)
      const response = await fetch("/api/admin/homepage/upload", { method: "POST", body })
      const data = await response.json().catch(() => null)
      if (!response.ok || !data?.url) {
        throw new Error(data?.error || "Upload failed")
      }
      onChange(data.url as string)
      toast.success("Image uploaded")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-start gap-3">
        <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-muted bg-muted/40">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageIcon className="h-6 w-6" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <Input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="/uploads/homepage/... or https://..."
          />
          <div className="flex flex-wrap gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void handleFile(file)
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {uploading ? "Uploading..." : "Upload image"}
            </Button>
            {value && (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">JPG, PNG, WebP or GIF · up to 8 MB</p>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Field renderer                                                             */
/* -------------------------------------------------------------------------- */

interface FieldRendererProps {
  field: SectionField
  value: unknown
  onChange: (value: unknown) => void
}

/** Build a blank item for a groupList, honouring declared defaults. */
function buildBlankItem(fields: SectionField[]): Json {
  const item: Json = {}
  for (const field of fields) {
    if (field.name.includes(".")) continue
    switch (field.type) {
      case "number":
        item[field.name] = field.defaultValue ?? field.min ?? 0
        break
      case "stringList":
        item[field.name] = []
        break
      case "groupList":
        item[field.name] = []
        break
      case "group":
        item[field.name] = {}
        break
      default:
        item[field.name] = field.defaultValue ?? ""
    }
  }
  return item
}

function FieldRenderer({ field, value, onChange }: FieldRendererProps) {
  if (field.type === "stringList") {
    const items = Array.isArray(value) ? (value as string[]) : []
    const max = field.maxItems ?? 12
    return (
      <div className="space-y-2">
        <Label>{field.label}</Label>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={item}
                placeholder={field.placeholder}
                onChange={(event) => {
                  const next = [...items]
                  next[index] = event.target.value
                  onChange(next)
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove ${field.itemLabel ?? "item"} ${index + 1}`}
                onClick={() => onChange(items.filter((_, i) => i !== index))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        {items.length < max && (
          <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, ""])}>
            <Plus className="mr-2 h-4 w-4" />
            Add {field.itemLabel ?? "item"}
          </Button>
        )}
      </div>
    )
  }

  if (field.type === "group") {
    const groupValue =
      value && typeof value === "object" && !Array.isArray(value) ? (value as Json) : {}
    return (
      <div className="space-y-3 rounded-xl border border-muted bg-muted/10 p-4">
        <Label>{field.label}</Label>
        {field.fields.map((child) => (
          <FieldRenderer
            key={child.name}
            field={child}
            value={getByPath(groupValue, child.name)}
            onChange={(childValue) => onChange(setByPath(groupValue, child.name, childValue))}
          />
        ))}
      </div>
    )
  }

  if (field.type === "groupList") {
    const items = Array.isArray(value) ? (value as Json[]) : []
    const max = field.maxItems ?? 8

    const move = (index: number, direction: -1 | 1) => {
      const target = index + direction
      if (target < 0 || target >= items.length) return
      const next = [...items]
      const [moved] = next.splice(index, 1)
      next.splice(target, 0, moved)
      onChange(next)
    }

    return (
      <div className="space-y-3">
        <Label>{field.label}</Label>
        {items.length === 0 && (
          <p className="rounded-lg border border-dashed border-muted-foreground/30 p-4 text-sm text-muted-foreground">
            Nothing added yet.
          </p>
        )}
        {items.map((item, index) => (
          <div key={index} className="rounded-xl border border-muted bg-muted/20 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {field.itemLabel} {index + 1}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Move up"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Move down"
                  disabled={index === items.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${field.itemLabel} ${index + 1}`}
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {field.fields.map((child) => (
                <FieldRenderer
                  key={child.name}
                  field={child}
                  value={getByPath(item, child.name)}
                  onChange={(childValue) => {
                    const next = [...items]
                    next[index] = setByPath(item, child.name, childValue)
                    onChange(next)
                  }}
                />
              ))}
            </div>
          </div>
        ))}
        {items.length < max && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange([...items, buildBlankItem(field.fields)])}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add {field.itemLabel}
          </Button>
        )}
      </div>
    )
  }

  if (field.type === "image") {
    return (
      <ImageUploadField
        label={field.label}
        value={typeof value === "string" ? value : ""}
        onChange={onChange}
      />
    )
  }

  if (field.type === "number") {
    const numeric = typeof value === "number" ? value : Number(value) || 0
    return (
      <div className="space-y-2">
        <Label>{field.label}</Label>
        <Input
          type="number"
          min={field.min}
          max={field.max}
          value={Number.isFinite(numeric) ? numeric : ""}
          onChange={(event) => {
            const next = event.target.value === "" ? field.min ?? 0 : Number(event.target.value)
            onChange(next)
          }}
        />
        {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
      </div>
    )
  }

  if (field.type === "textarea") {
    return (
      <div className="space-y-2">
        <Label>{field.label}</Label>
        <Textarea
          value={typeof value === "string" ? value : ""}
          placeholder={field.placeholder}
          rows={3}
          onChange={(event) => onChange(event.target.value)}
        />
        {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label>{field.label}</Label>
      <Input
        value={typeof value === "string" || typeof value === "number" ? String(value) : ""}
        placeholder={field.placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
    </div>
  )
}

/**
 * Renders a list of field definitions against a JSON object.
 * Used for section copy, site blocks and slide content.
 */
export function ContentFields({
  fields,
  value,
  onChange,
}: {
  fields: SectionField[]
  value: Json
  onChange: (value: Json) => void
}) {
  return (
    <div className="space-y-5">
      {fields.map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          value={getByPath(value, field.name)}
          onChange={(next) => onChange(setByPath(value, field.name, next))}
        />
      ))}
    </div>
  )
}
