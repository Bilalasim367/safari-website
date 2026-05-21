# Mobile UI Improvement Plan — Customer Side

## Completed Features

- ✅ **Hamburger dark theme** — Black background, white/gold text, dark dividers
- ✅ **Hamburger position fixed** — Inline inside header, no longer floating
- ✅ **Mobile filter drawer** — Bottom sheet with all filter options + count badge
- ✅ **Touch-friendly ProductCard** — Tap-to-reveal Quick View, trust strip hidden on mobile
- ✅ **Sticky Add-to-Cart bar** — Mobile bottom bar with price + quantity + Buy Now
- ✅ **Checkout responsive** — Shorter step lines, stacked form fields on mobile
- ✅ **Header height** — `h-16 md:h-20` (70px target on mobile)
- ✅ **All pages padding** — `pt-16 md:pt-20` (12 customer pages)
- ✅ **Cart sidebar** — Smaller images, larger touch targets on mobile
- ✅ **Channel picker removed** — Physical/Online toggle gone
- ✅ **Buy Now button** — One-click purchase redirects to checkout
- ✅ **SearchOverlay** — Hardcoded grays replaced with theme variables

## Product Detail Page — Mobile Fixes

| # | Issue | Current | Fix |
|---|-------|---------|-----|
| 1 | Action row overflows | `[- 1 +] [Add to Cart] [Buy Now] [❤]` on one line | Stack qty row on top, buttons below on mobile; hide heart on mobile (already in image) |
| 2 | Gap too large | `gap-16 lg:gap-24` (64px) | `gap-8 lg:gap-16 lg:gap-24` (32px mobile) |
| 3 | Image too tall | `minHeight: '400px'` | `min-h-[300px] lg:min-h-[400px]` |
| 4 | Vertical padding excessive | `py-16` or `py-16 lg:py-24` | `py-8 md:py-16`, `py-10 lg:py-24` |
| 5 | Inconsistent container | `max-w-[1280px] mx-auto px-6` | Use `container-custom` class |
| 6 | Loading skeleton offset | `pt-24` | `pt-16 md:pt-24` |
| 7 | Not-found page colors | `text-black text-gray-500` | `text-foreground text-muted-foreground` |
