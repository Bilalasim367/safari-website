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
  let bundles: Awaited<ReturnType<typeof prisma.bundle.findMany>> = []

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
                const productCount = bundle._count?.items ?? 0
                return (
                  <Link key={bundle.id} href={`/bundles/${bundle.slug}`} className="h-full">
                    <Card className="h-full flex flex-col group hover:shadow-xl hover:border-gold/50 hover:-translate-y-1 transition-all duration-300">
                      <div className="relative bg-muted overflow-hidden aspect-[4/3]">
                        {bundle.image ? (
                          <img src={bundle.image} alt={bundle.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-muted-foreground text-lg">No Image</span>
                          </div>
                        )}
                        {savingsPct > 0 && (
                          <span className="absolute top-4 left-4 bg-gradient-to-br from-gold to-gold-hover text-charcoal-dark text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                            SAVE {savingsPct}%
                          </span>
                        )}
                        {productCount > 0 && (
                          <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                            {productCount} {productCount === 1 ? 'Product' : 'Products'} Included
                          </span>
                        )}
                      </div>
                      <CardContent className="flex-1 pt-6">
                        <h3 className="font-heading text-foreground text-lg mb-2 group-hover:text-gold transition-colors">{bundle.name}</h3>
                        {bundle.description && (
                          <p className="text-muted-foreground text-sm mb-1 line-clamp-2">{bundle.description}</p>
                        )}
                        {bundle.size && (
                          <p className="text-muted-foreground text-sm mt-1">{bundle.size}</p>
                        )}
                      </CardContent>
                      <CardFooter>
                        <div className="w-full">
                          <p className="text-2xl font-bold text-foreground tracking-tight">
                            PKR {bundle.price.toLocaleString()}
                            {bundle.originalPrice && bundle.originalPrice > bundle.price && (
                              <span className="text-sm text-muted-foreground line-through ml-2">
                                PKR {bundle.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </p>
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
