# Plan: Convert Admin Product Modal → Full-Page Editor

## Current State
- Admin products (`/admin/products`) has an inline shadcn `Dialog` modal for add/edit
- The modal only exposes ~10 fields: name, slug, price, image, category, size, sizePrices, inStock, isBestseller, isNew
- The **Prisma schema** has 40+ fields, and the **product detail page** (`/shop/[slug]`) displays many that aren't editable

## Goal
Replace the modal with **dedicated full-page routes** for creation and editing, exposing **every field** from the Prisma `Product` model.

## New Files to Create
| File | Purpose |
|------|---------|
| `src/components/admin/ProductForm.tsx` | Shared form component with **7 tabs** |
| `src/app/admin/products/new/page.tsx` | Create page — renders `<ProductForm mode="create" />` |
| `src/app/admin/products/[id]/edit/page.tsx` | Edit page — fetches product, renders `<ProductForm mode="edit" />` |

## Files to Modify
| File | Changes |
|------|---------|
| `src/app/admin/actions.ts` | Add `getProductById(id)`, expand `createProduct` & `updateProduct` to accept all 40+ fields |
| `src/app/admin/products/page.tsx` | Remove Dialog (~200 lines), link to new pages, keep table/filters/delete/toggle |

## 7 Tabs in `ProductForm.tsx`

1. **Basic Info** — name, auto-slug from name, productId, categorySlug, gender, type, season, bestTime, impressionOf
2. **Pricing & Sizes** — price, originalPrice, currency, sizePrices grid (30/50/100ml with price & originalPrice), sizesAvailable (CSV), 3ml/6ml/12ml/50ml physical & online prices, oilPricePer100g, supplier
3. **Media** — main image upload with preview, gallery images (multi-upload, drag-to-reorder, remove), imageFolder
4. **Description** — description (short), longDescription (rich text with **bold** support), tags (CSV)
5. **Fragrance Notes** — notesTop, notesHeart, notesBase (each as tag/chip input)
6. **Status & Flags** — isActive, isFeatured, isNew, isBestseller, inStock, stockStatus, rating, reviewCount
7. **SEO** — metaTitle, metaDescription

## Data Flow
- **Create**: `ProductForm` collects all data → calls `createProduct(payload)` server action → redirects to `/admin/products`
- **Edit**: Page calls `getProductById(id)` on mount → populates `ProductForm` → calls `updateProduct(id, payload)` on submit
