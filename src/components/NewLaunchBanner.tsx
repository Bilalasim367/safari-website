"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Poppins } from "next/font/google"
import { cn } from "@/lib/utils"
import {
  DEFAULT_LAUNCH_BANNER,
  isSafeImageSrc,
  safeHref,
  type LaunchBannerConfig,
} from "@/lib/homepage-content"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-launch",
  display: "swap",
})

const sharedFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C542] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1C1C1C]"

interface NewLaunchBannerProps {
  content?: LaunchBannerConfig
}

export default function NewLaunchBanner({ content = DEFAULT_LAUNCH_BANNER }: NewLaunchBannerProps) {
  const imageSrc = isSafeImageSrc(content.image?.src)
    ? (content.image?.src as string)
    : DEFAULT_LAUNCH_BANNER.image.src
  const imageAlt = content.image?.alt || DEFAULT_LAUNCH_BANNER.image.alt
  const highlights = content.highlights?.length ? content.highlights : DEFAULT_LAUNCH_BANNER.highlights

  return (
    <section aria-labelledby="new-launch-heading" className="px-4 pb-4 pt-8 sm:px-6 md:pb-6 md:pt-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div
          className={cn(
            poppins.variable,
            "relative overflow-hidden rounded-3xl",
            "bg-gradient-to-br from-[#242424] via-[#1F1F1F] to-[#191919]",
            "border border-white/[0.06] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]"
          )}
        >
          {/* gold glow, top-right */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(184,134,11,0.32), transparent 70%)" }}
          />

          <div className="relative grid grid-cols-1 items-center gap-8 p-6 sm:p-8 md:grid-cols-[1.1fr_0.9fr] md:gap-10 md:p-10 lg:p-12">
            {/* ---------------- Left column ---------------- */}
            <div>
              {content.badge && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border border-[#F5C542]/40 bg-[#F5C542]/10",
                    "px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F5C542]"
                  )}
                >
                  {content.badge}
                </span>
              )}

              <h2
                id="new-launch-heading"
                className="mt-5 text-3xl font-bold leading-[1.1] sm:text-4xl lg:text-5xl"
                style={{ fontFamily: "var(--font-launch), system-ui, sans-serif" }}
              >
                <span className="block text-white">{content.headingLine1}</span>
                <span className="block bg-gradient-to-r from-[#F5E27A] to-[#E0A81E] bg-clip-text text-transparent">
                  {content.headingLine2}
                </span>
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#B5B5B5] sm:text-base">
                {content.description}
              </p>

              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2.5">
                {highlights.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#F5C542]" />
                    <span className="text-sm font-semibold text-white">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Link
                  href={safeHref(content.primaryHref, "/shop")}
                  className={cn(
                    "inline-flex w-full items-center justify-center rounded-full bg-[#C9920A] px-6 py-3",
                    "text-sm font-bold text-[#1C1C1A] transition-all duration-300",
                    "hover:-translate-y-0.5 hover:brightness-110",
                    "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:brightness-100",
                    sharedFocus
                  )}
                >
                  {content.primaryLabel}
                </Link>
                <Link
                  href={safeHref(content.secondaryHref, "/bundles")}
                  className={cn(
                    "inline-flex w-full items-center justify-center rounded-full border border-white/25 px-6 py-3",
                    "text-sm font-semibold text-white transition-colors duration-300 hover:bg-white/10",
                    sharedFocus
                  )}
                >
                  {content.secondaryLabel}
                </Link>
              </div>
            </div>

            {/* ---------------- Right column: image ---------------- */}
            <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#2C2C2C]">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              {content.image?.pill && (
                <span
                  className={cn(
                    "absolute left-4 top-4 rounded-full bg-white px-3 py-1",
                    "text-[11px] font-semibold uppercase tracking-wider text-[#1F2937] shadow-md"
                  )}
                >
                  {content.image.pill}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
