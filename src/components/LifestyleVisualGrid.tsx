"use client"

import React from "react"
import Image from "next/image"

interface LifestyleImage {
  id: number
  src: string
  alt: string
  title: string
  description: string
}

const lifestyleImages: LifestyleImage[] = [
  {
    id: 1,
    src: "/sents1.png",
    alt: "Premium oud wood chips",
    title: "Rare Oud Wood",
    description: "Sourced from ancient Assam forests",
  },
  {
    id: 2,
    src: "/sents2.png",
    alt: "Fresh Bulgarian rose petals",
    title: "Bulgarian Roses",
    description: "Hand-picked at dawn for peak fragrance",
  },
  {
    id: 3,
    src: "/sents3.png",
    alt: "Mysore sandalwood heartwood",
    title: "Mysore Sandalwood",
    description: "Creamy, rich heartwood from Karnataka",
  },
  {
    id: 4,
    src: "/sents4.png",
    alt: "Golden amber resin",
    title: "Golden Amber",
    description: "Fossilized tree resin for warm depth",
  },
  {
    id: 5,
    src: "/sents5.png",
    alt: "Luxury perfume bottles on velvet",
    title: "Artisan Craftsmanship",
    description: "Each bottle filled by hand in small batches",
  },
  {
    id: 6,
    src: "/sents6.png",
    alt: "Raw ingredients on marble",
    title: "Raw Ingredients",
    description: "Nature's finest essences, unadulterated",
  },
]

export default function LifestyleVisualGrid() {
  return (
    <section className="px-6 md:px-12 py-16 md:py-20 bg-background">
      <div className="container-custom">
        <div className="text-center mb-12">
          <p className="text-gold text-sm tracking-[0.5em] uppercase mb-3">
            Lifestyle & Ingredients
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading text-foreground">
            The Art of Scent
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl mt-4 max-w-2xl mx-auto">
            From rare ingredients to artisanal craftsmanship — discover the world behind every bottle
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {lifestyleImages.map((item, index) => (
            <article
              key={item.id}
              className="group relative aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-2xl cursor-pointer"
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <div className="absolute inset-0 z-10">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20">
                <p className="text-gold text-xs tracking-[0.2em] uppercase mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  INGREDIENT STORY
                </p>
                <h3 className="font-heading text-xl md:text-2xl font-bold text-white mb-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  {item.title}
                </h3>
                <p className="text-white/80 text-sm md:text-base opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-50">
                  {item.description}
                </p>
              </div>

              <div className="absolute inset-0 bg-gradient-to-tr from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </article>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors font-medium text-sm uppercase tracking-[0.1em]"
          >
            Discover Our Philosophy
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

function Link({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) {
  return <a href={href} className={className}>{children}</a>
}