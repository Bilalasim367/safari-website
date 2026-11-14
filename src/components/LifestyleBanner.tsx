"use client"

import React from "react"
import Link from "next/link"
import { DEFAULT_LIFESTYLE, safeHref, type LifestyleConfig } from "@/lib/homepage-content"

interface LifestyleBannerProps {
  content?: LifestyleConfig
}

export default function LifestyleBanner({ content = DEFAULT_LIFESTYLE }: LifestyleBannerProps) {
  return (
    <section
      className="lifestyle-banner relative flex items-center"
      aria-label="Lifestyle banner"
    >
      <div className="pointer-events-none absolute inset-0 bg-black/60" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1280px] items-center px-5 md:px-10 lg:px-12">
        <div className="flex w-full flex-col items-center text-center md:items-start md:text-left">
          {content.eyebrow && <span className="lifestyle-eyebrow">{content.eyebrow}</span>}
          <h2 className="lifestyle-title mt-2 md:mt-3">{content.title}</h2>
          {content.subtitle && (
            <p className="lifestyle-subtitle mt-1.5 md:mt-2">{content.subtitle}</p>
          )}
          <Link href={safeHref(content.ctaHref, "/shop")} className="lifestyle-btn mt-5 md:mt-6">
            {content.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
