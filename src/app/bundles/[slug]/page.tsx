import prisma from '@/lib/turso'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AddBundleToCart from '@/components/AddBundleToCart'

export const dynamic = 'force-dynamic'

async function getBundle(slug: string) {
  try {
    return await prisma.bundle.findUnique({
      where: { slug },
      include: {
        items: {
          include: { product: true },
        },
      },
    })
  } catch (e) {
    console.error('Error fetching bundle:', e)
    return null
  }
}

async function getOtherBundles(currentSlug: string) {
  try {
    return await prisma.bundle.findMany({
      where: { isActive: true, slug: { not: currentSlug } },
      orderBy: { createdAt: 'desc' },
      take: 3,
    })
  } catch (e) {
    console.error('Error fetching other bundles:', e)
    return []
  }
}

export default async function BundleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const bundle = await getBundle(slug)
  if (!bundle) notFound()

  const otherBundles = await getOtherBundles(slug)

  const savings = bundle.originalPrice ? bundle.originalPrice - bundle.price : 0
  const discountPercent = bundle.originalPrice ? Math.round((savings / bundle.originalPrice) * 100) : 0

  const features = [
    {
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      title: 'Curated Selection',
      desc: `Handpicked ${bundle.items?.length || 'premium'} fragrances in one set`,
    },
    ...(bundle.save
      ? [
          {
            icon: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6',
            title: `Save ${bundle.save}`,
            desc: `Save $${savings} compared to buying individually`,
          },
        ]
      : []),
    ...(bundle.size
      ? [
          {
            icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
            title: 'Premium Quality',
            desc: `${bundle.size} — perfect sizes for every occasion`,
          },
        ]
      : []),
    {
      icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
      title: 'Gift Ready',
      desc: 'Beautifully packaged, ready to gift or enjoy',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1280px] mx-auto px-6 py-6">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/bundles" className="hover:text-foreground transition-colors">Bundles</Link>
          <span>/</span>
          <span className="text-foreground">{bundle.name}</span>
        </nav>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="relative bg-muted rounded-xl overflow-hidden" style={{ minHeight: '450px' }}>
            {bundle.image ? (
              <img src={bundle.image} alt={bundle.name} className="w-full h-full object-cover absolute inset-0" />
            ) : (
              <div className="w-full h-full flex items-center justify-center absolute inset-0">
                <div className="text-center">
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mx-auto mb-4 opacity-30">
                    <rect x="8" y="14" width="48" height="36" rx="4" stroke="currentColor" strokeWidth="2" />
                    <circle cx="24" cy="28" r="5" stroke="currentColor" strokeWidth="2" />
                    <path d="M8 44 L20 34 L28 42 L40 28 L56 46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-muted-foreground">No Image</span>
                </div>
              </div>
            )}
            {bundle.save && (
              <span className="absolute top-5 right-5 bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-full tracking-wider">
                SAVE {bundle.save}
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          <div>
            <Badge variant="secondary" className="text-xs tracking-[0.25em] uppercase mb-5">
              Bundle
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading text-foreground mb-5">
              {bundle.name}
            </h1>

            {bundle.description && (
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                {bundle.description}
              </p>
            )}

            {bundle.size && (
              <div className="flex items-center gap-2 mb-6">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-muted-foreground">
                  <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M2 6h12M6 2v12" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span className="text-muted-foreground text-sm">{bundle.size}</span>
              </div>
            )}

            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-4xl font-bold text-foreground tracking-tight">
                ${bundle.price}
              </span>
              {bundle.originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    ${bundle.originalPrice}
                  </span>
                  {discountPercent > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      Save {discountPercent}%
                    </Badge>
                  )}
                </>
              )}
            </div>

            <AddBundleToCart
              bundleId={bundle.id}
              name={bundle.name}
              price={bundle.price}
              image={bundle.image}
              size={bundle.size}
              inStock={bundle.inStock}
            />

            <div className="flex items-center justify-center gap-6 mt-5">
              {["Free Shipping", "Secure Checkout", "Easy Returns"].map((txt) => (
                <span key={txt} className="text-xs text-muted-foreground font-medium tracking-wide">
                  {txt}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="border-t border-border">
        <div className="max-w-[1280px] mx-auto px-6 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <Card key={i} className="border-0 bg-muted/50">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={f.icon} />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wider">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What's Inside */}
      {bundle.items && bundle.items.length > 0 && (
        <section className="border-t border-border">
          <div className="max-w-[1280px] mx-auto px-6 py-14">
            <div className="text-center mb-12">
              <p className="text-xs tracking-[0.5em] uppercase mb-3 text-muted-foreground">
                Included
              </p>
              <h2 className="text-3xl md:text-4xl font-heading text-foreground">
                What&rsquo;s Inside
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bundle.items.map((item) => (
                <Link
                  key={item.id}
                  href={`/shop/${item.product.slug}`}
                  className="group"
                >
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="relative bg-muted overflow-hidden" style={{ height: '240px' }}>
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-muted-foreground text-sm">No Image</span>
                        </div>
                      )}
                      {item.quantity > 1 && (
                        <span className="absolute top-3 left-3 bg-foreground text-background text-xs font-medium px-2 py-1 rounded-full">
                          Qty {item.quantity}
                        </span>
                      )}
                    </div>
                    <CardContent className="pt-5 pb-5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.25em] mb-1">
                        {item.product.fragranceFamily || item.product.categorySlug || "Signature"}
                      </p>
                      <h3 className="font-heading text-foreground text-base mb-1 group-hover:text-primary transition-colors">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{item.product.size}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Value Breakdown */}
      {bundle.originalPrice && (
        <section className="border-t border-border bg-muted/30">
          <div className="max-w-[1280px] mx-auto px-6 py-14">
            <div className="max-w-lg mx-auto text-center">
              <p className="text-xs tracking-[0.5em] uppercase mb-3 text-muted-foreground">
                Value
              </p>
              <h2 className="text-3xl md:text-4xl font-heading text-foreground mb-8">
                Great Value Bundle
              </h2>

              <div className="bg-background rounded-xl p-8 border border-border">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Individual Value</span>
                  <span className="text-lg font-semibold text-muted-foreground line-through">${bundle.originalPrice}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Bundle Price</span>
                  <span className="text-2xl font-bold text-foreground">${bundle.price}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-muted-foreground">You Save</span>
                  <span className="text-lg font-bold text-primary">${savings}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-6">
                Get {bundle.items?.length || ''} premium fragrances at an incredible {bundle.save} discount. 
                Perfect for travel, gifting, or exploring new scents.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Related Bundles */}
      {otherBundles.length > 0 && (
        <section className="border-t border-border">
          <div className="max-w-[1280px] mx-auto px-6 py-14">
            <div className="text-center mb-12">
              <p className="text-xs tracking-[0.5em] uppercase mb-3 text-muted-foreground">
                Explore More
              </p>
              <h2 className="text-3xl md:text-4xl font-heading text-foreground">
                Other Bundles You&rsquo;ll Love
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherBundles.map((ob) => (
                <Link key={ob.id} href={`/bundles/${ob.slug}`} className="group">
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="relative bg-muted overflow-hidden" style={{ height: '220px' }}>
                      {ob.image ? (
                        <img src={ob.image} alt={ob.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-muted-foreground text-sm">No Image</span>
                        </div>
                      )}
                      {ob.save && (
                        <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                          SAVE {ob.save}
                        </span>
                      )}
                    </div>
                    <CardContent className="pt-5 pb-5">
                      <h3 className="font-heading text-foreground text-lg mb-1 group-hover:text-primary transition-colors">{ob.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{ob.description}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-foreground">${ob.price}</span>
                        {ob.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">${ob.originalPrice}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/bundles"
                className="inline-flex items-center justify-center h-12 px-8 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
              >
                View All Bundles
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
