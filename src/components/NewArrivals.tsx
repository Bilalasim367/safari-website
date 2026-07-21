"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Rating } from "@/components/Rating"
import type { ProductCategory } from "@/lib/product-types"

interface NewArrivalsProps {
  products: ProductCategory[]
}

export default function NewArrivals({ products }: NewArrivalsProps) {
  const router = useRouter()
  const newArrivals = products.filter((p) => p.isNew).slice(0, 4)

  if (newArrivals.length === 0) return null

  return (
    <section className="px-6 md:px-12 py-20 md:py-28 bg-background">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="text-gold text-sm tracking-[0.5em] uppercase mb-4">
              New Arrivals
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading text-foreground">
              Fresh From Our Atelier
            </h2>
          </div>
          <Link
            href="/shop?sort=newest"
            className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors font-medium text-sm uppercase tracking-[0.1em]"
          >
            View All New Arrivals
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {newArrivals.map((product) => (
            <article
              key={product.id}
              className={cn(
                "group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl overflow-hidden"
              )}
            >
              <Link
                href={`/shop/${product.slug}`}
                className="block"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="absolute top-3 left-3 right-3 flex flex-col gap-2">
                    {product.isNew && (
                      <span className="bg-white text-black text-xs font-medium px-2 py-1 rounded-none self-start">
                        New
                      </span>
                    )}
                    {product.isBestseller && (
                      <span className="bg-gold text-black text-xs font-medium px-2 py-1 rounded-none self-start">
                        Bestseller
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        router.push(`/shop/${product.slug}`)
                      }}
                      className="inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-3 text-sm font-medium uppercase tracking-[0.1em] hover:bg-gold hover:text-white transition-all w-full"
                    >
                      Quick View
                    </button>
                  </div>
                </div>

                <div className="p-5">
<p className="text-gold text-xs uppercase tracking-[0.2em] mb-1">
                      {typeof product.category === 'string' ? product.category : product.category?.name || "Signature"}
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
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}