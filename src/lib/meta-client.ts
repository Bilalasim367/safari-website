"use client"

/* Thin wrapper around the Meta Pixel. Safe to call on every page: when the
 * pixel is not configured (or blocked by an ad blocker) it simply does nothing. */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

export type MetaEventParams = Record<string, unknown>

export function isMetaPixelReady(): boolean {
  return typeof window !== "undefined" && typeof window.fbq === "function"
}

/**
 * Fire a standard Pixel event. Pass the same `eventId` on the server (CAPI)
 * to let Meta deduplicate the two copies into one conversion.
 */
export function metaTrack(event: string, params?: MetaEventParams, eventId?: string): void {
  if (!isMetaPixelReady()) return
  try {
    if (eventId) {
      window.fbq?.("track", event, params, { eventID: eventId })
    } else {
      window.fbq?.("track", event, params)
    }
  } catch {
    // Never let analytics break the UI.
  }
}

export const META_CURRENCY = "PKR"
