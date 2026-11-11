import {
  findSizeOption,
  isDeclaredSize,
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
  | {
      ok: false;
      code: 'unknown_size' | 'unpriced_size' | 'unavailable' | 'unpriced';
      message: string;
    };

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
  const label = product.name || product.id;

  if (requestedSize && requestedSize.trim()) {
    const match = findSizeOption(options, requestedSize);
    if (match) return { ok: true, size: match.size, price: match.price };

    // Distinguish the two failure modes: a size this product never sold,
    // versus a size it does sell but for which nobody has entered an online
    // price. The second is a data gap that must be fixed before the size can
    // be sold -- it must never quietly resolve to the stale base price.
    //
    // Checked before the "no sellable size" guard below so that a product
    // whose only volume is unpriced still reports the actionable reason.
    if (isDeclaredSize(product, requestedSize)) {
      return {
        ok: false,
        code: 'unpriced_size',
        message: `Size "${requestedSize}" has no online price set for ${label}`,
      };
    }
    return {
      ok: false,
      code: 'unknown_size',
      message: `Size "${requestedSize}" is not available for ${label}`,
    };
  }

  if (options.length === 0) {
    return {
      ok: false,
      code: 'unpriced',
      message: `No sellable size available for ${label}`,
    };
  }

  const size = resolveDefaultSize(options, product);
  const fallback = size ? findSizeOption(options, size) : null;
  if (!fallback) {
    return {
      ok: false,
      code: 'unpriced',
      message: `No sellable size available for ${label}`,
    };
  }
  return { ok: true, size: fallback.size, price: fallback.price };
}
