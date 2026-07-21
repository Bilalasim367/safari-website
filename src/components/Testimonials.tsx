"use client"

import React from "react"
import Link from "next/link"
import { Rating } from "@/components/Rating"
import { cn } from "@/lib/utils"

interface Testimonial {
  id: string
  name: string
  location: string
  rating: number
  text: string
  product: string
  avatar?: string
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Ahmed Hassan",
    location: "Karachi, Pakistan",
    rating: 5,
    text: "Safari Midnight has become my signature scent. The oud and amber blend is absolutely mesmerizing — I get compliments every single time I wear it. The longevity is incredible, lasting 12+ hours on my skin.",
    product: "Safari Midnight",
  },
  {
    id: "2",
    name: "Fatima Ali",
    location: "Lahore, Pakistan",
    rating: 5,
    text: "I was skeptical about buying perfume online, but the Discovery Set changed everything. Being able to sample before committing to a full bottle is brilliant. Safari Oud is now my go-to for evening events — sophisticated and unforgettable.",
    product: "Safari Oud",
  },
  {
    id: "3",
    name: "Muhammad Usman",
    location: "Islamabad, Pakistan",
    rating: 5,
    text: "The Attar collection is pure luxury in a bottle. I've never experienced such concentrated, long-lasting fragrance oils. A single drop of Safari Rose Attar stays with me all day. The packaging is also exquisite — makes gifting effortless.",
    product: "Safari Rose Attar",
  },
]

export default function Testimonials() {
  return (
    <section className="px-6 md:px-12 py-20 md:py-28 bg-muted/30">
      <div className="container-custom">
        <div className="text-center mb-16">
          <p className="text-gold text-sm tracking-[0.5em] uppercase mb-4">
            Testimonials
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading text-foreground">
            Loved by Fragrance Connoisseurs
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.id}
              className={cn(
                "relative bg-background border border-border rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:border-gold/30"
              )}
            >
              <div className="flex items-center gap-2 mb-6">
                <Rating rating={testimonial.rating} size="sm" color="gold" />
              </div>

              <blockquote className="text-foreground/90 text-base leading-relaxed mb-6">
                &ldquo;{testimonial.text}&rdquo;
              </blockquote>

              <div className="border-t border-border pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                    <span className="text-gold font-heading font-medium text-lg">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
                <p className="text-gold text-sm mt-3 font-medium">{testimonial.product}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/shop#reviews"
            className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors font-medium text-sm"
          >
            Read All Reviews
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