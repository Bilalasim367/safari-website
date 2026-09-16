"use client"

import React from "react"
import Link from "next/link"

export default function LifestyleBanner() {
  return (
    <section
      className="lifestyle-banner relative flex items-center"
      aria-label="Lifestyle banner"
    >
      <div className="pointer-events-none absolute inset-0 bg-black/60" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1280px] items-center px-5 md:px-10 lg:px-12">
        <div className="flex w-full flex-col items-center text-center md:items-start md:text-left">
          <span className="lifestyle-eyebrow">The Art of Fragrance</span>
          <h2 className="lifestyle-title mt-2 md:mt-3">Crafted for Every Occasion</h2>
          <p className="lifestyle-subtitle mt-1.5 md:mt-2">From timeless classics to bold signatures</p>
          <Link href="/shop" className="lifestyle-btn mt-5 md:mt-6">
            Explore All
          </Link>
        </div>
      </div>
    </section>
  )
}