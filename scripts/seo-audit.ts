import prisma from '../src/lib/turso'

async function main() {
  const [dupSlugs, noImpression, sampleNames, total] = await Promise.all([
    prisma.product.findMany({
      where: { slug: { contains: '-2' } },
      select: { id: true, name: true, slug: true, isActive: true, impressionOf: true, price: true },
    }),
    prisma.product.count({ where: { isActive: true, OR: [{ impressionOf: null }, { impressionOf: '' }] } }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { name: true, impressionOf: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where: { isActive: true } }),
  ])

  console.log('=== ACTIVE TOTAL ===', total)
  console.log('=== SLUGS CONTAINING -2 ===')
  dupSlugs.forEach((p) => console.log(JSON.stringify(p)))
  console.log('=== MISSING impressionOf COUNT ===', noImpression)
  console.log('=== SAMPLE PRODUCTS ===')
  sampleNames.forEach((p) => console.log(JSON.stringify(p)))

  const baseSlugs = dupSlugs.map((d) => d.slug.replace(/-2$/, ''))
  if (baseSlugs.length) {
    const originals = await prisma.product.findMany({
      where: { slug: { in: baseSlugs } },
      select: { id: true, name: true, slug: true, isActive: true, price: true },
    })
    console.log('=== MATCHING ORIGINALS ===')
    originals.forEach((p) => console.log(JSON.stringify(p)))
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => process.exit(0))
