"use client"

import React from "react"
import Hero from "@/components/Hero"
import NewLaunchBanner from "@/components/NewLaunchBanner"
import SignaturePerfumeShowcase from "@/components/SignaturePerfumeShowcase"
import LifestyleBanner from "@/components/LifestyleBanner"
import HotSellingCarousel from "@/components/HotSellingCarousel"
import HomePromoSlider from "@/components/HomePromoSlider"
import FeaturedCollections from "@/components/FeaturedCollectionsV2"
import MenCollection from "@/components/MenCollection"
import WomenCollection from "@/components/WomenCollection"
import UnisexTrend from "@/components/UnisexTrend"
import WhyChooseUs from "@/components/WhyChooseUs"
import Testimonials from "@/components/Testimonials"
import Newsletter from "@/components/Newsletter"
import Reveal from "@/components/Reveal"
import type { ProductCategory } from "@/lib/product-types"
import type { HomepageContent, HomepageSectionView } from "@/lib/homepage-content-store"

interface HomePageProps {
  pinnedProducts: ProductCategory[]
  hotSelling: ProductCategory[]
  menProducts: ProductCategory[]
  womenProducts: ProductCategory[]
  unisexProducts: ProductCategory[]
  content: HomepageContent
}

function GoldDivider() {
  return <div className="gold-divider" aria-hidden="true" />
}

/** Sections that historically had a gold divider above them. */
const DIVIDER_BEFORE = new Set([
  "signature",
  "men",
  "lifestyle",
  "women",
  "collections",
  "unisex",
  "why_us",
  "testimonials",
  "newsletter",
])

export default function HomePage({
  pinnedProducts,
  hotSelling,
  menProducts,
  womenProducts,
  unisexProducts,
  content,
}: HomePageProps) {
  const renderSection = (section: HomepageSectionView): React.ReactNode => {
    switch (section.key) {
      case "hero":
        return <Hero content={section.config} />

      case "new_season":
        if (pinnedProducts.length === 0) return null
        return (
          <HotSellingCarousel
            products={pinnedProducts}
            eyebrow={section.config.eyebrow}
            title={section.config.title}
            viewAllLabel={section.config.viewAllLabel}
            viewAllHref={section.config.viewAllHref}
            ariaLabel={section.config.ariaLabel}
          />
        )

      case "launch_banner":
        return <NewLaunchBanner content={section.config} />

      case "promo_slider":
        return <HomePromoSlider slides={content.slides} />

      case "trending":
        return (
          <HotSellingCarousel
            products={hotSelling}
            eyebrow={section.config.eyebrow}
            title={section.config.title}
            viewAllLabel={section.config.viewAllLabel}
            viewAllHref={section.config.viewAllHref}
            ariaLabel={section.config.ariaLabel}
          />
        )

      case "signature":
        return <SignaturePerfumeShowcase />

      case "men":
        return (
          <MenCollection
            products={menProducts}
            title={section.config.title}
            gender="Men"
            copy={section.config}
          />
        )

      case "lifestyle":
        return <LifestyleBanner content={section.config} />

      case "women":
        return (
          <WomenCollection
            products={womenProducts}
            title={section.config.title}
            gender="Women"
            copy={section.config}
          />
        )

      case "collections":
        return <FeaturedCollections content={section.config} />

      case "unisex":
        return <UnisexTrend products={unisexProducts} copy={section.config} />

      case "why_us":
        return <WhyChooseUs content={section.config} />

      case "testimonials":
        return <Testimonials content={section.config} />

      case "newsletter":
        return <Newsletter content={section.config} />

      default:
        return null
    }
  }

  const visible = content.sections.filter((section) => section.isVisible)
  const rendered = visible
    .map((section) => ({ section, node: renderSection(section) }))
    .filter((item): item is { section: HomepageSectionView; node: React.ReactNode } => Boolean(item.node))

  return (
    <>
      {rendered.map(({ section, node }, index) => {
        const showDivider = index > 0 && DIVIDER_BEFORE.has(section.key)

        return (
          <React.Fragment key={section.key}>
            {showDivider && <GoldDivider />}
            <Reveal>{node}</Reveal>
          </React.Fragment>
        )
      })}
    </>
  )
}
