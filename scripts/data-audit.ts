import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

const prisma = new PrismaClient({
  adapter: new PrismaLibSQL(libsql),
})

async function main() {
  console.log('=== PRODUCT DATA AUDIT ===')

  const total = await prisma.product.count()
  console.log(`Total products: ${total}`)

  const byGender = await prisma.product.groupBy({ by: ['gender'], _count: true })
  console.log('\n--- gender values ---')
  for (const g of byGender) console.log(`  "${g.gender}": ${g._count}`)

  const byType = await prisma.product.groupBy({ by: ['type'], _count: true })
  console.log('\n--- type values ---')
  for (const t of byType) console.log(`  "${t.type}": ${t._count}`)

  const byCatSlug = await prisma.product.groupBy({ by: ['categorySlug'], _count: true })
  console.log('\n--- categorySlug values ---')
  for (const c of byCatSlug) console.log(`  "${c.categorySlug}": ${c._count}`)

  const genderCatMismatch = await prisma.product.findMany({
    select: { gender: true, categorySlug: true },
  })
  const mismatches = genderCatMismatch.filter(
    (p) => p.gender && p.categorySlug && p.gender.toLowerCase() !== p.categorySlug.toLowerCase()
  )
  console.log(`gender vs categorySlug mismatches: ${mismatches.length}`)
  for (const m of mismatches.slice(0, 10)) console.log(`  gender="${m.gender}" categorySlug="${m.categorySlug}"`)

  const isNewCount = await prisma.product.count({ where: { isNew: true } })
  const bestsellerCount = await prisma.product.count({ where: { isBestseller: true } })
  const hotSellingCount = await prisma.product.count({ where: { isHotSelling: true } })
  console.log(`\nFlags — isNew: ${isNewCount}, isBestseller: ${bestsellerCount}, isHotSelling: ${hotSellingCount}`)

  const users = await prisma.user.findMany({ select: { email: true, role: true, status: true } })
  console.log(`\n=== USERS (${users.length}) ===`)
  for (const u of users) console.log(`  ${u.email} — role=${u.role}, status=${u.status}`)

  const admins = users.filter((u) => u.role === 'admin')
  console.log(`\nAdmin accounts: ${admins.length}`)

  const orders = await prisma.order.findMany({
    select: { status: true, paymentStatus: true },
  })
  const byStatus = new Map<string, number>()
  const byPay = new Map<string, number>()
  for (const o of orders) {
    byStatus.set(o.status, (byStatus.get(o.status) || 0) + 1)
    byPay.set(o.paymentStatus || 'null', (byPay.get(o.paymentStatus || 'null') || 0) + 1)
  }
  console.log(`\n=== ORDERS (${orders.length}) ===`)
  console.log('status:', JSON.stringify([...byStatus.entries()]))
  console.log('paymentStatus:', JSON.stringify([...byPay.entries()]))

  const bundles = await prisma.bundle.count()
  const categories = await prisma.category.findMany({ select: { slug: true } })
  console.log(`\n=== MISC ===`)
  console.log(`Bundles: ${bundles}`)
  console.log(`Categories: ${categories.map((c) => c.slug).join(', ')}`)
  const settings = await prisma.settings.findFirst()
  console.log(`Settings row: ${settings ? `currency=${settings.currency}, taxRate=${settings.taxRate}, shippingFee=${settings.shippingFee}, freeShippingThreshold=${settings.freeShippingThreshold}` : 'NONE'}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())