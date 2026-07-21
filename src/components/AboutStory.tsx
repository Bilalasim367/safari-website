"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"

export default function AboutStory() {
  return (
    <section className="px-6 md:px-12 py-20 md:py-28 bg-background">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative aspect-[4/5] lg:aspect-[3/4] overflow-hidden rounded-2xl">
            <Image
              src="/story.png"
              alt="Safari Perfumes - Our Story"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-gold/10 to-transparent" />
          </div>

          <div className="space-y-8">
            <div className="max-w-xl">
              <p className="text-gold text-sm tracking-[0.5em] uppercase mb-4">
                Our Story
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading text-foreground mb-6">
                Crafting Scents That
                <br />
                <span className="text-gold italic">Tell Your Story</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Founded in 2018, Safari Perfumes was born from a passion for
                the extraordinary. We believe that fragrance is the invisible
                accessory that completes your presence — a silent storyteller
                that lingers long after you&rsquo;ve left the room.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Every bottle in our collection begins with the finest raw
                materials sourced from around the world: Oud from the ancient
                forests of Assam, Rose from the valleys of Bulgaria, Sandalwood
                from Mysore. Our master perfumers blend these treasures with
                precision and patience, creating compositions that evolve
                beautifully on your skin.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors font-medium text-sm uppercase tracking-[0.1em]"
              >
                Discover Our Journey
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

            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-border">
              <div>
                <p className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                  50+
                </p>
                <p className="text-muted-foreground text-sm uppercase tracking-wide">
                  Exclusive Fragrances
                </p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                  15+
                </p>
                <p className="text-muted-foreground text-sm uppercase tracking-wide">
                  Countries Sourced From
                </p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                  100%
                </p>
                <p className="text-muted-foreground text-sm uppercase tracking-wide">
                  Authentic Ingredients
                </p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                  10K+
                </p>
                <p className="text-muted-foreground text-sm uppercase tracking-wide">
                  Satisfied Customers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}