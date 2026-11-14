import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin, unauthorized } from "@/lib/admin-guard"
import { getMetaSettings } from "@/lib/meta"
import { SITE_URL } from "@/lib/site"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const DAY_MS = 24 * 60 * 60 * 1000

function checklist(settings: Awaited<ReturnType<typeof getMetaSettings>>) {
  return [
    {
      key: "pixel",
      label: "Meta Pixel installed",
      done: Boolean(settings.pixelEnabled && settings.pixelId),
      help: "Add your Pixel ID and switch the Pixel on. PageView, ViewContent, AddToCart, InitiateCheckout and Purchase are sent automatically.",
    },
    {
      key: "capi",
      label: "Conversions API connected",
      done: Boolean(settings.capiEnabled && settings.capiToken && settings.pixelId),
      help: "Paste a Conversions API access token so server-side Purchase events survive ad blockers and iOS tracking limits.",
    },
    {
      key: "catalog",
      label: "Product catalog feed ready",
      done: Boolean(settings.catalogToken),
      help: "Create a catalog token below, then add the feed URL in Meta Commerce Manager so your products can be tagged in ads.",
    },
    {
      key: "domain",
      label: "Domain verified",
      done: Boolean(settings.domainVerification),
      help: "Paste the meta-tag content value from Meta Business Manager → Brand safety → Domains.",
    },
  ]
}

/** Everything the Marketing & Meta dashboard needs in one request. */
export async function GET() {
  if (!(await requireAdmin())) return unauthorized()

  const since = new Date(Date.now() - 30 * DAY_MS)

  try {
    const [settings, orderCount, orders30, revenue30, attributed30, subscribers, activeProducts] =
      await Promise.all([
        getMetaSettings(),
        prisma.order.count(),
        prisma.order.count({ where: { createdAt: { gte: since } } }),
        prisma.order.aggregate({
          where: { createdAt: { gte: since }, paymentStatus: { not: "refunded" } },
          _sum: { total: true },
        }),
        prisma.order.count({
          where: { createdAt: { gte: since }, attribution: { not: null } },
        }),
        prisma.newsletterSubscriber.count({ where: { isActive: true } }),
        prisma.product.count({ where: { isActive: true } }),
      ])

    const feedUrl = settings.catalogToken
      ? `${SITE_URL}/api/meta/catalog?token=${encodeURIComponent(settings.catalogToken)}`
      : `${SITE_URL}/api/meta/catalog`

    return NextResponse.json({
      settings: {
        metaPixelEnabled: settings.pixelEnabled,
        metaPixelId: settings.pixelId,
        metaCapiEnabled: settings.capiEnabled,
        metaTestEventCode: settings.testEventCode,
        metaDomainVerification: settings.domainVerification,
        hasMetaCapiToken: Boolean(settings.capiToken),
        hasMetaCatalogToken: Boolean(settings.catalogToken),
      },
      stats: {
        orderCount,
        orders30,
        revenue30: Math.round((revenue30._sum.total ?? 0) * 100) / 100,
        attributed30,
        subscribers,
        activeProducts,
      },
      feedUrl,
      checklist: checklist(settings),
      siteUrl: SITE_URL,
    })
  } catch (error) {
    console.error("Could not load marketing dashboard:", error)
    return NextResponse.json(
      { error: "Could not load marketing settings" },
      { status: 500 }
    )
  }
}
