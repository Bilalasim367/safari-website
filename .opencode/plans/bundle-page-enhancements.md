# Bundle Page Enhancement & Homepage Padding Reduction

> Created: 2026-05-15
> Status: In Progress

---

## Part A: Reduce Homepage Section Padding

**File:** `src/components/HomePage.tsx`

Reduce excessive vertical spacing between homepage sections. Standardize padding and remove redundant inline style overrides.

| Section | Current | New |
|---|---|---|
| Trust & Value | `py-16 md:py-24` | `py-10 md:py-14` |
| New Arrivals | `py-16 md:py-24`, `mb-16` | `py-10 md:py-14`, `mb-10` |
| Collections | `py-16 md:py-24` + `paddingBottom:80px` + `pb-16` on h2 | `py-10 md:py-14`, remove inline, `mb-10`, remove `pb-16` |
| Our Story | `py-24` + `paddingTop:120px, paddingBottom:120px` | `py-14`, remove inline overrides |
| Best Sellers | `py-16 md:py-24`, `mb-16` | `py-10 md:py-14`, `mb-10` |
| Bundles | `py-24` + inline 80px override + `paddingBottom:60px` on h2 | `py-14`, remove inline, remove extra heading pb |
| Shop by Scent | `py-24` + inline 80px override + `paddingBottom:60px` on h2 + `paddingBottom:20px` on grid | `py-14`, remove all inline, remove extra heading pb |
| Testimonials | `py-24` | `py-14` |
| Newsletter | `py-24` | `py-14` |

Additional cleanup: remove `paddingBottom:30px` inline styles on paragraphs in Our Story section.

---

## Part B: Enhance Bundle Detail Page

### B1. Seed Data Update (`prisma/seed.ts`)

- Add `image` field with Unsplash URLs to all bundles
- Add `BundleItem` records linking Travel Essentials to 4 products (qty=1 each)
- Suggested products for Travel Essentials: Safari Noir, Safari Rose, Safari Citrus, Safari Vanilla

### B2. Enhanced `[slug]/page.tsx`

New page layout:
1. **Breadcrumb navigation** (Home > Bundles > Bundle Name)
2. **Hero section** with image (or gradient fallback), save badge overlay, bundle name, description, size, pricing
3. **Features grid** — dynamically generated key selling points based on bundle properties (e.g., travel-friendly size, great savings, curated selection)
4. **What's Inside** product cards showing included items with images, names, quantities
5. **Value breakdown** — price comparison showing savings
6. **Add to Cart CTA** with trust signals
7. **Related bundles** section at bottom

Keeps the generic `[slug]` pattern so it works for ALL bundles.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/HomePage.tsx` | Reduce section padding |
| `prisma/seed.ts` | Add bundle images + BundleItem records |
| `src/app/bundles/[slug]/page.tsx` | Enhanced bundle detail layout |
