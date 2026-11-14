"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
  DEFAULT_COLLECTIONS,
  isSafeImageSrc,
  safeHref,
  type CollectionsConfig,
} from "@/lib/homepage-content"

interface FeaturedCollectionsProps {
  content?: CollectionsConfig
}

const cardFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"

function TitleWithGoldLastWord({ title }: { title: string }) {
  const words = title.split(" ")
  const last = words[words.length - 1]
  const rest = words.slice(0, -1).join(" ")

  return (
    <>
      {rest && <span className="text-white">{rest} </span>}
      <span className="text-gold">{last}</span>
    </>
  )
}

export default function FeaturedCollections({ content = DEFAULT_COLLECTIONS }: FeaturedCollectionsProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [staggerDone, setStaggerDone] = useState(false)
  const cards = content.cards?.length ? content.cards : DEFAULT_COLLECTIONS.cards

  useEffect(() => {
    const el = gridRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Clear the stagger delay after the entrance finishes so hover lifts aren't delayed.
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => setStaggerDone(true), 1000)
    return () => clearTimeout(timer)
  }, [visible])

  return (
    <section className="px-4 md:px-12 py-6 md:py-20 bg-background">
      <div className="container-custom">
        <div className="text-center mb-6 md:mb-12">
          <p className="text-gold text-[10px] md:text-sm tracking-[0.5em] uppercase mb-1 md:mb-3">
            {content.eyebrow}
          </p>
          <h2 className="text-2xl md:text-5xl lg:text-6xl font-heading text-foreground">
            {content.title}
          </h2>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6"
        >
          {cards.map((collection, index) => (
              <Link
                key={collection.id}
                href={safeHref(collection.href, "/shop")}
                aria-label={`${collection.title} — ${collection.cta}`}
                className={cn(
                  cardFocus,
                  "group flex flex-col rounded-2xl overflow-hidden bg-[hsl(var(--card))] border border-border shadow-sm",
                  "transition-[transform,box-shadow] duration-300 ease-out",
                  "hover:-translate-y-1 hover:shadow-xl",
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6",
                  "motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-none"
                )}
                style={{
                  transitionDelay: visible && !staggerDone ? `${index * 90}ms` : "0ms",
                }}

              >
                {/* Image head with dark overlay so the title stays readable */}
                <div className="relative h-[150px] md:h-[165px] overflow-hidden bg-gradient-to-br from-charcoal to-charcoal-dark">
                  {isSafeImageSrc(collection.image) && (
                    <Image
                      src={collection.image as string}
                      alt={`${collection.title} preview`}
                      fill
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:group-hover:scale-100"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80" />
                  <div className="absolute inset-0 flex items-center justify-center px-4">
                    <h3 className="font-body font-bold text-xl md:text-2xl text-center drop-shadow">
                      <TitleWithGoldLastWord title={collection.title} />
                    </h3>
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-gold font-semibold text-lg">
                      {collection.title}
                    </span>
                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                      {collection.count}
                    </span>
                  </div>

                  <p className="text-muted-foreground text-sm mt-1.5 leading-snug">
                    {collection.description}
                  </p>

                  <p className="text-muted-foreground/80 text-[11px] font-medium uppercase tracking-wider mt-3">
                    Popular:
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {collection.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-gold/15 text-gold text-[11px] px-2 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Button pinned to the bottom of equal-height cards */}
                  <div className="mt-auto pt-4">
                    <span
                      className={cn(
                        "block w-full text-center rounded-lg py-2.5",
                        "bg-gradient-to-r from-gold to-gold-light",
                        "text-charcoal font-bold text-sm",
                        "transition-[filter,transform] duration-200",
                        "group-hover:brightness-110 group-hover:-translate-y-0.5",
                        "motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
                      )}
                    >
                      {collection.cta}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </section>
  )
}
