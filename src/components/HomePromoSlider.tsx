"use client"

import React, { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { isSafeImageSrc, safeHref, type PromoSlide } from "@/lib/homepage-content"

interface HomePromoSliderProps {
  slides: PromoSlide[]
  /** Accessible name for the region. */
  ariaLabel?: string
}

const AUTOPLAY_DELAY = 6000

/**
 * Admin-managed promo slider (uploaded campaign images).
 * - Swipe on touch, arrows on desktop, dots + keyboard support.
 * - Autoplay pauses on hover/focus and is disabled for reduced-motion users.
 * - Renders nothing when there are no live slides (no empty gap).
 */
export default function HomePromoSlider({
  slides,
  ariaLabel = "Featured promotions",
}: HomePromoSliderProps) {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: slides.length > 1, align: "start", containScroll: "trimSnaps" },
    slides.length > 1
      ? [
          Autoplay({
            delay: AUTOPLAY_DELAY,
            // Started from the effect below, after the reduced-motion check.
            playOnInit: false,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
            stopOnFocusIn: true,
          }),
        ]
      : []
  )

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReducedMotion(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])

  // Autoplay only runs with 2+ snaps. Embla's autoplay plugin bails out of
  // init() for a single snap without creating its delay array, so play() at
  // that point throws inside the plugin. Guard on the real snap count too.
  useEffect(() => {
    if (!emblaApi) return
    const autoplay = emblaApi.plugins()?.autoplay as
      | { stop: () => void; play: () => void; isPlaying: () => boolean }
      | undefined
    if (!autoplay) return
    if (
      reducedMotion ||
      isPaused ||
      slides.length < 2 ||
      emblaApi.scrollSnapList().length < 2
    ) {
      autoplay.stop()
      return
    }
    autoplay.play()
  }, [emblaApi, reducedMotion, isPaused, slides.length])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  if (!slides || slides.length === 0) return null

  const autoplayAvailable = !reducedMotion && slides.length > 1

  return (
    <section
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      className="px-4 pt-8 sm:px-6 md:pt-10 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div
          ref={emblaRef}
          onKeyDown={onKeyDown}
          tabIndex={0}
          className={cn(
            "relative overflow-hidden rounded-2xl bg-[#1C1C1C] md:rounded-3xl",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9920A] focus-visible:ring-offset-2"
          )}
        >
          <div className="flex touch-pan-y">
            {slides.map((slide, index) => {
              const desktopImage = isSafeImageSrc(slide.imageDesktop) ? slide.imageDesktop : ""
              const mobileImage = isSafeImageSrc(slide.imageMobile) ? slide.imageMobile : ""
              const href = slide.href && safeHref(slide.href, "") ? slide.href : null

              const media = (
                <>
                  {mobileImage ? (
                    <Image
                      src={mobileImage}
                      alt=""
                      fill
                      sizes="100vw"
                      priority={index === 0}
                      className="object-cover object-center sm:hidden"
                    />
                  ) : null}
                  {desktopImage ? (
                    <Image
                      src={desktopImage}
                      alt={slide.imageAlt || slide.title || "Safari Perfumes promotion"}
                      fill
                      sizes="(max-width: 1280px) 100vw, 1280px"
                      priority={index === 0}
                      className={cn(
                        "object-cover object-center",
                        mobileImage ? "hidden sm:block" : "block"
                      )}
                    />
                  ) : null}
                </>
              )

              return (
                <div
                  key={slide.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${slides.length}`}
                  className="min-w-0 flex-[0_0_100%]"
                >
                  <div className="relative aspect-[16/11] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
                    {href ? (
                      <Link
                        href={href}
                        target={slide.openInNewTab ? "_blank" : undefined}
                        rel={slide.openInNewTab ? "noopener noreferrer" : undefined}
                        aria-label={slide.title || slide.ctaLabel || "Open promotion"}
                        className="absolute inset-0 block"
                      >
                        {media}
                      </Link>
                    ) : (
                      <div className="absolute inset-0">{media}</div>
                    )}

                    {(slide.eyebrow || slide.title || slide.subtitle || slide.ctaLabel) && (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
                      />
                    )}

                    {(slide.eyebrow || slide.title || slide.subtitle || slide.ctaLabel) && (
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 sm:p-7 lg:p-10">
                        <div className="max-w-xl">
                          {slide.eyebrow && (
                            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#F5C542] sm:text-xs">
                              {slide.eyebrow}
                            </p>
                          )}
                          {slide.title && (
                            <h2 className="mt-2 font-heading text-xl font-semibold leading-tight text-white drop-shadow sm:text-3xl lg:text-4xl">
                              {slide.title}
                            </h2>
                          )}
                          {slide.subtitle && (
                            <p className="mt-2 hidden max-w-md text-sm leading-relaxed text-white/80 sm:block">
                              {slide.subtitle}
                            </p>
                          )}
                          {slide.ctaLabel && href && (
                            <span className="mt-4 inline-flex items-center justify-center rounded-full bg-[#C9920A] px-5 py-2.5 text-xs font-bold text-[#1C1C1A] sm:text-sm">
                              {slide.ctaLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={scrollPrev}
                aria-label="Previous promotion"
                className={cn(
                  "absolute left-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full",
                  "h-10 w-10 border border-white/20 bg-black/35 text-white backdrop-blur-sm",
                  "transition-colors hover:bg-black/55 md:flex",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C542]"
                )}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                aria-label="Next promotion"
                className={cn(
                  "absolute right-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full",
                  "h-10 w-10 border border-white/20 bg-black/35 text-white backdrop-blur-sm",
                  "transition-colors hover:bg-black/55 md:flex",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C542]"
                )}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {slides.length > 1 && (
          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="flex items-center gap-2" role="tablist" aria-label="Choose promotion">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={index === selectedIndex}
                  aria-label={`Go to promotion ${index + 1}`}
                  onClick={() => emblaApi?.scrollTo(index)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    index === selectedIndex
                      ? "w-6 bg-[#C9920A]"
                      : "w-2 bg-foreground/25 hover:bg-foreground/40",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9920A] focus-visible:ring-offset-2"
                  )}
                />
              ))}
            </div>

            {autoplayAvailable && (
              <button
                type="button"
                onClick={() => setIsPaused((value) => !value)}
                aria-label={isPaused ? "Play promotions" : "Pause promotions"}
                className="flex h-7 w-7 items-center justify-center rounded-full text-foreground/50 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9920A]"
              >
                {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
