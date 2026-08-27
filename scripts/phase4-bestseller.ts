import { PrismaClient } from '@prisma/client'
import { PrismaMySQL } from '@prisma/adapter-mysql'
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL!,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

const prisma = new PrismaClient({
  adapter: new PrismaMySQL(pool),
})

async function main() {
  console.log('=== PHASE 4: Set Bestseller Flags ===')

  // Get all active products
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, gender: true, isBestseller: true },
  })
  console.log(`Total active products: ${products.length}`)

  // Define bestseller products (keep existing 5 + add ~5 popular classics)
  const bestsellerNames = [
    // Existing bestsellers
    'Safari Midnight', 'Safari Rose', 'Safari Citrus', 'Safari Noir', 'Safari Sand',
    // Popular classics
    'Acqua Di Gio', 'Acqua Di Gio Profumo', 'Acqua Di Gio Profondo', 'Acqua Di Gio Absolu',
    'Cool Water', 'Davidoff Cool Water',
    'Bleu De Chanel', 'Bleu De Chanel Parfum', 'Bleu De Chanel Eau De Parfum', 'Bleu De Chanel Eau De Toilette',
    'Sauvage By Dior', 'Dior Sauvage', 'Dior Sauvage Elixir', 'Dior Sauvage Parfum',
    'Aventus', 'Creed Aventus', 'Creed Aventus Cologne', 'Creed Aventus For Her',
  ]

  // Normalize names for matching
  const normalizeName = (name: string) => name.toLowerCase().replace(/\s+/g, ' ').trim()
  const bestsellerSet = new Set(bestsellerNames.map(normalizeName))

  // Also include keyword-based matching for popular classics
  const bestsellerKeywords = [
    'acqua di gio', 'cool water', 'davidoff cool water',
    'bleu de chanel',
    'sauvage', 'dior sauvage',
    'creed aventus', 'aventus',
  ]

  const bestsellerKeywordSet = new Set(bestsellerKeywords.map(k => k.toLowerCase().trim()))

  let updates = 0
  let alreadyBestseller = 0
  const updatesList: { id: string; name: string }[] = []

  for (const product of products) {
    const name = product.name.toLowerCase().trim()
    const isBestseller = product.isBestseller

    // Check if it matches bestseller criteria
    let shouldBeBestseller = false

    // Check exact name match
    if (bestsellerSet.has(normalizeName(product.name))) {
      shouldBeBestseller = true
    }
    // Check keyword match
    else {
      for (const keyword of bestsellerKeywordSet) {
        if (name.includes(keyword)) {
          shouldBeBestseller = true
          break
        }
      }
    }

    if (shouldBeBestseller && !isBestseller) {
      updatesList.push({ id: product.id, name: product.name })
      updates++
    } else if (isBestseller) {
      alreadyBestseller++
    }
  }

  console.log(`\nProducts to update: ${updates}`)
  console.log(`Already bestseller: ${alreadyBestseller}`)

  // Show sample
  console.log('\nSample updates:')
  updatesList.slice(0, 30).forEach(u => console.log(`  ${u.name}`))

  // Execute updates
  if (updates > 0) {
    console.log('\nExecuting updates...')
    for (const update of updatesList) {
      await prisma.product.update({
        where: { id: update.id },
        data: { isBestseller: true }
      })
    }
    console.log('Bestseller updates complete!')
  }

  // Verify
  const verify = await prisma.product.count({
    where: { isBestseller: true, isActive: true }
  })
  console.log(`\nTotal bestseller products: ${verify}`)

  // Show bestseller products
  const bestsellerProducts = await prisma.product.findMany({
    where: { isBestseller: true, isActive: true },
    select: { name: true, gender: true }
  })
  console.log('\nBestseller products:')
  bestsellerProducts.forEach(r => console.log(`  ${r.name} (${r.gender})`))
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect()
  await pool.end()
})