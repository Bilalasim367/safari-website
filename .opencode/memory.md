# MEMORY.md

# Safari Perfumes E-Commerce Project Memory

This file contains permanent project knowledge that must be remembered throughout development.

Always use this document as project context before making any architectural or implementation decisions.

---

# ⚖️ VOLUME STANDARDS (CRITICAL — 2026-09-17)
**Attars = 12ml only. Perfumes = 50ml only.**
- This is the canonical rule for the WHOLE project. Do not change these defaults
  without an explicit user request.
- `defaultSizeForType(type)` in `src/lib/normalize.ts` returns `'12ml'` for
  `Attar` and `'50ml'` for `Perfume`. It is the single source of truth.
- Currently the store shows **only Attars (12ml)**. Perfumes (50ml) will be added
  later via phpMyAdmin / bulk upload (`scripts/seed-perfumes.sql` templates).
- Never hardcode a size fallback (e.g. `'50ml'`) in a cart/add-to-cart handler.
  If the product `type` is unknown at that point, default to `'12ml'` (attar).
- PDP tab label: `Notes` (was `Attar Notes`) + new `Details` tab.
  Attar details: origin / applicatorType / ingredients.
  Perfume details: concentration / bottleStyle / longevity / sillage.
  Both: fragranceFamily / gender / season / bestTime.
- Announcement bar in header is STATIC ("FREE SHIPPING ON COD") — no sliding.
- Header top socials render `/instagram.svg`, `/facebook.svg`, `/tiktok.svg`
  via `<img>` (same as Footer).

# Project Information

## Brand

Safari Perfumes

Arabic Name:

سفاري

Industry:

Perfumes & Attars

Business Type:

E-Commerce Store

---

# Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

## Backend

* Next.js API Routes / Node.js

## Database

* Turso (libSQL) via Prisma ORM (driver adapter) — NOT MongoDB/PostgreSQL

## Deployment

* cPanel (Phusion Passenger, Node 20.x) — `output: 'standalone'` + `server.js`

---

# Core Business Model

The website sells:

* Perfumes
* Attars
* Bundles
* Special Offers

Products must be organized using reliable collection and filtering systems.

---

# Product Collections

The website contains the following primary collections.

## Gender Collections

### Men

Contains only products intended for men.

### Women

Contains only products intended for women.

### Unisex

Contains only products intended for both genders.

---

## Marketing Collections

### Bestsellers

Contains only products marked:

```text
isBestseller = true
```

### New Arrival

Contains only products marked:

```text
isNew = true
```

---

## Product Type Collections

### Attar Collection

Contains only:

```text
type = attar
```

products.

### Perfumes Collection

Contains only:

```text
type = perfume
```

products.

---

## Promotional Collections

### Bundles / Offers

Contains only:

* bundle products
  or
* promotional offer products

according to business rules.

---

# Product Data Standards

All products must follow the same standards.

---

## Gender

Allowed values (canonical, DB standard):

```text
Men
Women
Unisex
```

Normalize via `normalizeGender()` in `src/lib/normalize.ts`.

Do not store:

```text
men
MEN
women
WOMEN
unisex
UNISEX
```

---

## Product Type

Allowed values (canonical, DB standard):

```text
Attar
Perfume
```

Normalize via `normalizeType()` / `normalizeTypeLoose()` in `src/lib/normalize.ts`.

Do not store legacy values like:

```text
Attar & Spray
Perfume Spray
EDP
```

---

## Boolean Fields

Allowed values:

```text
true
false
```

Examples:

```text
isBestseller
isNew
isFeatured
isHotSelling
isTrending
```

---

# Architecture Rules

## Single Source Of Truth

Avoid duplicate filtering fields.

Example:

If both exist:

```text
gender
categorySlug
```

Only ONE field should be the authoritative filtering source.

Determine the correct field through project analysis.

All filtering must use the same source.

---

# Product Filtering Requirements

Filtering must happen in this order:

Database
↓
Backend Query
↓
API Response
↓
Frontend Rendering

Avoid frontend-only filtering whenever possible.

---

# Navbar Collections

Current navbar items:

* Bestsellers
* New Arrival
* Our Collection
* Attar Collection
* Perfumes Collection
* Bundles / Offers

Each item must have:

1. Valid route
2. Correct API call
3. Correct backend filter
4. Correct displayed products

---

# Admin Panel Requirements

Admin panel must:

### Product Create

Save:

* gender
* type
* collection
* bestseller
* new arrival
* bundle
* offer

correctly.

### Product Edit

Must preserve data consistency.

### Validation

Reject invalid values.

---

# Current Known Problems

## Issue #1 — FIXED 2026-07-20

Gender filtering was broken.

### Root Causes Found & Fixed

| # | Root Cause | File(s) | Fix |
|---|-----------|---------|-----|
| P0 | `home/route.ts` and `search/route.ts` normalized gender to **lowercase** (`toLowerCase()`) but DB stores capitalized (`"Men"`, `"Women"`, `"Unisex"`). Query returned zero matches → silently fell back to returning all products. | `src/app/api/products/home/route.ts:18`, `src/app/api/search/route.ts:29` | Changed to use `normalizeGender()` which produces capitalized format |
| P1 | `UnisexTrend.tsx` logical bug: `p.gender?.toLowerCase() === "unisex" || p.isTrending` — the `|| p.isTrending` short-circuits, showing ALL trending products regardless of gender in the Unisex section. | `src/components/UnisexTrend.tsx:32` | Removed `|| p.isTrending` |
| P2 | API POST route (`products/route.ts`) did not normalize `gender`/`type` before saving. Unvalidated input like `gender: "men"` would be stored lowercase and become unfindable. Default `type` was `'Attar & Spray'` (not `'Attar'` or `'Perfume'`). | `src/app/api/products/route.ts:216-217` | Now uses `normalizeGender()` / `normalizeType()` |
| P3 | Duplicate normalization logic across 5+ files with inconsistent behavior (some capitalized, some lowered). Admin `actions.ts` had private `normalizeGender`/`normalizeType` functions not reusable elsewhere. | Multiple API routes + admin actions | Created `src/lib/normalize.ts` shared utility, refactored all consumers |

### Files Modified
- `src/lib/normalize.ts` — NEW: shared `normalizeGender()` and `normalizeType()`
- `src/app/api/products/home/route.ts` — uses `normalizeGender`, `normalizeType`
- `src/app/api/search/route.ts` — uses `normalizeGender`
- `src/app/api/products/route.ts` — GET and POST both use shared utils
- `src/app/shop/ShopContent.tsx` — uses shared utils
- `src/app/admin/(protected)/actions.ts` — removed private utils, imports from `@/lib/normalize`
- `src/components/UnisexTrend.tsx` — fixed `|| p.isTrending` bug
- `src/components/ProductCard.tsx` — restored from `.bak` (was empty file)
- `productcard_backup.tsx` — deleted (was causing type collision)

---

## Runtime Error Fixes — FIXED 2026-07-20

| # | Issue | Root Cause | Files Fixed |
|---|-------|-----------|-------------|
| R1 | Empty `src=""` on `<Image>` elements | 7 components passed `product.image` directly to `<Image>` without empty-string guard. CSV import defaults `image: ''`. | `MenCollection.tsx`, `WomenCollection.tsx`, `UnisexTrend.tsx`, `HotSellingCarousel.tsx`, `BestSellersCarousel.tsx`, `NewArrivals.tsx`, `HotSellingProducts.tsx` — each wrapped `<Image>` in `{product.image ? <Image ... /> : <Placeholder />}` |
| R2 | `<button>` nested in `<button>` in Header mobile menu | `SheetTrigger asChild={false}` renders own `<button>` which wraps `<Button>` (also `<button>`). | `Header.tsx:337` — changed `asChild={false}` to `asChild` |
| R3 | `<a>` nested in `<a>` (Link in Link) in product cards | Outer product card `<Link>` wrapped inner "Quick View" `<Link>` with same href that only called `preventDefault()`. | `MenCollection.tsx`, `WomenCollection.tsx`, `UnisexTrend.tsx` — replaced inner `<Link>` with `<span>` |

**Status**: Build passes, lint has zero new errors.

---

## Homepage Gender Sections — FIXED 2026-07-20

Each gender section on the homepage now fetches ALL active products of its gender directly from the database (instead of filtering trending-only products client-side).

**Data flow before:**
```
page.tsx → fetch isTrending=true (max 20) → same array to all 3 sections
  → MenCollection: filters gender=Men, slice 4
  → WomenCollection: filters gender=Women, slice 4
  → UnisexTrend: filters gender=unisex, slice 4
```

**Data flow after:**
```
page.tsx → fetch gender=Men from DB → MenCollection (ALL men products)
         → fetch gender=Women from DB → WomenCollection (ALL women products)
         → fetch gender=Unisex from DB → UnisexTrend (ALL unisex products)
```

**Files modified:**
- `src/app/page.tsx` — replaced `newArrivals`/`trending` queries with 3 gender-specific DB queries
- `src/components/HomePage.tsx` — accepts `menProducts`, `womenProducts`, `unisexProducts` props
- `src/components/MenCollection.tsx` — removed `.slice(0, 4)` limit
- `src/components/WomenCollection.tsx` — removed `.slice(0, 4)` limit
- `src/components/UnisexTrend.tsx` — removed `.slice(0, 4)` limit

---

## Issue #2

Navbar collection filtering is broken.

Affected sections:

* Bestsellers
* New Arrival
* Our Collection
* Attar Collection
* Perfumes Collection
* Bundles / Offers

Observed:

Pages load but filters do not work correctly.

Expected:

Only matching products should appear.

---

## Issue #3

Potential Data Inconsistency

Possible inconsistent values:

```text
Men vs men
Women vs women
Unisex vs unisex
Attar vs attar
Perfume vs perfume
```

Must be verified.

---

# Development Priorities

Priority 1:

Fix product filtering.

Priority 2:

Fix navbar collections.

Priority 3:

Normalize product data.

Priority 4:

Optimize filtering architecture.

Priority 5:

Improve performance.

---

# Required Development Workflow

Every task must follow:

1. Read MEMORY.md
2. Read PRD.md
3. Read RULES.md
4. Read PHASES.md
5. Audit Application
6. Identify Root Cause
7. Design Solution
8. Implement Solution
9. Test Solution
10. Document Results

Never skip steps.

---

# Definition Of Done

A task is considered complete only when:

✅ Root cause identified

✅ Database verified

✅ Backend verified

✅ Frontend verified

✅ Admin panel verified

✅ Filters working

✅ Collections working

✅ Testing passed

✅ No regressions introduced
---

# Data Access Patterns (Verified from Codebase)

## Write Operations
- Create: `prisma.model.create({ data })`
- Update: `prisma.model.update({ where: { id }, data })`
- Upsert: `prisma.model.upsert({ where, create, update })` — used for bulk product upload by `productId`
- Bulk Create: `prisma.model.createMany({ data: [...] })` — used for cart sync
- Transaction: `prisma.$transaction([...])` — atomic cart delete+insert

## Read Operations
- `findUnique` — by id/slug
- `findMany` with `where`, `include`, `orderBy`, `skip`, `take` — filtered/paginated product lists
- `count` for pagination totals

## Critical Conventions (DO NOT VIOLATE)
- **Arrays are stored as JSON strings** — always `JSON.stringify()` on write, `JSON.parse()` on read (e.g. product images, notes, sizes)
- **Soft deletes only** — use `isActive` / `stockStatus`, never hard-delete records
- **Unique constraints drive upserts** — `slug`, `email`, `productId`
- **All write APIs require JWT + admin role check** via cookies before touching the database
- **Rate limiting** on login via `src/lib/rateLimit.ts` (in-memory)

## Data Flow
Client (React) → API Route (Next.js) → Prisma → Turso (SQL) → back up the same chain as JSON
✅ Production-ready solution delivered

Anything less is incomplete.

---

# PHASE 4-6 COMPLETION LOG

## Performance Optimization Pass — 2026-08-20 (Turso + Prisma)

### Context
DB: Turso (libSQL) via Prisma 5.22 driver adapter. Live DB was missing several indexes the schema declares (created via `prisma db push` locally, never applied to Turso).

### Indexes applied to live DB (idempotent, in `prisma/apply-migration.ts`)
- Product: `gender+isActive`, `type+isActive`, `isBestseller+isActive`, `isNew+isActive`, `isHotSelling+isActive`, `isTrending+isActive`, `isFeatured+isActive`, `isActive`, `createdAt` (added to schema too)
- OrderItem: `orderId`; CartItem: `userId`; WishlistItem: unique `userId+productId` + `userId`; Notification: `userId+read`
- Verified via `PRAGMA index_list` — all present.

### Select tightening (payload + DB read reduction)
- `src/app/page.tsx` — 4 homepage queries: full fetch → explicit `select` (~24 cols + `category{name}`), was ~45 cols × 4 queries.
- `src/app/shop/ShopContent.tsx` — grid query → explicit `select` (~30 cols + `category{name,slug}`), removed `include: category` full.
- `src/app/api/admin/orders/route.ts` GET — `include items` → `select` order scalars + `items{id,name,price,quantity,size,image}`.
- `src/app/api/orders/route.ts` GET — `include items` (itemCount via items.length) → `select` + `_count.items`.
- `src/app/api/orders/by-number/[orderNumber]` — full include → `select` + `items` select.
- `src/app/bundles/page.tsx` + `bundles/[slug]` — bundle/items/product selects (product pruned to display fields only).
- `src/app/api/admin/users/route.ts` — users findMany → select of mapped fields.
- Flagged (shape must not change; consumers need full object): `/api/products` GET (PDP consumes full object), `/api/products/home` (dead route, no consumers).

### N+1 fixes
- `api/categories/route.ts` — per-category `product.count` loop → single `groupBy([categorySlug], _count)`.
- `api/users/route.ts` — per-user `order.count` loop → single `groupBy([userId], _count)`.

### Parallelization
- `bundles/[slug]` — `getBundle` + `getOtherBundles` → `Promise.all`.
- `api/orders/route.ts` POST — products + settings + user lookups → `Promise.all`.

### Caching / ISR
- Homepage, `/bundles`, `/bundles/[slug]`, `/shipping`: removed `force-dynamic`, set `revalidate = 300`.
- ⚠️ BLOCKER: `src/app/layout.tsx` calls `await headers()` (isAdmin detection) → forces the whole app dynamic → page-level ISR is currently inert. Real cache wins are route-level: `/api/products` (s-maxage 300 + SWR 600) and `/api/search` (s-maxage 60 + SWR 120). To activate page ISR: move admin detection out of the root layout (e.g. middleware/Proxy already sets `x-pathname`; or a nested layout) — deferred, needs UI regression check.
- NOT cached (deliberate): cart, wishlist, orders, admin, settings, categories (admin edit→reload would serve stale).

### Pagination gaps (flagged, NOT changed — frontends lack paging)
- `api/admin/orders` GET, `api/admin/users` GET, `api/users` GET, `api/notifications` GET, `admin actions getAdminProducts` — unbounded.
- OK: `/api/products` (page/limit), shop grid (PAGE_SIZE 12), `/api/search` (take 10), `/api/products/home` (take limit), `getAdminBundles` (take 50).

### Embedded replicas — DEFERRED
Deployment is Vercel serverless (vercel.json, Fluid, ephemeral FS) → libSQL embedded replicas won't persist between invocations; net overhead. Real levers: Vercel function region colocation with Turso (ap-northeast-1 → set `regions: ["hnd1"]`) or Turso region move to the primary traffic region; plus the CDN caching above.

### Slow query visibility
- `src/lib/turso.ts` — added `client.$on('query')` logging queries ≥ 200ms (`[prisma:slow]`).

### Verification
- `npm run lint`: 0 errors, 34 pre-existing warnings.
- `npm run build`: ✓ compiled (dev server must be stopped first).
- Live-DB smoke tests passed: orders `select`+`_count`, homepage selects (8/51/65/223 rows), `groupBy`.

### Related fix (previous session, 2026-08-20)
- Order table missing 5 columns (`customerPhone`, `discount`, `paymentMethod`, `billingAddress`, `notes`) → added idempotently in `prisma/apply-migration.ts`, ran on live DB.
- Product delete now soft-deletes (`isActive: false`) in `admin/(protected)/actions.ts` + `api/admin/products/route.ts` (was hard delete → FK RESTRICT on BundleItem).

---

# PHASE 4-6 COMPLETION LOG

## Phase 4 — Admin Dashboard UI (COMPLETED)
- `api/categories/route.ts`: added admin-guarded PUT + DELETE (slug-uniqueness, 404s)
- `admin/categories/page.tsx`: bare-array guard (`Array.isArray`), `_id`→`id`, save/delete wired to real `/api/categories` (previously hit `/api/admin/products`)
- `admin/settings/page.tsx`: full rewrite — loads GET `/api/settings`, real PUT save (toast + saving state), PKR default, SMTP fields, honest payment-methods card (Card = "Not integrated")
- `admin/dashboard/page.tsx`: stats from full orders array + `productsData.total`; `$`→`PKR`
- `api/admin/products/route.ts` GET: returns `{ products, total }`
- `admin/orders/page.tsx`: openOrder helper (no setState-in-effect), paymentStatus Select (pending/paid/failed/refunded) → PUT `/api/admin/orders`
- `admin/users/page.tsx`: `inactive`→`blocked` (stat card, filter, dialog buttons)
- `admin/login/page.tsx`: Remember me wired to `rememberMe`
- `admin/products` + `admin/bundles`: in-effect IIFE loaders with `cancelled` flag (react-compiler lint rule can't trace component-scope loaders)

## Phase 5 — Storefront (COMPLETED)
- `collections/page.tsx`: real "Our Collection" page (ShopContent + searchParams + COLLECTION_MAP: for-him/for-her/unisex/attars/signature/limited)
- `Footer.tsx`: `filter=new`→`isNew=true`, `filter=bestseller`→`isBestseller=true`
- Home components (HotSellingCarousel, MenCollection, WomenCollection, UnisexTrend): `$`→`PKR {toLocaleString()}`
- `bundles` list+detail: PKR incl. "Save PKR X"
- `track` + `account`: PKR order totals
- `shipping`: full rewrite — PKR rates, DYNAMIC from Settings DB (`standardShippingFee`, `freeShippingThreshold` via `prisma.settings.findFirst()`), Pakistan regions
- `shop/[slug]`: free-shipping accordion line dynamic from `/api/settings`

## Phase 6 — Testing & Data Verification (COMPLETED)
- `scripts/data-audit.ts` (read-only, safe): audited LIVE production Turso DB — 339 products, gender/type canonical; found 330 legacy `categorySlug="attar & perfume"` + missing Settings row
- `prisma/apply-migration.ts`: now also inserts Settings row (`INSERT OR IGNORE 'settings-default'`, PKR/Asia/Karachi/0 fees) + normalizes categorySlug — RUN SUCCESSFULLY on live DB (2026-08-19). Re-audit: 0 mismatches, Settings row live
- **Read-only Playwright suite (shop/homepage/product-detail/search-api): 59/59 PASSING** (chromium, `--workers=1`)
- **Mutation-heavy specs (cart-checkout, admin, comprehensive) MUST NOT run against the LIVE production DB** (.env points to `perfume-store-bilalasim.aws-ap-northeast-1.turso.io`)

### Test-suite learnings (important)
- `waitForLoadState('networkidle')` RACES with Next.js App Router soft navigations (RSC fetch can start after networkidle fires). Post-click waits must be URL-based: `await expect(page).toHaveURL(/pattern/, { timeout: 30000 })`.
- `toHaveURL` regexes are matched against the FULL URL (`http://localhost:3000/...`) — do NOT anchor with `^\/shop`; use `expect.poll(() => new URL(page.url()).pathname)` for path checks.
- `page.click(sel).first()` is invalid — `page.click` returns a Promise; use `page.locator(sel).first().click()`.
- Dev-server cold compiles can exceed default 5s assertion timeouts — bump URL assertions to 30s.
- `playwright.config.ts`: `workers: process.env.CI ? 1 : 3` (was `undefined` = unlimited; caused severe contention with the dev server + live Turso).

### Bugs fixed during Phase 6
1. **ProductCard badge bug (P1, real)**: `badge = isBestseller ? "Bestseller" : isNew ? "New" : ""` (else-if) meant products both bestseller AND new never showed "New". Now renders independent badges (both can appear). Fix in `src/components/ProductCard.tsx:121-134`.
2. **FilterSection minPrice=0 bug (P1, real)**: `if (newMin) sp.set('minPrice', ...)` dropped `minPrice=0` from "Under PKR 5,000" URLs (and broke selected-state). Now `if (newMin !== '')`. `src/app/shop/FilterSection.tsx:53-59`.
3. **BrandStory fill warning**: `fill` image's immediate parent lacked `relative` (next/image console warning on every homepage load). Fixed `src/components/BrandStory.tsx:13`.
4. **Stale test selectors**: 18 tests in `tests/shop.spec.ts` rewritten to match real UI (filters are `<Link>` elements with lowercase query values like `gender=men`/`type=attar`/`fragranceFamily=Woody`/`minPrice=0`; product cards are `<Link href="/shop/{slug}">` inside `div.grid` — NOT `<article>`/`.product-card`; badges are plain `span` with text "Bestseller"/"New", no `.bestseller-badge`/`.new-badge` classes).

## Lint/build status
- `npm run lint`: 0 errors, 34 pre-existing warnings (unused vars in `tests/*.spec.ts`)
- `npm run build`: ✓ Compiled successfully (~24s)
- NOTE: dev server must be stopped before `npm run build` (Prisma `query_engine-windows.dll.node` is locked by dev process → EPERM rename error)

## Open items
- 34 lint warnings (pre-existing unused vars in test files) — out of scope
- Remaining eslint-disable setState-in-effect in storefront contexts (WishlistContext:24, CartContext:118, Header:76, account:61, track:97) — pre-existing, out of scope
- 6 pre-existing TS errors reported by `tsc --noEmit` (seed.ts `pool`, api/admin/products POST `sizePrices` missing, orders/by-number `userId`, bundles/page `_count`) — pre-existing; build ignores type errors (`next.config.js` sets `typescript.ignoreBuildErrors: true`)

---

# BULK PRICE UPDATE — COMPLETED 2026-09-14

Rewrote the admin Bulk Price Update feature for the actual supplier CSV format.

## CSV format handled (this file is the source format)
```
Row 1: (blank)                 → ignored
Row 2: "Final Perfumes Prices and Category List"  → title, ignored
Row 3: (blank)                 → ignored
Row 4: header Sr. #, Perfume Oil, Price of 100 Gram Oil, Attar Price (1 Tola),
       Box Price (1 Tola), Bottle Price (1 Tola), Printing Cost, Flyer Cost,
       Delivery Charges, Total Cost (1 Tola), Selling Price
Row 5+: product rows
Last:  Total summary row       → ignored
```
Header row is located dynamically (row containing "Perfume Oil" + "Selling Price"),
so preamble length changes do not break the parser.

## Files added
- `src/lib/text-match.ts` — dependency-free normalization + fuzzy matching.
  `normalizeProductName` (NFKC, lowercase, `&`→and, strips `{...}`, trailing `PRM`,
  all punctuation→space, collapse whitespace; parens content KEPT so EDT≠EDP≠Parfum).
  `similarity` = 0.4·bigram-Dice + 0.4·token-containment + 0.2·Levenshtein.
  `bestFuzzyMatch` two-tier: ≥0.90 auto, or ≥0.82 if unambiguous (gap ≥0.12 to runner-up).
- `src/lib/bulk-price.ts` — reusable parser/matcher module (also future-reusable for
  bulk product import from the same CSV):
  `parsePriceCsv` (PapaParse, header auto-located, Total/gaps skipped, quoted commas+
  escaped quotes, decimal prices), `dedupeRows` (last occurrence wins per normalized
  name), `buildDbIndex`/`matchRows` (exact normalized → fuzzy; DB-name duplicates → all
  updated), `resolveMatchedIds`, `diffProductPrices` (single source of truth for the
  CSV→DB mapping: `Selling Price → price`, `Price of 100 Gram Oil → oilPricePer100g`;
  other CSV columns parsed but not written — no matching plumbing column exists).

## Files modified
- `src/app/api/admin/products/bulk-price/route.ts` — rewrote POST:
  admin JWT+role check, 5MB + `.csv`-only (decision: CSV only, consistent with
  bulk-upload route), row cap 3000, preview vs apply modes, all writes + audit in a
  single `prisma.$transaction`. Apply mode only writes fields that actually differ.
- `src/app/admin/(protected)/products/bulk-price/page.tsx` — rewrote UI:
  drag&drop + browse, sample CSV (real format), preview stats bar (rows/matched/price
  changes/not found/invalid/duplicates), full row table with old→new highlights,
  not-found section + "Download not-found CSV", duplicates (last wins) section,
  Confirm Update → applied summary, per-field audit.
- `prisma/schema.prisma` — new `PriceUpdateLog` model (audit trail: productId,
  productName, csvFileName, field, oldValue, newValue, performedById/Email, createdAt;
  `@@map("priceupdatelog")`, indexes on productId+createdAt, createdAt).
- `prisma/apply-migration.ts` — idempotent `CREATE TABLE IF NOT EXISTS priceupdatelog`
  (mysql/libSQL compatible) — must be run against the DB before apply uses the table.

## Verification
- `npm run lint`: my files 0 errors/0 warnings (6 pre-existing errors in `scripts/*`).
- `tsc --noEmit`: no errors in the new/modified files (5 pre-existing elsewhere).
- `npm run build`: ✓ Compiled successfully (~33s), `/admin/products/bulk-price` and
  `/api/admin/products/bulk-price` route output correctly.
- Logic test (temp script, since deleted): 19/19 assertions passed — preamble ignored,
  `Total` row ignored, `"""K"" BY …"` quoted cell parsed as `"K" BY DOLCE & GABBANA (D&G)`,
  decimal prices (1114.8) parsed, duplicate row 11 kept over 9, `PACCO RABANNE` fuzzy
  matched `PACO RABANNE` (sim 0.921), unknown product → not-found, no false matches.
- NOTE: could NOT validate against live DB from this workspace (`mysql://…localhost`
  creds invalid from here). Live-DB run of `npx tsx prisma/apply-migration.ts` is
  required to create `priceupdatelog` before first apply.

## Known limitation / decision
- Only `.csv` accepted (consistent with other admin uploads). xlsx → reject with message.
- Matching is name-based (the CSV has `Sr. #`, not SKU). Products not found are reported
  + downloadable, never auto-created.

## DEPLOYMENT NOTE (2026-09-14)
- `.env`/`.env.production` point to cPanel MySQL (safariperfumes_perfume_user @ localhost,
  DB `safariperfumes_perfume_db`); `.env.local` points to local root MySQL DB `perfume_db`.
  Next.js dev uses `.env.local` (overrides `.env`).
- The bulk-price apply 500 (P2021 `priceupdatelog does not exist`) was root-caused to the
  missing table. Migration was run against the LOCAL DB:
  `npx tsx --env-file=.env.local prisma/apply-migration.ts` → priceupdatelog table ensured
  (cols verified; interactive `$transaction` trace with product.update +
  priceUpdateLog.createMany validated, rolled back, no data changed).
- MUST ALSO run `npx tsx --env-file=.env prisma/apply-migration.ts` against the PRODUCTION
  (cPanel) DB before enabling bulk price apply in production — the table does not exist
  there yet.
---
- apply-migration's MySQL `CREATE INDEX IF NOT EXISTS` statements fail on plain MySQL
  (syntax 1064 — supported on MariaDB/cPanel, not vanilla MySQL). Pre-existing, non-fatal.

# FOOTER SOCIAL LOGOS — 2026-09-14
- User added `public/instagram.svg`, `public/facebook.svg`, `public/tiktok.svg` (black-fill SVGs).
- `src/components/Footer.tsx` social row now renders those images (`<img src="/instagram.svg">` etc,
  w-5 h-5, `invert` + `opacity-80`, hover `opacity-100`; verified `invert(1)` in dev) inside circular
  bordered links. Links (already present, unchanged): instagram.com/safariperfumesofficial,
  facebook.com/share/19G8xxiTP7, tiktok.com/@safari.perfumes — all open in new tab.
- `<img>` (not next/image) is intentional: next/image refuses .svg without `dangerouslyAllowSVG` in
  next.config (not set). Consistent with 20 existing `<img>` usages app-wide; eslint `no-img-element`
  warnings are pre-existing pattern. Header.tsx top-nav socials are separate (header still inline SVG).

---
# SESSION NOT PERSISTING — FIXED 2026-09-14 (multi-part root cause)

Symptom: login worked but the session was lost on any page reload / after ~15 min
("session login save nahi ho raha").

## Root causes (all found & fixed)
1. **Refresh tokens were born-expired.** `jose`'s `setExpirationTime` treats a NUMBER as an
   absolute epoch timestamp, NOT seconds. `login/route.ts` passed `7*24*60*60` (604800) /
   `30*24*60*60` → token exp = Jan 1970 → `verifyToken` always null → `/api/auth/refresh` always
   401. Proved with a runtime jose test ("exp claim timestamp check failed").
2. **refreshUser killed valid sessions.** `AuthContext.refreshUser()` called
   `fetch('/api/auth/refresh')`; on non-OK it did `setUser(null)` even though the access_token was
   still valid. Combined with #1, every page load wiped the session.
3. **Wrong "still loading" flag.** `AuthContext` has BOTH `loading` (only set during `logout()`) and
   `authChecking` (true during init). `account/page.tsx` destructured `loading: authLoading` and
   redirected to `/login` while auth-check was still running → hard redirect on every reload.
4. **`user` initialized to `null`, not `undefined`.** `AdminLayout.tsx` renders its spinner only
   when `user === undefined`, which could never happen → "Please login as admin" flash on reload.
5. Cookie/token lifetime mismatch: access_token cookie `maxAge: 15*60` vs token signed `'30d'`
   → cookie dropped after 15 min.

## Fixes
- `src/lib/auth.ts`: `createRefreshToken` normalizes numeric input to `${n}s` so it can never mint
  an expired token again. (Kept `setAuthCookies` helper; access cookie maxAge 30d.)
- `src/app/api/auth/login/route.ts`: builds refresh token with string `'7d'`/`'30d'` (per rememberMe);
  sets cookies via `setAuthCookies` (access token cookie now 30d to match token).
- `src/app/api/auth/register/route.ts`: now also creates a refresh_token (`'7d'`) and uses
  `setAuthCookies` (previously only a 15-min access cookie → registration sessions died too).
- `src/app/api/auth/refresh/route.ts`: access cookie `maxAge` aligned to 30d.
- `src/context/AuthContext.tsx`: `user` starts as `undefined` (loading); `refreshUser` now falls
  back to `GET /api/auth/me` on refresh failure — `/api/auth/me` is the single source of truth for
  client session state, so a valid access token is never destroyed by a failing refresh.
- `src/app/account/page.tsx`: guard uses `authChecking` (was `loading`).
- `AdminLayout.tsx`: now works correctly with the `undefined` init state (no code change needed).

## Verification
- jose runtime test: numeric exp = born-expired; string / `${n}s` exp = valid.
- Browser E2E (registered temp user `sess-test-914@example.com`, deleted afterwards):
  - register → auto-login OK; `POST /api/auth/refresh` now returns **200** (was always 401).
  - full page reloads of `/account` persist the session (2x verified); `/api/auth/me` returns user.
  - test user removed from DB after test.
- `npx eslint` + `tsc --noEmit`: no errors in changed files.
- NOTE: full `npm run build` not run because dev server holds prisma DLL (known constraint,
  memory.md line ~610). Run once dev server is stopped.

---
# PDP EMPTY STRIP + SCARCITY/WHATSAPP CTA — FIXED 2026-09-15

## 1. PDP white/light strip under the navbar
- Root cause: `src/components/SiteShell.tsx:28` wraps all storefront pages in
  `<main className="flex-1 pt-20 md:pt-28">`. The header is `sticky` (in-flow, NOT fixed), so
  this 80px/112px padding is leftover overlay-compensation that shows the LIGHT body background
  (`--background: 30 20% 98%` ≈ cream/white) above any page whose top is dark.
- Why only PDP: Home `src/components/Hero.tsx:11` cancels the padding with `-mt-20 md:-mt-28`;
  Shop/Collections/Cart have light `bg-background` tops (strip invisible = part of the design).
  The PDP dark wrapper (`bg-[#0a0a0a]`, full-bleed) had NO compensation → visible light strip.
- Fix (page-specific, matches Hero pattern): `src/app/shop/[slug]/ProductDetailClient.tsx:213`
  outer div now `-mt-20 md:-mt-28 bg-[#0a0a0a] …`. Breadcrumb/content padding (`container-custom
  py-6 lg:py-12`) unchanged.
- Verified (headless Playwright, 1280×900 and 390×844): gap header-bottom → PDP-content-top == 0
  on both; breadcrumb sits 48px (py-12) below the black container top on desktop, Back button
  24px (py-6) below on mobile. Shop/Home untouched.

## 2. ScarcityLine readability
- `src/components/ScarcityLine.tsx`: pill variant `text-white`; alert variant `text-[#e5e5e5]`
  (both light — gold/10 bg + gold border on dark pages; `text-charcoal` was near-invisible).
  Used on PDP (2x) and bundles page — both dark backgrounds, safe.

## 3. WhatsApp Order CTA
- `src/app/shop/[slug]/ProductDetailClient.tsx`:
  - Button label now `Order on WhatsApp` (English; was `WhatsApp pe Order Karein`) with green
    `border-[#25D366]` + green icon via `WhatsAppIcon className="… text-[#25D366]"`.
  - WhatsApp message is now a real order (English template):
    `Assalam o Alaikum! I would like to place an order:`
    `Product:`, `Price:`, `Quantity:`, `Link:` (client-built `${location.origin}/shop/${slug}`).
    Number from `readPopupSettings().whatsappNumber`.

## 4. Canonical WhatsApp number → 923346322462  (2026-09-15 session 2)
- OLD `923247277489` replaced everywhere (defaults + runtime):
  - `src/lib/popup-settings.ts` DEFAULT_POPUP_SETTINGS.whatsappNumber
  - `data/popup-settings.json` (runtime file, live)
  - `src/app/api/popup-settings/route.ts` PUT fallback
  - `src/components/FloatingWhatsApp.tsx` initial state
  - `src/app/admin/(protected)/popup-settings/page.tsx` DEFAULT + fetch fallback
  - `src/components/Footer.tsx` tel:+923346322462 · +92 334 6322462
- Display format: `+92 334 6322462`; wa.me/country code: `923346322462`.

## Verification
- `npx eslint` on changed files: 0 errors.
- `npm run build`: ✓ PASSED (dev server stopped first due to Prisma DLL lock, restarted
  afterwards; route map incl. `/shop/[slug]` emitted).



---

# BULK PRICE CSV MATCHING OVERHAUL � 2026-09-15 (session 2)

## Problem
Supplier perfume.csv writes names as **"NAME BY BRAND"** (and drops trailing "- PRM") while the DB stores
many names BRANDLESS ("Sauvage" not "Sauvage By Dior"). Old matcher = exact normName + fuzzy only ?
**94/322 CSV rows matched**, 228 went to not-found.

## New matcher (src/lib/bulk-price.ts + src/lib/text-match.ts)
Layered, gated, earlier layer = higher confidence:
1. exact � full normalized name exact
2. randless � exact brand-less (strips last " by <brand>") with disambiguation:
   prefers candidates whose full name contains the CSV's trailing brand tokens; single candidate = accept;
   multi ambiguous = not-found (no guessing)
3. uzzy � full-name fuzzy (>=0.9, or >=0.82 + gap >=0.12)
4. uzzyBrandless � brandless fuzzy (same thresholds)
5. substring � ordered-token subsequence (all CSV tokens appear in DB order),
   sanity bar similarity >= 0.55, runner-up gap >= 0.10 (or unique)
Also: 
ormalizeProductName now strips standalone "PRM" ANYWHERE (/\bprm\b/g), not just trailing.

## New data / API
- matchType field on every MatchEntry: exact | brandless | fuzzy | fuzzyBrandless | substring | override | not-found
- 
otFound[] items now carry suggestions: {dbName, similarity}[] (top-5 >= 0.45)
- determinism: not-found rows are sorted by run, no array-order dependence.

## Results (validated against local DB + perfume.csv)
- **320/322 matched** (brandless=256, exact=59, fuzzy=2, substring=2, fuzzyBrandless=1)
- 2 not-found are genuinely absent/ambiguous: WHITE OUD TOP SELLING (no DB match) and ZAM ZAM (absent).
- All 9 ambiguous brandless collisions resolve correctly via L1 exact (e.g. "LEGEND BY MONTBLANC" ?
  "Legend By Montblanc", not "Legend"). white musk no longer a collision (different brandless keys).
- No false positives found in audit.

## Admin UX
- Match column shows per-layer badge + similarity tooltip.
- Quality breakdown bar (matchType counts) under the summary hunks.
- not-found rows now get a **suggestion dropdown** per row ? admin picks a DB product ? stored as
  **override** ? sent as overrides: [{row, dbName}] to POST /api/admin/products/bulk-price on apply.
  Overridden rows are dropped from the apply-run notFound list; entry matchType = override.
- debug console.log("[bulk-price] �") in the API route with mateh-count + breakdown.

## Verification
- scripts/_validate-matcher.ts (322 rows ? 320), scripts/_debug-collisions.ts (9 collisions OK).
- 
pm run lint: 0 new errors (20 pre-existing in tests/scripts remain).
- 
px next build: ? PASSED (36s; dev server running so 
pm run build's prisma generate DLL rename
  fails with EPERM � use 
px next build when schema unchanged).

---

# PDP DETAILS TAB + VOLUME STANDARDS + STATIC BANNER — 2026-09-17

## 1. PDP shows full admin detail fields
- `src/app/shop/[slug]/ProductDetailClient.tsx` — new third tab `Details`:
  - Attar → Sourcing Origin, Applicator Type, Ingredients (+ fragranceFamily,
    gender, season, bestTime for both types)
  - Perfume → Concentration, Bottle Type, Longevity, Sillage (+ shared fields)
  - Existing `Notes` tab label changed "Attar Notes" → "Notes" (works for perfumes).
  - `sizeDisplay` now falls back to `defaultSizeForType(product.type)` (was "12 ML").
  - All fields (concentration/bottleStyle/longevity/sillage/origin/applicatorType/
    ingredients) were already in `formatProduct` output (page.tsx) → render only.

## 2. Only 12ml attars shown — hardcoded '50ml' cart fallbacks fixed
These cart "add" handlers used `'50ml'` when size was empty; all replaced with
`'12ml'` (current attar default):
- `src/app/shop/ShopProductCard.tsx:55`
- `src/components/ProductCard.tsx:67`
- `src/components/QuickViewModal.tsx:39`
- `src/components/CartSidebar.tsx:30`

## 3. Header: static announcement + real social SVGs
- `src/components/Header.tsx` — removed `msgIndex` state + 5s `setInterval`;
  announcement bar is now a single static centered span.
- `socialIcons` array now holds `image` paths (`/instagram.svg`,
  `/facebook.svg`, `/tiktok.svg`) instead of inline SVG paths; top bar + mobile
  drawer render `<img ... className="invert opacity-80 hover:opacity-100">`
  (same visual language as Footer.tsx).

## 4. cPanel MySQL-safe migration
- `prisma/apply-migration.ts` — ALL raw-SQL table names lowercased to the real
  cPanel/MySQL names (`product`, `order`, `orderitem`, `cartitem`,
  `wishlistitem`, `notification`, `settings`). Previously used `Product`,
  `Order`, etc. which fail on Linux/cPanel case-sensitive MySQL.
  (Map verified against `@@map()` in prisma/schema.prisma.)
  returnrequest/priceupdatelog were already lowercase.

## 5. Perfume seed template
- `scripts/seed-perfumes.sql` (NEW) — phpMyAdmin-ready INSERTs for 50ml
  perfumes, incl. one live example + commented templates for a local-clone
  perfume (uses `impressionOf`) and an own-brand perfume. Sets type='Perfume',
  size='50ml', concentrations, bottleStyle, longevity, sillage, etc.

## Verification
- `npm run lint` — run before commit (per AGENTS.md). No known new issues.
- No DB migration needed from this change (table structures unchanged).
- Apply-migration must still be run against production to (re)create
  returnrequest/priceupdatelog + this runs fine on cPanel MySQL now.

---
