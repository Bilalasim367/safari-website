/**
 * seed-reviews.ts
 * Generates realistic (simulated) customer reviews for ALL products that don't
 * already have 3+ reviews. Also updates product.rating (average) and reviewCount.
 *
 * Safe to run repeatedly — idempotent (skips products that already have >=3 reviews).
 *
 * Run:
 *   npx tsx --env-file=.env.local scripts/seed-reviews.ts
 *   (or set DATABASE_URL in the environment; use .env on the server / cPanel)
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TEMPLATES = [
  'Amazing long-lasting fragrance! I get compliments all day.',
  'Perfect for office wear, subtle and elegant.',
  'Smells exactly like the original. Worth every rupee.',
  'Bought it for my wife, she absolutely loves it.',
  'Great projection in the first few hours, good for evenings.',
  'The packaging was beautiful and the scent is even better.',
  'Delivered on time and smells fantastic. Highly recommended.',
  'Loved it so much I ordered a second bottle immediately.',
  'Very close to the original with much better value for money.',
  'Lasts over 8 hours on my skin. Impressive for this price.',
  'Soft, clean and fresh — my new everyday fragrance.',
  'The compliments at work never stop. Great buy!',
  'Strong sillage without being overpowering. Perfect balance.',
  'My whole family noticed the scent. Everyone asked what it was.',
  'Reminds me of a designer fragrance at a fraction of the cost.',
  'Beautiful, rich and masculine scent. My go-to for parties.',
  'Elegant and refined. Not too sweet, not too sharp.',
  'Used it on my wedding day and got endless compliments.',
  'Great daily wear — long lasting even in hot weather.',
  'Ordered as a gift and the recipient loved it.',
  'Excellent quality attar with a deep, warm finish.',
  'Fast delivery and the scent matches the description perfectly.',
  'Subtle projection that projects well for hours.',
  'The best budget-friendly fragrance I have tried so far.',
  'Rich, luxurious scent profile. Feels way more expensive than it is.',
  'Perfect for winters — warm, cozy and inviting.',
  'Very glad I trusted the reviews. Smells premium.',
  'A beautiful unisex scent, soft yet noticeable.',
  'Would definitely repurchase. Value for money at its best.',
  'Fresh opening that dries down to a gorgeous musky base.',
]

const FIRST_NAMES = [
  'Ahmed', 'Fatima', 'Bilal', 'Ayesha', 'Usman', 'Zainab', 'Hamza', 'Sana',
  'Ali', 'Mahnoor', 'Omar', 'Hira', 'Danish', 'Iqra', 'Fahad', 'Khadija',
  'Raza', 'Sara', 'Hassan', 'Noor',
]

const LAST_INITIALS = ['R', 'K', 'S', 'T', 'H', 'M', 'B', 'A', 'Z', 'Q']

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomRating(): number {
  // 80% 5-star, 15% 4-star, 5% 3-star
  const roll = Math.random()
  if (roll < 0.8) return 5
  if (roll < 0.95) return 4
  return 3
}

function buildText(): string {
  const pool = [...TEMPLATES]
  const first = pool.splice(Math.floor(Math.random() * pool.length), 1)[0]
  const useSecond = Math.random() < 0.7
  const second = useSecond ? pick(pool) : null
  return second ? `${first} ${second}` : first
}

function randomName(): string {
  return `${pick(FIRST_NAMES)} ${pick(LAST_INITIALS)}.`
}

function randomEmail(name: string): string {
  const base = name.split(' ')[0].toLowerCase()
  return `${base}${randInt(10, 999)}@gmail.com`
}

function randomDate(): Date {
  const now = Date.now()
  const daysAgo = randInt(7, 120)
  const hoursAgo = randInt(0, 24)
  const offset = (daysAgo * 24 + hoursAgo) * 60 * 60 * 1000
  return new Date(now - offset)
}

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true },
    orderBy: { id: 'asc' },
  })

  console.log(`Found ${products.length} products.`)

  let seededProducts = 0
  let skippedProducts = 0
  let totalReviews = 0
  const ratingBuckets = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }

  for (const product of products) {
    const existingCount = await prisma.review.count({
      where: { productId: product.id },
    })

    if (existingCount >= 3) {
      skippedProducts++
      continue
    }

    const count = randInt(3, 6)
    const generated = Array.from({ length: count }, () => {
      const rating = randomRating()
      ratingBuckets[String(rating) as keyof typeof ratingBuckets]++
      const name = randomName()
      return {
        productId: product.id,
        customerName: name,
        customerEmail: randomEmail(name),
        rating,
        text: buildText(),
        date: randomDate(),
        isApproved: true,
      }
    })

    await prisma.review.createMany({ data: generated })

    const all = await prisma.review.findMany({
      where: { productId: product.id, isApproved: true },
      select: { rating: true },
    })
    const avg = all.length
      ? Math.round((all.reduce((s, r) => s + r.rating, 0) / all.length) * 10) / 10
      : 0

    await prisma.product.update({
      where: { id: product.id },
      data: { rating: avg, reviewCount: all.length },
    })

    seededProducts++
    totalReviews += count
  }

  console.log('Done.')
  console.log(`  Products seeded: ${seededProducts}`)
  console.log(`  Products skipped (already had 3+ reviews): ${skippedProducts}`)
  console.log(`  Reviews created: ${totalReviews}`)
  console.log('  Rating distribution:', JSON.stringify(ratingBuckets))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })