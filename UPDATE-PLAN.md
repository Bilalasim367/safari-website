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

## PART E — PREMIUM PDP REDESIGN + CONVERSION FEATURES (2026-09-05)

> **Scope**: Luxury black+gold Product Detail Page, WhatsApp Order, Social-Proof Purchase Popup, Admin-editable product display fields.

### PART 0 — Database + Admin editable fields
- [x] Added `notes Text?` column to Product model (`prisma/schema.prisma`) — comma-separated display notes ("Woody, Musk, Oud, Amber")
- [x] `gender`, `fragranceFamily`, `size` already existed — reused (no duplicates, no renames)
- [x] Applied to DB idempotently via `prisma/apply-migration.ts` (project's established flow; `prisma db push` blocked by a pre-existing `Order.shippingAddress` data-length issue on an unrelated column). Column verified present in local `perfume_db`.
- [x] `prisma generate` ✓
- [x] Admin ProductForm: added **Attar Notes** input (comma-separated, placeholder "Woody, Musk, Oud") + **Size** input (placeholder "12 ML") in Classification card; expanded **Fragrance Family** dropdown with Musky/Amber/Spicy. Gender dropdown (Men/Women/Unisex, default Unisex) already present.
- [x] `createProduct`/`updateProduct` + `AdminProductSchema` + `defaultFormState` now persist `notes`. Empty values allowed (no errors).

### PART 1 — Product Detail Page redesign (`src/app/shop/[slug]/ProductDetailClient.tsx`)
- [x] Mobile compact sticky header: back arrow + SAFARI logo (black bar under global header)
- [x] Title + size badge, rating row (or ScarcityLine fallback)
- [x] Price in cream/gold rounded pill (Base bold + Original strike-through + Save %)
- [x] Pill TABS (useState): **Description** (3-line clamp + Show more) | **Attar Notes** (gold chips from `notes`, default chips when empty)
- [x] Info cards 2×2 (👫 GENDER / 📦 SIZE / 🌿 FRAGRANCE / 💰 AMOUNT) with sensible defaults (Unisex, 12 ML Attar, Oriental)
- [x] ScarcityLine integrated (rating present → below info cards; no rating → top)
- [x] Related products retained (ProductCard grid)
- [x] Sticky mobile bottom bar: price + qty + gold Add to Cart
- [x] Desktop: sticky left image, right column with title/rating/price/tabs/2×2 info grid, Add-to-Cart + WhatsApp buttons side-by-side, trust strip ("✅ 100% Original | 💵 COD | 🚚 Free Shipping 999+")
- [x] Style: black/charcoal, gold `#c9a962`, cream cards, rounded-2xl, mobile-first
- [x] Server page passes `notes` + `whatsappNumber` props

### PART 2 — WhatsApp Order
- [x] `data/popup-settings.json` created (default `923000000000`)
- [x] Green "WhatsApp pe Order Karein" button on PDP (`#25D366`, inline SVG) → `wa.me` with product name/size/price+URL
- [x] Floating WhatsApp bubble on ALL storefront pages (`src/components/FloatingWhatsApp.tsx`, bottom-right, subtle pulse animation)

### PART 3 — Social-Proof Purchase Popup
- [x] `src/components/SocialProofPopup.tsx` — bottom-left white card, gold border-left, "Name from City purchased Product", "X minutes ago", price, ✓ Verified Order, X close; click → product page
- [x] Timing: first popup 8–10s, visible 5–6s, gap 20–30s, ~30% cycle skip
- [x] Data: real active products from `/api/products` (limit 12), names/cities from settings
- [x] Admin **Popup Settings** page (`/admin/popup-settings`, sidebar entry "Popup Settings"): ON/OFF, Names textarea, Cities textarea, WhatsApp number, Save → `data/popup-settings.json`
- [x] API `GET/PUT /api/popup-settings` (PUT admin-guarded JWT)
- [x] Both rendered via `SiteShell` on storefront only; positioned to not overlap sticky bars

### Files created
- `src/components/FloatingWhatsApp.tsx`
- `src/components/SocialProofPopup.tsx`
- `src/lib/popup-settings.ts`
- `src/app/api/popup-settings/route.ts`
- `src/app/admin/(protected)/popup-settings/page.tsx`
- `data/popup-settings.json`
- `IMPLEMENTATION-PLAN.md`

### Files modified
- `prisma/schema.prisma` — added `notes` column (additive only)
- `prisma/apply-migration.ts` — added `notes` ALTER (idempotent) + removed broken `pool.end()` ref
- `src/app/shop/[slug]/ProductDetailClient.tsx` — full redesign
- `src/app/shop/[slug]/page.tsx` — pass `notes`/`whatsappNumber`
- `src/components/admin/ProductForm.tsx` — Attar Notes + Size inputs, Fragrance Family options
- `src/lib/validations/product.ts` — `notes` field
- `src/app/admin/(protected)/actions.ts` — persist `notes`
- `src/components/admin/AdminSidebar.tsx` — Popup Settings item
- `src/lib/lucide-icons.ts` — added `Megaphone`
- `src/components/SiteShell.tsx` — floating WhatsApp + social proof popup
- `src/app/globals.css` — WhatsApp pulse + popup slide animations

### Verification
- [x] `npx eslint` on all changed files — 0 errors
- [x] `npm run build` — CLEAN (Compiled successfully, 320+ product pages SSG'd)
- Note: 4 pre-existing lint errors in `scripts/rename-to-attar.js` / `scripts/update-prices.js` (`require()` imports) were NOT introduced by this work and are untouched.

### Deploy steps
1. On server: `npx prisma generate`
2. On server (idempotent): `npx tsx --env-file=.env prisma/apply-migration.ts` (adds `notes` column)
3. Build + upload `.next` + `public` + `data/` to cPanel
4. Restart app

---

## PART F — PDP BUG FIXES (2026-09-05)

### BUG 1: WhatsApp link hydration mismatch (mobile console) — FIXED
- **Cause**: `href` was built during render with `window.location.href` (client) vs a hardcoded fallback URL (server) → `href` differed between SSR HTML and first client render → hydration error.
- **Fix**: Removed all `window.location` / `typeof window` usage from render. WhatsApp message now uses only server-deterministic values (product name, size, price, WhatsApp number) → `href` is byte-identical on server & client.
- Kept the "Order link" line OUT of the message (task's "behtar" option) — staff still receive product + size + price. No `useEffect`/`useState` needed → zero lint warnings, zero mismatch.
- **Test**: Refresh any `/shop/[slug]` page → console hydration errors ZERO (verified by reasoning + build: the only window-dependent attribute previously was this `href`; it is now deterministic).

### BUG 2: Double navbar on mobile detail page — FIXED
- **Cause**: PDP added its own compact sticky header (back arrow + SAFARI logo at `top-32`) on top of the global sticky site header (`sticky top-0 z-50 h-32 md:h-48`).
- **Fix**: Removed the PDP compact sticky header entirely. Also removed the `-mt-20 lg:mt-0` negative-margin hack (it existed only to seat that compact header). SiteShell `<main>`'s `pt-20 md:pt-28` now provides clean top spacing.
- Replaced with a small in-content **"← Back"** row (mobile-only, `lg:hidden`) inside the container — non-sticky, non-overlapping.
- **Test**: Mobile detail page now shows ONLY the main site header.

### BUG 3: Desktop Add to Cart area congested — FIXED
- **Cause**: Qty stepper + Add to Cart + WhatsApp sat side-by-side in one `sm:flex-row` row inside a half-width column.
- **Fix**: Stacked the action area vertically:
  - Qty stepper → standalone fixed-width (`w-[140px]`) pill row
  - **Add to Cart** → `w-full` + `min-h-[56px]` gold button
  - **WhatsApp pe Order Karein** → separate `w-full` + `min-h-[52px]` green-outline button (`border-2`), `mt-3` gap
  - Region `mb-4` → `mb-5`
- **Spacing polish**: price pill `mb-5`→`mb-6`, tabs `mb-5`→`mb-6`, description/notes cards `mb-5`→`mb-6`, info cards grid `gap-3`→`gap-4` + `mb-6`, trust strip `mb-5`→`mb-6`. Desktop right column now has breathing room.

### Verification
- [x] `npx eslint src/app/shop/[slug]/ProductDetailClient.tsx` — 0 errors
- [x] `npx tsc --noEmit` — 0 errors in this file (only pre-existing errors elsewhere)
- [x] `npx next build` — CLEAN (Compiled successfully, 320+ product pages SSG'd)

### Files changed (this round)
- `src/app/shop/[slug]/ProductDetailClient.tsx` only

---

## PART G — HERO MOBILE HEIGHT FIX (2026-09-05)

### Task: Homepage hero too tall on mobile — FIXED
- **Cause**: Hero (`src/components/Hero.tsx`) used `min-h-screen md:min-h-[85vh]` → 100% of the viewport on mobile, hiding the Hot Selling section below the fold.
- **Heights set** (responsive):
  - Mobile (default): `h-[420px]` (~60-70% of a typical phone viewport)
  - Small tablet `sm`: `h-[480px]`
  - Tablet `md`: `h-[560px]`
  - Desktop `lg+`: `lg:min-h-[85vh]` — **unchanged** (zero regression)
- Image stays `object-cover`; black gradient overlay untouched.
- **Mobile text proportions** (smaller hero → proportional type):
  - H1: `text-[42px]` → `text-4xl` (36px), margin `mb-6` → `mb-4`
  - Subtitle spacing `mb-4` → `mb-3`
  - Button compact: `px-7 py-4 md:px-8 md:py-6`
  - Content inset `py-16` → `py-12`
  - Scroll indicator `bottom-8` → `bottom-6 md:bottom-12` (stays inside the hero)
- Desktop (`md:`) heading/description/button sizes untouched.
- Only `src/components/Hero.tsx` changed.

### Verification
- [x] `npx eslint src/components/Hero.tsx` — 0 errors
- [x] `npx next build` — CLEAN (37.8s)

---

## PART H — DATABASE SCHEMA FIX: db push P2000 + notes column (2026-09-05)

### Problem (found on server)
- `prisma db push` failed with **P2000** ("value too long ... Column: shippingAddress"): `Order.shippingAddress` held 253 chars but was VARCHAR(191).
- That blocked the Product `notes` column from being added server-side.

### Root cause (deeper, found locally)
The DB (created via legacy raw-SQL ALTERs/bundle-migration.sql) already has these columns as **TEXT**, but the schema declared them `String` (VARCHAR 191). `db push` therefore tried to SHRINK text→varchar and threw P2000 on the first long value (`images`, 253 chars). Same class of problem — shrinking long-data columns.

### What changed in `prisma/schema.prisma` (additive only — no renames, no @@map changes, no data loss)
1. `Order.shippingAddress` → `String? @db.Text`
2. Product columns widened to `@db.Text` to MATCH existing TEXT columns holding JSON/long content:
   - `description`, `images`, `sizePrices`, `shortDescription`, `longDescription`, `ingredients`, `metaDescription`, `notes`
3. `Product.notes String? @db.Text` confirmed present (was already added earlier). `gender`, `fragranceFamily`, `size`, `notesTop/Heart/Base` untouched (already VARCHAR, matching schema).

### Verification
- [x] `npx prisma db push` — **0 errors** → "Your database is now in sync with your Prisma schema. Done in 2.11s"
- [x] `npx prisma generate` — success (v5.22.0)
- [x] Temporary `verify-schema.js` (deleted after): SHOW COLUMNS confirmed `product` has gender/fragranceFamily/size/notes/notesTop/notesHeart/notesBase and `order.shippingAddress` is `text` → **VERIFY: PASS**
- [x] `npx next build` — CLEAN (Compiled successfully, `/shop/[slug]` SSG'd = product detail query runs fine against DB)

### Deploy note
On the server run exactly the same idempotent flow: `npx prisma db push` (now unblocked) then `npx prisma generate` — the `notes` column will be added and all long columns stay TEXT (no data loss).

---

## CONSTRAINTS (DO NOT TOUCH)
- [ ] `server.js` — NO CHANGES
- [ ] `next.config.js` / `next.config.ts` — NO CHANGES
- [ ] Admin panel layout/design of existing pages — NO CHANGES (only added new fields)
- [ ] Customer pages (home, shop, bundles list) — NO CHANGES
- [ ] `npm run build` must stay CLEAN after each task

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
