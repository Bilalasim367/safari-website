import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Collections | SAFARI Luxury Fragrances",
  description: "Browse our luxury fragrance collections. Discover perfumes for him, her, unisex scents, signature series, attars, and limited editions.",
  keywords: "perfume collections, luxury fragrances, men's perfume, women's perfume, unisex scents",
}

const collections = [
  {
    name: 'For Him',
    slug: 'for-him',
    desc: 'Bold, sophisticated scents crafted for the modern gentleman.',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&q=80',
    count: 24,
  },
  {
    name: 'For Her',
    slug: 'for-her',
    desc: 'Elegant, captivating fragrances that leave a lasting impression.',
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2c0ef40?w=600&q=80',
    count: 28,
  },
  {
    name: 'Unisex',
    slug: 'unisex',
    desc: 'Gender-neutral scents that transcend boundaries.',
    image: 'https://images.unsplash.com/photo-1595425970377-c9706f1dce28?w=600&q=80',
    count: 16,
  },
  {
    name: 'Signature Series',
    slug: 'signature',
    desc: 'Our most beloved and iconic fragrances.',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbab5dd54e?w=600&q=80',
    count: 12,
  },
  {
    name: 'Attars',
    slug: 'attars',
    desc: 'Pure, concentrated perfume oils for a subtle, personal scent.',
    image: 'https://images.unsplash.com/photo-1541643600914-53b636c2076a?w=600&q=80',
    count: 18,
  },
  {
    name: 'Limited Edition',
    slug: 'limited',
    desc: 'Exclusive fragrances available for a limited time.',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94933744?w=600&q=80',
    count: 8,
  },
]

export default function CollectionsPage() {
  return (
    <>
      <section className='relative h-[40vh] flex items-center justify-center overflow-hidden'>
        <div className='absolute inset-0'>
          <div className='absolute inset-0 bg-gradient-to-b from-[#0D0D0D] via-[#1A1A1A] to-[#0D0D0D]' />
        </div>
        <div className='relative z-10 text-center'>
          <h1 className='text-4xl md:text-6xl font-semibold text-white mb-4'>Collections</h1>
          <p className='text-white/60 text-lg'>
            <Link href='/' className='hover:text-white transition-colors'>Home</Link> / Collections
          </p>
        </div>
      </section>

      <section className='section-padding bg-[#0D0D0D]'>
        <div className='container-custom'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {collections.map((collection) => (
              <Link
                key={collection.slug}
                href={`/shop?collection=${collection.slug}`}
                className='group relative aspect-[3/4] rounded-2xl overflow-hidden'
              >
                <div className='absolute inset-0'>
                  {collection.image ? (
                    <>
                      <img
                        src={collection.image}
                        alt={collection.name}
                        className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/60 to-transparent' />
                    </>
                  ) : (
                    <div className='w-full h-full bg-gray-800 flex items-center justify-center'>
                      <span className='text-gray-500 text-lg'>{collection.name}</span>
                    </div>
                  )}
                </div>
                <div className='absolute inset-0 p-8 flex flex-col justify-end'>
                  <span className='text-[#C9A962] text-sm uppercase tracking-wider mb-2'>
                    {collection.count} Products
                  </span>
                  <h2 className='text-3xl font-semibold text-white mb-2'>{collection.name}</h2>
                  <p className='text-white/70'>{collection.desc}</p>
                </div>
                <div className='absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 transform translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0'>
                  <svg className='w-6 h-6 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}