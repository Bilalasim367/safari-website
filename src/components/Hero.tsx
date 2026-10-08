"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Banknote, Clock, Shield, ShoppingBag, Star, Truck } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-hero",
  display: "swap",
})

/* ------------------------------------------------------------------ */
/* Editable content — tweak copy, links and trust numbers here only.   */
/* ------------------------------------------------------------------ */

const HEADING_LINE_1 = "Inspired Fragrances,"
const HEADING_LINE_2 = "Affordable Luxury"

const DESCRIPTION =
  "Premium quality perfumes at unbeatable prices. Long-lasting impressions that turn heads."

const SHOP_HREF = "/shop"
const BUNDLES_HREF = "/bundles"

const FEATURES: { icon: LucideIcon; label: string }[] = [
  { icon: Shield, label: "Alcohol-Free" },
  { icon: Clock, label: "Long Lasting" },
  { icon: Banknote, label: "Cash on Delivery" },
  { icon: Truck, label: "Free Shipping" },
]

const TRUST = {
  rating: "4.8/5",
  reviews: "350+ Reviews",
  customers: "2,000+",
  customersLabel: "Happy Customers",
}

/** Card background photo — swap this path for any shot in /public (square or landscape). */
const HERO_IMAGE = {
  src: "/new-banneri.webp",
  alt: "Premium perfume collection",
}

const sharedFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C98A00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFBEB]"

const enter = (delay: number) => ({
  animationDelay: `${delay}ms`,
})

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className={cn(
        jakarta.variable,
        "relative -mt-20 overflow-hidden bg-[#FFFBEB] py-12 md:-mt-28 md:py-20",
        "animate-fade-in motion-reduce:animate-none"
      )}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* ---------------- Left column ---------------- */}
        <div className={cn("text-center lg:text-left", "animate-fade-in motion-reduce:animate-none")} style={enter(0)}>
          <h1
            id="hero-heading"
            className={cn(
              "text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl",
              "animate-fade-in motion-reduce:animate-none"
            )}
            style={{ ...enter(60), fontFamily: "var(--font-hero), system-ui, sans-serif" }}
          >
            <span className="block bg-gradient-to-r from-[#C98A00] to-[#F5B82E] bg-clip-text text-transparent">
              {HEADING_LINE_1}
            </span>
            <span className="block text-[#1F2937]">{HEADING_LINE_2}</span>
          </h1>

          <p
            className={cn(
              "mx-auto mt-5 max-w-lg text-base leading-relaxed text-[#4B5563] md:mx-0 md:text-lg",
              "animate-fade-in motion-reduce:animate-none"
            )}
            style={enter(160)}
          >
            {DESCRIPTION}
          </p>

          {/* Feature grid */}
          <ul
            className={cn(
              "mx-auto mt-8 grid max-w-lg grid-cols-2 gap-x-5 gap-y-4 text-left md:mx-0",
              "animate-fade-in motion-reduce:animate-none"
            )}
            style={enter(260)}
          >
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5">
                <Icon className="h-5 w-5 shrink-0 text-[#C98A00]" aria-hidden="true" strokeWidth={1.75} />
                <span className="text-sm font-medium text-[#4B5563]">{label}</span>
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div
            className={cn(
              "mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4",
              "animate-fade-in motion-reduce:animate-none"
            )}
            style={enter(360)}
          >
            <Link
              href={SHOP_HREF}
              className={cn(
                "inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#C98A00] to-[#F5B82E] px-6 py-3 text-sm font-semibold text-white",
                "shadow-[0_10px_24px_-8px_rgba(201,138,0,0.55)] transition-all duration-300",
                "hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-8px_rgba(201,138,0,0.65)]",
                "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                sharedFocus
              )}
            >
              Shop Now
            </Link>
            <Link
              href={BUNDLES_HREF}
              className={cn(
                "inline-flex w-full items-center justify-center rounded-lg border border-[#C98A00]/70 bg-transparent px-6 py-3 text-sm font-semibold text-[#C98A00]",
                "transition-colors duration-300 hover:bg-[#C98A00]/10",
                sharedFocus
              )}
            >
              Bundle Deals
            </Link>
          </div>

          {/* Trust row */}
          <div
            className={cn(
              "mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 lg:justify-start",
              "animate-fade-in motion-reduce:animate-none"
            )}
            style={enter(460)}
          >
            <p className="flex items-center gap-2 text-sm text-[#4B5563]">
              <Star className="h-4 w-4 fill-current text-[#F5B82E]" aria-hidden="true" strokeWidth={1.5} />
              <span>
                {TRUST.rating} ({TRUST.reviews})
              </span>
            </p>
            <p className="flex items-center gap-2 text-sm text-[#4B5563]">
              <ShoppingBag className="h-4 w-4 text-[#C98A00]" aria-hidden="true" strokeWidth={1.75} />
              <span>
                <strong className="font-bold text-[#1F2937]">{TRUST.customers}</strong> {TRUST.customersLabel}
              </span>
            </p>
          </div>
        </div>

        {/* ---------------- Right column: image card ---------------- */}
        <div
          className={cn("relative animate-fade-in motion-reduce:animate-none")}
          style={enter(220)}
        >
          <div className="group relative h-[320px] overflow-hidden rounded-3xl bg-[#FFC13B] shadow-[0_24px_60px_-24px_rgba(31,41,55,0.45)] sm:h-[380px] md:aspect-square md:h-auto">
            <Image
              src={HERO_IMAGE.src}
              alt={HERO_IMAGE.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            {/* light warm overlay to blend the photo with the gold theme */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#FFC13B]/15 via-transparent to-transparent"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
