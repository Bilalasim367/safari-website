import prisma from '@/lib/turso'
import HomePage from '@/components/HomePage'
import { classifyProductType } from '@/lib/product-types'

export const revalidate = 300
export const dynamic = 'force-dynamic'

function mapProduct(p: {
  id: string; name: string; slug: string; price: number; originalPrice: number | null;
  image: string; images: string; categorySlug: string | null; description: string | null;
  isBestseller: boolean; isNew: boolean; size: string; inStock: boolean;
  rating: number; reviewCount: number; gender: string | null; fragranceFamily: string | null;
  sizesAvailable: string | null; sizePrices: string | null;
  category: { name: string } | null;
}) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    originalPrice: p.originalPrice,
    image: p.image || '',
    images: JSON.parse(p.images || '[]') as string[],
    categorySlug: p.categorySlug,
    category: p.category ? { name: p.category.name } : null,
    description: p.description,
    isBestseller: p.isBestseller,
    isNew: p.isNew,
    size: p.size || '50ml',
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
    const [bestsellers, newArrivals, bundles, allProducts] = await Promise.all([
      prisma.product.findMany({
        where: { isBestseller: true, isActive: true },
        include: { category: true },
        take: 4,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.findMany({
        where: { isNew: true, isActive: true },
        include: { category: true },
        take: 4,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.bundle.findMany({
        where: { isActive: true, inStock: true },
        take: 4,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.findMany({
        where: { inStock: true, isActive: true },
        include: { category: true },
        take: 20,
        orderBy: { createdAt: 'desc' },
      }),
    ])
    
    return {
      bestsellers: bestsellers.map(mapProduct),
      newArrivals: newArrivals.map(mapProduct),
      bundles: bundles.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        description: b.description || '',
        price: b.price,
        originalPrice: b.originalPrice,
        image: b.image || '',
        save: b.save || '',
        size: b.size || '',
        inStock: b.inStock,
      })),
      allProducts: allProducts.map(mapProduct),
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { bestsellers: [], newArrivals: [], bundles: [], allProducts: [] }
  }
}

export default async function Home() {
  const { bestsellers, newArrivals, bundles, allProducts } = await getProducts()

  return <HomePage bestsellers={bestsellers} newArrivals={newArrivals} bundles={bundles} allProducts={allProducts} />
}
