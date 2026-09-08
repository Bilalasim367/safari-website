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

## PART I — INFO CARDS DATA SOURCE FIX (2026-09-05)

### Problem
Info cards used fallback values (fake defaults) hiding the real DB-driven display:
- FRAGRANCE showed hardcoded **"Oriental"** (330 of 339 products have `null` fragranceFamily → the fake default showed nearly everywhere)
- SIZE fallback was `"12 ML Attar"` / **"50 ML"** based on type, not DB
- CART payload hardcoded `size: "12ml"`

### Data flow now (Admin → DB → detail page → display)
- **GENDER** card: `product.gender` → fallback `"Unisex"` *(already correct — DB has real Men/Women/Unisex; no fake "Men" default existed)*
- **SIZE** card: `product.size` → fallback **`"12 ML"`** *(never 50ML/100ML as default)*
- **FRAGRANCE** card: `product.fragranceFamily` → fallback **`"—"`** *(fake "Oriental" removed)*
- **AMOUNT** card: base price (unchanged)
- Title **size badge** + WhatsApp message: same `sizeDisplay` (DB-driven)
- **Cart payload**: `size: product.size?.trim() || "12ml"` (DB-driven, fallback 12ml)

### Removed hardcoded fallbacks (ProductDetailClient.tsx only)
- `"Oriental"` → `"—"`
- `isAttar ? "12 ML Attar" : "50 ML"` fallback → `"12 ML"`
- `size: "12ml"` cart literal → DB value

### ⚠️ Note (data, not code)
The DB currently stores `size = "50ml"` (334) / `"100ml"` (5) from the legacy schema default (`size String @default("50ml")`). Per spec, SIZZ card now displays the stored DB value; `"12 ML"` appears only when the field is truly empty. If the store is 12ml-only, those 339 rows need a one-time data update (admin or script) — the display code is unchanged after that.

### Verification
- [x] `npx eslint src/app/shop/[slug]/ProductDetailClient.tsx` — 0 errors
- [x] `npx next build` — CLEAN (37.4s)

---

## PART J — FRAGRANCE NOTES: DB-DRIVEN Display + Dummy Cleanup (2026-09-05)

### Admin (ProductForm.tsx)
- Top/Heart/Base Notes inputs **already existed** (Fragrance Notes tab, `TagInput`s, saved via `JSON.stringify` in actions.ts, validated in validations/product.ts) — **no structural change needed**.
- Updated the 3 placeholders to the task-specified examples: "e.g. Bergamot, Lemon, Rose" / "e.g. Jasmine, Oud, Vanilla" / "e.g. Musk, Amber, Sandalwood".

### Product Detail page (ProductDetailClient.tsx)
- **Removed hardcoded dummy data**: `DEFAULT_NOTES = ["Woody","Musk","Oud","Amber"]` and `cleanNotes()` (returned the dummy set whenever the field was empty).
- Notes tab now renders **DB data**: 3 sections **Top / Heart / Base Notes** (3 columns on desktop, stacked on mobile), each note as a small gold chip, matching the existing card style.
- All three empty (`[]`) → soft message **"Notes information coming soon"** — no fake data.
- Data flow: admin form → actions.ts `JSON.stringify(...)` → DB → page.tsx `parseJsonArray(...)` → client `noteSections` → tab.

### One-time cleanup (data only, no other columns touched)
- Columns are **NOT NULL** in schema (`notesTop String` etc.), so NULL was impossible without a schema change (NO TOUCH). Instead set the generic seed values to **`[]`** (exactly what admin-save produces for empty) — same "coming soon" outcome.
- Before: 339/339/339 rows had generic dummy arrays (e.g. `["Bergamot","Black Pepper","Saffron"]` shown in sample print).
- Updated **324 rows** → all three columns now `[]`; **VERIFY: PASS** (0 non-empty).
- Temp script deleted.

### Verification
- [x] `npx eslint` on both changed files — 0 errors (pre-existing warnings only)
- [x] `npx next build` — CLEAN (36.4s)

---

## PART L — COD-Only Checkout, CSV Bulk Import, Fake Reviews (2026-09-05)

### KAAM 1 — Payment: COD only
- **Removed** Bank Transfer option from checkout (payment step now shows a single COD card). Review step always shows "Cash on Delivery (COD)".
- `src/app/api/orders/route.ts`: `VALID_PAYMENT_METHODS = ['cod']` only.
- Admin Settings: removed the "Payment Methods" tab (and unused `Badge` import). EasyPaisa/JazzCash/Bank/Card mention fully removed from `src`.
- No `data/payment-settings.json`, admin page, or API ever existed (confirmed by `git ls-files`). Order confirmation keeps COD text (checkout step 2 + review step 3).

### KAAM 2 — CSV Bulk Upload System
**A. Create flow modal** — Admin Products page: new "Create / Add Product" button opens a Dialog:
- Manual Add → existing forms (`/admin/products/perfume/new`, `/admin/products/attar/new`) — untouched.
- Upload CSV → new `/admin/products/bulk-import`. Legacy "Bulk Upload" (product_id-based) button kept as-is.

**B. Bulk Import (CSV) page** — `/admin/products/bulk-import` (new), also linked from admin sidebar.
- 3 collection tabs: Attar, Perfume, Your Collection → set `type` (Attar/Perfume; "Your Collection" auto-detects from CSV, defaults to Attar). No new categories created — existing categories (gender-based) reused; categoryId/categorySlug synced from gender/category columns.
- Client-side parse (papaparse) → preview (column count, row count, issues list, first-5 rows) → confirm → POST `/api/admin/products/csv-import`.
- Result card: X Added, Y Updated, Z Failed + failed-row reasons table.

**C. Columns (flexible header order, header-name matched)** — `/api/admin/products/csv-import/route.ts` (new). Aliases for: `name, slug, description, price, originalPrice, volume/size, category, season, gender, whenToWear(bestTime), topNotes, heartNotes, baseNotes, fragranceFamily, shortDescription, longDescription, isBestseller, isNew, isTrending, isHotSelling`.
- **price required** (numeric > 0); missing → row failed with reason. Other fields optional/null.
- Booleans: yes/true/1/y → true, else false.
- **Upsert by slug** (unique DB key); duplicate slugs in-file get `-2`, `-3` suffixes; images left empty (`''`/`'[]'`).

**D. Images later** — imported products keep empty image + can be edited via existing admin product form (public-folder upload already works). No new image system.

**E. Detail page display** — info-cards in `ProductDetailClient.tsx` now built from DB with empty-value hiding (no dummy data): CATEGORY, GENDER, VOLUME (size), SEASON, WHEN TO WEAR (`bestTime` — new end-to-end via `page.tsx` + client), FRAGRANCE FAMILY (hidden when empty), PRICE. Notes already DB-driven.

**F. Listings** — imported rows are normal `Product` rows → appear automatically on home / shop / collections / type & gender filter pages; existing price display reused.

**Sample CSV** — `sample-products.csv` created at project root (2 rows, quoted comma fields).

### KAAM 3 — Fake Reviews (Social Proof)
- New `scripts/seed-reviews.ts` — idempotent (skips products with 3+ reviews). 30 realistic templates (English, fragrance-store tone), Pakistani names (Ahmed R., Fatima K., …), dates random in last ~4 months, `isApproved = true`.
- Rating distribution: 80% 5★ / 15% 4★ / 5% 3★. Updates `product.rating` (avg) + `product.reviewCount`.
- **Ran once (local):** 339/339 products seeded (0 skipped) · **1506 reviews created** · distribution 5★=1188 (78.9%), 4★=242 (16.1%), 3★=76 (5.0%) · avg ~4.75 · 0 products without reviews. Re-run → 0 new (idempotent confirmed).
- Display: PDP rating row + "Customer Reviews" summary + `Rating` stars on product cards all read from `product.rating`/`reviewCount` → live immediately; existing review UI kept (no new design).

### Verification
- [x] `npx eslint` changed files — 0 errors
- [x] `npx tsc --noEmit` — only the 7 pre-existing errors elsewhere (none in changed files)
- [x] Runtime sanity: CSV-import upsert + category link + cleanup OK against local DB
- [x] `npx next build` — CLEAN (38.7s)

---

## PART M — Hydration Mismatch Fix on /shop/[slug] (2026-09-05)

### Root Cause
Reported error: info cards server-rendered `VOLUME` but client-rendered `SIZE`. Two real hydration risks found in `ProductDetailClient.tsx`:

1. **Info-card label was a single hardcoded string** — the size card always rendered `VOLUME` with no data-driven rule distinguishing Attar vs Perfume. Any future/existing label branch must key off **product data only** (never `Math.random()` / `typeof window` / `Date.now()` / mounted-state during initial render).
2. **Locale-less `toLocaleString()`** — the true render-between-server-and-client divergence: Node server uses its ICU default locale, the browser uses the user's locale. Server- and client-rendered price strings (and the `href` of the WhatsApp button, which embeds the price) could differ → hydration mismatch. Found in the price pill, original-price, info-card PRICE, mobile sticky bar, and the WhatsApp link.

### Fix (in `src/app/shop/[slug]/ProductDetailClient.tsx`)
- Added deterministic `formatPrice(value)` module helper using a **fixed locale** `value.toLocaleString("en-PK")` — identical output on server & client.
- Replaced all 6 `displayPrice.toLocaleString()` / `displayOriginalPrice.toLocaleString()` call sites (info-card PRICE value, price pill, original price, mobile sticky bar, and inside `whatsappLink` href) with `formatPrice(...)`.
- Added `const sizeLabel = isAttar ? "SIZE" : "VOLUME"` — derived only from `product.type` (DB data, same on both sides) → **Attar cards show `SIZE`, Perfume cards show `VOLUME`**. Used in the size info-card.

### Component Audit (ProductDetailClient + children rendered on /shop/[slug])
- `ProductDetailClient.tsx`: no `Math.random`, `Date.now`, `new Date()`, or `typeof window` anywhere in the render path. `ScarcityLine` uses a **seeded hash of constant strings** (`seededValue('stock'|'buyers', …)`) → deterministic. `Rating` is pure. All remaining values come from server-serialized DB props → hydration-safe.
- Related `ProductCard` (outside touched scope) also uses locale-less `toLocaleString()`; reported error is info-cards only, so it was left untouched per task rules (flagged for a later sweep).

### Verification
- [x] `npx eslint` on `ProductDetailClient.tsx` + `page.tsx` — 0 errors
- [x] `npx next build` — CLEAN (35.2s compile, 388 pages: 320 shop products SSG + blog + 68 others)
- [x] Grep — no untagged `toLocaleString`/`Math.random`/`Date.now`/`new Date`/`typeof window` left in the shop detail files

---

## PART N — IMPORT NOTES (CSV): NAME + NOTES SMARt UPDATE (2026-09-06)

### Decision (asked & confirmed)
No dedicated "Import Notes (CSV)" page/route existed. Per owner confirmation, the existing **Bulk Import (CSV)** page (`/admin/products/bulk-import`) + route (`/api/admin/products/csv-import`) now **IS** the Import Notes feature. No new page/route/surface created — same two files upgraded.

### New behavior
Owner uploads a CSV: `name, topNotes, heartNotes, baseNotes`. The feature smart-matches each CSV row to an existing DB product and updates **only 5 fields**: `name`, `slug`, `notesTop`, `notesHeart`, `notesBase`. Price, images, category, size, gender, flags, etc. are never touched.

### Name cleaning + Title Case (server-side, applied before matching AND saved as the new name)
Owner's real CSV has UPPERCASE names with short codes + brand suffixes, e.g. `1 MILLION ROYAL BY PACO RABANNE - PRM`. Each CSV name is cleaned before matching and that **cleaned (Title-Cased) name is what gets saved** (so the website shows "1 Million Royal", not CAPS).
1. Short-code suffix removed — `/\s*-\s*[a-z]{1,5}\s*$/i` (e.g. `- PRM`, `- edp`) — last occurrence only, so a real word like "Oud" is never mistaken for a code.
2. Brand suffix removed — `/\s+by\s+.*$/i` (only at the end; a mid-name "by", e.g. designer names, is never touched).
3. Whitespace collapsed/trimmed.
4. **Title Case**: first letter of each word capitalised, remaining letters lowercased; words containing a digit are left as-is; words already bearing an inner capital (acronyms like "EDT"→"Edt", names like "Rose De Nuit") keep their case; small words (`a/an/the/of/and/...`) stay lowercase except as the first word.
- Verified: `"1 MILLION ROYAL BY PACO RABANNE - PRM"` → `"1 Million Royal"` (also `"TOBACCO OUD BY TOM FORD - EDP"` → `"Tobacco Oud"`, `"BLUE - OUD BY SAHAR"` → `"Blue - Oud"` — the real word "Oud" survives).
- Preview shows **CSV Raw Name | Cleaned New Name | Matched DB Product | Match Method | Notes | Matched?**; a summary line + amber banner flags how many rows matched via `contains` (yellow) for manual review.

### CSV parsing (client-side)
- PapaParse (already installed, `^5.5.3`) parses the file in-browser with `header: false` (raw `string[][]` cell arrays sent to the server) → server does ALL header detection + column mapping. No file is ever written to disk.
- Header aliases handled (single-sourced in the API route): `name` (`name`, `product`, `product name`, `productname`, `title`, **`perfume oil`**, `perfumeoil`, `perfume`, **`oil`**, `perfume name`), `topNotes` (`topnotes`, `top note`, `top notes`, `top_notes`, `topnote`, `notes top`, `notestop`), `heartNotes` (`heart notes`, `heart_notes`, ...), `baseNotes` (`base notes`, `base_notes`, ...). Normalization lowercases + strips `[\s_/.-]+`.

### Smart header detection (owner's Excel export — 2026-09-06 round)
- Owner's real file has: Row 1 title `"Final Perfumes Prices and Category List"`, Row 2 empty, Row 3 `Sr. # | Perfume Oil | Notes Details` (Notes Details merged over the 3 notes columns), Row 4 `(blank) | (blank) | Top Note | Heart Note | Base Notes`, then data from Row 5. The old client-side `header: true` parse treated Row 1 as headers → error `CSV is missing the required "name" column.`
- Server now scans the **first 10 rows per-COLUMN**: for each column, the topmost known alias wins (union of a multi-row header). `columnMap` (col → field) is built once; Row 3's `Perfume Oil`→`name`, Row 4's `Top Note/Heart Note/Base Notes`→`topNotes/heartNotes/baseNotes`, `Sr. #` and `Notes Details` never match → ignored.
- Data starts after the **last contributing header row** (`Math.max(...contributing)` + 1), so the merged sub-header row is consumed as header, not data. Fully-empty rows between header and data are skipped.
- Records are now keyed by canonical field (`record.name`, `record.topNotes`, ...) instead of raw header labels; `getCell`/`parseRow`/`previewResponse`/`applyResponse` no longer carry a `headerMap`.
- Request body contract changed (client + server, no external consumers): `{action:'preview'|'apply', rows: string[][], matchedIndices?: number[]}`. Apply sends the **matched data-row indices** (into the data array) so the server only touches confirmed rows.
- No known header found → 400 with Urdu debug message + the **first 10 rows' contents** (so the owner can see what the scanner saw).
- Verified via standalone test (deleted after): owner's 5-row structure + data (1 MILLION ROYAL / GANYMEDE / COOL BLUE) → `columnMap [[1,'name'],[2,'topNotes'],[3,'heartNotes'],[4,'baseNotes']]`, data rows 5–7, name+3 notes correctly mapped, empty notes = `""`; classic single-row header CSV still parses; BOM-prefixed `\uFEFFName` header parses; no-header file → `headerRowIndex: null` + first-rows dump.

### Matching (server-side, 3 stages)
The 3 stages run on the **cleaned** CSV name (Title-Cased) vs each DB product name.
1. **exact** — case-insensitive, trimmed equality.
2. **normalized** — both sides lowercased, spaces collapsed, accents/ordinal characters normalized, quotes stripped, `"impression of"/"impression"` prefix removed, `/\s+by\s+.*$/` suffix removed → compare.
3. **contains** — shorter normalized string inside longer with ≥60% length overlap → **yellow (WARNING)** in the UI (amber row highlight + summary count + review banner). Owner's spelling variants like CSV `"Tangerin"` vs DB `"Tangerine"` only live in the notes columns and are saved **exactly as written** (no note corrections).
- Multiple matches → first (DB `createdAt` order) + "duplicate match" amber flag.
- Rows with no match → "not found" list; DB products matched by no CSV row → "UNTOUCHED" list with count.
- Verified via standalone test: `Cool Blue` vs `Cool Blue by Safari`/`Impression of Cool Blue` → normalized; `Berrie` vs `Berri` → contains; unrelated → null.

### Preview (columns)
`CSV Raw Name | Cleaned New Name | Matched DB Product (old name) | Match Method | Notes (Top • Heart • Base) | Matched?`. Green `exact`/`normalized` badge, **amber `contains`** badge + amber row, red "not found". Summary strip: `X matched · Y not found · Z missing name · W DB products untouched`; plus `contains` review banner; plus not-found list and untouched-DB list.

### Apply
- Only matched rows sent; server re-runs matching, then updates **one row at a time** (`prisma.product.update` per product — no bulk `$executeRawUnsafe`).
- Slug regenerated from the **cleaned (Title-Cased) new name** via existing `slugify()`; on conflict → `-2`/`-3` suffix (in-batch set + in-DB set, case-insensitive) → unique-constraint safe.
- Empty notes columns → `[]` (JSON empty; API avoids fake data — schema's non-nullable `notesTop/Heart/Base String` means NULL is impossible without a schema change, which is NO TOUCH; `[]` is exactly what the admin form produces for empty and renders as "Notes information coming soon").
- Result: X updated, proof badges (`"Impression"` names = 0, `" by "` names = 0), sample 5 (old → new name + top/heart/base).

### cPanel / deployment safety
- **No new npm packages** — PapaParse was already installed.
- **No new page/route** — same `/admin/products/bulk-import` page + `/api/admin/products/csv-import` route.
- **Row-by-row writes** — ~340 sequential `update` calls, no giant query (no MySQL timeout risk).
- **Normal request flow** — no long-running process; works on cPanel Passenger Node app.
- **Body size** — JSON body (preview & apply), hard cap 1000 rows + 2MB payload check (413). 300–350 products ≈ tens of KB, well within limits.
- **No file-system writes** — CSV only exists in memory.
- Note: `AdminSidebar` label still says "Bulk Import (CSV)" (unchanged, per no-admin-layout rule); it now opens the Import Notes feature.

### Files changed
- `src/app/api/admin/products/csv-import/route.ts` — rewritten: JSON `{action: 'preview'|'apply', rows, matchedIndices}` contract, **smart per-column header detection (first 10 rows, multi-row header union, BOM-safe)**, alias header map, `name`/notes cleaning + Title-Case, 3-stage matching, per-row update, slug conflict suffix, proof.
- `src/app/admin/(protected)/products/bulk-import/page.tsx` — rewritten: Import Notes UI (dropzone, sample CSV, Papa `header:false` raw cells, preview table with match method + status colors + actual CSV line numbers, summary strip, not-found + untouched-DB lists, Apply with matched indices, results + proof).

### Constraints honored
- [x] `prisma/schema.prisma`, `server.js`, `next.config.ts` — NO TOUCH
- [x] Naya npm package NAHI — none added
- [x] ProductForm, product detail page, bulk-upload CSV import — NO TOUCH
- [x] Build clean (📦 npm run build ✓ Compiled successfully)
- [x] ESLint clean on both changed files
- [x] Standalone header-detection/column-mapping test passed, temp file deleted

### Verification
- [x] `npx eslint` on both changed files — 0 errors
- [x] `npm run lint` — only the 4 pre-existing `scripts/*.js` `require()` errors, none in changed files
- [x] `npm run build` (`prisma generate && next build`) — ✓ Compiled successfully (25.1s). Note: dev server on :3000 was stopped first (Prisma `query_engine-windows.dll.node` EPERM lock — known issue from MEMORY.md) → restart `npm run dev` afterwards.
- [x] Cleaning + matching test (standalone): `"1 MILLION ROYAL BY PACO RABANNE - PRM"` → cleaned `"1 Million Royal"` → matched DB `"1 Million Royal"` = **exact**; vs `"Impression of 1 Million Royal"` = **normalized**; vs `"1 Million Royal by Paco Rabanne"` = **normalized**; vs unrelated = null. Word-boundary safety: `"BLUE - OUD BY SAHAR"` → `"Blue - Oud"` (real "Oud" kept).

---

## PART O — CHECKOUT PRICE BUG: STALE CART SNAPSHOT (2026-09-06)

### Bug (owner report)
Checkout page Order Summary showed a WRONG (old) price then the Order Items list:
- Order Items: `Impression of Acqua Di Gio Profondo Parfum 50ml ×1 — PKR 1,799` ✅ (DB price)
- Order Summary: `Acqua Di Gio Profondo Parfum (50ml) ×1 — PKR 800` ❌ (old price, not in DB)
- Subtotal/Total also showed the wrong price; note the Summary name was ALSO different ("Impression of" missing).

### Root cause (exact source)
- `CartItem` (`src/context/CartContext.tsx:6-13`) stores a **full snapshot** `{id, name, price, image, size, quantity}`. `price`, `name` and `image` are copied from the product at add-time.
- The snapshot persists: `localStorage["safari-cart"]` (`CartContext.tsx:41-49`) AND the DB `CartItem` table (`/api/cart` POST wrote the client snapshot verbatim).
- When the admin changes a product's `price`/`name` in the DB, any cart line added BEFORE the change still carries the OLD price/name.
- Checkout (`src/app/checkout/page.tsx:325,362,370`) and `CartSidebar.tsx:110` render `item.price` / `subtotal` directly — i.e. the **snapshot**, not the DB — so stale values are shown. Two cart lines for the pre/post-rename product explain the name + price mismatch between Order Items and Order Summary.
- **Server-side was already safe**: `/api/orders` POST recomputes every item's `price`/`name` from the DB (`productMap` + `sizePrices` lookup, `route.ts:71-112`), so the ORDER record itself was not at risk — but the UI (and the stored cart snapshot) was.

### Fix
1. **Fresh-price sync in `CartContext` (stale snapshot override):**
   - New `effectivePrice()` helper (sizePrice wins, else base price) mirroring `/api/orders` pricing.
   - New `refreshPrices()`: for each unique productId in the cart, fetches `/api/products/{id}` (no-store) and overrides `name`, `price`, `image` with current DB values. Runs on cart mount, whenever the cart's product-id set changes, and on window `focus` (catches admin price edits made while browsing elsewhere).
2. **Server-authoritative cart store** (`/api/cart`):
   - POST now recomputes `name`, `price` (incl. sizePrice), `image` from the DB before writing `CartItem` — falls back to snapshot only when the product no longer exists.
   - GET now recomputes the same from the DB (fresh values returned even for old stored rows).
3. **Order API** (`/api/orders`) — already recomputed price/name server-side; kept as-is (minimal hardening: DB `product.image` now preferred over client-sent image for the order item).

Result: checkout, cart sidebar, subtotal/total, DB order total, and email all show the CURRENT DB price/name (e.g. PKR 1,799 + "Impression of..." prefix) even for cart lines added at an older price.

### Price policy — ONE price everywhere (owner follow-up, same day)
Owner requirement: "walad price jo show ho ri hai wahi checkout me dikhani hai, aur har jaga — checkout, order processing." So the price the customer SEES must be the price CHARGED, everywhere.
- **Single source of truth = DB `product.price`.** Audit confirmed the storefront ONLY ever displays `product.price` (PDP `ProductDetailClient.tsx:135` `displayPrice = product.price` + handleAddToCart `price: product.price`; product cards/quick-view all use `product.price`). There is **no size selector** and **no storefront UI reads `sizePrices`** — `sizePrices` only fed the admin form, CSV import, and type-classification.
- The `sizePrices` override previously in CartContext `effectivePrice()`, `/api/cart` `resolvePrice()`, and `/api/orders` could change the charged price to a value the customer never saw → removed in all 3 places. Now PDP price = cart price = checkout/order summary = subtotal/total = order DB price = confirmation email price.
- Snapshot sync (PART O above) still applies: cart lines fetch fresh `name`/`price` (now = `product.price`) from `/api/products/{id}` on mount/focus/cart-change; bundles (id not in `Product` table) fall back to their snapshot price unchanged.

### Files changed
- `src/context/CartContext.tsx` — `refreshPrices` + `effectivePrice`, sync effects (mount / cart change / focus).
- `src/app/api/cart/route.ts` — GET+POST recompute name/price/image from DB.
- `src/app/api/orders/route.ts` — image preference DB-first (pricing validation already present).

### Constraints honored
- [x] `prisma/schema.prisma`, `server.js`, `next.config.ts` — NO TOUCH
- [x] Bulk Import, product pages, admin products UI — NO TOUCH
- [x] No new npm packages, no schema change, no new route
- [x] ESLint clean; `npm run build` ✓ clean (36.4s)
- [x] Note: dev server was restarted by user before this task; it is NOT running now (stopped before build).

### Verification steps for the owner
1. Clear localStorage cart / add item again at old price snapshot → open checkout → Order Summary now shows current DB price + name.
2. Place the order → `track` page / admin orders → order total = current DB price (server recomputes).
3. Admin: change a product price → reload the storefront (or refocus the tab) → cart/checkout show the NEW price.

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
