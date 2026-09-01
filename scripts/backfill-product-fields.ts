import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function parseTags(tags: string | null): Record<string, string> {
  const result: Record<string, string> = {}
  if (!tags) return result

  for (const entry of tags.split(';')) {
    const idx = entry.indexOf(':')
    if (idx === -1) continue
    const key = entry.slice(0, idx).trim()
    const value = entry.slice(idx + 1).trim()
    if (key && value) {
      result[key] = value
    }
  }
  return result
}

async function main() {
  console.log('Backfilling product attributes from tags...')

  const products = await prisma.product.findMany({
    where: { tags: { not: null, not: '' } },
    select: { id: true, tags: true, type: true },
  })

  let updatedCount = 0

  for (const row of products) {
    const parsed = parseTags(row.tags)

    if (Object.keys(parsed).length === 0) continue

    const updateData: Record<string, string | null> = {}

    if (parsed.concentration) updateData.concentration = parsed.concentration
    if (parsed.bottle) updateData.bottleStyle = parsed.bottle
    if (parsed.applicator) updateData.applicatorType = parsed.applicator
    if (parsed.origin) updateData.origin = parsed.origin
    if (parsed.ingredients) updateData.ingredients = parsed.ingredients

    if (Object.keys(updateData).length === 0) continue

    await prisma.product.update({
      where: { id: row.id },
      data: updateData,
    })

    updatedCount++
    console.log(`  Updated product ${row.id} (type: ${row.type || 'unknown'}): ${Object.keys(updateData).join(', ')}`)
  }

  console.log(`\nDone! Updated ${updatedCount} products.`)
}

main().catch((e) => {
  console.error('Backfill failed:', e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
  await pool.end()
})