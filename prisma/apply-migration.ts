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
    `ALTER TABLE "Product" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'Attar';`,
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
    // New flags for homepage sections
    `ALTER TABLE "Product" ADD COLUMN "isHotSelling" INTEGER NOT NULL DEFAULT 0;`,
    `ALTER TABLE "Product" ADD COLUMN "isTrending" INTEGER NOT NULL DEFAULT 0;`,
    // Perfume-specific attributes (Step 1 - admin/PDP sync)
    `ALTER TABLE "Product" ADD COLUMN "concentration" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN "bottleStyle" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN "longevity" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN "sillage" TEXT;`,
    // Attar-specific attributes
    `ALTER TABLE "Product" ADD COLUMN "applicatorType" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN "origin" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN "ingredients" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN "price3mlPhysical" INTEGER;`,
    `ALTER TABLE "Product" ADD COLUMN "price6mlPhysical" INTEGER;`,
    `ALTER TABLE "Product" ADD COLUMN "price12mlPhysical" INTEGER;`,
    `ALTER TABLE "Product" ADD COLUMN "price50mlPhysical" INTEGER;`,
    `ALTER TABLE "Product" ADD COLUMN "price3mlOnline" INTEGER;`,
    `ALTER TABLE "Product" ADD COLUMN "price6mlOnline" INTEGER;`,
    `ALTER TABLE "Product" ADD COLUMN "price12mlOnline" INTEGER;`,
    `ALTER TABLE "Product" ADD COLUMN "price50mlOnline" INTEGER;`,
  ]
  for (const colSql of bulkColumns) {
    try { await turso.execute(colSql) } catch { /* column exists */ }
  }
  // Unique index for productId (idempotent)
  try {
    await turso.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "Product_productId_key" ON "Product"("productId");`)
  } catch { /* index exists */ }

  // Index for categorySlug + isActive filtering (category pages, shop filters)
  try {
    await turso.execute(`CREATE INDEX IF NOT EXISTS "Product_categorySlug_isActive_idx" ON "Product"("categorySlug", "isActive");`)
  } catch { /* index exists */ }

  // Data normalization (idempotent) - align legacy values with the app standard:
  // gender: Men/Women/Unisex | type: Attar/Perfume | categorySlug derived from gender
  console.log('Normalizing legacy product values...')
  const normalizeSql = [
    `UPDATE "Product" SET "type" = 'Perfume' WHERE LOWER("type") LIKE '%perfume%' OR LOWER("type") LIKE '%edp%' OR LOWER("type") LIKE '%eau%';`,
    `UPDATE "Product" SET "type" = 'Attar' WHERE "type" NOT IN ('Attar', 'Perfume');`,
    `UPDATE "Product" SET "gender" = 'Men' WHERE LOWER("gender") = 'men';`,
    `UPDATE "Product" SET "gender" = 'Women' WHERE LOWER("gender") = 'women';`,
    `UPDATE "Product" SET "gender" = 'Unisex' WHERE "gender" IS NULL OR "gender" = '' OR LOWER("gender") = 'unisex';`,
    `UPDATE "Product" SET "categorySlug" = 'men' WHERE "gender" = 'Men';`,
    `UPDATE "Product" SET "categorySlug" = 'women' WHERE "gender" = 'Women';`,
    `UPDATE "Product" SET "categorySlug" = 'unisex' WHERE "gender" = 'Unisex';`,
  ]
  for (const sql of normalizeSql) {
    try { await turso.execute(sql) } catch (e) { console.error('Normalization statement failed:', sql, e) }
  }

  // Ensure a Settings row exists (checkout reads taxRate/shippingFee/freeShippingThreshold from here)
  try {
    await turso.execute(`
      INSERT OR IGNORE INTO "Settings" ("id", "storeName", "currency", "timezone", "taxRate", "shippingFee", "freeShippingThreshold", "emailNotifications", "orderEmails", "marketingEmails", "updatedAt")
      VALUES ('settings-default', 'Safari Perfumes', 'PKR', 'Asia/Karachi', 0, 0, 0, 1, 1, 0, CURRENT_TIMESTAMP);
    `)
    console.log('Settings row ensured (default).')
  } catch (e) {
    console.error('Failed to ensure Settings row:', e)
  }

  console.log('Migration applied successfully!')
}

main().catch((e) => {
  console.error('Migration failed:', e)
  process.exit(1)
})
