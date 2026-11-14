import { createHash } from "crypto"
import prisma from "@/lib/prisma"
import { SITE_URL } from "@/lib/site"

/* ============================================================================
 * Meta (Facebook) Conversions API
 * ----------------------------------------------------------------------------
 * Server-side Purchase events, deduplicated against the browser Pixel via
 * `event_id = orderNumber`. All personal data is SHA-256 hashed as Meta
 * requires, and the access token is only ever read on the server.
 * ========================================================================== */

export interface MetaPublicConfig {
  pixelEnabled: boolean
  pixelId: string | null
  domainVerification: string | null
}

export interface MetaSettings extends MetaPublicConfig {
  capiEnabled: boolean
  capiToken: string | null
  testEventCode: string | null
  catalogToken: string | null
}

const CACHE_TTL_MS = 60_000

let cached: { value: MetaSettings; expires: number } | null = null

function emptySettings(): MetaSettings {
  return {
    pixelEnabled: false,
    pixelId: null,
    domainVerification: null,
    capiEnabled: false,
    capiToken: null,
    testEventCode: null,
    catalogToken: null,
  }
}

/**
 * Server-only Meta configuration. Cached in-process for 60s so a busy
 * storefront does not query the settings row on every request. Admin saves
 * call `invalidateMetaSettings()`.
 */
export async function getMetaSettings(): Promise<MetaSettings> {
  if (cached && cached.expires > Date.now()) return cached.value

  try {
    const settings = await prisma.settings.findFirst()
    const value: MetaSettings = settings
      ? {
          pixelEnabled: settings.metaPixelEnabled,
          pixelId: settings.metaPixelId?.trim() || null,
          domainVerification: settings.metaDomainVerification?.trim() || null,
          capiEnabled: settings.metaCapiEnabled,
          capiToken: settings.metaCapiToken?.trim() || null,
          testEventCode: settings.metaTestEventCode?.trim() || null,
          catalogToken: settings.metaCatalogToken?.trim() || null,
        }
      : emptySettings()

    cached = { value, expires: Date.now() + CACHE_TTL_MS }
    return value
  } catch (error) {
    console.error("Could not load Meta settings:", error)
    return emptySettings()
  }
}

export function invalidateMetaSettings() {
  cached = null
}

/** Only expose what the browser actually needs. */
export async function getMetaPublicConfig(): Promise<MetaPublicConfig> {
  const settings = await getMetaSettings()
  return {
    pixelEnabled: Boolean(settings.pixelEnabled && settings.pixelId),
    pixelId: settings.pixelId,
    domainVerification: settings.domainVerification,
  }
}

/* -------------------------------------------------------------------------- */
/* CAPI                                                                        */
/* -------------------------------------------------------------------------- */

function sha256(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  const normalized = value.trim().toLowerCase()
  if (!normalized) return undefined
  return createHash("sha256").update(normalized).digest("hex")
}

function hashPhone(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  let digits = value.replace(/[^\d]/g, "")
  if (digits.startsWith("00")) digits = digits.slice(2)
  if (digits.startsWith("0") && digits.length === 11) digits = `92${digits.slice(1)}`
  return sha256(digits)
}

function splitName(fullName: string): { firstName?: string; lastName?: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return {}
  if (parts.length === 1) return { firstName: parts[0] }
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") }
}

export interface OrderForCapi {
  orderNumber: string
  total: number
  customerEmail: string
  customerName: string
  customerPhone?: string | null
  userId?: string | null
  /** Parsed shipping address captured at checkout. */
  address?: Record<string, string> | null
  items: { id: string; name: string; price: number; quantity: number; size?: string | null }[]
  attribution?: {
    fbp?: string | null
    fbc?: string | null
    fbclid?: string | null
    landingPage?: string | null
    utm_source?: string | null
    utm_medium?: string | null
    utm_campaign?: string | null
  } | null
}

export interface CapiRequestContext {
  ip?: string | null
  userAgent?: string | null
  eventSourceUrl?: string | null
  cookieFbp?: string | null
  cookieFbc?: string | null
}

interface CapiPayload {
  event_name: "Purchase"
  event_time: number
  event_id: string
  event_source_url: string
  action_source: "website"
  user_data: Record<string, unknown>
  custom_data: Record<string, unknown>
}

/** Facebook expects the fbc value in this shape when built from fbclid. */
function buildFbc(fbclid: string | null | undefined, existing?: string | null): string | undefined {
  if (existing) return existing
  if (!fbclid) return undefined
  return `fb.1.${Date.now()}.${fbclid}`
}

export async function sendMetaPurchaseEvent(
  order: OrderForCapi,
  context: CapiRequestContext = {}
): Promise<{ sent: boolean; skipped?: string }> {
  try {
    const settings = await getMetaSettings()
    if (!settings.capiEnabled || !settings.pixelId || !settings.capiToken) {
      return { sent: false, skipped: "Conversions API is not configured" }
    }

    // Shipping address is stored as JSON; parse defensively for city/state/zip.
    const address: Record<string, string> = order.address ?? {}

    const { firstName, lastName } = splitName(order.customerName)
    const userData: Record<string, unknown> = {
      em: sha256(order.customerEmail),
      ph: hashPhone(order.customerPhone),
      fn: sha256(firstName),
      ln: sha256(lastName),
      external_id: sha256(order.userId || order.customerEmail),
      client_ip_address: context.ip || undefined,
      client_user_agent: context.userAgent || undefined,
      fbp: context.cookieFbp || order.attribution?.fbp || undefined,
      fbc: buildFbc(order.attribution?.fbclid, context.cookieFbc || order.attribution?.fbc),
      country: sha256(address.country || "pk"),
      ct: sha256(address.city),
      st: sha256(address.state),
      zp: sha256(address.zipCode),
    }

    // Drop undefined keys — Meta rejects nulls in user_data.
    for (const key of Object.keys(userData)) {
      if (userData[key] === undefined) delete userData[key]
    }

    const payload: CapiPayload = {
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_id: order.orderNumber,
      event_source_url: context.eventSourceUrl || `${SITE_URL}/checkout`,
      action_source: "website",
      user_data: userData,
      custom_data: {
        currency: "PKR",
        value: Math.round(order.total * 100) / 100,
        order_id: order.orderNumber,
        content_type: "product",
        contents: order.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          item_price: item.price,
        })),
        num_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
      },
    }

    const body: Record<string, unknown> = { data: [payload] }
    if (settings.testEventCode) body.test_event_code = settings.testEventCode

    const response = await fetch(
      `https://graph.facebook.com/v21.0/${encodeURIComponent(settings.pixelId)}/events?access_token=${encodeURIComponent(settings.capiToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(8000),
      }
    )

    if (!response.ok) {
      const detail = await response.text().catch(() => "")
      console.error("Meta CAPI rejected the Purchase event:", response.status, detail.slice(0, 500))
      return { sent: false, skipped: `HTTP ${response.status}` }
    }

    return { sent: true }
  } catch (error) {
    // Tracking must never break checkout.
    console.error("Meta CAPI request failed:", error)
    return { sent: false, skipped: "request failed" }
  }
}
