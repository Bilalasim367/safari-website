import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGES = [
  '/products/1778678076894-9e67pj.png',
  '/products/1778678957463-mgyiqa.png',
  '/products/1778679010971-cef1fu.png',
  '/products/1778679037156-nxivrd.png',
  '/products/1778679142951-0wgp1l.png',
  '/products/1778679164831-4ac752.png',
]

interface TesterDummy {
  name: string
  slug: string
  description: string
  price: number
  originalPrice: number | null
  gender: 'Men' | 'Women' | 'Unisex'
  categorySlug: string
  fragranceFamily: string
  season: string
  notesTop: string[]
  notesHeart: string[]
  notesBase: string[]
  isBestseller: boolean
  isNew: boolean
  isHotSelling: boolean
  isTrending: boolean
  isFeatured: boolean
}

const DUMMIES: TesterDummy[] = [
  {
    name: 'Signature Discovery Tester Box',
    slug: 'signature-discovery-tester-box',
    description: 'A curated 5ml tester box — three signature safari blends to explore before you commit to a full bottle.',
    price: 900,
    originalPrice: 1200,
    gender: 'Unisex',
    categorySlug: 'unisex',
    fragranceFamily: 'Woody',
    season: 'all season',
    notesTop: ['Bergamot', 'Pink Pepper'],
    notesHeart: ['Saffron', 'Leather'],
    notesBase: ['Oud', 'Musk'],
    isBestseller: true,
    isNew: true,
    isHotSelling: true,
    isTrending: true,
    isFeatured: true,
  },
  {
    name: 'Midnight Oud Tester Box 5ml',
    slug: 'midnight-oud-tester-box-5ml',
    description: 'Intense oud-led tester — deep, smoky, and long-wearing for evening wear.',
    price: 850,
    originalPrice: 1100,
    gender: 'Men',
    categorySlug: 'men',
    fragranceFamily: 'Oriental',
    season: 'winter',
    notesTop: ['Cardamom', 'Mandarin'],
    notesHeart: ['Oud', 'Rose'],
    notesBase: ['Amber', 'Vetiver'],
    isBestseller: false,
    isNew: true,
    isHotSelling: true,
    isTrending: false,
    isFeatured: false,
  },
  {
    name: 'Rosé Riviera Tester Box 5ml',
    slug: 'rose-riviera-tester-box-5ml',
    description: 'Soft floral tester — fresh rose and peony in a portable 5ml box.',
    price: 750,
    originalPrice: null,
    gender: 'Women',
    categorySlug: 'women',
    fragranceFamily: 'Floral',
    season: 'summer',
    notesTop: ['Lychee', 'Pink Pepper'],
    notesHeart: ['Rose', 'Peony'],
    notesBase: ['White Musk', 'Amber'],
    isBestseller: false,
    isNew: true,
    isHotSelling: false,
    isTrending: true,
    isFeatured: false,
  },
  {
    name: 'Citrus Coast Tester Box 5ml',
    slug: 'citrus-coast-tester-box-5ml',
    description: 'Bright, fresh tester — sparkling citrus for effortless daytime wear.',
    price: 700,
    originalPrice: 950,
    gender: 'Men',
    categorySlug: 'men',
    fragranceFamily: 'Citrus',
    season: 'summer',
    notesTop: ['Lemon', 'Grapefruit'],
    notesHeart: ['Neroli', 'Ylang-Ylang'],
    notesBase: ['Cedar', 'Musk'],
    isBestseller: false,
    isNew: false,
    isHotSelling: false,
    isTrending: false,
    isFeatured: true,
  },
  {
    name: 'Amber Muse Tester Box 5ml',
    slug: 'amber-muse-tester-box-5ml',
    description: 'Warm amber tester — cozy, sweet, and comforting for cooler days.',
    price: 800,
    originalPrice: null,
    gender: 'Women',
    categorySlug: 'women',
    fragranceFamily: 'Amber',
    season: 'winter',
    notesTop: ['Vanilla', 'Bitter Orange'],
    notesHeart: ['Amber', 'Jasmine'],
    notesBase: ['Tonka', 'Sandalwood'],
    isBestseller: true,
    isNew: false,
    isHotSelling: false,
    isTrending: false,
    isFeatured: false,
  },
  {
    name: 'Safari Trio Tester Box 5ml',
    slug: 'safari-trio-tester-box-5ml',
    description: 'Three contrasting 5ml testers — one floral, one woody, one fresh — to map your next signature scent.',
    price: 1000,
    originalPrice: 1400,
    gender: 'Unisex',
    categorySlug: 'unisex',
    fragranceFamily: 'Woody',
    season: 'all season',
    notesTop: ['Lavender', 'Bergamot'],
    notesHeart: ['Geranium', 'Juniper'],
    notesBase: ['Oakmoss', 'Leather'],
    isBestseller: false,
    isNew: true,
    isHotSelling: true,
    isTrending: true,
    isFeatured: false,
  },
]

function toTags(g: string): string {
  if (g === 'Men') return 'men,tester,box,sample'
  if (g === 'Women') return 'women,tester,box,sample'
  return 'unisex,tester,box,sample'
}

async function main() {
  let created = 0
  let updated = 0
  for (const d of DUMMIES) {
    const data = {
      name: d.name,
      description: d.description,
      price: d.price,
      originalPrice: d.originalPrice,
      image: IMAGES[DUMMIES.indexOf(d) % IMAGES.length],
      images: JSON.stringify([IMAGES[DUMMIES.indexOf(d) % IMAGES.length]]),
      categorySlug: d.categorySlug,
      size: '5ml',
      sizePrices: JSON.stringify([{ size: '5ml', price: d.price, originalPrice: d.originalPrice }]),
      sizesAvailable: '5ml',
      fragranceFamily: d.fragranceFamily,
      notesTop: JSON.stringify(d.notesTop),
      notesHeart: JSON.stringify(d.notesHeart),
      notesBase: JSON.stringify(d.notesBase),
      gender: d.gender,
      type: 'Tester',
      season: d.season,
      tags: toTags(d.gender),
      shortDescription: d.description,
      currency: 'PKR',
      stockStatus: 'in_stock',
      isActive: true,
      isBestseller: d.isBestseller,
      isNew: d.isNew,
      isHotSelling: d.isHotSelling,
      isTrending: d.isTrending,
      isFeatured: d.isFeatured,
    }
    const existing = await prisma.product.findUnique({ where: { slug: d.slug } })
    if (existing) {
      await prisma.product.update({ where: { slug: d.slug }, data })
      updated++
    } else {
      await prisma.product.create({ data: { ...data, slug: d.slug } })
      created++
    }
  }

  const total = await prisma.product.count()
  const testers = await prisma.product.count({ where: { type: 'Tester' } })
  const attars = await prisma.product.count({ where: { type: 'Attar' } })
  const perfumes = await prisma.product.count({ where: { type: 'Perfume' } })
  console.log(`created=${created} updated=${updated}`)
  console.log(`total=${total} | Tester=${testers} Attar=${attars} Perfume=${perfumes}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())