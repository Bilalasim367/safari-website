# Implementation Plan — Safari Perfumes

## Part A: Reduce Homepage Section Padding

**File:** `src/components/HomePage.tsx`

Reduce excessive vertical spacing between homepage sections. Standardize padding and remove redundant inline style overrides.

All sections currently use `py-16 md:py-24` (64px/96px) or `py-24` (96px) with inline overrides up to 120px.

**Changes:** Reduce to `py-10 md:py-14` (40px/56px) for most sections, remove all inline override styles that double-up padding.

## Part B: Enhance Bundle Detail Page

### B1. Seed Data (`prisma/seed.ts`)
- Add image URLs to bundle records
- Add BundleItem records linking Travel Essentials to 4 products

### B2. Enhanced `[slug]/page.tsx`
- Breadcrumb nav
- Hero with gradient + save badge + pricing
- Features grid (auto-generated from bundle properties)
- "What's Inside" product cards
- Value breakdown showing savings
- Add to Cart CTA with trust signals
- Related bundles section

---

For full details see `.opencode/plans/bundle-page-enhancements.md`
