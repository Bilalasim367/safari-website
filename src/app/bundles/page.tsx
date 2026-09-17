import prisma from '@/lib/prisma'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { SITE_URL } from '@/lib/site'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Bundles & Gift Sets | Safari Perfumes Pakistan',
  description:
    'Shop curated perfume and attar bundles & gift sets at Safari Perfumes. Premium fragrance sets at discounted PKR prices — perfect for gifting in Pakistan.',
  alternates: { canonical: `${SITE_URL}/bundles` },
}

export default async function BundlesPage() {
  let bundles: {
    id: string
    name: string
    slug: string
    description: string | null
    price: number
    originalPrice: number | null
    image: string | null
    size: string | null
    _count: { items: number }
  }[] = []

  try {
    bundles = await prisma.bundle.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        originalPrice: true,
        image: true,
        save: true,
        size: true,
        _count: { select: { items: true } },
      },
    })
  } catch (e) {
    console.error('Error fetching bundles:', e)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 md:px-12 pb-24">
        <div className="container-custom">
          <div className="text-center mb-16">
            <p className="text-sm tracking-[0.5em] uppercase mb-4 text-muted-foreground">
              Perfect Gifts
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading text-foreground">
              Bundles & Gift Sets
            </h1>
          </div>

          {bundles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No bundles available at the moment.</p>
              <Link href="/shop">
                <Button variant="outline" className="mt-6">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {bundles.map((bundle) => {
                const savingsPct =
                  bundle.originalPrice && bundle.originalPrice > bundle.price
                    ? Math.round(((bundle.originalPrice - bundle.price) / bundle.originalPrice) * 100)
                    : 0
                const savingsAmount =
                  bundle.originalPrice && bundle.originalPrice > bundle.price
                    ? bundle.originalPrice - bundle.price
                    : 0
                const productCount = bundle._count?.items ?? 0
                return (
                  <Link key={bundle.id} href={`/bundles/${bundle.slug}`} className="h-full group">
                    <Card className="h-full flex flex-col rounded-2xl overflow-hidden border-border bg-card transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-gold/10 group-hover:-translate-y-1.5 group-hover:border-gold/40 overflow-hidden">
                      <div className="relative bg-muted overflow-hidden aspect-[4/3]">
                        {bundle.image ? (
                          <img src={bundle.image} alt={bundle.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-muted-foreground text-lg">No Image</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="bg-[#B6965D] text-black text-sm font-bold uppercase tracking-wider px-6 py-2.5 rounded-full shadow-lg">
                            View Bundle →
                          </span>
                        </div>
                        {savingsPct > 0 && (
                          <span className="absolute top-4 left-4 bg-gradient-to-br from-gold to-gold-hover text-charcoal-dark text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                            SAVE {savingsPct}%
                          </span>
                        )}
                        {productCount > 0 && (
                          <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full border border-white/10">
                            {productCount} {productCount === 1 ? 'Product' : 'Products'} Included
                          </span>
                        )}
                      </div>
                      <CardContent className="flex-1 pt-5 px-5">
                        <h3 className="font-heading text-foreground text-lg mb-1.5 group-hover:text-gold transition-colors">{bundle.name}</h3>
                        {bundle.description && (
                          <p className="text-muted-foreground text-sm leading-relaxed mb-2 line-clamp-2">{bundle.description}</p>
                        )}
                        {bundle.size && (
                          <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground border border-border rounded-full px-2.5 py-1">
                            {bundle.size}
                          </span>
                        )}
                      </CardContent>
                      <CardFooter className="pt-1 pb-5">
                        <div className="w-full">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-foreground tracking-tight">
                              PKR {bundle.price.toLocaleString()}
                            </span>
                            {bundle.originalPrice && bundle.originalPrice > bundle.price && (
                              <span className="text-sm text-muted-foreground line-through">
                                PKR {bundle.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {savingsAmount > 0 && (
                            <p className="text-xs font-semibold text-emerald-600 mt-1">
                              You save PKR {savingsAmount.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
