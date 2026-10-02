import { defaultSizeForType } from './normalize';

/**
 * Authoritative storefront size pricing.
 *
 * `price{3,6,12,50}mlOnline` are the online retail prices and are the ONLY
 * correct source for a per-size price. `price*Physical` are shop/wholesale
 * cost, `sizePrices` JSON mirrors those cost prices, and the base `price`
 * column is a stale bulk-import artifact that matches no size.
 */

export const SIZE_ORDER = ['3ml', '6ml', '12ml', '50ml'] as const;

export type SizeOption = {
  size: string;
  label: string;
  price: number;
};

export type SizePriceFields = {
  price?: number | null;
  size?: string | null;
  type?: string | null;
  sizesAvailable?: string | null;
  price3mlOnline?: number | null;
  price6mlOnline?: number | null;
  price12mlOnline?: number | null;
  price50mlOnline?: number | null;
};

const COLUMN_BY_SIZE: Record<string, keyof SizePriceFields> = {
  '3ml': 'price3mlOnline',
  '6ml': 'price6mlOnline',
  '12ml': 'price12mlOnline',
  '50ml': 'price50mlOnline',
};

function normalizeSize(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, '');
}

function toPositiveInt(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

function formatLabel(size: string): string {
  const m = /^(\d+(?:\.\d+)?)\s*(ml|mg|g)$/i.exec(size);
  if (!m) return size.toUpperCase();
  return `${m[1]} ${m[2].toUpperCase()}`;
}

function parseAvailableSizes(sizesAvailable: string | null | undefined): string[] {
  if (!sizesAvailable) return [];
  return sizesAvailable
    .split(',')
    .map(normalizeSize)
    .filter(Boolean);
}

function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a as (typeof SIZE_ORDER)[number]);
    const bi = SIZE_ORDER.indexOf(b as (typeof SIZE_ORDER)[number]);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    const an = parseFloat(a);
    const bn = parseFloat(b);
    if (Number.isFinite(an) && Number.isFinite(bn)) return an - bn;
    return a.localeCompare(b);
  });
}

export function resolveSizeOptions(
  product: SizePriceFields | null | undefined
): SizeOption[] {
  if (!product) return [];
  const declared = parseAvailableSizes(product.sizesAvailable);
  const candidates = declared.length
    ? declared
    : [normalizeSize(product.size || '')].filter(Boolean);

  const options: SizeOption[] = [];
  for (const size of sortSizes(candidates)) {
    const column = COLUMN_BY_SIZE[size];
    const priced = column ? toPositiveInt(product[column]) : null;
    if (priced !== null) {
      options.push({ size, label: formatLabel(size), price: priced });
      continue;
    }
    const fallback = toPositiveInt(product.price);
    if (fallback !== null) {
      options.push({ size, label: formatLabel(size), price: fallback });
    }
  }
  return options;
}

export function resolveDefaultSize(
  options: SizeOption[],
  product: Pick<SizePriceFields, 'type' | 'size'> | null | undefined
): string | null {
  if (options.length === 0) return null;
  const preferred = normalizeSize(defaultSizeForType(product?.type));
  const match = options.find((o) => o.size === preferred);
  if (match) return match.size;
  const declared = normalizeSize(product?.size || '');
  const declaredMatch = options.find((o) => o.size === declared);
  return (declaredMatch ?? options[0]).size;
}

export function findSizeOption(
  options: SizeOption[],
  size: string | null | undefined
): SizeOption | null {
  if (!size) return null;
  const target = normalizeSize(size);
  return options.find((o) => o.size === target) ?? null;
}