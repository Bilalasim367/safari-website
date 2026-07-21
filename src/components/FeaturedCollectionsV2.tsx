"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"

interface CollectionCategory {
  id: string
  name: string
  description: string
  image: string
  icon?: React.ReactNode
  subItems: { label: string; href: string }[]
  comingSoon?: boolean
}

const featuredCategories: CollectionCategory[] = [
  {
    id: "attar",
    name: "Attar Collection",
    description: "Pure, concentrated perfume oils for lasting intensity",
    image: "/Attarcollection.jpg",
    subItems: [
      { label: "Men", href: "/shop?type=attar&gender=men" },
      { label: "Women", href: "/shop?type=attar&gender=women" },
      { label: "Unisex", href: "/shop?type=attar&gender=unisex" },
    ],
  },
  {
    id: "perfume",
    name: "Perfumes Collection",
    description: "Luxury interpretations of iconic designer fragrances",
    image: "/perfume%20collection.jpg",
    subItems: [
      { label: "Men", href: "/shop?type=perfume&gender=men" },
      { label: "Women", href: "/shop?type=perfume&gender=women" },
      { label: "Unisex", href: "/shop?type=perfume&gender=unisex" },
    ],
  },
  {
    id: "our-collection",
    name: "Our Collection",
    description: "Exclusive signature blends coming soon",
    image: "/ourcollection.jpg",
    subItems: [
      { label: "Notify Me", href: "/contact?notify=our-collection" },
    ],
    comingSoon: true,
  },
]

export default function FeaturedCollections() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)

  return (
    <section className="px-6 md:px-12 py-16 md:py-20 bg-background">
      <div className="container-custom">
        <div className="text-center mb-12">
          <p className="text-gold text-sm tracking-[0.5em] uppercase mb-3">
            Featured Collections
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading text-foreground">
            Discover Our Fragrance Collection
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {featuredCategories.map((category) => (
            <article
              key={category.id}
              className="group relative overflow-hidden rounded-2xl bg-muted"
              onMouseEnter={() => !category.comingSoon && setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                  priority={category.id === "attar"}
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 via-transparent to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                  <div className="backdrop-blur-md bg-white/5 rounded-2xl p-5 md:p-6 border border-white/10 shadow-xl">
                    <h3 className="font-heading text-2xl md:text-3xl font-bold text-white drop-shadow-lg mb-2">
                      {category.name}
                    </h3>
                    <p className="text-white/80 text-sm md:text-base mb-4 max-w-xs">
                      {category.description}
                    </p>
                    
                    {!category.comingSoon ? (
                      <>
                        {hoveredCategory === category.id && (
                          <div className="space-y-2 animate-fade-in mb-3">
                            {category.subItems.map((item, index) => (
                              <Link
                                key={item.label}
                                href={item.href}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white font-medium text-sm transition-all duration-200 border border-white/20"
                                style={{ animationDelay: `${index * 50}ms` }}
                              >
                                {item.label}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                              </Link>
                            ))}
                          </div>
                        )}
                        <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-gold font-semibold text-sm uppercase tracking-[0.15em] border border-gold/30 hover:border-gold/50 transition-all duration-300 cursor-pointer">
                          Explore {category.name}
                          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                      </>
                    ) : (
                      <div className="flex flex-col items-start gap-3">
                        <span className="inline-flex items-center gap-2 px-5 py-2 bg-gold/30 backdrop-blur-md text-gold font-semibold text-sm uppercase tracking-[0.15em] rounded-full border border-gold/40 shadow-lg shadow-gold/10">
                          Coming Soon
                        </span>
                        <Link
                          href={category.subItems[0].href}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/25 backdrop-blur-md rounded-full text-white font-medium text-sm border border-white/20 transition-all duration-200"
                        >
                          Notify Me
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}