"use client"

import React from 'react'
import Link from 'next/link'
import HeroSlider from '@/components/HeroSlider'
import ProductCard from '@/components/ProductCard'
import ProductCarousel from '@/components/ProductCarousel'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Rating } from '@/components/Rating'
import { testimonials } from '@/data/products'
import type { ProductType } from '@/lib/product-types'

const HERO_BANNERS = [
  '/banner1.png',
  '/banner2.png',
  '/banner3.png',
]

const HERO_CONTENT = [
  {
    subtitle: "Exclusive Collection",
    title: "DISCOVER YOUR",
    highlight: "SIGNATURE SCENT",
    description: "Crafted with passion, designed to captivate your senses. Explore our exclusive range of captivating fragrances.",
    cta: "Shop Now",
  },
  {
    subtitle: "New Arrivals",
    title: "EMBRACE THE",
    highlight: "LATEST ESSENCE",
    description: "Be the first to experience our newest creations. Limited edition fragrances for the discerning collector.",
    cta: "Explore New",
  },
  {
    subtitle: "Best Sellers",
    title: "REDISCOVER",
    highlight: "CLASSIC LUXURY",
    description: "Timeless fragrances that have charmed thousands. Discover the scents that define elegance.",
    cta: "View All",
  },
]

const COLLECTION_IMAGES: Record<string, string> = {
  men: '/men.png',
  women: '/women.png',
  unisex: '/unisex.png',
}

const SCENT_IMAGES: Record<string, string> = {
  woody: '/woody.png',
  fresh: '/fresh.png',
  floral: '/floral.png',
}

interface HomePageProps {
  bestsellers: PrismaProduct[]
  newArrivals: PrismaProduct[]
  bundles: PrismaBundle[]
  allProducts: PrismaProduct[]
}

interface PrismaProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  image: string;
  images: string[];
  categorySlug: string | null;
  category?: { name: string } | null;
  size: string;
  inStock: boolean;
  isBestseller: boolean;
  isNew: boolean;
  rating: number;
  reviewCount: number;
  gender?: string | null;
  fragranceFamily?: string | null;
  type: ProductType;
}

interface PrismaBundle {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  save: string | null;
  size: string | null;
  inStock: boolean;
  description?: string | null;
}

const TABS = [
  { label: 'All', filter: null },
  { label: 'Men', filter: 'Men' },
  { label: 'Women', filter: 'Women' },
  { label: 'Unisex', filter: 'Unisex' },
  { label: 'Bundles', filter: 'bundles' },
  { label: 'Woody', filter: 'Woody' },
  { label: 'Fresh', filter: 'Fresh' },
  { label: 'Floral', filter: 'Floral' },
] as const

type TabFilter = (typeof TABS)[number]['filter']

function filterProducts(products: PrismaProduct[], filter: TabFilter): PrismaProduct[] {
  if (!filter) return products
  if (filter === 'bundles') return products
  return products.filter((p) => {
    if (p.gender === filter || p.fragranceFamily === filter) return true
    if (p.category?.name === filter || p.categorySlug === filter) return true
    return false
  })
}

export default function HomePage({ bestsellers, newArrivals, bundles, allProducts }: HomePageProps) {
  const [storyExpanded, setStoryExpanded] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<TabFilter>(null);

  const filteredProducts = React.useMemo(
    () => filterProducts(allProducts, activeTab),
    [allProducts, activeTab]
  )

  const carouselProducts = React.useMemo(
    () => filteredProducts.map((p) => ({
      id: String(p.id),
      name: p.name,
      slug: p.slug,
      price: p.price,
      originalPrice: p.originalPrice ?? undefined,
      image: p.image,
      images: p.images,
      category: p.category?.name || 'Signature',
      isNew: p.isNew,
      isBestseller: p.isBestseller,
      size: p.size,
      rating: p.rating,
      reviewCount: p.reviewCount,
    })),
    [filteredProducts]
  )

  const attarProducts = React.useMemo(
    () => allProducts.filter((p) => p.type === 'attar'),
    [allProducts]
  )

  const perfumeProducts = React.useMemo(
    () => allProducts.filter((p) => p.type === 'perfume'),
    [allProducts]
  )
  return (
    <>
      {/* HERO SECTION */}
      <section className='relative min-h-[90vh] flex items-center justify-center overflow-hidden'>
        <HeroSlider banners={HERO_BANNERS} content={HERO_CONTENT} />
      </section>

      {/* TRUST & VALUE SECTION */}
      <section className='px-6 md:px-12 py-10 md:py-14 bg-background '>
        <div className='container-custom'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12'>
            {[
              {
                icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.123l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.123l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
                title: '5-Star Ratings',
                desc: 'Loved by thousands of customers worldwide',
              },
              {
                icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
                title: 'Premium Quality',
                desc: 'Exceptional ingredients, crafted to perfection',
              },
              {
                icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
                title: '24/7 Support',
                desc: 'Dedicated team ready to assist you anytime',
              },
              {
                icon: 'M13 10V3L4 14h7v7l9-11h-7z',
                title: 'Fast Delivery',
                desc: 'Quick & reliable shipping worldwide',
              },
            ].map((item, i) => (
              <Card key={i} size="sm" className="flex flex-col items-center text-center hover:shadow-md transition-all duration-300">
                <CardContent className="flex flex-col items-center pt-6 pb-6">
                  <div className='mb-6 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center'>
                    <svg
                      className='w-6 h-6 text-primary'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={1.5}
                        d={item.icon}
                      />
                    </svg>
                  </div>
                  <h3 className='text-lg font-semibold text-foreground mb-3'>
                    {item.title}
                  </h3>
                  <p className='text-muted-foreground text-base'>{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SUMMER COLLECTION PROMO BANNER */}
      <section className='px-6 md:px-12 py-10 md:py-14 bg-background'>
        <div className='container-custom'>
          <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-amber-100/80 to-orange-200/60 dark:from-amber-950/30 dark:via-amber-900/20 dark:to-orange-900/30'>
            <div className='relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 p-8 md:p-16'>
              <div className='flex-1 text-center md:text-left'>
                <p className='text-primary text-sm tracking-[0.5em] uppercase mb-4'>
                  Summer Collection
                </p>
                <h2 className='text-4xl md:text-5xl lg:text-6xl font-heading text-foreground mb-6'>
                  Fresh Notes for <span className='text-primary'>Warm Days</span>
                </h2>
                <p className='text-muted-foreground text-lg md:text-xl leading-relaxed mb-8 max-w-lg'>
                  Light, uplifting fragrances perfect for the season. Discover our curated summer essentials.
                </p>
                <Link href='/shop?fragranceFamily=fresh'>
                  <Button variant="outline" className="border-foreground/30 hover:bg-foreground hover:text-background px-10 py-6 tracking-[0.2em] uppercase text-sm">
                    Shop Now
                  </Button>
                </Link>
              </div>
              <div className='flex-shrink-0 w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden'>
                <img src='/pics2.png' alt='Summer Collection' className='w-full h-full object-cover' />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR PRODUCTS TAB BAR + CAROUSEL */}
      <section className='px-6 md:px-12 py-8 md:py-12 bg-background'>
        <div className='container-custom'>
          <div className='text-center mb-8'>
            <h2 className='text-4xl md:text-5xl lg:text-6xl font-heading text-foreground'>
              Our Products
            </h2>
          </div>
          <div className='flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0 justify-start md:justify-center mb-8'>
            {TABS.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.filter)}
                className={`flex-shrink-0 snap-start scroll-ml-6 px-5 py-2.5 text-sm font-medium rounded-full border transition-colors whitespace-nowrap ${
                  activeTab === tab.filter
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-foreground border-border hover:bg-foreground hover:text-background'
                }`}
                style={{ minHeight: '40px', lineHeight: '40px', padding: '0 20px' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <ProductCarousel products={carouselProducts} />
        </div>
      </section>

      {/* ATTARS SECTION */}
      <section className="px-6 md:px-12 py-10 md:py-14 bg-background">
        <div className='container-custom'>
          <div className='text-center mb-10'>
            <p className='text-sm tracking-[0.5em] uppercase mb-4 text-muted-foreground'>
              Concentrated Elegance
            </p>
            <h2 className='text-4xl md:text-5xl lg:text-6xl font-heading text-foreground'>
              Attars
            </h2>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {attarProducts.length > 0
              ? attarProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={String(product.id)}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    originalPrice={product.originalPrice ?? undefined}
                    image={product.image}
                    images={product.images}
                    category={product.category?.name || 'Signature'}
                    isNew={product.isNew}
                    isBestseller={product.isBestseller}
                    size={product.size}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                  />
                ))
              : [...Array(4)].map((_, i) => (
                  <div key={i} className='h-[400px] rounded-lg bg-muted animate-pulse' />
                ))}
          </div>
        </div>
      </section>

      {/* PERFUMES SECTION */}
      <section className="px-6 md:px-12 py-10 md:py-14 bg-background">
        <div className='container-custom'>
          <div className='text-center mb-10'>
            <p className='text-sm tracking-[0.5em] uppercase mb-4 text-muted-foreground'>
              Luxury Fragrances
            </p>
            <h2 className='text-4xl md:text-5xl lg:text-6xl font-heading text-foreground'>
              Perfumes
            </h2>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {perfumeProducts.length > 0
              ? perfumeProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={String(product.id)}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    originalPrice={product.originalPrice ?? undefined}
                    image={product.image}
                    images={product.images}
                    category={product.category?.name || 'Signature'}
                    isNew={product.isNew}
                    isBestseller={product.isBestseller}
                    size={product.size}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                  />
                ))
              : [...Array(4)].map((_, i) => (
                  <div key={i} className='h-[400px] rounded-lg bg-muted animate-pulse' />
                ))}
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS SECTION */}
      <section className="px-6 md:px-12 py-10 md:py-14 bg-background">
        <div className='container-custom'>
          <div className='text-center mb-10'>
            <p className='text-sm tracking-[0.5em] uppercase mb-4 text-muted-foreground'>
              Discover
            </p>
            <h2 className='text-4xl md:text-5xl lg:text-6xl font-heading text-foreground'>
              New Arrivals
            </h2>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {newArrivals.length > 0
              ? newArrivals.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={String(product.id)}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    originalPrice={product.originalPrice ?? undefined}
                    image={product.image}
                    images={product.images}
                    category={product.category?.name || 'Signature'}
                    isNew={product.isNew}
                    isBestseller={product.isBestseller}
                    size={product.size}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                  />
                ))
              : [...Array(4)].map((_, i) => (
                  <div key={i} className='h-[400px] rounded-lg bg-muted animate-pulse' />
                ))}
          </div>

          <div className='text-center mt-10'>
            <Button variant="outline" className="border-foreground/30 hover:bg-foreground hover:text-background px-10 py-6 tracking-[0.2em] uppercase text-sm">
              <Link href='/shop?filter=new'>Explore All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* COLLECTIONS SECTION */}
      <section className="px-6 md:px-12 py-10 md:py-14 bg-background">
        <div className='container-custom'>
          <div className='text-center mb-10'>
            <p className='text-foreground text-sm tracking-[0.5em] uppercase mb-4'>
              Browse
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading text-foreground">
              Explore Our Collections
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12'>
            {[
              { name: 'Men', slug: 'men', desc: 'Bold & distinctive', image: COLLECTION_IMAGES.men },
              { name: 'Women', slug: 'women', desc: 'Elegant & enchanting', image: COLLECTION_IMAGES.women },
              { name: 'Unisex', slug: 'unisex', desc: 'For everyone', image: COLLECTION_IMAGES.unisex },
            ].map((cat) => (
              <div key={cat.name} id={cat.slug}>
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className='collection-card group relative block overflow-hidden'
                >
                  <div className='w-full h-full'>
                    <img 
                      src={cat.image} 
                      alt={cat.name}
                      className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                    />
                  </div>
                  <div className='absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors' />
                  <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
                    {cat.name}
                  </span>
                  <div className='absolute bottom-0 left-0 right-0 p-12 text-center'>
                    <h3 className='text-3xl md:text-4xl font-serif text-white font-bold mb-4 tracking-wider'>
                      {cat.name}
                    </h3>
                    <p className='text-white/70 text-base mb-6'>{cat.desc}</p>
                    <span className='inline-block text-sm tracking-[0.25em] uppercase text-white opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500'>
                      Shop Now →
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUR STORY SECTION */}
      <section className='px-6 md:px-12 py-14 bg-background'>
        <div className='container-custom'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
            <div>
              <p className='text-primary text-sm tracking-[0.5em] uppercase mb-5'>
                About Us
              </p>
              <div className='mb-10'>
                <h2 className='text-4xl md:text-5xl lg:text-6xl font-heading text-foreground inline-block pb-8'>
                  Our <span className='text-primary'>Story</span>
                </h2>
                <Separator className='mt-2 w-20 bg-primary/40' />
              </div>

              <p className='text-muted-foreground text-lg md:text-xl leading-relaxed mb-8'>
                SAFARI is a luxury fragrance house dedicated to creating
                exceptional scents that capture the essence of sophistication
                and elegance. Our perfumes are crafted with the finest
                ingredients from around the world, each bottle telling a unique
                story of craftsmanship and passion.
              </p>

              <div className='relative pl-6 mb-8 border-l-2 border-primary/30'>
                <p className='font-heading text-xl md:text-2xl italic text-foreground/80 leading-relaxed'>
                  &ldquo;Every SAFARI fragrance is a masterpiece, designed to leave a lasting impression.&rdquo;
                </p>
              </div>

              <p className='text-muted-foreground text-lg md:text-xl leading-relaxed mb-10'>
                Founded with a vision to bring the art of perfumery to
                discerning customers, we continue to innovate and inspire
                through our collections since 2015.
              </p>

              <div className='grid grid-cols-2 md:grid-cols-4 gap-6 mb-10'>
                {[
                  { number: '2015', label: 'Founded' },
                  { number: '50+', label: 'Fragrances' },
                  { number: '10K+', label: 'Happy Customers' },
                  { number: '🌍', label: 'Global Shipping' },
                ].map((stat) => (
                  <div key={stat.label} className='text-center'>
                    <p className='text-2xl md:text-3xl font-bold text-primary tracking-tight'>{stat.number}</p>
                    <p className='text-xs text-muted-foreground mt-1 uppercase tracking-wider'>{stat.label}</p>
                  </div>
                ))}
              </div>

              <Link href='/about'>
                <Button variant="outline" className="group border-primary/40 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary px-8 py-6">
                  Read Our Story
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none"
                    className="ml-2 transition-transform group-hover:translate-x-1"
                  >
                    <path d="M4 8h8M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Button>
              </Link>
            </div>

            <div className='relative aspect-[4/5] shadow-2xl bg-muted rounded-lg overflow-hidden mt-12 lg:mt-0'>
              <img 
                src='/story.png' 
                alt="Our Story"
                className='w-full h-full object-cover'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent' />
              <span className='absolute top-5 right-5 bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-full tracking-wider shadow-lg'>
                Since 2015
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* EXPANDED STORY SECTION */}
      <section className='px-6 md:px-12 py-14 bg-background border-t border-border'>
        <div className='container-custom'>
          <div className='max-w-3xl mx-auto'>
            {(() => {
              const subsections = [
                {
                  title: 'What Makes SAFARI Fragrances Unique?',
                  content: 'At SAFARI, every fragrance is a story waiting to be told. We source the finest ingredients from across the globe — from the rare agarwood forests of Southeast Asia to the jasmine fields of Grasse. Our master perfumers blend traditional artistry with modern innovation to create scents that are both timeless and contemporary. Each bottle undergoes rigorous quality testing to ensure longevity, sillage, and a truly captivating olfactory experience that sets us apart in the world of luxury perfumery.'
                },
                {
                  title: 'Our Collection of Luxury Perfumes in Pakistan',
                  content: 'SAFARI brings world-class perfumery to Pakistan with an exquisite collection that caters to every personality and occasion. From bold, commanding oud-based compositions to light, floral daytime essences, our range offers something for every connoisseur. Whether you prefer the warm embrace of amber and musk or the crisp vitality of citrus and aquatic notes, our curated selection represents the finest in Pakistani fragrance craftsmanship, delivered with international standards of excellence.'
                },
                {
                  title: 'Best Perfumes in Pakistan Curated by SAFARI',
                  content: 'Our team of fragrance experts travels the world to bring you the most exceptional scents available in Pakistan. Each perfume in our collection has been carefully evaluated for its composition, performance, and unique character. We pride ourselves on offering only the best — from our best-selling Safari Midnight and Safari Oud to hidden gems that deserve a place in every collection. Every recommendation is backed by thousands of satisfied customers across the country.'
                },
                {
                  title: 'Why We Are a Leading Fragrance Brand',
                  content: 'SAFARI has earned its reputation as a leading fragrance house through an unwavering commitment to quality, authenticity, and customer satisfaction. We work directly with reputable distilleries and suppliers to ensure every ingredient meets our exacting standards. Our transparent pricing, exceptional customer service, and dedication to continuous innovation have made us the preferred choice for fragrance lovers who demand nothing but the best. Our growing community of loyal customers is our greatest achievement.'
                },
                {
                  title: 'Buy Perfume Online in Pakistan – Shop From Home',
                  content: 'Shopping for luxury fragrances online has never been easier. SAFARI offers a seamless, secure e-commerce experience with detailed product descriptions, authentic customer reviews, and high-resolution imagery to help you make informed choices. Enjoy fast delivery across Pakistan, easy returns, and dedicated customer support. Browse our collections from the comfort of your home and discover your next signature scent with just a few clicks. Your perfect fragrance is waiting.'
                }
              ];
              return (
                <>
                  <div className={`relative overflow-hidden transition-all duration-500 ${storyExpanded ? 'max-h-[2000px]' : 'max-h-48'}`}>
                    <div className='space-y-8'>
                      {subsections.map((subsection, i) => (
                        <div key={i}>
                          <h4 className='text-xl md:text-2xl font-heading text-foreground mb-3'>{subsection.title}</h4>
                          <p className='text-muted-foreground text-base leading-relaxed'>{subsection.content}</p>
                        </div>
                      ))}
                    </div>
                    {!storyExpanded && (
                      <div className='absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none' />
                    )}
                  </div>
                  <div className='text-center mt-8'>
                    <button
                      onClick={() => setStoryExpanded(!storyExpanded)}
                      className='inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors'
                    >
                      {storyExpanded ? (
                        <>Read Less <svg width='16' height='16' viewBox='0 0 16 16' fill='none'><path d='M4 10l4-4 4 4' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/></svg></>
                      ) : (
                        <>Read More <svg width='16' height='16' viewBox='0 0 16 16' fill='none'><path d='M4 6l4 4 4-4' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/></svg></>
                      )}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </section>

      {/* BEST SELLERS SECTION */}
      <section className='px-6 md:px-12 py-10 md:py-14 bg-background'>
        <div className='container-custom'>
          <div className='flex items-end justify-between mb-10'>
            <div>
              <p className='text-sm tracking-[0.5em] uppercase mb-4 text-muted-foreground'>
                Most Popular
              </p>
              <h2 className='text-4xl md:text-5xl lg:text-6xl font-heading text-foreground'>
                Best Sellers
              </h2>
            </div>
            <Link
              href='/shop?filter=bestseller'
              className='hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wider'
            >
              View All →
            </Link>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {bestsellers.length > 0
              ? bestsellers.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={String(product.id)}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    originalPrice={product.originalPrice ?? undefined}
                    image={product.image}
                    images={product.images}
                    category={product.category?.name || 'Signature'}
                    isNew={product.isNew}
                    isBestseller={product.isBestseller}
                    size={product.size}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                  />
                ))
              : [...Array(4)].map((_, i) => (
                  <div key={i} className='h-[400px] rounded-lg bg-muted animate-pulse' />
                ))}
          </div>
        </div>
      </section>

      {/* BUNDLES SECTION */}
      <section id='bundles' className='px-6 md:px-12 py-14 bg-background'>
        <div className='container-custom'>
          <div className='text-center mb-10'>
            <p className='text-foreground text-sm tracking-[0.5em] uppercase mb-4'>
              Perfect Gifts
            </p>
            <h2 className='text-4xl md:text-5xl lg:text-6xl font-heading text-foreground'>
              Bundles & Gift Sets
            </h2>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {bundles.length > 0
              ? bundles.map((bundle) => (
                  <Link
                    key={bundle.id || bundle.name}
                    href={`/bundles/${bundle.slug}`}
                    className='h-full'
                  >
                    <Card className="h-full flex flex-col group hover:shadow-lg transition-all duration-300">
                      <div className='relative bg-muted overflow-hidden' style={{ height: '260px' }}>
                        {bundle.image ? (
                          <img src={bundle.image} alt={bundle.name} className='w-full h-full object-cover' />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center'>
                            <span className='text-muted-foreground text-lg'>No Image</span>
                          </div>
                        )}
                        {bundle.save && (
                          <span className="absolute top-4 right-4 bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                            SAVE {bundle.save}
                          </span>
                        )}
                      </div>
                      <CardContent className="flex-1 pt-6">
                        <h3 className='font-heading text-foreground text-lg mb-2'>{bundle.name}</h3>
                        <p className='text-muted-foreground text-sm'>
                          {bundle.description} {bundle.size && <>• {bundle.size}</>}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <div className='w-full'>
                          <p className='text-2xl font-bold text-foreground tracking-tight'>
                            ${bundle.price}
                            {bundle.originalPrice && (
                              <span className='text-sm text-muted-foreground line-through ml-2'>
                                ${bundle.originalPrice}
                              </span>
                            )}
                          </p>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))
              : [...Array(4)].map((_, i) => (
                  <div key={i} className='h-[400px] rounded-lg bg-muted animate-pulse' />
                ))}
          </div>

          <div className='text-center mt-10'>
            <Button variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground hover:text-background">
              <Link href='/bundles'>
                Explore All Bundles
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SHOP BY SCENT SECTION */}
      <section id='scent-profiles' className='px-6 md:px-12 py-14 bg-background'>
        <div className='container-custom'>
          <div className='text-center mb-10'>
            <p className='text-foreground text-sm tracking-[0.5em] uppercase mb-4'>
              Find Your Match
            </p>
            <h2 className='text-4xl md:text-5xl lg:text-6xl font-heading text-foreground'>
              Shop By Scent Profile
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12'>
            {[
              { name: 'Woody', desc: 'Warm, earthy & mysterious', image: SCENT_IMAGES.woody },
              { name: 'Fresh', desc: 'Clean, aquatic & energizing', image: SCENT_IMAGES.fresh },
              { name: 'Floral', desc: 'Romantic, delicate & elegant', image: SCENT_IMAGES.floral },
            ].map((profile) => (
              <div key={profile.name} id={profile.name.toLowerCase()}>
                <Link
                  href={`/shop?fragranceFamily=${profile.name.toLowerCase()}`}
                  className='collection-card group relative block overflow-hidden ring-offset-background hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all duration-300'
                >
                  <div className='w-full h-full'>
                    <img 
                      src={profile.image} 
                      alt={profile.name}
                      className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                    />
                  </div>
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent' />
                  <div className='absolute bottom-0 left-0 right-0 p-12 text-center'>
                    <h3 className='text-4xl md:text-5xl font-heading text-white font-bold mb-4 uppercase tracking-[0.3em]'>
                      {profile.name}
                    </h3>
                    <p className='text-white/70 text-base'>{profile.desc}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className='px-6 md:px-12 py-14 bg-muted overflow-hidden'>
        <div className='container-custom'>
          <div className='text-center mb-14'>
            <p className='text-primary text-sm tracking-[0.5em] uppercase mb-4'>
              Testimonials
            </p>
            <h2 className='text-4xl md:text-5xl lg:text-6xl font-heading text-foreground'>
              What Our <span className='text-primary'>Customers</span> Say
            </h2>
          </div>

          <div className='flex flex-wrap items-center justify-center gap-3 mb-12'>
            <div className='flex gap-0.5'>
              {[...Array(5)].map((_, i) => (
                <svg key={i} className='w-5 h-5 text-primary' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                </svg>
              ))}
            </div>
            <span className='text-lg font-bold text-foreground'>4.9/5</span>
            <span className='text-muted-foreground text-sm'>Based on 300+ reviews</span>
          </div>

          <div className='flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0'>
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.id}
                size="sm"
                className='min-w-[300px] md:min-w-[380px] flex-shrink-0 snap-start p-8 md:p-10 border-t-4 border-t-primary/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300'
              >
                <CardContent className='flex flex-col p-0'>
                  <div className='flex justify-center mb-6'>
                    <Rating rating={testimonial.rating} size="sm" />
                  </div>
                  <p className='text-muted-foreground font-serif text-base md:text-lg leading-relaxed italic text-center mb-8'>
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <div className='flex flex-col items-center mt-auto'>
                    <div className='w-14 h-14 rounded-full overflow-hidden mb-4 ring-2 ring-primary/20 flex items-center justify-center bg-primary/10 text-primary text-lg font-bold'>
                      {testimonial.name.charAt(0)}
                    </div>
                    <p className='font-semibold text-foreground text-center text-base'>
                      {testimonial.name}
                    </p>
                    <p className='text-muted-foreground text-center text-sm mt-1'>
                      {testimonial.location}
                    </p>
                    {'product' in testimonial && testimonial.product && (
                      <Link
                        href={`/shop/${'productSlug' in testimonial ? testimonial.productSlug : ''}`}
                        className='text-xs text-primary hover:underline mt-2'
                      >
                        {testimonial.product}
                      </Link>
                    )}
                    {'date' in testimonial && testimonial.date && (
                      <p className='text-xs text-muted-foreground/60 mt-1'>
                        {new Date(testimonial.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER SECTION */}
      <section className='px-6 md:px-12 py-14 bg-secondary text-secondary-foreground'>
        <div className='container-custom'>
          <div className='max-w-xl mx-auto text-center'>
            <p className='text-secondary-foreground/70 text-sm tracking-[0.5em] uppercase mb-4'>
              Stay Connected & Save
            </p>
            <h2 className='text-3xl md:text-4xl lg:text-5xl font-heading text-secondary-foreground mb-10'>
              Join Our Newsletter
            </h2>
            <p className='text-secondary-foreground/60 mb-12 max-w-md mx-auto text-lg'>
              Subscribe to receive exclusive updates & offers, and get 10% off
              your first order!
            </p>
            <form className='flex flex-col sm:flex-row gap-5 max-w-md mx-auto'>
              <Input
                type='email'
                placeholder='Enter your email'
                required
                className='flex-1 h-16 px-6 bg-background text-foreground placeholder:text-muted-foreground text-lg border-border'
                aria-label='Email address for newsletter'
              />
              <Button
                type='submit'
                className='h-16 px-12 bg-background text-foreground hover:bg-background/80 uppercase tracking-wider text-base'
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
