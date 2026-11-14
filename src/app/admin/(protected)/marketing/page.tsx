"use client"

import React, { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  BarChart3,
  CheckCircle2,
  Circle,
  Copy,
  ExternalLink,
  Loader2,
  Megaphone,
  RefreshCw,
  Save,
  ShoppingBag,
  Target,
  Users,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface MarketingSettings {
  metaPixelEnabled: boolean
  metaPixelId: string | null
  metaCapiEnabled: boolean
  metaTestEventCode: string | null
  metaDomainVerification: string | null
  hasMetaCapiToken: boolean
  hasMetaCatalogToken: boolean
}

interface MarketingStats {
  orderCount: number
  orders30: number
  revenue30: number
  attributed30: number
  subscribers: number
  activeProducts: number
}

interface ChecklistItem {
  key: string
  label: string
  done: boolean
  help: string
}

interface MarketingData {
  settings: MarketingSettings
  stats: MarketingStats
  feedUrl: string
  checklist: ChecklistItem[]
  siteUrl: string
}

interface Draft {
  metaPixelEnabled: boolean
  metaPixelId: string
  metaCapiEnabled: boolean
  metaCapiToken: string
  metaTestEventCode: string
  metaCatalogToken: string
  metaDomainVerification: string
}

function toDraft(settings: MarketingSettings): Draft {
  return {
    metaPixelEnabled: settings.metaPixelEnabled,
    metaPixelId: settings.metaPixelId ?? "",
    metaCapiEnabled: settings.metaCapiEnabled,
    metaCapiToken: "",
    metaTestEventCode: settings.metaTestEventCode ?? "",
    metaCatalogToken: "",
    metaDomainVerification: settings.metaDomainVerification ?? "",
  }
}

function money(value: number): string {
  return `Rs ${value.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string
  hint: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <span className="rounded-lg bg-muted p-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </span>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-2xl font-semibold">{value}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MarketingPage() {
  const [data, setData] = useState<MarketingData | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/marketing", { cache: "no-store" })
      if (response.status === 401) {
        setError("Your session expired. Please sign in again.")
        return
      }
      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload) {
        throw new Error(payload?.error || "Could not load marketing settings")
      }
      setData(payload as MarketingData)
      setDraft(toDraft((payload as MarketingData).settings))
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load marketing settings")
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

  const update = (patch: Partial<Draft>) =>
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev))

  const handleSave = async () => {
    if (!draft) return
    setSaving(true)
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metaPixelEnabled: draft.metaPixelEnabled,
          metaPixelId: draft.metaPixelId,
          metaCapiEnabled: draft.metaCapiEnabled,
          metaCapiToken: draft.metaCapiToken,
          metaTestEventCode: draft.metaTestEventCode,
          metaCatalogToken: draft.metaCatalogToken,
          metaDomainVerification: draft.metaDomainVerification,
        }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.error || "Could not save Meta settings")

      toast.success("Meta settings saved — tracking is live")
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save Meta settings")
    } finally {
      setSaving(false)
    }
  }

  const copyFeed = async () => {
    if (!data) return
    try {
      await navigator.clipboard.writeText(data.feedUrl)
      toast.success("Feed URL copied")
    } catch {
      toast.error("Could not copy — select the URL and copy it manually")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data || !draft) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-serif font-bold">Marketing &amp; Meta</h1>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{error || "Could not load settings"}</p>
          <Button className="mt-3" size="sm" variant="outline" onClick={() => void load()}>
            Try again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-serif font-bold">
            <Megaphone className="h-7 w-7" />
            Marketing &amp; Meta
          </h1>
          <p className="mt-1 text-muted-foreground">
            Connect Facebook &amp; Instagram ads, verify conversions, and manage the product
            catalog — all from here.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
          <Button size="sm" onClick={() => void handleSave()} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save changes
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Orders (30 days)"
          value={String(data.stats.orders30)}
          hint={`${data.stats.orderCount} lifetime orders`}
          icon={ShoppingBag}
        />
        <StatCard
          label="Revenue (30 days)"
          value={money(data.stats.revenue30)}
          hint="Excludes refunded orders"
          icon={BarChart3}
        />
        <StatCard
          label="Ad-attributed orders"
          value={String(data.stats.attributed30)}
          hint="Had fbclid / UTM / _fbp at checkout"
          icon={Target}
        />
        <StatCard
          label="Newsletter subscribers"
          value={String(data.stats.subscribers)}
          hint={`${data.stats.activeProducts} active products`}
          icon={Users}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection checklist</CardTitle>
          <CardDescription>Everything Meta needs before you scale ad spend.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {data.checklist.map((item) => (
            <div
              key={item.key}
              className="flex items-start gap-3 rounded-xl border border-muted p-3"
            >
              {item.done ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              )}
              <div>
                <p className="flex items-center gap-2 font-medium">
                  {item.label}
                  <Badge variant={item.done ? "default" : "secondary"}>
                    {item.done ? "Ready" : "Action needed"}
                  </Badge>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{item.help}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Meta Pixel</CardTitle>
            <CardDescription>
              Tracks PageView, ViewContent, AddToCart, InitiateCheckout and Purchase on the
              storefront.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <label className="flex items-center justify-between gap-4 rounded-lg border border-muted p-3">
              <span>
                <span className="block text-sm font-medium">Enable Meta Pixel</span>
                <span className="block text-xs text-muted-foreground">
                  Admin pages are always excluded from tracking.
                </span>
              </span>
              <Switch
                checked={draft.metaPixelEnabled}
                onCheckedChange={(checked) => update({ metaPixelEnabled: checked })}
              />
            </label>

            <div className="space-y-2">
              <Label htmlFor="pixel-id">Pixel ID</Label>
              <Input
                id="pixel-id"
                value={draft.metaPixelId}
                onChange={(event) => update({ metaPixelId: event.target.value })}
                placeholder="e.g. 123456789012345"
                inputMode="numeric"
              />
              <p className="text-xs text-muted-foreground">
                Found in Meta Events Manager → Data sources → your Pixel → Settings. Numbers
                only.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain-verification">Domain verification meta tag</Label>
              <Input
                id="domain-verification"
                value={draft.metaDomainVerification}
                onChange={(event) => update({ metaDomainVerification: event.target.value })}
                placeholder="abcdef1234567890abcdef1234567890"
              />
              <p className="text-xs text-muted-foreground">
                From Meta Business Manager → Brand safety → Domains. Paste only the
                <code className="mx-1 rounded bg-muted px-1">content</code>
                value, not the whole tag.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversions API (server-side)</CardTitle>
            <CardDescription>
              Sends Purchase events from the server so ad blockers and iOS limits cannot hide
              your sales. Deduplicated with the Pixel automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <label className="flex items-center justify-between gap-4 rounded-lg border border-muted p-3">
              <span>
                <span className="block text-sm font-medium">Enable Conversions API</span>
                <span className="block text-xs text-muted-foreground">
                  Requires the Pixel ID and an access token.
                </span>
              </span>
              <Switch
                checked={draft.metaCapiEnabled}
                onCheckedChange={(checked) => update({ metaCapiEnabled: checked })}
              />
            </label>

            <div className="space-y-2">
              <Label htmlFor="capi-token">Access token</Label>
              <Input
                id="capi-token"
                type="password"
                value={draft.metaCapiToken}
                onChange={(event) => update({ metaCapiToken: event.target.value })}
                placeholder={
                  data.settings.hasMetaCapiToken
                    ? "•••••••• saved — leave blank to keep"
                    : "Paste the Conversions API access token"
                }
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">
                Meta Events Manager → Settings → Conversions API → Generate access token. Stored
                server-side; it is never sent to the browser.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-code">Test event code (optional)</Label>
              <Input
                id="test-code"
                value={draft.metaTestEventCode}
                onChange={(event) => update({ metaTestEventCode: event.target.value })}
                placeholder="TEST12345"
              />
              <p className="text-xs text-muted-foreground">
                While testing, events appear under Test events in Events Manager. Remove this
                before running real ads.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product catalog feed</CardTitle>
          <CardDescription>
            Add this URL in Meta Commerce Manager → Catalogs → Data sources → Data feed so your
            products can be tagged in ads and Instagram Shopping.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-2">
              <Label htmlFor="feed-url">Feed URL</Label>
              <Input id="feed-url" value={data.feedUrl} readOnly className="font-mono text-xs" />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => void copyFeed()}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Link
                href={data.feedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline" })}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open feed
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="catalog-token">Catalog feed token</Label>
            <Input
              id="catalog-token"
              type="password"
              value={draft.metaCatalogToken}
              onChange={(event) => update({ metaCatalogToken: event.target.value })}
              placeholder={
                data.settings.hasMetaCatalogToken
                  ? "•••••••• saved — leave blank to keep"
                  : "Create a secret token (at least 16 characters)"
              }
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">
              Protects the feed from public scraping. After saving, copy the new URL above and
              update it in Meta Commerce Manager. Use 16+ random characters.
            </p>
          </div>

          <div className="rounded-lg border border-muted bg-muted/30 p-4 text-sm">
            <p className="font-medium">What happens automatically</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
              <li>
                <strong>Pixel events:</strong> PageView, ViewContent, AddToCart,
                InitiateCheckout, Purchase.
              </li>
              <li>
                <strong>Server Purchase:</strong> fires with the same event ID as the browser so
                Meta counts it once, with hashed email/phone and fbp/fbc cookies.
              </li>
              <li>
                <strong>Attribution:</strong> fbclid, UTM values and landing page are saved on
                the order for reporting.
              </li>
              <li>
                <strong>Catalog sync:</strong> prices, stock, images and links come straight from
                your live products.
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => void handleSave()} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save changes
        </Button>
      </div>
    </div>
  )
}
