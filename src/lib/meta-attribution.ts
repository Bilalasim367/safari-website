"use client"

/* ============================================================================
 * Marketing attribution capture (browser)
 * ----------------------------------------------------------------------------
 * Meta Ads clicks arrive with `fbclid` and browser cookies (`_fbp` / `_fbc`).
 * We keep the first-touch ad click + the UTM values in localStorage so the
 * order can be attributed even if the customer browses for days before
 * checking out.
 * ========================================================================== */

export interface Attribution {
  fbclid?: string
  fbc?: string
  fbp?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  landingPage?: string
  referrer?: string
  capturedAt?: string
}

const STORAGE_KEY = "safari_attribution"
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

export function getStoredAttribution(): Attribution | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Attribution) : null
  } catch {
    return null
  }
}

function writeAttribution(value: Attribution) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Storage can be unavailable in private mode; attribution is best-effort.
  }
}

/**
 * Capture the current page's marketing parameters. Safe to call on every
 * navigation: it keeps the first ad click and refreshes cookie values.
 */
export function captureAttribution(): Attribution {
  const existing = getStoredAttribution() ?? {}
  const params = new URLSearchParams(window.location.search)

  const next: Attribution = { ...existing }

  const fbclid = params.get("fbclid")
  if (fbclid && !next.fbclid) {
    next.fbclid = fbclid
    next.fbc = `fb.1.${Date.now()}.${fbclid}`
  }

  for (const key of UTM_KEYS) {
    const value = params.get(key)
    if (value) next[key] = value
  }

  if (params.get("fbclid") && !next.landingPage) {
    next.landingPage = window.location.pathname + window.location.search
    next.referrer = document.referrer || undefined
    next.capturedAt = new Date().toISOString()
  }

  // Cookies are authoritative when present.
  const cookieFbp = readCookie("_fbp")
  const cookieFbc = readCookie("_fbc")
  if (cookieFbp) next.fbp = cookieFbp
  if (cookieFbc) next.fbc = cookieFbc

  // Nothing worth storing: skip the write.
  const hasValue = next.fbclid || next.fbc || next.fbp || UTM_KEYS.some((key) => next[key])
  if (hasValue) writeAttribution(next)
  return next
}
