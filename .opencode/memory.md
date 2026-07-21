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

* MongoDB or PostgreSQL (verify current implementation before changes)

## Deployment

* Vercel

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
isNewArrival = true
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

Allowed values:

```text
men
women
unisex
```

Do not use:

```text
Men
MEN
Women
WOMEN
Unisex
UNISEX
```

Normalize values.

---

## Product Type

Allowed values:

```text
attar
perfume
```

Do not use mixed casing.

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
isNewArrival
isFeatured
bundle
offer
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


