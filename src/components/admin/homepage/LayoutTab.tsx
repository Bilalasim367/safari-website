"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  Pencil,
  RotateCcw,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { ContentFields } from "@/components/admin/homepage/fields"
import {
  HOMEPAGE_SECTION_META,
  SECTION_FIELDS,
  type HomepageSectionKey,
} from "@/lib/homepage-content"
import type { HomepageSectionView } from "@/lib/homepage-content-store"
import { toast } from "sonner"

type DraftSection = {
  key: HomepageSectionKey
  isVisible: boolean
  sortOrder: number
  config: Record<string, unknown> | null
}

function toDrafts(sections: HomepageSectionView[]): DraftSection[] {
  return sections.map((section) => ({
    key: section.key,
    isVisible: section.isVisible,
    sortOrder: section.sortOrder,
    config: section.config
      ? (JSON.parse(JSON.stringify(section.config)) as Record<string, unknown>)
      : null,
  }))
}

function signature(drafts: DraftSection[]): string {
  return JSON.stringify(
    drafts.map((draft) => ({
      key: draft.key,
      isVisible: draft.isVisible,
      config: draft.config,
    }))
  )
}

interface LayoutTabProps {
  sections: HomepageSectionView[]
  onChanged: () => Promise<void> | void
}

export default function LayoutTab({ sections, onChanged }: LayoutTabProps) {
  const [drafts, setDrafts] = useState<DraftSection[]>(() => toDrafts(sections))
  const [baseline, setBaseline] = useState<string>(() => signature(toDrafts(sections)))
  const [saving, setSaving] = useState(false)
  const [editingKey, setEditingKey] = useState<HomepageSectionKey | null>(null)
  const [editConfig, setEditConfig] = useState<Record<string, unknown>>({})

  useEffect(() => {
    // Adopt freshly saved data from the parent without dropping local edits
    // that have not been saved yet.
    const next = toDrafts(sections)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrafts(next)
    setBaseline(signature(next))
  }, [sections])

  const dirty = useMemo(() => signature(drafts) !== baseline, [drafts, baseline])

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= drafts.length) return
    setDrafts((prev) => {
      const next = [...prev]
      const [moved] = next.splice(index, 1)
      next.splice(target, 0, moved)
      return next.map((item, position) => ({ ...item, sortOrder: position * 10 }))
    })
  }

  const toggle = (key: HomepageSectionKey, isVisible: boolean) => {
    setDrafts((prev) => prev.map((item) => (item.key === key ? { ...item, isVisible } : item)))
  }

  const openEditor = (key: HomepageSectionKey) => {
    const draft = drafts.find((item) => item.key === key)
    setEditingKey(key)
    setEditConfig(draft?.config ? { ...draft.config } : {})
  }

  const applyEditor = () => {
    if (!editingKey) return
    const key = editingKey
    setDrafts((prev) =>
      prev.map((item) => (item.key === key ? { ...item, config: { ...editConfig } } : item))
    )
    setEditingKey(null)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/homepage/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: drafts.map((draft) => ({
            key: draft.key,
            isVisible: draft.isVisible,
            sortOrder: draft.sortOrder,
            config: draft.config,
          })),
        }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || "Could not save the layout")

      toast.success("Homepage layout saved")
      setBaseline(signature(drafts))
      await onChanged()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the layout")
    } finally {
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    const next = toDrafts(sections)
    setDrafts(next)
    setBaseline(signature(next))
  }

  const editingMeta = editingKey ? HOMEPAGE_SECTION_META.find((m) => m.key === editingKey) : null
  const editingFields = editingKey ? SECTION_FIELDS[editingKey] ?? [] : []

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Homepage layout &amp; copy</h2>
          <p className="text-sm text-muted-foreground">
            Reorder sections, hide the ones you do not want, and edit their text. Changes appear
            on the live site as soon as you save.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDiscard} disabled={!dirty || saving}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Discard
          </Button>
          <Button onClick={handleSave} disabled={!dirty || saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save layout
          </Button>
        </div>
      </div>

      {dirty && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900">
          You have unsaved changes.
        </div>
      )}

      <div className="space-y-2">
        {drafts.map((draft, index) => {
          const meta = HOMEPAGE_SECTION_META.find((m) => m.key === draft.key)
          const fields = SECTION_FIELDS[draft.key] ?? []
          const canEdit = fields.length > 0
          return (
            <div
              key={draft.key}
              className="flex flex-col gap-3 rounded-xl border border-muted bg-white p-3 sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Move section up"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Move section down"
                  disabled={index === drafts.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center text-xs text-muted-foreground">{index + 1}</span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{meta?.label ?? draft.key}</span>
                  {!draft.isVisible && <Badge variant="secondary">Hidden</Badge>}
                  {!canEdit && <Badge variant="outline">Managed elsewhere</Badge>}
                </div>
                <p className="truncate text-sm text-muted-foreground">{meta?.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-muted px-2 py-1">
                  {draft.isVisible ? (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Switch
                    checked={draft.isVisible}
                    onCheckedChange={(checked) => toggle(draft.key, checked)}
                    aria-label={`Show ${meta?.label ?? draft.key} on the homepage`}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditor(draft.key)}
                  disabled={!canEdit}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit text
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Layers className="h-4 w-4" />
        The promo slider has its own tab; the signature showcase is edited under Showcase.
      </p>

      <Dialog open={editingKey !== null} onOpenChange={(open) => !open && setEditingKey(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit {editingMeta?.label ?? "section"}</DialogTitle>
            <DialogDescription>
              Leave a field empty to fall back to the built-in default text.
            </DialogDescription>
          </DialogHeader>

          <ContentFields
            fields={editingFields}
            value={editConfig}
            onChange={(next) => setEditConfig(next)}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingKey(null)}>
              Cancel
            </Button>
            <Button onClick={applyEditor}>Apply to draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
