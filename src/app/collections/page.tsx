import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Coming Soon | SAFARI Luxury Fragrances",
  description: "Our exclusive signature collection is being crafted with the finest ingredients.",
}

export default function CollectionsPage() {
  return (
    <section className='relative min-h-[70vh] flex items-center justify-center overflow-hidden'>
      <div className='absolute inset-0 bg-gradient-to-b from-background via-card to-background' />
      <div className='relative z-10 text-center max-w-2xl px-4'>
        <p className='text-foreground text-sm tracking-[0.5em] uppercase mb-6'>
          Our Collection
        </p>
        <h1 className='text-5xl md:text-7xl font-serif text-foreground mb-6'>
          Coming Soon
        </h1>
        <p className='text-lg md:text-xl text-muted-foreground mb-4'>
          Our exclusive signature collection is being crafted with the finest ingredients
          and meticulous attention to detail.
        </p>
        <div className='w-16 h-0.5 bg-gold/50 mx-auto my-8' />
        <p className='text-muted-foreground/70'>
          Stay tuned for an extraordinary olfactory experience.
        </p>
        <Link
          href='/shop'
          className='inline-block mt-10 px-8 py-3 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity text-sm font-medium'
        >
          Browse Our Collections
        </Link>
      </div>
    </section>
  )
}
