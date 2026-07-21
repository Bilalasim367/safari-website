"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { Rating } from "@/components/Rating"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number | null | undefined
  image: string
  images: string[]
  category?: { name: string } | string | null | undefined
  isBestseller?: boolean
  isNew?: boolean
  isHotSelling?: boolean
  rating: number
  reviewCount: number
  gender?: string | null | undefined
  impressionOf?: string
}

interface HotSellingCarouselProps {
  products: Product[]
}

export default function HotSellingCarousel({ products }: HotSellingCarouselProps) {
  const hotSelling = products.filter((p) => p.isHotSelling).slice(0, 8)

  const showFallback = hotSelling.length === 0

  return (
    <section className="px-6 md:px-12 py-16 md:py-20 bg-background">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <p className="text-gold text-sm tracking-[0.5em] uppercase mb-4">
              Hot Selling
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading text-foreground">
              Trending This Week
            </h2>
          </div>
          <Link
            href="/shop?sort=hot"
            className="hidden md:inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors font-medium text-sm uppercase tracking-[0.1em]"
          >
            View All
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>

        <div className="relative">
          <div
            className="flex gap-6 lg:gap-8 overflow-x-auto snap-x scrollbar-hide pb-8 -mx-6 md:-mx-12 px-6 md:px-12"
            role="region"
            aria-label="Hot selling products carousel"
          >
            {showFallback ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={`fallback-${i}`}
                  className="flex-none w-full sm:w-[calc(50%-1.5rem)] md:w-[calc(33.333%-2rem)] lg:w-[calc(25%-2.25rem)] snap-center"
                >
                  <div className="group bg-muted rounded-xl overflow-hidden">
                    <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gold/10 to-transparent">
                        <span className="text-gold/50 text-lg">HOT</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-gold text-xs uppercase tracking-[0.2em] mb-1">Signature</p>
                      <h3 className="font-heading text-lg font-semibold text-foreground mb-2">Sample Product</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Rating rating={4.5} size="sm" color="gold" />
                        <span className="text-muted-foreground text-sm">(0)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-foreground">$99</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              hotSelling.map((product) => (
                <div
                  key={product.id}
                  className="flex-none w-full sm:w-[calc(50%-1.5rem)] md:w-[calc(33.333%-2rem)] lg:w-[calc(25%-2.25rem)] snap-center"
                >
                  <Link
                    href={`/shop/${product.slug}`}
                    className="block group"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-xl mb-4">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                          onError={(e) => { e.currentTarget.src = '/placeholder-product.jpg'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ opacity: 0.18 }}>
                            <rect x="8" y="16" width="56" height="40" rx="4" stroke="currentColor" strokeWidth="2.5" />
                            <circle cx="26" cy="30" r="5" stroke="currentColor" strokeWidth="2.5" />
                            <path d="M8 46 L22 34 L32 44 L44 30 L64 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                      {(product.isHotSelling || product.isBestseller || product.isNew) && (
                        <div className="absolute top-3 left-3 flex gap-2">
                          {product.isHotSelling && (
                            <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-none">
                              Hot
                            </span>
                          )}
                          {product.isBestseller && (
                            <span className="bg-gold text-black text-xs font-medium px-2 py-1 rounded-none">
                              Bestseller
                            </span>
                          )}
                          {product.isNew && (
                            <span className="bg-white text-black text-xs font-medium px-2 py-1 rounded-none">
                              New
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-gold text-xs tracking-[0.1em] uppercase">
                        {typeof product.category === 'string' ? product.category : product.category?.name || "Signature"}
                      </p>
                      <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-gold transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Rating rating={product.rating} size="sm" color="gold" />
                        <span className="text-muted-foreground text-sm">({product.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-foreground">
                          ${product.price}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-muted-foreground line-through text-lg">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-center gap-2 mt-6" role="tablist" aria-label="Hot selling pagination">
            {showFallback ? (
              Array.from({ length: 4 }).map((_, i) => (
                <button
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${i === 0 ? "bg-gold w-6" : "bg-white/30 hover:bg-white/50"}`}
                  role="tab"
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))
            ) : (
              hotSelling.slice(0, 8).map((_, i) => (
                <button
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${i === 0 ? "bg-gold w-6" : "bg-white/30 hover:bg-white/50"}`}
                  role="tab"
                  aria-label={`Go to product ${i + 1}`}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}