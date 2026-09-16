"use client"

import React from "react"
import Hero from "@/components/Hero"
import SignaturePerfumeShowcase from "@/components/SignaturePerfumeShowcase"
import LifestyleBanner from "@/components/LifestyleBanner"
import HotSellingCarousel from "@/components/HotSellingCarousel"
import FeaturedCollections from "@/components/FeaturedCollectionsV2"
import MenCollection from "@/components/MenCollection"
import WomenCollection from "@/components/WomenCollection"
import UnisexTrend from "@/components/UnisexTrend"
import WhyChooseUs from "@/components/WhyChooseUs"
import Testimonials from "@/components/Testimonials"
import Newsletter from "@/components/Newsletter"
import Reveal from "@/components/Reveal"
import type { ProductCategory } from "@/lib/product-types"

interface HomePageProps {
  hotSelling: ProductCategory[]
  menProducts: ProductCategory[]
  womenProducts: ProductCategory[]
  unisexProducts: ProductCategory[]
}

function GoldDivider() {
  return <div className="gold-divider" aria-hidden="true" />
}

export default function HomePage({
  hotSelling,
  menProducts,
  womenProducts,
  unisexProducts,
}: HomePageProps) {
  return (
    <>
      <Hero />
      <Reveal>
        <HotSellingCarousel products={hotSelling} />
      </Reveal>
      <GoldDivider />
      <Reveal>
        <SignaturePerfumeShowcase />
      </Reveal>
      <GoldDivider />
      <Reveal>
        <MenCollection products={menProducts} title="Men Collection" gender="Men" />
      </Reveal>
      <GoldDivider />
      <Reveal>
        <LifestyleBanner />
      </Reveal>
      <GoldDivider />
      <Reveal>
        <WomenCollection products={womenProducts} title="Women Collection" gender="Women" />
      </Reveal>
      <GoldDivider />
      <Reveal>
        <FeaturedCollections />
      </Reveal>
      <GoldDivider />
      <Reveal>
        <UnisexTrend products={unisexProducts} />
      </Reveal>
      <GoldDivider />
      <Reveal>
        <WhyChooseUs />
      </Reveal>
      <GoldDivider />
      <Reveal>
        <Testimonials />
      </Reveal>
      <GoldDivider />
      <Reveal>
        <Newsletter />
      </Reveal>
    </>
  )
}