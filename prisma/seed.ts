import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'
import { products } from '../src/data/products'
import { classifyProductType } from '../src/lib/product-types'
import { normalizeType } from '../src/lib/normalize'

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

const prisma = new PrismaClient({
  adapter: new PrismaLibSQL(libsql),
})

const BUNDLES = [
  { name: 'Signature Trio', slug: 'signature-trio', description: 'Three distinct fragrances', price: 199, originalPrice: 279, save: '28%', size: '3 x 30ml', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&h=600&fit=crop' },
  { name: 'Couple Set', slug: 'couple-set', description: 'For him & her', price: 249, originalPrice: 349, save: '29%', size: '2 x 50ml', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=600&fit=crop' },
  { name: 'Luxury Collection', slug: 'luxury-collection', description: 'Premium selection', price: 399, originalPrice: 599, save: '33%', size: '5 x 50ml', image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600&h=600&fit=crop' },
  { name: 'Travel Essentials', slug: 'travel-essentials', description: 'On-the-go luxury', price: 129, originalPrice: 179, save: '28%', size: '4 x 10ml', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&h=600&fit=crop' },
]

const BUNDLE_ITEMS: { bundleSlug: string; productSlugs: string[] }[] = [
  { bundleSlug: 'travel-essentials', productSlugs: ['safari-noir', 'safari-rose', 'safari-citrus', 'safari-vanilla'] },
  { bundleSlug: 'signature-trio', productSlugs: ['safari-midnight', 'safari-oud', 'safari-sand'] },
  { bundleSlug: 'couple-set', productSlugs: ['safari-noir', 'safari-bloom'] },
  { bundleSlug: 'luxury-collection', productSlugs: ['safari-midnight', 'safari-oud', 'safari-noir', 'safari-rose', 'safari-vanilla'] },
]

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
    const sizeList = (p.sizePrices || []).map((sp) => sp.size).join(',')
    const type = sizeList ? normalizeType(classifyProductType({ sizesAvailable: sizeList })) : 'Perfume'

    // Set flags based on product data
    const isHotSelling = p.isBestseller || p.name === 'Safari Midnight' || p.name === 'Safari Noir' || p.name === 'Safari Citrus'
    const isTrending = p.isNew || p.name === 'Safari Rose' || p.name === 'Safari Oud' || p.name === 'Safari Vanilla' || p.name === 'Safari Bloom' || p.name === 'Safari Sand'
    const gender = p.category || 'Unisex'

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { type, gender, categorySlug: p.category.toLowerCase(), isHotSelling, isTrending },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice ?? null,
        image: p.image,
        images: JSON.stringify(p.images),
        categorySlug: p.category.toLowerCase(),
        size: p.size,
        sizePrices: JSON.stringify(p.sizePrices || []),
        sizesAvailable: sizeList,
        fragranceFamily: p.fragranceFamily,
        rating: p.rating,
        reviewCount: p.reviews,
        inStock: p.inStock,
        isBestseller: p.isBestseller,
        isNew: p.isNew,
        isHotSelling: isHotSelling,
        isTrending: isTrending,
        gender,
        type,
        notesTop: JSON.stringify(p.notes.top),
        notesHeart: JSON.stringify(p.notes.heart),
        notesBase: JSON.stringify(p.notes.base),
      },
    })
  }

  // Create bundles
  for (const b of BUNDLES) {
    await prisma.bundle.upsert({
      where: { slug: b.slug },
      update: {},
      create: {
        name: b.name,
        slug: b.slug,
        description: b.description,
        price: b.price,
        originalPrice: b.originalPrice,
        save: b.save,
        size: b.size,
        image: b.image,
        inStock: true,
        isActive: true,
      },
    })
  }

  // Create bundle items
  for (const bi of BUNDLE_ITEMS) {
    const bundle = await prisma.bundle.findUnique({ where: { slug: bi.bundleSlug } })
    if (!bundle) continue

    for (const productSlug of bi.productSlugs) {
      const product = await prisma.product.findUnique({ where: { slug: productSlug } })
      if (!product) continue

      await prisma.bundleItem.upsert({
        where: { bundleId_productId: { bundleId: bundle.id, productId: product.id } },
      update: {},
        create: {
          bundleId: bundle.id,
          productId: product.id,
          quantity: 1,
        },
      })
    }
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