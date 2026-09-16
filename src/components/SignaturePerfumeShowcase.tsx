"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Sparkles, Flower2, Gem, Star, ArrowRight } from "lucide-react"
import {
  DEFAULT_SHOWCASE_CONFIG,
  DEFAULT_SHOWCASE_DISPLAY,
  DEFAULT_SHOWCASE_SLUG,
  formatPrice,
  parseList,
  resolveShowcaseDisplay,
  type ShowcaseConfig,
  type ShowcaseDisplay,
  type ShowcaseProduct,
} from "@/lib/homepage-showcase"

const goldParticles = [
  { left: "8%", top: "22%", size: 5, delay: "0s", duration: "8s" },
  { left: "18%", top: "72%", size: 4, delay: "1.4s", duration: "9s" },
  { left: "28%", top: "38%", size: 6, delay: "0.7s", duration: "7.5s" },
  { left: "62%", top: "30%", size: 4, delay: "2s", duration: "10s" },
  { left: "74%", top: "66%", size: 5, delay: "1s", duration: "8.5s" },
  { left: "88%", top: "40%", size: 4, delay: "0.4s", duration: "9.5s" },
]

function mapProduct(item: Record<string, unknown>, fallbackSlug: string): ShowcaseProduct | null {
  if (!item) return null
  return {
    slug: String(item.slug ?? fallbackSlug),
    name: String(item.name ?? ""),
    price: Number(item.price ?? 0),
    originalPrice: item.originalPrice != null ? Number(item.originalPrice) : null,
    image: String(item.image ?? ""),
    rating: Number(item.rating ?? 0),
    reviews: Number(item.reviews ?? item.reviewCount ?? 0),
    gender: item.gender != null ? String(item.gender) : null,
    type: item.type != null ? String(item.type) : null,
    currency: item.currency != null ? String(item.currency) : null,
    impressionOf: item.impressionOf != null ? String(item.impressionOf) : null,
    shortDescription: item.shortDescription != null ? String(item.shortDescription) : null,
    description: item.description != null ? String(item.description) : null,
    longDescription: item.longDescription != null ? String(item.longDescription) : null,
    notesTop: parseList(item.notesTop),
    notesHeart: parseList(item.notesHeart),
    notesBase: parseList(item.notesBase),
  }
}

export default function SignaturePerfumeShowcase() {
  const [display, setDisplay] = useState<ShowcaseDisplay>({ ...DEFAULT_SHOWCASE_DISPLAY })

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      let config: ShowcaseConfig = { ...DEFAULT_SHOWCASE_CONFIG }
      try {
        const cfgRes = await fetch("/api/homepage-showcase")
        if (cfgRes.ok) config = (await cfgRes.json()) as ShowcaseConfig
      } catch {
        // keep defaults — fall back to product-driven showcase
      }
      if (cancelled) return

      if (config.visible === false) {
        setDisplay((prev) => ({ ...prev, visible: false, product: null }))
        return
      }

      const slug = config.productSlug?.trim() || DEFAULT_SHOWCASE_SLUG
      try {
        const res = await fetch(`/api/products?slug=${encodeURIComponent(slug)}&limit=1`)
        if (!res.ok) return
        const data = (await res.json()) as { products?: Array<Record<string, unknown>> }
        if (cancelled) return
        const item = Array.isArray(data?.products) ? data.products[0] : null
        if (!item) return
        const product = mapProduct(item, slug)
        if (!product) return
        setDisplay(resolveShowcaseDisplay(config, product))
      } catch {
        return
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  if (!display.visible || !display.product) return null

  const { product } = display
  const noteSections = [
    { label: "Top Notes", value: product.notesTop.join(", "), icon: Sparkles },
    { label: "Heart Notes", value: product.notesHeart.join(", "), icon: Flower2 },
    { label: "Base Notes", value: product.notesBase.join(", "), icon: Gem },
  ].filter((n) => n.value.length > 0)
  const metaParts = [product.gender?.trim(), product.type?.trim()].filter(Boolean)

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: "#0a0a0a" }}
      aria-label="Signature perfume showcase"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 18%, rgba(182, 150, 93,0.13), rgba(182, 150, 93,0) 70%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {goldParticles.map((p, i) => (
          <span
            key={i}
            className="sigs-particle sigs-particle-gold"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-[1280px] px-5 md:px-10 lg:px-12 py-10 md:py-20 lg:py-24">
        <div className="grid items-center gap-8 md:gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="sigs-bottle-wrap order-1 mx-auto w-[320px] max-w-full lg:w-[520px]">
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(ellipse 58% 62% at 50% 50%, rgba(182, 150, 93,0.15), rgba(182, 150, 93,0) 70%)",
              }}
            />
            {display.image ? (
              <Image
                src={display.image}
                alt={display.name || "Showcase"}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover drop-shadow-[0_18px_40px_rgba(182, 150, 93,0.18)]"
              />
            ) : null}
          </div>

          <div className="order-2 text-center lg:text-left">
            <div className="sigs-item inline-flex items-center justify-center border border-[#B6965D]/60 bg-[#B6965D]/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#B6965D]">
              {display.label}
            </div>

            <h2 className="sigs-item sigs-title mt-3 md:mt-4">{display.heading}</h2>

            {metaParts.length > 0 && (
              <p className="sigs-item mt-2 text-[11px] uppercase tracking-[0.24em] text-[#b8b3ab]/70 md:text-xs">
                {metaParts.join(" • ")}
              </p>
            )}

            {display.tagline && (
              <p className="sigs-item mt-2 md:mt-3 font-heading text-sm italic text-[#B6965D]/85 md:text-2xl">
                {display.tagline}
              </p>
            )}

            {display.description && (
              <p className="sigs-item mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#b8b3ab] md:mt-4 md:text-base lg:mx-0">
                {display.description}
              </p>
            )}

            {noteSections.length > 0 && (
              <div className="sigs-item mx-auto mt-5 grid max-w-sm grid-cols-3 gap-2 md:mt-8 md:max-w-md md:gap-4 lg:mx-0">
                {noteSections.map((n) => (
                  <div
                    key={n.label}
                    className="flex min-h-[84px] flex-col items-center justify-center gap-1.5 rounded-lg border border-[#B6965D]/20 bg-black/40 px-2 py-2.5 md:min-h-[124px] md:gap-2 md:px-3 md:py-4"
                  >
                    <n.icon className="h-4 w-5 text-[#B6965D] md:h-5" strokeWidth={1.5} />
                    <span className="text-center text-[10px] uppercase tracking-[0.2em] text-[#B6965D]/80 md:text-[11px]">
                      {n.label}
                    </span>
                    <span className="text-center text-xs leading-snug text-[#e8e4dc]/90">
                      {n.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {display.showRating && (
              <div className="sigs-item mt-5 flex items-center justify-center gap-2 md:mt-7 lg:justify-start">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#B6965D] text-[#B6965D]" />
                  ))}
                </div>
                <span className="text-sm font-bold text-white">{display.rating}</span>
                <span className="text-[13px] text-[#b8b3ab]/80">
                  ({display.reviewsCount} reviews)
                </span>
              </div>
            )}

            {display.showPrice && (
              <div className="sigs-item mt-3 flex items-center justify-center gap-3 md:mt-4 lg:justify-start">
                <span className="text-2xl font-bold text-[#B6965D] md:text-3xl">
                  {display.currency} {formatPrice(display.price)}
                </span>
                {display.originalPrice ? (
                  <span className="text-lg text-[#b8b3ab]/60 line-through md:text-xl">
                    {display.currency} {formatPrice(display.originalPrice)}
                  </span>
                ) : null}
              </div>
            )}

            <Link
              href={display.buttonLink}
              className="sigs-item mt-6 inline-flex w-full min-h-[48px] items-center justify-center gap-2 bg-[#B6965D] px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c9a873] lg:w-auto shadow-lg shadow-[#B6965D]/25 hover:shadow-[0_14px_36px_-6px_rgba(182, 150, 93,0.65)]"
            >
              {display.buttonText}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}