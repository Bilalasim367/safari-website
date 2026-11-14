import { cache } from "react"
import prisma from "@/lib/prisma"
import {
  DEFAULT_SECTION_CONFIGS,
  HOMEPAGE_SECTION_KEYS,
  HOMEPAGE_SECTION_META,
  MAX_PROMO_SLIDES,
  isSlideLive,
  parseSectionConfig,
  parseSiteBlock,
  type HomepageSectionConfigMap,
  type HomepageSectionKey,
  type PromoSlide,
  type SiteBlockKey,
} from "@/lib/homepage-content"

/* ============================================================================
 * Homepage / site content store (SERVER ONLY)
 * ----------------------------------------------------------------------------
 * Reads MySQL rows and merges them with the coded defaults. If the database is
 * unreachable or a row is corrupt, the storefront still renders the default
 * content instead of crashing.
 * ========================================================================== */

export type HomepageSectionView = {
  [K in HomepageSectionKey]: {
    key: K
    eyebrow: string | null
    title: string | null
    subtitle: string | null
    isVisible: boolean
    sortOrder: number
    config: HomepageSectionConfigMap[K]
  }
}[HomepageSectionKey]

export interface HomepageContent {
  sections: HomepageSectionView[]
  slides: PromoSlide[]
}

export interface SiteContentBundle {
  header: ReturnType<typeof parseSiteBlock<"header">>
  footer: ReturnType<typeof parseSiteBlock<"footer">>
  collectionsPage: ReturnType<typeof parseSiteBlock<"collections_page">>
}

type SectionRow = {
  key: string
  eyebrow: string | null
  title: string | null
  subtitle: string | null
  isVisible: boolean
  sortOrder: number
  config: string | null
}

type SlideRow = {
  id: string
  placement: string
  eyebrow: string | null
  title: string | null
  subtitle: string | null
  imageDesktop: string
  imageMobile: string | null
  imageAlt: string | null
  href: string | null
  ctaLabel: string | null
  openInNewTab: boolean
  sortOrder: number
  isActive: boolean
  startsAt: Date | null
  endsAt: Date | null
}

function serializeSlide(row: SlideRow): PromoSlide {
  return {
    id: row.id,
    placement: row.placement,
    eyebrow: row.eyebrow,
    title: row.title,
    subtitle: row.subtitle,
    imageDesktop: row.imageDesktop,
    imageMobile: row.imageMobile,
    imageAlt: row.imageAlt,
    href: row.href,
    ctaLabel: row.ctaLabel,
    openInNewTab: row.openInNewTab,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    startsAt: row.startsAt ? row.startsAt.toISOString() : null,
    endsAt: row.endsAt ? row.endsAt.toISOString() : null,
  }
}

function buildSections(rows: SectionRow[]): HomepageSectionView[] {
  const byKey = new Map(rows.map((row) => [row.key, row]))

  const sections = HOMEPAGE_SECTION_KEYS.map((key) => {
    const row = byKey.get(key)
    const meta = HOMEPAGE_SECTION_META.find((m) => m.key === key)
    const sortOrder = row ? row.sortOrder : (meta?.defaultSortOrder ?? 0)

    return {
      key,
      eyebrow: row?.eyebrow ?? null,
      title: row?.title ?? null,
      subtitle: row?.subtitle ?? null,
      isVisible: row ? row.isVisible : true,
      sortOrder,
      config: parseSectionConfig(key, row?.config ?? null),
    } as HomepageSectionView
  })

  return sections.sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
    return HOMEPAGE_SECTION_KEYS.indexOf(a.key) - HOMEPAGE_SECTION_KEYS.indexOf(b.key)
  })
}

function defaultSections(): HomepageSectionView[] {
  return HOMEPAGE_SECTION_KEYS.map((key) => {
    const meta = HOMEPAGE_SECTION_META.find((m) => m.key === key)
    return {
      key,
      eyebrow: null,
      title: null,
      subtitle: null,
      isVisible: true,
      sortOrder: meta?.defaultSortOrder ?? 0,
      config: DEFAULT_SECTION_CONFIGS[key],
    } as HomepageSectionView
  })
}

/**
 * Public homepage content: visible sections in display order + live slides.
 * `unstable_cache` is deliberately NOT used — the homepage route is ISR
 * (`revalidate = 300`) and admin saves call `revalidatePath('/')`, so the data
 * is fresh after every save while still being served from the static cache.
 */
export const getHomepageContent = cache(async (): Promise<HomepageContent> => {
  try {
    const [sectionRows, slideRows] = await Promise.all([
      prisma.homepageSection.findMany(),
      prisma.homepageSlide.findMany({
        where: { placement: "home_main", isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
    ])

    const slides = (slideRows as SlideRow[])
      .map(serializeSlide)
      .filter((slide) => isSlideLive(slide))
      .slice(0, MAX_PROMO_SLIDES)

    return { sections: buildSections(sectionRows as SectionRow[]), slides }
  } catch (error) {
    console.error("Error loading homepage content, using defaults:", error)
    return { sections: defaultSections(), slides: [] }
  }
})

/** Popup/content-independent: hides admin-disabled sections from public pages. */
export function visibleSections(content: HomepageContent): HomepageSectionView[] {
  return content.sections.filter((section) => section.isVisible)
}

/** Admin: every slide, live or not. */
export const listPromoSlides = cache(async (): Promise<PromoSlide[]> => {
  const rows = await prisma.homepageSlide.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  })
  return (rows as SlideRow[]).map(serializeSlide)
})

/** Admin: all section rows merged with defaults (including hidden sections). */
export const getHomepageSectionsForAdmin = cache(async (): Promise<HomepageSectionView[]> => {
  const rows = await prisma.homepageSection.findMany()
  return buildSections(rows as SectionRow[])
})

/** Public site blocks (header/footer/collections hero) merged with defaults. */
export const getSiteContent = cache(async (): Promise<SiteContentBundle> => {
  try {
    const rows = await prisma.siteContent.findMany({
      where: { key: { in: ["header", "footer", "collections_page"] } },
    })
    const byKey = new Map(rows.map((row) => [row.key, row.value]))

    return {
      header: parseSiteBlock("header", byKey.get("header") ?? null),
      footer: parseSiteBlock("footer", byKey.get("footer") ?? null),
      collectionsPage: parseSiteBlock("collections_page", byKey.get("collections_page") ?? null),
    }
  } catch (error) {
    console.error("Error loading site content, using defaults:", error)
    return {
      header: parseSiteBlock("header", null),
      footer: parseSiteBlock("footer", null),
      collectionsPage: parseSiteBlock("collections_page", null),
    }
  }
})

export const getSiteBlockForAdmin = cache(async (key: SiteBlockKey) => {
  const row = await prisma.siteContent.findUnique({ where: { key } })
  return parseSiteBlock(key, row?.value ?? null)
})
