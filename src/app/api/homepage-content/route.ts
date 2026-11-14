import { NextResponse } from "next/server"
import { getHomepageContent } from "@/lib/homepage-content-store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Public, read-only homepage content. Used for admin live preview; the
 * storefront itself renders server-side from the same store.
 */
export async function GET() {
  const content = await getHomepageContent()
  return NextResponse.json(
    {
      slides: content.slides,
      sections: content.sections.map((section) => ({
        key: section.key,
        isVisible: section.isVisible,
        sortOrder: section.sortOrder,
      })),
    },
    { headers: { "Cache-Control": "no-store" } }
  )
}
