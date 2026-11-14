"use client"

import React, { useEffect, useState } from "react"
import { ChevronDown, ChevronUp, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContentFields } from "@/components/admin/homepage/fields"
import {
  SITE_BLOCK_FIELDS,
  SITE_BLOCK_META,
  type SiteBlockKey,
} from "@/lib/homepage-content"
import type { SiteContentBundle } from "@/lib/homepage-content-store"
import { toast } from "sonner"

type Json = Record<string, unknown>

function initialValues(site: SiteContentBundle): Record<SiteBlockKey, Json> {
  return {
    header: JSON.parse(JSON.stringify(site.header)) as Json,
    footer: JSON.parse(JSON.stringify(site.footer)) as Json,
    collections_page: JSON.parse(JSON.stringify(site.collectionsPage)) as Json,
  }
}

interface SiteTabProps {
  site: SiteContentBundle
  onChanged: () => Promise<void> | void
}

export default function SiteTab({ site, onChanged }: SiteTabProps) {
  const [values, setValues] = useState<Record<SiteBlockKey, Json>>(() => initialValues(site))
  const [openKey, setOpenKey] = useState<SiteBlockKey | null>("header")
  const [savingKey, setSavingKey] = useState<SiteBlockKey | null>(null)

  useEffect(() => {
    // Adopt freshly saved data from the parent after a save/refresh.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues(initialValues(site))
  }, [site])

  const saveBlock = async (key: SiteBlockKey) => {
    setSavingKey(key)
    try {
      const response = await fetch("/api/admin/homepage/blocks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: values[key] }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || "Could not save this section")

      toast.success("Saved — the live site is updated")
      await onChanged()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save this section")
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Site-wide content</h2>
        <p className="text-sm text-muted-foreground">
          Header, footer and the collections page. These appear on every page, not just the
          homepage.
        </p>
      </div>

      {SITE_BLOCK_META.map((block) => {
        const expanded = openKey === block.key
        const saving = savingKey === block.key
        return (
          <div key={block.key} className="rounded-xl border border-muted bg-white">
            <button
              type="button"
              onClick={() => setOpenKey(expanded ? null : block.key)}
              className="flex w-full items-center justify-between gap-3 p-4 text-left"
              aria-expanded={expanded}
            >
              <span>
                <span className="block font-medium">{block.label}</span>
                <span className="block text-sm text-muted-foreground">{block.description}</span>
              </span>
              {expanded ? (
                <ChevronUp className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0" />
              )}
            </button>

            {expanded && (
              <div className="space-y-4 border-t border-muted p-4">
                <ContentFields
                  fields={SITE_BLOCK_FIELDS[block.key]}
                  value={values[block.key]}
                  onChange={(next) =>
                    setValues((prev) => ({ ...prev, [block.key]: next }))
                  }
                />
                <Button onClick={() => saveBlock(block.key)} disabled={saving}>
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save {block.label}
                </Button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
