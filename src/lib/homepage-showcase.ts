export interface ShowcaseProduct {
  slug: string
  name: string
  price: number
  originalPrice: number | null
  image: string
  rating: number
  reviews: number
  gender: string | null
  type: string | null
  currency: string | null
  impressionOf: string | null
  shortDescription: string | null
  description: string | null
  longDescription: string | null
  notesTop: string[]
  notesHeart: string[]
  notesBase: string[]
}

export interface ShowcaseConfig {
  visible: boolean
  productSlug: string
  label: string
  heading: string
  tagline: string
  description: string
  price: number | null
  originalPrice: number | null
  rating: number | null
  reviewsCount: number | null
  buttonText: string
  buttonLink: string
  image: string
}

export const DEFAULT_SHOWCASE_SLUG = 'white-oud-creation'

export const DEFAULT_SHOWCASE_CONFIG: ShowcaseConfig = {
  visible: true,
  productSlug: DEFAULT_SHOWCASE_SLUG,
  label: '',
  heading: '',
  tagline: '',
  description: '',
  price: null,
  originalPrice: null,
  rating: null,
  reviewsCount: null,
  buttonText: '',
  buttonLink: '',
  image: '',
}

export interface ShowcaseDisplay {
  visible: boolean
  productSlug: string
  name: string
  label: string
  heading: string
  tagline: string
  description: string
  price: number
  originalPrice: number | null
  rating: number
  reviewsCount: number
  showRating: boolean
  showPrice: boolean
  buttonText: string
  buttonLink: string
  image: string
  currency: string
  product: ShowcaseProduct | null
}

export const DEFAULT_SHOWCASE_DISPLAY: ShowcaseDisplay = {
  visible: true,
  productSlug: DEFAULT_SHOWCASE_SLUG,
  name: 'White Oud',
  label: 'Signature Scent',
  heading: 'White Oud',
  tagline: '',
  description: '',
  price: 0,
  originalPrice: null,
  rating: 0,
  reviewsCount: 0,
  showRating: false,
  showPrice: false,
  buttonText: 'Shop Now',
  buttonLink: `/shop/${DEFAULT_SHOWCASE_SLUG}`,
  image: '',
  currency: 'PKR',
  product: null,
}

export function parseList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    : []
}

export function formatPrice(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString('en-PK')
}

export function firstSentence(value: string | null | undefined): string {
  if (!value) return ''
  const line = value.trim().split(/\n/)[0]
  const match = line?.split(/[.!?]/)[0]
  return match?.trim() ?? ''
}

export function pickDescription(p: ShowcaseProduct): string {
  const source =
    p.shortDescription ||
    p.description ||
    (p.longDescription ?? '').split('\n\n')[0].replace(/\*\*/g, '')
  return source?.trim() ?? ''
}

export function deriveHeading(p: ShowcaseProduct): string {
  const impression = p.impressionOf?.trim()
  if (impression) return impression
  const name = p.name?.trim()
  if (!name) return 'White Oud'
  const stripped = name.replace(/^Impression\s+of\s+/i, '').trim()
  return stripped || 'White Oud'
}

export function resolveShowcaseDisplay(
  config: ShowcaseConfig,
  product: ShowcaseProduct | null
): ShowcaseDisplay {
  const heading = config.heading.trim() || (product ? deriveHeading(product) : 'White Oud')
  const name = heading
  const label = config.label.trim() || 'Signature Scent'
  const taglineFull = config.tagline.trim() || (product ? firstSentence(product.longDescription) : '')
  const tagline = taglineFull ? `${taglineFull.replace(/[.!?]+$/, '')}.` : ''
  const description = config.description.trim() || (product ? pickDescription(product) : '')
  const price = config.price && config.price > 0 ? config.price : product && product.price > 0 ? product.price : 0
  const originalPrice =
    config.originalPrice && config.originalPrice > 0
      ? config.originalPrice
      : product?.originalPrice && product.originalPrice > 0
        ? product.originalPrice
        : null
  const rating = config.rating && config.rating > 0 ? config.rating : product?.rating ?? 0
  const reviewsCount =
    config.reviewsCount && config.reviewsCount > 0 ? config.reviewsCount : product?.reviews ?? 0
  const productSlug = config.productSlug?.trim() || product?.slug || DEFAULT_SHOWCASE_SLUG
  const image = config.image.trim() || product?.image || ''
  const currency = product?.currency || 'PKR'

  return {
    visible: config.visible !== false,
    productSlug,
    name,
    label,
    heading,
    tagline,
    description,
    price,
    originalPrice,
    rating,
    reviewsCount,
    showRating: rating > 0 && reviewsCount > 0,
    showPrice: price > 0,
    buttonText: config.buttonText.trim() || 'Shop Now',
    buttonLink: config.buttonLink.trim() || `/shop/${productSlug}`,
    image,
    currency,
    product,
  }
}