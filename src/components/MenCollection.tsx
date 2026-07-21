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
  isTrending?: boolean
  rating: number
  reviewCount: number
  gender?: string | null | undefined
  impressionOf?: string
}

interface GenderCollectionProps {
  products: Product[]
  title: string
  gender: string
}

export default function GenderCollection({ products, title, gender }: GenderCollectionProps) {
  const filteredProducts = products
    .filter((p) => p.gender?.toLowerCase() === gender.toLowerCase())
    .slice(0, 8)

  // Show fallback UI when no products found
  if (filteredProducts.length === 0) {
    return (
      <section className="px-6 md:px-12 py-16 md:py-20 bg-background">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <p className="text-gold text-sm tracking-[0.5em] uppercase mb-4">
                {gender} Collection
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading text-foreground">
                {title}
              </h2>
            </div>
          </div>

          {/* Fallback placeholder cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <article
                key={i}
                className="rounded-xl overflow-hidden bg-muted/50 animate-pulse"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-gold text-xs uppercase tracking-[0.2em] mb-1">
                    Signature
                  </p>
                  <h3 className="font-heading text-lg font-semibold text-foreground/30 mb-2">
                    Product Name
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Rating rating={0} size="sm" color="gold" />
                    <span className="text-muted-foreground text-sm">(0)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-foreground/30">
                      $0.00
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href={`/shop?gender=${gender.toLowerCase()}&sort=trending`}
              className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors font-medium text-sm uppercase tracking-[0.1em]"
            >
              View All {gender}
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
        </div>
      </section>
    )
  }

  return (
    <section className="px-6 md:px-12 py-16 md:py-20 bg-background">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <p className="text-gold text-sm tracking-[0.5em] uppercase mb-4">
              {gender} Collection
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading text-foreground">
              {title}
            </h2>
          </div>
          <Link
            href={`/shop?gender=${gender.toLowerCase()}&sort=trending`}
            className="hidden md:inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors font-medium text-sm uppercase tracking-[0.1em]"
          >
            View All {gender}
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
            aria-label={`${gender} products carousel`}
          >
            {filteredProducts.map((product) => (
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
                    {(product.isTrending || product.isBestseller || product.isNew) && (
                      <div className="absolute top-3 left-3 flex gap-2">
                        {product.isTrending && (
                          <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-none">Trending</span>
                        )}
                        {product.isBestseller && (
                          <span className="bg-gold text-black text-xs font-medium px-2 py-1 rounded-none">Bestseller</span>
                        )}
                        {product.isNew && (
                          <span className="bg-white text-black text-xs font-medium px-2 py-1 rounded-none">New</span>
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
            ))}
          </div>
        </div>

        <div className="text-center mt-10">
          <Link
            href={`/shop?gender=${gender.toLowerCase()}&sort=trending`}
            className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors font-medium text-sm uppercase tracking-[0.1em]"
          >
            View All {gender}
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
      </div>
    </section>
  )
}