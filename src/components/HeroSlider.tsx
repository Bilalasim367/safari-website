'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface HeroSliderProps {
  banners: string[]
  content: {
    subtitle: string
    title: string
    highlight: string
    description: string
    cta: string
  }[]
}

export default function HeroSlider({ banners, content }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [banners.length])

  return (
    <>
      <div className="absolute inset-0">
        <img 
          src={banners[currentSlide]} 
          alt="Hero banner"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

      <div className="relative z-10 text-center px-8 md:px-12 max-w-6xl mx-auto py-16 md:py-24 lg:py-32">
        <p className="text-white/90 text-sm md:text-base tracking-[0.6em] uppercase mb-12 animate-fade-in">
          {content[currentSlide].subtitle}
        </p>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-extrabold text-white mb-10 animate-fade-in tracking-tight">
          {content[currentSlide].title}
          <br />
          <span className="text-white italic pb-8 block">
            {content[currentSlide].highlight}
          </span>
        </h1>

        <p className="text-white/80 text-lg md:text-2xl font-light max-w-3xl mx-auto mb-16 animate-fade-in delay-100 leading-relaxed">
          {content[currentSlide].description}
        </p>

        <div className="animate-fade-in delay-200">
          <Button variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-black transition-all duration-300 rounded-none px-8 py-6 text-sm tracking-[0.3em] uppercase">
            <Link href="/shop">
              {content[currentSlide].cta}
            </Link>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-1 rounded-full transition-all duration-300 ${
              currentSlide === i
                ? 'bg-white w-12'
                : 'bg-white/40 w-6 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </>
  )
}
