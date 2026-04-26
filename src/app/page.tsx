import React from 'react'
import Link from 'next/link'
import prisma from '@/lib/postgres'
import HeroSlider from '@/components/HeroSlider'

export const revalidate = 300
export const dynamic = 'force-dynamic'

const HERO_BANNERS = [
  '/banner1.jpg',
  '/banner2.jpg',
  '/banner3.jpg',
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

async function getProducts() {
  try {
    const [bestsellers, newArrivals] = await Promise.all([
      prisma.product.findMany({
        where: { isBestseller: true },
        take: 4,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.findMany({
        where: { isNew: true },
        take: 4,
        orderBy: { createdAt: 'desc' },
      }),
    ])
    
    return {
      bestsellers: bestsellers.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        originalPrice: p.originalPrice,
        image: p.image || '',
        category: { name: p.categorySlug || 'Signature' },
        description: p.description,
        isBestseller: p.isBestseller,
        isNew: p.isNew,
        size: p.size || '50ml',
      })),
      newArrivals: newArrivals.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        originalPrice: p.originalPrice,
        image: p.image || '',
        category: { name: p.categorySlug || 'Signature' },
        description: p.description,
        isBestseller: p.isBestseller,
        isNew: p.isNew,
        size: p.size || '50ml',
      })),
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { bestsellers: [], newArrivals: [] }
  }
}

export default async function Home() {
  const { bestsellers, newArrivals } = await getProducts()

  return (
    <>
      {/* HERO SECTION */}
      <section className='relative min-h-[90vh] flex items-center justify-center overflow-hidden'>
        <HeroSlider banners={HERO_BANNERS} content={HERO_CONTENT} />
      </section>

      {/* TRUST & VALUE SECTION */}
      <section
        className='px-6 md:px-12 py-16 md:py-24'
        style={{ backgroundColor: '#F5F5F0' }}
      >
        <div className='container-custom'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-14 lg:gap-16'>
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
              <div
                key={i}
                className='group flex flex-col items-center text-center'
              >
                <div className='trust-icon mb-8'>
                  <svg
                    className='w-8 h-8 text-black'
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
                <h3 className='text-lg font-semibold text-black mb-3'>
                  {item.title}
                </h3>
                <p className='text-gray-600 text-base'>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS SECTION */}
      <section className="px-6 md:px-12 py-16 md:py-24 bg-white">
        <div className='container-custom'>
          <div className='text-center mb-20'>
            <p
              className='text-black text-sm tracking-[0.5em] uppercase mb-5'
              style={{ paddingBottom: '10px' }}
            >
              Discover
            </p>
            <h2 className='text-4xl md:text-5xl lg:text-6xl font-serif text-black'>
              New Arrivals
            </h2>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 lg:gap-14 pt-16 pb-12'>
            {newArrivals.length > 0
              ? newArrivals.map((product, i) => (
                  <Link
                    key={product.id}
                    href={`/shop/${product.slug}`}
                    className='product-card group fade-up'
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className='image-wrapper'>
                      {product.image ? (
                        <img 
                          src={product.image}
                          alt={product.name}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center'>
                          <span className='text-gray-400 text-lg'>[PRODUCT IMAGE]</span>
                        </div>
                      )}
                      {product.isNew && <span className='badge'>NEW</span>}
                    </div>
                    <div className='info'>
                      <p className='category'>
                        {product.category?.name || 'Signature'}
                      </p>
                      <h3 className='name'>{product.name}</h3>
                      <p className='description'>
                        {product.size || '30ml'} •{' '}
                        {product.description?.split(',')[0] ||
                          'Exquisite scent'}
                      </p>
                      <p className='price'>
                        ${product.price}
                        {product.originalPrice && (
                          <span className='original-price'>
                            ${product.originalPrice}
                          </span>
                        )}
                      </p>
                    </div>
                  </Link>
                ))
              : [...Array(4)].map((_, i) => (
                  <div key={i} className='product-card'>
                    <div className='image-wrapper'>
                      <div className='w-full h-full bg-gray-100 flex items-center justify-center'>
                        <span className='text-gray-400 text-lg'>
                          [PRODUCT IMAGE]
                        </span>
                      </div>
                    </div>
                    <div className='info'>
                      <p className='category'>Signature</p>
                      <h3 className='name'>Coming Soon</h3>
                      <p className='price'>$0</p>
                    </div>
                  </div>
                ))}
          </div>

          <div className='text-center mt-20'>
            <Link href='/shop?filter=new' className='btn-outline'>
              Explore All Products
            </Link>
          </div>
        </div>
      </section>

      {/* COLLECTIONS SECTION */}
      <section className="px-6 md:px-12 py-16 md:py-24 bg-white">
        <div className='container-custom'>
          <div className='text-center mb-20'>
            <p className='text-black text-sm tracking-[0.5em] uppercase mb-5'>
              Browse
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-black pb-16">
              Explore Our Collections
            </h2>
          </div>

          <div
            className='grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12'
            style={{ paddingBottom: '80px' }}
          >
            {[
              { name: 'Men', slug: 'men', desc: 'Bold & distinctive', image: COLLECTION_IMAGES.men },
              { name: 'Women', slug: 'women', desc: 'Elegant & enchanting', image: COLLECTION_IMAGES.women },
              { name: 'Unisex', slug: 'unisex', desc: 'For everyone', image: COLLECTION_IMAGES.unisex },
            ].map((cat, i) => (
              <Link
                key={cat.name}
                href={`/shop?category=${cat.slug}`}
                className='collection-card group'
              >
                <div className='w-full h-full'>
                  <img 
                    src={cat.image} 
                    alt={cat.name}
                    className='w-full h-full object-cover'
                  />
                </div>
                <div className='overlay' />
                <div className='absolute bottom-0 left-0 right-0 p-12 text-center'>
                  <h3 className='text-3xl md:text-4xl font-serif text-white font-bold mb-4 tracking-wider'>
                    {cat.name}
                  </h3>
                  <p className='text-white/60 text-base mb-6'>{cat.desc}</p>
                  <span className='inline-block text-sm tracking-[0.25em] uppercase text-white opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500'>
                    Shop Now →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* OUR STORY SECTION */}
      <section
        className='px-6 md:px-12 py-24'
        style={{ paddingTop: '120px', paddingBottom: '120px', backgroundColor: '#F5F5F0' }}
      >
        <div className='container-custom'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 items-center'>
            <div>
              <p className='text-black text-sm tracking-[0.5em] uppercase mb-5'>
                About Us
              </p>
              <h2
                className='text-4xl md:text-5xl lg:text-6xl font-serif text-black mb-12'
                style={{ paddingBottom: '30px' }}
              >
                Our Story
              </h2>

              <p className='text-gray-600 text-lg md:text-xl leading-relaxed mb-8'>
                SAFARI is a luxury fragrance house dedicated to creating
                exceptional scents that capture the essence of sophistication
                and elegance. Our perfumes are crafted with the finest
                ingredients from around the world, each bottle telling a unique
                story of craftsmanship and passion.
              </p>
              <p
                className='text-gray-600 text-lg md:text-xl leading-relaxed mb-14'
                style={{ paddingBottom: '30px' }}
              >
                Founded with a vision to bring the art of perfumery to
                discerning customers, we continue to innovate and inspire
                through our collections. Every SAFARI fragrance is a
                masterpiece, designed to leave a lasting impression.
              </p>

              <Link href='/about' className='btn-outline'>
                Read More
              </Link>
            </div>

            <div className='relative aspect-[4/5] shadow-2xl bg-gray-200 rounded-lg overflow-hidden mt-12 lg:mt-0'>
              <img 
                src='/story.png' 
                alt="Our Story"
                className='w-full h-full object-cover'
              />
            </div>
          </div>
        </div>
      </section>

      {/* BEST SELLERS SECTION */}
      <section
        className='px-6 md:px-12 py-24 bg-white'
        style={{ paddingTop: '120px', paddingBottom: '60px' }}
      >
        <div className='container-custom'>
          <div className='flex items-end justify-between mb-20'>
            <div>
              <p className='text-black text-sm tracking-[0.5em] uppercase mb-5'>
                Most Popular
              </p>
              <h2
                className='text-4xl md:text-5xl lg:text-6xl font-serif text-black'
                style={{ paddingBottom: '60px' }}
              >
                Best Sellers
              </h2>
            </div>
            <Link
              href='/shop?filter=bestseller'
              className='hidden md:block text-base text-gray-600 hover:text-black transition-colors tracking-wider'
            >
              View All →
            </Link>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 lg:gap-14'>
            {bestsellers.length > 0
              ? bestsellers.map((product, i) => (
                  <Link
                    key={product.id}
                    href={`/shop/${product.slug}`}
                    className='product-card group fade-up'
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className='image-wrapper'>
                      {product.image ? (
                        <img 
                          src={product.image}
                          alt={product.name}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center'>
                          <span className='text-gray-400 text-lg'>[PRODUCT IMAGE]</span>
                        </div>
                      )}
                      <span className='badge'>BESTSELLER</span>
                    </div>
                    <div className='info'>
                      <p className='category'>
                        {product.category?.name || 'Signature'}
                      </p>
                      <h3 className='name'>{product.name}</h3>
                      <p className='description'>
                        {product.size || '30ml'} •{' '}
                        {product.description?.split(',')[0] ||
                          'Exquisite scent'}
                      </p>
                      <p className='price'>{product.price}</p>
                    </div>
                  </Link>
                ))
              : [...Array(4)].map((_, i) => (
                  <div key={i} className='product-card'>
                    <div className='image-wrapper'>
                      <div className='w-full h-full bg-gray-100 flex items-center justify-center'>
                        <span className='text-gray-400 text-lg'>
                          [PRODUCT IMAGE]
                        </span>
                      </div>
                    </div>
                    <div className='info'>
                      <p className='category'>Signature</p>
                      <h3 className='name'>Coming Soon</h3>
                      <p className='price'>$0</p>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* BUNDLES SECTION */}
      <section
        className='px-6 md:px-12 py-24'
        style={{ paddingTop: '80px', paddingBottom: '80px', backgroundColor: '#F5F5F0' }}
      >
        <div className='container-custom'>
          <div className='text-center mb-20'>
            <p className='text-black text-sm tracking-[0.5em] uppercase mb-5'>
              Perfect Gifts
            </p>
            <h2
              className='text-4xl md:text-5xl lg:text-6xl font-serif text-black'
              style={{ paddingBottom: '60px' }}
            >
              Bundles & Gift Sets
            </h2>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 lg:gap-14'>
            {[
              {
                name: 'Signature Trio',
                desc: 'Three distinct fragrances',
                size: '3 x 30ml',
                price: 199,
                originalPrice: 279,
                save: '28%',
              },
              {
                name: 'Couple Set',
                desc: 'For him & her',
                size: '2 x 50ml',
                price: 249,
                originalPrice: 349,
                save: '29%',
              },
              {
                name: 'Luxury Collection',
                desc: 'Premium selection',
                size: '5 x 50ml',
                price: 399,
                originalPrice: 599,
                save: '33%',
              },
              {
                name: 'Travel Essentials',
                desc: 'On-the-go luxury',
                size: '4 x 10ml',
                price: 129,
                originalPrice: 179,
                save: '28%',
              },
            ].map((bundle, i) => (
              <Link
                key={bundle.name}
                href='/shop?filter=bundles'
                className='product-card group fade-up'
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className='image-wrapper bg-gray-100 flex items-center justify-center'>
                  <span className='text-gray-400 text-lg'>[BUNDLE IMAGE]</span>
                  <span className='badge save absolute top-4 right-4'>
                    SAVE {bundle.save}
                  </span>
                </div>
                <div className='info'>
                  <h3 className='name'>{bundle.name}</h3>
                  <p className='description'>
                    {bundle.desc} • {bundle.size}
                  </p>
                  <p className='price'>
                    ${bundle.price}
                    <span className='original-price'>
                      ${bundle.originalPrice}
                    </span>
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className='text-center mt-20' style={{ paddingTop: '60px' }}>
            <Link href='/shop?filter=bundles' className='btn-outline'>
              Explore All Bundles
            </Link>
          </div>
        </div>
      </section>

      {/* SHOP BY SCENT SECTION */}
      <section
        className='px-6 md:px-12 py-24 bg-white'
        style={{ paddingTop: '80px', paddingBottom: '80px' }}
      >
        <div className='container-custom'>
          <div className='text-center mb-20'>
            <p className='text-black text-sm tracking-[0.5em] uppercase mb-5'>
              Find Your Match
            </p>
            <h2
              className='text-4xl md:text-5xl lg:text-6xl font-serif text-black'
              style={{ paddingBottom: '60px' }}
            >
              Shop By Scent Profile
            </h2>
          </div>

          <div
            className='grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12'
            style={{ paddingBottom: '20px' }}
          >
            {[
              { name: 'Woody', desc: 'Warm, earthy & mysterious', image: SCENT_IMAGES.woody },
              { name: 'Fresh', desc: 'Clean, aquatic & energizing', image: SCENT_IMAGES.fresh },
              { name: 'Floral', desc: 'Romantic, delicate & elegant', image: SCENT_IMAGES.floral },
            ].map((profile, i) => (
              <Link
                key={profile.name}
                href={`/shop?fragranceFamily=${profile.name.toLowerCase()}`}
                className='collection-card group'
              >
                <div className='w-full h-full'>
                  <img 
                    src={profile.image} 
                    alt={profile.name}
                    className='w-full h-full object-cover'
                  />
                </div>
                <div className='overlay' />
                <div className='absolute bottom-0 left-0 right-0 p-12 text-center'>
                  <h3 className='text-4xl md:text-5xl font-serif text-white font-bold mb-4'>
                    {profile.name}
                  </h3>
                  <p className='text-white/70 text-base'>{profile.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section
        className='px-6 md:px-12 py-24'
        style={{ paddingTop: '120px', paddingBottom: '120px', backgroundColor: '#F5F5F0' }}
      >
        <div className='container-custom'>
          <div className='text-center mb-20'>
            <p className='text-black text-sm tracking-[0.5em] uppercase mb-5'>
              Testimonials
            </p>
            <h2
              className='text-4xl md:text-5xl lg:text-6xl font-serif text-black'
              style={{ paddingBottom: '40px' }}
            >
              What Our Customers Say
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12'>
            {[
              {
                name: 'Sarah M.',
                text: 'Absolutely love my purchase! The fragrance is long-lasting and luxurious. Highly recommended!',
                product: 'Signature Scent',
              },
              {
                name: 'James K.',
                text: 'SAFARI perfumes are truly exceptional. Great quality and beautiful packaging. Will definitely order again.',
                product: 'Noir Edition',
              },
              {
                name: 'Emma R.',
                text: "Perfect gift for my husband. He's received so many compliments! The scent is just divine.",
                product: 'Couple Set',
              },
            ].map((testimonial, i) => (
              <div key={i} className='testimonial-card p-10 md:p-12'>
                <div className='flex justify-center gap-1 mb-8'>
                  {[...Array(5)].map((_, s) => (
                    <svg
                      key={s}
                      className='w-6 h-6 text-black'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                  ))}
                </div>
                <p className='text-gray-600 font-serif text-lg leading-relaxed italic text-center mb-8'>
                  "{testimonial.text}"
                </p>
                <p className='font-semibold text-gray-800 text-center text-lg'>
                  {testimonial.name}
                </p>
                <p className='text-gray-500 text-center mt-3'>
                  {testimonial.product}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER SECTION */}
      <section
        className='px-6 md:px-12 py-24 bg-black'
        style={{ paddingTop: '80px', paddingBottom: '80px' }}
      >
        <div className='container-custom'>
          <div className='max-w-xl mx-auto text-center'>
            <p
              className='text-white text-sm tracking-[0.5em] uppercase mb-5'
              style={{ paddingBottom: '20px' }}
            >
              Stay Connected & Save
            </p>
            <h2
              className='text-3xl md:text-4xl lg:text-5xl font-serif text-white mb-10'
              style={{ paddingBottom: '20px' }}
            >
              Join Our Newsletter
            </h2>
            <p
              className='text-gray-400 mb-12 max-w-md mx-auto text-lg'
              style={{ paddingBottom: '20px' }}
            >
              Subscribe to receive exclusive updates & offers, and get 10% off
              your first order!
            </p>
            <form className='flex flex-col sm:flex-row gap-5 max-w-md mx-auto'>
              <input
                type='email'
                placeholder='Enter your email'
                required
                className='flex-1 h-16 px-6 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors text-lg'
                aria-label='Email address for newsletter'
              />
              <button
                type='submit'
                className='h-16 px-12 bg-white text-black font-semibold uppercase tracking-wider hover:bg-gray-200 transition-colors text-base'
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}