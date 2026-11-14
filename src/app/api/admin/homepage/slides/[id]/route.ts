import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin, unauthorized, readJsonBody } from "@/lib/admin-guard"
import { revalidateHomepage } from "@/lib/revalidate-storefront"
import { MAX_PROMO_SLIDES, isSafeImageSrc, promoSlideSchema } from "@/lib/homepage-content"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const PLACEMENT = "home_main"

function toDateOrNull(value: string | null | undefined): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return unauthorized()

  const { id } = await params
  const existing = await prisma.homepageSlide.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Slide not found" }, { status: 404 })
  }

  const body = await readJsonBody(request)
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = promoSlideSchema.safeParse(body)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return NextResponse.json(
      { error: first ? `${first.path.join(".") || "Slide"}: ${first.message}` : "Invalid slide" },
      { status: 400 }
    )
  }

  const input = parsed.data
  if (!isSafeImageSrc(input.imageDesktop)) {
    return NextResponse.json({ error: "Desktop image must be an uploaded image" }, { status: 400 })
  }

  // Re-activating a slide must still respect the limit.
  if (!existing.isActive && input.isActive === true) {
    const activeCount = await prisma.homepageSlide.count({
      where: { placement: PLACEMENT, isActive: true, NOT: { id } },
    })
    if (activeCount >= MAX_PROMO_SLIDES) {
      return NextResponse.json(
        { error: `You can have at most ${MAX_PROMO_SLIDES} active slides. Disable one first.` },
        { status: 400 }
      )
    }
  }

  const slide = await prisma.homepageSlide.update({
    where: { id },
    data: {
      eyebrow: input.eyebrow || null,
      title: input.title || null,
      subtitle: input.subtitle || null,
      imageDesktop: input.imageDesktop,
      imageMobile: input.imageMobile || null,
      imageAlt: input.imageAlt || input.title || "Safari Perfumes promotion",
      href: input.href || null,
      ctaLabel: input.ctaLabel || null,
      openInNewTab: input.openInNewTab ?? false,
      sortOrder: input.sortOrder ?? existing.sortOrder,
      isActive: input.isActive ?? existing.isActive,
      startsAt: toDateOrNull(input.startsAt),
      endsAt: toDateOrNull(input.endsAt),
    },
  })

  revalidateHomepage()
  return NextResponse.json({ slide })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return unauthorized()

  const { id } = await params
  const existing = await prisma.homepageSlide.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Slide not found" }, { status: 404 })
  }

  await prisma.homepageSlide.delete({ where: { id } })
  revalidateHomepage()
  return NextResponse.json({ success: true })
}
