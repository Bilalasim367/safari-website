"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Plus_Jakarta_Sans } from "next/font/google"
import {
  Banknote,
  Clock,
  Gift,
  Shield,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DEFAULT_HERO,
  isSafeImageSrc,
  safeHref,
  type HeroConfig,
} from "@/lib/homepage-content"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-hero",
  display: "swap",
})

const FEATURE_ICONS: Record<string, LucideIcon> = {
  shield: Shield,
  clock: Clock,
  banknote: Banknote,
  truck: Truck,
  sparkles: Sparkles,
  gift: Gift,
}

const sharedFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C98A00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFBEB]"

const enter = (delay: number) => ({
  animationDelay: `${delay}ms`,
})

interface HeroProps {
  content?: HeroConfig
}

export default function Hero({ content = DEFAULT_HERO }: HeroProps) {
  const headingLine1 = content.headingLine1 || DEFAULT_HERO.headingLine1
  const headingLine2 = content.headingLine2 || DEFAULT_HERO.headingLine2
  const imageSrc = isSafeImageSrc(content.image?.src)
    ? (content.image?.src as string)
    : DEFAULT_HERO.image.src
  const imageAlt = content.image?.alt || DEFAULT_HERO.image.alt
  const features = content.features?.length ? content.features : DEFAULT_HERO.features
  const trust = content.trust ?? DEFAULT_HERO.trust

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
            aria-label={`${headingLine1} ${headingLine2}`}
            className={cn(
              "text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl",
              "animate-fade-in motion-reduce:animate-none"
            )}
            style={{ ...enter(60), fontFamily: "var(--font-hero), system-ui, sans-serif" }}
          >
            <span className="block bg-gradient-to-r from-[#C98A00] to-[#F5B82E] bg-clip-text text-transparent">
              {headingLine1}
            </span>{" "}
            <span className="block text-[#1F2937]">{headingLine2}</span>
          </h1>

          <p
            className={cn(
              "mx-auto mt-5 max-w-lg text-base leading-relaxed text-[#4B5563] md:mx-0 md:text-lg",
              "animate-fade-in motion-reduce:animate-none"
            )}
            style={enter(160)}
          >
            {content.description}
          </p>

          {/* Feature grid */}
          <ul
            className={cn(
              "mx-auto mt-8 grid max-w-lg grid-cols-2 gap-x-5 gap-y-4 text-left md:mx-0",
              "animate-fade-in motion-reduce:animate-none"
            )}
            style={enter(260)}
          >
            {features.map((feature) => {
              const Icon = FEATURE_ICONS[feature.icon] ?? Shield
              return (
                <li key={feature.label} className="flex items-center gap-2.5">
                  <Icon className="h-5 w-5 shrink-0 text-[#C98A00]" aria-hidden="true" strokeWidth={1.75} />
                  <span className="text-sm font-medium text-[#4B5563]">{feature.label}</span>
                </li>
              )
            })}
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
              href={safeHref(content.shopHref, "/shop")}
              className={cn(
                "inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#C98A00] to-[#F5B82E] px-6 py-3 text-sm font-semibold text-white",
                "shadow-[0_10px_24px_-8px_rgba(201,138,0,0.55)] transition-all duration-300",
                "hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-8px_rgba(201,138,0,0.65)]",
                "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                sharedFocus
              )}
            >
              {content.shopLabel}
            </Link>
            <Link
              href={safeHref(content.bundlesHref, "/bundles")}
              className={cn(
                "inline-flex w-full items-center justify-center rounded-lg border border-[#C98A00]/70 bg-transparent px-6 py-3 text-sm font-semibold text-[#C98A00]",
                "transition-colors duration-300 hover:bg-[#C98A00]/10",
                sharedFocus
              )}
            >
              {content.bundlesLabel}
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
                {trust.rating} ({trust.reviews})
              </span>
            </p>
            <p className="flex items-center gap-2 text-sm text-[#4B5563]">
              <ShoppingBag className="h-4 w-4 text-[#C98A00]" aria-hidden="true" strokeWidth={1.75} />
              <span>
                <strong className="font-bold text-[#1F2937]">{trust.customers}</strong>{" "}
                {trust.customersLabel}
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
              src={imageSrc}
              alt={imageAlt}
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
