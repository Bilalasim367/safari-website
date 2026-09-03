import React, { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import ShopContent from './ShopContent';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { SITE_URL } from '@/lib/site';
import { debugLog } from '@/lib/debugLog';

export const dynamic = 'force-dynamic';

export function getShopLabel(params: Record<string, string | string[] | undefined>): string {
  const gender = typeof params.gender === 'string' ? params.gender.toLowerCase() : '';
  const type = typeof params.type === 'string' ? params.type.toLowerCase() : '';
  const category = typeof params.category === 'string' ? params.category : '';
  const isNew = params.isNew === 'true';
  const isBestseller = params.isBestseller === 'true';

  let label = 'Shop All';
  if (category && !['men', 'women', 'unisex'].includes(category)) {
    label = `${category.charAt(0).toUpperCase()}${category.slice(1)}`;
  } else if (type === 'attar' && gender) {
    label = `Attars for ${gender.charAt(0).toUpperCase()}${gender.slice(1)}`;
  } else if (type === 'perfume' && gender) {
    label = `Perfumes for ${gender.charAt(0).toUpperCase()}${gender.slice(1)}`;
  } else if (type === 'attar') {
    label = 'Attar Collection';
  } else if (type === 'perfume') {
    label = 'Perfume Collection';
  } else if (gender) {
    label = `${gender.charAt(0).toUpperCase()}${gender.slice(1)} Fragrances`;
  }
  if (isNew) label = 'New Arrivals';
  if (isBestseller) label = 'Bestsellers';
  return label;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  try {
    const params = await searchParams;
    const label = getShopLabel(params);

    return {
      title: `${label} | Safari Perfumes Pakistan`,
      description: `Shop ${label.toLowerCase()} at Safari Perfumes — designer-inspired fragrances at affordable PKR prices with fast delivery across Pakistan.`,
      alternates: { canonical: `${SITE_URL}/shop` },
    };
  } catch (error) {
    debugLog('ShopPage:generateMetadata', error);
    return {
      title: 'Shop | Safari Perfumes Pakistan',
      description: 'Shop designer-inspired fragrances at Safari Perfumes.',
    };
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  let params: Record<string, string | string[] | undefined> = {};
  let label = 'Shop All';

  try {
    params = (await searchParams) || {};
    label = getShopLabel(params);
  } catch (error) {
    debugLog('ShopPage:searchParams', error);
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: label,
        item: `${SITE_URL}/shop`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div>
        <div className="bg-background border-b border-border py-16 md:py-20">
          <div className="container-custom">
            <div className="max-w-2xl">
              <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-4">Collection</p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-foreground mb-6">{label}</h1>
              <p className="text-muted-foreground text-lg max-w-md">
                Discover our complete collection of luxury fragrances, crafted to elevate your senses.
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
                    <BreadcrumbPage className="text-foreground">{label}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </div>
        <Suspense fallback={
          <div className="container-custom py-16 text-center text-muted-foreground">
            Loading products...
          </div>
        }>
          <ShopContent searchParams={params} />
        </Suspense>
      </div>
    </>
  );
}