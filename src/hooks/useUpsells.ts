'use client';

import { useEffect, useState } from 'react';
import { resolveDefaultPricing } from '@/lib/size-pricing';

export type UpsellProduct = {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  size: string;
};

/**
 * Cart upsells are sourced from the live product catalogue, never from
 * `src/data/products`. That static file holds placeholder rows with numeric
 * ids that match no real product, so adding an "upsell" produced a cart line
 * that could never be repriced or fulfilled.
 *
 * The request is module-level cached: opening the bag repeatedly reuses the
 * same in-flight/settled promise instead of refetching per drawer open.
 */

let cache: Promise<UpsellProduct[]> | null = null;

const FETCH_SIZE = 12;
const CACHE_TTL_MS = 5 * 60 * 1000;

let cachedAt = 0;

function isFresh(): boolean {
  return cache !== null && Date.now() - cachedAt < CACHE_TTL_MS;
}

function resetUpsellCache(): void {
  cache = null;
  cachedAt = 0;
}

type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  size: string | null;
  type: string | null;
  sizesAvailable: string | null;
  price: number | null;
  price3mlOnline: number | null;
  price6mlOnline: number | null;
  price12mlOnline: number | null;
  price50mlOnline: number | null;
};

function toUpsell(raw: ApiProduct): UpsellProduct | null {
  const pricing = resolveDefaultPricing(raw);
  // No sellable volume => no honest price to advertise, so do not offer it.
  if (!pricing) return null;
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    image: raw.image || '',
    price: pricing.price,
    size: pricing.size,
  };
}

async function fetchUpsells(): Promise<UpsellProduct[]> {
  const res = await fetch(`/api/products?limit=${FETCH_SIZE}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Upsell fetch failed: ${res.status}`);
  const data = (await res.json()) as { products?: ApiProduct[] };
  return (data.products ?? [])
    .map(toUpsell)
    .filter((p): p is UpsellProduct => p !== null && p.image !== '');
}

export function loadUpsells(): Promise<UpsellProduct[]> {
  if (isFresh()) return cache as Promise<UpsellProduct[]>;
  cachedAt = Date.now();
  cache = fetchUpsells().catch((err) => {
    // Do not cache a failure; allow a retry on the next drawer open.
    resetUpsellCache();
    throw err;
  });
  return cache;
}

/**
 * Upsells to offer for the current bag. Always returns real catalogue rows;
 * an empty array means "show nothing" rather than falling back to placeholders.
 */
export function useUpsells(excludeIds: string[], limit = 4): {
  upsells: UpsellProduct[];
  loading: boolean;
} {
  const [upsells, setUpsells] = useState<UpsellProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const key = [...excludeIds].sort().join('|');

  useEffect(() => {
    let active = true;
    void (async () => {
      setLoading(true);
      try {
        const all = await loadUpsells();
        const excluded = new Set(key ? key.split('|') : []);
        if (active) setUpsells(all.filter((p) => !excluded.has(p.id)).slice(0, limit));
      } catch {
        if (active) setUpsells([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [key, limit]);

  return { upsells, loading };
}
