import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import ShopContent from '@/app/shop/ShopContent'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'

export const metadata: Metadata = {
  title: "Our Collection | SAFARI Luxury Fragrances",
  description: "Discover our complete collection of luxury fragrances. Shop perfumes and attars for men, women, and unisex.",
}

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <div className="pt-16 md:pt-20">
      <div className="bg-background border-b border-border py-16 md:py-20">
        <div className="container-custom">
          <div className="max-w-2xl">
            <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-4">Our Collection</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-foreground mb-6">Our Collection</h1>
            <p className="text-muted-foreground text-lg max-w-md">
              Explore our complete range of luxury fragrances, crafted with rare ingredients for every occasion.
            </p>
          </div>
          <div className="mt-8">
            <Breadcrumb>
              <BreadcrumbList className="text-sm">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground">Our Collection</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </div>
      <ShopContent searchParams={params} />
    </div>
  )
}