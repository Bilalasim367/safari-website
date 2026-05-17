# Bulk Product Upload — Implementation Plan

## Overview

Add new fields to the existing Prisma Product model, build a dedicated admin bulk-upload page, a CSV-parsing API route, and enhance the public shop pages to display the new product detail fields.

---

## 1. Schema Changes (`prisma/schema.prisma`)

Add these optional fields to the existing `Product` model (keeping all existing fields for backward compatibility):

```
productId          String?  @unique
gender             String   @default("Unisex")
type               String   @default("Attar & Spray")
season             String?
bestTime           String?
impressionOf       String?
shortDescription   String?
longDescription    String?  @db.Text
tags               String?
sizesAvailable     String   @default("3ml,6ml,12ml,50ml")
price3mlPhysical   Int?
price6mlPhysical   Int?
price12mlPhysical  Int?
price50mlPhysical  Int?
price3mlOnline     Int?
price6mlOnline     Int?
price12mlOnline    Int?
price50mlOnline    Int?
currency           String   @default("PKR")
oilPricePer100g    Int?
supplier           String?
isFeatured         Boolean  @default(false)
isActive           Boolean  @default(true)
stockStatus        String   @default("in_stock")
imageFolder        String?
metaTitle          String?
metaDescription    String?
```

**Why keep existing fields?** The existing code references `price`, `sizePrices`, `notesTop`, etc. extensively in the admin panel and ProductCard. New fields are additive — existing code continues to work, bulk-uploaded products can use the new rich fields.

---

## 2. New Files to Create

| File | Purpose |
|------|---------|
| `src/app/admin/products/bulk-upload/page.tsx` | Upload UI: drag-drop zone, preview table, progress bar, error report |
| `src/app/api/admin/products/bulk-upload/route.ts` | Accepts multipart/form-data CSV, parses via papaparse, upserts products |
| `src/lib/csv-parser.ts` | CSV parse + row validation + row→Product transform logic |

**No need to create** new `/products` routes — the existing `/shop` and `/shop/[slug]` routes will be enhanced to display the new fields.

---

## 3. Install Dependencies

```
npm install papaparse @types/papaparse
```

---

## 4. API Route — `POST /api/admin/products/bulk-upload`

- Auth: `x-api-key` header check (matches existing pattern in `api/admin/products/route.ts`)
- Accepts `multipart/form-data` with field `file` (the .csv)
- Flow:
  1. Read file as text
  2. Parse with `papaparse` (header: true, skipEmptyLines: true)
  3. For each row:
     - Trim all string fields
     - Validate: name required, at least one price positive, gender in {Men, Women, Unisex}, is_active/is_featured are "true"/"false"
     - Transform: convert `price_3ml_physical` → `price3mlPhysical`, parse booleans, etc.
     - Generate slug from name (URL-safe, append `-2`/`-3` if conflict)
     - `upsert` by `productId`: if exists → update, if new → create
     - Also populate existing `sizePrices` JSON and `price` field (lowest physical) for backward compat
  4. Return `{ total, created, updated, skipped, errors[] }`

---

## 5. Admin UI — `/admin/products/bulk-upload`

Client component with:

- Header — "Bulk Upload Products" with breadcrumb
- "Download Sample CSV" button — generates a CSV with headers + 1 sample row, triggers download via Blob URL
- Drag-and-drop zone — accepts `.csv` only, shows filename on drop
- Preview table — after file selected, parses locally and shows first 5 rows in a scrollable table
- Column mapping confirmation — shows detected columns count, green checkmark
- "Import Products" button — disabled until file selected, shows spinner when uploading
- Progress bar — indeterminate or percentage-based (since upserts happen in batches)
- Status log — "Processing row 45/331..."
- Error report — after completion, shows table of skipped rows: row #, product_id, reason
- Success summary — "298 created, 30 updated, 3 skipped"

Triggers: POSTs the CSV file to `/api/admin/products/bulk-upload` via `multipart/form-data`.

---

## 6. Admin Products List — Add "Bulk Upload" Button

In existing `src/app/admin/products/page.tsx`:
- Add a `<Link href="/admin/products/bulk-upload">` button next to "Add Product" labeled **"Bulk Upload"**

---

## 7. Enhance Public Shop Pages

**`src/app/shop/ShopContent.tsx`:**
- Update the Prisma query to include new fields: `gender`, `season`, `isActive`, `stockStatus`, `sizesAvailable`, `impressionOf`, `tags`, `price3mlPhysical` (and other price fields)
- Pass new fields through product interface mapping to ProductCard

**`src/app/shop/[slug]/page.tsx` (Product Detail):**
- Fetch and display:
  - Price range — show "From ₨250" (lowest physical price)
  - Gender badge — Men/Women/Unisex pill
  - Season chip — season label if present
  - Size selector — buttons: 3ml, 6ml, 12ml, 50ml
  - Channel selector — Physical / Online toggle
  - Displayed price — changes based on selected size + channel
  - "Impression of [brand]" label if `impressionOf` is set
  - Tags — small clickable chips
  - Fragrance notes — 3 labelled sections: Top Notes / Heart Notes / Base Notes
  - Description — render `longDescription` with `\n\n` → paragraphs, `**text**` → bold
  - SEO — `<head>` with `metaTitle` and `metaDescription`

**`src/components/ProductCard.tsx`:**
- Add display for: gender badge, season chip, "From ₨250" price range, "Impression of X" label

---

## 8. Admin Products List Enhancement

Update `src/app/admin/products/page.tsx` table columns to show:
- Product ID | Name | Gender | Season | 50ml Physical Price | 50ml Online Price | Status | Actions
- Filters: gender dropdown, season dropdown, stock status dropdown
- Live search by name
- Actions: Edit (existing modal), Toggle Active, Delete

---

## 9. Server Actions Update (`src/app/admin/actions.ts`)

- `getAdminProducts()`: update select to include new fields (gender, season, isFeatured, isActive, stockStatus, etc.)
- `createProduct()`: accept and save new fields (gender, type, etc.)
- `updateProduct()`: pass new fields

---

## Summary of Changes (12 files)

| Action | File |
|--------|------|
| Modify | `prisma/schema.prisma` — add 24 new fields to Product |
| Create | `src/app/admin/products/bulk-upload/page.tsx` — upload UI |
| Create | `src/app/api/admin/products/bulk-upload/route.ts` — CSV ingest API |
| Create | `src/lib/csv-parser.ts` — parse + validate + transform logic |
| Modify | `src/app/admin/products/page.tsx` — add Bulk Upload button, richer table + filters |
| Modify | `src/app/admin/actions.ts` — update server actions for new fields |
| Modify | `src/app/shop/ShopContent.tsx` — fetch new fields, pass to ProductCard |
| Modify | `src/app/shop/[slug]/page.tsx` — show gender/season/tags/impression/notes/price-grid |
| Modify | `src/components/ProductCard.tsx` — gender badge, season chip, price range |
| Modify | `package.json` — add papaparse |
| Run | `npx prisma db push` — apply schema changes |
| Run | `npm run lint` — verify no regressions |
