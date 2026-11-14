"use client"

import React, { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ExternalLink, Loader2, RefreshCw } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import SliderTab from "@/components/admin/homepage/SliderTab"
import LayoutTab from "@/components/admin/homepage/LayoutTab"
import SiteTab from "@/components/admin/homepage/SiteTab"
import type { PromoSlide } from "@/lib/homepage-content"
import type { HomepageSectionView, SiteContentBundle } from "@/lib/homepage-content-store"

interface HomepageAdminData {
  slides: PromoSlide[]
  sections: HomepageSectionView[]
  site: SiteContentBundle
  limits: { maxSlides: number }
}

type TabKey = "slider" | "layout" | "site"

const TABS: { key: TabKey; label: string }[] = [
  { key: "slider", label: "Promo slider" },
  { key: "layout", label: "Layout & copy" },
  { key: "site", label: "Header / Footer" },
]

export default function HomepageManagerPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("slider")
  const [data, setData] = useState<HomepageAdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/homepage", { cache: "no-store" })
      if (response.status === 401) {
        setError("Your session expired. Please sign in again.")
        return
      }
      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload) {
        throw new Error(payload?.error || "Could not load homepage content")
      }
      setData(payload as HomepageAdminData)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load homepage content")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // load() only sets state after awaiting the request, so this is not a
    // synchronous setState-in-effect cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-serif font-bold">Homepage Manager</h1>
          <p className="mt-1 text-muted-foreground">
            Everything customers see on the homepage — edit it here, no code needed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View store
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "default" : "outline"}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          {loading ? (
            <div className="flex min-h-[240px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm text-destructive">{error}</p>
              <Button size="sm" variant="outline" onClick={() => void load()}>
                Try again
              </Button>
            </div>
          ) : data ? (
            <>
              {activeTab === "slider" && (
                <SliderTab
                  slides={data.slides}
                  maxSlides={data.limits.maxSlides}
                  onChanged={load}
                />
              )}
              {activeTab === "layout" && (
                <LayoutTab sections={data.sections} onChanged={load} />
              )}
              {activeTab === "site" && <SiteTab site={data.site} onChanged={load} />}
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
