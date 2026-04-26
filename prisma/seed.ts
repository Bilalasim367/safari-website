import { PrismaClient } from '@prisma/client'
import { products } from '../src/data/products'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create categories
  const categories = ['Men', 'Women', 'Unisex']
  for (const name of categories) {
    await prisma.category.upsert({
      where: { slug: name.toLowerCase() },
      update: {},
      create: {
        name,
        slug: name.toLowerCase(),
        description: `${name}'s fragrances`,
      },
    })
  }

  // Create products
  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice ?? null,
        image: p.image,
        images: p.images,
        categorySlug: p.category.toLowerCase(),
        size: p.size,
        fragranceFamily: p.fragranceFamily,
        rating: p.rating,
        reviewCount: p.reviews,
        notesTop: p.notes.top,
        notesHeart: p.notes.heart,
        notesBase: p.notes.base,
        inStock: p.inStock,
        isBestseller: p.isBestseller,
        isNew: p.isNew,
      },
    })
  }

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })