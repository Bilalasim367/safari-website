import { createClient } from '@libsql/client'

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

async function main() {
  console.log('Applying Bundle migration...')

  const sql = `
    CREATE TABLE IF NOT EXISTS "Bundle" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "description" TEXT,
        "price" REAL NOT NULL,
        "originalPrice" REAL,
        "image" TEXT,
        "save" TEXT,
        "size" TEXT,
        "inStock" INTEGER NOT NULL DEFAULT 1,
        "isActive" INTEGER NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "BundleItem" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "bundleId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY ("bundleId") REFERENCES "Bundle" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "Bundle_slug_key" ON "Bundle"("slug");
    CREATE INDEX IF NOT EXISTS "Bundle_isActive_idx" ON "Bundle"("isActive");
    CREATE UNIQUE INDEX IF NOT EXISTS "BundleItem_bundleId_productId_key" ON "BundleItem"("bundleId", "productId");
  `

  await turso.executeMultiple(sql)

  // Add sizePrices column to Product (idempotent)
  try {
    await turso.execute(`ALTER TABLE Product ADD COLUMN "sizePrices" TEXT NOT NULL DEFAULT '[]';`)
  } catch {
    // Column already exists - ignore
  }

  // Add tracking columns to Order (idempotent)
  const orderColumns = [
    `ALTER TABLE "Order" ADD COLUMN "trackingNumber" TEXT;`,
    `ALTER TABLE "Order" ADD COLUMN "shippedAt" DATETIME;`,
    `ALTER TABLE "Order" ADD COLUMN "estimatedDelivery" DATETIME;`,
  ]
  for (const colSql of orderColumns) {
    try { await turso.execute(colSql) } catch { /* column exists */ }
  }

  // Add bulk upload columns to Product (idempotent)
  const bulkColumns = [
    `ALTER TABLE "Product" ADD COLUMN "productId" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN "gender" TEXT NOT NULL DEFAULT 'Unisex';`,
    `ALTER TABLE "Product" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'Attar & Spray';`,
    `ALTER TABLE "Product" ADD COLUMN "season" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN "bestTime" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN "impressionOf" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN "shortDescription" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN "longDescription" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN "tags" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN "sizesAvailable" TEXT NOT NULL DEFAULT '3ml,6ml,12ml,50ml';`,
    `ALTER TABLE "Product" ADD COLUMN "price3mlPhysical" INTEGER;`,
    `ALTER TABLE "Product" ADD COLUMN "price6mlPhysical" INTEGER;`,
    `ALTER TABLE "Product" ADD COLUMN "price12mlPhysical" INTEGER;`,
    `ALTER TABLE "Product" ADD COLUMN "price50mlPhysical" INTEGER;`,
    `ALTER TABLE "Product" ADD COLUMN "price3mlOnline" INTEGER;`,
    `ALTER TABLE "Product" ADD COLUMN "price6mlOnline" INTEGER;`,
    `ALTER TABLE "Product" ADD COLUMN "price12mlOnline" INTEGER;`,
    `ALTER TABLE "Product" ADD COLUMN "price50mlOnline" INTEGER;`,
    `ALTER TABLE "Product" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'PKR';`,
    `ALTER TABLE "Product" ADD COLUMN "oilPricePer100g" INTEGER;`,
    `ALTER TABLE "Product" ADD COLUMN "supplier" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN "isFeatured" INTEGER NOT NULL DEFAULT 0;`,
    `ALTER TABLE "Product" ADD COLUMN "isActive" INTEGER NOT NULL DEFAULT 1;`,
    `ALTER TABLE "Product" ADD COLUMN "stockStatus" TEXT NOT NULL DEFAULT 'in_stock';`,
    `ALTER TABLE "Product" ADD COLUMN "imageFolder" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN "metaTitle" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN "metaDescription" TEXT;`,
    // Perfume-specific attributes (Step 1 - admin/PDP sync)
    `ALTER TABLE "Product" ADD COLUMN "concentration" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN "bottleStyle" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN "longevity" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN "sillage" TEXT;`,
    // Attar-specific attributes
    `ALTER TABLE "Product" ADD COLUMN "applicatorType" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN "origin" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN "ingredients" TEXT;`,
  ]
  for (const colSql of bulkColumns) {
    try { await turso.execute(colSql) } catch { /* column exists */ }
  }
  // Unique index for productId (idempotent)
  try {
    await turso.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "Product_productId_key" ON "Product"("productId");`)
  } catch { /* index exists */ }

  console.log('Migration applied successfully!')
}

main().catch((e) => {
  console.error('Migration failed:', e)
  process.exit(1)
})
