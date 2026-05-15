import prisma from '@/lib/turso'
import HomePage from '@/components/HomePage'

export const revalidate = 300
export const dynamic = 'force-dynamic'

async function getProducts() {
  try {
    const [bestsellers, newArrivals, bundles] = await Promise.all([
      prisma.product.findMany({
        where: { isBestseller: true },
        take: 4,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.findMany({
        where: { isNew: true },
        take: 4,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.bundle.findMany({
        where: { isActive: true, inStock: true },
        take: 4,
        orderBy: { createdAt: 'desc' },
      }),
    ])
    
    return {
      bestsellers: bestsellers.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        originalPrice: p.originalPrice,
        image: p.image || '',
        category: { name: p.categorySlug || 'Signature' },
        description: p.description,
        isBestseller: p.isBestseller,
        isNew: p.isNew,
        size: p.size || '50ml',
        rating: p.rating,
        reviewCount: p.reviewCount,
      })),
      newArrivals: newArrivals.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        originalPrice: p.originalPrice,
        image: p.image || '',
        category: { name: p.categorySlug || 'Signature' },
        description: p.description,
        isBestseller: p.isBestseller,
        isNew: p.isNew,
        size: p.size || '50ml',
        rating: p.rating,
        reviewCount: p.reviewCount,
      })),
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
      })),
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { bestsellers: [], newArrivals: [], bundles: [] }
  }
}

export default async function Home() {
  const { bestsellers, newArrivals, bundles } = await getProducts()

  return <HomePage bestsellers={bestsellers} newArrivals={newArrivals} bundles={bundles} />
}
