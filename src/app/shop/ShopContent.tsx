import prisma from '@/lib/postgres';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  category: { name: string; slug: string } | null;
  categorySlug?: string | null;
  size: string;
  isBestseller: boolean;
  isNew: boolean;
}

interface SearchParams {
  category?: string;
  size?: string;
  fragranceFamily?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  sort?: string;
}

export const revalidate = 60;

const FILTERS = {
  categories: ['Men', 'Women', 'Unisex'],
  sizes: ['30ml', '50ml', '100ml'],
  fragranceFamilies: ['Floral', 'Woody', 'Oriental', 'Fresh'],
  priceRanges: [
    { label: 'Under $100', min: 0, max: 100 },
    { label: '$100 - $150', min: 100, max: 150 },
    { label: '$150 - $200', min: 150, max: 200 },
    { label: 'Over $200', min: 200, max: Infinity },
  ],
};

const PAGE_SIZE = 12;

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
  };
  
  const page = parseInt(params.page || '1');
  const skip = (page - 1) * PAGE_SIZE;
  const sort = params.sort || 'featured';

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

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
        skip,
        take: PAGE_SIZE,
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / PAGE_SIZE);

    const formattedProducts: Product[] = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      originalPrice: p.originalPrice ?? undefined,
      image: p.image || '',
      category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
      categorySlug: p.categorySlug ?? undefined,
      size: p.size || '50ml',
      isBestseller: p.isBestseller,
      isNew: p.isNew,
    }));

    const selectedCategories = params.category?.split(',').filter(Boolean) || [];
    const selectedSizes = params.size?.split(',').filter(Boolean) || [];
    const selectedFamilies = params.fragranceFamily?.split(',').filter(Boolean) || [];
    const selectedPriceRanges: string[] = [];

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
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-black uppercase tracking-wider">Filters</h2>
                  {(selectedCategories.length + selectedSizes.length + selectedFamilies.length + selectedPriceRanges.length) > 0 && (
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
                />

                <FilterSection
                  title="Size"
                  options={FILTERS.sizes}
                  selected={selectedSizes}
                  paramKey="size"
                />

                <FilterSection
                  title="Fragrance Family"
                  options={FILTERS.fragranceFamilies}
                  selected={selectedFamilies}
                  paramKey="fragranceFamily"
                />

                <FilterSection
                  title="Price"
                  options={FILTERS.priceRanges.map((r) => r.label)}
                  selected={selectedPriceRanges}
                  paramKey="price"
                  priceRanges={FILTERS.priceRanges}
                />
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-200">
                <p className="text-gray-500 text-sm">
                  {total} Product{total !== 1 ? 's' : ''}
                </p>
                <select
                  defaultValue={sort}
                  className="bg-transparent border border-gray-300 text-black text-sm px-4 py-2.5 outline-none focus:border-black transition-colors cursor-pointer"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

              {formattedProducts.length === 0 ? (
                <div className="text-center py-20 bg-gray-50">
                  <div className="mb-6">
                    <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-6">No products found matching your filters.</p>
                  <Link href="/shop" className="text-sm border-b border-black pb-1 hover:opacity-60 transition-opacity">
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
                        category={product.category?.name || 'Unisex'}
                        isNew={product.isNew}
                        isBestseller={product.isBestseller}
                        size={product.size}
                      />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                      {page > 1 && (
                        <Link
                          href={`/shop?page=${page - 1}${params.category ? `&category=${params.category}` : ''}${params.size ? `&size=${params.size}` : ''}${params.fragranceFamily ? `&fragranceFamily=${params.fragranceFamily}` : ''}${params.sort ? `&sort=${params.sort}` : ''}`}
                          className="px-4 py-2 border border-gray-300 text-sm hover:bg-black hover:text-white transition-colors"
                        >
                          Previous
                        </Link>
                      )}
                      <span className="px-4 py-2 text-sm">
                        Page {page} of {totalPages}
                      </span>
                      {page < totalPages && (
                        <Link
                          href={`/shop?page=${page + 1}${params.category ? `&category=${params.category}` : ''}${params.size ? `&size=${params.size}` : ''}${params.fragranceFamily ? `&fragranceFamily=${params.fragranceFamily}` : ''}${params.sort ? `&sort=${params.sort}` : ''}`}
                          className="px-4 py-2 border border-gray-300 text-sm hover:bg-black hover:text-white transition-colors"
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
  } catch (error) {
    console.error('Error fetching products:', error);
    return (
      <div className="container-custom py-20 text-center">
        <p className="text-gray-500 mb-4">Failed to load products. Please try again.</p>
        <Link href="/shop" className="btn-primary">
          Try Again
        </Link>
      </div>
    );
  }
}

function FilterSection({
  title,
  options,
  selected,
  paramKey,
  priceRanges,
}: {
  title: string;
  options: string[];
  selected: string[];
  paramKey: string;
  priceRanges?: { label: string; min: number; max: number }[];
}) {
  const buildHref = (option: string, isSelected: boolean) => {
    let newSelected: string[];
    
    if (paramKey === 'price' && priceRanges) {
      const range = priceRanges.find((r) => r.label === option);
      const newMin = range?.min ?? '';
      const newMax = range?.max === Infinity ? '' : range?.max ?? '';
      return `/shop?minPrice=${newMin}&maxPrice=${newMax}`;
    }
    
    newSelected = isSelected
      ? selected.filter((s) => s !== option)
      : [...selected, option];
    
    if (newSelected.length === 0) {
      return '/shop';
    }
    
    return `/shop?${paramKey}=${newSelected.join(',')}`;
  };

  return (
    <div className="mb-8">
      <h3 className="text-black text-xs font-bold uppercase tracking-[0.2em] mb-4">{title}</h3>
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          const href = buildHref(option, isSelected);

          return (
            <Link
              key={option}
              href={href}
              className="flex items-center gap-3 group"
            >
              <span
                className={`w-4 h-4 border flex items-center justify-center ${
                  isSelected
                    ? 'bg-black border-black'
                    : 'border-gray-300'
                }`}
              >
                {isSelected && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className="text-gray-600 group-hover:text-black transition-colors text-sm">
                {option}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function ShopError({ message }: { message: string }) {
  return (
    <div className="container-custom py-20 text-center">
      <p className="text-gray-500 mb-4">{message}</p>
      <Link href="/shop" className="btn-primary">
        Try Again
      </Link>
    </div>
  );
}