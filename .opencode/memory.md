# MEMORY.md

# Safari Perfumes E-Commerce Project Memory

This file contains permanent project knowledge that must be remembered throughout development.

Always use this document as project context before making any architectural or implementation decisions.

---

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
- `gift-cards`: PKR denominations [500..10000], custom min 500 / max 100000
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


