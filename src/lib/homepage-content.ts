import { z } from "zod"

/* ============================================================================
 * HOMEPAGE + SITE CONTENT — types, validation, defaults
 * ----------------------------------------------------------------------------
 * Every string the owner can change from the dashboard is defined here.
 * The defaults are the EXACT copy that was previously hardcoded in components,
 * so the storefront looks identical on day one.
 *
 * Stored in MySQL:
 *   HomepageSection.config  -> JSON text (per-section copy/items)
 *   HomepageSlide           -> promo slider slides
 *   SiteContent.value       -> JSON text (header/footer/page hero blocks)
 * ========================================================================== */

export const MAX_PROMO_SLIDES = 8

/* -------------------------------------------------------------------------- */
/* Links                                                                       */
/* -------------------------------------------------------------------------- */

/** Only same-site paths or absolute http(s) URLs are allowed. */
const SAFE_LINK = /^(\/[^\s]*|https?:\/\/[^\s]+)$/i

export function isSafeHref(value: string | null | undefined): boolean {
  if (!value) return false
  const trimmed = value.trim()
  if (trimmed === "" || trimmed === "#") return false
  return SAFE_LINK.test(trimmed)
}

/** Returns a render-safe href, or the fallback when the stored value is unsafe. */
export function safeHref(value: string | null | undefined, fallback = "/shop"): string {
  return isSafeHref(value) ? (value as string).trim() : fallback
}

/** Uploaded images resolve to https Blob URLs or local /public paths. */
export function isSafeImageSrc(value: string | null | undefined): boolean {
  if (!value) return false
  const trimmed = value.trim()
  return /^(\/[^\s]*|https?:\/\/[^\s]+)$/i.test(trimmed)
}

const linkSchema = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || SAFE_LINK.test(v), "Enter a site path (/shop) or full https:// URL")

/** Optional link field: empty string becomes undefined. */
const optionalLinkSchema = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || SAFE_LINK.test(v), "Enter a site path (/shop) or full https:// URL")
  .optional()

const text = (max: number) => z.string().trim().max(max)
const optionalText = (max: number) => z.string().trim().max(max).optional()

/* -------------------------------------------------------------------------- */
/* Section registry                                                           */
/* -------------------------------------------------------------------------- */

export const HOMEPAGE_SECTION_KEYS = [
  "hero",
  "new_season",
  "launch_banner",
  "promo_slider",
  "trending",
  "signature",
  "men",
  "lifestyle",
  "women",
  "collections",
  "unisex",
  "why_us",
  "testimonials",
  "newsletter",
] as const

export type HomepageSectionKey = (typeof HOMEPAGE_SECTION_KEYS)[number]

export interface HomepageSectionMeta {
  key: HomepageSectionKey
  label: string
  /** Short description shown in the admin Layout tab. */
  description: string
  /** Sections without copy (product-driven or managed elsewhere) still reorder. */
  editable: boolean
  defaultSortOrder: number
}

export const HOMEPAGE_SECTION_META: HomepageSectionMeta[] = [
  {
    key: "hero",
    label: "Hero",
    description: "Top banner with headline, description, CTA buttons, trust numbers and image.",
    editable: true,
    defaultSortOrder: 0,
  },
  {
    key: "new_season",
    label: "New This Season carousel",
    description: "Products pinned with a display order (Admin → Products → Display order).",
    editable: true,
    defaultSortOrder: 10,
  },
  {
    key: "launch_banner",
    label: "New Launch banner",
    description: "Dark 'Discover The Next Signature Scent' campaign banner.",
    editable: true,
    defaultSortOrder: 20,
  },
  {
    key: "promo_slider",
    label: "Promo slider (uploaded images)",
    description: "Image slider managed in the Slider tab. Sits above Trending This Week.",
    editable: false,
    defaultSortOrder: 30,
  },
  {
    key: "trending",
    label: "Trending This Week carousel",
    description: "Hot Selling products (Admin → Products → Hot Selling).",
    editable: true,
    defaultSortOrder: 40,
  },
  {
    key: "signature",
    label: "Signature perfume showcase",
    description: "Managed in Admin → Showcase.",
    editable: false,
    defaultSortOrder: 50,
  },
  {
    key: "men",
    label: "Men collection",
    description: "Men's product carousel (products with gender = Men).",
    editable: true,
    defaultSortOrder: 60,
  },
  {
    key: "lifestyle",
    label: "Lifestyle banner",
    description: "Full-width 'Crafted for Every Occasion' image banner.",
    editable: true,
    defaultSortOrder: 70,
  },
  {
    key: "women",
    label: "Women collection",
    description: "Women's product carousel (products with gender = Women).",
    editable: true,
    defaultSortOrder: 80,
  },
  {
    key: "collections",
    label: "Featured collections",
    description: "Four collection cards (Our Collection, Perfumes, Tester Box, Attar).",
    editable: true,
    defaultSortOrder: 90,
  },
  {
    key: "unisex",
    label: "Unisex trend",
    description: "Unisex product carousel (products with gender = Unisex).",
    editable: true,
    defaultSortOrder: 100,
  },
  {
    key: "why_us",
    label: "Why choose us",
    description: "Four trust points (original, COD, delivery, returns).",
    editable: true,
    defaultSortOrder: 110,
  },
  {
    key: "testimonials",
    label: "Testimonials",
    description: "Customer quotes shown above the newsletter.",
    editable: true,
    defaultSortOrder: 120,
  },
  {
    key: "newsletter",
    label: "Newsletter",
    description: "Email signup block at the bottom of the homepage.",
    editable: true,
    defaultSortOrder: 130,
  },
]

export const HOMEPAGE_SECTION_LABELS: Record<HomepageSectionKey, string> = Object.fromEntries(
  HOMEPAGE_SECTION_META.map((s) => [s.key, s.label])
) as Record<HomepageSectionKey, string>

export function isHomepageSectionKey(value: string): value is HomepageSectionKey {
  return (HOMEPAGE_SECTION_KEYS as readonly string[]).includes(value)
}

/* -------------------------------------------------------------------------- */
/* Icons (strings in DB, mapped to lucide components at render time)           */
/* -------------------------------------------------------------------------- */

export const HERO_ICONS = ["shield", "clock", "banknote", "truck", "sparkles", "gift"] as const
export const WHY_US_ICONS = [
  "badge-check",
  "banknote",
  "truck",
  "rotate-ccw",
  "shield",
  "sparkles",
  "headphones",
  "package",
] as const

export type HeroIconName = (typeof HERO_ICONS)[number]
export type WhyUsIconName = (typeof WHY_US_ICONS)[number]

/* -------------------------------------------------------------------------- */
/* Hero                                                                        */
/* -------------------------------------------------------------------------- */

export const DEFAULT_HERO = {
  headingLine1: "Inspired Fragrances,",
  headingLine2: "Affordable Luxury",
  description:
    "Premium quality perfumes at unbeatable prices. Long-lasting impressions that turn heads.",
  shopLabel: "Shop Now",
  shopHref: "/shop",
  bundlesLabel: "Bundle Deals",
  bundlesHref: "/bundles",
  features: [
    { icon: "shield", label: "Alcohol-Free" },
    { icon: "clock", label: "Long Lasting" },
    { icon: "banknote", label: "Cash on Delivery" },
    { icon: "truck", label: "Free Shipping" },
  ],
  trust: {
    rating: "4.8/5",
    reviews: "350+ Reviews",
    customers: "2,000+",
    customersLabel: "Happy Customers",
  },
  image: {
    src: "/new-banneri.webp",
    alt: "Premium perfume collection",
  },
}

export const heroConfigSchema = z.object({
  headingLine1: text(120),
  headingLine2: text(120),
  description: text(400),
  shopLabel: text(40),
  shopHref: linkSchema,
  bundlesLabel: text(40),
  bundlesHref: linkSchema,
  features: z
    .array(z.object({ icon: z.string().max(40), label: text(60) }))
    .max(6),
  trust: z.object({
    rating: text(20),
    reviews: text(40),
    customers: text(40),
    customersLabel: text(40),
  }),
  image: z.object({ src: text(500), alt: text(160) }),
})

export type HeroConfig = z.infer<typeof heroConfigSchema>

/* -------------------------------------------------------------------------- */
/* Carousel headings (New This Season / Trending / Men / Women / Unisex)      */
/* -------------------------------------------------------------------------- */

export const DEFAULT_NEW_SEASON = {
  eyebrow: "Just Arrived",
  title: "New This Season",
  viewAllLabel: "View All",
  viewAllHref: "/shop?sort=newest",
  ariaLabel: "New arrivals carousel",
}

export const DEFAULT_TRENDING = {
  eyebrow: "Hot Selling",
  title: "Trending This Week",
  viewAllLabel: "View All",
  viewAllHref: "/shop?sort=hot",
  ariaLabel: "Hot selling products carousel",
}

export const DEFAULT_MEN = {
  eyebrow: "Men Collection",
  title: "Men Collection",
  viewAllLabel: "View All Men",
  viewAllHref: "/shop?gender=men&sort=trending",
  ariaLabel: "Men collection carousel",
}

export const DEFAULT_WOMEN = {
  eyebrow: "Women Collection",
  title: "Women Collection",
  viewAllLabel: "View All Women",
  viewAllHref: "/shop?gender=women&sort=trending",
  ariaLabel: "Women collection carousel",
}

export const DEFAULT_UNISEX = {
  eyebrow: "Unisex Trend",
  title: "Unisex Trending",
  viewAllLabel: "View All Unisex",
  viewAllHref: "/shop?gender=unisex&sort=trending",
  ariaLabel: "Unisex products carousel",
}

export const carouselConfigSchema = z.object({
  eyebrow: text(80),
  title: text(120),
  viewAllLabel: text(40),
  viewAllHref: linkSchema,
  ariaLabel: text(120),
})

export type CarouselConfig = z.infer<typeof carouselConfigSchema>

/* -------------------------------------------------------------------------- */
/* New launch banner                                                           */
/* -------------------------------------------------------------------------- */

export const DEFAULT_LAUNCH_BANNER = {
  badge: "New Collection · 2026",
  headingLine1: "Discover The Next",
  headingLine2: "Signature Scent",
  description:
    "A fresh drop of long-lasting fragrances crafted for everyday elegance. Limited stock — once they're gone, they're gone.",
  highlights: ["31 New Perfumes", "4 Collections", "30ml & 50ml Bottles", "Limited-Time Prices"],
  primaryLabel: "Explore New Launch",
  primaryHref: "/shop",
  secondaryLabel: "View Launch Deals",
  secondaryHref: "/bundles",
  image: {
    src: "/products/1778728380687-i4snbw.webp",
    alt: "Warm-lit display of Safari Perfumes bottles on stone podiums",
    pill: "New Arrivals",
  },
}

export const launchBannerConfigSchema = z.object({
  badge: text(80),
  headingLine1: text(120),
  headingLine2: text(120),
  description: text(500),
  highlights: z.array(text(80)).max(8),
  primaryLabel: text(40),
  primaryHref: linkSchema,
  secondaryLabel: text(40),
  secondaryHref: linkSchema,
  image: z.object({ src: text(500), alt: text(160), pill: text(40) }),
})

export type LaunchBannerConfig = z.infer<typeof launchBannerConfigSchema>

/* -------------------------------------------------------------------------- */
/* Lifestyle banner                                                            */
/* -------------------------------------------------------------------------- */

export const DEFAULT_LIFESTYLE = {
  eyebrow: "The Art of Fragrance",
  title: "Crafted for Every Occasion",
  subtitle: "From timeless classics to bold signatures",
  ctaLabel: "Explore All",
  ctaHref: "/shop",
}

export const lifestyleConfigSchema = z.object({
  eyebrow: text(80),
  title: text(140),
  subtitle: text(200),
  ctaLabel: text(40),
  ctaHref: linkSchema,
})

export type LifestyleConfig = z.infer<typeof lifestyleConfigSchema>

/* -------------------------------------------------------------------------- */
/* Featured collections                                                        */
/* -------------------------------------------------------------------------- */

export const DEFAULT_COLLECTIONS = {
  eyebrow: "Featured Collections",
  title: "Discover Our Fragrance Collection",
  cards: [
    {
      id: "our-collection",
      title: "Our Collection",
      count: "319 Products",
      description: "Every Safari fragrance in one place, browse the full range.",
      tags: ["Bestsellers", "New Arrivals", "Unisex"],
      cta: "Explore Our Collection",
      href: "/collections",
      image: "/safari-our-collection.webp",
    },
    {
      id: "perfumes",
      title: "Perfumes Collection",
      count: "264 Products",
      description: "Designer-inspired sprays in 30ml, 50ml and 100ml sizes.",
      tags: ["Men's Perfumes", "Women's Perfumes", "Woody"],
      cta: "Shop Perfumes Now",
      href: "/shop?type=perfume",
      image: "/safari-perfume-collection.webp",
    },
    {
      id: "tester-box",
      title: "Tester Box",
      count: "Coming Soon",
      description: "Curated 5ml testers to explore before you commit to a full bottle.",
      tags: ["Discovery Set", "5ml Samplers", "Gift Ready"],
      cta: "Shop Tester Boxes",
      href: "/shop?q=tester",
      image: "",
    },
    {
      id: "attar",
      title: "Attar Collection",
      count: "55 Products",
      description: "Pure, concentrated perfume oils for lasting intensity.",
      tags: ["Oud Attar", "Musk Attar", "Floral Attar"],
      cta: "Discover Attar Collection",
      href: "/shop?type=attar",
      image: "/safari-attar-collection.webp",
    },
  ],
}

const collectionCardSchema = z.object({
  id: text(60),
  title: text(100),
  count: text(40),
  description: text(240),
  tags: z.array(text(40)).max(6),
  cta: text(60),
  href: linkSchema,
  image: optionalText(500),
})

export const collectionsConfigSchema = z.object({
  eyebrow: text(80),
  title: text(140),
  cards: z.array(collectionCardSchema).max(8),
})

export type CollectionsConfig = z.infer<typeof collectionsConfigSchema>

/* -------------------------------------------------------------------------- */
/* Why choose us                                                               */
/* -------------------------------------------------------------------------- */

export const DEFAULT_WHY_US = {
  features: [
    { icon: "badge-check", title: "100% Original", desc: "Authentic designer-inspired blends" },
    { icon: "banknote", title: "Cash on Delivery", desc: "Pay only when you receive" },
    { icon: "truck", title: "Free Delivery", desc: "On orders across Pakistan" },
    { icon: "rotate-ccw", title: "Easy Returns", desc: "Hassle-free exchange within 7 days" },
  ],
}

export const whyUsConfigSchema = z.object({
  features: z
    .array(
      z.object({
        icon: z.string().max(40),
        title: text(60),
        desc: text(140),
      })
    )
    .max(6),
})

export type WhyUsConfig = z.infer<typeof whyUsConfigSchema>

/* -------------------------------------------------------------------------- */
/* Testimonials                                                                */
/* -------------------------------------------------------------------------- */

export const DEFAULT_TESTIMONIALS = {
  eyebrow: "Testimonials",
  title: "Loved by Fragrance Connoisseurs",
  viewAllLabel: "Read All Reviews",
  viewAllHref: "/shop#reviews",
  items: [
    {
      name: "Ahmed Hassan",
      location: "Karachi, Pakistan",
      rating: 5,
      text: "Safari Midnight has become my signature scent. The oud and amber blend is absolutely mesmerizing — I get compliments every single time I wear it. The longevity is incredible, lasting 12+ hours on my skin.",
      product: "Safari Midnight",
    },
    {
      name: "Fatima Ali",
      location: "Lahore, Pakistan",
      rating: 5,
      text: "I was skeptical about buying perfume online, but the Discovery Set changed everything. Being able to sample before committing to a full bottle is brilliant. Safari Oud is now my go-to for evening events — sophisticated and unforgettable.",
      product: "Safari Oud",
    },
    {
      name: "Muhammad Usman",
      location: "Islamabad, Pakistan",
      rating: 5,
      text: "The Attar collection is pure luxury in a bottle. I've never experienced such concentrated, long-lasting fragrance oils. A single drop of Safari Rose Attar stays with me all day. The packaging is also exquisite — makes gifting effortless.",
      product: "Safari Rose Attar",
    },
  ],
}

export const testimonialsConfigSchema = z.object({
  eyebrow: text(80),
  title: text(140),
  viewAllLabel: text(40),
  viewAllHref: linkSchema,
  items: z
    .array(
      z.object({
        name: text(80),
        location: text(80),
        rating: z.coerce.number().int().min(1).max(5),
        text: text(800),
        product: text(120),
      })
    )
    .max(6),
})

export type TestimonialsConfig = z.infer<typeof testimonialsConfigSchema>

/* -------------------------------------------------------------------------- */
/* Newsletter                                                                  */
/* -------------------------------------------------------------------------- */

export const DEFAULT_NEWSLETTER = {
  eyebrow: "Join the Safari Circle",
  title: "Unlock Exclusive Access",
  description:
    "Be the first to discover new releases, enjoy members-only pricing, and receive a {{highlight}} on your first order.",
  highlight: "15% welcome discount",
  buttonLabel: "Subscribe",
  successMessage: "Thank you for subscribing! Your welcome offer is on its way.",
  disclaimer: "By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.",
}

export const newsletterConfigSchema = z.object({
  eyebrow: text(80),
  title: text(140),
  description: text(400),
  highlight: optionalText(80),
  buttonLabel: text(40),
  successMessage: text(240),
  disclaimer: text(240),
})

export type NewsletterConfig = z.infer<typeof newsletterConfigSchema>

/* -------------------------------------------------------------------------- */
/* Config map + schema map                                                     */
/* -------------------------------------------------------------------------- */

export interface HomepageSectionConfigMap {
  hero: HeroConfig
  new_season: CarouselConfig
  launch_banner: LaunchBannerConfig
  promo_slider: null
  trending: CarouselConfig
  signature: null
  men: CarouselConfig
  lifestyle: LifestyleConfig
  women: CarouselConfig
  collections: CollectionsConfig
  unisex: CarouselConfig
  why_us: WhyUsConfig
  testimonials: TestimonialsConfig
  newsletter: NewsletterConfig
}

export const DEFAULT_SECTION_CONFIGS: HomepageSectionConfigMap = {
  hero: DEFAULT_HERO as HeroConfig,
  new_season: DEFAULT_NEW_SEASON as CarouselConfig,
  launch_banner: DEFAULT_LAUNCH_BANNER as LaunchBannerConfig,
  promo_slider: null,
  trending: DEFAULT_TRENDING as CarouselConfig,
  signature: null,
  men: DEFAULT_MEN as CarouselConfig,
  lifestyle: DEFAULT_LIFESTYLE as LifestyleConfig,
  women: DEFAULT_WOMEN as CarouselConfig,
  collections: DEFAULT_COLLECTIONS as CollectionsConfig,
  unisex: DEFAULT_UNISEX as CarouselConfig,
  why_us: DEFAULT_WHY_US as WhyUsConfig,
  testimonials: DEFAULT_TESTIMONIALS as TestimonialsConfig,
  newsletter: DEFAULT_NEWSLETTER as NewsletterConfig,
}

const SECTION_SCHEMAS: {
  [K in HomepageSectionKey]: K extends "promo_slider" | "signature"
    ? null
    : z.ZodType<HomepageSectionConfigMap[K]>
} = {
  hero: heroConfigSchema,
  new_season: carouselConfigSchema,
  launch_banner: launchBannerConfigSchema,
  promo_slider: null,
  trending: carouselConfigSchema,
  signature: null,
  men: carouselConfigSchema,
  lifestyle: lifestyleConfigSchema,
  women: carouselConfigSchema,
  collections: collectionsConfigSchema,
  unisex: carouselConfigSchema,
  why_us: whyUsConfigSchema,
  testimonials: testimonialsConfigSchema,
  newsletter: newsletterConfigSchema,
}

/* -------------------------------------------------------------------------- */
/* Admin form field definitions (drives the generic section editor)            */
/* -------------------------------------------------------------------------- */

export type SectionField =
  | {
      name: string
      label: string
      type: "text" | "textarea" | "link" | "image"
      placeholder?: string
      help?: string
      /** Value used when a new list item is added. */
      defaultValue?: string
    }
  | {
      name: string
      label: string
      type: "number"
      min?: number
      max?: number
      defaultValue?: number
      help?: string
    }
  | {
      name: string
      label: string
      type: "stringList"
      itemLabel?: string
      placeholder?: string
      maxItems?: number
    }
  | {
      name: string
      label: string
      type: "groupList"
      itemLabel: string
      maxItems?: number
      fields: SectionField[]
    }
  | {
      name: string
      label: string
      type: "group"
      fields: SectionField[]
    }

export const SECTION_FIELDS: Partial<Record<HomepageSectionKey, SectionField[]>> = {
  hero: [
    { name: "headingLine1", label: "Headline — first line (gold)", type: "text" },
    { name: "headingLine2", label: "Headline — second line (dark)", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "shopLabel", label: "Primary button label", type: "text" },
    { name: "shopHref", label: "Primary button link", type: "link", placeholder: "/shop" },
    { name: "bundlesLabel", label: "Secondary button label", type: "text" },
    { name: "bundlesHref", label: "Secondary button link", type: "link", placeholder: "/bundles" },
    { name: "image.src", label: "Hero image", type: "image" },
    { name: "image.alt", label: "Hero image alt text", type: "text" },
    {
      name: "features",
      label: "Feature bullets",
      type: "groupList",
      itemLabel: "Feature",
      maxItems: 6,
      fields: [
        { name: "label", label: "Label", type: "text" },
        {
          name: "icon",
          label: "Icon (shield, clock, banknote, truck, sparkles, gift)",
          type: "text",
        },
      ],
    },
    {
      name: "trust",
      label: "Trust numbers",
      type: "group",
      fields: [
        { name: "rating", label: "Rating text", type: "text" },
        { name: "reviews", label: "Reviews text", type: "text" },
        { name: "customers", label: "Customer count", type: "text" },
        { name: "customersLabel", label: "Customer count label", type: "text" },
      ],
    },
  ],
  new_season: carouselFields("New This Season"),
  trending: carouselFields("Trending This Week"),
  men: carouselFields("Men Collection"),
  women: carouselFields("Women Collection"),
  unisex: carouselFields("Unisex Trend"),
  launch_banner: [
    { name: "badge", label: "Badge text", type: "text" },
    { name: "headingLine1", label: "Headline — first line (white)", type: "text" },
    { name: "headingLine2", label: "Headline — second line (gold)", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    {
      name: "highlights",
      label: "Highlight bullets",
      type: "stringList",
      itemLabel: "Highlight",
      maxItems: 8,
    },
    { name: "primaryLabel", label: "Primary button label", type: "text" },
    { name: "primaryHref", label: "Primary button link", type: "link" },
    { name: "secondaryLabel", label: "Secondary button label", type: "text" },
    { name: "secondaryHref", label: "Secondary button link", type: "link" },
    { name: "image.src", label: "Banner image", type: "image" },
    { name: "image.alt", label: "Banner image alt text", type: "text" },
    { name: "image.pill", label: "Image pill label", type: "text" },
  ],
  lifestyle: [
    { name: "eyebrow", label: "Small eyebrow text", type: "text" },
    { name: "title", label: "Title", type: "text" },
    { name: "subtitle", label: "Subtitle", type: "text" },
    { name: "ctaLabel", label: "Button label", type: "text" },
    { name: "ctaHref", label: "Button link", type: "link" },
  ],
  collections: [
    { name: "eyebrow", label: "Eyebrow text", type: "text" },
    { name: "title", label: "Section title", type: "text" },
    {
      name: "cards",
      label: "Collection cards",
      type: "groupList",
      itemLabel: "Card",
      maxItems: 8,
      fields: [
        { name: "title", label: "Title", type: "text" },
        { name: "count", label: "Count / status text", type: "text" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "cta", label: "Button label", type: "text" },
        { name: "href", label: "Card link", type: "link" },
        {
          name: "tags",
          label: "Popular tags",
          type: "stringList",
          itemLabel: "Tag",
          maxItems: 6,
        },
        { name: "image", label: "Card image (optional)", type: "image" },
      ],
    },
  ],
  why_us: [
    {
      name: "features",
      label: "Trust points",
      type: "groupList",
      itemLabel: "Trust point",
      maxItems: 6,
      fields: [
        { name: "title", label: "Title", type: "text" },
        { name: "desc", label: "Description", type: "text" },
        {
          name: "icon",
          label: "Icon (badge-check, banknote, truck, rotate-ccw, shield, sparkles, headphones, package)",
          type: "text",
        },
      ],
    },
  ],
  testimonials: [
    { name: "eyebrow", label: "Eyebrow text", type: "text" },
    { name: "title", label: "Section title", type: "text" },
    { name: "viewAllLabel", label: "Review link label", type: "text" },
    { name: "viewAllHref", label: "Review link", type: "link" },
    {
      name: "items",
      label: "Testimonials",
      type: "groupList",
      itemLabel: "Testimonial",
      maxItems: 6,
      fields: [
        { name: "name", label: "Customer name", type: "text" },
        { name: "location", label: "Location", type: "text" },
        { name: "product", label: "Product name", type: "text" },
        { name: "rating", label: "Rating (1–5)", type: "number", min: 1, max: 5, defaultValue: 5 },
        { name: "text", label: "Quote", type: "textarea" },
      ],
    },
  ],
  newsletter: [
    { name: "eyebrow", label: "Eyebrow text", type: "text" },
    { name: "title", label: "Title", type: "text" },
    {
      name: "description",
      label: "Description (use {{highlight}} where the gold text goes)",
      type: "textarea",
    },
    { name: "highlight", label: "Highlighted phrase", type: "text" },
    { name: "buttonLabel", label: "Button label", type: "text" },
    { name: "successMessage", label: "Success message", type: "text" },
    { name: "disclaimer", label: "Small print", type: "text" },
  ],
}

function carouselFields(defaultTitle: string): SectionField[] {
  return [
    { name: "eyebrow", label: "Eyebrow text", type: "text", help: `Default: ${defaultTitle}` },
    { name: "title", label: "Section title", type: "text" },
    { name: "viewAllLabel", label: "View-all button label", type: "text" },
    { name: "viewAllHref", label: "View-all link", type: "link" },
    { name: "ariaLabel", label: "Accessibility label", type: "text" },
  ]
}

/* -------------------------------------------------------------------------- */
/* Promo slider                                                                */
/* -------------------------------------------------------------------------- */

export interface PromoSlideInput {
  eyebrow?: string | null
  title?: string | null
  subtitle?: string | null
  imageDesktop: string
  imageMobile?: string | null
  imageAlt?: string | null
  href?: string | null
  ctaLabel?: string | null
  openInNewTab?: boolean
  sortOrder?: number
  isActive?: boolean
  startsAt?: string | null
  endsAt?: string | null
}

export const promoSlideSchema = z
  .object({
    eyebrow: optionalText(80),
    title: optionalText(140),
    subtitle: optionalText(400),
    imageDesktop: text(500).min(1, "Desktop image is required"),
    imageMobile: optionalText(500),
    imageAlt: optionalText(160),
    href: optionalLinkSchema,
    ctaLabel: optionalText(40),
    openInNewTab: z.boolean().optional(),
    sortOrder: z.number().int().min(0).max(9999).optional(),
    isActive: z.boolean().optional(),
    startsAt: z.string().trim().max(40).optional().nullable(),
    // Accepts an ISO string or a datetime-local value from the admin form.
    endsAt: z.string().trim().max(40).optional().nullable(),
  })
  .refine(
    (v) => {
      if (!v.startsAt || !v.endsAt) return true
      const start = new Date(v.startsAt).getTime()
      const end = new Date(v.endsAt).getTime()
      return Number.isNaN(start) || Number.isNaN(end) || start <= end
    },
    { message: "Schedule end must be after the start", path: ["endsAt"] }
  )

export interface PromoSlide {
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
  startsAt: string | null
  endsAt: string | null
}

export function isSlideLive(
  slide: Pick<PromoSlide, "isActive" | "startsAt" | "endsAt">,
  now: number = Date.now()
): boolean {
  if (!slide.isActive) return false
  if (slide.startsAt) {
    const start = new Date(slide.startsAt).getTime()
    if (!Number.isNaN(start) && start > now) return false
  }
  if (slide.endsAt) {
    const end = new Date(slide.endsAt).getTime()
    if (!Number.isNaN(end) && end < now) return false
  }
  return true
}

/* -------------------------------------------------------------------------- */
/* Site content blocks (header / footer / collections page)                    */
/* -------------------------------------------------------------------------- */

export const SITE_BLOCK_KEYS = ["header", "footer", "collections_page"] as const
export type SiteBlockKey = (typeof SITE_BLOCK_KEYS)[number]

export interface SocialLink {
  label: string
  href: string
  icon: string
}

const socialSchema = z.object({
  label: text(40),
  href: linkSchema,
  icon: text(200),
})

export const DEFAULT_HEADER = {
  announcementText: "FREE SHIPPING ON COD",
  announcementHref: "/shop",
  socials: [
    {
      label: "Instagram",
      href: "https://www.instagram.com/safariperfumesofficial",
      icon: "/instagram.svg",
    },
    { label: "Facebook", href: "https://www.facebook.com/share/19G8xxiTP7/", icon: "/facebook.svg" },
    { label: "TikTok", href: "https://www.tiktok.com/@safari.perfumes", icon: "/tiktok.svg" },
  ],
}

export const headerBlockSchema = z.object({
  announcementText: text(160),
  announcementHref: optionalLinkSchema,
  socials: z.array(socialSchema).max(6),
})

export type HeaderContent = z.infer<typeof headerBlockSchema>

export const DEFAULT_FOOTER = {
  brandName: "SAFARI",
  about:
    "Crafting luxury fragrances that capture the essence of elegance and sophistication since 2015. Every scent tells a story of craftsmanship and passion.",
  contactEmail: "support@safari-perfumes.com",
  phones: [
    { display: "+92 3107435020", tel: "+923107435020" },
    { display: "+92 334 6322462", tel: "+923346322462" },
  ],
  addressLines: ["Online store — nationwide delivery across Pakistan", "No physical storefront"],
  socials: [
    {
      label: "Instagram",
      href: "https://www.instagram.com/safariperfumesofficial",
      icon: "/instagram.svg",
    },
    { label: "Facebook", href: "https://www.facebook.com/share/19G8xxiTP7/", icon: "/facebook.svg" },
    { label: "TikTok", href: "https://www.tiktok.com/@safari.perfumes", icon: "/tiktok.svg" },
  ],
  newsletterHeading: "Stay Connected & Save",
  newsletterText: "Sign up for exclusive updates & offers, and get 10% off your first order!",
  newsletterButton: "Subscribe",
  copyright: "SAFARI Perfumes. All rights reserved.",
}

export const footerBlockSchema = z.object({
  brandName: text(60),
  about: text(600),
  contactEmail: text(160),
  phones: z.array(z.object({ display: text(60), tel: text(60) })).max(4),
  addressLines: z.array(text(160)).max(4),
  socials: z.array(socialSchema).max(6),
  newsletterHeading: text(80),
  newsletterText: text(300),
  newsletterButton: text(40),
  copyright: text(160),
})

export type FooterContent = z.infer<typeof footerBlockSchema>

export const DEFAULT_COLLECTIONS_PAGE = {
  eyebrow: "Our Collection",
  title: "Our Collection",
  description:
    "Explore our complete range of luxury fragrances, crafted with rare ingredients for every occasion.",
}

export const collectionsPageSchema = z.object({
  eyebrow: text(80),
  title: text(140),
  description: text(400),
})

export type CollectionsPageContent = z.infer<typeof collectionsPageSchema>

const SITE_BLOCK_SCHEMAS = {
  header: headerBlockSchema,
  footer: footerBlockSchema,
  collections_page: collectionsPageSchema,
} as const

const SITE_BLOCK_DEFAULTS = {
  header: DEFAULT_HEADER,
  footer: DEFAULT_FOOTER,
  collections_page: DEFAULT_COLLECTIONS_PAGE,
} as const

/* -------------------------------------------------------------------------- */
/* Parsing helpers                                                             */
/* -------------------------------------------------------------------------- */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/**
 * Merge stored config with defaults so fields added in a later release keep
 * sensible values. Arrays and primitives from `stored` win.
 */
export function mergeWithDefaults<T>(defaults: T, stored: unknown): T {
  if (Array.isArray(defaults)) {
    return (Array.isArray(stored) ? stored : defaults) as T
  }
  if (isPlainObject(defaults)) {
    const base: Record<string, unknown> = { ...defaults }
    if (isPlainObject(stored)) {
      for (const key of Object.keys(base)) {
        base[key] = mergeWithDefaults(base[key], stored[key])
      }
      // Preserve extra keys (e.g. future fields) only when they are safe JSON.
      for (const key of Object.keys(stored)) {
        if (!(key in base)) base[key] = stored[key]
      }
    }
    return base as T
  }
  return (stored === undefined || stored === null ? defaults : stored) as T
}

/** True when the value is a safe JSON-serialisable object/primitive. */
function parseJson(raw: string | null | undefined): unknown {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Parse a stored section config. Invalid data falls back to the default config
 * (never crash the homepage because of one bad dashboard save).
 */
export function parseSectionConfig<K extends HomepageSectionKey>(
  key: K,
  raw: string | null | undefined
): HomepageSectionConfigMap[K] {
  const defaults = DEFAULT_SECTION_CONFIGS[key]
  const schema = SECTION_SCHEMAS[key]
  if (!schema) return defaults

  const stored = parseJson(raw)
  if (stored === null) return defaults

  const merged = mergeWithDefaults(defaults, stored)
  const parsed = schema.safeParse(merged)
  return (parsed.success ? parsed.data : defaults) as HomepageSectionConfigMap[K]
}

/** Validate an admin-submitted section config. */
export function validateSectionConfig(
  key: HomepageSectionKey,
  value: unknown
): { ok: true; data: HomepageSectionConfigMap[HomepageSectionKey] } | { ok: false; error: string } {
  const schema = SECTION_SCHEMAS[key]
  if (!schema) return { ok: true, data: null }
  const parsed = schema.safeParse(value)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return {
      ok: false,
      error: first ? `${first.path.join(".") || "Config"}: ${first.message}` : "Invalid content",
    }
  }
  return { ok: true, data: parsed.data }
}

export function parseSiteBlock<K extends SiteBlockKey>(key: K, raw: string | null | undefined): (typeof SITE_BLOCK_DEFAULTS)[K] {
  const defaults = SITE_BLOCK_DEFAULTS[key]
  const schema = SITE_BLOCK_SCHEMAS[key]
  const stored = parseJson(raw)
  if (stored === null) return defaults
  const merged = mergeWithDefaults(defaults, stored)
  const parsed = schema.safeParse(merged)
  return (parsed.success ? parsed.data : defaults) as (typeof SITE_BLOCK_DEFAULTS)[K]
}

export function validateSiteBlock<K extends SiteBlockKey>(
  key: K,
  value: unknown
): { ok: true; data: (typeof SITE_BLOCK_DEFAULTS)[K] } | { ok: false; error: string } {
  const parsed = SITE_BLOCK_SCHEMAS[key].safeParse(value)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return {
      ok: false,
      error: first ? `${first.path.join(".") || "Content"}: ${first.message}` : "Invalid content",
    }
  }
  return { ok: true, data: parsed.data as (typeof SITE_BLOCK_DEFAULTS)[K] }
}

export const SITE_BLOCK_META: { key: SiteBlockKey; label: string; description: string }[] = [
  {
    key: "header",
    label: "Header",
    description: "Announcement bar text and social links shown on every page.",
  },
  {
    key: "footer",
    label: "Footer",
    description: "Brand blurb, contact details, socials and newsletter copy.",
  },
  {
    key: "collections_page",
    label: "Collections page",
    description: "Hero heading on /collections.",
  },
]

const socialFields: SectionField[] = [
  { name: "label", label: "Label", type: "text" },
  { name: "href", label: "Link", type: "link" },
  { name: "icon", label: "Icon path (e.g. /instagram.svg)", type: "text" },
]

export const SITE_BLOCK_FIELDS: Record<SiteBlockKey, SectionField[]> = {
  header: [
    { name: "announcementText", label: "Announcement bar text", type: "text" },
    { name: "announcementHref", label: "Announcement link (optional)", type: "link" },
    {
      name: "socials",
      label: "Social links",
      type: "groupList",
      itemLabel: "Social link",
      maxItems: 6,
      fields: socialFields,
    },
  ],
  footer: [
    { name: "brandName", label: "Brand name", type: "text" },
    { name: "about", label: "About text", type: "textarea" },
    { name: "contactEmail", label: "Contact email", type: "text" },
    {
      name: "phones",
      label: "Phone numbers",
      type: "groupList",
      itemLabel: "Phone",
      maxItems: 4,
      fields: [
        { name: "display", label: "Display text (e.g. +92 3107435020)", type: "text" },
        { name: "tel", label: "Dial value (e.g. +923107435020)", type: "text" },
      ],
    },
    {
      name: "addressLines",
      label: "Address / delivery lines",
      type: "stringList",
      itemLabel: "Line",
      maxItems: 4,
    },
    {
      name: "socials",
      label: "Social links",
      type: "groupList",
      itemLabel: "Social link",
      maxItems: 6,
      fields: socialFields,
    },
    { name: "newsletterHeading", label: "Newsletter heading", type: "text" },
    { name: "newsletterText", label: "Newsletter text", type: "textarea" },
    { name: "newsletterButton", label: "Newsletter button label", type: "text" },
    { name: "copyright", label: "Copyright line (year is added automatically)", type: "text" },
  ],
  collections_page: [
    { name: "eyebrow", label: "Eyebrow text", type: "text" },
    { name: "title", label: "Heading", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
  ],
}
