import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const r1 = await prisma.product.groupBy({
    by: ['isBestseller'],
    where: { isActive: true },
    _count: true,
  })
  console.log('Bestseller:', r1)

  const r2 = await prisma.product.groupBy({
    by: ['isNew'],
    where: { isActive: true },
    _count: true,
  })
  console.log('New:', r2)

  const r3 = await prisma.product.groupBy({
    by: ['isHotSelling'],
    where: { isActive: true },
    _count: true,
  })
  console.log('Hot Selling:', r3)

  const r4 = await prisma.product.groupBy({
    by: ['isTrending'],
    where: { isActive: true },
    _count: true,
  })
  console.log('Trending:', r4)
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect()
  await pool.end()
})