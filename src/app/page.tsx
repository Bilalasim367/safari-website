import prisma from "@/lib/turso"
import HomePage from "@/components/HomePage"
import { classifyProductType } from "@/lib/product-types"

export const revalidate = 300
export const dynamic = "force-dynamic"

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
    const [hotSelling, menProducts, womenProducts, unisexProducts] = await Promise.all([
      prisma.product.findMany({
        where: { isHotSelling: true, isActive: true },
        include: { category: true },
        take: 8,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        where: { gender: 'Men', isActive: true },
        include: { category: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        where: { gender: 'Women', isActive: true },
        include: { category: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        where: { gender: 'Unisex', isActive: true },
        include: { category: true },
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
