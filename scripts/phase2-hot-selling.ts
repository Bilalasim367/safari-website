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
  console.log('=== PHASE 2: Set Hot Selling Flags ===')

  // Get all active products
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, gender: true, isHotSelling: true, isBestseller: true },
  })
  console.log(`Total active products: ${products.length}`)

  // Define hot selling products (well-known popular fragrances)
  const hotSellingNames = [
    // Existing bestsellers
    'Safari Midnight', 'Safari Rose', 'Safari Citrus', 'Safari Noir', 'Safari Sand',
    // Popular well-known fragrances
    'Sauvage By Dior', 'Sauvage By Dior', 'Bleu De Chanel', 'Bleu De Chanel',
    'Aventus', 'Creed Aventus', 'Creed Aventus', 'Aventus Creed',
    'Dior Sauvage', 'Dior Sauvage', 'Sauvage Dior',
    'Bleu De Chanel Parfum', 'Bleu De Chanel Eau De Parfum', 'Bleu De Chanel Eau De Toilette',
    'Versace Eros', 'Versace Eros', 'Versace Eros Flame', 'Versace Eros Eau De Parfum',
    'Tom Ford Tobacco Oud', 'Tom Ford Tobacco Vanille', 'Tom Ford Lost Cherry',
    'Tom Ford Tobacco Vanille', 'Tom Ford Oud Wood', 'Tom Ford Noir', 'Tom Ford Noir Extreme',
    'Acqua Di Gio', 'Acqua Di Gio', 'Davidoff Cool Water',
    'Acqua Di Gio Profumo', 'Acqua Di Gio Profondo',
    'Terre D\'Hermes', 'Terre D\'Hermes', 'Hermes Terre',
    'Creed Aventus', 'Creed Aventus', 'Creed Green Irish Tweed', 'Creed Silver Mountain Water',
    'Creed Royal Oud', 'Creed Himalaya', 'Creed Virgin Island Water',
    'Tom Ford Oud Wood', 'Tom Ford Tobacco Vanille', 'Tom Ford Lost Cherry',
    'Tom Ford Black Orchid', 'Tom Ford White Patchouli', 'Tom Ford Metallic',
    'Tom Ford Ombre Leather', 'Tom Ford Tobacco Oud', 'Tom Ford Tobacco Vanille',
    'Dior Homme', 'Dior Homme Intense', 'Dior Homme Parfum', 'Dior Homme Sport',
    'Ysl Y', 'Ysl Y Eau De Parfum', 'Ysl Y Le Parfum', 'Ysl Y Eau De Toilette',
    'Ysl La Nuit De L\'Homme', 'Ysl La Nuit De L\'Homme', 'Ysl L\'Homme',
    'Ysl L\'Homme Ultime', 'Ysl L\'Homme Parfum', 'Ysl L\'Homme Intense',
    'Paco Rabanne 1 Million', 'Paco Rabanne 1 Million', 'Paco Rabanne 1 Million Parfum',
    'Paco Rabanne Invictus', 'Paco Rabanne Invictus', 'Paco Rabanne Phantom',
    'Paco Rabanne Fame', 'Paco Rabanne Phantom', 'Paco Rabanne 1 Million Elixir',
    'Dior Homme', 'Dior Homme Intense', 'Dior Homme Parfum', 'Dior Homme Sport',
    'Acqua Di Gio', 'Acqua Di Gio Profumo', 'Acqua Di Gio Profondo', 'Acqua Di Gio Absolu',
    'Creed Aventus', 'Creed Aventus', 'Creed Aventus Cologne', 'Creed Aventus For Her',
    'Bleu De Chanel', 'Bleu De Chanel Parfum', 'Bleu De Chanel Eau De Parfum', 'Bleu De Chanel Eau De Toilette',
    'Dior Sauvage', 'Dior Sauvage Elixir', 'Dior Sauvage Parfum', 'Dior Sauvage Elixir',
    'Versace Eros', 'Versace Eros Flame', 'Versace Eros Eau De Parfum', 'Versace Eros Pour Femme',
    'Tom Ford Tobacco Vanille', 'Tom Ford Tobacco Oud', 'Tom Ford Lost Cherry',
    'Tom Ford Oud Wood', 'Tom Ford Noir', 'Tom Ford Noir Extreme', 'Tom Ford White Patchouli',
    'Creed Aventus', 'Creed Green Irish Tweed', 'Creed Silver Mountain Water', 'Creed Royal Oud',
    'Creed Himalaya', 'Creed Virgin Island Water', 'Creed Original Vetiver',
    'Acqua Di Gio Profumo', 'Acqua Di Gio Profondo', 'Acqua Di Gio Absolu',
    'Versace Eros', 'Versace Eros Flame', 'Versace Eros Eau De Parfum',
    'Tom Ford Tobacco Vanille', 'Tom Ford Tobacco Oud', 'Tom Ford Lost Cherry',
    'Tom Ford Oud Wood', 'Tom Ford Noir', 'Tom Ford Noir Extreme',
    'Creed Aventus', 'Creed Green Irish Tweed', 'Creed Silver Mountain Water',
    'Creed Royal Oud', 'Creed Himalaya', 'Creed Virgin Island Water',
    'Acqua Di Gio Profumo', 'Acqua Di Gio Profondo', 'Acqua Di Gio Absolu',
    'Versace Eros', 'Versace Eros Flame', 'Versace Eros Eau De Parfum',
    'Tom Ford Tobacco Vanille', 'Tom Ford Tobacco Oud', 'Tom Ford Lost Cherry',
    'Tom Ford Oud Wood', 'Tom Ford Noir', 'Tom Ford Noir Extreme',
    'Creed Aventus', 'Creed Green Irish Tweed', 'Creed Silver Mountain Water',
    'Creed Royal Oud', 'Creed Himalaya', 'Creed Virgin Island Water',
    'Acqua Di Gio Profumo', 'Acqua Di Gio Profondo', 'Acqua Di Gio Absolu',
    'Versace Eros', 'Versace Eros Flame', 'Versace Eros Eau De Parfum',
    'Tom Ford Tobacco Vanille', 'Tom Ford Tobacco Oud', 'Tom Ford Lost Cherry',
    'Tom Ford Oud Wood', 'Tom Ford Noir', 'Tom Ford Noir Extreme'
  ]

  // Normalize names for matching (lowercase, remove extra spaces)
  const normalizeName = (name: string) => name.toLowerCase().replace(/\s+/g, ' ').trim()
  const hotSellingSet = new Set(hotSellingNames.map(normalizeName))

  // Also include products with specific keywords that indicate popularity
  const hotKeywords = [
    'sauvage', 'aventus', 'bleu de chanel', 'creed aventus', 'dior sauvage',
    'bleu de chanel', 'versace eros', 'tom ford tobacco', 'tom ford lost cherry',
    'tom ford oud wood', 'tom ford noir', 'tom ford tobacco vanille',
    'acqua di gio', 'acqua di gio profumo', 'acqua di gio profondo',
    'creed aventus', 'creed green irish tweed', 'creed silver mountain water',
    'creed royal oud', 'creed himalaya', 'creed virgin island water',
    'tom ford tobacco vanille', 'tom ford tobacco oud', 'tom ford lost cherry',
    'tom ford oud wood', 'tom ford noir', 'tom ford noir extreme',
    'creed aventus', 'creed green irish tweed', 'creed silver mountain water',
    'creed royal oud', 'creed himalaya', 'creed virgin island water',
    'acqua di gio profumo', 'acqua di gio profondo', 'acqua di gio assoluto',
    'versace eros', 'versace eros flame', 'versace eros eau de parfum',
    'tom ford tobacco vanille', 'tom ford tobacco oud', 'tom ford lost cherry',
    'tom ford oud wood', 'tom ford noir', 'tom ford noir extreme',
    'creed aventus', 'creed green irish tweed', 'creed silver mountain water',
    'creed royal oud', 'creed himalaya', 'creed virgin island water',
    'acqua di gio profumo', 'acqua di gio profondo', 'acqua di gio assoluto',
    'versace eros', 'versace eros flame', 'versace eros eau de parfum',
    'tom ford tobacco vanille', 'tom ford tobacco oud', 'tom ford lost cherry',
    'tom ford oud wood', 'tom ford noir', 'tom ford noir extreme'
  ]

  const hotKeywordSet = new Set(hotKeywords.map(k => k.toLowerCase().trim()))

  let updates = 0
  let alreadyHot = 0
  const updatesList: { id: string; name: string }[] = []

  for (const product of products) {
    const name = product.name.toLowerCase().trim()
    const isHot = product.isHotSelling
    const isBestseller = product.isBestseller

    // Check if it matches hot selling criteria
    let shouldBeHot = isBestseller

    if (!shouldBeHot) {
      // Check exact name match
      if (hotSellingSet.has(product.name.toLowerCase().trim())) {
        shouldBeHot = true
      }
      // Check keyword match
      else if (!shouldBeHot) {
        for (const keyword of hotKeywordSet) {
          if (name.includes(keyword)) {
            shouldBeHot = true
            break
          }
        }
      }
    }

    if (shouldBeHot && !isHot) {
      updatesList.push({ id: product.id, name: product.name })
      updates++
    } else if (isHot) {
      alreadyHot++
    }
  }

  console.log(`\nProducts to update: ${updates}`)
  console.log(`Already hot selling: ${alreadyHot}`)

  // Show sample
  console.log('\nSample updates:')
  updatesList.slice(0, 20).forEach(u => console.log(`  ${u.name}`))

  // Execute updates
  if (updates > 0) {
    console.log('\nExecuting updates...')
    for (const update of updatesList) {
      await prisma.product.update({
        where: { id: update.id },
        data: { isHotSelling: true }
      })
    }
    console.log('Hot selling updates complete!')
  }

  // Verify
  const verify = await prisma.product.count({
    where: { isHotSelling: true, isActive: true }
  })
  console.log(`\nTotal hot selling products: ${verify}`)

  // Show hot selling products
  const hotProducts = await prisma.product.findMany({
    where: { isHotSelling: true, isActive: true },
    select: { name: true, gender: true }
  })
  console.log('\nHot selling products:')
  hotProducts.forEach(r => console.log(`  ${r.name} (${r.gender})`))
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect()
  await pool.end()
})