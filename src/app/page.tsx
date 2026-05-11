import prisma from '@/lib/postgres'
import HomePage from '@/components/HomePage'

export const revalidate = 300
export const dynamic = 'force-dynamic'

async function getProducts() {
  try {
    const [bestsellers, newArrivals] = await Promise.all([
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
      })),
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { bestsellers: [], newArrivals: [] }
  }
}

export default async function Home() {
  const { bestsellers, newArrivals } = await getProducts()

  return <HomePage bestsellers={bestsellers} newArrivals={newArrivals} />
}
