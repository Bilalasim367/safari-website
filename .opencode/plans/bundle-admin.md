# Bundle Admin Panel Implementation Plan

## Overview
Add complete bundle management to the admin panel with CRUD operations, and display bundles dynamically on customer-facing pages.

---

## 1. Database Schema (`prisma/schema.prisma`)

### Add to Product model:
```prisma
  bundleItems BundleItem[]
```

### New models:
```prisma
model Bundle {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  description   String?
  price         Float
  originalPrice Float?
  image         String?
  save          String?
  size          String?
  inStock       Boolean  @default(true)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  items BundleItem[]
  @@index([isActive])
}

model BundleItem {
  id        String   @id @default(cuid())
  bundleId  String
  bundle    Bundle   @relation(fields: [bundleId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Int      @default(1)
  @@unique([bundleId, productId])
}
```

---

## 2. Schema Migration (Turso)
- Generate SQL via `prisma migrate diff --from-empty --to-schema-datamodel`
- Apply via `@libsql/client` (same pattern as previous migration)

---

## 3. Seed Bundles
Script to insert the 4 existing hardcoded bundles from `HomePage.tsx`:
- Signature Trio ($199, 3x30ml, save 28%)
- Couple Set ($249, 2x50ml, save 29%)
- Luxury Collection ($399, 5x50ml, save 33%)
- Travel Essentials ($129, 4x10ml, save 28%)

---

## 4. Admin Server Actions (`src/app/admin/actions.ts`)
### Functions to add:
- `getAdminBundles()` — list all bundles with product items
- `createBundle(data)` — create bundle + assign products
- `updateBundle(id, data)` — update bundle fields + items
- `deleteBundle(id)` — delete bundle

---

## 5. Admin Page (`src/app/admin/bundles/page.tsx`)
- Client component similar to admin/products layout
- Table: Image thumbnail, Name, Price, Status (active/inactive), Actions (Edit/Delete)
- Add/Edit Dialog:
  - Name, slug, description, price, originalPrice
  - Image upload (reuse `/api/upload` + preview — same pattern as products)
  - Save badge text, size info
  - InStock / IsActive checkboxes
  - Product assignment multi-select with quantity
- Delete confirmation

---

## 6. Admin Sidebar (`src/components/admin/AdminSidebar.tsx`)
- Add nav item: Bundles (icon: Gift or Package) between Products and Orders

---

## 7. HomePage (`src/components/HomePage.tsx`)
- Replace static hardcoded bundle data with server-side fetch from Prisma
- Display bundle image (fallback to placeholder)
- Link to `/bundles` instead of `/shop?filter=bundles`

---

## 8. Customer Bundles Page (`src/app/bundles/page.tsx`)
- Fetch all active bundles from DB
- Grid of bundle cards
- Server component

---

## 9. Customer Bundle Detail (`src/app/bundles/[slug]/page.tsx`)
- Bundle info, image, included products with quantities
- Add to Cart button

---

## 10. Nav/Footer Updates
- `Header.tsx`: `/shop?filter=bundles` -> `/bundles`
- `Footer.tsx`: Same change
- `ShopContent.tsx`: Remove stale `filter=bundles` handling
