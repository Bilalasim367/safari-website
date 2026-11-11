import React, { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import ShopContent from './ShopContent';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { SITE_URL } from '@/lib/site';
import { debugLog } from '@/lib/debugLog';
import { getShopLabel } from '@/lib/shop-label';

// Query params are whitelisted and clamped here so junk URLs never reach the
// cached Prisma query in ShopContent (which revalidates every 300s).


const ALLOWED_PARAMS = new Set(['category', 'size', 'fragranceFamily', 'minPrice', 'maxPrice', 'page', 'sort', 'type', 'collection', 'gender', 'isBestseller', 'isNew', 'q']);
const MAX_SEARCH_LEN = 60;
const MAX_MULTI = 10;
const ALLOWED_SORT = new Set(['featured', 'price-low', 'price-high', 'newest', 'rating']);

function sanitizeParamValue(v: string | string[] | undefined): string | string[] | undefined {
  if (v === undefined || v === null) return undefined;
  if (Array.isArray(v)) {
    const out: string[] = [];
    for (const item of v) {
      if (typeof item !== 'string') continue;
      const cleaned = item.replace(/[\x00-\x1F\x7F]/g, '').trim();
      if (cleaned.length === 0) continue;
      out.push(cleaned);
      if (out.length >= MAX_MULTI) break;
    }
    return out.length > 0 ? out : undefined;
  }
  if (typeof v === 'string') {
    const cleaned = v.replace(/[\x00-\x1F\x7F]/g, '').trim();
    if (cleaned.length === 0) return undefined;
    if (cleaned.length > MAX_SEARCH_LEN) return cleaned.slice(0, MAX_SEARCH_LEN);
    return cleaned;
  }
  return undefined;
}

function whitelistParams(input: Record<string, string | string[] | undefined>): Record<string, string | string[] | undefined> {
  const out: Record<string, string | string[] | undefined> = {};
  for (const k of Object.keys(input)) {
    if (!ALLOWED_PARAMS.has(k)) continue;
    const sv = sanitizeParamValue(input[k]);
    if (sv === undefined) continue;
    if (k === 'sort' && typeof sv === 'string' && !ALLOWED_SORT.has(sv)) continue;
    if (k === 'page' && typeof sv === 'string') {
      const n = Number(sv);
      if (!Number.isFinite(n) || n < 1) continue;
    }
    if ((k === 'minPrice' || k === 'maxPrice') && typeof sv === 'string') {
      const n = Number(sv);
      if (!Number.isFinite(n) || n < 0) continue;
    }
    out[k] = sv;
  }
  return out;
}

function hasFilteredParams(p: Record<string, string | string[] | undefined>): boolean {
  const keys = Object.keys(p);
  if (keys.length === 0) return false;
  if (keys.some((k) => k !== 'page' && k !== 'sort')) return true;
  if (p.page && String(p.page) !== '1') return true;
  if (p.sort && String(p.sort) !== 'featured') return true;
  return false;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  try {
    const raw = await searchParams;
    const params = whitelistParams(raw);
    const label = getShopLabel(params as Record<string,string|string[]|undefined>);
    const hasFiltered = hasFilteredParams(params);
    const canonical = `${SITE_URL}/shop`;
    return {
      title: `${label}`,
      description: `Shop ${label.toLowerCase()} at Safari Perfumes — designer-inspired fragrances at affordable PKR prices with fast delivery across Pakistan.`,
      alternates: { canonical },
      robots: hasFiltered ? { index: false, follow: true } : { index: true, follow: true },
    };
  } catch (error) {
    debugLog('ShopPage:generateMetadata', error);
    return {
      title: 'Shop',
      description: 'Shop designer-inspired fragrances at Safari Perfumes.',
      alternates: { canonical: `${SITE_URL}/shop` },
      robots: { index: true, follow: true },
    };
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  let raw: Record<string, string | string[] | undefined> = {};
  let label = 'Shop All';
  try {
    raw = (await searchParams) || {};
    const w = whitelistParams(raw);
    label = getShopLabel(w as Record<string,string|string[]|undefined>);
  } catch (error) {
    debugLog('ShopPage:searchParams', error);
  }
  const params = whitelistParams(raw);

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
                      <Link href="/" prefetch={false} className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
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
