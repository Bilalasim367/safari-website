import prisma from '@/lib/turso'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function BundlesPage() {
  let bundles: Awaited<ReturnType<typeof prisma.bundle.findMany>> = []

  try {
    bundles = await prisma.bundle.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })
  } catch (e) {
    console.error('Error fetching bundles:', e)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 md:px-12 py-24">
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
              {bundles.map((bundle) => (
                <Link key={bundle.id} href={`/bundles/${bundle.slug}`} className="h-full">
                  <Card className="h-full flex flex-col group hover:shadow-lg transition-all duration-300">
                    <div className="relative bg-muted overflow-hidden" style={{ height: '260px' }}>
                      {bundle.image ? (
                        <img src={bundle.image} alt={bundle.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-muted-foreground text-lg">No Image</span>
                        </div>
                      )}
                      {bundle.save && (
                        <span className="absolute top-4 right-4 bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                          SAVE {bundle.save}
                        </span>
                      )}
                    </div>
                    <CardContent className="flex-1 pt-6">
                      <h3 className="font-heading text-foreground text-lg mb-2">{bundle.name}</h3>
                      {bundle.description && (
                        <p className="text-muted-foreground text-sm mb-1">{bundle.description}</p>
                      )}
                      {bundle.size && (
                        <p className="text-muted-foreground text-sm">{bundle.size}</p>
                      )}
                    </CardContent>
                    <CardFooter>
                      <div className="w-full">
                        <p className="text-2xl font-bold text-foreground tracking-tight">
                          ${bundle.price}
                          {bundle.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through ml-2">
                              ${bundle.originalPrice}
                            </span>
                          )}
                        </p>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
