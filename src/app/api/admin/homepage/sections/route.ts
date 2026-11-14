import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin, unauthorized, readJsonBody } from "@/lib/admin-guard"
import { revalidateHomepage } from "@/lib/revalidate-storefront"
import {
  HOMEPAGE_SECTION_KEYS,
  isHomepageSectionKey,
  validateSectionConfig,
  type HomepageSectionKey,
} from "@/lib/homepage-content"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface SectionUpdate {
  key: HomepageSectionKey
  isVisible: boolean
  sortOrder: number
  config: unknown
}

function parseUpdates(raw: unknown): SectionUpdate[] | { error: string } {
  if (!Array.isArray(raw)) return { error: "sections must be an array" }

  const updates: SectionUpdate[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object") return { error: "Invalid section entry" }
    const entry = item as Record<string, unknown>
    const key = typeof entry.key === "string" ? entry.key : ""
    if (!isHomepageSectionKey(key)) return { error: `Unknown section: ${key}` }

    updates.push({
      key,
      isVisible: entry.isVisible !== false,
      sortOrder:
        typeof entry.sortOrder === "number" && Number.isFinite(entry.sortOrder)
          ? Math.max(0, Math.min(9999, Math.floor(entry.sortOrder)))
          : HOMEPAGE_SECTION_KEYS.indexOf(key) * 10,
      config: entry.config ?? null,
    })
  }
  return updates
}

/** Bulk save visibility, display order and copy for the homepage sections. */
export async function PUT(request: Request) {
  if (!(await requireAdmin())) return unauthorized()

  const body = await readJsonBody(request)
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = parseUpdates(body.sections)
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  // Validate every section before writing anything.
  const validated: {
    key: HomepageSectionKey
    isVisible: boolean
    sortOrder: number
    config: unknown
    eyebrow: string | null
    title: string | null
    subtitle: string | null
  }[] = []

  for (const update of parsed) {
    const result = validateSectionConfig(update.key, update.config)
    if (!result.ok) {
      return NextResponse.json(
        { error: `${update.key}: ${result.error}` },
        { status: 400 }
      )
    }

    const cfg = (result.data ?? {}) as Record<string, unknown>
    validated.push({
      key: update.key,
      isVisible: update.isVisible,
      sortOrder: update.sortOrder,
      config: result.data,
      eyebrow: typeof cfg.eyebrow === "string" ? cfg.eyebrow : null,
      title: typeof cfg.title === "string" ? cfg.title : null,
      subtitle: typeof cfg.subtitle === "string" ? cfg.subtitle : null,
    })
  }

  await prisma.$transaction(
    validated.map((section) =>
      prisma.homepageSection.upsert({
        where: { key: section.key },
        create: {
          key: section.key,
          isVisible: section.isVisible,
          sortOrder: section.sortOrder,
          config: section.config === null ? null : JSON.stringify(section.config),
          eyebrow: section.eyebrow,
          title: section.title,
          subtitle: section.subtitle,
        },
        update: {
          isVisible: section.isVisible,
          sortOrder: section.sortOrder,
          config: section.config === null ? null : JSON.stringify(section.config),
          eyebrow: section.eyebrow,
          title: section.title,
          subtitle: section.subtitle,
        },
      })
    )
  )

  revalidateHomepage()

  const sections = await prisma.homepageSection.findMany()
  return NextResponse.json({ success: true, count: sections.length })
}
