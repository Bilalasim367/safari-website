import { NextResponse } from "next/server"
import { requireAdmin, unauthorized } from "@/lib/admin-guard"
import {
  getHomepageSectionsForAdmin,
  getSiteContent,
  listPromoSlides,
} from "@/lib/homepage-content-store"
import { MAX_PROMO_SLIDES } from "@/lib/homepage-content"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Everything the Homepage Manager needs in one request. */
export async function GET() {
  if (!(await requireAdmin())) return unauthorized()

  const [slides, sections, site] = await Promise.all([
    listPromoSlides(),
    getHomepageSectionsForAdmin(),
    getSiteContent(),
  ])

  return NextResponse.json({
    slides,
    sections,
    site,
    limits: { maxSlides: MAX_PROMO_SLIDES },
  })
}
