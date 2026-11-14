import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getMetaSettings } from "@/lib/meta"
import { SITE_URL } from "@/lib/site"
import { resolveSizeOptions } from "@/lib/size-pricing"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const BRAND = "Safari Perfumes"
const CATEGORY = "Health & Beauty > Personal Care > Cosmetics > Perfume & Cologne"

const COLUMNS = [
  "id",
  "title",
  "description",
  "availability",
  "condition",
  "price",
  "link",
  "image_link",
  "additional_image_link",
  "brand",
  "google_product_category",
  "fb_product_category",
  "gender",
  "size",
  "quantity_to_sell_on_facebook",
  "custom_label_0",
] as const

/** RFC 4180 CSV cell: quote everything and double embedded quotes. */
function cell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""'
  const text = String(value).replace(/\r?\n/g, " ").replace(/"/g, '""')
  return `"${text}"`
}

function absoluteUrl(url: string | null | undefined): string {
  if (!url) return ""
  const trimmed = url.trim()
  if (!trimmed) return ""
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `${SITE_URL}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`
}

function price(value: number): string {
  return `${value.toFixed(2)} PKR`
}

/**
 * Meta catalog feed.
 *
 * Commerce Manager polls this URL to keep the ad catalog in sync with the
 * store. When `metaCatalogToken` is set the feed requires `?token=` so the
 * product data is not publicly scrapable.
 */
export async function GET(request: Request) {
  const settings = await getMetaSettings()
  if (settings.catalogToken) {
    const provided = new URL(request.url).searchParams.get("token")
    if (provided !== settings.catalogToken) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
  }

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      shortDescription: true,
      image: true,
      images: true,
      inStock: true,
      stockStatus: true,
      gender: true,
      size: true,
      type: true,
      sizesAvailable: true,
      price: true,
      price3mlOnline: true,
      price6mlOnline: true,
      price12mlOnline: true,
      price50mlOnline: true,
      category: { select: { name: true } },
    },
    orderBy: [{ displayOrder: "desc" }, { name: "asc" }],
  })

  const lines = [COLUMNS.map(cell).join(",")]

  for (const product of products) {
    const options = resolveSizeOptions(product)
    const cheapest = options.reduce<{ size: string; price: number } | null>(
      (best, option) =>
        !best || option.price < best.price
          ? { size: option.size, price: option.price }
          : best,
      null
    )

    // A product with no online price cannot be advertised.
    if (!cheapest) continue

    let extraImages: string[] = []
    try {
      const parsed = JSON.parse(product.images || "[]")
      if (Array.isArray(parsed)) {
        extraImages = parsed
          .filter((value): value is string => typeof value === "string")
          .map(absoluteUrl)
          .filter(Boolean)
      }
    } catch {
      extraImages = []
    }

    const inStock = product.inStock && product.stockStatus === "in_stock"
    const description =
      product.shortDescription?.trim() ||
      product.description?.trim() ||
      `${product.name} — ${product.category?.name ?? "fragrance"} by ${BRAND}.`

    lines.push(
      [
        cell(product.id),
        cell(product.name),
        cell(description.slice(0, 5000)),
        cell(inStock ? "in stock" : "out of stock"),
        cell("new"),
        cell(price(cheapest.price)),
        cell(`${SITE_URL}/shop/${product.slug}`),
        cell(absoluteUrl(product.image)),
        cell(extraImages.slice(0, 10).join(",")),
        cell(BRAND),
        cell(CATEGORY),
        cell(CATEGORY),
        cell(product.gender || "Unisex"),
        cell(cheapest.size),
        cell(inStock ? 100 : 0),
        cell(product.type || "Attar"),
      ].join(",")
    )
  }

  return new NextResponse(`\uFEFF${lines.join("\r\n")}\r\n`, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'inline; filename="safari-perfumes-catalog.csv"',
      "Cache-Control": "no-store",
    },
  })
}
