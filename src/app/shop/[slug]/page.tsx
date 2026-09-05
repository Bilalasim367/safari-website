import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { SITE_URL } from '@/lib/site'
import { readPopupSettings } from '@/lib/popup-settings'
import ProductDetailClient, { type RelatedProduct } from './ProductDetailClient'

export const revalidate = 300
export const dynamicParams = true

interface JsonLd {
  '@context': string
  '@type': string
  [key: string]: unknown
}

function parseJsonArray(val: string | null | undefined): string[] {
  if (!val) return []
  try {
    const parsed = JSON.parse(val)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function parseSizePrices(val: string | null | undefined) {
  if (!val) return []
  try {
    const parsed = JSON.parse(val)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function cleanText(s: string): string {
  return s.replace(/\bnan\b/gi, '').replace(/\s{2,}/g, ' ').trim()
}

function formatProduct(product: {
  id: string
  name: string
  slug: string
  price: number
  originalPrice: number | null
  image: string
  images: string
  category: { name: string; slug: string } | null
  categorySlug: string | null
  size: string
  sizePrices: string
  fragranceFamily: string | null
  rating: number
  reviewCount: number
  description: string | null
  shortDescription: string | null
  longDescription: string | null
  isBestseller: boolean
  isNew: boolean
  inStock: boolean
  notesTop: string
  notesHeart: string
  notesBase: string
  type: string | null
  gender: string | null
  season: string | null
  impressionOf: string | null
  tags: string | null
  sizesAvailable: string | null
  currency: string | null
  concentration: string | null
  bottleStyle: string | null
  longevity: string | null
  sillage: string | null
  applicatorType: string | null
  origin: string | null
  ingredients: string | null
  metaTitle: string | null
  metaDescription: string | null
  notes: string | null
}) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    originalPrice: product.originalPrice,
    image: product.image || '',
    images: parseJsonArray(product.images),
    category: product.category ? { name: product.category.name, slug: product.category.slug } : null,
    categorySlug: product.categorySlug || undefined,
    size: product.size,
    sizePrices: parseSizePrices(product.sizePrices),
    fragranceFamily: product.fragranceFamily,
    rating: product.rating,
    reviews: product.reviewCount,
    description: product.description || '',
    shortDescription: product.shortDescription || undefined,
    isBestseller: product.isBestseller,
    isNew: product.isNew,
    inStock: product.inStock,
    notesTop: parseJsonArray(product.notesTop),
    notesHeart: parseJsonArray(product.notesHeart),
    notesBase: parseJsonArray(product.notesBase),
    type: product.type || undefined,
    gender: product.gender || undefined,
    season: product.season || undefined,
    impressionOf: product.impressionOf || undefined,
    tags: product.tags || undefined,
    sizesAvailable: product.sizesAvailable || undefined,
    currency: product.currency || 'PKR',
    longDescription: product.longDescription || undefined,
    metaTitle: product.metaTitle || undefined,
    metaDescription: product.metaDescription || undefined,
    concentration: product.concentration || undefined,
    bottleStyle: product.bottleStyle || undefined,
    longevity: product.longevity || undefined,
    sillage: product.sillage || undefined,
    applicatorType: product.applicatorType || undefined,
    origin: product.origin || undefined,
    ingredients: product.ingredients || undefined,
    notes: product.notes || undefined,
  }
}

async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: { category: { select: { name: true, slug: true } } },
  })
}

function buildDescription(product: NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>): string {
  let desc = cleanText(product.shortDescription || '')
  if (!desc) {
    desc = cleanText((product.longDescription || '').split('\n\n')[0]).replace(/\*\*/g, '')
  }
  if (!desc) {
    const notes = [
      ...parseJsonArray(product.notesTop),
      ...parseJsonArray(product.notesHeart),
      ...parseJsonArray(product.notesBase),
    ]
    if (notes.length) desc = `Fragrance notes: ${notes.join(', ')}`
  }
  if (desc.length > 155) desc = desc.slice(0, 152).trimEnd() + '...'
  return desc
}

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  })
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return {
      title: 'Product Not Found | Safari Perfumes',
      robots: { index: false },
    }
  }

  // SEO-optimized title: {fragranceName} Impression — {type} | Safari Perfumes (under ~65 chars)
  const fragranceName = product.name
  const typeLabel = product.type === 'Attar' ? 'Attar' : product.type === 'Perfume' ? 'Perfume' : 'Fragrance'
  let title = `${fragranceName} Impression — ${typeLabel} | Safari Perfumes`
  if (title.length > 65) {
    title = `${fragranceName.substring(0, 65 - (' Impression — '.length + typeLabel.length + ' | Safari Perfumes'.length))}… Impression — ${typeLabel} | Safari Perfumes`
  }

  // SEO-optimized description with notes (under ~155 chars)
  const notesTop = product.notesTop ? JSON.parse(product.notesTop) : []
  const notesBase = product.notesBase ? JSON.parse(product.notesBase) : []
  const topNoteStr = notesTop.slice(0, 3).join(', ')
  const baseNoteStr = notesBase.slice(0, 2).join(', ')
  let description = `Shop our ${fragranceName} impression`
  if (topNoteStr) description += ` — ${topNoteStr} top notes`
  if (baseNoteStr) description += `, ${baseNoteStr} base`
  description += '. Alcohol-free attar & EDP spray. Free delivery across Pakistan.'
  if (description.length > 155) {
    description = description.substring(0, 152) + '...'
  }

  const url = `${SITE_URL}/shop/${product.slug}`
  const image = product.image?.trim()

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Safari Perfumes',
      type: 'website',
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    prisma.settings.findFirst(),
  ])

  if (!product) notFound()

  const related = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: product.id },
      ...(product.categorySlug ? { categorySlug: product.categorySlug } : {}),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      image: true,
      images: true,
      categorySlug: true,
      isNew: true,
      isBestseller: true,
      size: true,
      rating: true,
      reviewCount: true,
      gender: true,
      season: true,
      impressionOf: true,
      currency: true,
      category: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 4,
  })

  const formattedProduct = formatProduct(product)
  const relatedProducts: RelatedProduct[] = related.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    image: p.image || '',
    images: parseJsonArray(p.images),
    category: p.category?.name || 'Unisex',
    isNew: p.isNew,
    isBestseller: p.isBestseller,
    size: p.size || '50ml',
    rating: p.rating,
    reviewCount: p.reviewCount,
    gender: p.gender,
    season: p.season,
    impressionOf: p.impressionOf,
    currency: p.currency,
  }))

  const productUrl = `${SITE_URL}/shop/${product.slug}`
  const jsonLd: JsonLd[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: buildDescription(product),
      image: product.image?.trim() ? [product.image.trim()] : undefined,
      brand: { '@type': 'Brand', name: 'Safari Perfumes' },
      category: product.category?.name || product.type || undefined,
      sku: product.slug,
      offers: {
        '@type': 'Offer',
        url: productUrl,
        priceCurrency: product.currency || 'PKR',
        price: String(Math.round(product.price)),
        availability: product.inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      },
      ...(product.reviewCount > 0 && product.rating > 0
        ? {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: String(product.rating),
              reviewCount: String(product.reviewCount),
            },
          }
        : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE_URL}/shop` },
        { '@type': 'ListItem', position: 3, name: product.name, item: productUrl },
      ],
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient
        product={formattedProduct}
        relatedProducts={relatedProducts}
        freeShippingThreshold={settings?.freeShippingThreshold ?? null}
        whatsappNumber={readPopupSettings().whatsappNumber}
      />
    </>
  )
}