"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"

interface Collection {
  id: number
  name: string
  description: string
  image: string
  link: string
}

interface FeaturedCollectionsProps {
  collections: Collection[]
}

export default function FeaturedCollections({ collections }: FeaturedCollectionsProps) {
  return (
    <section className="px-6 md:px-12 py-20 md:py-28 bg-background">
      <div className="container-custom">
        <div className="text-center mb-16">
          <p className="text-gold text-sm tracking-[0.5em] uppercase mb-4">
            Featured Collections
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading text-foreground">
            Explore Our Curated Selections
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {collections.map((collection) => (
            <article
              key={collection.id}
              className="group relative overflow-hidden rounded-2xl"
            >
              <Link
                href={collection.link}
                className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={collection.image}
                    alt={collection.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    onError={(e) => { e.currentTarget.src = '/placeholder-product.jpg'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
                    {collection.name}
                  </h3>
                  <p className="text-white/80 text-sm md:text-base mb-4">
                    {collection.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-gold font-medium text-sm uppercase tracking-[0.1em] group-hover:gap-3 transition-gap">
                    Explore Collection
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
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}