import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ATTAR_SIZE = '12ml'
const PERFUME_SIZES = ['30ml', '50ml', '100ml', '60ml']

async function main() {
  const mode = process.argv[2] || 'preview'
  const apply = mode === 'apply'
  console.log(`=== ATAR SIZE FIX (${mode} mode) ===`)

  const products = await prisma.product.findMany({
    orderBy: { name: 'asc' },
  })
  console.log(`Total products: ${products.length}`)

  const attars = products.filter((p) => (p.type || '').toLowerCase() === 'attar')
  const perfumes = products.filter((p) => (p.type || '').toLowerCase() === 'perfume')
  const others = products.filter(
    (p) =>
      (p.type || '').toLowerCase() !== 'attar' && (p.type || '').toLowerCase() !== 'perfume'
  )
  console.log(`Attars: ${attars.length}, Perfumes: ${perfumes.length}, Other/undefined type: ${others.length}`)

  console.log('\n--- Per-type size distribution ---')
  const attarSizes = new Map<string, number>()
  for (const a of attars) {
    const s = (a.size || '').toLowerCase() || '<empty>'
    attarSizes.set(s, (attarSizes.get(s) || 0) + 1)
  }
  console.log('Attar sizes:', [...attarSizes.entries()].map(([k, v]) => `${k}=${v}`).join(', '))

  const perfumeSizes = new Map<string, number>()
  for (const p of perfumes) {
    const s = (p.size || '').toLowerCase() || '<empty>'
    perfumeSizes.set(s, (perfumeSizes.get(s) || 0) + 1)
  }
  console.log('Perfume sizes:', [...perfumeSizes.entries()].map(([k, v]) => `${k}=${v}`).join(', '))

  console.log('\n--- FLAGGED: Attars whose size is NOT 12ml ---')
  const flaggedAttars = attars.filter((a) => (a.size || '').toLowerCase() !== '12ml')
  for (const a of flaggedAttars) {
    console.log(`  [${a.type}] "${a.name}" size="${a.size}" slug=${a.slug} id=${a.id} price=${a.price}`)
  }
  console.log(`\nFlagged attar count: ${flaggedAttars.length} / ${attars.length}`)

  console.log('\n--- Perfumes with unusual size (not 30/50/100/60ml) ---')
  const weirdPerfumes = perfumes.filter((p) => !PERFUME_SIZES.includes((p.size || '').toLowerCase()))
  for (const p of weirdPerfumes.slice(0, 20)) {
    console.log(`  [${p.type}] "${p.name}" size="${p.size}" slug=${p.slug}`)
  }
  console.log(`Weird perfume count: ${weirdPerfumes.length} / ${perfumes.length}`)

  console.log('\n--- All 12ml products (to confirm they are all attars) ---')
  const twelveMl = products.filter((p) => (p.size || '').toLowerCase() === '12ml')
  for (const p of twelveMl) {
    console.log(`  [${p.type}] "${p.name}" slug=${p.slug}`)
  }
  console.log(`Total 12ml products: ${twelveMl.length}`)

  console.log('\n--- Recent orders order items with size ---')
  const orderItems = await prisma.orderItem.findMany({
    orderBy: { id: 'desc' },
    take: 30,
    select: { name: true, size: true, quantity: true, orderId: true },
  })
  const sizeCount = new Map<string, number>()
  for (const oi of orderItems) sizeCount.set(oi.size || '<empty>', (sizeCount.get(oi.size || '<empty>') || 0) + 1)
  console.log('Recent 30 order items by size:', [...sizeCount.entries()].map(([k, v]) => `${k}=${v}`).join(', '))

  if (apply) {
    console.log('\n=== APPLYING FIX ===')
    let updated = 0
    for (const a of flaggedAttars) {
      await prisma.product.update({
        where: { id: a.id },
        data: { size: ATTAR_SIZE },
      })
      updated++
      console.log(`  updated "${a.name}" size "${a.size}" -> "${ATTAR_SIZE}"`)
    }
    console.log(`Updated ${updated} products.`)
  } else {
    console.log('\n[preview mode] Run with "apply" argument to write changes:')
    console.log('  npx tsx --env-file=.env scripts/fix-attar-sizes.ts apply')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())