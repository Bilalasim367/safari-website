# Fix: `sizePrices` Update Error in Admin

> Date: 2026-05-15
> Status: Resolved

## Root Cause

`updateProduct` in `src/app/admin/actions.ts:88-103` accepts `data: Record<string, unknown>` and passes it directly to Prisma without transforming `sizePrices`.

`createProduct` correctly does `JSON.stringify(data.sizePrices || [])` on line 72, but `updateProduct` has no such transformation. The admin form sends `sizePrices` as an **array of objects**, which Prisma rejects because the schema defines it as `String`.

## Fix Applied

**File:** `src/app/admin/actions.ts`

Pre-process JSON-serialized fields (`sizePrices`, `images`, `notesTop`, `notesHeart`, `notesBase`) before passing to Prisma in `updateProduct`, mirroring the pattern in `createProduct`.

```ts
data: {
  ...data,
  sizePrices: data.sizePrices ? JSON.stringify(data.sizePrices) : undefined,
  images: data.images && typeof data.images !== 'string' ? JSON.stringify(data.images) : undefined,
  notesTop: data.notesTop && typeof data.notesTop !== 'string' ? JSON.stringify(data.notesTop) : undefined,
  notesHeart: data.notesHeart && typeof data.notesHeart !== 'string' ? JSON.stringify(data.notesHeart) : undefined,
  notesBase: data.notesBase && typeof data.notesBase !== 'string' ? JSON.stringify(data.notesBase) : undefined,
}
```
