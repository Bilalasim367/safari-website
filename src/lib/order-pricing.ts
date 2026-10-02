import {
  findSizeOption,
  resolveDefaultSize,
  resolveSizeOptions,
  type SizePriceFields,
} from './size-pricing';

/**
 * Authoritative server-side line pricing.
 *
 * The storefront and the order pipeline must never disagree about what a
 * size costs. Both `/api/cart` and `/api/orders` resolve a line through
 * `priceCartLine` against the CURRENT database row, so a client-supplied
 * price is never trusted and the base `price` column (a stale bulk-import
 * artifact matching no sellable volume) is never used as a line price.
 */

export type PriceableProduct = SizePriceFields & {
  id: string;
  name?: string | null;
  image?: string | null;
  inStock?: boolean | null;
  isActive?: boolean | null;
};

export type LinePricing =
  | { ok: true; size: string; price: number }
  | { ok: false; code: 'unknown_size' | 'unavailable' | 'unpriced'; message: string };

/**
 * Resolve the unit price for one requested size.
 *
 * - An explicit size must be one the product actually offers. Anything else is
 *   rejected (`unknown_size`) rather than silently priced at another volume,
 *   which is how a customer ends up charged for 50ml while believing they
 *   bought 6ml.
 * - With no size supplied, the product's default volume for its type is used
 *   (Attar 12ml, Perfume 50ml), matching the product detail page.
 * - A product that is not currently sellable resolves to `unavailable` so the
 *   caller can refuse the line instead of quoting a price it cannot honour.
 */
export function priceCartLine(
  product: PriceableProduct,
  requestedSize?: string | null,
): LinePricing {
  if (product.inStock === false) {
    return {
      ok: false,
      code: 'unavailable',
      message: `Currently unavailable: ${product.name || product.id}`,
    };
  }

  const options = resolveSizeOptions(product);
  if (options.length === 0) {
    return {
      ok: false,
      code: 'unpriced',
      message: `No sellable size available for ${product.name || product.id}`,
    };
  }

  if (requestedSize && requestedSize.trim()) {
    const match = findSizeOption(options, requestedSize);
    if (!match) {
      return {
        ok: false,
        code: 'unknown_size',
        message: `Size "${requestedSize}" is not available for ${product.name || product.id}`,
      };
    }
    return { ok: true, size: match.size, price: match.price };
  }

  const size = resolveDefaultSize(options, product);
  const fallback = size ? findSizeOption(options, size) : null;
  if (!fallback) {
    return {
      ok: false,
      code: 'unpriced',
      message: `No sellable size available for ${product.name || product.id}`,
    };
  }
  return { ok: true, size: fallback.size, price: fallback.price };
}
