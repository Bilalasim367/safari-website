import fs from 'fs'
import path from 'path'
import { DEFAULT_SHOWCASE_CONFIG, type ShowcaseConfig } from './homepage-showcase'

const DATA_DIR = path.join(process.cwd(), 'data')
const SHOWCASE_FILE = path.join(DATA_DIR, 'homepage-showcase.json')

export function readHomepageShowcase(): ShowcaseConfig {
  try {
    if (!fs.existsSync(SHOWCASE_FILE)) return { ...DEFAULT_SHOWCASE_CONFIG }
    const raw = JSON.parse(fs.readFileSync(SHOWCASE_FILE, 'utf-8')) as Record<string, unknown>
    return {
      visible: typeof raw.visible === 'boolean' ? raw.visible : DEFAULT_SHOWCASE_CONFIG.visible,
      productSlug:
        typeof raw.productSlug === 'string' && raw.productSlug.trim()
          ? raw.productSlug
          : DEFAULT_SHOWCASE_CONFIG.productSlug,
      label: typeof raw.label === 'string' ? raw.label : '',
      heading: typeof raw.heading === 'string' ? raw.heading : '',
      tagline: typeof raw.tagline === 'string' ? raw.tagline : '',
      description: typeof raw.description === 'string' ? raw.description : '',
      price: typeof raw.price === 'number' && raw.price > 0 ? raw.price : null,
      originalPrice:
        typeof raw.originalPrice === 'number' && raw.originalPrice > 0 ? raw.originalPrice : null,
      rating: typeof raw.rating === 'number' && raw.rating > 0 ? raw.rating : null,
      reviewsCount:
        typeof raw.reviewsCount === 'number' && raw.reviewsCount > 0 ? raw.reviewsCount : null,
      buttonText: typeof raw.buttonText === 'string' ? raw.buttonText : '',
      buttonLink: typeof raw.buttonLink === 'string' ? raw.buttonLink : '',
      image: typeof raw.image === 'string' ? raw.image : '',
    }
  } catch {
    return { ...DEFAULT_SHOWCASE_CONFIG }
  }
}

export function writeHomepageShowcase(settings: ShowcaseConfig): { ok: boolean; error?: string } {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(SHOWCASE_FILE, JSON.stringify(settings, null, 2), 'utf-8')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}