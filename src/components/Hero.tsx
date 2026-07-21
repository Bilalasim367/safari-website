"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/banner1.png"
          alt="Safari Perfumes - Luxury fragrances"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          onError={(e) => { e.currentTarget.src = '/placeholder-product.jpg'; }}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 z-10" />

      <div className="relative z-20 text-center px-6 md:px-12 py-16 md:py-24 lg:py-32 max-w-6xl mx-auto">
        <p className="text-white/90 text-sm md:text-base tracking-[0.6em] uppercase mb-8 animate-fade-in">
          Luxury Fragrance House
        </p>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-extrabold text-white mb-10 animate-fade-in tracking-tight leading-tight">
          Discover Your
          <br />
          <span className="text-white italic block pb-8">
            Signature Scent
          </span>
        </h1>

        <p className="text-white/80 text-lg md:text-2xl font-light max-w-3xl mx-auto mb-16 animate-fade-in delay-100 leading-relaxed">
          Crafted with passion, designed to captivate your senses. Explore our
          exclusive range of captivating fragrances.
        </p>

        <div className="animate-fade-in delay-200 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/shop">
            <Button
              variant="outline"
              className={cn(
                "border-white text-white bg-transparent hover:bg-white hover:text-black",
                "transition-all duration-300 rounded-none px-8 py-6 text-sm tracking-[0.3em] uppercase"
              )}
            >
              Shop Now
            </Button>
          </Link>
          <Link href="/about">
            <Button
              variant="ghost"
              className={cn(
                "border-white/30 text-white hover:bg-white/10 hover:border-white",
                "transition-all duration-300 rounded-none px-8 py-6 text-sm tracking-[0.3em] uppercase"
              )}
            >
              Our Story
            </Button>
          </Link>
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        <div className="w-1 h-1 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-1 h-1 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-1 h-1 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </section>
  )
}