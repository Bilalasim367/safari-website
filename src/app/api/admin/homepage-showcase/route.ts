import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import {
  readHomepageShowcase,
  writeHomepageShowcase,
} from '@/lib/homepage-showcase-store'
import { DEFAULT_SHOWCASE_SLUG, type ShowcaseConfig } from '@/lib/homepage-showcase'

export const runtime = 'nodejs'

interface AuthPayload {
  role?: string
}

async function requireAdmin(): Promise<AuthPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) return null
  const auth = (await verifyToken(token)) as AuthPayload | null
  if (!auth || auth.role !== 'admin') return null
  return auth
}

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function toPositiveNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : null
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
  }
  return null
}

export async function GET() {
  const auth = await requireAdmin()
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json(readHomepageShowcase())
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as Record<string, unknown>

    const heading = str(body.heading)
    const price = toPositiveNumber(body.price)

    if (!heading) {
      return NextResponse.json({ error: 'Heading is required' }, { status: 400 })
    }
    if (price === null) {
      return NextResponse.json({ error: 'Price is required' }, { status: 400 })
    }

    const rating = toPositiveNumber(body.rating)
    const reviewsCount = toPositiveNumber(body.reviewsCount)
    const originalPrice = toPositiveNumber(body.originalPrice)

    const next: ShowcaseConfig = {
      visible: body.visible !== false,
      productSlug: str(body.productSlug) || DEFAULT_SHOWCASE_SLUG,
      label: str(body.label),
      heading,
      tagline: str(body.tagline),
      description: str(body.description),
      price,
      originalPrice,
      rating: rating !== null ? Math.min(5, Math.max(1, rating)) : null,
      reviewsCount: reviewsCount !== null ? Math.floor(reviewsCount) : null,
      buttonText: str(body.buttonText),
      buttonLink: str(body.buttonLink),
      image: str(body.image),
    }

    const result = writeHomepageShowcase(next)
    if (!result.ok) {
      return NextResponse.json({ error: result.error || 'Failed to save showcase' }, { status: 500 })
    }

    return NextResponse.json(next)
  } catch {
    return NextResponse.json({ error: 'Failed to update showcase' }, { status: 500 })
  }
}