# Per-Size Pricing Implementation Plan

## Overview
Allow each product to have different prices for 30ml, 50ml, and 100ml sizes. When a user selects a size on the product detail page, the price updates dynamically.

---

## Design Decision
- **3 fixed sizes**: 30ml, 50ml, 100ml (no custom sizes)
- **Storage**: JSON string field `sizePrices` on the Product model
- **Existing `price`/`originalPrice` fields**: kept as default/fallback values

---

## Step 1: Database Schema (`prisma/schema.prisma`)

Add to the `Product` model:

```prisma
+ sizePrices      String    @default("[]")
```

The field stores a JSON array:
```json
[
  {"size":"30ml","price":99,"originalPrice":129},
  {"size":"50ml","price":129,"originalPrice":159},
  {"size":"100ml","price":149,"originalPrice":179}
]
```

---

## Step 2: Migration (`prisma/apply-migration.ts`)

Add ALTER TABLE statement:
```sql
ALTER TABLE Product ADD COLUMN "sizePrices" TEXT NOT NULL DEFAULT '[]';
```

Also update existing products with default pricing:
```sql
UPDATE Product SET "sizePrices" = '[]' WHERE "sizePrices" IS NULL;
```

---

## Step 3: Update Seed Data (`src/data/products.ts`)

Add `sizePrices` to each of the 8 products with a consistent pricing pattern:

| Product | 30ml | 50ml | 100ml |
|---------|------|------|-------|
| Safari Midnight | $99 | $129 | $149 |
| Safari Rose | $79 | $109 | $129 |
| Safari Oud | $139 | $169 | $199 |
| Safari Citrus | $59 | $79 | $89 |
| Safari Vanilla | $79 | $99 | $119 |
| Safari Noir | $109 | $139 | $159 |
| Safari Bloom | $69 | $89 | $109 |
| Safari Sand | $89 | $119 | $139 |

Each also gets an `originalPrice` 15-20% higher.

---

## Step 4: Update Seed Script (`prisma/seed.ts`)

Pass `sizePrices: JSON.stringify(p.sizePrices)` in the product create/upsert.

---

## Step 5: Update API Route (`src/app/api/products/route.ts`)

Parse `sizePrices` from JSON string using the existing `parseJsonArray` function:
```ts
sizePrices: parseJsonArray(product.sizePrices),
```

---

## Step 6: Update Product Detail Page (`src/app/shop/[slug]/page.tsx`)

- Add `sizePrices` to the Product interface
- Use `useMemo` to derive current price from selected size:
```ts
const priceData = useMemo(() => {
  if (!product?.sizePrices) return null;
  return product.sizePrices.find((s: any) => s.size === selectedSize);
}, [selectedSize, product?.sizePrices]);

const displayPrice = priceData?.price ?? product?.price;
const displayOriginalPrice = priceData?.originalPrice ?? product?.originalPrice;
```
- Replace `product.price` / `product.originalPrice` references in the template with `displayPrice` / `displayOriginalPrice`
- Keep size buttons as-is (30ml, 50ml, 100ml)

---

## Step 7: Update Admin Products Page (`src/app/admin/products/page.tsx`)

Add per-size pricing inputs in the Add/Edit dialog:
- Section title: "Size Pricing"
- 3 rows (30ml, 50ml, 100ml), each with:
  - Price input (number, required)
  - Original Price input (number, optional)
- Initialize `formData.sizePrices` as an array of `{ size, price, originalPrice }`
- Pre-fill when editing an existing product
- Include `sizePrices` in the submit payload (JSON.stringify it)

---

## Step 8: Update Admin Server Actions (`src/app/admin/actions.ts`)

**`createProduct`**: Accept `sizePrices` field, stringify before saving:
```ts
sizePrices: JSON.stringify(data.sizePrices || []),
```

**`updateProduct`**: No change needed (already accepts Record<string, unknown>)

---

## Step 9: Cart & Shop Listing

**No changes needed.**
- `CartContext` already stores `price` and `size` per item — the correct price is passed at add-to-cart time from the product detail page (Step 6)
- Shop listing cards show `product.price` (default/starting price) — this is fine

---

## Step 10: Run Migration & Re-seed

```bash
npx tsx --env-file=.env prisma/apply-migration.ts
npx prisma generate
npm run db:seed
```

---

## Files Changed

| File | Change |
|------|--------|
| `prisma/schema.prisma` | +1 field: `sizePrices` |
| `prisma/apply-migration.ts` | ALTER TABLE + UPDATE |
| `prisma/seed.ts` | Include `sizePrices` in product upsert |
| `src/data/products.ts` | Add `sizePrices` to all 8 products |
| `src/app/api/products/route.ts` | Parse `sizePrices` JSON in response |
| `src/app/shop/[slug]/page.tsx` | Derive price from selected size |
| `src/app/admin/products/page.tsx` | Size pricing inputs in form |
| `src/app/admin/actions.ts` | Stringify `sizePrices` in createProduct |
