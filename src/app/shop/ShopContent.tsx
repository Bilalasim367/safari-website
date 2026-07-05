import prisma from '@/lib/turso';
import { Prisma } from '@prisma/client';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import SortSelect from './SortSelect';
import MobileFilterDrawer from './MobileFilterDrawer';
import FILTERS, { FilterSection } from './FilterSection';
import { classifyProductType, type ProductType } from '@/lib/product-types';

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
  price3mlPhysical?: number | null;
  price6mlPhysical?: number | null;
  price12mlPhysical?: number | null;
  price50mlPhysical?: number | null;
  price3mlOnline?: number | null;
  price6mlOnline?: number | null;
  price12mlOnline?: number | null;
  price50mlOnline?: number | null;
  currency?: string;
  lowestPhysicalPrice?: number | null;
  type: ProductType;
}

interface SearchParams {
  category?: string;
  size?: string;
  fragranceFamily?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  sort?: string;
  type?: string;
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

export default async function ShopContent({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const params: SearchParams = {
    category: Array.isArray(searchParams.category) ? searchParams.category.join(',') : searchParams.category,
    size: Array.isArray(searchParams.size) ? searchParams.size.join(',') : searchParams.size,
    fragranceFamily: Array.isArray(searchParams.fragranceFamily) ? searchParams.fragranceFamily.join(',') : searchParams.fragranceFamily,
    minPrice: searchParams.minPrice as string,
    maxPrice: searchParams.maxPrice as string,
    page: searchParams.page as string,
    sort: searchParams.sort as string,
    type: Array.isArray(searchParams.type) ? searchParams.type.join(',') : searchParams.type,
  };
  
  const page = parseInt(params.page || '1');
  const skip = (page - 1) * PAGE_SIZE;
  const sort = params.sort || 'featured';
  const typeFilter = params.type as ProductType | undefined;

  const where: Record<string, unknown> = {};

  if (params.category) {
    where.categorySlug = { in: params.category.split(',') };
  }
  if (params.size) {
    where.size = { in: params.size.split(',') };
  }
  if (params.fragranceFamily) {
    where.fragranceFamily = { in: params.fragranceFamily.split(',') };
  }
  if (params.minPrice || params.maxPrice) {
    where.price = {};
    if (params.minPrice) (where.price as Record<string, number>).gte = parseFloat(params.minPrice);
    if (params.maxPrice && params.maxPrice !== 'Infinity') {
      (where.price as Record<string, number>).lte = parseFloat(params.maxPrice);
    }
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

  function mapToFormattedProduct(p: Prisma.ProductGetPayload<{ include: { category: true } }>): Product {
    const physicalPrices = [p.price3mlPhysical, p.price6mlPhysical, p.price12mlPhysical, p.price50mlPhysical]
      .filter((pr): pr is number => pr !== null);
    const lowestPhysicalPrice = physicalPrices.length > 0 ? Math.min(...physicalPrices) : null;

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
      size: p.size || '50ml',
      isBestseller: p.isBestseller,
      isNew: p.isNew,
      rating: p.rating,
      reviewCount: p.reviewCount,
      gender: p.gender ?? undefined,
      season: p.season ?? undefined,
      impressionOf: p.impressionOf ?? undefined,
      tags: p.tags ?? undefined,
      price3mlPhysical: p.price3mlPhysical ?? undefined,
      price6mlPhysical: p.price6mlPhysical ?? undefined,
      price12mlPhysical: p.price12mlPhysical ?? undefined,
      price50mlPhysical: p.price50mlPhysical ?? undefined,
      price3mlOnline: p.price3mlOnline ?? undefined,
      price6mlOnline: p.price6mlOnline ?? undefined,
      price12mlOnline: p.price12mlOnline ?? undefined,
      price50mlOnline: p.price50mlOnline ?? undefined,
      currency: p.currency ?? undefined,
      lowestPhysicalPrice,
      type: classifyProductType(p),
    } as Product;
  }

  let formattedProducts: Product[] = [];
  let total = 0;

  try {
    if (typeFilter) {
      const allProducts = await prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
      });
      const allFormatted = allProducts.map((p) => mapToFormattedProduct(p as Prisma.ProductGetPayload<{ include: { category: true } }>));
      const filtered = allFormatted.filter((p) => p.type === typeFilter);
      total = filtered.length;
      formattedProducts = filtered.slice(skip, skip + PAGE_SIZE);
    } else {
      const [products, count] = await Promise.all([
        prisma.product.findMany({
          where,
          include: { category: true },
          orderBy,
          skip,
          take: PAGE_SIZE,
        }),
        prisma.product.count({ where }),
      ]);
      total = count;
      formattedProducts = (products as Prisma.ProductGetPayload<{ include: { category: true } }>[]).map((p) => mapToFormattedProduct(p));
    }
  } catch (error) {
    console.error('Error fetching products:', error);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const selectedCategories = params.category?.split(',').filter(Boolean) || [];
  const selectedSizes = params.size?.split(',').filter(Boolean) || [];
  const selectedFamilies = params.fragranceFamily?.split(',').filter(Boolean) || [];
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

  return (
    <div className="bg-white">
        <div className="container-custom py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
            <aside className="lg:w-72 flex-shrink-0 hidden lg:block">
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground uppercase tracking-wider">Filters</h2>
                  {(selectedCategories.length + selectedSizes.length + selectedFamilies.length + selectedPriceRanges.length + selectedTypes.length) > 0 && (
                    <Link
                      href="/shop"
                      className="text-black text-sm hover:underline underline-offset-2 transition-all"
                    >
                      Clear All
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
                  title="Size"
                  options={FILTERS.sizes}
                  selected={selectedSizes}
                  paramKey="size"
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
                    {total} Product{total !== 1 ? 's' : ''}
                  </p>
                  <div className="lg:hidden ml-auto">
                    <MobileFilterDrawer
                      filterCount={
                        selectedCategories.length + selectedSizes.length + selectedFamilies.length + selectedPriceRanges.length + selectedTypes.length
                      }
                    >
                      <FilterSection
                        title="Category"
                        options={FILTERS.categories}
                        selected={selectedCategories}
                        paramKey="category"
                        currentParams={params}
                      />
                      <FilterSection
                        title="Size"
                        options={FILTERS.sizes}
                        selected={selectedSizes}
                        paramKey="size"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10">
                    {formattedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        slug={product.slug}
                        price={product.price}
                        originalPrice={product.originalPrice ?? undefined}
                        image={product.image}
                        images={product.images}
                        category={product.category?.name || 'Unisex'}
                        isNew={product.isNew}
                        isBestseller={product.isBestseller}
                        size={product.size}
                        rating={product.rating}
                        reviewCount={product.reviewCount}
                        gender={product.gender}
                        season={product.season}
                        impressionOf={product.impressionOf}
                        lowestPrice={product.lowestPhysicalPrice ?? undefined}
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


