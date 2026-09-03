# UPDATE-PLAN.md — Safari Perfumes Major Update

> **Created**: 2026-09-03
> **Status**: IN PROGRESS
> **Scope**: Storefront Attar Pricing, Admin Bundle Product Picker, UI Polish, Customer Improvements

---

## PART A — STOREFRONT ATTAR PRICING FIX

### Task 1: Remove Physical/Online variant pricing from storefront
- [x] Remove `lowestPhysicalPrice` computation and "From PKR X" display from `ProductCard.tsx`
- [x] Remove physical price columns fetch from `ShopContent.tsx` (stop fetching price3mlPhysical etc.)
- [x] Remove `lowestPrice` prop from `ProductCard` interface and all callers
- [x] Remove size filter options `['30ml', '50ml', '100ml']` from `FilterSection.tsx`
- [x] Remove hardcoded `{isAttar ? '12ml' : '50ml'}` size label from `ProductDetailClient.tsx`
- [x] Remove `sizePrices` / `sizesAvailable` from ProductDetailClient interface and usage
- [x] Add "12ml Attar" badge on product detail page (below title, for attar products)
- [x] Grep and clean all remaining `physicalPrice`, `onlinePrice`, `lowestPhysicalPrice` storefront refs
- [x] Ensure cart uses base price only (no variant pricing)
- [x] Ensure search results show base price only
- [x] Remove "50ml Physical" / "50ml Online" columns from admin products list table

### Task 2: Create attar pricing update script
- [x] Create `scripts/update-prices.js` (plain JS, uses Prisma)
- [x] Logic: Each product's `price` (base) → ~25-30% of current base price (rounded PKR)
- [x] Logic: Each product's `originalPrice` → set to current base price (for strike-through)
- [x] Mapping examples: PKR 1299→350, 700→200, 900→250 (verified ✓)
- [x] Console progress output per product
- [x] `process.exit()` at end
- [x] Uses `DATABASE_URL` env var (Prisma client)

---

## PART B — ADMIN BUNDLE UPLOAD AREA IMPROVE

### Task 3: Add product selection to Bundle create/edit form
- [x] Create product search/select component (`ProductPicker.tsx`)
- [x] Searchable dropdown with all products (name + price + SKU)
- [x] Selected products shown as chips/cards with remove button
- [x] Auto-calculate total value from selected products
- [x] Show saving hint: "Bundle total: PKR X — aap bundle price PKR Y laga rahe hain, customer ko Z% saving"
- [x] Add `selectedProductIds` and `selectedProducts` state to `BundleForm.tsx`
- [x] Keep all existing fields (Name, Slug, Description, Image, Price, Original Price, Save Badge, Size Info, Status)

### Task 4: Backend API for bundle product management
- [x] Update `createBundle` server action to accept and save `productIds[]` → create `BundleItem` records
- [x] Update `updateBundle` server action to sync `BundleItem` records (add/remove)
- [x] Update `getBundleById` to return items with product details for edit form pre-population
- [x] Add API endpoint or server action to fetch all active products for the picker dropdown
- [x] Ensure `BundleItem` unique constraint `[bundleId, productId]` is respected

---

## PART C — ADMIN UI POLISH

### Task 5: Admin color scheme refinement
- [x] Sidebar: ensure deep charcoal/black (#1a1a1a / sidebar variable) with gold active indicator
- [x] Gold accents on buttons, badges, icons, active states throughout admin
- [x] Bundle form styled consistently with polished admin theme
- [x] Audit all admin pages for consistent gold/charcoal usage

### Task 6: Logo "SAFARI" text enlargement
- [x] Storefront Header: make logo text/wordmark larger, luxury serif, responsive sizing
- [x] Admin Sidebar: make "SAFARI" text larger, matching luxury serif style
- [x] Both should use `font-heading` (Playfair Display) for luxury feel

---

## PART D — CUSTOMER SIDE IMPROVEMENTS

### Task 7: Bundle product cards improvement
- [x] "SAVE X%" gold badge on bundle image (top corner)
- [x] Show product count: "3 Attars Included" type text
- [x] Original total vs bundle price comparison with strike-through
- [x] Hover effects: subtle lift + shadow, gold border on hover

### Task 8: Discount badge on product cards
- [x] Top-left badge: "-25%" or "-PKR 500" style with gold/red gradient
- [x] Original price strike-through, base price bold
- [x] Badge only shows when `originalPrice > basePrice`

### Task 9: Scarcity/urgency line on product detail
- [x] Create reusable `ScarcityLine.tsx` component
- [x] Random stock number (5-15 range) per page load or per-product seed
- [x] Display: "🔥 Only X left in stock — selling fast!" or "⚡ Y people bought this in the last 24 hours"
- [x] Design: soft amber/gold background pill, below product title
- [x] Reusable on product page + bundle detail page

### Task 10: Customer-facing pages overall polish
- [x] Product cards: consistent image ratio, clean typography, gold hover states
- [x] Bundle detail: product list/grid styled well, "What's in this bundle" section improved
- [x] Shop page: clean filters and sorting

---

## TASK 11: Spacing below header (post-Task-10 polish)
- [x] Add responsive top padding to `<main>` (SiteShell) — `pt-20 md:pt-28` (80px mobile / 112px desktop)
- [x] Header stays sticky (`sticky top-0`); content scrolls cleanly, no overlap
- [x] Homepage Hero kept full-bleed via compensating `-mt-20 md:-mt-28`
- [x] Subtle fade-in animation on first section below header (`.animate-fade-in` now defined in globals.css)
- [x] Removed redundant per-page top padding so total stays consistent (~80–120px): Shop, Checkout, Product Detail, Bundles, Blog list, Blog article, About, Collections, Contact, Cookies, Privacy, Terms, Account
- [x] Consistent across Home / Shop / Product Detail / Bundles / Cart / Checkout / Blog
- [x] `npm run build` — CLEAN (compiled successfully)

---

## TASK 12: Rename product names "Perfume" → "Attar" (data only, no code labels)

### Objective
Now the site only sells attar, but future perfumes will be added — so the word "Perfume"
must stay everywhere in code. This task only renames the **`name` field** of existing
products from "... Perfume" to "... Attar".

### Task 1: Database update script
- [x] Created `scripts/rename-to-attar.js` (Prisma, CommonJS + dotenv, mirrors `scripts/update-prices.js`)
- [x] Fetches all products, filters case-insensitively for names whose TRAILING word is "Perfume"
- [x] Renames "Perfume" → "Attar" and strips size words (e.g. "50ml")
- [x] Brand-name safety: names like "By Perfumer's Workshop", "Perfumes De Marly",
      "By BN Perfumes" are LEFT ALONE (trailing-word rule avoids corrupting perfume-house names)
- [x] Logs: total scanned, count renamed, first 10 before/after examples
- [x] `process.exit()` after work
- [x] Supports `--dry-run` for safe preview

### Task 2: Admin products LIST display labels (only if necessary)
- [x] Reviewed `src/app/admin/(protected)/products/page.tsx`
- [x] Column headings: no standalone "Perfume" label exists (Type column renders DB data)
- [x] Found "Perfume" only in FUNCTIONAL controls: Type-filter option + "+ Perfume" button
- [x] Per the no-global-change + future-perfume rules, those functional controls are KEPT
      intact (renaming them would break the ability to add/filter future Perfume products)
- [x] Conclusion: no admin list display-label change needed ("agar zaroori ho" = not necessary)

### Notes
- Script path: `scripts/rename-to-attar.js`
- Run on server: `node scripts/rename-to-attar.js` (or `--dry-run` to preview)
- Local dev DB dry-run: 0 products have trailing "Perfume" (already attar-style names).
  The 4 "perfume" matches locally are all BRAND names and are correctly NOT renamed.
- `npm run build` — CLEAN ✓

---

## CONSTRAINTS (DO NOT TOUCH)
- [ ] `prisma/schema.prisma` — NO CHANGES
- [ ] `server.js` — NO CHANGES
- [ ] `next.config.js` / `next.config.ts` — NO CHANGES
- [ ] Admin pricing form structure — NO structural changes (Base Price + Original Price fields stay)
- [ ] `npm run build` must be CLEAN after each task

---

## FINAL STATUS
- [x] All tasks complete (Tasks 1–12 done)
- [x] `npm run build` — CLEAN (compiled successfully, 389 pages generated)
- [x] Deploy steps documented (see CPANEL_DEPLOYMENT.md)

### Deploy Steps (cPanel / server)
1. Build locally: `npm run build`
2. Upload `.next` + `public` to cPanel
3. On server: `npx prisma generate`
4. Run attar price script: `node scripts/update-prices.js` (sets `price = base*0.28 → round to 50`, `originalPrice = base`)
5. Restart app in cPanel
