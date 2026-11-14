import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin, unauthorized, readJsonBody } from "@/lib/admin-guard"
import { revalidateCollectionsPage, revalidateSiteChrome } from "@/lib/revalidate-storefront"
import {
  SITE_BLOCK_KEYS,
  validateSiteBlock,
  type SiteBlockKey,
} from "@/lib/homepage-content"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function isSiteBlockKey(value: string): value is SiteBlockKey {
  return (SITE_BLOCK_KEYS as readonly string[]).includes(value)
}

/** Save one site-wide content block (header, footer or collections page). */
export async function PUT(request: Request) {
  if (!(await requireAdmin())) return unauthorized()

  const body = await readJsonBody(request)
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const key = typeof body.key === "string" ? body.key : ""
  if (!isSiteBlockKey(key)) {
    return NextResponse.json({ error: "Unknown content block" }, { status: 400 })
  }

  const result = validateSiteBlock(key, body.value)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  const value = JSON.stringify(result.data)
  await prisma.siteContent.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  })

  if (key === "collections_page") {
    revalidateCollectionsPage()
  } else {
    revalidateSiteChrome()
  }

  return NextResponse.json({ success: true, value: result.data })
}
