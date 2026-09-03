/**
 * Safari Perfumes — Attar Price Update Script
 *
 * Sets each active product's Base Price (price) to a discounted attar price
 * (~25-30% of the current base price, rounded to the nearest 50 PKR)
 * and sets Original Price (originalPrice) to the previous base price so it
 * renders as a strike-through (the "was" price).
 *
 * Mapping examples:
 *   PKR 1299 -> 350
 *   PKR 700  -> 200
 *   PKR 900  -> 250
 *
 * Run on the server where DATABASE_URL is available:
 *   node scripts/update-prices.js
 *   (or: npx tsx scripts/update-prices.js)
 */

require('dotenv').config()

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// ~28% factor (middle of the 25-30% range), rounded to nearest 50 PKR
const PRICE_FACTOR = 0.28
const ROUND_TO = 50

function roundToNearest50(value) {
  return Math.round(value / ROUND_TO) * ROUND_TO
}

function computeAttarPrice(currentBase) {
  const raw = currentBase * PRICE_FACTOR
  return roundToNearest50(raw)
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('[update-prices] ERROR: DATABASE_URL is not set.')
    process.exit(1)
  }

  console.log('[update-prices] Starting attar price update...')
  console.log(`[update-prices] Using factor ${PRICE_FACTOR * 100}%, rounding to nearest ${ROUND_TO} PKR.`)

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, name: true, price: true, originalPrice: true },
    orderBy: { createdAt: 'asc' },
  })

  console.log(`[update-prices] Found ${products.length} active products.`)
  console.log('[update-prices] ----------------------------------------')

  let updatedCount = 0
  let skippedCount = 0

  for (const product of products) {
    const currentBase = product.price
    const newAttarPrice = computeAttarPrice(currentBase)
    const newOriginalPrice = currentBase // strike-through = previous base price

    try {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          price: newAttarPrice,
          originalPrice: newOriginalPrice,
        },
      })

      updatedCount++
      console.log(
        `[update-prices] ✓ ${product.name} (${product.slug}) — ` +
        `base PKR ${currentBase} → PKR ${newAttarPrice} | ` +
        `original (was) PKR ${newOriginalPrice}`
      )
    } catch (err) {
      skippedCount++
      console.error(`[update-prices] ✗ Failed ${product.name} (${product.slug}): ${err.message}`)
    }
  }

  console.log('[update-prices] ----------------------------------------')
  console.log(`[update-prices] Done. Updated ${updatedCount}, failed ${skippedCount}.`)

  await prisma.$disconnect()
  process.exit(updatedCount >= 0 ? 0 : 1)
}

main().catch((err) => {
  console.error('[update-prices] Fatal error:', err)
  process.exit(1)
})
