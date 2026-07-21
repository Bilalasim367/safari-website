import Link from 'next/link';

const FILTERS = {
  categories: ['men', 'women', 'unisex'],
  genders: ['men', 'women', 'unisex'],
  sizes: ['30ml', '50ml', '100ml'],
  fragranceFamilies: ['Floral', 'Woody', 'Oriental', 'Fresh'],
  productTypes: ['attar', 'perfume'],
  priceRanges: [
    { label: 'Under PKR 5,000', min: 0, max: 5000 },
    { label: 'PKR 5,000 - PKR 15,000', min: 5000, max: 15000 },
    { label: 'PKR 15,000 - PKR 25,000', min: 15000, max: 25000 },
    { label: 'Over PKR 25,000', min: 25000, max: Infinity },
  ],
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
}

export function FilterSection({
  title,
  options,
  selected,
  paramKey,
  priceRanges,
  currentParams,
}: {
  title: string;
  options: string[];
  selected: string[];
  paramKey: string;
  priceRanges?: { label: string; min: number; max: number }[];
  currentParams: SearchParams;
}) {
  const buildHref = (option: string, isSelected: boolean) => {
    const sp = new URLSearchParams();
    for (const [key, val] of Object.entries(currentParams)) {
      if (val && key !== paramKey) sp.set(key, val);
    }

    if (paramKey === 'price' && priceRanges) {
      const range = priceRanges.find((r) => r.label === option);
      const newMin = range?.min ?? '';
      const newMax = range?.max === Infinity ? '' : range?.max ?? '';
      if (newMin) sp.set('minPrice', String(newMin));
      if (newMax) sp.set('maxPrice', String(newMax));
      return `/shop?${sp.toString()}`;
    }

    const newSelected = isSelected
      ? selected.filter((s) => s !== option)
      : [...selected, option];

    if (newSelected.length === 0) {
      sp.delete(paramKey);
    } else {
      sp.set(paramKey, newSelected.join(','));
    }

    const qs = sp.toString();
    return qs ? `/shop?${qs}` : '/shop';
  };

  return (
    <div className="mb-8">
      <h3 className="text-foreground text-xs font-bold uppercase tracking-[0.2em] mb-4">{title}</h3>
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          const href = buildHref(option, isSelected);

          return (
            <Link key={option} href={href} className="flex items-center gap-3 group">
              <span
                className={`w-4 h-4 border flex items-center justify-center ${
                  isSelected
                    ? 'bg-foreground border-foreground'
                    : 'border-input'
                }`}
              >
                {isSelected && (
                  <svg className="w-3 h-3 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className="text-muted-foreground group-hover:text-foreground transition-colors text-sm">
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default FILTERS;
