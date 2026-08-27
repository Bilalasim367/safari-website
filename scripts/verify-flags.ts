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