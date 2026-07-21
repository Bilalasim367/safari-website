"use client"

import React from "react"
import Image from "next/image"

export default function BrandStory() {
  return (
    <section className="px-6 md:px-12 py-20 md:py-28 bg-background">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-2xl">
              <Image
                src="/story.png"
                alt="Safari Perfumes - Crafting luxury fragrances"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                onError={(e) => { e.currentTarget.src = '/placeholder-product.jpg'; }}
              />
            </div>
            <div className="absolute -bottom-8 -right-8 md:-bottom-12 md:-right-12 bg-white p-6 md:p-8 shadow-2xl max-w-sm">
              <p className="text-gold text-xs tracking-[0.2em] uppercase mb-2">
                Since 2019
              </p>
              <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
                500+
              </h3>
              <p className="text-muted-foreground text-sm">
                Unique fragrance compositions crafted
              </p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto lg:mx-0">
            <p className="text-gold text-sm tracking-[0.2em] uppercase mb-4">
              Our Story
            </p>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-tight">
              Crafting Scents That
              <br />
              <span className="text-gold">Tell Stories</span>
            </h2>

            <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
              <p>
                Founded in the heart of Dubai, Safari Perfumes was born from a passion
                for the art of perfumery. Our journey began with a simple belief: that
                a fragrance should be more than a scent — it should be a memory, a
                moment, a signature.
              </p>
              <p>
                We source the finest ingredients from around the world — rare oud from
                Assam, Bulgarian roses, Madagascan vanilla, and Calabrian bergamot.
                Each bottle is a testament to our commitment to quality, authenticity,
                and the timeless art of fragrance creation.
              </p>
            </div>

            <div className="flex flex-wrap gap-6 mt-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Premium Ingredients</p>
                  <p className="text-sm text-muted-foreground">Sourced globally</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Handcrafted</p>
                  <p className="text-sm text-muted-foreground">Small batches</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Cruelty-Free</p>
                  <p className="text-sm text-muted-foreground">Ethically made</p>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-border">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors font-medium text-sm uppercase tracking-[0.1em]"
              >
                Discover Our Journey
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
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