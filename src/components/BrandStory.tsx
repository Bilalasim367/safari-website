"use client"

import React from "react"
import Image from "next/image"

export default function BrandStory() {
  return (
    <section className="px-4 md:px-12 py-6 md:py-28 bg-background">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center">
          {/* Mobile: Premium OUD-style banner */}
          <div className="relative md:rounded-2xl overflow-hidden -mx-4 md:mx-0">
            <div className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden md:rounded-2xl">
              <Image
                src="/safari-brand-story.png"
                alt="Safari Perfumes - Crafting luxury fragrances"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                onError={(e) => { e.currentTarget.src = '/placeholder-product.jpg'; }}
              />
            </div>
            <div className="md:absolute md:-bottom-8 md:-right-8 lg:-bottom-12 lg:-right-12 bg-white p-5 md:p-6 lg:p-8 shadow-2xl max-w-sm">
              <p className="text-gold text-xs tracking-[0.2em] uppercase mb-2">
                Since 2019
              </p>
              <h3 className="font-heading text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-1 md:mb-2">
                500+
              </h3>
              <p className="text-muted-foreground text-xs md:text-sm">
                Unique fragrance compositions crafted
              </p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto lg:mx-0 px-4 md:px-0">
            <p className="text-gold text-[10px] md:text-sm tracking-[0.2em] uppercase mb-2 md:mb-4">
              Our Story
            </p>
            <h2 className="font-heading text-2xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 md:mb-8 leading-tight">
              Crafting Scents That
              <br />
              <span className="text-gold">Tell Stories</span>
            </h2>

            <div className="space-y-4 md:space-y-6 text-base md:text-lg leading-relaxed text-muted-foreground">
              <p>
                Founded in the heart of Dubai, Safari Perfumes was born from a passion
                for the art of perfumery. Our journey began with a simple belief: that
                a fragrance should be more than a scent â€” it should be a memory, a
                moment, a signature.
              </p>
              <p>
                We source the finest ingredients from around the world â€” rare oud from
                Assam, Bulgarian roses, Madagascan vanilla, and Calabrian bergamot.
                Each bottle is a testament to our commitment to quality, authenticity,
                and the timeless art of fragrance creation.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 md:gap-6 mt-6 md:mt-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm md:text-base">Premium Ingredients</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Sourced globally</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm md:text-base">Handcrafted</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Small batches</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm md:text-base">Cruelty-Free</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Ethically made</p>
                </div>
              </div>
            </div>

            <div className="mt-6 md:mt-10 pt-6 md:pt-8 border-t border-border">
              <Link
                href="/about"
                className="inline-flex items-center justify-center w-full md:w-auto bg-gold text-black hover:bg-gold-light font-semibold text-sm uppercase tracking-[0.15em] px-8 py-4 rounded-none transition-all"
              >
                Discover Our Journey
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Link({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) {
  return <a href={href} className={className}>{children}</a>
}