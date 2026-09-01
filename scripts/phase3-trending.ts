import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== PHASE 3: Set Trending Flags ===')

  // Get all active products
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, gender: true, isTrending: true, isNew: true },
  })
  console.log(`Total active products: ${products.length}`)

  // Define trending products (viral/social media popular + new arrivals)
  const trendingNames = [
    // New arrivals (existing)
    'Safari Rose', 'Safari Oud', 'Safari Vanilla', 'Safari Bloom',
    // Viral/social media popular scents
    'Baccarat Rouge 540', 'Baccarat Rouge 540 Extrait', 'Baccarat Rouge 540 Extrait De Parfum',
    'Maison Francis Kurkdjian Baccarat Rouge 540', 'MFK Baccarat Rouge 540',
    'Tom Ford Lost Cherry', 'Tom Ford Lost Cherry Eau De Parfum',
    'Tom Ford Tobacco Vanille', 'Tom Ford Tobacco Vanille Eau De Parfum',
    'Kayali Vanilla 28', 'Kayali Vanilla 28 Eau De Parfum',
    'Kayali Musk 12', 'Kayali Musk 12 Eau De Parfum',
    'Kayali Elixir', 'Kayali Elixir Eau De Parfum',
    'Ysl Libre', 'Ysl Libre Eau De Parfum', 'Ysl Libre Intense', 'Ysl Libre Flowers',
    'Ysl Black Opium', 'Ysl Black Opium Eau De Parfum', 'Ysl Black Opium Intense',
    'Ysl Black Opium Neon', 'Ysl Black Opium Le Parfum',
    'Ysl Y', 'Ysl Y Eau De Parfum', 'Ysl Y Le Parfum', 'Ysl Y Eau De Toilette',
    'Ysl Y Le Parfum', 'Ysl Y Eau De Parfum Intense',
    'Initio Atomic Rose', 'Initio Atomic Rose Eau De Parfum',
    'Initio Oud For Greatness', 'Initio Oud For Greatness Eau De Parfum',
    'Initio Side Effect', 'Initio Side Effect Eau De Parfum',
    'Initio Absolute Aphrodisiac', 'Initio Absolute Aphrodisiac Eau De Parfum',
    'Initio Musk Therapy', 'Initio Musk Therapy Eau De Parfum',
    'Initio Parfums Prives', 'Initio Parfums Prives',
    'Maison Francis Kurkdjian', 'MFK', 'Maison Francis Kurkdjian',
    'MFK Baccarat Rouge 540', 'MFK Grand Soir', 'MFK Petit Matin',
    'MFK Aqua Universalis', 'MFK Aqua Celestia', 'MFK Aqua Vitae',
  ]

  // Normalize names for matching
  const normalizeName = (name: string) => name.toLowerCase().replace(/\s+/g, ' ').trim()
  const trendingSet = new Set(trendingNames.map(normalizeName))

  // Trending keywords for partial matching
  const trendingKeywords = [
    'baccarat rouge', 'baccarat rouge 540', 'maison francis kurkdjian', 'mfk',
    'tom ford lost cherry', 'tom ford tobacco vanille', 'tom ford tobacco oud',
    'kayali vanilla 28', 'kayali musk 12', 'kayali elixir',
    'kayali lovefest', 'kayali lovefest burning cherry',
    'ysl libre', 'ysl libre intense', 'ysl libre flowers',
    'ysl black opium', 'ysl black opium intense', 'ysl black opium neon',
    'ysl y', 'ysl y eau de parfum', 'ysl y le parfum', 'ysl y eau de toilette',
    'initio atomic rose', 'initio oud for greatness', 'initio side effect',
    'initio absolute aphrodisiac', 'initio musk therapy',
    'maison francis kurkdjian', 'mfk',
    'baccarat rouge 540', 'baccarat rouge',
    'mfk baccarat rouge 540', 'mfk grand soir', 'mfk petit matin',
    'mfk aqua universalis', 'mfk aqua celestia', 'mfk aqua vitae',
    'tom ford lost cherry', 'tom ford tobacco vanille', 'tom ford tobacco oud',
    'kayali vanilla 28', 'kayali musk 12', 'kayali elixir',
    'kayali lovefest', 'kayali lovefest burning cherry',
    'ysl libre', 'ysl libre intense', 'ysl libre flowers',
    'ysl black opium', 'ysl black opium intense', 'ysl black opium neon',
    'ysl y', 'ysl y eau de parfum', 'ysl y le parfum', 'ysl y eau de toilette',
    'initio atomic rose', 'initio oud for greatness', 'initio side effect',
    'initio absolute aphrodisiac', 'initio musk therapy',
  ]

  const trendingKeywordSet = new Set(trendingKeywords.map(k => k.toLowerCase().trim()))

  let updates = 0
  let alreadyTrending = 0
  const updatesList: { id: string; name: string }[] = []

  for (const product of products) {
    const name = product.name.toLowerCase().trim()
    const isTrending = product.isTrending
    const isNew = product.isNew

    // Check if it matches trending criteria
    let shouldBeTrending = isNew

    if (!shouldBeTrending) {
      // Check exact name match
      if (trendingSet.has(normalizeName(product.name))) {
        shouldBeTrending = true
      }
      // Check keyword match
      else {
        for (const keyword of trendingKeywordSet) {
          if (name.includes(keyword)) {
            shouldBeTrending = true
            break
          }
        }
      }
    }

    if (shouldBeTrending && !isTrending) {
      updatesList.push({ id: product.id, name: product.name })
      updates++
    } else if (isTrending) {
      alreadyTrending++
    }
  }

  console.log(`\nProducts to update: ${updates}`)
  console.log(`Already trending: ${alreadyTrending}`)

  // Show sample
  console.log('\nSample updates:')
  updatesList.slice(0, 30).forEach(u => console.log(`  ${u.name}`))

  // Execute updates
  if (updates > 0) {
    console.log('\nExecuting updates...')
    for (const update of updatesList) {
      await prisma.product.update({
        where: { id: update.id },
        data: { isTrending: true }
      })
    }
    console.log('Trending updates complete!')
  }

  // Verify
  const verify = await prisma.product.count({
    where: { isTrending: true, isActive: true }
  })
  console.log(`\nTotal trending products: ${verify}`)

  // Show trending products
  const trendingProducts = await prisma.product.findMany({
    where: { isTrending: true, isActive: true },
    select: { name: true, gender: true }
  })
  console.log('\nTrending products:')
  trendingProducts.forEach(r => console.log(`  ${r.name} (${r.gender})`))
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect()
  await pool.end()
})