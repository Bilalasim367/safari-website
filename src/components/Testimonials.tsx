"use client"

import React from "react"
import Link from "next/link"
import { Rating } from "@/components/Rating"
import {
  DEFAULT_TESTIMONIALS,
  safeHref,
  type TestimonialsConfig,
} from "@/lib/homepage-content"

interface TestimonialsProps {
  content?: TestimonialsConfig
}

export default function Testimonials({ content = DEFAULT_TESTIMONIALS }: TestimonialsProps) {
  const items = content.items?.length ? content.items : DEFAULT_TESTIMONIALS.items

  return (
    <section className="px-4 md:px-12 py-6 md:py-28 bg-[#0d0d0d]">
      <div className="container-custom">
        <div className="text-center mb-6 md:mb-16">
          <p className="text-gold text-[10px] md:text-sm tracking-[0.5em] uppercase mb-1 md:mb-4">
            {content.eyebrow}
          </p>
          <h2 className="text-2xl md:text-5xl lg:text-6xl font-heading bg-gradient-to-r from-[#e7d8b5] via-[#B6965D] to-[#8f7442] bg-clip-text text-transparent">
            {content.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((testimonial) => (
            <article
              key={`${testimonial.name}-${testimonial.product}`}
              className="bg-[#161616] border border-[#B6965D]/20 rounded-xl p-6 md:p-7 transition-all duration-300 hover:border-[#B6965D]/50"
            >
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <Rating rating={testimonial.rating} size="sm" color="gold" />
              </div>

              <blockquote className="text-[#f5f0e8] text-sm md:text-base leading-relaxed mb-4 md:mb-6 line-clamp-4 md:line-clamp-none">
                &ldquo;{testimonial.text}&rdquo;
              </blockquote>

              <div className="border-t border-[#B6965D]/15 pt-4 md:pt-5">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#B6965D]/10 flex items-center justify-center shrink-0">
                    <span className="text-[#B6965D] font-heading font-medium text-base md:text-lg">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-[#B6965D] text-sm">{testimonial.name}</p>
                    <p className="text-xs md:text-sm text-[#9a958d]">{testimonial.location}</p>
                  </div>
                </div>
                <p className="text-[#B6965D] text-xs md:text-sm mt-2 md:mt-3 font-medium">
                  {testimonial.product}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-6 md:mt-12">
          <Link
            href={safeHref(content.viewAllHref, "/shop#reviews")}
            className="inline-flex items-center gap-2 text-[#B6965D] hover:text-[#c9a873] transition-colors font-medium text-sm"
          >
            {content.viewAllLabel}
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
