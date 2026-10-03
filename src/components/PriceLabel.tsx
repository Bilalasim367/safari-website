import { cn } from "@/lib/utils";

type PriceLabelProps = {
  /** `null`/`undefined` means the product has no sellable price right now. */
  price: number | null | undefined;
  /** Currency prefix as the surrounding design already renders it, e.g. "PKR". */
  prefix?: string;
  className?: string;
};

/**
 * Renders a retail price, or an explicit "Unavailable" when we cannot honestly
 * quote one.
 *
 * A product with no priced size must never display a figure, because any
 * figure on offer would come from the stale base `price` column and describe
 * no real volume. Keeping that state visible here means every card and
 * carousel tells the same story instead of each inventing its own fallback.
 */
export default function PriceLabel({ price, prefix, className }: PriceLabelProps) {
  if (price === null || price === undefined) {
    return (
      <span className={cn("text-muted-foreground", className)}>Unavailable</span>
    );
  }
  return (
    <span className={className}>
      {prefix ? `${prefix} ` : ""}
      {price.toLocaleString()}
    </span>
  );
}
