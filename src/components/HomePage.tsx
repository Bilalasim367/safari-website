"use client"

import React from "react"
import Hero from "@/components/Hero"
import FeaturedCollections from "@/components/FeaturedCollectionsV2"
import HotSellingCarousel from "@/components/HotSellingCarousel"
import BrandStory from "@/components/BrandStory"
import Testimonials from "@/components/Testimonials"
import Newsletter from "@/components/Newsletter"
import MenCollection from "@/components/MenCollection"
import WomenCollection from "@/components/WomenCollection"
import UnisexTrend from "@/components/UnisexTrend"
import LifestyleVisualGrid from "@/components/LifestyleVisualGrid"
import type { ProductCategory } from "@/lib/product-types"

interface HomePageProps {
  hotSelling: ProductCategory[]
  menProducts: ProductCategory[]
  womenProducts: ProductCategory[]
  unisexProducts: ProductCategory[]
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
      <HotSellingCarousel products={hotSelling} />
      <FeaturedCollections />
      <MenCollection products={menProducts} title="Men Collection" gender="Men" />
      <LifestyleVisualGrid />
      <WomenCollection products={womenProducts} title="Women Collection" gender="Women" />
      <UnisexTrend products={unisexProducts} />
      <BrandStory />
      <Testimonials />
      <Newsletter />
    </>
  )
}