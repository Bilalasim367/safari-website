/**
 * Delivery charge (PKR) added to every order bill.
 *
 * This is a separate line on top of the cart subtotal; product prices are
 * never modified. The storefront summaries and the server-side order pipeline
 * both import from here, so the bill the customer sees always equals the
 * order saved in the database.
 *
 * The admin Shipping & Tax settings can override the amount: a positive
 * `shippingFee` wins, and an order at/above `freeShippingThreshold` ships
 * free (0 disables free shipping). With neither configured, the flat
 * DELIVERY_CHARGE applies.
 */
export const DELIVERY_CHARGE = 250;

export type DeliverySettings = {
  shippingFee?: number | null;
  freeShippingThreshold?: number | null;
};

export function resolveDeliveryCharge(
  subtotal: number,
  settings?: DeliverySettings | null,
): number {
  const threshold = Number(settings?.freeShippingThreshold ?? 0);
  if (threshold > 0 && subtotal >= threshold) return 0;

  const configuredFee = Number(settings?.shippingFee ?? 0);
  if (Number.isFinite(configuredFee) && configuredFee > 0) return configuredFee;

  return DELIVERY_CHARGE;
}
