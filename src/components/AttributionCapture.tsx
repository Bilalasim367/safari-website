"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { captureAttribution } from "@/lib/meta-attribution"

/**
 * Stores `fbclid` / UTM values / `_fbp` / `_fbc` in localStorage so checkout
 * can attach them to the order even after the visitor browses around.
 */
export default function AttributionCapture() {
  const pathname = usePathname() || ""

  useEffect(() => {
    if (pathname.startsWith("/admin")) return
    captureAttribution()
  }, [pathname])

  return null
}
