import prisma from '@/lib/prisma';
import Link from 'next/link';
import ShopProductCard from './ShopProductCard';
import SortSelect from './SortSelect';
import MobileFilterDrawer from './MobileFilterDrawer';
import FILTERS, { FilterSection } from './FilterSection';
import { classifyProductType, type ProductCategoryType } from '@/lib/product-types';
import { normalizeGender, normalizeType, defaultSizeForType } from '@/lib/normalize';
import { debugLog } from '@/lib/debugLog';

export const dynamic = 'force-dynamic';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  images?: string[];
  category: { name: string; slug: string } | null;
  categorySlug?: string | null;
  size: string;
  
  isBestseller: boolean;
  isNew: boolean;
  rating: number;
  reviewCount: number;
  gender?: string;
  season?: string | null;
  impressionOf?: string | null;
  tags?: string | null;
  currency?: string;
  type: ProductCategoryType;
}

const COLLECTION_MAP: Record<string, Partial<SearchParams & { gender?: string; isBestseller?: string; isNew?: string }>> = {
  'for-him': { gender: 'Men' },
  'for-her': { gender: 'Women' },
  'unisex': { gender: 'Unisex' },
  'attars': { type: 'attar' },
  'signature': { isBestseller: 'true' },
  'limited': { isNew: 'true' },
};

interface SearchParams {
  category?: string;
  size?: string;
  fragranceFamily?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  sort?: string;
  type?: string;
  collection?: string;
  gender?: string;
  isBestseller?: string;
  isNew?: string;
  q?: string;
}

const PAGE_SIZE = 12;

function buildParamString(params: SearchParams): string {
  const sp = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val && key !== 'page') sp.set(key, val);
  }
  const qs = sp.toString();
  return qs ? `&${qs}` : '';
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function withoutFilter(params: SearchParams, key: string, value: string): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (!v || k === 'page') continue;
    if (k === 'minPrice' || k === 'maxPrice') continue;
    if (key === 'price' && k === 'minPrice' || key === 'price' && k === 'maxPrice') continue;
    if (k === key) {
      if (key === 'price') continue;
      const remaining = v.split(',').filter((x: string) => x !== value).filter(Boolean);
      if (remaining.length > 0) sp.set(k, remaining.join(','));
      continue;
    }
    sp.set(k, v);
  }
  const qs = sp.toString();
  return qs ? `/shop?${qs}` : '/shop';
}

function buildChips(params: SearchParams, selectedCategories: string[], selectedGenders: string[], selectedFamilies: string[], selectedTypes: string[], selectedPriceRanges: string[]): { label: string; href: string }[] {
  const chips: { label: string; href: string }[] = [];
  selectedCategories.forEach((v) => chips.push({ label: capitalize(v), href: withoutFilter(params, 'category', v) }));
  selectedGenders.forEach((v) => chips.push({ label: capitalize(v), href: withoutFilter(params, 'gender', v) }));
  selectedFamilies.forEach((v) => chips.push({ label: v, href: withoutFilter(params, 'fragranceFamily', v) }));
  selectedTypes.forEach((v) => chips.push({ label: capitalize(v), href: withoutFilter(params, 'type', v) }));
  selectedPriceRanges.forEach((label) => chips.push({ label, href: withoutFilter(params, 'price', '') }));
  if (params.isBestseller === 'true') chips.push({ label: 'Bestseller', href: withoutFilter(params, 'isBestseller', 'true') });
  if (params.isNew === 'true') chips.push({ label: 'New Arrivals', href: withoutFilter(params, 'isNew', 'true') });
  if (params.q) chips.push({ label: `Search: ${params.q}`, href: withoutFilter(params, 'q', params.q) });
  return chips;
}

export default async function ShopContent({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const rawCollection = Array.isArray(searchParams.collection) ? searchParams.collection[0] : searchParams.collection;
  const collectionMap = rawCollection ? COLLECTION_MAP[rawCollection] : undefined;

  const params: SearchParams = {
    category: Array.isArray(searchParams.category) ? searchParams.category.join(',') : searchParams.category,
    size: Array.isArray(searchParams.size) ? searchParams.size.join(',') : searchParams.size,
    fragranceFamily: Array.isArray(searchParams.fragranceFamily) ? searchParams.fragranceFamily.join(',') : searchParams.fragranceFamily,
    minPrice: searchParams.minPrice as string,
    maxPrice: searchParams.maxPrice as string,
    page: searchParams.page as string,
    sort: searchParams.sort as string,
    type: Array.isArray(searchParams.type) ? searchParams.type.join(',') : (searchParams.type || collectionMap?.type),
    collection: rawCollection,
    gender: Array.isArray(searchParams.gender) ? searchParams.gender.join(',') : (searchParams.gender || collectionMap?.gender),
    isBestseller: (typeof searchParams.isBestseller === 'string' ? searchParams.isBestseller : Array.isArray(searchParams.isBestseller) ? searchParams.isBestseller[0] : undefined) || collectionMap?.isBestseller,
    isNew: (typeof searchParams.isNew === 'string' ? searchParams.isNew : Array.isArray(searchParams.isNew) ? searchParams.isNew[0] : undefined) || collectionMap?.isNew,
    q: Array.isArray(searchParams.q) ? searchParams.q.join(' ') : searchParams.q,
  };

  if (collectionMap?.type && !params.type) {
    params.type = collectionMap.type;
  }

  const page = parseInt(params.page || '1');
  const skip = (page - 1) * PAGE_SIZE;
  const sort = params.sort || 'featured';

  const where: Record<string, unknown> = {
    isActive: true,
  };

  if (params.category) {
    where.categorySlug = { in: params.category.split(',') };
  }
  if (params.fragranceFamily) {
    where.fragranceFamily = { in: params.fragranceFamily.split(',') };
  }
  if (params.gender) {
    const genders = params.gender.split(',').map(g => normalizeGender(g));
    where.gender = { in: genders };
  }
  if (params.type) {
    const types = params.type.split(',').map(t => normalizeType(t));
    where.type = { in: types };
  }
  if (params.isBestseller === 'true') {
    where.isBestseller = true;
  }
  if (params.isNew === 'true') {
    where.isNew = true;
  }
  if (params.minPrice || params.maxPrice) {
    where.price = {};
    if (params.minPrice) (where.price as Record<string, number>).gte = parseFloat(params.minPrice);
    if (params.maxPrice && params.maxPrice !== 'Infinity') {
      (where.price as Record<string, number>).lte = parseFloat(params.maxPrice);
    }
  }
  if (params.q) {
    where.OR = [
      { name: { contains: params.q } },
      { description: { contains: params.q } },
      { type: { contains: params.q } },
      { gender: { contains: params.q } },
      { categorySlug: { contains: params.q } },
      { tags: { contains: params.q } },
      { productId: { contains: params.q } },
    ];
  }

  let orderBy: Record<string, string> = { createdAt: 'desc' };
  switch (sort) {
    case 'price-low':
      orderBy = { price: 'asc' };
      break;
    case 'price-high':
      orderBy = { price: 'desc' };
      break;
    case 'newest':
      orderBy = { createdAt: 'desc' };
      break;
    case 'rating':
      orderBy = { rating: 'desc' };
      break;
  }

  function parseJsonArray(val: string | null): string[] {
    if (!val) return [];
    try { return JSON.parse(val); } catch { return []; }
  }

  interface ShopProductRow {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice: number | null;
    image: string;
    images: string;
    categorySlug: string | null;
    size: string;
    
    isBestseller: boolean;
    isNew: boolean;
    rating: number;
    reviewCount: number;
    gender: string | null;
    season: string | null;
    impressionOf: string | null;
    tags: string | null;
    currency: string | null;
    type: string | null;
    applicatorType: string | null;
    origin: string | null;
    category: { name: string; slug: string } | null;
  }

  function mapToFormattedProduct(p: ShopProductRow): Product {
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      originalPrice: p.originalPrice ?? undefined,
      image: p.image || '',
      images: parseJsonArray(p.images),
      category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
      categorySlug: p.categorySlug ?? undefined,
      size: p.size || defaultSizeForType(p.type),
      
      isBestseller: p.isBestseller,
      isNew: p.isNew,
      rating: p.rating,
      reviewCount: p.reviewCount,
      gender: p.gender ?? undefined,
      season: p.season ?? undefined,
      impressionOf: p.impressionOf ?? undefined,
      tags: p.tags ?? undefined,
      currency: p.currency ?? undefined,
      type: classifyProductType(p),
    } as Product;
  }

  let formattedProducts: Product[] = [];
  let total = 0;

  try {
    const [products, count] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          originalPrice: true,
          image: true,
          images: true,
categorySlug: true,
      size: true,
      isBestseller: true,
          isNew: true,
          rating: true,
          reviewCount: true,
          gender: true,
          season: true,
          impressionOf: true,
          tags: true,
          currency: true,
          type: true,
          applicatorType: true,
          origin: true,
          category: { select: { name: true, slug: true } },
        },
        orderBy,
        skip,
        take: PAGE_SIZE,
      }),
      prisma.product.count({ where }),
    ]);
    total = count;
    formattedProducts = products.map((p) => mapToFormattedProduct(p));
  } catch (error) {
    debugLog('ShopContent:prisma.product.findMany', error);
    // Log the where clause that caused the failure for query debugging
    try {
      debugLog('ShopContent:where-clause', JSON.stringify(where, null, 2));
    } catch {
      // JSON.stringify may fail on circular refs - swallow
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const shownOnPage = Math.min(total, page * PAGE_SIZE);

  const selectedCategories = params.category?.split(',').filter(Boolean) || [];
  const selectedFamilies = params.fragranceFamily?.split(',').filter(Boolean) || [];
  const selectedGenders = params.gender?.split(',').filter(Boolean) || [];
  const selectedPriceRanges: string[] = [];
  const selectedTypes = params.type ? [params.type] : [];

  if (params.minPrice || params.maxPrice) {
    FILTERS.priceRanges.forEach((range) => {
      const minMatch = params.minPrice === range.min.toString();
      const maxMatch = params.maxPrice === (range.max === Infinity ? '' : range.max?.toString());
      if (minMatch && maxMatch) {
        selectedPriceRanges.push(range.label);
      }
    });
  }

  const chips = buildChips(params, selectedCategories, selectedGenders, selectedFamilies, selectedTypes, selectedPriceRanges);

  return (
    <div className="bg-white">
      <div className="container-custom py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          <aside className="lg:w-72 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground uppercase tracking-wider">Filters</h2>
                {(selectedCategories.length + selectedFamilies.length + selectedGenders.length + selectedPriceRanges.length + selectedTypes.length) > 0 && (
                  <Link
                    href="/shop"
                    className="text-[#9a958d] text-sm hover:text-[#B6965D] transition-colors"
                  >
                    Clear All Filters
                  </Link>
                )}
              </div>

              <FilterSection
                title="Category"
                options={FILTERS.categories}
                selected={selectedCategories}
                paramKey="category"
                currentParams={params}
              />

              <FilterSection
                title="Gender"
                options={FILTERS.categories}
                selected={selectedGenders}
                paramKey="gender"
                currentParams={params}
              />

              <FilterSection
                title="Fragrance Family"
                options={FILTERS.fragranceFamilies}
                selected={selectedFamilies}
                paramKey="fragranceFamily"
                currentParams={params}
              />

              <FilterSection
                title="Price"
                options={FILTERS.priceRanges.map((r) => r.label)}
                selected={selectedPriceRanges}
                paramKey="price"
                priceRanges={FILTERS.priceRanges}
                currentParams={params}
              />

              <FilterSection
                title="Product Type"
                options={FILTERS.productTypes}
                selected={selectedTypes}
                paramKey="type"
                currentParams={params}
              />
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-border">
              <div className="flex items-center gap-4 w-full sm:w-auto">
<p className="text-muted-foreground text-sm">
                    Showing {total === 0 ? 0 : shownOnPage} of {total} product{total !== 1 ? 's' : ''}
                  </p>
                <div className="lg:hidden ml-auto">
                  <MobileFilterDrawer
                    filterCount={
                      selectedCategories.length + selectedFamilies.length + selectedGenders.length + selectedPriceRanges.length + selectedTypes.length
                    }
                  >
                    <FilterSection
                      title="Category"
                      options={FILTERS.categories}
                      selected={selectedCategories}
                      paramKey="category"
                      currentParams={params}
                      headingClassName="text-foreground text-base font-bold uppercase tracking-wider mb-4"
                      rowClassName="min-h-[44px] items-center"
                    />
                    <FilterSection
                      title="Gender"
                      options={FILTERS.categories}
                      selected={selectedGenders}
                      paramKey="gender"
                      currentParams={params}
                      headingClassName="text-foreground text-base font-bold uppercase tracking-wider mb-4"
                      rowClassName="min-h-[44px] items-center"
                    />
                    <FilterSection
                      title="Fragrance Family"
                      options={FILTERS.fragranceFamilies}
                      selected={selectedFamilies}
                      paramKey="fragranceFamily"
                      currentParams={params}
                      headingClassName="text-foreground text-base font-bold uppercase tracking-wider mb-4"
                      rowClassName="min-h-[44px] items-center"
                    />
                    <FilterSection
                      title="Price"
                      options={FILTERS.priceRanges.map((r) => r.label)}
                      selected={selectedPriceRanges}
                      paramKey="price"
                      priceRanges={FILTERS.priceRanges}
                      currentParams={params}
                      headingClassName="text-foreground text-base font-bold uppercase tracking-wider mb-4"
                      rowClassName="min-h-[44px] items-center"
                    />
                    <FilterSection
                      title="Product Type"
                      options={FILTERS.productTypes}
                      selected={selectedTypes}
                      paramKey="type"
                      currentParams={params}
                      headingClassName="text-foreground text-base font-bold uppercase tracking-wider mb-4"
                      rowClassName="min-h-[44px] items-center"
                    />
                  </MobileFilterDrawer>
                </div>
              </div>
              <SortSelect currentSort={sort} />
            </div>

            {formattedProducts.length === 0 ? (
              <div className="text-center py-20 bg-muted/50">
                <div className="mb-6">
                  <svg className="w-16 h-16 mx-auto text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-muted-foreground mb-6">No products found matching your filters.</p>
                <Link href="/shop" className="text-sm border-b border-foreground pb-1 hover:opacity-60 transition-opacity">
                  Clear All Filters
                </Link>
              </div>
            ) : (
              <>
                {chips.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-8">
                    {chips.map((chip) => (
                      <Link
                        key={chip.label}
                        href={chip.href}
                        className="inline-flex items-center gap-1.5 pl-3 pr-2 py-2 text-xs text-foreground border border-border rounded-full bg-background hover:border-[#B6965D] hover:text-[#B6965D] transition-colors"
                      >
                        {chip.label}
                        <span className="text-[#9a958d]" aria-hidden="true">×</span>
                      </Link>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  {formattedProducts.map((product) => (
                    <ShopProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      slug={product.slug}
                      price={product.price}
                      originalPrice={product.originalPrice ?? undefined}
                      image={product.image}
                      images={product.images}
                      size={product.size}
                      rating={product.rating}
                      reviewCount={product.reviewCount}
                      currency={product.currency}
                    />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    {page > 1 && (
                      <Link
                        href={`/shop?page=${page - 1}${buildParamString(params)}`}
                        className="px-4 py-2 border border-input text-sm hover:bg-foreground hover:text-background transition-colors"
                      >
                        Previous
                      </Link>
                    )}
                    <span className="px-4 py-2 text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    {page < totalPages && (
                      <Link
                        href={`/shop?page=${page + 1}${buildParamString(params)}`}
                        className="px-4 py-2 border border-input text-sm hover:bg-foreground hover:text-background transition-colors"
                      >
                        Next
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
