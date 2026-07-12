# Safari Perfumes E-commerce - Launch Readiness Plan

## Executive Summary
This plan addresses critical issues preventing production launch, focusing on:
1. **Attar/Perfume product experience perfection** - data consistency, UI, customer-facing features
2. **Image upload reliability** - production-ready storage, validation, fallbacks
3. **Database integrity** - Turso/libSQL configuration, migrations, seeding
4. **Product Detail Page <-> Admin Form data parity** - all fields sync correctly
5. **UX/UI polish** - professional feel, conversion optimization
6. **Homepage preservation** - zero changes to existing home page

---

## Phase 1: Critical Data & Infrastructure Fixes (P0 - Must Fix Before Launch)

### 1.1 Database & Turso Configuration
**Issue:** Prisma schema uses `provider = "sqlite"` but connects to Turso (libSQL). This works locally but may fail in production.

**Files to fix:**
- `prisma/schema.prisma` - Line 7: Change provider to match Turso
- `src/lib/turso.ts` - Verify driver adapter configuration

**Actions:**
```bash
# 1. Update schema provider
# 2. Run migration
npx tsx --env-file=.env prisma/apply-migration.ts
# 3. Verify connection
npm run db:seed
```

**Acceptance:** `npm run db:seed` completes without errors, products appear in admin.

---

### 1.2 Image Upload - Production Ready Storage
**Issue:** Current upload API (`/api/upload/route.ts`) falls back to local filesystem (`public/uploads/products/`) which **does not work on Vercel** (read-only filesystem).

**Files to fix:**
- `src/app/api/upload/route.ts` - Remove local fallback, enforce Vercel Blob
- Add validation for image URLs returned
- `src/components/admin/ProductForm.tsx` - Add upload progress, error handling, preview

**Required env vars:**
```
BLOB_READ_WRITE_TOKEN=vercel_blob_token
```

**Actions:**
1. Remove lines 51-58 (local fallback) from upload route
2. Add proper error handling for missing BLOB_TOKEN
3. In ProductForm: add loading states, failed upload retry, image validation (type, size)
4. Add image preview before save

**Acceptance:** Images upload successfully in production (Vercel), appear in admin product list, and display on product detail page.

---

### 1.3 Product Data Parity: Admin Form <-> Product Detail Page
**Issue:** Fields entered in admin don't all display on product detail page. Key mismatches:

| Field | Admin Form | Product Detail | Status |
|-------|------------|----------------|--------|
| `concentration` | ✓ (perfume tab) | ✓ (reads) | **Verify save** |
| `bottleStyle` | ✓ (perfume tab) | ✓ (reads) | **Verify save** |
| `longevity` | ✓ (perfume tab) | ✓ (reads) | **Verify save** |
| `sillage` | ✓ (perfume tab) | ✓ (reads) | **Verify save** |
| `applicatorType` | ✓ (attar tab) | ✓ (reads) | **Verify save** |
| `origin` | ✓ (attar tab) | ✓ (reads) | **Verify save** |
| `ingredients` | ✓ (attar tab) | ✓ (reads) | **Verify save** |
| `sizePrices` (perfume) | ✓ array | ✓ reads `sizePrices` | **Sync format** |
| `price3mlPhysical` etc (attar) | ✓ individual fields | ✓ reads | **Sync format** |
| `metaTitle`/`metaDescription` | ✓ SEO tab | ✓ sets document.title | **Verify** |
| `shortDescription` | ✓ Description tab | ❌ Not displayed | **Add to PDP** |
| `tags` | ✓ Description tab | ✓ renders as links | **Verify** |

**Files to fix:**
- `src/app/admin/(protected)/actions.ts` - `createProduct`/`updateProduct`: ensure ALL fields saved
- `src/app/api/products/route.ts` - GET: return ALL fields (lines 78-115)
- `src/app/shop/[slug]/page.tsx` - Display missing fields (shortDescription, attar details)

**Acceptance:** Create/edit product in admin → all fields visible on `/shop/[slug]`.

---

### 1.4 Attar vs Perfume Product Type Handling
**Issue:** Product type detection (`classifyProductType` in `src/lib/product-types.ts`) may not match admin `productType` prop. Admin creates with `type: 'Perfume'` or `'Attar'` but shop filters use different logic.

**Files to fix:**
- `src/lib/product-types.ts` - Align classification with DB `type` field
- `src/app/shop/ShopContent.tsx` - Filter by actual DB `type` field
- `src/components/admin/ProductForm.tsx` - Ensure `type` saved correctly (line 313)

**Actions:**
1. Verify `classifyProductType` returns `'perfume' | 'attar'` matching DB `type` values
2. Update shop filter to use `where.type = typeFilter` directly
3. Ensure admin form saves `type` as `'Perfume'` or `'Attar'` (capitalized per schema default)

**Acceptance:** Filtering by "Attar"/"Perfume" on shop page shows correct products.

---

## Phase 2: Attar/Perfume Customer Experience (P0 - Launch Blockers)

### 2.1 Product Detail Page - Attar-Specific Enhancements
**Issue:** PDP shows perfume fields (concentration, bottleStyle) for attars and vice versa. Missing attar-specific display.

**File:** `src/app/shop/[slug]/page.tsx`

**Actions:**
1. **Conditional rendering** based on `product.type`:
   - Perfume: Show Concentration, Bottle Style, Longevity, Sillage
   - Attar: Show Origin, Applicator Type, Ingredients
2. **Attar pricing display**: Show physical/online price tiers clearly
3. **Size selector**: Use `sizesAvailable` CSV for attars, `sizePrices` for perfumes
4. **Add "Fragrance Profile" section** for attars showing origin, applicator, ingredients

**Acceptance:** Attar product page looks purpose-built, not generic.

---

### 2.2 Product Card - Attar/Perfume Visual Distinction
**File:** `src/components/ProductCard.tsx`

**Actions:**
1. Add product type badge: "Attar" vs "Perfume" (subtle, premium)
2. For attars: show "From PKR X" using lowest physical price
3. For perfumes: show selected size price
4. Hover/quick view: show type-appropriate details

**Acceptance:** Customer instantly knows product type from card.

---

### 2.3 Shop Page - Attar/Perfume Filtering & Display
**File:** `src/app/shop/ShopContent.tsx`, `src/app/shop/FilterSection.tsx`

**Actions:**
1. Fix "Product Type" filter to use DB `type` field directly
2. Add visual grouping: "Perfumes" / "Attars" section headers when unfiltered
3. Ensure sort works within each type

**Acceptance:** Filtering by type works; mixed view clearly separated.

---

## Phase 3: Product Detail Page - Conversion Optimization (P1 - High Impact)

### 3.1 Enhanced Product Gallery
**File:** `src/app/shop/[slug]/page.tsx` (lines 271-306)

**Current:** Basic thumbnails, no zoom, no fullscreen
**Target:** Luxury feel

**Actions:**
1. Add **zoom on hover** (magnifier lens)
2. Add **fullscreen lightbox** on main image click
3. Keyboard navigation (arrows) for gallery
4. Swipe support on mobile
5. Loading placeholders with blur-up effect

**Acceptance:** Gallery feels premium, works on mobile/desktop.

---

### 3.2 Social Proof & Trust Signals
**File:** `src/app/shop/[slug]/page.tsx`

**Add to PDP:**
1. **Review summary** with breakdown (5★/4★/3★/2★/1★ bars)
2. **Verified buyer badges** on reviews
3. **Trust badges** near Add to Cart: "Authentic Guaranteed", "Free Returns 30 Days", "Secure Checkout"
4. **Recently viewed** / "Customers also bought" (already has related products)

**Acceptance:** PDP builds trust, reduces hesitation.

---

### 3.3 Size/Volume Selector UX
**File:** `src/app/shop/[slug]/page.tsx` (lines 370-385)

**Current:** Basic buttons
**Target:** Clear pricing per size

**Actions:**
1. Show price **per size** in selector (e.g., "50ml — PKR 12,999")
2. For attars: show Physical vs Online price toggle
3. Highlight "Best Value" size
4. Update main price **instantly** on size change (already works)

**Acceptance:** Zero confusion about pricing.

---

### 3.4 Add to Cart - Feedback & Persistence
**Files:** `src/context/CartContext.tsx`, `src/components/ProductCard.tsx`, `src/app/shop/[slug]/page.tsx`

**Actions:**
1. Toast notification with **product thumbnail** in cart confirmation
2. Mini-cart preview in toast (slide-down)
3. Cart persists across sessions (already in localStorage)
4. **Buy Now** → direct to checkout with selected size/quantity

**Acceptance:** Smooth, confidence-building cart interaction.

---

### 3.5 Mobile Sticky Add-to-Cart Bar
**File:** `src/app/shop/[slug]/page.tsx` (lines 563-596) - **Already exists!**

**Verify:** Works correctly, shows correct price for selected size.

---

## Phase 4: Admin Dashboard - Operational Excellence (P1)

### 4.1 Product List Enhancements
**File:** `src/app/admin/(protected)/products/page.tsx`

**Actions:**
1. Add columns: **Type**, **Fragrance Family**, **Stock Status**, **Featured**
2. Add **bulk actions**: Activate/Deactivate, Delete, Export CSV
3. Add **search by SKU (productId)**
4. Show **image thumbnail** in list
5. Pagination (currently loads 50 only)

**Acceptance:** Admin can manage 100+ products efficiently.

---

### 4.2 Product Form - Validation & UX
**File:** `src/components/admin/ProductForm.tsx`

**Actions:**
1. **Required field validation** per product type:
   - Perfume: concentration, bottleStyle required
   - Attar: origin, applicatorType required
2. **Slug uniqueness check** on blur (debounced API call)
3. **Image upload**: drag-drop, reorder, delete, set main image
4. **Preview button** → opens product detail page in new tab
5. **Auto-save draft** to localStorage (recover on refresh)
6. **Field hints** for complex fields (sizePrices format, tags usage)

**Acceptance:** Zero data entry errors; fast product creation.

---

### 4.3 Bulk Upload - CSV Import
**File:** `src/app/admin/(protected)/products/bulk-upload/page.tsx` (verify exists)

**Actions:**
1. Template CSV download with all fields
2. Validation preview before import
3. Error report with row numbers
4. Support both perfume and attar in same CSV (type column)

**Acceptance:** Can onboard 50+ products in minutes.

---

## Phase 5: Image System - Bulletproof (P0)

### 5.1 Image Optimization & Delivery
**Files:** `next.config.ts`, `src/components/ProductCard.tsx`, `src/app/shop/[slug]/page.tsx`

**Actions:**
1. Configure `next.config.ts` images.domains for Vercel Blob
2. Use `next/image` with `fill` + `sizes` everywhere (already mostly done)
3. Add **blur placeholder** using `blurDataURL` for all product images
4. Set proper `sizes` attributes for responsive loading

**Acceptance:** Lighthouse Performance > 90, no layout shift.

---

### 5.2 Admin Image Management
**File:** `src/components/admin/ProductForm.tsx` (GalleryUpload component)

**Actions:**
1. Show **image dimensions/file size** in gallery
2. **Drag to reorder** gallery images
3. **Set main image** from gallery (click star icon)
4. **Delete confirmation** for gallery images
5. Upload **multiple images at once** (already supports)

**Acceptance:** Image management is intuitive.

---

## Phase 6: Homepage - Preserve & Verify (P2 - Do Not Change)

**User Requirement:** "jo chezain home page per build hai unko ni cherna"

**Verification Checklist (DO NOT MODIFY):**
- [ ] Hero Slider with 3 banners
- [ ] Trust/Value section (4 cards)
- [ ] Summer Collection promo banner
- [ ] Product tabs (All/Men/Women/Unisex/Bundles/Woody/Fresh/Floral) + Carousel
- [ ] Attars section (4-column grid)
- [ ] Perfumes section (4-column grid)
- [ ] New Arrivals section
- [ ] Collections section (3 cards: Men/Women/Unisex)
- [ ] Our Story section + expanded story
- [ ] Best Sellers section
- [ ] Bundles section
- [ ] Shop by Scent section
- [ ] Footer

**Action:** Run visual regression test after all changes. Report any unintended homepage changes.

---

## Phase 7: Technical Polish & Production Readiness (P1)

### 7.1 Error Boundaries & Logging
**Files:** `src/app/error.tsx`, `src/app/shop/[slug]/error.tsx`, `src/app/admin/error.tsx`

**Actions:**
1. Custom error pages with "Contact Support" link
2. Sentry/LogRocket integration (if budget allows)
3. API route error handling with user-friendly messages

---

### 7.2 SEO & Metadata
**Files:** `src/app/shop/[slug]/page.tsx` (lines 124-134), `src/app/layout.tsx`

**Actions:**
1. Verify `metaTitle`/`metaDescription` render in `<head>`
2. Add **Open Graph** tags for product pages
3. Add **JSON-LD Product schema** (price, availability, reviews)
4. Sitemap generation (`next-sitemap` or manual)
5. Robots.txt

---

### 7.3 Performance Optimizations
**Actions:**
1. `npm run build` - verify no TypeScript/ESLint errors
2. Analyze bundle: `npx @next/bundle-analyzer`
3. Enable **React Compiler** (already in next.config.ts)
4. Preload critical fonts (Playfair Display, Montserrat)
5. Configure `next.config.ts` for image optimization

---

### 7.4 Accessibility (WCAG AA)
**Actions:**
1. Semantic HTML on all pages
2. Focus visible states on all interactive elements
3. Alt text for all images (product images use name)
4. ARIA labels on icon buttons
5. Color contrast verification (gold on dark backgrounds)
6. Keyboard navigation for all modals/drawers

---

## Phase 8: Testing Checklist (Pre-Launch)

### 8.1 Functional Testing
| Feature | Test Case | Pass/Fail |
|---------|-----------|-----------|
| Admin: Create Perfume | All fields save, appear on PDP | |
| Admin: Create Attar | All fields save, appear on PDP | |
| Admin: Edit Product | Changes persist, reflect on PDP | |
| Admin: Image Upload | Works on Vercel, images display | |
| Admin: Bulk Upload | 20+ products import correctly | |
| Shop: Filter by Type | Perfume/Attar filter works | |
| Shop: Filter by Category | Men/Women/Unisex works | |
| Shop: Price Range | Min/max filters work | |
| Shop: Sort | Price low-high, high-low, newest | |
| PDP: Size Selector | Price updates, correct for type | |
| PDP: Add to Cart | Correct size/price/qty in cart | |
| PDP: Buy Now | Goes to checkout with selection | |
| Cart: Persistence | Survives refresh, browser close | |
| Cart: Quantity Update | Subtotal updates correctly | |
| Checkout: Guest | Can complete without account | |
| Checkout: Auth | Redirects to login, returns | |
| Mobile: All pages | No horizontal scroll, touch works | |

---

### 8.2 Visual Regression
- [ ] Homepage unchanged (compare screenshots)
- [ ] PDP: Perfume layout correct
- [ ] PDP: Attar layout correct
- [ ] Shop page: filters, grid, pagination
- [ ] Admin: product list, create, edit
- [ ] Cart sidebar: all states
- [ ] Mobile: header, filters, PDP, cart

---

### 8.3 Performance Benchmarks
| Metric | Target | Actual |
|--------|--------|--------|
| Homepage LCP | < 2.5s | |
| PDP LCP | < 2.5s | |
| Shop page LCP | < 3s | |
| TTI (all) | < 3.5s | |
| Lighthouse Performance | > 90 | |
| Lighthouse Accessibility | > 95 | |
| Lighthouse SEO | > 90 | |

---

## Execution Order & Dependencies

```
Week 1 (P0 - Launch Blockers):
  Day 1-2: 1.1 Database/Turso + 1.2 Image Upload (Vercel Blob)
  Day 3-4: 1.3 Data Parity (Admin <-> PDP) + 1.4 Type Handling
  Day 5:   2.1 PDP Attar Enhancements + 2.2 Product Card + 2.3 Shop Filters

Week 2 (P1 - Conversion & Operations):
  Day 1-2: 3.1-3.5 PDP Conversion Optimization
  Day 3-4: 4.1-4.3 Admin Dashboard
  Day 5:   5.1-5.2 Image System Polish

Week 3 (P1-P2 - Production Ready):
  Day 1-2: 7.1-7.4 Technical Polish (SEO, Perf, A11y, Errors)
  Day 3:   6 Homepage Verification (no changes)
  Day 4-5: 8.1-8.3 Full Testing + Bug Fixes
```

---

## Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Turso connection fails in prod | High | Medium | Test staging with prod Turso URL; fallback to local SQLite for dev |
| Vercel Blob token not configured | High | Low | Document in deploy checklist; fail build if missing |
| Admin/PDP field mismatch persists | High | Medium | Automated test: create via admin -> fetch via API -> assert all fields |
| Homepage breaks during PDP changes | High | Low | Component isolation; visual regression test |
| Mobile UX issues on PDP | Medium | High | Test on real devices early; fix sticky bar, gallery swipe |
| Bundle size > 500KB | Medium | Low | Code splitting; dynamic imports for admin |

---

## Success Criteria for Launch

1. ✅ **Zero console errors** on all pages
2. ✅ **Admin creates perfumes & attars** with all fields → visible on PDP
3. ✅ **Images upload to Vercel Blob** in production
4. ✅ **Shop filters work** for type, category, price, fragrance family
5. ✅ **PDP converts**: Add to Cart, Buy Now, size selection all functional
6. ✅ **Cart persists** across sessions
7. ✅ **Homepage identical** to current design
8. ✅ **Lighthouse scores** > 90/95/90 (Perf/A11y/SEO)
9. ✅ **Mobile experience** polished on iOS Safari & Chrome Android
10. ✅ **Admin can manage 100+ products** efficiently

---

## Post-Launch (Week 4+)

- Analytics setup (GA4, conversion tracking)
- A/B test PDP layouts
- Review collection system
- Email marketing integration
- Loyalty program
- Multi-currency support

---

**Document Version:** 1.0
**Created:** July 12, 2026
**Owner:** Development Team
**Status:** Ready for Review