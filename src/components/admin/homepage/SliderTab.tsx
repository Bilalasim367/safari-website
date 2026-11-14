"use client"

import React, { useMemo, useState } from "react"
import {
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ImageUploadField } from "@/components/admin/homepage/fields"
import type { PromoSlide } from "@/lib/homepage-content"
import { toast } from "sonner"

interface SlideDraft {
  eyebrow: string
  title: string
  subtitle: string
  imageDesktop: string
  imageMobile: string
  imageAlt: string
  href: string
  ctaLabel: string
  openInNewTab: boolean
  isActive: boolean
  startsAt: string
  endsAt: string
}

const EMPTY_DRAFT: SlideDraft = {
  eyebrow: "",
  title: "",
  subtitle: "",
  imageDesktop: "",
  imageMobile: "",
  imageAlt: "",
  href: "",
  ctaLabel: "",
  openInNewTab: false,
  isActive: true,
  startsAt: "",
  endsAt: "",
}

function toLocalInput(iso: string | null): string {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`
}

function fromLocalInput(value: string): string | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function draftFromSlide(slide: PromoSlide): SlideDraft {
  return {
    eyebrow: slide.eyebrow ?? "",
    title: slide.title ?? "",
    subtitle: slide.subtitle ?? "",
    imageDesktop: slide.imageDesktop,
    imageMobile: slide.imageMobile ?? "",
    imageAlt: slide.imageAlt ?? "",
    href: slide.href ?? "",
    ctaLabel: slide.ctaLabel ?? "",
    openInNewTab: slide.openInNewTab,
    isActive: slide.isActive,
    startsAt: toLocalInput(slide.startsAt),
    endsAt: toLocalInput(slide.endsAt),
  }
}

function slidePayload(slide: PromoSlide, overrides: Record<string, unknown> = {}) {
  return {
    eyebrow: slide.eyebrow ?? "",
    title: slide.title ?? "",
    subtitle: slide.subtitle ?? "",
    imageDesktop: slide.imageDesktop,
    imageMobile: slide.imageMobile ?? "",
    imageAlt: slide.imageAlt ?? "",
    href: slide.href ?? "",
    ctaLabel: slide.ctaLabel ?? "",
    openInNewTab: slide.openInNewTab,
    isActive: slide.isActive,
    startsAt: slide.startsAt,
    endsAt: slide.endsAt,
    sortOrder: slide.sortOrder,
    ...overrides,
  }
}

function slideStatus(slide: PromoSlide): { label: string; variant: "default" | "secondary" | "outline" | "destructive" } {
  const now = Date.now()
  if (!slide.isActive) return { label: "Hidden", variant: "secondary" }
  if (slide.startsAt && new Date(slide.startsAt).getTime() > now) {
    return { label: "Scheduled", variant: "outline" }
  }
  if (slide.endsAt && new Date(slide.endsAt).getTime() < now) {
    return { label: "Expired", variant: "destructive" }
  }
  return { label: "Live", variant: "default" }
}

interface SliderTabProps {
  slides: PromoSlide[]
  maxSlides: number
  onChanged: () => Promise<void> | void
  onBusyChange?: (busy: boolean) => void
}

export default function SliderTab({
  slides,
  maxSlides,
  onChanged,
  onBusyChange,
}: SliderTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PromoSlide | null>(null)
  const [draft, setDraft] = useState<SlideDraft>(EMPTY_DRAFT)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const liveCount = useMemo(
    () => slides.filter((slide) => slideStatus(slide).label === "Live").length,
    [slides]
  )

  const setBusy = (value: boolean) => {
    setSaving(value)
    onBusyChange?.(value)
  }

  const update = (patch: Partial<SlideDraft>) => setDraft((prev) => ({ ...prev, ...patch }))

  const openAdd = () => {
    setEditing(null)
    setDraft(EMPTY_DRAFT)
    setDialogOpen(true)
  }

  const openEdit = (slide: PromoSlide) => {
    setEditing(slide)
    setDraft(draftFromSlide(slide))
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!draft.imageDesktop) {
      toast.error("Add a desktop image first")
      return
    }

    setBusy(true)
    try {
      const body = {
        eyebrow: draft.eyebrow,
        title: draft.title,
        subtitle: draft.subtitle,
        imageDesktop: draft.imageDesktop,
        imageMobile: draft.imageMobile,
        imageAlt: draft.imageAlt || draft.title || "Safari Perfumes promotion",
        href: draft.href,
        ctaLabel: draft.ctaLabel,
        openInNewTab: draft.openInNewTab,
        isActive: draft.isActive,
        startsAt: fromLocalInput(draft.startsAt),
        endsAt: fromLocalInput(draft.endsAt),
        sortOrder: editing?.sortOrder,
      }

      const response = await fetch(
        editing ? `/api/admin/homepage/slides/${editing.id}` : "/api/admin/homepage/slides",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      )
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || "Could not save the slide")

      toast.success(editing ? "Slide updated" : "Slide added")
      setDialogOpen(false)
      await onChanged()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the slide")
    } finally {
      setBusy(false)
    }
  }

  const patchSlide = async (slide: PromoSlide, overrides: Record<string, unknown>, message: string) => {
    setBusyId(slide.id)
    try {
      const response = await fetch(`/api/admin/homepage/slides/${slide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slidePayload(slide, overrides)),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || "Could not update the slide")
      toast.success(message)
      await onChanged()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the slide")
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (slide: PromoSlide) => {
    if (!window.confirm("Delete this slide permanently?")) return
    setBusyId(slide.id)
    try {
      const response = await fetch(`/api/admin/homepage/slides/${slide.id}`, { method: "DELETE" })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || "Could not delete the slide")
      toast.success("Slide deleted")
      await onChanged()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete the slide")
    } finally {
      setBusyId(null)
    }
  }

  const handleMove = async (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= slides.length) return

    const reordered = [...slides]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(target, 0, moved)

    // Renumber everything so equal/duplicate sort values from older data
    // cannot make the arrows appear to do nothing.
    const updates = reordered
      .map((slide, position) => ({ slide, sortOrder: position * 10 }))
      .filter(({ slide, sortOrder }) => slide.sortOrder !== sortOrder)

    setBusyId(moved.id)
    try {
      for (const { slide, sortOrder } of updates) {
        const response = await fetch(`/api/admin/homepage/slides/${slide.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(slidePayload(slide, { sortOrder })),
        })
        const data = await response.json().catch(() => null)
        if (!response.ok) throw new Error(data?.error || "Could not reorder the slides")
      }
      toast.success("Order updated")
      await onChanged()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reorder the slides")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Homepage promo slider</h2>
          <p className="text-sm text-muted-foreground">
            Shows directly above “Trending This Week”. {liveCount} of {maxSlides} live slots used.
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add slide
        </Button>
      </div>

      {slides.length === 0 && (
        <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-6 text-center">
          <CalendarClock className="mx-auto mb-2 h-8 w-8 text-amber-500" />
          <p className="font-medium text-amber-900">No slides yet</p>
          <p className="mt-1 text-sm text-amber-800">
            The slider is hidden on the homepage until you add at least one live slide.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {slides.map((slide, index) => {
          const status = slideStatus(slide)
          const isBusy = busyId === slide.id
          return (
            <div
              key={slide.id}
              className="flex flex-col gap-4 rounded-xl border border-muted bg-white p-4 sm:flex-row sm:items-center"
            >
              <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:w-40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.imageDesktop}
                  alt={slide.imageAlt || slide.title || "Slide image"}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={status.variant}>{status.label}</Badge>
                  <span className="text-xs text-muted-foreground">Position {slide.sortOrder}</span>
                </div>
                <p className="mt-1 truncate font-medium">
                  {slide.title || slide.eyebrow || "Untitled slide"}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {slide.href || "No link"} · {slide.imageMobile ? "Desktop + mobile image" : "Desktop image only"}
                </p>
                {(slide.startsAt || slide.endsAt) && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {slide.startsAt ? new Date(slide.startsAt).toLocaleString() : "Anytime"}
                    {" → "}
                    {slide.endsAt ? new Date(slide.endsAt).toLocaleString() : "No end"}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <div className="flex flex-col">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Move slide up"
                    disabled={index === 0 || isBusy}
                    onClick={() => handleMove(index, -1)}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Move slide down"
                    disabled={index === slides.length - 1 || isBusy}
                    onClick={() => handleMove(index, 1)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-muted px-2 py-1">
                  <Switch
                    checked={slide.isActive}
                    disabled={isBusy}
                    onCheckedChange={(checked) =>
                      void patchSlide(slide, { isActive: checked }, checked ? "Slide enabled" : "Slide hidden")
                    }
                    aria-label="Slide visible on homepage"
                  />
                  <span className="text-xs text-muted-foreground">{slide.isActive ? "On" : "Off"}</span>
                </div>

                <Button variant="outline" size="sm" onClick={() => openEdit(slide)} disabled={isBusy}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete slide"
                  disabled={isBusy}
                  onClick={() => handleDelete(slide)}
                >
                  {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit slide" : "Add slide"}</DialogTitle>
            <DialogDescription>
              Upload the campaign artwork. Wide images (e.g. 1920×820) work best on desktop; add a
              portrait version for phones.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <ImageUploadField
              label="Desktop image"
              value={draft.imageDesktop}
              onChange={(value) => update({ imageDesktop: value })}
            />
            <ImageUploadField
              label="Mobile image (optional)"
              value={draft.imageMobile}
              onChange={(value) => update({ imageMobile: value })}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Eyebrow (small text)</Label>
                <Input
                  value={draft.eyebrow}
                  onChange={(event) => update({ eyebrow: event.target.value })}
                  placeholder="Limited Offer"
                />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={draft.title}
                  onChange={(event) => update({ title: event.target.value })}
                  placeholder="Eid Sale — Up To 40% Off"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Textarea
                rows={2}
                value={draft.subtitle}
                onChange={(event) => update({ subtitle: event.target.value })}
                placeholder="Free delivery on orders above Rs 3,000"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Link (optional)</Label>
                <Input
                  value={draft.href}
                  onChange={(event) => update({ href: event.target.value })}
                  placeholder="/shop?sort=hot"
                />
              </div>
              <div className="space-y-2">
                <Label>Button label (optional)</Label>
                <Input
                  value={draft.ctaLabel}
                  onChange={(event) => update({ ctaLabel: event.target.value })}
                  placeholder="Shop Now"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Image alt text (for accessibility / SEO)</Label>
              <Input
                value={draft.imageAlt}
                onChange={(event) => update({ imageAlt: event.target.value })}
                placeholder="Eid sale banner with Safari perfume bottles"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start showing (optional)</Label>
                <Input
                  type="datetime-local"
                  value={draft.startsAt}
                  onChange={(event) => update({ startsAt: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Stop showing (optional)</Label>
                <Input
                  type="datetime-local"
                  value={draft.endsAt}
                  onChange={(event) => update({ endsAt: event.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 rounded-lg border border-muted p-3">
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={draft.isActive}
                  onCheckedChange={(checked) => update({ isActive: checked })}
                />
                Show on homepage
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={draft.openInNewTab}
                  onCheckedChange={(checked) => update({ openInNewTab: checked })}
                />
                Open link in new tab
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Save changes" : "Add slide"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
