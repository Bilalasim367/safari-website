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
  console.log('=== PHASE 5: Update New Arrival Flags ===')

  // Get all active products
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, gender: true, isNew: true },
  })
  console.log(`Total active products: ${products.length}`)

  // New arrivals to KEEP (only the 4 Safari products)
  const keepNewArrivals = [
    'Safari Rose',
    'Safari Oud',
    'Safari Vanilla',
    'Safari Bloom'
  ]

  const keepNewSet = new Set(keepNewArrivals.map(n => n.toLowerCase().trim()))

  let updates = 0
  let alreadyNew = 0
  let removedFromNew = 0
  const updatesList: { id: string; name: string }[] = []
  const removalsList: { id: string; name: string }[] = []

  for (const product of products) {
    const name = product.name.toLowerCase().trim()
    const isNew = product.isNew
    const isKeepNew = keepNewSet.has(name)

    // Should only be new if it's in the keep list
    const shouldBeNew = isKeepNew

    if (shouldBeNew && !isNew) {
      updatesList.push({ id: product.id, name: product.name })
      updates++
    } else if (!shouldBeNew && isNew) {
      removalsList.push({ id: product.id, name: product.name })
      removedFromNew++
    } else if (isNew) {
      alreadyNew++
    }
  }

  console.log(`\nProducts to mark as new: ${updates}`)
  console.log(`Products to remove from new: ${removedFromNew}`)
  console.log(`Already correctly marked new: ${alreadyNew}`)

  // Show sample
  console.log('\nWill mark as new:')
  updatesList.forEach(u => console.log(`  ${u.name}`))

  console.log('\nWill remove from new:')
  removalsList.slice(0, 30).forEach(r => console.log(`  ${r.name}`))
  if (removalsList.length > 30) console.log(`  ... and ${removalsList.length - 30} more`)

  // Execute updates - mark new
  if (updates > 0) {
    console.log('\nMarking new arrivals...')
    for (const update of updatesList) {
      await prisma.product.update({
        where: { id: update.id },
        data: { isNew: true }
      })
    }
  }

  // Execute updates - remove from new
  if (removedFromNew > 0) {
    console.log('\nRemoving old products from new arrivals...')
    for (const removal of removalsList) {
      await prisma.product.update({
        where: { id: removal.id },
        data: { isNew: false }
      })
    }
  }

  console.log('\nNew arrival updates complete!')

  // Verify
  const verify = await prisma.product.count({
    where: { isNew: true, isActive: true }
  })
  console.log(`\nTotal new arrival products: ${verify}`)

  // Show new arrival products
  const newProducts = await prisma.product.findMany({
    where: { isNew: true, isActive: true },
    select: { name: true, gender: true }
  })
  console.log('\nNew arrival products:')
  newProducts.forEach(r => console.log(`  ${r.name} (${r.gender})`))
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect()
  await pool.end()
})