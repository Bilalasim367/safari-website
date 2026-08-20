import prisma from "@/lib/turso"
import HomePage from "@/components/HomePage"
import { classifyProductType } from "@/lib/product-types"
import { SITE_URL } from "@/lib/site"
import type { Metadata } from "next"

export const revalidate = 300

export const metadata: Metadata = {
  title: "Safari Perfumes | Affordable Designer-Inspired Attars & Perfumes in Pakistan",
  description:
    "Shop 330+ designer-inspired attars and perfumes in Pakistan at affordable PKR prices. Long-lasting fragrances for men, women, and unisex with fast delivery across Pakistan.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Safari Perfumes | Affordable Designer-Inspired Attars & Perfumes in Pakistan",
    description:
      "Shop 330+ designer-inspired attars and perfumes in Pakistan at affordable PKR prices. Fast delivery across Pakistan.",
    url: SITE_URL,
    siteName: "Safari Perfumes",
    type: "website",
  },
}

function mapProduct(p: {
  id: string
  name: string
  slug: string
  price: number
  originalPrice: number | null
  image: string
  images: string
  categorySlug: string | null
  description: string | null
  isBestseller: boolean
  isNew: boolean
  isHotSelling: boolean
  isTrending: boolean
  size: string
  inStock: boolean
  rating: number
  reviewCount: number
  gender: string | null
  fragranceFamily: string | null
  sizesAvailable: string | null
  sizePrices: string | null
  category: { name: string } | null
}) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    originalPrice: p.originalPrice,
    image: p.image || "",
    images: JSON.parse(p.images || "[]") as string[],
    categorySlug: p.categorySlug,
    category: p.category ? { name: p.category.name } : null,
    description: p.description,
    isBestseller: p.isBestseller,
    isNew: p.isNew,
    isHotSelling: p.isHotSelling,
    isTrending: p.isTrending,
    size: p.size || "50ml",
    inStock: p.inStock,
    rating: p.rating,
    reviewCount: p.reviewCount,
    gender: p.gender,
    fragranceFamily: p.fragranceFamily,
    type: classifyProductType(p),
  }
}

async function getProducts() {
  try {
    const select = {
      id: true,
      name: true,
      slug: true,
      price: true,
      originalPrice: true,
      image: true,
      images: true,
      categorySlug: true,
      description: true,
      isBestseller: true,
      isNew: true,
      isHotSelling: true,
      isTrending: true,
      size: true,
      inStock: true,
      rating: true,
      reviewCount: true,
      gender: true,
      fragranceFamily: true,
      sizesAvailable: true,
      sizePrices: true,
      type: true,
      applicatorType: true,
      origin: true,
      price3mlPhysical: true,
      price6mlPhysical: true,
    } as const

    const [hotSelling, menProducts, womenProducts, unisexProducts] = await Promise.all([
      prisma.product.findMany({
        where: { isHotSelling: true, isActive: true },
        select: { ...select, category: { select: { name: true } } },
        take: 8,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        where: { gender: 'Men', isActive: true },
        select: { ...select, category: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        where: { gender: 'Women', isActive: true },
        select: { ...select, category: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        where: { gender: 'Unisex', isActive: true },
        select: { ...select, category: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ])

    return {
      hotSelling: hotSelling.map(mapProduct),
      menProducts: menProducts.map(mapProduct),
      womenProducts: womenProducts.map(mapProduct),
      unisexProducts: unisexProducts.map(mapProduct),
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    return { hotSelling: [], menProducts: [], womenProducts: [], unisexProducts: [] }
  }
}

export default async function Home() {
  const { hotSelling, menProducts, womenProducts, unisexProducts } = await getProducts()

  return <HomePage hotSelling={hotSelling} menProducts={menProducts} womenProducts={womenProducts} unisexProducts={unisexProducts} />
}
