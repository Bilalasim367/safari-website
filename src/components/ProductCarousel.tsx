'use client'

import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import ProductCard from '@/components/ProductCard'

interface CarouselProduct {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  image: string
  images: string[]
  category: string
  isNew?: boolean
  isBestseller?: boolean
  size?: string
  rating?: number
  reviewCount?: number
}

interface ProductCarouselProps {
  products: CarouselProduct[]
}

export default function ProductCarousel({ products }: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: 'start', loop: true },
    [Autoplay({ delay: 4500, stopOnInteraction: false })]
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  const updateScrollSnaps = useCallback(() => {
    if (!emblaApi) return
    setScrollSnaps(emblaApi.scrollSnapList())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    emblaApi.on('reInit', updateScrollSnaps)
    const t = setTimeout(() => updateScrollSnaps(), 0)
    return () => clearTimeout(t)
  }, [emblaApi, onSelect, updateScrollSnaps])

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit()
    }
  }, [emblaApi, products])

  const resetAutoplay = useCallback(() => {
    const autoplay = emblaApi?.plugins()?.autoplay as { reset: () => void } | undefined
    if (autoplay) autoplay.reset()
  }, [emblaApi])

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev()
      resetAutoplay()
    }
  }, [emblaApi, resetAutoplay])

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext()
      resetAutoplay()
    }
  }, [emblaApi, resetAutoplay])

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index)
      resetAutoplay()
    }
  }, [emblaApi, resetAutoplay])

  const onMouseEnter = useCallback(() => {
    const autoplay = emblaApi?.plugins()?.autoplay as { stop: () => void } | undefined
    if (autoplay) autoplay.stop()
  }, [emblaApi])

  const onMouseLeave = useCallback(() => {
    const autoplay = emblaApi?.plugins()?.autoplay as { play: () => void } | undefined
    if (autoplay) autoplay.play()
  }, [emblaApi])

  if (!products.length) return null

  return (
    <div className='relative'>
      <div
        className='overflow-hidden rounded-lg'
        ref={emblaRef}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className='flex -ml-4'>
          {products.map((product) => (
            <div
              key={product.id}
              className='flex-[0_0_80%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] xl:flex-[0_0_25%] min-w-0 pl-4'
            >
              <ProductCard
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                originalPrice={product.originalPrice}
                image={product.image}
                images={product.images}
                category={product.category}
                isNew={product.isNew}
                isBestseller={product.isBestseller}
                size={product.size}
                rating={product.rating}
                reviewCount={product.reviewCount}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={scrollPrev}
        className='absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-md flex items-center justify-center hover:bg-background transition-colors'
        aria-label='Previous products'
      >
        <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
        </svg>
      </button>
      <button
        onClick={scrollNext}
        className='absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-md flex items-center justify-center hover:bg-background transition-colors'
        aria-label='Next products'
      >
        <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
        </svg>
      </button>

      <div className='flex items-center justify-center gap-2 mt-6'>
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`rounded-full transition-all duration-300 outline-none ${
              index === selectedIndex
                ? 'bg-foreground w-6 h-2.5'
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2.5 h-2.5'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
