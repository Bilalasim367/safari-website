"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { Rating } from "@/components/Rating"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  image: string
  images: string[]
  category?: string
  isBestseller?: boolean
  isNew?: boolean
  isHotSelling?: boolean
  isTrending?: boolean
  rating: number
  reviewCount: number
  gender?: string
  impressionOf?: string
}

interface HotSellingProductsProps {
  products: Product[]
}

export default function HotSellingProducts({ products }: HotSellingProductsProps) {
  const hotProducts = products.filter((p) => p.isHotSelling).slice(0, 8)

  if (hotProducts.length === 0) return null

  return (
    <section className="px-6 md:px-12 py-16 md:py-20 bg-background">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
          <div>
            <p className="text-gold text-sm tracking-[0.5em] uppercase mb-3">
              Hot Selling
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading text-foreground">
              Hot Selling Products
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
            className="flex gap-6 lg:gap-8 overflow-x-auto snap-x scrollbar-hide pb-6 -mx-6 md:-mx-12 px-6 md:px-12"
            role="region"
            aria-label="Hot selling products carousel"
          >
            {hotProducts.map((product) => (
              <div
                key={product.id}
                className="flex-none w-full sm:w-[calc(50%-1.5rem)] md:w-[calc(33.333%-2rem)] lg:w-[calc(25%-2.25rem)] snap-center"
              >
                <Link
                  href={`/shop/${product.slug}`}
                  className={cn(
                    "block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl overflow-hidden"
                  )}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
                    {(product.isBestseller || product.isNew || product.isHotSelling) && (
                      <div className="absolute top-3 left-3 flex gap-2">
                        {product.isHotSelling && (
                          <span className="bg-gold text-black text-xs font-medium px-2 py-1 rounded-none">
                            Hot Selling
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

                  <div className="p-5">
                    <p className="text-gold text-xs uppercase tracking-[0.2em] mb-1">
                      {product.category || "Signature"}
                    </p>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-2 group-hover:text-gold transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
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
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-4" role="tablist" aria-label="Hot selling pagination">
            {hotProducts.slice(0, 8).map((_, i) => (
              <button
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${i === 0 ? "bg-gold w-6" : "bg-white/30 hover:bg-white/50"}`}
                role="tab"
                aria-label={`Go to product ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}